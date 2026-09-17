'use client';

import { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react';

export default function Reveal({
  children,
  style,
  as: Tag = 'div',
}: {
  children: ReactNode;
  style?: CSSProperties;
  as?: 'div' | 'section';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Comp = Tag as any;
  return (
    <Comp ref={ref} data-reveal={visible ? 'in' : ''} style={style}>
      {children}
    </Comp>
  );
}
