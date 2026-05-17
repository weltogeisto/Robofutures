import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

/**
 * Minimal sparkline chart. No axes, no grid, no tooltip.
 * Stroke color is green when last > first, red otherwise.
 *
 * @param {{ data: number[], color?: string, height?: number }} props
 * @returns {React.ReactElement|null}
 */
const Sparkline = ({ data, color, height = 24 }) => {
  if (!data || data.length === 0) return null;

  const autoColor = color ?? (data[data.length - 1] >= data[0] ? 'var(--green, #10b981)' : 'var(--red, #ef4444)');
  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <ResponsiveContainer width={80} height={height}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line type="monotone" dataKey="v" stroke={autoColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Sparkline;
