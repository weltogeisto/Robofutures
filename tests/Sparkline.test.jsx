import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Sparkline from '../src/components/Sparkline.jsx';

describe('Sparkline', () => {
  it('renders nothing for empty input', () => {
    const { container } = render(<Sparkline data={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing for undefined input', () => {
    const { container } = render(<Sparkline data={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a chart for N data points', () => {
    const data = [10, 20, 15, 25, 30];
    const { container } = render(<Sparkline data={data} />);
    // Recharts renders into a div wrapper
    expect(container.firstChild).not.toBeNull();
  });

  it('accepts a custom color', () => {
    const data = [1, 2, 3];
    const { container } = render(<Sparkline data={data} color="#ff0000" />);
    expect(container.firstChild).not.toBeNull();
  });
});
