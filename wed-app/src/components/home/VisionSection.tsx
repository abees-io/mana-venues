import { motion, type Variants } from 'framer-motion'

interface VisionSectionProps {
  className?: string
}

const MISSION_PARAGRAPH =
  'Our mission is to make wedding planning simple, transparent, and stress-free for every couple across Kerala. We connect you directly with verified auditoriums, destination venues, and passionate wedding artisans — ensuring honest pricing, verified quality, and zero hidden markups.'

const missionWords = MISSION_PARAGRAPH.split(' ')

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.022,
      delayChildren: 0.3,
    },
  },
}

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
}

export default function VisionSection({ className = '' }: VisionSectionProps) {
  return (
    <section className={`w-full relative overflow-hidden py-14 sm:py-20 text-black ${className}`}>
      {/* Exact Single Curve SVG Design with deeper curvature & transparent background */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none"
        aria-hidden="true"
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 600"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Luminous Gradient for the Deeper Single Curve */}
            <linearGradient id="deeperSingleCurve" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#699407" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#699407" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#699407" stopOpacity="0.22" />
            </linearGradient>

            {/* Center Radial Highlight Glow */}
            <radialGradient id="deeperCurveGlow" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#699407" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#699407" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#699407" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Deeper Single Curved Band with Constant Width */}
          <motion.g
            animate={{
              y: [-6, 6, -6],
            }}
            transition={{
              repeat: Infinity,
              duration: 9,
              ease: 'easeInOut',
            }}
          >
            {/* Single Deep Curved Band Fill */}
            <path
              d="M 0 70 Q 720 330 1440 70 L 1440 270 Q 720 530 0 270 Z"
              fill="url(#deeperSingleCurve)"
            />

            {/* Radial Glow Highlight in Center */}
            <path
              d="M 0 70 Q 720 330 1440 70 L 1440 270 Q 720 530 0 270 Z"
              fill="url(#deeperCurveGlow)"
            />

            {/* Top Crisp Rim Contour Line */}
            <path
              d="M 0 70 Q 720 330 1440 70"
              stroke="#8E6BB8"
              strokeWidth="2.2"
              strokeOpacity="0.55"
            />

            {/* Bottom Crisp Rim Contour Line */}
            <path
              d="M 0 270 Q 720 530 1440 270"
              stroke="#6E5094"
              strokeWidth="2"
              strokeOpacity="0.45"
            />
          </motion.g>
        </svg>
      </div>

      {/* Foreground Content with Loading Text Animation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Header Block with Vertical Accent Bar */}
        <div className="flex items-stretch gap-3 sm:gap-4 mb-4 sm:mb-5">
          {/* Vertical Accent Bar with Loading Reveal */}
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            whileInView={{ scaleY: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-1.5 sm:w-2 bg-[#f98093] rounded-full shrink-0 shadow-xs origin-top"
          />

          <div className="flex flex-col justify-center overflow-hidden">
            <motion.span
              initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="block font-bold text-2xl sm:text-3xl md:text-4xl text-black leading-none tracking-wide"
              style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}
            >
              Our
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.22, ease: 'easeOut' }}
              className="block font-bold text-2xl sm:text-3xl md:text-4xl text-black leading-tight mt-1 tracking-wide"
              style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}
            >
              Mission
            </motion.span>
          </div>
        </div>

        {/* Animated Streamed / Loading Mission Text */}
        <motion.p
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-base sm:text-lg md:text-xl text-black leading-relaxed font-normal max-w-3xl flex flex-wrap gap-x-1.5 gap-y-1 items-baseline"
          style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', 'Lora', serif" }}
        >
          {missionWords.map((word, index) => (
            <motion.span
              key={`${word}-${index}`}
              variants={wordVariants}
              className="inline-block"
            >
              {word}
            </motion.span>
          ))}
        </motion.p>

        {/* Author Sign-off */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 1.4, duration: 0.6, ease: 'easeOut' }}
          className="text-xs sm:text-sm font-medium tracking-widest uppercase text-black/75 mt-4 sm:mt-5"
          style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}
        >
          — the author
        </motion.p>
      </div>
    </section>
  )
}
