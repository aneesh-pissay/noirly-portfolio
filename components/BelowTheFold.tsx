"use client";

import { useEffect } from "react";
import { About } from "@/components/sections/About";
import { Stack } from "@/components/sections/Stack";
import { Experience } from "@/components/sections/Experience";
import { Work } from "@/components/sections/Work";
import { Contact } from "@/components/sections/Contact";
import type { Profile } from "@/data/profile";
import type { SkillCard } from "@/data/skills";
import type { Project } from "@/data/projects";
import type { WorkExperience } from "@/data/experience";

export interface BelowTheFoldProps {
  profile: Profile;
  skillCards: SkillCard[];
  experience: WorkExperience[];
  projects: Project[];
}

/**
 * Everything under the hero — one async chunk so Lighthouse does not charge
 * About/Work/Experience motion code against first paint.
 */
export function BelowTheFold({
  profile,
  skillCards,
  experience,
  projects,
}: BelowTheFoldProps) {
  // Arriving at "/#contact" from another page, the router scrolls to the hash
  // before this chunk has loaded — the target does not exist yet, so the scroll
  // falls short. Finish the job once the sections are in the DOM, and re-aim
  // while the content above it settles (fonts, images, reveal animations), until
  // the visitor takes over scrolling.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    target.scrollIntoView();

    const userEvents = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    const stop = () => {
      resizeObserver.disconnect();
      window.clearTimeout(timer);
      userEvents.forEach((type) => window.removeEventListener(type, stop));
    };
    // Watch every section, not just the body: one section growing while
    // another shrinks moves the target without changing the page height.
    const resizeObserver = new ResizeObserver(() => target.scrollIntoView());
    document.querySelectorAll("section[id]").forEach((el) => resizeObserver.observe(el));
    resizeObserver.observe(document.body);
    const timer = window.setTimeout(stop, 3000);
    userEvents.forEach((type) => window.addEventListener(type, stop, { passive: true }));
    return stop;
  }, []);

  return (
    <>
      <About profile={profile} />
      <Stack skillCards={skillCards} profile={profile} />
      <Experience workExperience={experience} profile={profile} />
      <Work projects={projects} profile={profile} />
      <Contact profile={profile} />
    </>
  );
}
