'use client';

import { useState } from 'react';

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

const HEIGHT = 180;
const BAR_GAP = 4;

export default function RevenueChart({ series, currency }: { series: RevenuePoint[]; currency: string }) {
  const [hover, setHover] = useState<{ i: number; x: number } | null>(null);
  const max = Math.max(1, ...series.map((p) => p.revenue));
  const barWidth = series.length > 0 ? 100 / series.length : 100;

  if (series.length === 0) {
    return <p className="text-muted">No revenue in this period yet.</p>;
  }

  return (
    <div className="viz-root" style={{ position: 'relative' }}>
      <svg viewBox={`0 0 100 ${HEIGHT}`} preserveAspectRatio="none" style={{ width: '100%', height: HEIGHT, display: 'block', overflow: 'visible' }}>
        <line x1={0} y1={HEIGHT - 0.5} x2={100} y2={HEIGHT - 0.5} stroke="var(--viz-grid)" strokeWidth={0.4} />
        {series.map((p, i) => {
          const h = (p.revenue / max) * (HEIGHT - 16);
          const x = i * barWidth;
          const w = Math.max(0.5, barWidth - BAR_GAP / 10);
          return (
            <rect
              key={p.date}
              x={x}
              y={HEIGHT - h}
              width={w}
              height={h}
              rx={Math.min(1.2, w / 3)}
              fill={hover?.i === i ? 'var(--color-accent-300)' : 'var(--viz-series-1)'}
              onMouseEnter={() => setHover({ i, x: x + w / 2 })}
              onMouseLeave={() => setHover((h) => (h?.i === i ? null : h))}
              style={{ cursor: 'pointer', transition: 'fill .15s ease' }}
            />
          );
        })}
      </svg>
      {hover && (
        <div
          style={{
            position: 'absolute', bottom: HEIGHT + 8, left: `${hover.x}%`, transform: 'translateX(-50%)',
            background: 'var(--color-bg)', border: '1px solid var(--color-divider)', borderRadius: 8,
            padding: '8px 12px', fontSize: 12.5, whiteSpace: 'nowrap', boxShadow: 'var(--shadow-md)', pointerEvents: 'none', zIndex: 5,
          }}
        >
          <div style={{ color: 'var(--color-neutral-400)', marginBottom: 2 }}>{series[hover.i].date}</div>
          <div style={{ font: '500 14px/1 Inter' }}>{currency}{series[hover.i].revenue}</div>
          <div style={{ color: 'var(--color-neutral-500)', fontSize: 11 }}>{series[hover.i].orders} order{series[hover.i].orders === 1 ? '' : 's'}</div>
        </div>
      )}
    </div>
  );
}
