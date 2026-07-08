"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Mail, Snowflake } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Props = {
  /** When the freeze was applied. Falls back to "recently". */
  frozenAt?: string | null;
  /** Officer-supplied reason. Optional. */
  reason?: string | null;
  /** Contact email shown in the banner CTA. */
  contactEmail?: string;
  /** Contact name (for example, "Escrow desk officer"). */
  contactName?: string;
};

/**
 * Continental Bank — Frozen account overlay.
 *
 * Renders on top of the dashboard when account_status === "suspended":
 *
 *   1. Pale-blue tint over the whole content area (mix-blend lighten)
 *   2. Animated frost drift — a soft white sheen orbiting at 60s
 *   3. Six SVG ice crystals planted at the corners + edges of the
 *      viewport. Each is six-fold rotationally symmetric, drawn in
 *      pure SVG. They breathe + drift sub-pixel.
 *   4. A persistent glass banner pinned to the top with snowflake,
 *      freeze date, reason, and contact CTA. This banner is
 *      pointer-events-auto so the contact link still works.
 *
 *   Everything else (the dashboard content underneath) is rendered
 *   pointer-events-none on form elements via the [data-frozen] CSS
 *   rules in globals.css.
 */
export function FrozenOverlay({
  frozenAt,
  reason,
  contactEmail = "escrow@continentallbank.com",
  contactName = "the escrow desk",
}: Props) {
  const reduce = useReducedMotion();
  const date = frozenAt ? formatDate(frozenAt) : "recently";

  return (
    <>
      {/* ---- Banner (interactive) ---- */}
      <div className="px-3 sm:px-6 lg:px-10 pt-3 lg:pt-4 sticky top-0 z-40 pointer-events-none">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-7xl pointer-events-auto"
        >
          <div
            className="relative overflow-hidden rounded-2xl border px-5 py-3 sm:py-3.5 backdrop-blur-xl flex flex-wrap items-center gap-x-5 gap-y-2"
            style={{
              background:
                "linear-gradient(120deg, rgba(187,222,251,0.16) 0%, rgba(120,180,230,0.22) 60%, rgba(187,222,251,0.16) 100%)",
              borderColor: "rgba(187,222,251,0.45)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(120,180,230,0.25), 0 12px 36px -16px rgba(60,120,180,0.45)",
            }}
          >
            {/* Soft horizontal frost shimmer */}
            {!reduce && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
                  mixBlendMode: "overlay",
                }}
                animate={{ x: ["-30%", "30%"] }}
                transition={{
                  duration: 6.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            )}

            <div className="flex items-center gap-3 min-w-0">
              <span
                className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: "rgba(187,222,251,0.18)",
                  border: "1px solid rgba(187,222,251,0.55)",
                  color: "#dff0fb",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.45), 0 0 18px rgba(187,222,251,0.4)",
                }}
              >
                {reduce ? (
                  <Snowflake className="h-4 w-4" strokeWidth={1.7} />
                ) : (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 32, ease: "linear", repeat: Infinity }}
                    className="inline-flex"
                  >
                    <Snowflake className="h-4 w-4" strokeWidth={1.7} />
                  </motion.span>
                )}
              </span>
              <div className="min-w-0">
                <div className="text-[10.5px] uppercase tracking-[0.18em] text-[#bfe0f5]">
                  Account frozen by Continental Bank · {date}
                </div>
                <div className="mt-0.5 text-[13px] sm:text-[13.5px] font-medium text-ivory-100 leading-snug">
                  {reason ??
                    "Outbound activity, profile changes, and new instructions are paused pending compliance review."}
                </div>
              </div>
            </div>

            <a
              href={`mailto:${contactEmail}`}
              data-frost-allow="true"
              className="ml-auto inline-flex items-center gap-2 rounded-full px-3.5 h-9 text-[12px] font-medium tracking-tight transition-colors duration-200 focus-ring"
              style={{
                background: "rgba(255,255,255,0.92)",
                color: "#0E2A40",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.9), 0 6px 18px -6px rgba(80,140,200,0.45)",
              }}
            >
              <Mail className="h-3.5 w-3.5" />
              Contact {contactName}
            </a>
          </div>
        </motion.div>
      </div>

      {/* ---- Ambient ice layer (decorative) ---- */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
        {/* Pale-blue wash over the navy dashboard */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(140% 90% at 50% 0%, rgba(187,222,251,0.18) 0%, rgba(187,222,251,0.08) 45%, rgba(187,222,251,0.03) 100%)",
            mixBlendMode: "screen",
          }}
        />
        {/* Vignette so the edges feel colder than the center */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(100% 80% at 50% 50%, transparent 40%, rgba(60,120,180,0.10) 100%)",
          }}
        />

        {/* Slowly drifting wide frost sweep */}
        {!reduce && (
          <motion.div
            className="absolute inset-x-0 top-[-20%] h-[140%]"
            style={{
              background:
                "linear-gradient(160deg, transparent 30%, rgba(220,240,255,0.10) 50%, transparent 70%)",
              mixBlendMode: "screen",
            }}
            animate={{ x: ["-20%", "20%"] }}
            transition={{
              duration: 28,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        )}

        {/* Ice crystals planted at the corners + edges */}
        <Crystal
          className="absolute top-[88px] left-[20px] sm:left-[28px] h-[88px] w-[88px] sm:h-[120px] sm:w-[120px]"
          delay={0.0}
          reduce={reduce}
          opacity={0.55}
        />
        <Crystal
          className="absolute top-[120px] right-[20px] sm:right-[36px] h-[64px] w-[64px] sm:h-[96px] sm:w-[96px]"
          delay={0.4}
          reduce={reduce}
          opacity={0.5}
          rotate={18}
        />
        <Crystal
          className="absolute bottom-[120px] left-[40px] h-[80px] w-[80px] sm:h-[112px] sm:w-[112px]"
          delay={0.8}
          reduce={reduce}
          opacity={0.42}
          rotate={-12}
        />
        <Crystal
          className="absolute bottom-[140px] right-[16px] sm:right-[60px] h-[96px] w-[96px] sm:h-[136px] sm:w-[136px]"
          delay={1.2}
          reduce={reduce}
          opacity={0.55}
          rotate={24}
        />
        <Crystal
          className="absolute top-[40%] right-[6%] hidden md:block h-[64px] w-[64px]"
          delay={1.6}
          reduce={reduce}
          opacity={0.35}
          rotate={-9}
        />
        <Crystal
          className="absolute top-[55%] left-[4%] hidden md:block h-[72px] w-[72px]"
          delay={2.0}
          reduce={reduce}
          opacity={0.32}
          rotate={6}
        />
      </div>
    </>
  );
}

