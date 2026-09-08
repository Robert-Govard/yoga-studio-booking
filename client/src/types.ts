export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
}

// What POST /bookings actually returns: scalar fields only, no relation.
export interface BookingCreated {
  id: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
}

// What GET /admin/bookings returns: the same fields plus the included Service relation.
export interface Booking extends BookingCreated {
  service: Service;
}
