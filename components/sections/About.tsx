"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  Check,
  Cloud,
  Database,
  Monitor,
  Server,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Reveal, StaggerGroup, RevealItem, SpotlightCard, fadeUp, VIEWPORT, EASE_OUT } from "@noirly-dev/ui/motion";
import { profile as defaultProfile } from "@/data/profile";
import type { Profile } from "@/data/profile";
import { archLayers, type ArchIconKey, type ArchLayer } from "@/data/architecture";

const ARCH_ICONS: Record<ArchIconKey, LucideIcon> = {
  Monitor,
  Server,
  Database,
  Cloud,
};

const LAYER_COUNT = archLayers.length;

const springConfig = {
  stiffness: 120,
  damping: 30,
  restDelta: 0.001,
} as const;

/** Vertical connector — fills segment-by-segment as the panel scrolls into view. */
function FlowLine({
  scrollYProgress,
  index,
}: {
  scrollYProgress: MotionValue<number>;
  index: number;
}) {
  const lineProgress = useTransform(
    scrollYProgress,
    [(index + 0.45) / LAYER_COUNT, (index + 1.15) / LAYER_COUNT],
    [0, 1],
  );
  const smoothed = useSpring(lineProgress, springConfig);
  const dotTop = useTransform(smoothed, [0, 1], ["0%", "100%"]);
  const dotOpacity = useTransform(smoothed, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return (
    <div
      aria-hidden
      className="relative mx-auto my-1.5 h-7 w-px bg-[var(--hairline)]"
    >
      <motion.div
        className="absolute inset-0 origin-top bg-[var(--text-muted)]"
        style={{ scaleY: smoothed }}
      />
      <motion.div
        className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_10px_color-mix(in_srgb,var(--accent)_55%,transparent)]"
        style={{ top: dotTop, opacity: dotOpacity }}
      />
    </div>
  );
}

function ArchLayerCard({
  layer,
  index,
  scrollYProgress,
}: {
  layer: ArchLayer;
  index: number;
  scrollYProgress: MotionValue<number>;
}) {
  const Icon = ARCH_ICONS[layer.iconKey];
  const highlight = useTransform(
    scrollYProgress,
    [
      (index - 0.15) / LAYER_COUNT,
      (index + 0.45) / LAYER_COUNT,
      (index + 1.05) / LAYER_COUNT,
    ],
    [0, 1, 0],
  );
  const ringOpacity = useTransform(highlight, [0, 1], [0, 1]);
  const iconScale = useTransform(highlight, [0, 1], [1, 1.08]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{
        duration: 0.4,
        ease: EASE_OUT,
        delay: index * 0.06,
      }}
    >
      <SpotlightCard animateIn={false} className="relative rounded-[var(--r-md)] p-4">
      <motion.div
        aria-hidden
        className="accent-ring-inset pointer-events-none absolute inset-0"
        style={{ opacity: ringOpacity }}
      />

      <div className="relative mb-3 flex items-center gap-3">
        <motion.span
          style={{ scale: iconScale }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--r-sm)] border border-[var(--hairline)] bg-[color-mix(in_srgb,var(--text)_4%,transparent)] text-[var(--text-secondary)]"
        >
          <Icon size={14} aria-hidden />
        </motion.span>
        <span className="mono-label text-[var(--text-secondary)]">{layer.label}</span>
      </div>

      <ul className="relative flex flex-wrap gap-2">
        {layer.tech.map((tech) => (
          <li key={tech} className="chip">
            {tech}
          </li>
        ))}
      </ul>
      </SpotlightCard>
    </motion.div>
  );
}

export function About({ profile = defaultProfile }: { profile?: Profile }) {
  const panelRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: panelRef,
    offset: ["start 85%", "end 45%"],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="about" className="section-rule relative">
      <div className="shell section-y grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading index="01" eyebrow="About" title={profile.aboutTitle} />

          <Reveal variants={fadeUp} delay={0.1}>
            <p className="copy mt-5 max-w-[52ch] text-base">{profile.aboutBio}</p>
          </Reveal>

          <StaggerGroup gap={0.08} delay={0.15} as="ul" className="mt-7 space-y-4">
            {profile.aboutPoints.map((item) => (
              <RevealItem key={item} as="li" className="flex items-start gap-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--hairline-strong)] text-[var(--text-secondary)]">
                  <Check size={12} aria-hidden />
                </span>
                <span className="copy">{item}</span>
              </RevealItem>
            ))}
          </StaggerGroup>
        </div>

        {/* Architecture panel */}
        <Reveal variants={fadeUp} delay={0.1} className="lg:pt-2">
          <SpotlightCard ref={panelRef} animateIn={false} lift={false} className="relative">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 h-40 -translate-y-1/2 opacity-60"
              style={{
                top: glowY,
                background:
                  "radial-gradient(60% 50% at 50% 50%, var(--glow), transparent 70%)",
              }}
            />

            <div className="relative flex items-center justify-between border-b border-[var(--hairline)] px-5 py-4">
              <span className="mono-label inline-flex items-center">
                system_architecture
                <motion.span
                  aria-hidden
                  animate={{ opacity: [1, 1, 0, 0] }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    ease: "linear",
                    times: [0, 0.49, 0.5, 1],
                  }}
                >
                  _
                </motion.span>
              </span>
              <span className="mono-label inline-flex items-center gap-2">
                <motion.span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                  animate={{ opacity: [1, 0.25, 1], scale: [1, 0.85, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
                production
              </span>
            </div>

            <div className="relative flex flex-col p-5">
              {archLayers.map((layer, index) => (
                <div key={layer.id} className="flex flex-col">
                  <ArchLayerCard
                    layer={layer}
                    index={index}
                    scrollYProgress={scrollYProgress}
                  />

                  {index < archLayers.length - 1 ? (
                    <FlowLine scrollYProgress={scrollYProgress} index={index} />
                  ) : null}
                </div>
              ))}
            </div>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}
