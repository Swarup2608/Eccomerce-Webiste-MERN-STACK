'use client';

const PLATES = [
  'linear-gradient(140deg,#2b2741,#292b31 58%,#3f424d)',
  'linear-gradient(205deg,#292b31,#423a6a)',
  'radial-gradient(120% 90% at 25% 15%,#3f424d,#292b31 72%)',
  'linear-gradient(60deg,#2b2741,#4a4e60)',
  'radial-gradient(110% 100% at 78% 18%,#423a6a,#1b1d2c 76%)',
];

function plateFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PLATES[hash % PLATES.length];
}

export default function ProductThumb({
  image,
  name,
  aspect = '1 / 1',
}: {
  image?: string;
  name: string;
  aspect?: string;
}) {
  return (
    <div
      className="plate"
      style={{ aspectRatio: aspect, background: image ? undefined : plateFor(name) }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ font: '500 15px/1 Inter', color: 'var(--color-neutral-600)' }}>{name}</span>
      )}
    </div>
  );
}
