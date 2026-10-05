"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { motion } from "framer-motion";
import { SpotlightCard, VIEWPORT, EASE_OUT } from "@noirly-dev/ui/motion";
import {
  ProjectFeatureGraphic,
  ProjectLogo,
} from "@/components/projects/ProjectFeatureGraphic";
import { cn } from "@/lib/utils";
import { profile as defaultProfile } from "@/data/profile";
import { allProjects, featuredProjects as defaultProjects, type Project } from "@/data/projects";
import type { Profile } from "@/data/profile";

interface ProjectRowProps {
  project: Project;
  index: number;
}

function ProjectRow({ project, index }: ProjectRowProps) {
  const flip = index % 2 === 1;

  return (
    // A short, calm entrance: the card is readable almost as soon as it
    // scrolls in. The hover is a small lift plus the pointer spotlight — no
    // tilt or magnetic pull, so the card and its button stay still under the
    // pointer and are easy to click.
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.45, ease: EASE_OUT }}
    >
      <SpotlightCard
        as="article"
        animateIn={false}
        className="group h-full"
      >
        <div
          className={cn(
            "flex flex-col lg:flex-row",
            flip && "lg:flex-row-reverse",
          )}
        >
          {/* The graphic is a rendered composition, not a photograph. It used to
              sit in an `inset-[-6%]` box with a scroll-parallax translate, which
              crops ~38px off each side and up to 12% off the top or bottom — fine
              for an image, but it sliced this plate's padding and its bottom panel,
              and left nothing lined up with the card edges. It now fills the column
              exactly and sizes to its own content. */}
          <div className="relative flex min-h-[240px] overflow-hidden bg-[var(--bg-deep)] lg:min-h-[340px] lg:w-[56%]">
            <ProjectFeatureGraphic title={project.title} type={project.type} />
          </div>

          <div
            className={cn(
              "flex flex-col justify-between gap-8 border-t border-[var(--hairline)] p-6 md:p-9 lg:w-[44%] lg:border-t-0",
              flip ? "lg:border-r" : "lg:border-l",
            )}
          >
            <div>
              <div className="flex items-center gap-4">
                <ProjectLogo title={project.title} logo={project.logo} />
                <div>
                  <p className="mono-label">
                    {String(index + 1).padStart(2, "0")} — {project.type}
                  </p>
                  <h3 className="display-md mt-1.5">
                    <Link
                      href={`/work/${project.slug}`}
                      className="transition-colors hover:text-[var(--accent)]"
                    >
                      {project.title}
                    </Link>
                  </h3>
                </div>
              </div>

              <p className="copy mt-6">{project.description}</p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {project.stack.map((tag) => (
                  <li key={tag} className="chip">
                    {tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={`/work/${project.slug}`} className="btn btn-solid">
                Read case study
                <ArrowRight size={14} aria-hidden />
              </Link>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                Live product
                <ArrowUpRight size={14} aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

export function Work({
  projects = defaultProjects,
  profile = defaultProfile,
}: {
  projects?: Project[];
  profile?: Profile;
}) {
  return (
    <section id="work" className="section-rule relative">
      <div className="shell section-y">
        <SectionHeading
          index="04"
          eyebrow="Selected Work"
          title="Featured Projects"
          subtitle={profile.workSubtitle}
          className="max-w-2xl"
        />

        <div className="mt-10 space-y-5">
          {projects.map((project, i) => (
            <ProjectRow key={project.slug} project={project} index={i} />
          ))}
        </div>

        {/* The home page shows a selection; everything lives on /work, so
            adding projects never makes this page longer. */}
        <div className="mt-10 flex justify-center">
          <Link href="/work" className="btn btn-ghost">
            View all {allProjects.length} projects
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
