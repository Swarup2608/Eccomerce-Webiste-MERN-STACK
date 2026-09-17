const SERIES_COLORS = [
  'var(--viz-series-1)', 'var(--viz-series-2)', 'var(--viz-series-3)', 'var(--viz-series-4)',
  'var(--viz-series-5)', 'var(--viz-series-6)', 'var(--viz-series-7)', 'var(--viz-series-8)',
];

export interface StatusCount {
  status: string;
  count: number;
}

export default function StatusBreakdown({ breakdown }: { breakdown: StatusCount[] }) {
  if (breakdown.length === 0) {
    return <p className="text-muted">No orders yet.</p>;
  }
  // Never cycle the categorical palette past its 8 validated slots — fold the rest into "Other".
  const shown = breakdown.length > 8
    ? [...breakdown.slice(0, 7), { status: 'Other', count: breakdown.slice(7).reduce((s, b) => s + b.count, 0) }]
    : breakdown;
  const max = Math.max(1, ...shown.map((b) => b.count));

  return (
    <div className="viz-root" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {shown.map((b, i) => (
        <div key={b.status} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 34px', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12.5, color: 'var(--color-neutral-300)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {b.status}
          </span>
          <div style={{ height: 8, background: 'var(--color-divider)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${(b.count / max) * 100}%`, height: '100%', background: SERIES_COLORS[i % SERIES_COLORS.length], borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: 12.5, color: 'var(--color-neutral-400)', textAlign: 'right' }}>{b.count}</span>
        </div>
      ))}
    </div>
  );
}
