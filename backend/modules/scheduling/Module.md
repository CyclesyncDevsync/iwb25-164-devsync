# Scheduling Module

This module handles the scheduling functionality for material pickups and dropoffs in the Cyclesync system.

## Features

- Schedule pickups for agent visits
- Schedule dropoffs at warehouses
- Generate confirmation codes
- Track schedule status
- Retrieve scheduled tasks for agents and suppliers

## Endpoints

- `POST /api/scheduling/pickup` - Schedule a pickup
- `POST /api/scheduling/dropoff` - Schedule a dropoff
- `GET /api/scheduling/pickups/agent/{agentId}` - Get pickups for an agent
- `GET /api/scheduling/dropoffs/supplier/{supplierId}` - Get dropoffs for a supplier
- `PUT /api/scheduling/{scheduleType}/{scheduleId}/status` - Update schedule status