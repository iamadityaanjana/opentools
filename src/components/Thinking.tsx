import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/** ChatGPT-style bouncing dots. */
export function DotsThinking({ label }: { label?: string }) {
  return (
    <span className="thinking">
      {label && <span className="thinking__label">{label}</span>}
      <span className="thinking__dots">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="thinking__dot"
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
          />
        ))}
      </span>
    </span>
  );
}

/** ASCII/braille spinner — the retro "working" cursor. */
const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function AsciiSpinner({ label }: { label?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % FRAMES.length), 80);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="ascii-spin">
      <span className="ascii-spin__glyph">{FRAMES[i]}</span>
      {label && <span>{label}</span>}
    </span>
  );
}

/** Blinking block cursor, like a terminal. */
export function BlinkingCursor() {
  return (
    <motion.span
      className="cursor-block"
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
    />
  );
}
