// Google Calendar API Controller
// Provides HTTP endpoints for calendar operations

import ballerina/http;
import ballerina/log;
import ballerina/time;
import ballerina/lang.'int;

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
        allowCredentials: false,
        allowHeaders: ["Content-Type", "Authorization", "Accept"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        maxAge: 84900
    }
}
service /api/calendar on new http:Listener(8100) {

    // Initialize calendar service
    resource function post init() returns http:Response {
        http:Response response = new;

        do {
            check init();

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "message": "Calendar service initialized successfully"
            });
        } on fail error e {
            log:printError("Failed to initialize calendar", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to initialize calendar",
                "message": e.message()
            });
        }

        return response;
    }

    // ==================== EVENT ENDPOINTS ====================

    // Create event
    resource function post event(@http:Payload json payload) returns http:Response {
        http:Response response = new;

        do {
            string summary = check payload.summary;
            string description = check payload.description;
            string startTimeStr = check payload.startTime;
            string endTimeStr = check payload.endTime;
            json locationJson = check payload.location;
            string? location = locationJson is string ? locationJson : ();

            // Parse times
            time:Civil startTime = check parseDateTime(startTimeStr);
            time:Civil endTime = check parseDateTime(endTimeStr);

            // Create event
            string eventId = check createEvent(
                summary,
                description,
                startTime,
                endTime,
                location
            );

            response.statusCode = 201;
            response.setJsonPayload({
                "status": "success",
                "message": "Event created successfully",
                "eventId": eventId
            });
        } on fail error e {
            log:printError("Failed to create event", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to create event",
                "message": e.message()
            });
        }

        return response;
    }

    // ==================== TASK ENDPOINTS ====================

    // Create task
    resource function post task(@http:Payload json payload) returns http:Response {
        http:Response response = new;

        do {
            string summary = check payload.summary;
            string description = check payload.description;
            string dueDate = check payload.dueDate;
            json locationJson = check payload.location;
            string? location = locationJson is string ? locationJson : ();

            // Parse due date
            time:Civil dueTime = check parseDateTime(dueDate);

            // Create task
            string taskId = check createTask(
                summary,
                description,
                dueTime,
                location
            );

            response.statusCode = 201;
            response.setJsonPayload({
                "status": "success",
                "message": "Task created successfully",
                "taskId": taskId
            });
        } on fail error e {
            log:printError("Failed to create task", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to create task",
                "message": e.message()
            });
        }

        return response;
    }

    // ==================== APPOINTMENT ENDPOINTS ====================

    // Create appointment
    resource function post appointment(@http:Payload json payload) returns http:Response {
        http:Response response = new;

        do {
            string summary = check payload.summary;
            string description = check payload.description;
            string startTimeStr = check payload.startTime;
            string endTimeStr = check payload.endTime;
            string location = check payload.location;
            json attendeesJson = check payload.attendees;

            // Parse attendees
            string[] attendees = [];
            if attendeesJson is json[] {
                foreach json item in attendeesJson {
                    string email = check item.toString();
                    attendees.push(email);
                }
            }

            // Parse times
            time:Civil startTime = check parseDateTime(startTimeStr);
            time:Civil endTime = check parseDateTime(endTimeStr);

            // Create appointment
            string appointmentId = check createAppointment(
                summary,
                description,
                startTime,
                endTime,
                location,
                attendees
            );

            response.statusCode = 201;
            response.setJsonPayload({
                "status": "success",
                "message": "Appointment created successfully",
                "appointmentId": appointmentId
            });
        } on fail error e {
            log:printError("Failed to create appointment", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to create appointment",
                "message": e.message()
            });
        }

        return response;
    }

    // ==================== UPDATE ENDPOINT ====================

    // Update calendar item
    resource function put item/[string itemId](@http:Payload json payload) returns http:Response {
        http:Response response = new;

        do {
            json summaryJson = check payload.summary;
            json descriptionJson = check payload.description;
            json startTimeJson = check payload.startTime;
            json endTimeJson = check payload.endTime;

            string? summary = summaryJson is string ? summaryJson : ();
            string? description = descriptionJson is string ? descriptionJson : ();
            string? startTimeStr = startTimeJson is string ? startTimeJson : ();
            string? endTimeStr = endTimeJson is string ? endTimeJson : ();

            time:Civil? startTime = startTimeStr is string ? check parseDateTime(startTimeStr) : ();
            time:Civil? endTime = endTimeStr is string ? check parseDateTime(endTimeStr) : ();

            check updateCalendarItem(itemId, summary, description, startTime, endTime);

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "message": "Calendar item updated successfully"
            });
        } on fail error e {
            log:printError("Failed to update calendar item", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to update calendar item",
                "message": e.message()
            });
        }

        return response;
    }

    // ==================== DELETE ENDPOINT ====================

    // Delete calendar item
    resource function delete item/[string itemId]() returns http:Response {
        http:Response response = new;

        do {
            check deleteCalendarItem(itemId);

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "message": "Calendar item deleted successfully"
            });
        } on fail error e {
            log:printError("Failed to delete calendar item", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to delete calendar item",
                "message": e.message()
            });
        }

        return response;
    }

    // ==================== QUERY ENDPOINT ====================

    // Get upcoming items
    resource function get upcoming(int maxResults = 20) returns http:Response {
        http:Response response = new;

        do {
            json items = check getUpcomingItems(maxResults);

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "data": items
            });
        } on fail error e {
            log:printError("Failed to get upcoming items", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to get upcoming items",
                "message": e.message()
            });
        }

        return response;
    }
}

// ==================== HELPER FUNCTIONS ====================

// Parse datetime string to time:Civil
function parseDateTime(string dateTimeStr) returns time:Civil|error {
    // Expected format: "2024-10-05T10:30:00"
    string[] parts = re `T`.split(dateTimeStr);

    if parts.length() != 2 {
        return error("Invalid datetime format. Expected: YYYY-MM-DDTHH:MM:SS");
    }

    string[] dateParts = re `-`.split(parts[0]);
    string[] timeParts = re `:`.split(parts[1]);

    if dateParts.length() != 3 || timeParts.length() < 2 {
        return error("Invalid datetime components");
    }

    time:Civil civil = {
        year: check 'int:fromString(dateParts[0]),
        month: check 'int:fromString(dateParts[1]),
        day: check 'int:fromString(dateParts[2]),
        hour: check 'int:fromString(timeParts[0]),
        minute: check 'int:fromString(timeParts[1]),
        second: timeParts.length() > 2 ? (<decimal>check 'int:fromString(timeParts[2])) : 0.0d
    };

    return civil;
}
