# Chat Module

This module provides real-time chat functionality between agents and suppliers.

## Features

- Create/get chat rooms between agents and suppliers
- Send and receive messages
- Mark messages as read
- Get chat history
- Support for text, image, file, location, and voice messages

## API Endpoints

### POST /api/chat/room
Create or get existing chat room

### POST /api/chat/message
Send a new message

### GET /api/chat/messages/{roomId}
Get messages for a room

### PUT /api/chat/messages/read
Mark messages as read

### GET /api/chat/rooms/agent/{agentId}
Get all chat rooms for an agent