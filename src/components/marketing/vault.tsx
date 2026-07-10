"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";

/**
 * Continental Bank — Vault door.
 *
 * A pure-SVG, code-drawn vault that runs a short choreographed security
 * sequence on mount (plays on every visit):
 *
 *   T=0      enter: opacity + slight scale settling
 *   T=0.8s   spoke wheel begins a deliberate unlock rotation
 *   T=1.6s   12 radial bolts retract inward (staggered ~40ms apart)
 *   T=2.7s   the door eases open and reveals warm interior light
 *   T=3.5s   reserve stacks appear inside the vault
 *   T=5.4s   the door closes firmly
 *   T=6.3s   bolts extend
 *   T=7.4s   secure indicator switches to champagne
 *
 * Reduced motion: the vault renders in its final secured state with no
 * animation. All visuals are hand-drawn — no external assets.
 */

const SIZE = 600;          // viewBox dimension
const C = SIZE / 2;        // centre
const BOLT_COUNT = 12;
const BOLT_INNER_R = 226;  // bolt position when retracted (open)
const BOLT_OUTER_R = 252;  // bolt position when extended (sealed)

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeInOut = [0.65, 0, 0.35, 1] as [number, number, number, number];

type VaultProps = {
  /** Optional pixel size. If omitted, the vault fills 100% of its parent. */
  size?: number;
};

