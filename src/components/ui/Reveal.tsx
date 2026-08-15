"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Children } from "react";

/** Distance travelled, in pixels — enough to read as a settle, not a slide. */
const RISE = 18;

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
const DURATION = 0.5;

/** Seconds between siblings in a group. */
const STAGGER = 0.08;

/** Starts the animation slightly before the element is fully on screen. */
const VIEWPORT = { once: true, amount: 0.2, margin: "0px 0px -8% 0px" };

const HIDDEN = { opacity: 0, y: RISE };
const VISIBLE = { opacity: 1, y: 0 };

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Kept so wrapped blocks can still be the target of an in-page anchor. */
  id?: string;
  /** Seconds to wait once in view — used to cascade sibling blocks. */
  delay?: number;
  /** Play on mount instead of on scroll, for content already in view. */
  onMount?: boolean;
}

export default function Reveal({
  children,
  className,
  id,
  delay = 0,
  onMount = false,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion)
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );

  return (
    <motion.div
      data-reveal
      id={id}
      className={className}
      initial={HIDDEN}
      {...(onMount
        ? { animate: VISIBLE }
        : { whileInView: VISIBLE, viewport: VIEWPORT })}
      transition={{ duration: DURATION, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

const itemVariants: Variants = {
  hidden: HIDDEN,
  visible: { ...VISIBLE, transition: { duration: DURATION, ease: EASE } },
};

/**
 * Reveals each child in turn, so a row of cards arrives one after another
 * rather than all at once. This replaces the grid wrapper itself; note that it
 * wraps every child in a div, so it can't be used on grids whose items rely on
 * `grid-rows-subgrid` (the doctor cards).
 */
export function RevealGroup({
  children,
  className,
  id,
  delay = 0,
  onMount = false,
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const items = Children.toArray(children);

  if (reduceMotion)
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );

  return (
    <motion.div
      id={id}
      className={className}
      initial="hidden"
      {...(onMount
        ? { animate: "visible" }
        : { whileInView: "visible", viewport: VIEWPORT })}
      variants={{
        visible: {
          transition: { staggerChildren: STAGGER, delayChildren: delay },
        },
      }}
    >
      {items.map((child, index) => (
        <motion.div
          key={index}
          data-reveal
          variants={itemVariants}
          className="h-full *:h-full"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
