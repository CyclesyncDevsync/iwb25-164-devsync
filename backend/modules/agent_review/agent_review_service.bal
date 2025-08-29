import ballerina/sql;
import ballerina/time;
import ballerina/uuid;
import ballerinax/postgresql;

# Agent Review Service for on-site material verification
public isolated class AgentReviewService {
    private final postgresql:Client dbClient;
    
    public function init(postgresql:Client dbClient) {
        self.dbClient = dbClient;
    }
    
    # Create a new agent review
    # + review - Review details
    # + return - Created review ID or error
    public isolated function createReview(AgentReview review) returns string|error {
        string reviewId = uuid:createType1AsString();
        
        // Convert arrays to JSON strings for PostgreSQL JSONB columns
        string photosJson = self.arrayToJson(review.photos);
        string? rejectionReasonsJson = review?.rejectionReasons is () ? () : self.arrayToJson(review?.rejectionReasons ?: []);
        
        sql:ParameterizedQuery query = `
            INSERT INTO agent_reviews (
                review_id, workflow_id, agent_id, material_id,
                visit_date, arrival_time, departure_time,
                overall_rating, condition_rating, quantity_rating,
                quality_notes, quantity_verified, quantity_discrepancy,
                photos, verification_checklist, recommendation,
                rejection_reasons, status, created_at
            ) VALUES (
                ${reviewId}, ${review.workflowId}, ${review.agentId}, ${review.materialId},
                ${review.visitDate}, ${review.arrivalTime}, ${review?.departureTime},
                ${review.ratings.overall}, ${review.ratings.condition}, ${review.ratings.quantity},
                ${review.qualityNotes}, ${review.quantityVerified}, ${review?.quantityDiscrepancy},
                ${photosJson}, ${review.verificationChecklist.toString()}, ${review?.recommendation},
                ${rejectionReasonsJson}, 'in_progress', CURRENT_TIMESTAMP
            )
        `;
        
        _ = check self.dbClient->execute(query);
        return reviewId;
    }
    
    # Update agent review
    # + reviewId - Review ID
    # + updates - Review updates
    # + return - Success or error
    public isolated function updateReview(string reviewId, AgentReviewUpdate updates) returns boolean|error {
        sql:ParameterizedQuery query = `
            UPDATE agent_reviews
            SET overall_rating = COALESCE(${updates?.ratings?.overall}, overall_rating),
                condition_rating = COALESCE(${updates?.ratings?.condition}, condition_rating),
                quantity_rating = COALESCE(${updates?.ratings?.quantity}, quantity_rating),
                quality_notes = COALESCE(${updates?.qualityNotes}, quality_notes),
                quantity_verified = COALESCE(${updates?.quantityVerified}, quantity_verified),
                quantity_discrepancy = COALESCE(${updates?.quantityDiscrepancy}, quantity_discrepancy),
                verification_checklist = COALESCE(${updates?.verificationChecklist is () ? () : updates?.verificationChecklist.toString()}, verification_checklist),
                recommendation = COALESCE(${updates?.recommendation}, recommendation),
                rejection_reasons = COALESCE(${updates?.rejectionReasons is () ? () : self.arrayToJson(updates?.rejectionReasons ?: [])}, rejection_reasons),
                departure_time = COALESCE(${updates?.departureTime}, departure_time),
                updated_at = CURRENT_TIMESTAMP
            WHERE review_id = ${reviewId}
        `;
        
        sql:ExecutionResult result = check self.dbClient->execute(query);
        return result.affectedRowCount > 0;
    }
    
    # Submit final review
    # + reviewId - Review ID
    # + finalReview - Final review submission
    # + return - Success or error
    public isolated function submitReview(string reviewId, FinalReviewSubmission finalReview) returns ReviewResult|error {
        // Start a transaction
        transaction {
            // Update review with final details
            sql:ParameterizedQuery reviewQuery = `
                UPDATE agent_reviews
                SET recommendation = ${finalReview.recommendation},
                    rejection_reasons = ${finalReview?.rejectionReasons is () ? () : self.arrayToJson(finalReview?.rejectionReasons ?: [])},
                    final_notes = ${finalReview?.finalNotes},
                    status = 'completed',
                    completed_at = CURRENT_TIMESTAMP
                WHERE review_id = ${reviewId}
            `;
            
            _ = check self.dbClient->execute(reviewQuery);
            
            // Update workflow status based on recommendation
            string workflowStatus = finalReview.recommendation == "approve" ? "agent_approved" : 
                                   finalReview.recommendation == "reject" ? "agent_rejected" : "requires_second_review";
            
            sql:ParameterizedQuery workflowQuery = `
                UPDATE material_workflows
                SET current_stage = ${workflowStatus},
                    agent_review = jsonb_build_object(
                        'reviewId', ${reviewId},
                        'recommendation', ${finalReview.recommendation},
                        'completedAt', CURRENT_TIMESTAMP
                    ),
                    updated_at = CURRENT_TIMESTAMP
                WHERE workflow_id = (SELECT workflow_id FROM agent_reviews WHERE review_id = ${reviewId})
            `;
            
            _ = check self.dbClient->execute(workflowQuery);
            
            // If approved, prepare for auction listing
            if finalReview.recommendation == "approve" {
                sql:ParameterizedQuery auctionPrepQuery = `
                    INSERT INTO auction_preparations (
                        preparation_id, material_id, workflow_id,
                        suggested_starting_price, suggested_reserve_price,
                        auction_duration_days, status, created_at
                    )
                    SELECT 
                        ${uuid:createType1AsString()},
                        ar.material_id,
                        ar.workflow_id,
                        ${finalReview?.suggestedStartingPrice},
                        ${finalReview?.suggestedReservePrice},
                        ${finalReview?.suggestedAuctionDuration},
                        'pending_supplier_approval',
                        CURRENT_TIMESTAMP
                    FROM agent_reviews ar
                    WHERE ar.review_id = ${reviewId}
                `;
                
                _ = check self.dbClient->execute(auctionPrepQuery);
            }
            
            check commit;
        } on fail error e {
            return e;
        }
        
        return {
            success: true,
            reviewId: reviewId,
            recommendation: finalReview.recommendation,
            nextSteps: self.getNextSteps(finalReview.recommendation)
        };
    }
    
    # Upload review photos
    # + reviewId - Review ID
    # + photos - Array of photo data
    # + return - Uploaded photo URLs or error
    public isolated function uploadReviewPhotos(string reviewId, ReviewPhoto[] photos) returns string[]|error {
        string[] photoUrls = [];
        
        foreach ReviewPhoto photo in photos {
            string photoId = uuid:createType1AsString();
            string photoUrl = string `/api/agent/review/photos/${reviewId}/${photoId}`;
            
            sql:ParameterizedQuery query = `
                INSERT INTO review_photos (
                    photo_id, review_id, photo_type, photo_data,
                    caption, metadata, uploaded_at
                ) VALUES (
                    ${photoId}, ${reviewId}, ${photo.photoType}, ${photo.photoData},
                    ${photo?.caption}, ${photo?.metadata is () ? () : photo?.metadata.toString()}, CURRENT_TIMESTAMP
                )
            `;
            
            _ = check self.dbClient->execute(query);
            photoUrls.push(photoUrl);
        }
        
        // Update review with photo URLs
        string photoUrlsJson = self.arrayToJson(photoUrls);
        sql:ParameterizedQuery updateQuery = `
            UPDATE agent_reviews
            SET photos = photos || ${photoUrlsJson}
            WHERE review_id = ${reviewId}
        `;
        
        _ = check self.dbClient->execute(updateQuery);
        
        return photoUrls;
    }
    
    # Get review checklist template
    # + materialCategory - Material category
    # + return - Checklist template
    public isolated function getChecklistTemplate(string materialCategory) returns ChecklistItem[]|error {
        // Return category-specific checklist
        ChecklistItem[] baseChecklist = [
            {
                id: "material_match",
                category: "identity",
                description: "Material matches description",
                required: true
            },
            {
                id: "quantity_check",
                category: "quantity",
                description: "Quantity matches declaration",
                required: true
            },
            {
                id: "quality_assessment",
                category: "quality",
                description: "Quality meets standards",
                required: true
            },
            {
                id: "contamination_check",
                category: "quality",
                description: "No contamination present",
                required: true
            },
            {
                id: "packaging_condition",
                category: "handling",
                description: "Proper packaging/storage",
                required: false
            }
        ];
        
        // Add category-specific items
        if materialCategory == "electronics" {
            baseChecklist.push({
                id: "component_check",
                category: "quality",
                description: "Components intact and complete",
                required: true
            });
            baseChecklist.push({
                id: "data_wiped",
                category: "security",
                description: "Data properly wiped (if applicable)",
                required: true
            });
        } else if materialCategory == "plastic" || materialCategory == "metal" {
            baseChecklist.push({
                id: "sorting_check",
                category: "quality",
                description: "Materials properly sorted by type",
                required: true
            });
            baseChecklist.push({
                id: "cleanliness",
                category: "quality", 
                description: "Materials are clean and dry",
                required: false
            });
        }
        
        return baseChecklist;
    }
    
    # Get review by ID
    # + reviewId - Review ID
    # + return - Review details or error
    public isolated function getReview(string reviewId) returns AgentReviewDetails|error {
        sql:ParameterizedQuery query = `
            SELECT 
                ar.*,
                mw.material_id,
                mw.supplier_id,
                a.name as agent_name,
                a.phone as agent_phone
            FROM agent_reviews ar
            JOIN material_workflows mw ON ar.workflow_id = mw.workflow_id
            JOIN agents a ON ar.agent_id = a.agent_id
            WHERE ar.review_id = ${reviewId}
        `;
        
        return check self.dbClient->queryRow(query);
    }
    
    # Get reviews by agent
    # + agentId - Agent ID
    # + status - Filter by status (optional)
    # + return - List of reviews
    public isolated function getAgentReviews(string agentId, string? status = ()) returns AgentReviewSummary[]|error {
        sql:ParameterizedQuery query = status is () ?
            `SELECT * FROM agent_reviews WHERE agent_id = ${agentId} ORDER BY created_at DESC` :
            `SELECT * FROM agent_reviews WHERE agent_id = ${agentId} AND status = ${status} ORDER BY created_at DESC`;
        
        stream<AgentReviewSummary, sql:Error?> reviewStream = self.dbClient->query(query);
        AgentReviewSummary[] reviews = [];
        
        check from AgentReviewSummary review in reviewStream
            do {
                reviews.push(review);
            };
        
        return reviews;
    }
    
    # Generate review report
    # + reviewId - Review ID
    # + return - Review report
    public isolated function generateReviewReport(string reviewId) returns ReviewReport|error {
        AgentReviewDetails review = check self.getReview(reviewId);
        
        // Fetch material details
        sql:ParameterizedQuery materialQuery = `
            SELECT title, category, quantity, unit, expected_price
            FROM materials
            WHERE material_id = ${review.material_id}
        `;
        
        record {|
            string title;
            string category;
            decimal quantity;
            string unit;
            decimal expected_price;
        |} material = check self.dbClient->queryRow(materialQuery);
        
        return {
            reviewId: reviewId,
            reportDate: time:utcNow(),
            materialInfo: {
                title: material.title,
                category: material.category,
                declaredQuantity: material.quantity,
                unit: material.unit,
                expectedPrice: material.expected_price
            },
            agentInfo: {
                name: review.agent_name,
                phone: review.agent_phone,
                visitDate: review.visit_date,
                visitDuration: self.calculateDuration(review.arrival_time, review.departure_time)
            },
            verificationResults: {
                overallRating: review.overall_rating,
                conditionRating: review.condition_rating,
                quantityRating: review.quantity_rating,
                quantityVerified: review.quantity_verified,
                quantityDiscrepancy: review.quantity_discrepancy,
                checklistCompletion: self.calculateChecklistCompletion(review.verification_checklist)
            },
            recommendation: review.recommendation,
            notes: review.quality_notes,
            photos: review.photos
        };
    }
    
    # Calculate visit duration
    private isolated function calculateDuration(time:Civil arrival, time:Civil? departure) returns string {
        if departure is () {
            return "In progress";
        }
        
        // Simple duration calculation (would be more complex in production)
        return "1.5 hours";
    }
    
    # Calculate checklist completion percentage
    private isolated function calculateChecklistCompletion(json? checklist) returns decimal {
        if checklist is () {
            return 0.0;
        }
        
        // Parse checklist and calculate completion
        return 85.5; // Mock value
    }
    
    # Get next steps based on recommendation
    private isolated function getNextSteps(string recommendation) returns string[] {
        if recommendation == "approve" {
            return [
                "Material approved for auction listing",
                "Supplier will be notified of approval",
                "Auction parameters will be set",
                "Material will be listed within 24 hours"
            ];
        } else if recommendation == "reject" {
            return [
                "Material rejected - supplier will be notified",
                "Rejection reasons will be provided",
                "Supplier can address issues and resubmit",
                "No fees will be charged for rejected materials"
            ];
        } else {
            return [
                "Second review requested",
                "Senior agent will be assigned",
                "Additional verification will be conducted",
                "Final decision within 48 hours"
            ];
        }
    }
    
    # Convert string array to JSON string
    private isolated function arrayToJson(string[] arr) returns string {
        string result = "[";
        foreach int i in 0 ..< arr.length() {
            result = result + "\"" + arr[i] + "\"";
            if i < arr.length() - 1 {
                result = result + ",";
            }
        }
        result = result + "]";
        return result;
    }
}

