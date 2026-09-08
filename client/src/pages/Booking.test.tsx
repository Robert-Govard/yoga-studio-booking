import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Booking } from './Booking';
import * as api from '../api/client';

describe('Booking page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, 'getServices').mockResolvedValue([
      { id: 'svc-1', name: 'Vinyasa Flow', durationMinutes: 60, priceCents: 2500 },
    ]);
    vi.spyOn(api, 'getAvailability').mockResolvedValue({ openSlots: ['09:00', '10:00'] });
  });

  it('blocks submit until required fields are filled', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Booking />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByText('Vinyasa Flow'));
    await user.type(screen.getByLabelText(/date/i), '2026-10-01');
    await waitFor(() => screen.getByText('09:00'));
    await user.click(screen.getByText('09:00'));

    await user.click(screen.getByRole('button', { name: /confirm booking/i }));

    expect(screen.getByText(/please fill in your name, email, and phone/i)).toBeInTheDocument();
  });

  it('submits a booking and shows a confirmation', async () => {
    vi.spyOn(api, 'createBooking').mockResolvedValue({
      id: 'b1',
      serviceId: 'svc-1',
      service: { id: 'svc-1', name: 'Vinyasa Flow', durationMinutes: 60, priceCents: 2500 },
      date: '2026-10-01',
      timeSlot: '09:00',
      customerName: 'Jane Doe',
      customerEmail: 'jane@example.com',
      customerPhone: '5551234567',
      createdAt: new Date().toISOString(),
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Booking />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByText('Vinyasa Flow'));
    await user.type(screen.getByLabelText(/date/i), '2026-10-01');
    await waitFor(() => screen.getByText('09:00'));
    await user.click(screen.getByText('09:00'));
    await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/phone/i), '5551234567');
    await user.click(screen.getByRole('button', { name: /confirm booking/i }));

    await waitFor(() => {
      expect(screen.getByText(/you're booked/i)).toBeInTheDocument();
    });
  });
});
