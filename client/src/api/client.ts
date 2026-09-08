import type { Service, Booking, BookingCreated } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function getServices(): Promise<Service[]> {
  const res = await fetch(`${API_URL}/services`);
  if (!res.ok) throw new Error('Failed to load services');
  return res.json();
}

export async function getAvailability(
  date: string,
  serviceId: string,
): Promise<{ openSlots: string[] }> {
  const res = await fetch(
    `${API_URL}/availability?date=${encodeURIComponent(date)}&serviceId=${encodeURIComponent(serviceId)}`,
  );
  if (!res.ok) throw new Error('Failed to load availability');
  return res.json();
}

export interface CreateBookingInput {
  serviceId: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export async function createBooking(input: CreateBookingInput): Promise<BookingCreated> {
  const res = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (res.status === 409) throw new Error('SLOT_TAKEN');
  if (!res.ok) throw new Error('Failed to create booking');
  return res.json();
}

export async function getAdminBookings(token: string): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/admin/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load bookings');
  return res.json();
}
