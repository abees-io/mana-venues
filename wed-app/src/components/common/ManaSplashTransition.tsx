import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ManaSplashTransition: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'intro' | 'docking' | 'complete'>('intro');

  useEffect(() => {
    // Play splash on initial session visit
    const hasSeenSplash = sessionStorage.getItem('mana_splash_played');
    if (!hasSeenSplash) {
      setIsPlaying(true);

      // Phase 1: Logo pulse in center (0 - 800ms)
      // Phase 2: Logo scales down and slides up, background dissolves (800ms)
      const dockTimer = setTimeout(() => {
        setPhase('docking');
      }, 850);

      // Phase 3: Transition finishes completely (1700ms)
      const completeTimer = setTimeout(() => {
        setPhase('complete');
        setIsPlaying(false);
        sessionStorage.setItem('mana_splash_played', 'true');
      }, 1750);

      return () => {
        clearTimeout(dockTimer);
        clearTimeout(completeTimer);
      };
    }
  }, []);

  const handleSkip = () => {
    setIsPlaying(false);
    sessionStorage.setItem('mana_splash_played', 'true');
  };

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          key="mana-splash-screen"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer"
          onClick={handleSkip}
        >
          {/* Branded Emerald Green Background Canvas with Radial Depth */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{
              opacity: phase === 'docking' ? 0 : 1,
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-[#0B1F12] flex items-center justify-center pointer-events-none"
          >
            {/* Soft Ambient Gold & Forest Green Glow */}
            <div className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-brand-secondary/20 via-emerald-600/15 to-transparent blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,#07150C_85%)]" />
          </motion.div>

          {/* Central Animated Brand Container (Scales and glides upward) */}
          <motion.div
            initial={{ scale: 0.75, opacity: 0, y: 15 }}
            animate={
              phase === 'intro'
                ? { scale: 1, opacity: 1, y: 0 }
                : {
                    // Docking phase: scales down and slides up toward top navigation bar
                    scale: 0.38,
                    y: -260,
                    opacity: 0,
                  }
            }
            transition={
              phase === 'intro'
                ? {
                    type: 'spring',
                    stiffness: 260,
                    damping: 22,
                    mass: 0.9,
                  }
                : {
                    duration: 0.75,
                    ease: [0.16, 1, 0.3, 1], // Fluid iOS transition curve
                  }
            }
            className="relative z-10 flex flex-col items-center justify-center pointer-events-none"
          >
            {/* The MANA Logo with Specular Glass Ring */}
            <div className="relative flex items-center justify-center">
              {/* Outer soft gold pulse ring */}
              <motion.div
                animate={{
                  scale: phase === 'intro' ? [1, 1.15, 1] : 1,
                  opacity: phase === 'intro' ? [0.4, 0.8, 0.4] : 0,
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                }}
                className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-brand-secondary/40 pointer-events-none"
              />

              {/* Logo Emblem Icon */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 p-4 rounded-3xl bg-brand-dark/80 backdrop-blur-md border border-[#D8A629]/50 shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.4)] flex items-center justify-center">
                <img
                  src="/logo.svg"
                  alt="MANA Logo"
                  className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(216,166,41,0.4)]"
                />
              </div>
            </div>

            {/* Brand Title: MANA VENUES */}
            <motion.div
              animate={{
                opacity: phase === 'docking' ? 0 : 1,
                y: phase === 'docking' ? -10 : 0,
              }}
              transition={{ duration: 0.4 }}
              className="mt-6 text-center"
            >
              <h1
                className="text-3xl sm:text-4xl font-extrabold tracking-[0.2em] uppercase bg-gradient-to-r from-[#FFAE00] via-[#FCE881] to-[#FFAE00] bg-clip-text text-transparent drop-shadow-md"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                MANA
              </h1>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80 font-semibold mt-1">
                Luxury Wedding Venues
              </p>
            </motion.div>
          </motion.div>

          {/* Discreet Skip Prompt */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'intro' ? 0.6 : 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="absolute bottom-10 text-[11px] uppercase tracking-widest text-emerald-400/60 hover:text-emerald-300 font-medium transition-colors"
          >
            Tap anywhere to enter
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ManaSplashTransition;
