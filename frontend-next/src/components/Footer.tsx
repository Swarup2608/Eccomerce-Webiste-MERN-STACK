'use client';

const FOOTER_COLS = [
  { h: 'Shop', items: ['Apparel', 'Home', 'Skincare', 'Electronics'] },
  { h: 'Company', items: ['About us', 'Our makers', 'Careers', 'Press'] },
  { h: 'Support', items: ['Contact us', 'Shipping', 'Returns', 'Track order'] },
];

export default function Footer() {
  return (
    <footer style={{ marginTop: 40, padding: '52px 26px 34px', boxShadow: '0 -1px 0 var(--color-divider)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 30 }}>
        <div>
          <div style={{ font: '500 19px/1 Inter', marginBottom: 12 }}>EcoCart</div>
          <p style={{ fontSize: 13, color: 'var(--color-neutral-500)', maxWidth: '30ch' }}>
            A marketplace for things built to be kept. Carbon-labelled, repair-rated, maker-audited.
          </p>
        </div>
        {FOOTER_COLS.map((f) => (
          <div key={f.h}>
            <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 12 }}>
              {f.h}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {f.items.map((i) => (
                <span key={i} style={{ fontSize: 13, color: 'var(--color-neutral-300)' }}>{i}</span>
              ))}
            </div>
          </div>
        ))}
        <div>
          <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 12 }}>
            The Repair Letter
          </div>
          <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: 8 }}>
            <input className="input" placeholder="you@example.com" />
            <button type="submit" className="btn btn-primary" style={{ flex: 'none' }}>Join</button>
          </form>
        </div>
      </div>
      <div className="container" style={{ marginTop: 34, fontSize: 12, color: 'var(--color-neutral-600)' }}>
        © {new Date().getFullYear()} EcoCart · All rights reserved
      </div>
    </footer>
  );
}
