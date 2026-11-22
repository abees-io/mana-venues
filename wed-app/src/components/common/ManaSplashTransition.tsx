import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ManaSplashTransition: React.FC = () => {
  // Check if already viewed in this browser session or if not on root URL
  const shouldSkipInitial = () => {
    if (typeof window === 'undefined') return true;
    try {
      const isRoot = window.location.pathname === '/' || window.location.pathname === '';
      const hasSeen = sessionStorage.getItem('mana_splash_seen');
      // Only play once per session and only on root landing page
      if (!isRoot || hasSeen) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const [isPlaying, setIsPlaying] = useState<boolean>(() => !shouldSkipInitial());
  const [phase, setPhase] = useState<'intro' | 'shimmer' | 'reveal'>('intro');

  useEffect(() => {
    if (!isPlaying) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mana-splash-reveal'));
        window.dispatchEvent(new CustomEvent('mana-splash-end'));
      }
      return;
    }

    try {
      sessionStorage.setItem('mana_splash_seen', 'true');
    } catch {
      // Ignore storage errors
    }

    // Fast, responsive timings (under 1.3s total)
    const shimmerTimer = setTimeout(() => {
      setPhase('shimmer');
    }, 400);

    const revealTimer = setTimeout(() => {
      setPhase('reveal');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mana-splash-reveal'));
      }
    }, 900);

    const completeTimer = setTimeout(() => {
      setIsPlaying(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mana-splash-end'));
      }
    }, 1250);

    return () => {
      clearTimeout(shimmerTimer);
      clearTimeout(revealTimer);
      clearTimeout(completeTimer);
    };
  }, [isPlaying]);

  const handleSkip = () => {
    setIsPlaying(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mana-splash-reveal'));
      window.dispatchEvent(new CustomEvent('mana-splash-end'));
    }
  };

  if (!isPlaying) return null;

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          key="mana-cinematic-splash"
          initial={{ opacity: 1 }}
          animate={{
            opacity: phase === 'reveal' ? 0 : 1,
            transition: { duration: 0.35, ease: 'easeOut' },
          }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer bg-gradient-to-br from-[#F3A2BE] via-[#E06A94] to-[#B83865] will-change-[opacity]"
          onClick={handleSkip}
        >
          {/* Subtle Glow */}
          <div className="absolute w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] rounded-full bg-gradient-to-tr from-[#F0F9F8]/20 via-[#F3A2BE]/30 to-white/20 pointer-events-none opacity-80" />

          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(126,31,62,0.3)_90%)] pointer-events-none" />

          {/* Center Logo Showcase */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={
              phase === 'intro'
                ? {
                    scale: 1,
                    opacity: 1,
                    transition: { duration: 0.35, ease: 'easeOut' },
                  }
                : phase === 'shimmer'
                ? {
                    scale: 1.02,
                    opacity: 1,
                    transition: { duration: 0.5, ease: 'easeInOut' },
                  }
                : {
                    scale: 1.15,
                    opacity: 0,
                    transition: { duration: 0.35, ease: 'easeIn' },
                  }
            }
            className="relative z-10 flex flex-col items-center justify-center pointer-events-none"
          >
            {/* MANA Logo Graphic */}
            <div className="relative w-32 h-32 sm:w-44 sm:h-44 flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="MANA Logo"
                className="w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
              />

              {/* Shimmer Light Reflection Sweep */}
              <div
                className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
                style={{
                  WebkitMaskImage: 'url(/logo.svg)',
                  maskImage: 'url(/logo.svg)',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                }}
              >
                <motion.div
                  initial={{ x: '-130%' }}
                  animate={
                    phase === 'shimmer' || phase === 'reveal'
                      ? {
                          x: '150%',
                          transition: { duration: 0.75, ease: 'easeInOut' },
                        }
                      : { x: '-130%' }
                  }
                  className="w-full h-full bg-gradient-to-r from-transparent via-[#F0F9F8] to-transparent skew-x-[-25deg] opacity-90"
                />
              </div>
            </div>

            {/* Typography: MANA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={
                phase === 'reveal'
                  ? { opacity: 0, y: -6 }
                  : { opacity: 1, y: 0 }
              }
              transition={{ delay: 0.1, duration: 0.35 }}
              className="mt-4 sm:mt-6 text-center"
            >
              <h1
                className="text-2xl sm:text-4xl font-extrabold tracking-[0.22em] uppercase text-[#F0F9F8] drop-shadow-md"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                MANA
              </h1>
              <p
                className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#F0F9F8]/90 font-medium mt-1 drop-shadow-xs"
              >
                Curated Kerala Weddings
              </p>
            </motion.div>
          </motion.div>

          {/* Tap hint */}
          <div className="absolute bottom-6 text-[10px] uppercase tracking-widest text-[#F0F9F8]/70 font-medium">
            Tap to enter
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ManaSplashTransition;
