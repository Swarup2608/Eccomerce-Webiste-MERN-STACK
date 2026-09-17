'use client';

const CONTACT_BLOCKS = [
  { k: 'Our store', v: '54709 Willims Station, Suite 350', note: 'Washington' },
  { k: 'Phone', v: '(515) 555-0123', note: 'Mon–Fri, 9am–6pm' },
  { k: 'Email', v: 'admin@ecocart.co', note: 'We reply within one business day' },
];

export default function Contact() {
  return (
    <main className="container" style={{ padding: '56px 26px 80px' }}>
      <h6 style={{ color: 'var(--color-accent-300)', marginBottom: 12 }}>Contact us</h6>
      <h2 style={{ letterSpacing: '-.03em', margin: '0 0 34px', maxWidth: '24ch' }}>
        Talk to a person who has held the product.
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,.85fr)', gap: 44, alignItems: 'start' }} className="collections-grid">
        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="field"><label>Name</label><input className="input" placeholder="Priya Raman" /></div>
            <div className="field"><label>Email</label><input className="input" placeholder="you@example.com" /></div>
          </div>
          <div className="field"><label>Order number (optional)</label><input className="input" placeholder="EC-4821" /></div>
          <div className="field"><label>How can we help?</label><textarea className="input" placeholder="Tell us what happened, and what you would like us to do." /></div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 18px' }}>Send message</button>
        </form>
        <div>
          {CONTACT_BLOCKS.map((c) => (
            <div key={c.k} style={{ padding: '18px 0', boxShadow: '0 1px 0 var(--color-divider)' }}>
              <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 7 }}>{c.k}</div>
              <div style={{ fontSize: 14.5 }}>{c.v}</div>
              <div style={{ fontSize: 12.5, color: 'var(--color-neutral-500)', marginTop: 4 }}>{c.note}</div>
            </div>
          ))}
          <div style={{ marginTop: 22, height: 160, borderRadius: 'var(--radius-md)', background: 'linear-gradient(140deg,#232532,#2b2741)', display: 'grid', placeItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>Workshop · Bengaluru 560095</span>
          </div>
        </div>
      </div>
    </main>
  );
}
