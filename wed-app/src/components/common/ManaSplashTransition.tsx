import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ManaSplashTransition: React.FC = () => {
  // Always true on initial load so it never gets blocked
  const [isPlaying, setIsPlaying] = useState(true);
  const [phase, setPhase] = useState<'intro' | 'docking'>('intro');

  useEffect(() => {
    // Phase 1: Logo springs in and holds (0ms - 800ms)
    const dockTimer = setTimeout(() => {
      setPhase('docking');
    }, 900);

    // Phase 2: Curtain slide up & complete (1600ms)
    const completeTimer = setTimeout(() => {
      setIsPlaying(false);
    }, 1700);

    return () => {
      clearTimeout(dockTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  const handleSkip = () => {
    setIsPlaying(false);
  };

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          key="mana-splash-screen"
          initial={{ y: 0, opacity: 1 }}
          animate={
            phase === 'intro'
              ? { y: 0, opacity: 1 }
              : {
                  y: '-100%', // Elegant upward curtain slide like the 60fps.design onboarding flow
                  transition: {
                    duration: 0.75,
                    ease: [0.76, 0, 0.24, 1], // iOS fluid slide curve
                  },
                }
          }
          exit={{
            y: '-100%',
            transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer bg-[#0B1F12]"
          onClick={handleSkip}
        >
          {/* Branded Emerald Green Background Canvas with Radial Depth */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-brand-secondary/25 via-emerald-600/20 to-transparent blur-[110px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#06130B_85%)]" />
          </div>

          {/* Central Logo & Brand Element */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={
              phase === 'intro'
                ? {
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: 'spring',
                      stiffness: 280,
                      damping: 20,
                      mass: 0.8,
                    },
                  }
                : {
                    scale: 0.65,
                    y: -60,
                    opacity: 0.85,
                    transition: {
                      duration: 0.7,
                      ease: [0.76, 0, 0.24, 1],
                    },
                  }
            }
            className="relative z-10 flex flex-col items-center justify-center pointer-events-none"
          >
            {/* The Pure MANA Logo (no square container, no border) */}
            <div className="relative flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="MANA Logo"
                className="w-32 h-32 sm:w-44 sm:h-44 object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.8)]"
              />
            </div>

            {/* Brand Title: MANA VENUES */}
            <div className="mt-6 text-center">
              <h1
                className="text-3xl sm:text-4xl font-extrabold tracking-[0.2em] uppercase bg-gradient-to-r from-[#FFAE00] via-[#FCE881] to-[#FFAE00] bg-clip-text text-transparent drop-shadow-md"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                MANA
              </h1>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/90 font-semibold mt-1">
                Luxury Wedding Venues
              </p>
            </div>
          </motion.div>

          {/* Discreet Skip Prompt */}
          <div className="absolute bottom-10 text-[11px] uppercase tracking-widest text-emerald-400/60 font-medium">
            Tap anywhere to enter
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ManaSplashTransition;
