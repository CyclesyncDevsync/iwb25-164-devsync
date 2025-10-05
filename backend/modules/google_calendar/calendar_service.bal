// Google Calendar Service for Cyclesync
// Handles Events, Tasks, and Appointments using official googleapis.gcalendar connector

import ballerina/log;
import ballerina/time;
import ballerinax/googleapis.gcalendar as gcalendar;

// Configuration - Using OAuth2 Refresh Token
configurable string clientId = ?;
configurable string clientSecret = ?;
configurable string refreshToken = ?;
configurable string calendarId = ?;

const string REFRESH_URL = "https://oauth2.googleapis.com/token";

// Calendar client
gcalendar:Client? calendarClient = ();

// Initialize calendar service
function init() returns error? {
    log:printInfo("Initializing Google Calendar service with OAuth2...");

    // Create calendar client with OAuth2 config
    gcalendar:Client calendar = check new({
        auth: {
            clientId: clientId,
            clientSecret: clientSecret,
            refreshToken: refreshToken,
            refreshUrl: REFRESH_URL
        }
    });

    calendarClient = calendar;

    log:printInfo("✅ Google Calendar service initialized successfully");
}

// ==================== EVENT OPERATIONS ====================

// Create an event (e.g., Order Delivery, Auction End)
public function createEvent(
    string summary,
    string description,
    time:Civil startTime,
    time:Civil endTime,
    string? location = (),
    string[]? attendees = ()
) returns string|error {

    gcalendar:Client calClient = check getClient();

    log:printInfo(string `Creating EVENT: ${summary}`);

    // Format times to RFC3339
    string startTimeStr = formatToRFC3339(startTime);
    string endTimeStr = formatToRFC3339(endTime);

    // Build event object
    gcalendar:Event eventData = {
        summary: summary,
        description: description,
        location: location ?: "",
        'start: {
            dateTime: startTimeStr,
            timeZone: "Asia/Colombo"
        },
        end: {
            dateTime: endTimeStr,
            timeZone: "Asia/Colombo"
        },
        colorId: "9", // Blue for events
        reminders: {
            useDefault: false,
            overrides: [
                {method: "email", minutes: 1440},
                {method: "popup", minutes: 60}
            ]
        }
    };

    // Add attendees if provided
    if attendees is string[] && attendees.length() > 0 {
        gcalendar:EventAttendee[] attendeeList = [];
        foreach string email in attendees {
            attendeeList.push({email: email});
        }
        eventData.attendees = attendeeList;
    }

    // Create the event
    gcalendar:Event createdEvent = check calClient->/calendars/[calendarId]/events.post(eventData);

    string eventId = createdEvent.id ?: "";
    log:printInfo(string `✅ Event created with ID: ${eventId}`);

    return eventId;
}

// ==================== TASK OPERATIONS ====================

// Create a task (e.g., Prepare Materials, Pack Order)
public function createTask(
    string summary,
    string description,
    time:Civil dueTime,
    string? location = ()
) returns string|error {

    gcalendar:Client calClient = check getClient();

    log:printInfo(string `Creating TASK: ${summary}`);

    string dueDateStr = formatToRFC3339Date(dueTime);

    // Create task as all-day event
    gcalendar:Event taskData = {
        summary: string `[TASK] ${summary}`,
        description: string `📋 TASK\n\n${description}`,
        location: location ?: "",
        'start: {
            date: dueDateStr,
            timeZone: "Asia/Colombo"
        },
        end: {
            date: dueDateStr,
            timeZone: "Asia/Colombo"
        },
        colorId: "5", // Yellow for tasks
        reminders: {
            useDefault: false,
            overrides: [
                {method: "email", minutes: 1440},
                {method: "popup", minutes: 480}
            ]
        }
    };

    gcalendar:Event createdTask = check calClient->/calendars/[calendarId]/events.post(taskData);

    string taskId = createdTask.id ?: "";
    log:printInfo(string `✅ Task created with ID: ${taskId}`);

    return taskId;
}

// ==================== APPOINTMENT OPERATIONS ====================

