import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the home page with a booking link', () => {
    render(<App />);
    expect(screen.getByText(/Find your breath/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /book a class/i })).toBeInTheDocument();
  });

  it('switches the whole page to Russian when RU is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/Find your breath/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'RU' }));

    expect(screen.getByText(/Найдите своё дыхание/i)).toBeInTheDocument();
    expect(screen.queryByText(/Find your breath/i)).not.toBeInTheDocument();
  });
});
