import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the home page with a booking link', () => {
    render(<App />);
    expect(screen.getByText(/Find your breath/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /book a class/i })).toBeInTheDocument();
  });
});
