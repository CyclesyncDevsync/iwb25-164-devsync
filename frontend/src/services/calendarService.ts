// Calendar Service for Google Calendar Integration
// Connects to Ballerina backend calendar API

const CALENDAR_API_URL = 'http://localhost:8100/api/calendar';

export interface CalendarEvent {
  summary: string;
  description: string;
  startTime: string; // Format: "2025-10-07T10:00:00"
  endTime: string;
  location?: string;
  attendees?: string[];
}

export interface CalendarTask {
  summary: string;
  description: string;
  dueDate: string; // Format: "2025-10-08T00:00:00"
  location?: string;
}

export interface CalendarAppointment {
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  attendees: string[];
}

export interface CalendarResponse {
  status: string;
  message: string;
  eventId?: string;
  taskId?: string;
  appointmentId?: string;
}

/**
 * Create a calendar event (e.g., Order Delivery, Auction End)
 */
export async function createCalendarEvent(event: CalendarEvent): Promise<CalendarResponse> {
  try {
    console.log('Attempting to connect to:', `${CALENDAR_API_URL}/event`);
    console.log('Event payload:', event);

    const response = await fetch(`${CALENDAR_API_URL}/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
      mode: 'cors', // Explicitly set CORS mode
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to create calendar event: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Success response:', result);
    return result;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to calendar service. Please ensure the backend is running on port 8100.');
    }
    throw error;
  }
}

/**
 * Create a calendar task (e.g., Prepare Materials, Pack Order)
 */
export async function createCalendarTask(task: CalendarTask): Promise<CalendarResponse> {
  try {
    const response = await fetch(`${CALENDAR_API_URL}/task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error(`Failed to create calendar task: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating calendar task:', error);
    throw error;
  }
}

/**
 * Create a calendar appointment (e.g., Pickup Schedule, Delivery Appointment)
 */
export async function createCalendarAppointment(appointment: CalendarAppointment): Promise<CalendarResponse> {
  try {
    const response = await fetch(`${CALENDAR_API_URL}/appointment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointment),
    });

    if (!response.ok) {
      throw new Error(`Failed to create calendar appointment: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating calendar appointment:', error);
    throw error;
  }
}

/**
 * Helper function to format Date to required string format
 */
export function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Helper function to create delivery event from order
 */
export function createDeliveryEventFromOrder(order: {
  orderNumber: string;
  title: string;
  expectedDelivery: string | Date;
  supplier?: { address?: string; name?: string };
  quantity?: number;
  unit?: string;
}): CalendarEvent {
  const deliveryDate = typeof order.expectedDelivery === 'string'
    ? new Date(order.expectedDelivery)
    : order.expectedDelivery;

  const startTime = new Date(deliveryDate);
  const endTime = new Date(deliveryDate.getTime() + 60 * 60 * 1000); // 1 hour later

  return {
    summary: `Delivery: ${order.title}`,
    description: `Order #${order.orderNumber}\nQuantity: ${order.quantity || 'N/A'} ${order.unit || ''}\nSupplier: ${order.supplier?.name || 'Unknown'}`,
    startTime: formatDateTime(startTime),
    endTime: formatDateTime(endTime),
    location: order.supplier?.address || ''
  };
}

/**
 * Helper function to create pickup appointment from order
 */
export function createPickupAppointmentFromOrder(order: any): CalendarAppointment {
  const pickupDate = order.expectedPickupDate || new Date();
  const startTime = new Date(pickupDate);
  startTime.setHours(10, 0, 0, 0); // Default 10:00 AM
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour

  const attendees: string[] = [];
  if (order.buyerEmail) attendees.push(order.buyerEmail);

  // Get material title from nested material object or direct title property
  const materialTitle = order.material?.title || order.title || 'Material Pickup';

  // Get location details
  const locationAddress = order.pickupLocation?.address ||
                         `${order.pickupLocation?.city || ''}, ${order.pickupLocation?.district || ''}`.trim() ||
                         'Location TBD';

  return {
    summary: `Material Pickup: ${materialTitle}`,
    description: `Order #${order.orderNumber}\nQuantity: ${order.quantity || 'N/A'}\nAgent: ${order.agentName || 'TBD'}`,
    startTime: formatDateTime(startTime),
    endTime: formatDateTime(endTime),
    location: locationAddress,
    attendees
  };
}
