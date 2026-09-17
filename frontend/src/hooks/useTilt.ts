'use client';

import { useRef } from 'react';

export function useTilt(maxDeg = 7) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${(-py * maxDeg).toFixed(2)}deg) rotateY(${(px * maxDeg).toFixed(2)}deg)`;
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = '';
  };

  return { ref, onMouseMove, onMouseLeave };
}
