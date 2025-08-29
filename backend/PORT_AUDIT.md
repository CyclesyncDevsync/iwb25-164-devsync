# Backend Services Port Allocation

## Current Port Assignments (After Fix)

| Port | Service | File | Status |
|------|---------|------|--------|
| 8080 | Main API Server | main.bal:19 | ✅ Active |
| 8084 | Demand Prediction | modules/demand_prediction/demand_prediction_service.bal:12 | ✅ Active |
| 8082 | Quality Assessment | modules/quality_assessment/quality_assessment_service.bal:11 | ✅ Active |
| 8083 | Chatbot WebSocket | modules/chatbot/chatbot_service.bal:26 | ✅ Fixed |
| 8089 | Chatbot Health Check | modules/chatbot/chatbot_service.bal:413 | ✅ Active |
| 8085 | Dynamic Pricing | modules/dynamic_pricing/dynamic_pricing_service.bal:14 | ✅ Active |
| 8086 | Material Workflow | modules/material_workflow/material_workflow_service.bal:12 | ✅ Active |
| 8087 | Agent Assignment | modules/agent_assignment/agent_api.bal:11 | ✅ Active |

## Database Ports
| Port | Service | File | Status |
|------|---------|------|--------|
| 5432 | PostgreSQL (Neon) | Config.toml | ✅ External |
| 6379 | Redis | Config.toml | ✅ External |

## Issues Fixed
1. ✅ **Port 8084 Conflict**: Changed `websocketPort` from 8084 to 8083 in Config.toml
2. ✅ **WebSocket Service**: Now correctly uses port 8083
3. ✅ **All Services**: Have unique port assignments

## Service Endpoints Summary
- **Main API**: http://localhost:8080
- **Demand Prediction**: http://localhost:8084/api/ai/demand  
- **Quality Assessment**: http://localhost:8082/api/ai/quality
- **Chatbot WebSocket**: ws://localhost:8083/chat
- **Dynamic Pricing**: http://localhost:8085
- **Material Workflow**: http://localhost:8086/api/material/workflow
- **Agent Assignment**: http://localhost:8087
- **Chatbot Health**: http://localhost:8089/health