import { z } from 'zod';
import { DAILY_SLOTS } from '../lib/availability';

export const bookingSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  timeSlot: z.enum(DAILY_SLOTS as unknown as [string, ...string[]]),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(6),
});

export type BookingInput = z.infer<typeof bookingSchema>;
