import '@testing-library/jest-dom/vitest';
import { configureAxe } from 'vitest-axe';
import 'vitest-axe/extend-expect';

export const axe = configureAxe({
  rules: {
    // color-contrast and landmark rules require real CSS rendering which jsdom doesn't do
    'color-contrast': { enabled: false },
  },
});

// Polyfill ResizeObserver for jsdom (required by recharts ResponsiveContainer)
if (typeof ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
