# CircularSync: Real-Time Circular Economy Orchestration Platform
## WSO2 Ballerina Competition 2025 Submission

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Features & WSO2 Product Mapping](#features-wso2-product-mapping)
4. [Use Case Diagram](#use-case-diagram)
5. [User Flow Diagrams](#user-flow-diagrams)
6. [Ballerina Functions & Implementation](#ballerina-functions-implementation)
7. [Technical Stack](#technical-stack)
8. [Integration Points](#integration-points)

---

## Executive Summary

CircularSync is a revolutionary real-time circular economy orchestration platform built entirely on WSO2 Ballerina technology stack. It transforms industrial waste streams into valuable resources through intelligent cross-industry coordination, leveraging Ballerina's network-first programming capabilities.

### Key Innovation Points:
- **Real-time WebSocket orchestration** for waste-to-resource matching
- **AI-powered optimization** using Ballerina's ML connectors
- **Multi-protocol integration** (HTTP, WebSocket, GraphQL, MQTT)
- **Blockchain-verified transactions** for trust and transparency
- **Automated regulatory compliance** across multiple frameworks

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CircularSync Platform                               │
│                         Built on WSO2 Ballerina Stack                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐                    ┌──────────────────┐                  │
│  │   Next.js UI    │◄──────────────────►│  WSO2 API       │                  │
│  │   Dashboard     │    GraphQL/REST    │  Gateway         │                  │
│  └─────────────────┘                    └────────┬─────────┘                  │
│                                                  │                             │
│  ┌───────────────────────────────────────────────┼─────────────────────────┐  │
│  │                    Ballerina Microservices Layer                        │  │
│  ├─────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                         │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │  │
│  │  │ Waste Stream    │  │ AI Optimization │  │ Compliance      │       │  │
│  │  │ Orchestrator    │  │ Engine          │  │ Automation      │       │  │
│  │  │ (WebSocket)     │  │ (ML Service)    │  │ Service         │       │  │
│  │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘       │  │
│  │           │                     │                     │                │  │
│  │  ┌────────┴─────────────────────┴─────────────────────┴────────┐      │  │
│  │  │              Ballerina Integration Bus (ESB)                │      │  │
│  │  │         ┌──────────┐  ┌──────────┐  ┌──────────┐          │      │  │
│  │  │         │ Message  │  │ Event    │  │ Data     │          │      │  │
│  │  │         │ Broker   │  │ Stream   │  │ Transform│          │      │  │
│  │  │         └──────────┘  └──────────┘  └──────────┘          │      │  │
│  │  └──────────────────────────┬──────────────────────────────────┘      │  │
│  │                             │                                          │  │
│  │  ┌──────────────────────────┴──────────────────────────────┐         │  │
│  │  │           WSO2 Identity Server (Authentication)         │         │  │
│  │  └──────────────────────────────────────────────────────────┘         │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  External Integrations                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Industrial  │  │ Logistics   │  │ Regulatory  │  │ IoT Sensors │         │
│  │ ERPs        │  │ APIs        │  │ Bodies      │  │ (MQTT)      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                                                 │
│  Data Layer                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ MongoDB     │  │ Redis       │  │ Blockchain  │  │ Time Series │         │
│  │ (Main DB)   │  │ (Cache)     │  │ (Ledger)    │  │ DB          │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Features & WSO2 Product Mapping

### Core Features with WSO2 Implementation

| Feature | WSO2 Product/Component | Implementation Details |
|---------|------------------------|------------------------|
| **Real-Time Waste Stream Matching** | Ballerina WebSocket Service | WebSocket endpoints for live waste availability updates |
| **API Gateway & Management** | WSO2 API Manager | Centralized API governance, rate limiting, analytics |
| **User Authentication & SSO** | WSO2 Identity Server | OAuth2, SAML, OpenID Connect for multi-tenant access |
| **AI/ML Optimization** | Ballerina ML Connectors | Integration with TensorFlow/PyTorch models |
| **Message Brokering** | Ballerina Message Broker | Async processing of waste transactions |
| **Event Streaming** | Ballerina Streaming | Real-time event processing for compliance monitoring |
| **Data Integration** | Ballerina ETL Services | Transform diverse industry data formats |
| **Blockchain Integration** | Ballerina Blockchain Connector | Smart contract execution for waste transactions |
| **Monitoring & Analytics** | WSO2 Observability | Distributed tracing, metrics, logging |

---

## Use Case Diagram

```
                              CircularSync Platform
     ┌────────────────────────────────────────────────────────────────┐
     │                                                                │
     │  ┌─────────────┐         ┌─────────────────┐                 │
     │  │   Waste     │         │  Submit Waste   │                 │
     │  │  Producer   ├────────►│  Stream Data    │                 │
     │  │ (Factory)   │         └────────┬────────┘                 │
     │  └─────────────┘                  │                          │
     │                                   │                          │
     │  ┌─────────────┐         ┌────────▼────────┐                 │
     │  │   Waste     │         │  Search &       │                 │
     │  │  Consumer   ├────────►│  Match Resources│                 │
     │  │ (Industry)  │         └────────┬────────┘                 │
     │  └─────────────┘                  │                          │
     │                                   │                          │
     │  ┌─────────────┐         ┌────────▼────────┐                 │
     │  │  Logistics  │         │  Schedule       │                 │
     │  │  Provider   ├────────►│  Transportation │                 │
     │  └─────────────┘         └────────┬────────┘                 │
     │                                   │                          │
     │  ┌─────────────┐         ┌────────▼────────┐                 │
     │  │ Regulatory  │         │  Verify         │                 │
     │  │   Body      ├────────►│  Compliance     │                 │
     │  └─────────────┘         └────────┬────────┘                 │
     │                                   │                          │
     │  ┌─────────────┐         ┌────────▼────────┐                 │
     │  │   System    │         │  Monitor &      │                 │
     │  │   Admin     ├────────►│  Configure      │                 │
     │  └─────────────┘         └─────────────────┘                 │
     │                                                                │
     └────────────────────────────────────────────────────────────────┘
```

---

## User Flow Diagrams

### 1. Waste Producer Flow
```
Start → Login (WSO2 IS) → Dashboard → Submit Waste Details → 
AI Categorization → Real-time Broadcast → Match Notification → 
Accept Offer → Generate Smart Contract → Track Pickup → Complete
```

### 2. Waste Consumer Flow
```
Start → Login (WSO2 IS) → Browse Available Waste → Apply Filters → 
View AI Recommendations → Submit Bid → Negotiate Terms → 
Confirm Transaction → Schedule Logistics → Receive & Verify → Rate
```

### 3. Compliance Flow
```
Transaction Initiated → Auto-capture Metadata → Check Regulations → 
Generate Reports → Submit to Authorities → Monitor Status → 
Archive Records → Audit Trail
```

---

## Ballerina Functions & Implementation

### 1. Core Orchestration Service

```ballerina
// Main waste stream orchestrator service
service /wastestream on new websocket:Listener(9090) {
    
    // WebSocket connection for real-time updates
    resource function get .() returns websocket:Service|error {
        return new WasteStreamService();
    }
}

service class WasteStreamService {
    *websocket:Service;
    
    // Store active connections
    map<websocket:Caller> activeProducers = {};
    map<websocket:Caller> activeConsumers = {};
    
    remote function onOpen(websocket:Caller caller) returns error? {
        string clientType = caller.getQueryParam("type") ?: "consumer";
        string clientId = caller.getConnectionId();
        
        if (clientType == "producer") {
            self.activeProducers[clientId] = caller;
        } else {
            self.activeConsumers[clientId] = caller;
        }
        
        // Authenticate via WSO2 IS
        boolean authenticated = check authenticateClient(caller);
        if (!authenticated) {
            check caller->close(statusCode = 1008, reason = "Unauthorized");
        }
    }
    
    remote function onMessage(websocket:Caller caller, json wasteData) returns error? {
        // Validate and process waste stream data
        WasteStream waste = check wasteData.cloneWithType(WasteStream);
        
        // AI optimization for matching
        MatchResult[] matches = check findOptimalMatches(waste);
        
        // Broadcast to relevant consumers
        foreach var match in matches {
            websocket:Caller? consumer = self.activeConsumers[match.consumerId];
            if (consumer is websocket:Caller) {
                check consumer->writeMessage({
                    "type": "new_waste_available",
                    "data": waste,
                    "matchScore": match.score
                });
            }
        }
    }
}
```

### 2. AI Optimization Engine

```ballerina
// AI-powered waste matching service
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000"],
        allowCredentials: true
    }
}
service /ai/optimize on new http:Listener(8080) {
    
    resource function post match(@http:Payload WasteStream waste) returns MatchResult[]|error {
        // Connect to ML model service
        ml:Client mlClient = check new("http://ml-service:5000");
        
        // Prepare features for ML model
        json features = {
            "wasteType": waste.category,
            "quantity": waste.quantity,
            "location": waste.location,
            "qualityMetrics": waste.qualityMetrics
        };
        
        // Get predictions from ML model
        json predictions = check mlClient->predict(features);
        
        // Query potential consumers from database
        mongodb:Client mongoClient = check new(connectionString = mongodbUrl);
        stream<Consumer, error?> consumers = check mongoClient->find("consumers", {
            "requirements.type": waste.category,
            "location.distance": {"$lte": 100} // 100km radius
        });
        
        // Calculate match scores
        MatchResult[] results = [];
        check consumers.forEach(function(Consumer consumer) {
            float matchScore = calculateMatchScore(waste, consumer, predictions);
            results.push({
                consumerId: consumer.id,
                score: matchScore,
                estimatedValue: calculateValue(waste, consumer),
                logistics: estimateLogistics(waste.location, consumer.location)
            });
        });
        
        // Sort by score and return top matches
        return results.sort(descending, key = function(MatchResult r) returns float => r.score);
    }
}
```

### 3. Compliance Automation Service

```ballerina
// Regulatory compliance service
service /compliance on new http:Listener(8081) {
    
    resource function post verify(Transaction trx) returns ComplianceResult|error {
        // Initialize compliance checkers
        ComplianceChecker[] checkers = [
            new EPAChecker(),
            new EUTaxonomyChecker(),
            new OSHAChecker()
        ];
        
        ComplianceResult result = {
            transactionId: trx.id,
            compliant: true,
            violations: [],
            reports: []
        };
        
        // Run all compliance checks in parallel
        future<ComplianceCheck|error>[] futures = [];
        foreach var checker in checkers {
            futures.push(start checker.check(trx));
        }
        
        // Wait for all checks to complete
        foreach var f in futures {
            ComplianceCheck|error check = wait f;
            if (check is ComplianceCheck) {
                if (!check.passed) {
                    result.compliant = false;
                    result.violations.push(check.violation);
                }
                result.reports.push(check.report);
            }
        }
        
        // Store compliance record in blockchain
        blockchain:Client blockchainClient = check new(blockchainUrl);
        string txHash = check blockchainClient->recordCompliance(result);
        result.blockchainRef = txHash;
        
        // Generate regulatory reports
        if (result.compliant) {
            check generateRegulatoryReports(trx, result);
        }
        
        return result;
    }
}
```

### 4. Logistics Coordination Service

```ballerina
// Logistics orchestration service
service /logistics on new http:Listener(8082) {
    
    resource function post schedule(@http:Payload LogisticsRequest request) returns LogisticsSchedule|error {
        // Get available transporters
        http:Client logisticsAPI = check new("https://logistics-provider.com/api");
        json availableFleet = check logisticsAPI->get("/fleet/available", {
            "from": request.pickup,
            "to": request.delivery,
            "date": request.date,
            "cargo": request.wasteType
        });
        
        // Calculate optimal route
        RouteOptimizer optimizer = new;
        Route optimalRoute = check optimizer.calculate(
            request.pickup,
            request.delivery,
            availableFleet
        );
        
        // Book transportation
        json booking = check logisticsAPI->post("/booking", {
            "route": optimalRoute,
            "cargo": {
                "type": request.wasteType,
                "quantity": request.quantity,
                "hazmat": request.hazardous
            }
        });
        
        // Create tracking webhook
        string trackingId = booking.trackingId.toString();
        check createTrackingWebhook(trackingId);
        
        return {
            scheduleId: uuid:createType4AsString(),
            trackingId: trackingId,
            estimatedPickup: booking.pickup,
            estimatedDelivery: booking.delivery,
            cost: booking.cost,
            carbonFootprint: calculateCarbonFootprint(optimalRoute)
        };
    }
}
```

### 5. GraphQL API for Frontend

```ballerina
// GraphQL service for Next.js frontend
@graphql:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000"]
    },
    auth: [
        {
            oauth2IntrospectionConfig: {
                url: "https://localhost:9443/oauth2/introspect",
                clientConfig: {
                    customHeaders: {"Authorization": "Basic YWRtaW46YWRtaW4="}
                }
            }
        }
    ]
}
service /graphql on new graphql:Listener(4000) {
    
    // Query available waste streams
    resource function get wasteStreams(string? category, float? minQuantity) returns WasteStream[]|error {
        mongodb:Client db = check new(connectionString = mongodbUrl);
        map<json> filter = {};
        
        if (category is string) {
            filter["category"] = category;
        }
        if (minQuantity is float) {
            filter["quantity"] = {"$gte": minQuantity};
        }
        
        stream<WasteStream, error?> results = check db->find("waste_streams", filter);
        return check results.toArray();
    }
    
    // Subscribe to real-time updates
    resource function subscribe wasteUpdates(string consumerId) returns stream<WasteUpdate, error?>|error {
        // Create real-time subscription stream
        stream<WasteUpdate, error?> updateStream = new;
        
        // Connect to WebSocket service
        websocket:Client wsClient = check new("ws://localhost:9090/wastestream?type=consumer");
        
        // Forward updates to GraphQL subscription
        _ = start forwardUpdates(wsClient, updateStream);
        
        return updateStream;
    }
    
    // Mutation to create waste offer
    resource function post createWasteOffer(@graphql:Input WasteOffer offer) returns string|error {
        // Validate offer
        check validateWasteOffer(offer);
        
        // Store in database
        mongodb:Client db = check new(connectionString = mongodbUrl);
        mongodb:InsertOneResult result = check db->insertOne("waste_offers", offer);
        
        // Trigger matching engine
        _ = start triggerMatching(offer);
        
        return result.insertedId.toString();
    }
}
```

### 6. Event Stream Processing

```ballerina
// Real-time event processing for monitoring
service /events on new http:Listener(8083) {
    
    resource function post process(http:Request req) returns error? {
        // Create event stream
        stream<json, error?> eventStream = check req.getBodyStream();
        
        // Define stream queries
        from var event in eventStream
        where event.type == "waste_transaction"
        window time(5000) // 5 second window
        select {
            wasteType: event.wasteType,
            count: count(),
            totalVolume: sum(event.quantity),
            avgPrice: avg(event.price)
        }
        => (Statistics stats) {
            // Update real-time dashboard
            check updateDashboard(stats);
            
            // Check for anomalies
            if (stats.avgPrice > getThreshold(stats.wasteType)) {
                check sendAlert("Price anomaly detected", stats);
            }
        };
    }
}
```

### 7. Blockchain Integration

```ballerina
// Blockchain service for immutable transaction records
service /blockchain on new http:Listener(8084) {
    
    resource function post recordTransaction(@http:Payload Transaction trx) returns string|error {
        // Initialize Web3 client
        web3:Client web3Client = check new(ethereumNodeUrl);
        
        // Create smart contract instance
        web3:Contract wasteContract = check web3Client.getContract(
            contractAddress,
            contractABI
        );
        
        // Prepare transaction data
        json txData = {
            "wasteId": trx.wasteId,
            "producerId": trx.producerId,
            "consumerId": trx.consumerId,
            "quantity": trx.quantity,
            "timestamp": time:utcNow(),
            "complianceHash": trx.complianceHash
        };
        
        // Execute smart contract function
        web3:TransactionReceipt receipt = check wasteContract.invoke(
            "recordWasteTransaction",
            txData,
            {gas: 3000000}
        );
        
        return receipt.transactionHash;
    }
}
```

### 8. Integration Hub Service

```ballerina
// Central integration service for external systems
service /integrate on new http:Listener(8085) {
    
    // ERP Integration
    resource function post erp/sync(@http:Payload ERPData data) returns error? {
        // Transform ERP data to standard format
        transformer:Transformer t = new;
        WasteData standardData = check t.transform(data, getERPMapping(data.system));
        
        // Validate transformed data
        check validateWasteData(standardData);
        
        // Push to message queue
        rabbitmq:Client rabbitClient = check new(rabbitmqUrl);
        check rabbitClient->publishMessage({
            exchange: "waste.exchange",
            routingKey: "waste.new",
            data: standardData
        });
    }
    
    // IoT Sensor Integration
    resource function post iot/data(@http:Payload SensorData[] sensors) returns error? {
        // Process sensor data
        foreach var sensor in sensors {
            // Store in time-series database
            influxdb:Client influxClient = check new(influxdbUrl);
            check influxClient->write({
                measurement: "waste_metrics",
                tags: {"sensorId": sensor.id, "location": sensor.location},
                fields: sensor.metrics,
                time: sensor.timestamp
            });
            
            // Check thresholds
            foreach var [metric, value] in sensor.metrics.entries() {
                float threshold = getThreshold(metric);
                if (value > threshold) {
                    check triggerAlert(sensor, metric, value);
                }
            }
        }
    }
}
```

---

## Technical Stack

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with TypeScript
- **State Management**: Zustand + React Query
- **Real-time**: Socket.io-client for WebSocket
- **GraphQL Client**: Apollo Client
- **Styling**: Tailwind CSS + Shadcn/ui
- **Charts**: Recharts for analytics

### Backend (WSO2 Ballerina)
- **Core Language**: Ballerina Swan Lake
- **API Gateway**: WSO2 API Manager 4.2.0
- **Identity**: WSO2 Identity Server 6.1.0
- **Message Broker**: Ballerina Message Broker
- **Streaming**: Ballerina Streaming SQL
- **Monitoring**: WSO2 Observability

### Data Layer
- **Primary Database**: MongoDB Atlas
- **Cache**: Redis Enterprise
- **Time-series**: InfluxDB
- **Blockchain**: Ethereum/Polygon
- **Search**: Elasticsearch

### DevOps
- **Container**: Docker + Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

---

## Integration Points

### External APIs
1. **Industrial ERPs**: SAP, Oracle, Microsoft Dynamics
2. **Logistics**: DHL, FedEx, UPS APIs
3. **Regulatory**: EPA, EU Environmental APIs
4. **Payment**: Stripe, PayPal for transactions
5. **IoT Platforms**: AWS IoT, Azure IoT Hub

### Data Formats
- **Input**: JSON, XML, CSV, EDI
- **Internal**: Ballerina Records
- **Output**: JSON, GraphQL, Protocol Buffers

### Security
- **Authentication**: OAuth 2.0, JWT, SAML
- **Authorization**: RBAC via WSO2 IS
- **Encryption**: TLS 1.3, AES-256
- **API Security**: Rate limiting, IP whitelisting

---

## Deployment Architecture

```yaml
# Kubernetes deployment structure
namespaces:
  - circularsync-prod
  - circularsync-staging
  
services:
  - waste-orchestrator (3 replicas)
  - ai-engine (2 replicas) 
  - compliance-service (2 replicas)
  - logistics-service (2 replicas)
  - graphql-gateway (3 replicas)
  - integration-hub (2 replicas)
  
infrastructure:
  - mongodb (replica set)
  - redis (cluster mode)
  - influxdb (single instance)
  - elasticsearch (3 nodes)
```

---

## Conclusion

CircularSync leverages the full power of WSO2 Ballerina's network-first programming model to create a groundbreaking circular economy platform. By utilizing Ballerina's native support for multiple protocols, built-in concurrency, and seamless integration capabilities, we've built a solution that addresses one of 2025's most critical challenges while showcasing Ballerina's unique strengths in distributed systems development.

The platform's architecture demonstrates advanced Ballerina patterns including:
- Choreographed microservices
- Real-time stream processing
- Multi-protocol integration
- Cloud-native deployment
- AI/ML integration
- Blockchain connectivity

This makes CircularSync the ideal candidate for the WSO2 Ballerina 2025 competition, combining technical excellence with real-world impact.