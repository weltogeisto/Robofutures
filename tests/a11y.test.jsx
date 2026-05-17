import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from './setup.js';
import App from '../src/App.jsx';

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: () => Promise.resolve(null),
  });
});

describe('App accessibility', () => {
  it('has no serious axe violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    // Filter to only serious/critical violations
    const serious = (results.violations || []).filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(serious, `Serious a11y violations: ${serious.map((v) => v.id).join(', ')}`).toHaveLength(0);
  });
});