// Create an appointment (e.g., Pickup Schedule, Delivery Appointment)
public function createAppointment(
    string summary,
    string description,
    time:Civil startTime,
    time:Civil endTime,
    string location,
    string[] attendees
) returns string|error {

    gcalendar:Client calClient = check getClient();

    log:printInfo(string `Creating APPOINTMENT: ${summary}`);

    // Format times
    string startTimeStr = formatToRFC3339(startTime);
    string endTimeStr = formatToRFC3339(endTime);

    // Create attendee list
    gcalendar:EventAttendee[] attendeeList = [];
    foreach string email in attendees {
        attendeeList.push({
            email: email,
            responseStatus: "needsAction"
        });
    }

    // Create appointment
    gcalendar:Event appointmentData = {
        summary: string `[APPOINTMENT] ${summary}`,
        description: string `📅 APPOINTMENT\n\n${description}`,
        location: location,
        'start: {
            dateTime: startTimeStr,
            timeZone: "Asia/Colombo"
        },
        end: {
            dateTime: endTimeStr,
            timeZone: "Asia/Colombo"
        },
        attendees: attendeeList,
        colorId: "10", // Green for appointments
        guestsCanModify: false,
        guestsCanInviteOthers: false,
        guestsCanSeeOtherGuests: true,
        reminders: {
            useDefault: false,
            overrides: [
                {method: "email", minutes: 1440},
                {method: "email", minutes: 60},
                {method: "popup", minutes: 15}
            ]
        }
    };

    gcalendar:Event createdAppointment = check calClient->/calendars/[calendarId]/events.post(appointmentData, sendUpdates = "all");

    string appointmentId = createdAppointment.id ?: "";
    log:printInfo(string `✅ Appointment created with ID: ${appointmentId}`);

    return appointmentId;
}

// ==================== UPDATE OPERATIONS ====================

// Update any calendar item (event/task/appointment)
public function updateCalendarItem(
    string itemId,
    string? summary = (),
    string? description = (),
    time:Civil? startTime = (),
    time:Civil? endTime = ()
) returns error? {

    gcalendar:Client calClient = check getClient();

    log:printInfo(string `Updating calendar item: ${itemId}`);

    // Get existing event
    gcalendar:Event existingEvent = check calClient->/calendars/[calendarId]/events/[itemId].get();

    // Update fields
    if summary is string {
        existingEvent.summary = summary;
    }

    if description is string {
        existingEvent.description = description;
    }

    if startTime is time:Civil {
        string startTimeStr = formatToRFC3339(startTime);
        existingEvent.'start = {
            dateTime: startTimeStr,
            timeZone: "Asia/Colombo"
        };
    }

    if endTime is time:Civil {
        string endTimeStr = formatToRFC3339(endTime);
        existingEvent.end = {
            dateTime: endTimeStr,
            timeZone: "Asia/Colombo"
        };
    }

    // Update the event
    _ = check calClient->/calendars/[calendarId]/events/[itemId].put(existingEvent);

    log:printInfo(string `✅ Calendar item updated: ${itemId}`);
}

// ==================== DELETE OPERATIONS ====================

// Delete calendar item
public function deleteCalendarItem(string itemId) returns error? {
    gcalendar:Client calClient = check getClient();

    log:printInfo(string `Deleting calendar item: ${itemId}`);

    _ = check calClient->/calendars/[calendarId]/events/[itemId].delete();

    log:printInfo(string `✅ Calendar item deleted: ${itemId}`);
}

// ==================== QUERY OPERATIONS ====================

// Get upcoming calendar items
public function getUpcomingItems(int maxResults = 20) returns json|error {
    gcalendar:Client calClient = check getClient();

    // Get current time
    time:Utc now = time:utcNow();
    time:Civil nowCivil = time:utcToCivil(now);
    string timeMin = formatToRFC3339(nowCivil);

    // Query upcoming events
    gcalendar:Events events = check calClient->/calendars/[calendarId]/events.get(
        timeMin = timeMin,
        maxResults = maxResults,
        orderBy = "startTime",
        singleEvents = true
    );

    return events.toJson();
}

// ==================== HELPER FUNCTIONS ====================

// Get calendar client
function getClient() returns gcalendar:Client|error {
    gcalendar:Client? calClient = calendarClient;
    if calClient is () {
        return error("Calendar client not initialized. Call init() first.");
    }
    return calClient;
}

// Format time:Civil to RFC3339 datetime string
function formatToRFC3339(time:Civil civilTime) returns string {
    string year = civilTime.year.toString();
    string month = civilTime.month < 10 ? string `0${civilTime.month}` : civilTime.month.toString();
    string day = civilTime.day < 10 ? string `0${civilTime.day}` : civilTime.day.toString();

    int hour = civilTime.hour is int ? civilTime.hour : 0;
    int minute = civilTime.minute is int ? civilTime.minute : 0;
    time:Seconds? secondOpt = civilTime.second;
    decimal second = secondOpt is decimal ? secondOpt : 0.0d;

    string hourStr = hour < 10 ? string `0${hour}` : hour.toString();
    string minuteStr = minute < 10 ? string `0${minute}` : minute.toString();
    string secondStr = second < 10.0d ? string `0${<int>second}` : (<int>second).toString();

    return string `${year}-${month}-${day}T${hourStr}:${minuteStr}:${secondStr}+05:30`;
}

// Format time:Civil to RFC3339 date string (for all-day events/tasks)
function formatToRFC3339Date(time:Civil civilTime) returns string {
    string year = civilTime.year.toString();
    string month = civilTime.month < 10 ? string `0${civilTime.month}` : civilTime.month.toString();
    string day = civilTime.day < 10 ? string `0${civilTime.day}` : civilTime.day.toString();

    return string `${year}-${month}-${day}`;
}