/**
 * A six-fold rotationally symmetric ice crystal. Pure SVG — three
 * spokes plus branching limbs. Breathes (opacity + sub-degree drift)
 * after fading in.
 */
function Crystal({
  className,
  delay = 0,
  rotate = 0,
  opacity = 0.5,
  reduce,
}: {
  className?: string;
  delay?: number;
  rotate?: number;
  opacity?: number;
  reduce?: boolean | null;
}) {
  const arms = [0, 60, 120];

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, scale: 0.92 }}
      animate={
        reduce
          ? { opacity }
          : { opacity: [0, opacity, opacity * 0.78, opacity], scale: 1 }
      }
      transition={
        reduce
          ? { duration: 0.4, delay }
          : {
              duration: 8,
              delay,
              ease: "easeInOut",
              times: [0, 0.18, 0.6, 1],
              repeat: Infinity,
              repeatType: "reverse",
            }
      }
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <svg viewBox="-50 -50 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="crystal-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="60%" stopColor="rgba(200,230,250,0.10)" />
            <stop offset="100%" stopColor="rgba(200,230,250,0)" />
          </radialGradient>
        </defs>

        {/* Halo */}
        <circle r="46" fill="url(#crystal-glow)" />

        {/* Three through-spokes (six visible arms) */}
        {arms.map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            {/* Main spoke */}
            <line
              x1="0"
              y1="-44"
              x2="0"
              y2="44"
              stroke="rgba(232,244,255,0.78)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* Mid branches */}
            <line
              x1="0"
              y1="-26"
              x2="6"
              y2="-32"
              stroke="rgba(232,244,255,0.6)"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="-26"
              x2="-6"
              y2="-32"
              stroke="rgba(232,244,255,0.6)"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="26"
              x2="6"
              y2="32"
              stroke="rgba(232,244,255,0.6)"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="26"
              x2="-6"
              y2="32"
              stroke="rgba(232,244,255,0.6)"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            {/* Tip branches */}
            <line
              x1="0"
              y1="-40"
              x2="4"
              y2="-44"
              stroke="rgba(232,244,255,0.5)"
              strokeWidth="0.7"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="-40"
              x2="-4"
              y2="-44"
              stroke="rgba(232,244,255,0.5)"
              strokeWidth="0.7"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="40"
              x2="4"
              y2="44"
              stroke="rgba(232,244,255,0.5)"
              strokeWidth="0.7"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="40"
              x2="-4"
              y2="44"
              stroke="rgba(232,244,255,0.5)"
              strokeWidth="0.7"
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Centre node */}
        <circle r="2" fill="rgba(255,255,255,0.85)" />
      </svg>
    </motion.div>
  );
}
