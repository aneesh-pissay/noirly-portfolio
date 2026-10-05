"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SpotlightCard, VIEWPORT, EASE_OUT } from "@noirly-dev/ui/motion";
import { ProjectLogo } from "@/components/projects/ProjectFeatureGraphic";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/projects";

const ALL = "All";

/** Stack tags shown on a card before the rest collapse into "+n". */
const STACK_PREVIEW = 4;

/**
 * Every project as a card that opens its case study. The category filter only
 * appears once there is more than one category to choose between.
 */
export function WorkGrid({ projects }: { projects: Project[] }) {
  const categories = Array.from(new Set(projects.map((p) => p.category)));
  const [active, setActive] = useState<string>(ALL);
  const visible =
    active === ALL ? projects : projects.filter((p) => p.category === active);

  return (
    <>
      {categories.length > 1 ? (
        <div role="group" aria-label="Filter projects" className="mt-10 flex flex-wrap gap-2">
          {[ALL, ...categories].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              aria-pressed={active === category}
              className={cn(
                "chip cursor-pointer transition-colors",
                active === category &&
                  "border-[var(--text)] bg-[var(--text)] text-[var(--bg)]",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      ) : null}

      <ul className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((project, i) => (
          <motion.li
            key={project.slug}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.4, ease: EASE_OUT, delay: (i % 3) * 0.05 }}
          >
            <SpotlightCard animateIn={false} className="group relative h-full">
              <div className="flex h-full flex-col p-6 md:p-7">
                <div className="flex items-center gap-4">
                  <ProjectLogo title={project.title} logo={project.logo} />
                  <div>
                    <p className="mono-label">{project.type}</p>
                    <h2 className="display-md mt-1">
                      {/* The stretched link makes the whole card clickable
                          while keeping one accessible link name. */}
                      <Link
                        href={`/work/${project.slug}`}
                        className="after:absolute after:inset-0 after:content-['']"
                      >
                        {project.title}
                      </Link>
                    </h2>
                  </div>
                </div>

                <p className="copy mt-5 flex-1">{project.description}</p>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {project.stack.slice(0, STACK_PREVIEW).map((tag) => (
                    <li key={tag} className="chip">
                      {tag}
                    </li>
                  ))}
                  {project.stack.length > STACK_PREVIEW ? (
                    <li className="chip">+{project.stack.length - STACK_PREVIEW}</li>
                  ) : null}
                </ul>

                <p className="mono-label mt-6 inline-flex items-center gap-2 text-[var(--text)]">
                  Case study
                  <ArrowRight
                    size={13}
                    aria-hidden
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </p>
              </div>
            </SpotlightCard>
          </motion.li>
        ))}
      </ul>
    </>
  );
}
