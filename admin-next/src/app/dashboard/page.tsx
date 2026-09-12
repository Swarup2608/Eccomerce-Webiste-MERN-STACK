'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAdmin } from '@/context/useAdmin';
import SummaryCards, { type SummaryData } from '@/components/analytics/SummaryCards';
import RevenueChart, { type RevenuePoint } from '@/components/analytics/RevenueChart';
import StatusBreakdown, { type StatusCount } from '@/components/analytics/StatusBreakdown';
import TopProductsTable, { type TopProduct } from '@/components/analytics/TopProductsTable';

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

export default function Dashboard() {
  const { backendURL, token, currency } = useAdmin();
  const [days, setDays] = useState(30);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusCount[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    if (!token) return;
    const headers = { token };
    Promise.all([
      axios.get(backendURL + `/api/analytics/summary?days=${days}`, { headers }),
      axios.get(backendURL + `/api/analytics/revenue?days=${days}`, { headers }),
      axios.get(backendURL + `/api/analytics/orders-by-status`, { headers }),
      axios.get(backendURL + `/api/analytics/top-products?days=${days}&limit=5`, { headers }),
    ]).then(([s, r, o, p]) => {
      if (s.data.success) setSummaryData(s.data);
      if (r.data.success) setRevenue(r.data.series);
      if (o.data.success) setStatusBreakdown(o.data.breakdown);
      if (p.data.success) setTopProducts(p.data.products);
    }).catch((error) => toast.error(error.message));
  }, [token, days, backendURL]);

  return (
    <div style={{ padding: '26px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="seg" style={{ alignSelf: 'flex-start' }}>
        {RANGES.map((r) => (
          <label key={r.days} className={`seg-opt ${days === r.days ? 'on' : ''}`}>
            <input type="radio" checked={days === r.days} onChange={() => setDays(r.days)} style={{ display: 'none' }} />
            {r.label}
          </label>
        ))}
      </div>

      <SummaryCards data={summaryData} currency={currency} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 18 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 18 }}>
            Revenue over time
          </div>
          <RevenueChart series={revenue} currency={currency} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 18 }}>
            Orders by status
          </div>
          <StatusBreakdown breakdown={statusBreakdown} />
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 12 }}>
          Best sellers
        </div>
        <TopProductsTable products={topProducts} currency={currency} />
      </div>
    </div>
  );
}
