import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App.jsx';

beforeEach(() => {
  // Mock fetch to return empty/null for data files
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: () => Promise.resolve(null),
  });
});

describe('App smoke test', () => {
  it('renders tab buttons', async () => {
    render(<App />);
    // Nav buttons appear multiple times (sidebar + mobile nav); use getAllByText
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Thesis').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Value Chain').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Signals').length).toBeGreaterThan(0);
  });

  it('renders the header', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeTruthy();
  });
});
