'use client';

import { motion, Variants, useInView, useAnimation } from 'framer-motion';
import { useEffect, useRef, ReactNode, useState } from 'react';

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================

interface RevealProps {
  children: ReactNode;
  width?: 'fit-content' | '100%';
  delay?: number;
  duration?: number;
  className?: string;
}

// Fade up reveal - elegant entrance from below
export function FadeUp({
  children,
  width,
  delay = 0,
  duration = 0.8,
  className = '',
}: RevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} style={width ? { width } : undefined} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{
          duration,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Fade in with scale - subtle zoom effect
export function FadeScale({
  children,
  width,
  delay = 0,
  duration = 0.8,
  className = '',
}: RevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} style={width ? { width } : undefined} className={className}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={
          isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
        }
        transition={{
          duration,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Slide from left
export function SlideLeft({
  children,
  width,
  delay = 0,
  duration = 0.8,
  className = '',
}: RevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} style={width ? { width } : undefined} className={className}>
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
        transition={{
          duration,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Slide from right
export function SlideRight({
  children,
  width,
  delay = 0,
  duration = 0.8,
  className = '',
}: RevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} style={width ? { width } : undefined} className={className}>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
        transition={{
          duration,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ============================================
// TEXT ANIMATIONS
// ============================================

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

// Letter by letter reveal - premium text animation
export function TextReveal({
  text,
  className = '',
  delay = 0,
  staggerDelay = 0.03,
}: TextRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const letterVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: delay + i * staggerDelay,
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  };

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          custom={i}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={letterVariants}
          style={{
            display: 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : 'normal',
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

// Word by word reveal
export function WordReveal({
  text,
  className = '',
  delay = 0,
  staggerDelay = 0.1,
}: TextRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const words = text.split(' ');

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        delay: delay + i * staggerDelay,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  };

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          custom={i}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={wordVariants}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

// Mask reveal - text slides out from behind mask
export function MaskReveal({
  text,
  className = '',
  delay = 0,
}: Omit<TextRevealProps, 'staggerDelay'>) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        initial={{ y: '100%' }}
        animate={isInView ? { y: 0 } : { y: '100%' }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className={className}
      >
        {text}
      </motion.div>
    </div>
  );
}

// ============================================
// STAGGER CONTAINERS
// ============================================

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delay?: number;
}

// Stagger children - for lists, grids, etc.
export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1,
  delay = 0,
}: StaggerContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

// Stagger item - use inside StaggerContainer
export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

// ============================================
// IMAGE ANIMATIONS
// ============================================

interface ImageRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
}

// Image reveal with curtain effect
export function ImageReveal({
  children,
  className = '',
  delay = 0,
  direction = 'left',
}: ImageRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { x: '0%' };
      case 'right':
        return { x: '-100%' };
      case 'up':
        return { y: '0%' };
      case 'down':
        return { y: '-100%' };
    }
  };

  const getFinalPosition = () => {
    switch (direction) {
      case 'left':
        return { x: '100%' };
      case 'right':
        return { x: '0%' };
      case 'up':
        return { y: '100%' };
      case 'down':
        return { y: '0%' };
    }
  };

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {children}
      <motion.div
        className="absolute inset-0 bg-akbw-sand z-10"
        initial={getInitialPosition()}
        animate={isInView ? getFinalPosition() : getInitialPosition()}
        transition={{
          duration: 1,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      />
    </div>
  );
}

// Parallax image - subtle movement on scroll
export function ParallaxImage({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ scale: 1.1 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// HOVER ANIMATIONS
// ============================================

interface HoverCardProps {
  children: ReactNode;
  className?: string;
}

// Magnetic hover effect - subtle pull towards cursor
export function MagneticHover({ children, className = '' }: HoverCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}

// Float hover - gentle lift effect
export function FloatHover({ children, className = '' }: HoverCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -8,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// PAGE TRANSITIONS
// ============================================

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// DECORATIVE ANIMATIONS
// ============================================

// Animated line/divider
export function AnimatedLine({
  className = '',
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        className="h-[1px] bg-black"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{
          duration: 1,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        style={{ transformOrigin: 'left' }}
      />
    </div>
  );
}

// Floating animation (continuous)
export function Float({
  children,
  className = '',
  duration = 3,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-10, 10, -10],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// Pulse glow effect
export function PulseGlow({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      animate={{
        boxShadow: [
          '0 0 0 0 rgba(166, 161, 149, 0)',
          '0 0 0 20px rgba(166, 161, 149, 0.1)',
          '0 0 0 0 rgba(166, 161, 149, 0)',
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// Counter animation
interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  className?: string;
}

export function Counter({
  from = 0,
  to,
  duration = 2,
  delay = 0,
  suffix = '',
  className = '',
}: CounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({ opacity: 1 });
    }
  }, [isInView, controls]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={controls}
    >
      {isInView && (
        <motion.span initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
          <CounterNumber
            from={from}
            to={to}
            duration={duration}
            delay={delay}
          />
          {suffix}
        </motion.span>
      )}
    </motion.span>
  );
}

function CounterNumber({
  from,
  to,
  duration,
  delay,
}: {
  from: number;
  to: number;
  duration: number;
  delay: number;
}) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = Date.now();
      const endTime = startTime + duration * 1000;

      const updateCount = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / (duration * 1000), 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic

        setCount(Math.floor(from + (to - from) * easeProgress));

        if (now < endTime) {
          requestAnimationFrame(updateCount);
        } else {
          setCount(to);
        }
      };

      requestAnimationFrame(updateCount);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [from, to, duration, delay]);

  return <>{count}</>;
}
