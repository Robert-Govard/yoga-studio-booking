import { z } from 'zod';

export const bookingSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  timeSlot: z.string().regex(/^([01]\d|2[0-3]):00$/, 'timeSlot must be HH:00'),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(6),
});

export type BookingInput = z.infer<typeof bookingSchema>;
