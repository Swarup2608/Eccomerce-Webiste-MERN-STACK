export default function AmbientGrid() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: '-10%', right: '-10%', bottom: -70, height: 340, perspective: 520, perspectiveOrigin: '50% 0%' }}>
        <div
          style={{
            position: 'absolute', inset: 0, transform: 'rotateX(74deg)', transformOrigin: '50% 0%',
            backgroundImage:
              'linear-gradient(to right,color-mix(in srgb,var(--color-accent) 26%,transparent) 1px,transparent 1px),' +
              'linear-gradient(to bottom,color-mix(in srgb,var(--color-accent) 20%,transparent) 1px,transparent 1px)',
            backgroundSize: '64px 64px',
            animation: 'ec-drift 5.5s linear infinite',
            maskImage: 'linear-gradient(to bottom,rgba(0,0,0,.85),transparent 72%)',
            WebkitMaskImage: 'linear-gradient(to bottom,rgba(0,0,0,.85),transparent 72%)',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute', left: '50%', top: '34%', width: 680, height: 420, marginLeft: -340,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side,color-mix(in srgb,var(--color-accent) 16%,transparent),transparent)',
          filter: 'blur(8px)', animation: 'ec-float 9s ease-in-out infinite',
        }}
      />
    </div>
  );
}
