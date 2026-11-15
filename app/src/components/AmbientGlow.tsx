import { useEffect, useRef } from 'react';

const HORIZONTAL_PERIOD_SECONDS = 64;
const VERTICAL_PERIOD_SECONDS = 83;

/** Keeps the ambient highlight inside the viewport without moving or blocking page content. */
export function AmbientGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let lastTime = 0;
    let elapsedSeconds = 0;
    let maxX = 0;
    let maxY = 0;

    const place = () => {
      // Cosine eases naturally through each turn; different periods avoid a repetitive diagonal.
      const x = maxX * (1 - Math.cos(elapsedSeconds * 2 * Math.PI / HORIZONTAL_PERIOD_SECONDS)) / 2;
      const y = maxY * (1 - Math.cos(elapsedSeconds * 2 * Math.PI / VERTICAL_PERIOD_SECONDS)) / 2;
      glow.style.transform = `translate3d(${-x}px, ${y}px, 0)`;
    };

    const measure = () => {
      maxX = Math.max(0, window.innerWidth - glow.offsetWidth);
      maxY = Math.max(0, window.innerHeight - glow.offsetHeight);
      if (!reducedMotion.matches) place();
    };

    const advance = (time: number) => {
      if (lastTime !== 0) {
        // A suspended tab must not make the highlight jump across the screen when resumed.
        elapsedSeconds += Math.min((time - lastTime) / 1000, 0.05);
        place();
      }
      lastTime = time;
      frame = window.requestAnimationFrame(advance);
    };

    const updateMotion = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      if (reducedMotion.matches) {
        glow.style.transform = '';
      } else if (!document.hidden) {
        measure();
        frame = window.requestAnimationFrame(advance);
      }
    };

    measure();
    updateMotion();
    window.addEventListener('resize', measure);
    document.addEventListener('visibilitychange', updateMotion);
    reducedMotion.addEventListener('change', updateMotion);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
      document.removeEventListener('visibilitychange', updateMotion);
      reducedMotion.removeEventListener('change', updateMotion);
    };
  }, []);

  return <div className="ambient-glow" aria-hidden="true" ref={glowRef} />;
}
