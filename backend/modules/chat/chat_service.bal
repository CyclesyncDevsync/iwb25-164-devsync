import ballerina/http;
import ballerina/log;
import ballerina/uuid;
import ballerinax/postgresql;
import ballerina/sql;
import ballerina/time;
import Cyclesync.database_config;

// Chat service listener
listener http:Listener chatListener = new(8087);

// Chat message type
type ChatMessage record {|
    string content;
    string? file_url = ();
    json? location = ();
    string message_type = "text";
|};

// Chat room response
type ChatRoom record {|
    string room_id;
    string agent_id;
    string supplier_id;
    string material_id;
    string? assignment_id;
    string status;
    string created_at;
    string? last_message_at;
|};

// Message response
type MessageResponse record {|
    string message_id;
    string room_id;
    string sender_id;
    string sender_type;
    string message_type;
    string content;
    string? file_url;
    json? location;
    string status;
    string created_at;
    string? delivered_at;
    string? read_at;
|};

// Chat service
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "http://192.168.80.1:3000", "https://cyclesync.com"],
        allowCredentials: true,
        allowHeaders: ["Authorization", "Content-Type"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
}
service /api/chat on chatListener {
    
    function init() returns error? {
        log:printInfo("Chat Service initialized on port 8087");
    }
    
    // Get or create chat room
    resource function post room(@http:Payload json payload) 
            returns json|http:BadRequest|http:InternalServerError|error {
        
        postgresql:Client|error dbClientResult = database_config:getDbClient();
        if (dbClientResult is error) {
            return <http:InternalServerError>{
                body: {"error": "Database connection not available"}
            };
        }
        
        postgresql:Client dbClientLocal = dbClientResult;
        
        // Handle agent_id
        json|error agentIdJson = payload.agent_id;
        if (agentIdJson is error) {
            return <http:BadRequest>{
                body: {"error": "Missing agent_id"}
            };
        }
        string agentId = agentIdJson.toString();
        
        // Handle supplier_id
        json|error supplierIdJson = payload.supplier_id;
        if (supplierIdJson is error) {
            return <http:BadRequest>{
                body: {"error": "Missing supplier_id"}
            };
        }
        string supplierId = supplierIdJson.toString();
        
        // Handle material_id
        json|error materialIdJson = payload.material_id;
        if (materialIdJson is error) {
            return <http:BadRequest>{
                body: {"error": "Missing material_id"}
            };
        }
        string materialId = materialIdJson.toString();
        
        // Handle assignment_id
        string? assignmentId = ();
        json|error assignmentIdJson = payload.assignment_id;
        if (assignmentIdJson is json && !(assignmentIdJson is ())) {
            assignmentId = assignmentIdJson.toString();
        }
        
        // Log the values we're searching for
        log:printInfo(string `Checking for existing room with agent_id=${agentId}, supplier_id=${supplierId}, material_id=${materialId}`);
        
        // Check if room already exists - use TRIM to handle any whitespace issues
        sql:ParameterizedQuery checkQuery = `
            SELECT room_id, status, created_at, last_message_at
            FROM chat_rooms
            WHERE TRIM(agent_id) = TRIM(${agentId})
            AND TRIM(supplier_id) = TRIM(${supplierId})
            AND TRIM(material_id) = TRIM(${materialId})
            LIMIT 1
        `;
        
        stream<record {}, error?> resultStream = dbClientLocal->query(checkQuery);
        record {}? existingRoom = check resultStream.next();
        check resultStream.close();
        
        if (existingRoom is ()) {
            log:printInfo("No existing room found");
        } else {
            log:printInfo("Found existing room: " + existingRoom.toString());
        }
        
        if existingRoom is record {} {
            // Room already exists
            // Check if the result is wrapped in a "value" field
            var roomData = existingRoom;
            if existingRoom["value"] is record {} {
                roomData = <record {}>existingRoom["value"];
            }
            
            var roomId = roomData["room_id"];
            if roomId is () {
                // Invalid room data, create a new one
                log:printError("Found chat room with null room_id, creating new room");
            } else {
                return {
                    "room_id": <json>roomId,
                    "status": <json>roomData["status"],
                    "created_at": <json>roomData["created_at"],
                    "last_message_at": <json>roomData["last_message_at"],
                    "existing": true
                };
            }
        }
        
        // Create new room
        string roomId = uuid:createType1AsString();
        
        sql:ParameterizedQuery insertQuery = `
            INSERT INTO chat_rooms (
                room_id, agent_id, supplier_id, material_id, assignment_id,
                status, created_at
            ) VALUES (
                ${roomId}, ${agentId}, ${supplierId}, ${materialId}, ${assignmentId},
                'active', CURRENT_TIMESTAMP
            )
        `;
        
        sql:ExecutionResult|error insertResult = dbClientLocal->execute(insertQuery);
        
        if (insertResult is error) {
            // If insert fails due to duplicate, try to fetch the existing room
            log:printError("Insert failed: " + insertResult.message());
            log:printInfo(string `Retrying fetch with agent_id=${agentId}, supplier_id=${supplierId}, material_id=${materialId}`);
            
            stream<record {}, error?> retryStream = dbClientLocal->query(checkQuery);
            record {}? existingRoomRetry = check retryStream.next();
            check retryStream.close();
            
            if (existingRoomRetry is ()) {
                log:printError("Retry also found no room!");
            } else {
                log:printInfo("Retry found room: " + existingRoomRetry.toString());
            }
            
            if (existingRoomRetry is record {}) {
                // Check if the result is wrapped in a "value" field
                var retryRoomData = existingRoomRetry;
                if existingRoomRetry["value"] is record {} {
                    retryRoomData = <record {}>existingRoomRetry["value"];
                }
                
                if (retryRoomData["room_id"] !is ()) {
                    return {
                        "room_id": <json>retryRoomData["room_id"],
                        "status": <json>retryRoomData["status"],
                        "created_at": <json>retryRoomData["created_at"],
                        "last_message_at": <json>retryRoomData["last_message_at"],
                        "existing": true
                    };
                }
            }
            
            // If we still can't find it, return the original error
            return error("Failed to create or find chat room: " + insertResult.message());
        }
        
        return {
            "room_id": roomId,
            "status": "active",
            "created_at": time:utcNow().toString(),
            "existing": false
        };
    }
    
    // Send message
    resource function post message(@http:Payload json payload) 
            returns json|http:BadRequest|http:InternalServerError|error {
        
        postgresql:Client|error dbClientResult = database_config:getDbClient();
        if (dbClientResult is error) {
            return <http:InternalServerError>{
                body: {"error": "Database connection not available"}
            };
        }
        
        postgresql:Client dbClientLocal = dbClientResult;
        
        // Handle room_id
        json|error roomIdJson = payload.room_id;
        if (roomIdJson is error) {
            return <http:BadRequest>{
                body: {"error": "Missing room_id"}
            };
        }
        string roomId = roomIdJson.toString();
        
        // Handle sender_id
        json|error senderIdJson = payload.sender_id;
        if (senderIdJson is error) {
            return <http:BadRequest>{
                body: {"error": "Missing sender_id"}
            };
        }
        string senderId = senderIdJson.toString();
        
        // Handle sender_type
        json|error senderTypeJson = payload.sender_type;
        if (senderTypeJson is error) {
            return <http:BadRequest>{
                body: {"error": "Missing sender_type"}
            };
        }
        string senderType = senderTypeJson.toString();
        
        // Handle message
        json|error messageJson = payload.message;
        if (messageJson is error) {
            return <http:BadRequest>{
                body: {"error": "Missing message"}
            };
        }
        
        // Parse message fields
        string content = "";
        string messageType = "text";
        string? fileUrl = ();
        json? location = ();
        
        if (messageJson is map<json>) {
            json|error contentJson = messageJson["content"];
            if (contentJson is json) {
                content = contentJson.toString();
            }
            
            json|error messageTypeJson = messageJson["message_type"];
            if (messageTypeJson is json) {
                messageType = messageTypeJson.toString();
            }
            
            json|error fileUrlJson = messageJson["file_url"];
            if (fileUrlJson is json && !(fileUrlJson is ())) {
                fileUrl = fileUrlJson.toString();
            }
            
            json|error locationJson = messageJson["location"];
            if (locationJson is json && !(locationJson is ())) {
                location = locationJson;
            }
        }
        
        ChatMessage message = {
            content: content,
            message_type: messageType,
            file_url: fileUrl,
            location: location
        };
        
        string messageId = uuid:createType1AsString();
        
        // Insert message
        sql:ParameterizedQuery insertQuery;
        if (message.location is ()) {
            insertQuery = `
                INSERT INTO chat_messages (
                    message_id, room_id, sender_id, sender_type,
                    message_type, content, file_url, location,
                    status, created_at
                ) VALUES (
                    ${messageId}, ${roomId}, ${senderId}, ${senderType},
                    ${message.message_type}, ${message.content}, 
                    ${message.file_url}, NULL,
                    'sent', CURRENT_TIMESTAMP
                )
            `;
        } else {
            insertQuery = `
                INSERT INTO chat_messages (
                    message_id, room_id, sender_id, sender_type,
                    message_type, content, file_url, location,
                    status, created_at
                ) VALUES (
                    ${messageId}, ${roomId}, ${senderId}, ${senderType},
                    ${message.message_type}, ${message.content}, 
                    ${message.file_url}, ${message.location.toString()}::jsonb,
                    'sent', CURRENT_TIMESTAMP
                )
            `;
        }
        
        _ = check dbClientLocal->execute(insertQuery);
        
        // Update room last_message_at
        sql:ParameterizedQuery updateRoomQuery = `
            UPDATE chat_rooms 
            SET last_message_at = CURRENT_TIMESTAMP
            WHERE room_id = ${roomId}
        `;
        
        _ = check dbClientLocal->execute(updateRoomQuery);
        
        return {
            "message_id": messageId,
            "status": "sent",
            "created_at": time:utcNow().toString()
        };
    }
    
    // Get messages for a room
    resource function get messages/[string roomId](http:RequestContext ctx, http:Request req) 
            returns json|http:NotFound|http:InternalServerError|error {
        
        postgresql:Client|error dbClientResult = database_config:getDbClient();
        if (dbClientResult is error) {
            return <http:InternalServerError>{
                body: {"error": "Database connection not available"}
            };
        }
        
        postgresql:Client dbClientLocal = dbClientResult;
        
        // Get query parameters
        map<string[]> params = req.getQueryParams();
        int limitValue = 50;
        int offsetValue = 0;
        
        string[]? limitParam = params["limit"];
        if (limitParam is string[] && limitParam.length() > 0) {
            int|error parsedLimit = int:fromString(limitParam[0]);
            if (parsedLimit is int) {
                limitValue = parsedLimit;
            }
        }
        
        string[]? offsetParam = params["offset"];
        if (offsetParam is string[] && offsetParam.length() > 0) {
            int|error parsedOffset = int:fromString(offsetParam[0]);
            if (parsedOffset is int) {
                offsetValue = parsedOffset;
            }
        }
        
        // Verify room exists
        sql:ParameterizedQuery checkRoomQuery = `
            SELECT room_id FROM chat_rooms WHERE room_id = ${roomId} LIMIT 1
        `;
        
        stream<record {}, error?> roomStream = dbClientLocal->query(checkRoomQuery);
        record {}? room = check roomStream.next();
        check roomStream.close();
        
        if room is () {
            return <http:NotFound>{
                body: {"error": "Room not found"}
            };
        }
        
        // Get messages
        sql:ParameterizedQuery messagesQuery = `
            SELECT 
                message_id, room_id, sender_id, sender_type,
                message_type, content, file_url, location::text as location_json,
                status, created_at, delivered_at, read_at
            FROM chat_messages
            WHERE room_id = ${roomId}
            ORDER BY created_at DESC
            LIMIT ${limitValue} OFFSET ${offsetValue}
        `;
        
        stream<record {}, error?> messageStream = dbClientLocal->query(messagesQuery);
        json[] messages = [];
        
        check from record {} msg in messageStream
            do {
                json message = {
                    "message_id": <json>msg["message_id"],
                    "room_id": <json>msg["room_id"],
                    "sender_id": <json>msg["sender_id"],
                    "sender_type": <json>msg["sender_type"],
                    "message_type": <json>msg["message_type"],
                    "content": <json>msg["content"],
                    "file_url": <json>msg["file_url"],
                    "location": <json>msg["location_json"],
                    "status": <json>msg["status"],
                    "created_at": <json>msg["created_at"],
                    "delivered_at": <json>msg["delivered_at"],
                    "read_at": <json>msg["read_at"]
                };
                messages.push(message);
            };
        
        // Messages are in reverse order, reverse them back
        json[] orderedMessages = [];
        int i = messages.length() - 1;
        while (i >= 0) {
            orderedMessages.push(messages[i]);
            i = i - 1;
        }
        
        return {
            "room_id": roomId,
            "messages": orderedMessages,
            "count": messages.length()
        };
    }
    
    // Mark messages as read
    resource function put messages/read(@http:Payload json payload) 
            returns json|http:BadRequest|http:InternalServerError|error {
        
        postgresql:Client|error dbClientResult = database_config:getDbClient();
        if (dbClientResult is error) {
            return <http:InternalServerError>{
                body: {"error": "Database connection not available"}
            };
        }
        
        postgresql:Client dbClientLocal = dbClientResult;
        
        // Handle room_id
        json|error roomIdJson = payload.room_id;
        if (roomIdJson is error) {
            return <http:BadRequest>{
                body: {"error": "Missing room_id"}
            };
        }
        string roomId = roomIdJson.toString();
        
        // Handle reader_id
        json|error readerIdJson = payload.reader_id;
        if (readerIdJson is error) {
            return <http:BadRequest>{
                body: {"error": "Missing reader_id"}
            };
        }
        string readerId = readerIdJson.toString();
        
        // Update all unread messages in the room that were not sent by the reader
        sql:ParameterizedQuery updateQuery = `
            UPDATE chat_messages 
            SET status = 'read', read_at = CURRENT_TIMESTAMP
            WHERE room_id = ${roomId}
            AND sender_id != ${readerId}
            AND status != 'read'
        `;
        
        sql:ExecutionResult result = check dbClientLocal->execute(updateQuery);
        
        return {
            "updated_count": result.affectedRowCount,
            "status": "success"
        };
    }
    
    // Get chat rooms for an agent
    resource function get rooms/agent/[string agentId]() 
            returns json|http:InternalServerError|error {
        
        postgresql:Client|error dbClientResult = database_config:getDbClient();
        if (dbClientResult is error) {
            return <http:InternalServerError>{
                body: {"error": "Database connection not available"}
            };
        }
        
        postgresql:Client dbClientLocal = dbClientResult;
        
        sql:ParameterizedQuery query = `
            SELECT 
                r.room_id, r.agent_id, r.supplier_id, r.material_id,
                r.assignment_id, r.status, r.created_at, r.last_message_at,
                u.first_name || ' ' || u.last_name as supplier_name,
                ms.title as material_title,
                (SELECT COUNT(*) FROM chat_messages cm 
                 WHERE cm.room_id = r.room_id 
                 AND cm.sender_id != ${agentId} 
                 AND cm.status != 'read') as unread_count,
                (SELECT COUNT(*) FROM chat_messages cm2 
                 WHERE cm2.room_id = r.room_id) as total_messages
            FROM chat_rooms r
            LEFT JOIN users u ON r.supplier_id = u.asgardeo_id
            LEFT JOIN material_submissions ms ON r.material_id = ms.id::text
            WHERE r.agent_id = ${agentId}
            AND r.status = 'active'
            AND EXISTS (SELECT 1 FROM chat_messages cm3 WHERE cm3.room_id = r.room_id)
            ORDER BY r.last_message_at DESC NULLS LAST
        `;
        
        stream<record {}, error?> resultStream = dbClientLocal->query(query);
        json[] rooms = [];
        
        check from record {} room in resultStream
            do {
                json roomData = {
                    "room_id": <json>room["room_id"],
                    "agent_id": <json>room["agent_id"],
                    "supplier_id": <json>room["supplier_id"],
                    "material_id": <json>room["material_id"],
                    "assignment_id": <json>room["assignment_id"],
                    "status": <json>room["status"],
                    "created_at": <json>room["created_at"],
                    "last_message_at": <json>room["last_message_at"],
                    "supplier_name": room["supplier_name"] is () ? "Unknown Supplier" : <json>room["supplier_name"],
                    "material_title": room["material_title"] is () ? "Unknown Material" : <json>room["material_title"],
                    "unread_count": <json>room["unread_count"]
                };
                rooms.push(roomData);
            };
        
        return {
            "rooms": rooms,
            "count": rooms.length()
        };
    }
    
    // Get chat rooms for a supplier
    resource function get rooms/supplier/[string supplierId]() 
            returns json|http:InternalServerError|error {
        
        postgresql:Client|error dbClientResult = database_config:getDbClient();
        if (dbClientResult is error) {
            return <http:InternalServerError>{
                body: {"error": "Database connection not available"}
            };
        }
        
        postgresql:Client dbClientLocal = dbClientResult;
        
        sql:ParameterizedQuery query = `
            SELECT 
                r.room_id, r.agent_id, r.supplier_id, r.material_id,
                r.assignment_id, r.status, r.created_at, r.last_message_at,
                u.first_name || ' ' || u.last_name as agent_name,
                ms.title as material_title,
                (SELECT COUNT(*) FROM chat_messages cm 
                 WHERE cm.room_id = r.room_id 
                 AND cm.sender_id != ${supplierId} 
                 AND cm.status != 'read') as unread_count,
                (SELECT COUNT(*) FROM chat_messages cm2 
                 WHERE cm2.room_id = r.room_id) as total_messages
            FROM chat_rooms r
            LEFT JOIN users u ON r.agent_id = u.asgardeo_id
            LEFT JOIN material_submissions ms ON r.material_id = ms.id::text
            WHERE r.supplier_id = ${supplierId}
            AND r.status = 'active'
            AND EXISTS (SELECT 1 FROM chat_messages cm3 WHERE cm3.room_id = r.room_id)
            ORDER BY r.last_message_at DESC NULLS LAST
        `;
        
        stream<record {}, error?> resultStream = dbClientLocal->query(query);
        json[] rooms = [];
        
        check from record {} room in resultStream
            do {
                json roomData = {
                    "room_id": <json>room["room_id"],
                    "agent_id": <json>room["agent_id"],
                    "supplier_id": <json>room["supplier_id"],
                    "material_id": <json>room["material_id"],
                    "assignment_id": <json>room["assignment_id"],
                    "status": <json>room["status"],
                    "created_at": <json>room["created_at"],
                    "last_message_at": <json>room["last_message_at"],
                    "agent_name": room["agent_name"] is () ? "Unknown Agent" : <json>room["agent_name"],
                    "material_title": room["material_title"] is () ? "Unknown Material" : <json>room["material_title"],
                    "unread_count": <json>room["unread_count"]
                };
                rooms.push(roomData);
            };
        
        return {
            "rooms": rooms,
            "count": rooms.length()
        };
    }
    
    // Get total unread count for a supplier
    resource function get rooms/supplier/[string supplierId]/unread\-count() 
            returns json|http:InternalServerError|error {
        
        postgresql:Client|error dbClientResult = database_config:getDbClient();
        if (dbClientResult is error) {
            return <http:InternalServerError>{
                body: {"error": "Database connection not available"}
            };
        }
        
        postgresql:Client dbClientLocal = dbClientResult;
        
        sql:ParameterizedQuery query = `
            SELECT COUNT(*) as unread_count
            FROM chat_messages cm
            INNER JOIN chat_rooms r ON cm.room_id = r.room_id
            WHERE r.supplier_id = ${supplierId}
            AND cm.sender_id != ${supplierId}
            AND cm.status != 'read'
        `;
        
        stream<record {}, error?> resultStream = dbClientLocal->query(query);
        record {}? result = check resultStream.next();
        check resultStream.close();
        
        int unreadCount = 0;
        if (result is record {}) {
            var count = result["unread_count"];
            if (count is int) {
                unreadCount = count;
            } else if (count is decimal) {
                unreadCount = <int>count;
            }
        }
        
        return {
            "unread_count": unreadCount
        };
    }
}