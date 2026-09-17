import Reveal from '@/components/Reveal';

const BLOCKS = [
  { k: 'The bench', t: 'A repair counter first', d: 'We started fixing things before we ever sold them, and every listing still passes through people who repair for a living.' },
  { k: 'The label', t: 'Materials, not marketing', d: 'Every product page carries its material composition, repairability rating and shipped footprint — no exceptions.' },
  { k: 'The network', t: '1,200+ audited makers', d: 'We visit the workshop before we list the product, and we keep visiting after.' },
];
const STATS = [
  ['2019', 'Founded as a repair counter'],
  ['1,200+', 'Audited makers'],
  ['9.1 / 10', 'Average repair rating'],
  ['60 days', 'Return window'],
];

export default function About() {
  return (
    <main className="container" style={{ padding: '56px 26px 80px' }}>
      <h6 style={{ color: 'var(--color-accent-300)', marginBottom: 12 }}>About us</h6>
      <h2 style={{ fontSize: 40, letterSpacing: '-.03em', margin: '0 0 18px', maxWidth: '22ch' }}>
        We started as a repair shop, not a store.
      </h2>
      <p style={{ fontSize: 17, color: 'var(--color-neutral-300)', maxWidth: '62ch' }}>
        EcoCart began in 2019 as a two-bench repair counter. People kept asking where to buy things that were worth repairing in the first place, so we started stocking them — and publishing what we learned about each one.
      </p>
      <Reveal style={{ margin: '44px 0', height: 280, borderRadius: 'var(--radius-md)', background: 'linear-gradient(120deg,#2b2741,#292b31 55%,#3f424d)', display: 'grid', placeItems: 'center' }}>
        <span style={{ font: '500 72px/1 Inter', color: 'color-mix(in srgb,var(--color-neutral-100) 7%,transparent)', letterSpacing: '-.04em' }}>EcoCart</span>
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 26 }}>
        {BLOCKS.map((b) => (
          <Reveal key={b.k}>
            <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-300)', marginBottom: 10 }}>{b.k}</div>
            <div style={{ font: '500 19px/1.25 Inter', marginBottom: 8 }}>{b.t}</div>
            <p style={{ fontSize: 14, color: 'var(--color-neutral-400)', margin: 0 }}>{b.d}</p>
          </Reveal>
        ))}
      </div>
      <div className="hr" style={{ margin: '56px 0' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 24 }}>
        {STATS.map(([n, l]) => (
          <div key={l}>
            <div style={{ font: '500 32px/1 Inter', letterSpacing: '-.025em', color: 'var(--color-accent-300)' }}>{n}</div>
            <div style={{ fontSize: 13, color: 'var(--color-neutral-500)', marginTop: 7 }}>{l}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
