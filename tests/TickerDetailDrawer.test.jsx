import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TickerDetailDrawer from '../src/components/TickerDetailDrawer.jsx';

const mockData = { n: 'Test Corp', p: 100, c: 'USD', ch: 5.2, rb: 72, ex: 30, l: 1, ti: 'Core', se: 'Test' };

describe('TickerDetailDrawer', () => {
  it('renders nothing when ticker is null', () => {
    const { container } = render(
      <TickerDetailDrawer ticker={null} data={null} ohlc={null} closes30={null} onClose={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows fallback when ohlc is empty', () => {
    render(
      <TickerDetailDrawer ticker="TST" data={mockData} ohlc={[]} closes30={null} onClose={() => {}} />,
    );
    expect(screen.getByText(/No OHLC data yet/)).toBeTruthy();
  });

  it('shows fallback when ohlc is null', () => {
    render(
      <TickerDetailDrawer ticker="TST" data={mockData} ohlc={null} closes30={null} onClose={() => {}} />,
    );
    expect(screen.getByText(/No OHLC data yet/)).toBeTruthy();
  });

  it('renders ticker name and KPIs when data provided', () => {
    render(
      <TickerDetailDrawer ticker="TST" data={mockData} ohlc={null} closes30={null} onClose={() => {}} />,
    );
    expect(screen.getByText('TST')).toBeTruthy();
    expect(screen.getByText('Test Corp')).toBeTruthy();
  });
});
