import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test/renderWithProviders';
import { Services } from './Services';
import * as api from '../api/client';

describe('Services page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders services fetched from the API', async () => {
    vi.spyOn(api, 'getServices').mockResolvedValue([
      { id: '1', name: 'Vinyasa Flow', durationMinutes: 60, priceCents: 2500 },
    ]);

    renderWithProviders(<Services />);

    await waitFor(() => {
      expect(screen.getByText('Vinyasa Flow')).toBeInTheDocument();
    });
    expect(screen.getByText('$25.00')).toBeInTheDocument();
  });

  it('translates a known service name when the language is Russian', async () => {
    localStorage.setItem('language', 'ru');
    vi.spyOn(api, 'getServices').mockResolvedValue([
      { id: '1', name: 'Vinyasa Flow (60 min)', durationMinutes: 60, priceCents: 2500 },
    ]);

    renderWithProviders(<Services />);

    await waitFor(() => {
      expect(screen.getByText('Виньяса-флоу (60 мин)')).toBeInTheDocument();
    });
    expect(screen.queryByText('Vinyasa Flow (60 min)')).not.toBeInTheDocument();
  });
});
