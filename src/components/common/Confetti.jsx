import React, { useMemo } from 'react';

const COLORS = ['#fde047', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'];
const COUNT = 60;

// One-shot confetti burst. Remount (change `key`) to fire it again.
// Particles are generated once per mount so re-renders don't restart them.
// `contained`: burst from the centre of the nearest positioned parent
// (e.g. the coupon banner) instead of the middle of the screen.
const Confetti = ({ contained = false }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const angle = (i / COUNT) * Math.PI * 2 + Math.random() * 0.3;
        const distance = 120 + Math.random() * 160;
        return {
          x: Math.round(Math.cos(angle) * distance),
          y: Math.round(Math.sin(angle) * distance),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          delay: Math.round(Math.random() * 250),
          duration: Math.round(700 + Math.random() * 500),
          size: Math.round(5 + Math.random() * 6),
          rot: Math.round(Math.random() * 720),
          square: Math.random() > 0.5,
        };
      }),
    [],
  );

  return (
    <div className={`confetti-root${contained ? ' contained' : ''}`} aria-hidden='true'>
      {particles.map((p, i) => (
        <span
          key={i}
          className='confetti-piece'
          style={{
            width: `${p.size}px`,
            height: `${p.square ? p.size : p.size * 0.5}px`,
            backgroundColor: p.color,
            borderRadius: p.square ? '2px' : '9999px',
            '--tx': `${p.x}px`,
            '--ty': `${p.y}px`,
            '--r': `${p.rot}deg`,
            animationDuration: `${p.duration}ms`,
            animationDelay: `${p.delay}ms`,
          }}
        />
      ))}
      <style jsx>{`
        .confetti-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
          overflow: hidden;
        }
        /* Centred on the parent, taller than it so pieces can fly out, and
           never wider than the screen so phones don't get a sideways scroll. */
        .confetti-root.contained {
          position: absolute;
          inset: auto;
          top: -220px;
          bottom: -220px;
          left: 50%;
          width: calc(100vw - 24px);
          max-width: 720px;
          transform: translateX(-50%);
          z-index: 20;
        }
        .confetti-root.contained .confetti-piece {
          top: 50%;
        }
        .confetti-piece {
          position: absolute;
          left: 50%;
          top: 45%;
          opacity: 0;
          transform: translate(-50%, -50%);
          animation-name: confetti-burst;
          animation-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
          animation-fill-mode: forwards;
        }
        @keyframes confetti-burst {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(0, 0) rotate(0deg);
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(var(--tx), calc(var(--ty) + 80px)) rotate(var(--r));
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .confetti-root {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Confetti;
