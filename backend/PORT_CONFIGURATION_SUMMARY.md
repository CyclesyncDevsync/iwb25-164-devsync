# Port Configuration Summary

After resolving all port conflicts, here are the final port assignments for Cyclesync services:

## Service Port Mappings

| Service | Port | File | Status |
|---------|------|------|--------|
| Main API Server | 8080 | main.bal | ✅ Running |
| Material Workflow API | 8086 | modules/material_workflow/material_workflow_service.bal | ✅ Running |
| Auth API | 8092 | modules/auth/auth_controller.bal | ✅ Running |
| Admin Users API | 8093 | modules/auth/auth_controller.bal | ✅ Running |
| Agent Assignment API | 8091 | modules/agent_assignment/agent_api.bal | ✅ Running |
| Chatbot WebSocket | 8094 | modules/chatbot/chatbot_service.bal (configured in Config.toml) | ✅ Running |
| Chatbot Health Check | 8095 | modules/chatbot/chatbot_service.bal | ✅ Running |
| Demand Prediction API | 8084 | modules/demand_prediction/demand_prediction_service.bal | ✅ Running |
| Quality Assessment API | 8082 | modules/quality_assessment/quality_assessment_service.bal | ✅ Running |
| Dynamic Pricing API | 8085 | modules/dynamic_pricing/dynamic_pricing_service.bal | ✅ Running |
| Agent Review API | 8088 | modules/agent_review/agent_review_api.bal | ✅ Running |
| Auction API | 8087 | modules/auction/auction_api.bal | ✅ Running |

## Configuration Updates

### Config.toml Changes
- Changed `websocketPort` from 8083 to 8094 to avoid conflicts

### Code Changes
1. `auth_controller.bal`: Changed auth service port from 8087 to 8092
2. `auth_controller.bal`: Changed admin users service port from 8090 to 8093
3. `chatbot_service.bal`: Changed health check port from 8089 to 8095
4. `agent_api.bal`: Changed agent assignment port from 8087 to 8091

## Service Endpoints

- **Main API**: http://localhost:8080
- **Auth API**: http://localhost:8092/api/auth
- **Admin API**: http://localhost:8093/api/admin/users
- **Material Workflow**: http://localhost:8086/api/materials
- **Demand Prediction**: http://localhost:8084/api/ai/demand
- **Quality Assessment**: http://localhost:8082/api/ai/quality
- **Dynamic Pricing**: http://localhost:8085/api/ai/pricing
- **Agent Assignment**: http://localhost:8091/api/agent
- **Agent Review**: http://localhost:8088/api/agent-review
- **Auction**: http://localhost:8087/api/auction
- **Chatbot WebSocket**: ws://localhost:8094/chat
- **Chatbot Health**: http://localhost:8095/health

## Notes

1. All port conflicts have been resolved
2. The auth schema initialization error is a separate issue related to database module initialization order
3. All services are starting successfully except for the auth schema initialization warning

## Running the Application

```bash
cd C:\Users\User\Desktop\Cyclesync\backend
bal run
```

The application should now start without any port conflicts. The only remaining issue is the auth schema initialization which requires fixing the database module initialization order.