# SMS Module

This module handles SMS functionality for the Cyclesync application.

## Features
- SMS sending capabilities
- SMS templates management
- SMS delivery tracking
- SMS provider integration
- Bulk SMS operations

## Components
- **SMSController**: HTTP endpoints for SMS operations
- **SMSService**: Business logic for SMS management
- **SMSTypes**: Type definitions for SMS operations

## Usage
```ballerina
import hp/Cyclesync.sms;

SMSService smsService = new();
SMSResult result = smsService.sendSMS(phoneNumber, message);
```
