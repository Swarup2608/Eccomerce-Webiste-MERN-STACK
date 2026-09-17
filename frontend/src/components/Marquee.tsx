const ITEMS = [
  'Repair-rated', 'Carbon-labelled', 'Maker-audited', 'Undyed merino',
  'FSC-certified', 'Vitrified stoneware', 'European flax', 'Steam-bent ash',
];

export default function Marquee() {
  return (
    <div style={{ overflow: 'hidden', padding: '26px 0', marginTop: 34, boxShadow: '0 1px 0 var(--color-divider),0 -1px 0 var(--color-divider)' }}>
      <div style={{ display: 'flex', width: '200%', animation: 'ec-marquee 34s linear infinite' }}>
        {[0, 1].map((track) => (
          <div key={track} style={{ display: 'flex', gap: 52, width: '50%', flex: 'none', alignItems: 'center' }}>
            {ITEMS.map((t, i) => (
              <span key={i} style={{ font: '500 13px/1 Inter', letterSpacing: '.13em', textTransform: 'uppercase', color: 'var(--color-neutral-600)', whiteSpace: 'nowrap' }}>
                {t}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
