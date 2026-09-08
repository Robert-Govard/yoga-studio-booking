export const DAILY_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00',
];

export function computeOpenSlots(bookedSlots: string[]): string[] {
  return DAILY_SLOTS.filter((slot) => !bookedSlots.includes(slot));
}