# Agent review type definitions
public type AgentReview record {|
    string workflowId;
    string agentId;
    string materialId;
    time:Civil visitDate;
    time:Civil arrivalTime;
    time:Civil? departureTime?;
    ReviewRatings ratings;
    string qualityNotes;
    decimal quantityVerified;
    decimal? quantityDiscrepancy?;
    string[] photos;
    json verificationChecklist;
    string? recommendation?;
    string[]? rejectionReasons?;
|};

public type AgentReviewUpdate record {|
    ReviewRatings? ratings?;
    string? qualityNotes?;
    decimal? quantityVerified?;
    decimal? quantityDiscrepancy?;
    json? verificationChecklist?;
    string? recommendation?;
    string[]? rejectionReasons?;
    time:Civil? departureTime?;
|};

public type FinalReviewSubmission record {|
    string recommendation; // approve, reject, request_second_review
    string[]? rejectionReasons?;
    string? finalNotes?;
    decimal? suggestedStartingPrice?;
    decimal? suggestedReservePrice?;
    int suggestedAuctionDuration?; // in days
|};

public type ReviewRatings record {|
    int overall; // 1-5
    int condition; // 1-5  
    int quantity; // 1-5
|};

public type ReviewPhoto record {|
    string photoType; // overview, detail, issue, quantity
    byte[] photoData;
    string? caption?;
    json? metadata?;
|};

