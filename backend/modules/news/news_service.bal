// News Service Module
// Provides news fetching and email functionality

import ballerina/http;
import ballerina/log;
import ballerinax/newsapi;
import ballerina/email;
import Cyclesync.database as database;

// News API configuration
configurable string apiKey = ?;

// Email client configuration parameters
configurable string smtpPassword = ?;
configurable string smtpUsername = ?;
configurable string smtpHost = ?;

// Email configuration parameters
configurable string fromAddress = ?;
configurable string emailAddress = ?;

// News service listener
listener http:Listener newsListener = new(8085);

// News API service
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "https://cyclesync.com"],
        allowCredentials: true,
        allowHeaders: ["Authorization", "Content-Type"]
    }
}
service /api/news on newsListener {

    private final newsapi:Client newsClient;
    private final email:SmtpClient emailClient;

    function init() returns error? {
        // Initialize NewsAPI client
        newsapi:ApiKeysConfig config = { apiKey: apiKey };
        self.newsClient = check new (config, {}, "https://newsapi.org/v2");

        // Initialize email client
        self.emailClient = check new (smtpHost, smtpUsername, smtpPassword);

        log:printInfo("News service initialized successfully");
    }

    // Get news headlines
    resource function get headlines() returns json|http:InternalServerError {
        do {
            // Get top business headlines
            newsapi:WSNewsTopHeadlineResponse topHeadlines = check self.newsClient->listTopHeadlines(
                category = "business",
                page = 1,
                country = "us"
            );

            newsapi:WSNewsArticle[]? articles = topHeadlines?.articles;

            if (articles is () || articles.length() == 0) {
                return {
                    "message": "No news available",
                    "articles": []
                };
            }

            // Format articles for response
            json[] newsList = [];
            foreach newsapi:WSNewsArticle article in articles {
                string? title = article?.title;
                string? description = article?.description;
                string? url = article?.url;
                string? publishedAt = article?.publishedAt;

                if (title is string) {
                    newsList.push({
                        "title": title,
                        "description": description ?: "",
                        "url": url ?: "",
                        "publishedAt": publishedAt ?: ""
                    });
                }
            }

            return {
                "message": "News headlines retrieved successfully",
                "count": newsList.length(),
                "articles": newsList
            };

        } on fail error e {
            log:printError("Failed to fetch news headlines", e);
            http:InternalServerError errorResponse = {
                body: {
                    "error": "Failed to fetch news headlines",
                    "message": e.message()
                }
            };
            return errorResponse;
        }
    }

    // Subscribe to newsletter
    resource function post subscribe(@http:Payload json payload) returns json|http:BadRequest {
        do {
            // Extract and validate email
            string email;
            if payload is map<json> && payload.hasKey("email") && payload["email"] is string {
                email = <string>payload["email"];
            } else {
                http:BadRequest badRequest = {
                    body: {"error": "Email is required and must be a string"}
                };
                return badRequest;
            }

            // Extract optional name
            string? name = ();
            if payload is map<json> && payload.hasKey("name") && payload["name"] is string {
                name = <string?>payload["name"];
            }

            // Add subscriber to database
            var result = check database:addNewsletterSubscriber(email, name);
            
            // Send confirmation email
            do {
                check self.sendSubscriptionConfirmationEmail(email, name);
                log:printInfo("Confirmation email sent to: " + email);
            } on fail error emailError {
                log:printError("Failed to send confirmation email to " + email, emailError);
                // Don't fail the subscription if email fails, just log the error
            }
            
            return result;

        } on fail error e {
            log:printError("Failed to subscribe user", e);
            http:BadRequest badRequest = {
                body: {
                    "error": "Failed to subscribe",
                    "message": e.message()
                }
            };
            return badRequest;
        }
    }

    // Send newsletter to all subscribers
    resource function post sendNewsletter() returns json|http:InternalServerError {
        do {
            // Get all active subscribers
            database:NewsletterSubscriber[] subscribers = check database:getActiveSubscribers();

            if (subscribers.length() == 0) {
                return {
                    "message": "No active subscribers found",
                    "sent_count": 0
                };
            }

            // Get latest business news
            newsapi:WSNewsTopHeadlineResponse topHeadlines = check self.newsClient->listTopHeadlines(
                category = "business",
                page = 1,
                country = "us"
            );
            newsapi:WSNewsArticle[]? articles = topHeadlines?.articles;

            if (articles is () || articles.length() == 0) {
                return {
                    "message": "No news available to send",
                    "sent_count": 0
                };
            }

            // Format newsletter content
            string newsletterContent = "=== CircularSync Business News Newsletter ===\n\n";
            int articleCount = 0;

            foreach newsapi:WSNewsArticle article in articles {
                string? title = article?.title;
                string? description = article?.description;
                string? url = article?.url;

                if (title is string && articleCount < 5) { // Limit to 5 articles
                    newsletterContent += string `${articleCount + 1}. ${title}\n`;
                    if (description is string) {
                        newsletterContent += string `   ${description}\n`;
                    }
                    if (url is string) {
                        newsletterContent += string `   Read more: ${url}\n`;
                    }
                    newsletterContent += "\n";
                    articleCount += 1;
                }
            }

            // Send newsletter to each subscriber
            int sentCount = 0;
            string[] sentIds = [];

            foreach database:NewsletterSubscriber subscriber in subscribers {
                email:Message emailMessage = {
                    to: subscriber.email,
                    subject: "CircularSync Business News Update",
                    'from: fromAddress,
                    body: newsletterContent + "\n\nTo unsubscribe, visit: http://localhost:8085/api/news/unsubscribe/" + (subscriber.unsubscribe_token ?: "")
                };

                email:Error? sendResult = self.emailClient->sendMessage(emailMessage);

                if (sendResult is ()) {
                    sentCount += 1;
                    sentIds.push(subscriber.id.toString());
                    log:printInfo(string `Newsletter sent to ${subscriber.email}`);
                } else {
                    log:printError(string `Failed to send newsletter to ${subscriber.email}`, sendResult);
                }
            }

            // Update last sent timestamp for successful sends
            if (sentIds.length() > 0) {
                var updateResult = check database:updateLastSentTimestamp(sentIds);
                log:printInfo("Updated last sent timestamps for " + sentIds.length().toString() + " subscribers");
            }

            return {
                "message": "Newsletter sending completed",
                "total_subscribers": subscribers.length(),
                "sent_count": sentCount,
                "failed_count": subscribers.length() - sentCount
            };

        } on fail error e {
            log:printError("Failed to send newsletter", e);
            http:InternalServerError errorResponse = {
                body: {
                    "error": "Failed to send newsletter",
                    "message": e.message()
                }
            };
            return errorResponse;
        }
    }

    // Unsubscribe from newsletter
    resource function post unsubscribe/[string token]() returns json|http:BadRequest {
        do {
            var result = check database:unsubscribeByToken(token);
            
            // Send unsubscribe confirmation email
            if (result is map<json> && result.hasKey("email")) {
                string email = <string>result["email"];
                do {
                    check self.sendUnsubscribeConfirmationEmail(email);
                    log:printInfo("Unsubscribe confirmation email sent to: " + email);
                } on fail error emailError {
                    log:printError("Failed to send unsubscribe confirmation email to " + email, emailError);
                }
            }
            
            return result;
        } on fail error e {
            log:printError("Failed to unsubscribe user", e);
            http:BadRequest badRequest = {
                body: {
                    "error": "Failed to unsubscribe",
                    "message": e.message()
                }
            };
            return badRequest;
        }
    }

    // Get subscriber count
    resource function get subscriberCount() returns json|http:InternalServerError {
        do {
            database:NewsletterSubscriber[] subscribers = check database:getActiveSubscribers();
            return {
                "total_subscribers": subscribers.length(),
                "message": "Subscriber count retrieved successfully"
            };
        } on fail error e {
            log:printError("Failed to get subscriber count", e);
            http:InternalServerError errorResponse = {
                body: {
                    "error": "Failed to get subscriber count",
                    "message": e.message()
                }
            };
            return errorResponse;
        }
    }

    // Send subscription confirmation email
    private function sendSubscriptionConfirmationEmail(string email, string? name) returns error? {
        string recipientName = name ?: "Subscriber";
        
        // Create email content
        string subject = "Welcome to CycleSync Newsletter!";
        string htmlBody = string `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Welcome to CycleSync</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .footer { background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px; }
                    .button { background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to CycleSync!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${recipientName},</h2>
                        <p>Thank you for subscribing to the CycleSync newsletter! You're now part of our community focused on sustainable waste management and circular economy solutions.</p>
                        
                        <p>What you can expect from our newsletter:</p>
                        <ul>
                            <li>Latest updates on waste management technologies</li>
                            <li>Market insights and pricing trends</li>
                            <li>Sustainability tips and best practices</li>
                            <li>Industry news and regulatory updates</li>
                            <li>Exclusive offers and early access to new features</li>
                        </ul>
                        
                        <p>Stay connected with us as we work towards a more sustainable future!</p>
                        
                        <a href="https://cyclesync.com" class="button">Visit Our Website</a>
                        
                        <p>If you have any questions, feel free to reply to this email.</p>
                        
                        <p>Best regards,<br>The CycleSync Team</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 CycleSync. All rights reserved.</p>
                        <p>You received this email because you subscribed to our newsletter.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Create email message
        email:Message emailMessage = {
            to: email,
            subject: subject,
            'from: fromAddress,
            htmlBody: htmlBody
        };

        // Send email
        check self.emailClient->sendMessage(emailMessage);
    }

    // Send unsubscribe confirmation email
    private function sendUnsubscribeConfirmationEmail(string email) returns error? {
        // Create email content
        string subject = "You've been unsubscribed from CycleSync Newsletter";
        string htmlBody = string `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Unsubscribed from CycleSync</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .footer { background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px; }
                    .button { background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Unsubscribed from CycleSync</h1>
                    </div>
                    <div class="content">
                        <h2>We're sorry to see you go!</h2>
                        <p>You have been successfully unsubscribed from the CycleSync newsletter.</p>
                        
                        <p>If you unsubscribed by mistake or would like to resubscribe in the future, you can always sign up again on our website.</p>
                        
                        <p>We appreciate your interest in sustainable waste management and hope to see you again soon!</p>
                        
                        <a href="https://cyclesync.com" class="button">Visit Our Website</a>
                        
                        <p>If you have any feedback about our newsletter or service, feel free to reply to this email.</p>
                        
                        <p>Best regards,<br>The CycleSync Team</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 CycleSync. All rights reserved.</p>
                        <p>You received this email because you unsubscribed from our newsletter.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Create email message
        email:Message emailMessage = {
            to: email,
            subject: subject,
            'from: fromAddress,
            htmlBody: htmlBody
        };

        // Send email
        check self.emailClient->sendMessage(emailMessage);
    }
}
