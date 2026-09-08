import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Services } from './Services';
import * as api from '../api/client';

describe('Services page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders services fetched from the API', async () => {
    vi.spyOn(api, 'getServices').mockResolvedValue([
      { id: '1', name: 'Vinyasa Flow', durationMinutes: 60, priceCents: 2500 },
    ]);

    render(
      <MemoryRouter>
        <Services />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Vinyasa Flow')).toBeInTheDocument();
    });
    expect(screen.getByText('$25.00')).toBeInTheDocument();
  });
});
