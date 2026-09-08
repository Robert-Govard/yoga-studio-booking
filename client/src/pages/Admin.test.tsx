import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Admin } from './Admin';
import * as api from '../api/client';

describe('Admin page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not fetch bookings before a token is entered', () => {
    const spy = vi.spyOn(api, 'getAdminBookings');
    render(<Admin />);
    expect(spy).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/admin token/i)).toBeInTheDocument();
  });

  it('fetches and displays bookings once a token is submitted', async () => {
    vi.spyOn(api, 'getAdminBookings').mockResolvedValue([
      {
        id: 'b1',
        serviceId: 'svc-1',
        service: { id: 'svc-1', name: 'Vinyasa Flow', durationMinutes: 60, priceCents: 2500 },
        date: '2026-10-01',
        timeSlot: '09:00',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        customerPhone: '5551234567',
        createdAt: new Date().toISOString(),
      },
    ]);

    const user = userEvent.setup();
    render(<Admin />);

    await user.type(screen.getByLabelText(/admin token/i), 'secret-token');
    await user.click(screen.getByRole('button', { name: /view bookings/i }));

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
    expect(screen.getByText('Vinyasa Flow')).toBeInTheDocument();
  });
});
