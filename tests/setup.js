import '@testing-library/jest-dom/vitest';

// Polyfill ResizeObserver for jsdom (required by recharts ResponsiveContainer)
if (typeof ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