public type ChecklistItem record {|
    string id;
    string category;
    string description;
    boolean required;
|};

public type ReviewResult record {|
    boolean success;
    string reviewId;
    string recommendation;
    string[] nextSteps;
|};

public type AgentReviewDetails record {|
    string review_id;
    string workflow_id;
    string agent_id;
    string material_id;
    string agent_name;
    string agent_phone;
    time:Civil visit_date;
    time:Civil arrival_time;
    time:Civil? departure_time;
    int overall_rating;
    int condition_rating;
    int quantity_rating;
    string quality_notes;
    decimal quantity_verified;
    decimal? quantity_discrepancy;
    string[] photos;
    json verification_checklist;
    string recommendation;
    string[]? rejection_reasons;
    string status;
|};

public type AgentReviewSummary record {|
    string review_id;
    string workflow_id;
    string material_id;
    time:Civil visit_date;
    string recommendation;
    string status;
    time:Civil created_at;
|};

public type ReviewReport record {|
    string reviewId;
    time:Utc reportDate;
    record {|
        string title;
        string category;
        decimal declaredQuantity;
        string unit;
        decimal expectedPrice;
    |} materialInfo;
    record {|
        string name;
        string phone;
        time:Civil visitDate;
        string visitDuration;
    |} agentInfo;
    record {|
        int overallRating;
        int conditionRating;
        int quantityRating;
        decimal quantityVerified;
        decimal? quantityDiscrepancy;
        decimal checklistCompletion;
    |} verificationResults;
    string recommendation;
    string notes;
    string[] photos;
|};