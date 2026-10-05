"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  type Variants,
} from "framer-motion";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Reveal, StaggerGroup, Counter, SpotlightCard, fadeUp, VIEWPORT, DURATION, EASE_OUT } from "@noirly-dev/ui/motion";
import { profile as defaultProfile } from "@/data/profile";
import { workExperience as defaultExperience } from "@/data/experience";
import type { Profile } from "@/data/profile";
import type { WorkExperience } from "@/data/experience";

/**
 * Career timeline.
 *
 * Each card arrives in one quick beat (about half a second) and every line is
 * fully readable as soon as it lands — no word-by-word reveal, no dimmed copy
 * waiting for the reader to scroll. The only scroll-linked motion is the rail
 * on the left, which fills as the reader moves through the roles.
 */

/** Seconds after an entry enters the fold, per part of the entrance. Kept
 *  short so the whole card has settled before the reader starts on it. */
const BEAT = {
  underline: 0.12,
  rule: 0.1,
  company: 0.06,
  period: 0.1,
  tenure: 0.14,
  status: 0.18,
  achievements: 0.12,
} as const;

/** Distance between two entries' sequences, so a list reads top-to-bottom. */
const ENTRY_OFFSET = 0.05;

/** The row itself only sequences; its two halves carry the visible motion. */
const achievementRow: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

/** The index leads the copy by a beat — the line looks numbered, then written. */
const achievementIndex: Variants = {
  hidden: { opacity: 0, x: -6 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

const achievementText: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE_OUT },
  },
};

interface Tenure {
  years: number;
  current: boolean;
}

/** Reads "September 2021 – Present" into something countable. */
function readTenure(period: string): Tenure | null {
  const found = period.match(/\b(?:19|20)\d{2}\b/g);
  if (!found) return null;
  const current = /present|current|now/i.test(period);
  const start = Number(found[0]);
  const end = current ? new Date().getFullYear() : Number(found[1] ?? found[0]);
  return { years: Math.max(0, end - start), current };
}

/* -------------------------------- Achievement ------------------------------- */

interface AchievementProps {
  item: string;
  index: number;
  last: boolean;
}

function Achievement({ item, index, last }: AchievementProps) {
  const label = String(index + 1).padStart(2, "0");

  return (
    // Inherits hidden/show from the StaggerGroup above.
    <motion.li variants={achievementRow} className="group relative">
      <div
        className="flex gap-4 py-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
      >
        <motion.span
          variants={achievementIndex}
          className="mono-label w-6 shrink-0 pt-0.5 tabular-nums text-[var(--text-muted)]"
        >
          {label}
        </motion.span>

        <motion.p variants={achievementText} className="copy">
          {item}
        </motion.p>
      </div>

      {last ? null : (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--hairline)]"
        />
      )}
    </motion.li>
  );
}

/* ------------------------------- Timeline entry ----------------------------- */

interface TimelineEntryProps {
  job: WorkExperience;
  index: number;
}

function TimelineEntry({ job, index }: TimelineEntryProps) {
  const base = index * ENTRY_OFFSET;
  const tenure = readTenure(job.period);

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.45, ease: EASE_OUT, delay: base }}
      className="relative"
    >
      <SpotlightCard as="article" animateIn={false}>
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="relative p-6 md:col-span-4 md:p-8">
            <h3 className="display-md">{job.role}</h3>

            {/* Accent underline, drawn after the role has landed. */}
            <motion.span
              aria-hidden
              className="mt-4 block h-px w-12 origin-left bg-[var(--accent)]"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={VIEWPORT}
              transition={{
                delay: base + BEAT.underline,
                duration: DURATION.slow,
                ease: EASE_OUT,
              }}
            />

            <Reveal
              as="p"
              variants={fadeUp}
              delay={base + BEAT.company}
              className="mono-label mt-4 text-[var(--text-secondary)]"
            >
              {job.company}
            </Reveal>

            <Reveal
              as="p"
              variants={fadeUp}
              delay={base + BEAT.period}
              className="mono-label mt-2"
            >
              {job.period}
            </Reveal>

            {tenure && tenure.years > 0 ? (
              <Reveal
                variants={fadeUp}
                delay={base + BEAT.tenure}
                className="mt-7 flex items-end gap-3"
              >
                <p className="numeral text-[2rem] leading-none">
                  <Counter value={tenure.years} suffix="+" />
                </p>
                <p className="mono-label leading-snug">
                  years
                  <br />
                  in role
                </p>
              </Reveal>
            ) : null}

            {tenure?.current ? (
              <Reveal variants={fadeUp} delay={base + BEAT.status} className="mt-5">
                <span className="chip inline-flex items-center gap-2">
                  <motion.span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                    animate={{ opacity: [1, 0.25, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  Current role
                </span>
              </Reveal>
            ) : null}

            {/* The column rule, drawn rather than painted, so the card finishes
                assembling instead of arriving pre-built: horizontal under the
                meta on narrow screens, vertical between the columns once they
                sit side by side. */}
            <motion.span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--hairline)] md:hidden"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={VIEWPORT}
              transition={{
                delay: base + BEAT.rule,
                duration: DURATION.slow,
                ease: EASE_OUT,
              }}
            />
            <motion.span
              aria-hidden
              className="absolute inset-y-0 right-0 hidden w-px origin-top bg-[var(--hairline)] md:block"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={VIEWPORT}
              transition={{
                delay: base + BEAT.rule,
                duration: DURATION.slow,
                ease: EASE_OUT,
              }}
            />
          </div>

          <StaggerGroup
            gap={0.07}
            delay={base + BEAT.achievements}
            as="ul"
            className="p-6 md:col-span-8 md:p-8"
          >
            {job.achievements.map((item, j) => (
              <Achievement
                key={item}
                item={item}
                index={j}
                last={j === job.achievements.length - 1}
              />
            ))}
          </StaggerGroup>
        </div>
      </SpotlightCard>
    </motion.li>
  );
}

/* --------------------------------- Section ---------------------------------- */

export function Experience({
  workExperience = defaultExperience,
  profile = defaultProfile,
}: {
  workExperience?: WorkExperience[];
  profile?: Profile;
}) {
  const railRef = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 80%", "end 60%"],
  });
  const railFill = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  // MotionConfig's `reducedMotion="user"` only governs animated transitions, not
  // style-bound motion values — a scroll-linked scaleY would keep moving right
  // through the setting. Swapping in a constant leaves the rail drawn and the
  // nodes lit, with nothing tracking the scroll.
  const settled = useMotionValue(1);
  const fill = reduced ? settled : railFill;

  return (
    <section id="experience" className="section-rule relative">
      <div className="shell section-y">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading index="03" eyebrow="Career" title="Work Experience" />
          <Reveal variants={fadeUp} delay={0.1}>
            <p className="lede max-w-sm md:text-right">
              {profile.experienceSubtitle}
            </p>
          </Reveal>
        </div>

        <ol ref={railRef} className="relative mt-10 space-y-5 pl-8 md:pl-12">
          {/* Timeline rail — fills as the reader scrolls through the roles. */}
          <div
            aria-hidden
            className="absolute left-[3px] top-2 bottom-2 w-px bg-[var(--hairline)] md:left-[7px]"
          >
            <motion.div
              className="absolute inset-0 origin-top bg-[var(--text)]"
              style={{ scaleY: fill }}
            />
          </div>

          {workExperience.map((job, i) => (
            <TimelineEntry
              key={`${job.company}-${job.period}`}
              job={job}
              index={i}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
