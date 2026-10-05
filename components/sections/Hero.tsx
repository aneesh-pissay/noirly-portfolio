"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown, ArrowUpRight, Check } from "lucide-react";
import { TextReveal, Reveal, StaggerGroup, RevealItem, SpotlightCard, Counter, fadeUp, DURATION, EASE_OUT } from "@noirly-dev/ui/motion";
import { profile as defaultProfile } from "@/data/profile";
import type { Profile } from "@/data/profile";
import { useInstantEntrance } from "@noirly-dev/ui";

/** Canvas + noise worker stay off the critical path; decorative only. */
const HeroCanvas = dynamic(
  () => import("@/components/HeroCanvas").then((m) => m.HeroCanvas),
  { ssr: false },
);

const Marquee = dynamic(
  () => import("@noirly-dev/ui/motion").then((m) => m.Marquee),
  {
    ssr: false,
    // One invisible chip reserves the row's height, so the hero does not grow
    // (and shift everything below it) when the marquee mounts.
    loading: () => (
      <div aria-hidden className="flex">
        <span className="chip invisible">&nbsp;</span>
      </div>
    ),
  },
);

/** Splits "5+" into 5 and "+" so the number can count up and the suffix can't. */
function splitStat(value: string): { number: number; suffix: string } | null {
  const match = /^(\d+)(\D*)$/.exec(value.trim());
  if (!match) return null;
  return { number: Number(match[1]), suffix: match[2] };
}

export function Hero({ profile = defaultProfile }: { profile?: Profile }) {
  const ref = useRef<HTMLElement>(null);
  const instant = useInstantEntrance();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Content drifts up and dims as the hero leaves — skipped on touch/narrow.
  const y = useTransform(scrollYProgress, [0, 1], instant ? [0, 0] : [0, 90]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.8],
    instant ? [1, 1] : [1, 0],
  );

  const { heroStats, techChips, heroHighlights } = profile;

  return (
    <section id="home" ref={ref} className="relative overflow-hidden">
      {/*
        Ambient light. Decorative only — never eats a pointer event.
        This layer is a sibling of the content below, not a parent of it: the
        canvas paints underneath the headline without the text ever becoming a
        descendant of a <canvas> wrapper, so nothing above it inherits
        pointer-events: none or gets pulled into the canvas's stacking context.
      */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <HeroCanvas />
        <div className="aura hero-aura -top-40 left-[-10%] h-[32rem] w-[32rem]" />
        <div className="aura hero-aura right-[-15%] top-20 h-[26rem] w-[26rem]" />
      </div>

      <motion.div
        style={{ y, opacity }}
        className="shell relative pt-12 pb-16 md:pt-14 lg:pt-16 lg:pb-20"
      >
        {/* Masthead — the headline gets the full measure, so it sets on two
            lines instead of being squeezed into a column and towering. */}
        <Reveal variants={fadeUp} priority>
          <p className="eyebrow">{profile.badge}</p>
        </Reveal>

        <h1 className="hero-headline display-xl mt-6 max-w-[24ch]">
          <TextReveal
            text={profile.title}
            delay={0.08}
            priority
            className="display-xl block text-[var(--text)]"
          />
          {/* The two lines are separate block elements; without this the
              accessible name reads "ScalableWeb" as one word. */}{" "}
          <TextReveal
            text={profile.titleAccent}
            delay={0.18}
            outline
            priority
            className="display-xl block"
          />
        </h1>

        {/* Both columns hang from the same top line — nothing is centred
            against a taller neighbour, so there is no dead space to fill. */}
        <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,24rem)] lg:gap-14">
          <div className="flex flex-col">
            <Reveal variants={fadeUp} delay={0.3} priority>
              <p className="lede">{profile.description}</p>
            </Reveal>

            <StaggerGroup gap={0.07} delay={0.38} className="mt-8 flex flex-wrap gap-3">
              <RevealItem>
                <Link href="/#work" className="btn btn-solid">
                  View work
                  <ArrowUpRight size={14} aria-hidden />
                </Link>
              </RevealItem>
              <RevealItem>
                <Link href="/#contact" className="btn btn-ghost">
                  {profile.secondaryCta}
                </Link>
              </RevealItem>
            </StaggerGroup>
          </div>

          {/* Capability panel */}
          <Reveal variants={fadeUp} delay={0.2} className="w-full">
            <SpotlightCard animateIn={false} lift={false} className="w-full">
              <div className="flex items-center justify-between border-b border-[var(--hairline)] px-5 py-3.5">
                <span className="mono-label">core_stack</span>
                <span className="flex items-center gap-2">
                  <motion.span
                    className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                    animate={{ opacity: [1, 0.25, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    aria-hidden
                  />
                  <span className="mono-label">available</span>
                </span>
              </div>

              <StaggerGroup gap={0.08} delay={0.1} as="ul" className="space-y-3 p-5">
                {heroHighlights.map((item) => (
                  <RevealItem key={item} as="li" className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--hairline-strong)]">
                      <Check size={11} aria-hidden />
                    </span>
                    <span className="copy">{item}</span>
                  </RevealItem>
                ))}
              </StaggerGroup>

              <div className="border-t border-[var(--hairline)] py-3.5">
                <Marquee items={techChips} speed={34} />
              </div>
            </SpotlightCard>
          </Reveal>
        </div>

        {/* Stats span the full measure — a horizontal rule of fact that closes
            the hero and squares off the ragged bottom of the two columns. */}
        <SpotlightCard animateIn={false} lift={false} className="mt-12">
          <StaggerGroup
            gap={0.08}
            delay={0.45}
            as="ul"
            className="grid grid-cols-1 sm:grid-cols-3"
          >
          {heroStats.map((stat) => {
            const parsed = splitStat(stat.value);
            return (
              <RevealItem
                key={stat.label}
                as="li"
                className="border-t border-[var(--hairline)] px-5 py-5 first:border-t-0 sm:border-t-0 sm:border-l sm:first:border-l-0 sm:px-6 sm:py-6"
              >
                <p className="numeral text-[1.75rem] sm:text-[2rem]">
                  {parsed ? (
                    <Counter value={parsed.number} suffix={parsed.suffix} />
                  ) : (
                    stat.value
                  )}
                </p>
                <p className="mono-label mt-2.5 leading-snug">{stat.label}</p>
              </RevealItem>
            );
          })}
          </StaggerGroup>
        </SpotlightCard>
      </motion.div>

      {/* Scroll cue — absolutely placed so it adds no height to the hero. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: DURATION.slow, ease: EASE_OUT }}
        className="pointer-events-none absolute inset-x-0 bottom-5 hidden lg:block"
      >
        <div className="shell">
          <motion.span
            className="mono-label inline-flex items-center gap-2"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={13} />
            Scroll
          </motion.span>
        </div>
      </motion.div>
    </section>
  );
}