export function Vault({ size }: VaultProps = {}) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "240px 0px" });
  // Ongoing ambient loops (halo, sheen, pulse) only run while the vault is on
  // screen — off-screen they idle so they stop burning CPU after the fold.
  const ambient = !reduce && inView;

  // Timing — all numbers in seconds.
  const tEnter = 0.7;
  const tWheelDelay = 0.7;
  const tWheel = 1.45;
  const tBoltsDelay = tWheelDelay + 0.95;
  const tBolt = 0.55;
  const tDoorDelay = tBoltsDelay + BOLT_COUNT * 0.04 + tBolt + 0.08;
  const tDoor = 1.15;
  const tLightDelay = tDoorDelay + 0.08;
  const tCashDelay = tDoorDelay + 0.72;
  const tHoldOpen = 1.45;
  const tCloseDelay = tDoorDelay + tDoor + tHoldOpen;
  const tClose = 0.9;
  const tWheelLockDelay = tCloseDelay + tClose + 0.02;
  const boltReturnDelay = tWheelLockDelay + 0.05;
  const boltMotionDuration = boltReturnDelay - tBoltsDelay + tBolt;
  const tSecureDelay = boltReturnDelay + BOLT_COUNT * 0.035 + tBolt + 0.12;

  const doorClosedState = { x: 0, scaleX: 1, skewY: 0 };
  const doorOpenState = { x: -12, scaleX: 0.74, skewY: -1.8 };
  const doorSlamState = { x: 3, scaleX: 1.012, skewY: 0.2 };
  const doorMotionDuration = tDoor + tHoldOpen + tClose;
  const doorMotion = reduce
    ? doorClosedState
    : {
        x: [0, doorOpenState.x, doorOpenState.x, doorSlamState.x, 0],
        scaleX: [1, doorOpenState.scaleX, doorOpenState.scaleX, doorSlamState.scaleX, 1],
        skewY: [0, doorOpenState.skewY, doorOpenState.skewY, doorSlamState.skewY, 0],
      };
  const doorMotionTimes = [0, tDoor / doorMotionDuration, (tDoor + tHoldOpen) / doorMotionDuration, 0.92, 1];
  const wheelMotionDuration = tWheelLockDelay - tWheelDelay + 0.72;
  const wheelMotionTimes = [
    0,
    tWheel / wheelMotionDuration,
    (tWheelLockDelay - tWheelDelay) / wheelMotionDuration,
    1,
  ];

  const sizeStyle = size ? { width: size, height: size } : { width: "100%", height: "100%" };

  return (
    <div
      ref={rootRef}
      className="relative"
      style={sizeStyle}
      aria-label="Continental Bank vault — opens, reveals secured reserves, and locks"
      role="img"
    >
      {/* Soft champagne halo behind the vault */}
      <motion.div
        aria-hidden
        className="absolute -inset-[18%] pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side, rgba(200,169,106,0.20) 0%, rgba(200,169,106,0.05) 35%, rgba(200,169,106,0) 70%)",
          filter: "blur(26px)",
        }}
        animate={
          ambient
            ? { opacity: [0.55, 0.8, 0.55], scale: [1, 1.02, 1] }
            : { opacity: 0.62, scale: 1 }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ground shadow */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 bottom-[-4%] w-[78%] h-[5%] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(8px)",
        }}
      />

      <motion.svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="relative w-full h-full"
        initial={reduce ? false : { opacity: 0, scale: 0.96, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: tEnter, ease: easeOut }}
        style={{ filter: "drop-shadow(0 30px 60px rgba(7, 17, 31, 0.55))" }}
      >
        <defs>
          {/* Outer frame — recessed steel jamb */}
          <radialGradient id="v-frame" cx="40%" cy="35%" r="80%">
            <stop offset="0%" stopColor="#3A4B6B" />
            <stop offset="60%" stopColor="#1A2541" />
            <stop offset="100%" stopColor="#070D18" />
          </radialGradient>

          {/* Outer ring rim — dark steel */}
          <linearGradient id="v-ring-outer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2B3B5C" />
            <stop offset="100%" stopColor="#0A1527" />
          </linearGradient>

          {/* Door body — brushed navy steel */}
          <radialGradient id="v-body" cx="35%" cy="30%" r="85%">
            <stop offset="0%" stopColor="#2A3954" />
            <stop offset="55%" stopColor="#152340" />
            <stop offset="100%" stopColor="#07111F" />
          </radialGradient>

          {/* Warm interior visible when the door opens */}
          <radialGradient id="v-interior" cx="56%" cy="45%" r="72%">
            <stop offset="0%" stopColor="#F7E5B7" />
            <stop offset="22%" stopColor="#D9B970" />
            <stop offset="58%" stopColor="#463617" />
            <stop offset="100%" stopColor="#080D14" />
          </radialGradient>

          <linearGradient id="v-light-spill" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(229,206,148,0)" />
            <stop offset="40%" stopColor="rgba(229,206,148,0.42)" />
            <stop offset="100%" stopColor="rgba(229,206,148,0)" />
          </linearGradient>

          <linearGradient id="v-cash-face" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5F0D8" />
            <stop offset="52%" stopColor="#B9D59A" />
            <stop offset="100%" stopColor="#5C8E56" />
          </linearGradient>

          <linearGradient id="v-cash-edge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D9E7B4" />
            <stop offset="100%" stopColor="#4C6F48" />
          </linearGradient>

          <linearGradient id="v-cash-band" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8C6E3C" />
            <stop offset="50%" stopColor="#E5CE94" />
            <stop offset="100%" stopColor="#8C6E3C" />
          </linearGradient>

          {/* Body highlight — soft light source from top-left */}
          <radialGradient id="v-body-hi" cx="30%" cy="20%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          {/* Champagne gradient */}
          <linearGradient id="v-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E5CE94" />
            <stop offset="50%" stopColor="#C8A96A" />
            <stop offset="100%" stopColor="#8C6E3C" />
          </linearGradient>

          {/* Champagne ring with subtle radial sheen */}
          <radialGradient id="v-gold-radial" cx="50%" cy="50%" r="50%">
            <stop offset="80%" stopColor="rgba(200,169,106,0)" />
            <stop offset="100%" stopColor="rgba(200,169,106,0.5)" />
          </radialGradient>

          {/* Bolt — cylinder seen end-on */}
          <radialGradient id="v-bolt" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#F4E2B0" />
            <stop offset="55%" stopColor="#C8A96A" />
            <stop offset="100%" stopColor="#6D4F22" />
          </radialGradient>

          {/* Hub centre */}
          <radialGradient id="v-hub" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#E5CE94" />
            <stop offset="100%" stopColor="#6D4F22" />
          </radialGradient>

          {/* Bevel highlight for the door edge */}
          <linearGradient id="v-bevel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
          </linearGradient>

          <filter id="v-soft-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ============ JAMB / WALL FRAME (fixed) ============ */}

        {/* Hinges visible on the left side of the door */}
        {[180, 420].map((y) => (
          <g key={y}>
            <rect x={C - 295} y={y - 24} width="36" height="48" rx="3" fill="#0A1527" />
            <rect x={C - 290} y={y - 18} width="26" height="36" rx="2" fill="url(#v-ring-outer)" />
            <circle cx={C - 277} cy={y - 6} r="2" fill="#3A4B6B" />
            <circle cx={C - 277} cy={y + 6} r="2" fill="#3A4B6B" />
          </g>
        ))}

        {/* Outer frame ring (the recessed wall jamb) */}
        <circle cx={C} cy={C} r="288" fill="url(#v-frame)" />
        <circle
          cx={C}
          cy={C}
          r="288"
          fill="none"
          stroke="rgba(200,169,106,0.18)"
          strokeWidth="1"
        />

        {/* Inner shadow ring on the frame */}
        <circle
          cx={C}
          cy={C}
          r="270"
          fill="none"
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="3"
        />

        {/* Tiny rivets along the frame */}
        {Array.from({ length: 32 }).map((_, i) => {
          const a = (i / 32) * Math.PI * 2;
          const x = C + Math.cos(a) * 278;
          const y = C + Math.sin(a) * 278;
          return <circle key={i} cx={x} cy={y} r="2" fill="#0E1B33" />;
        })}

        {/* ============ DOOR BODY ============ */}

        {/* Interior chamber revealed as the door swings open */}
        <motion.g
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.75, delay: tLightDelay, ease: easeOut }}
        >
          <circle cx={C} cy={C} r="248" fill="url(#v-interior)" />
          <motion.circle
            cx={C + 36}
            cy={C}
            r="162"
            fill="none"
            stroke="rgba(255,235,180,0.24)"
            strokeWidth="1"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, delay: tLightDelay + 0.18, ease: easeOut }}
          />
          <motion.path
            d={`M ${C + 26} ${C - 218} C ${C + 154} ${C - 155}, ${C + 230} ${C - 60}, ${
              C + 255
            } ${C + 12} C ${C + 202} ${C + 72}, ${C + 146} ${C + 152}, ${C + 40} ${
              C + 226
            } Z`}
            fill="url(#v-light-spill)"
            filter="url(#v-soft-glow)"
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0, 0.75, 0.48], scale: [0.92, 1.03, 1] }}
            transition={{ duration: 1.4, delay: tLightDelay + 0.08, ease: easeOut }}
            style={{ transformOrigin: `${C}px ${C}px` }}
          />

          <motion.g
            aria-hidden
            initial={reduce ? false : { opacity: 0, y: 18, scale: 0.92 }}
            animate={
              reduce
                ? { opacity: 0 }
                : {
                    opacity: [0, 1, 1, 0.08],
                    y: [18, 0, 0, 4],
                    scale: [0.92, 1, 1, 0.98],
                  }
            }
            transition={
              reduce
                ? { duration: 0 }
                : {
                    duration: tHoldOpen + 1.2,
                    delay: tCashDelay,
                    times: [0, 0.22, 0.78, 1],
                    ease: easeOut,
                  }
            }
            style={{ transformOrigin: `${C + 120}px ${C + 104}px` }}
          >
            <ellipse
              cx={C + 134}
              cy={C + 153}
              rx="118"
              ry="20"
              fill="rgba(4,8,14,0.48)"
              style={{ filter: "blur(8px)" }}
            />
            {[
              { x: C + 54, y: C + 60, w: 160, h: 34, rotate: -6 },
              { x: C + 76, y: C + 91, w: 158, h: 34, rotate: 4 },
              { x: C + 46, y: C + 122, w: 166, h: 36, rotate: -2 },
            ].map(({ x, y, w, h, rotate }, index) => (
              <g key={index} transform={`rotate(${rotate} ${x + w / 2} ${y + h / 2})`}>
                <rect
                  x={x + 6}
                  y={y + 9}
                  width={w}
                  height={h}
                  rx="5"
                  fill="url(#v-cash-edge)"
                  opacity="0.9"
                />
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx="6"
                  fill="url(#v-cash-face)"
                  stroke="rgba(255,255,255,0.42)"
                  strokeWidth="0.9"
                />
                <rect
                  x={x + w * 0.45}
                  y={y - 2}
                  width={w * 0.16}
                  height={h + 5}
                  rx="3"
                  fill="url(#v-cash-band)"
                  opacity="0.95"
                />
                <rect
                  x={x + 14}
                  y={y + 8}
                  width={w - 28}
                  height={h - 16}
                  rx="8"
                  fill="none"
                  stroke="rgba(16,61,33,0.35)"
                  strokeWidth="1"
                />
                <circle cx={x + 30} cy={y + h / 2} r="4" fill="rgba(16,61,33,0.32)" />
                <circle cx={x + w - 30} cy={y + h / 2} r="4" fill="rgba(16,61,33,0.32)" />
              </g>
            ))}
          </motion.g>

          {!reduce && (
            <motion.g
              initial={{ rotate: -18, opacity: 0 }}
              animate={{ rotate: 22, opacity: [0, 0.45, 0.28] }}
              transition={{ duration: 2.4, delay: tLightDelay + 0.35, ease: "easeInOut" }}
              style={{ transformOrigin: `${C}px ${C}px` }}
            >
              <path
                d={`M ${C + 34} ${C - 190} C ${C + 122} ${C - 72}, ${C + 146} ${
                  C + 70
                }, ${C + 42} ${C + 196}`}
                fill="none"
                stroke="rgba(255,235,180,0.38)"
                strokeWidth="2"
                strokeLinecap="round"
                filter="url(#v-soft-glow)"
              />
            </motion.g>
          )}
        </motion.g>

        <motion.g
          initial={reduce ? false : { x: 0, scaleX: 1, skewY: 0 }}
          animate={doorMotion}
          transition={
            reduce
              ? { duration: 0 }
              : {
                  duration: doorMotionDuration,
                  delay: tDoorDelay,
                  times: doorMotionTimes,
                  ease: easeInOut,
                }
          }
          style={{ transformOrigin: `${C - 264}px ${C}px` }}
        >
        {/* Outer door rim - champagne */}
        <circle
          cx={C}
          cy={C}
          r="264"
          fill="url(#v-ring-outer)"
          stroke="url(#v-gold)"
          strokeWidth="1"
        />

        {/* Door slab */}
        <circle cx={C} cy={C} r="258" fill="url(#v-body)" />
        {/* Highlight wash */}
        <circle cx={C} cy={C} r="258" fill="url(#v-body-hi)" />
        {/* Bevel */}
        <circle
          cx={C}
          cy={C}
          r="258"
          fill="none"
          stroke="url(#v-bevel)"
          strokeWidth="2"
        />

        {/* Idle ambient — a soft champagne sheen orbiting the bevel
            after the lock sequence. Sub-pixel feel, kicks in once the
            vault is sealed. */}
        {!reduce && (
          <motion.g
            initial={{ rotate: 0, opacity: 0 }}
            animate={ambient ? { rotate: 360, opacity: [0, 0.6, 0.6, 0] } : { opacity: 0 }}
            transition={
              ambient
                ? {
                    rotate: { duration: 14, ease: "linear", repeat: Infinity, delay: tSecureDelay + 0.5 },
                    opacity: {
                      duration: 14,
                      ease: "easeInOut",
                      repeat: Infinity,
                      times: [0, 0.15, 0.85, 1],
                      delay: tSecureDelay + 0.5,
                    },
                  }
                : { duration: 0.3 }
            }
            style={{ transformOrigin: `${C}px ${C}px` }}
          >
            <circle
              cx={C}
              cy={C - 258}
              r="36"
              fill="rgba(229,206,148,0.16)"
              style={{ filter: "blur(20px)" }}
            />
          </motion.g>
        )}

        {/* Decorative concentric rings */}
        <circle cx={C} cy={C} r="220" fill="none" stroke="rgba(200,169,106,0.10)" strokeWidth="1" />
        <circle cx={C} cy={C} r="200" fill="none" stroke="rgba(200,169,106,0.18)" strokeWidth="1" />
        <circle cx={C} cy={C} r="180" fill="none" stroke="rgba(200,169,106,0.10)" strokeWidth="1" />

        {/* Gear-tooth inner ring — fine champagne marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * Math.PI * 2;
          const r1 = 168;
          const r2 = 174;
          const x1 = C + Math.cos(a) * r1;
          const y1 = C + Math.sin(a) * r1;
          const x2 = C + Math.cos(a) * r2;
          const y2 = C + Math.sin(a) * r2;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(200,169,106,0.35)"
              strokeWidth="0.8"
            />
          );
        })}

        {/* ============ RADIAL BOLTS ============ */}
        {Array.from({ length: BOLT_COUNT }).map((_, i) => {
          // Angle measured from 12-o'clock, going clockwise.
          const angleDeg = (i / BOLT_COUNT) * 360 - 90;
          const angleRad = (angleDeg * Math.PI) / 180;
          const finalX = C + Math.cos(angleRad) * BOLT_OUTER_R;
          const finalY = C + Math.sin(angleRad) * BOLT_OUTER_R;
          const startOffsetX = Math.cos(angleRad) * (BOLT_INNER_R - BOLT_OUTER_R);
          const startOffsetY = Math.sin(angleRad) * (BOLT_INNER_R - BOLT_OUTER_R);
          const delay = tBoltsDelay + i * 0.04;
          const returnStart = Math.min(
            Math.max((boltReturnDelay - delay) / boltMotionDuration, 0.62),
            0.9,
          );
          const retractDone = Math.min(tBolt / boltMotionDuration, returnStart - 0.05);
          const highlightX = finalX - Math.cos(angleRad - Math.PI / 4) * 3;
          const highlightY = finalY - Math.sin(angleRad - Math.PI / 4) * 3;
          return (
            <motion.g
              key={i}
              initial={reduce ? false : { x: 0, y: 0 }}
              animate={
                reduce
                  ? { x: 0, y: 0 }
                  : {
                      x: [0, startOffsetX, startOffsetX, 0],
                      y: [0, startOffsetY, startOffsetY, 0],
                    }
              }
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      duration: boltMotionDuration,
                      delay,
                      times: [0, retractDone, returnStart, 1],
                      ease: easeOut,
                    }
              }
            >
              <circle cx={finalX} cy={finalY} r="12" fill="url(#v-bolt)" />
              <circle
                cx={finalX}
                cy={finalY}
                r="12"
                fill="none"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="0.8"
              />
              <circle cx={highlightX} cy={highlightY} r="3" fill="rgba(255,235,180,0.4)" />
            </motion.g>
          );
        })}

        {/* ============ CENTRAL HUB + WHEEL ============ */}

        {/* Centre plate ring */}
        <circle
          cx={C}
          cy={C}
          r="108"
          fill="url(#v-body)"
          stroke="url(#v-gold)"
          strokeWidth="1.5"
        />
        <circle cx={C} cy={C} r="108" fill="url(#v-body-hi)" />

        {/* Engraved CB seal between hub and wheel */}
        <text
          x={C}
          y={C - 78}
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="9"
          letterSpacing="2"
          fill="rgba(200,169,106,0.55)"
          dominantBaseline="middle"
        >
          CONTINENTAL · BANK · GENEVA
        </text>

        {/* The rotating spoke wheel
             Wrapped in a static <g translate(C,C)> so the wheel's local
             coordinate origin is (0,0). The motion.g rotates around its
             own (0,0) — bulletproof across browsers, no transform-box
             fill-box ambiguity. */}
        <g transform={`translate(${C} ${C})`}>
          <motion.g
            initial={reduce ? false : { rotate: 0 }}
            animate={reduce ? { rotate: -900 } : { rotate: [0, -540, -540, -900] }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    duration: wheelMotionDuration,
                    delay: tWheelDelay,
                    times: wheelMotionTimes,
                    ease: easeInOut,
                  }
            }
            style={{ transformOrigin: "0px 0px" }}
          >
            {/* Outer wheel ring */}
            <circle cx="0" cy="0" r="86" fill="url(#v-body)" stroke="url(#v-gold)" strokeWidth="1.5" />

            {/* Indicator notch on the rim — makes rotation visible */}
            <g>
              <rect x="-2.5" y="-94" width="5" height="12" rx="1.5" fill="url(#v-gold)" />
              <rect x="-1.5" y="-93" width="3" height="6" fill="rgba(255,235,180,0.55)" />
            </g>

            {/* Four spokes (drawn vertically, then rotated) */}
            {[0, 45, 90, 135].map((deg) => (
              <g key={deg} transform={`rotate(${deg})`}>
                <rect x="-3" y="-86" width="6" height="172" rx="2" fill="url(#v-gold)" />
                <rect x="-2" y="-86" width="2" height="172" fill="rgba(255,255,255,0.18)" />
              </g>
            ))}

            {/* Outer wheel grip knobs at N/E/S/W */}
            {[0, 90, 180, 270].map((deg) => (
              <g key={deg} transform={`rotate(${deg})`}>
                <circle cx="0" cy="-86" r="7" fill="url(#v-bolt)" />
                <circle cx="-2" cy="-88" r="2" fill="rgba(255,235,180,0.55)" />
              </g>
            ))}

            {/* Centre hub */}
            <circle cx="0" cy="0" r="28" fill="url(#v-hub)" />
            <circle cx="0" cy="0" r="28" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
            <circle cx="0" cy="0" r="14" fill="#07111F" />
            <circle cx="-3" cy="-3" r="4" fill="rgba(255,235,180,0.35)" />
          </motion.g>
        </g>
        </motion.g>

        {!reduce && (
          <motion.g
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: [0, 0.9, 0], scale: [0.98, 1.012, 1.024] }}
            transition={{ duration: 0.72, delay: tSecureDelay - 0.18, ease: easeOut }}
            style={{ transformOrigin: `${C}px ${C}px` }}
          >
            <circle
              cx={C}
              cy={C}
              r="266"
              fill="none"
              stroke="rgba(229,206,148,0.72)"
              strokeWidth="2"
              filter="url(#v-soft-glow)"
            />
            <circle
              cx={C}
              cy={C}
              r="206"
              fill="none"
              stroke="rgba(200,169,106,0.34)"
              strokeWidth="1"
            />
          </motion.g>
        )}

        {/* ============ ACCESS STATUS INDICATOR ============ */}
        {/* Small champagne lamp at the 6-o'clock of the inner ring */}
        <g>
          {/* Surround */}
          <circle
            cx={C}
            cy={C + 138}
            r="9"
            fill="#0A1527"
            stroke="url(#v-gold)"
            strokeWidth="0.8"
          />
          {/* Lamp — starts dim, turns champagne after the door locks */}
          <motion.circle
            cx={C}
            cy={C + 138}
            r="5"
            initial={reduce ? false : { fill: "#1A2541", opacity: 0.6 }}
            animate={{ fill: "#C8A96A", opacity: 1 }}
            transition={{ duration: 0.5, delay: tSecureDelay, ease: easeOut }}
          />
          {/* Bloom */}
          <motion.circle
            cx={C}
            cy={C + 138}
            r="14"
            fill="rgba(200,169,106,0.4)"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.6, delay: tSecureDelay, ease: easeOut }}
            style={{ filter: "blur(6px)" }}
          />
        </g>
      </motion.svg>

      {/* Access indicator (caption beside the vault) */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -bottom-2 sm:bottom-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10.5px] uppercase tracking-[0.22em]"
        style={{
          background: "rgba(7,17,31,0.7)",
          border: "1px solid rgba(200,169,106,0.3)",
          color: "#E5CE94",
          backdropFilter: "blur(8px)",
        }}
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: tSecureDelay + 0.1, ease: easeOut }}
      >
        <motion.span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "#C8A96A", boxShadow: "0 0 6px rgba(200,169,106,0.8)" }}
          animate={ambient ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        Vault secured
      </motion.div>
    </div>
  );
}
