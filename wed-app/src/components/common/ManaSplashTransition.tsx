import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ManaSplashTransition: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [phase, setPhase] = useState<'intro' | 'shimmer' | 'reveal'>('intro');

  useEffect(() => {
    // Phase 1: Logo springs in gently (0 - 1000ms)
    // Phase 2: Slow, graceful golden shimmer sweep across the "M" logo (1000ms - 2600ms)
    const shimmerTimer = setTimeout(() => {
      setPhase('shimmer');
    }, 1000);

    // Phase 3: Smooth cinematic portal zoom & dissolve into website (2600ms - 3500ms)
    const revealTimer = setTimeout(() => {
      setPhase('reveal');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mana-splash-reveal'));
      }
    }, 2600);

    const completeTimer = setTimeout(() => {
      setIsPlaying(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mana-splash-end'));
      }
    }, 3550);

    return () => {
      clearTimeout(shimmerTimer);
      clearTimeout(revealTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  const handleSkip = () => {
    setIsPlaying(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mana-splash-reveal'));
      window.dispatchEvent(new CustomEvent('mana-splash-end'));
    }
  };

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          key="mana-cinematic-splash"
          initial={{ opacity: 1 }}
          animate={{
            opacity: phase === 'reveal' ? 0 : 1,
            transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
          }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer bg-[#07170E]"
          onClick={handleSkip}
        >
          {/* Ambient Luxury Emerald & Gold Radial Glow */}
          <motion.div
            animate={{
              scale: phase === 'reveal' ? 1.5 : [1, 1.2, 1],
              opacity: phase === 'reveal' ? 0 : 0.8,
            }}
            transition={{
              scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
              opacity: { duration: 0.8 },
            }}
            className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#FFAE00]/20 via-emerald-600/25 to-[#F9E866]/15 blur-[120px] pointer-events-none"
          />

          {/* Deep Radial Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#05120B_80%)] pointer-events-none" />

          {/* Center Logo Showcase with Cinematic Zoom Transition */}
          <motion.div
            initial={{ scale: 0.65, opacity: 0, filter: 'blur(10px)' }}
            animate={
              phase === 'intro'
                ? {
                    scale: 1,
                    opacity: 1,
                    filter: 'blur(0px)',
                    transition: {
                      type: 'spring',
                      stiffness: 140,
                      damping: 20,
                      mass: 0.9,
                    },
                  }
                : phase === 'shimmer'
                ? {
                    scale: 1.04,
                    opacity: 1,
                    filter: 'blur(0px)',
                    transition: { duration: 1.2, ease: 'easeInOut' },
                  }
                : {
                    // Portal zoom-through into the website
                    scale: 1.4,
                    opacity: 0,
                    filter: 'blur(14px)',
                    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
                  }
            }
            className="relative z-10 flex flex-col items-center justify-center pointer-events-none"
          >
            {/* Pure Borderless MANA Logo Graphic with Pixel-Perfect Mask Shimmer */}
            <div className="relative w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center">
              {/* Base MANA Logo */}
              <img
                src="/logo.svg"
                alt="MANA Logo"
                className="w-full h-full object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
              />

              {/* Shimmer Light Reflection Sweep - STRICTLY MASKED TO THE LETTER "M" LOGO ONLY */}
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
                          transition: { duration: 1.45, ease: 'easeInOut' },
                        }
                      : { x: '-130%' }
                  }
                  className="w-full h-full bg-gradient-to-r from-transparent via-[#FFF8BA] to-transparent skew-x-[-25deg] opacity-95"
                />
              </div>
            </div>

            {/* Typography: MANA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={
                phase === 'reveal'
                  ? { opacity: 0, y: -10 }
                  : { opacity: 1, y: 0 }
              }
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mt-6 text-center"
            >
              <h1
                className="text-3xl sm:text-4xl font-extrabold tracking-[0.22em] uppercase bg-gradient-to-r from-[#FFAE00] via-[#FCE881] to-[#FFAE00] bg-clip-text text-transparent drop-shadow-md"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                MANA
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-emerald-200/90 font-medium mt-1.5"
              >
                Luxury Wedding Venues
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Discreet Hint */}
          <div className="absolute bottom-8 text-[11px] uppercase tracking-widest text-emerald-400/50 font-medium">
            Tap anywhere to enter
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ManaSplashTransition;
