// src/components/AnimatedCell.tsx
import { useEffect, useState, useId } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCellProps {
  value: string | number;
  cellKey?: string;
  className?: string;
}

// Use window object to persist cache across module reloads (works in production)
const getCache = (): Map<string, string | number> => {
  if (typeof window === 'undefined') {
    return new Map();
  }
  if (!(window as unknown as { __animatedCellCache?: Map<string, string | number> }).__animatedCellCache) {
    (window as unknown as { __animatedCellCache: Map<string, string | number> }).__animatedCellCache = new Map();
  }
  return (window as unknown as { __animatedCellCache: Map<string, string | number> }).__animatedCellCache;
};

const AnimatedCell = ({ value, cellKey, className = '' }: AnimatedCellProps) => {
  const generatedId = useId();
  const cacheKey = cellKey || generatedId;

  const [animationKey, setAnimationKey] = useState(0);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    const cache = getCache();
    const prevValue = cache.get(cacheKey);

    // If we have a previous value and it's different, trigger animation
    if (prevValue !== undefined && String(prevValue) !== String(value)) {
      setAnimationKey(prev => prev + 1);
      setShowPulse(true);

      const timer = setTimeout(() => {
        setShowPulse(false);
      }, 500);

      cache.set(cacheKey, value);
      return () => clearTimeout(timer);
    }

    // Store current value for next comparison
    cache.set(cacheKey, value);
  }, [value, cacheKey]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background pulse animation */}
      {showPulse && (
        <motion.div
          key={`pulse-${animationKey}`}
          className="absolute inset-0 bg-blue-400/40 dark:bg-blue-500/40 rounded"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      )}

      {/* Text with slide animation */}
      <motion.span
        key={animationKey}
        className="relative z-10 inline-block"
        initial={animationKey > 0 ? { opacity: 0, x: -15 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {value}
      </motion.span>
    </div>
  );
};

AnimatedCell.displayName = 'AnimatedCell';

export default AnimatedCell;
