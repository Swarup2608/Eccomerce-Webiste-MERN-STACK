export interface SummaryData {
  revenue: number;
  orderCount: number;
  aov: number;
  newCustomers: number;
}

export default function SummaryCards({ data, currency }: { data: SummaryData | null; currency: string }) {
  const tiles = [
    { label: 'Revenue', value: data ? `${currency}${data.revenue}` : '—' },
    { label: 'Orders', value: data ? data.orderCount : '—' },
    { label: 'Average order value', value: data ? `${currency}${data.aov}` : '—' },
    { label: 'New customers', value: data ? data.newCustomers : '—' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
      {tiles.map((t) => (
        <div key={t.label} className="card stat-tile">
          <div className="stat-tile-value">{t.value}</div>
          <div className="stat-tile-label">{t.label}</div>
        </div>
      ))}
    </div>
  );
}
