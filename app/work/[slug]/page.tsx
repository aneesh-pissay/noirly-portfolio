import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import {
  ProjectFeatureGraphic,
  ProjectLogo,
} from "@/components/projects/ProjectFeatureGraphic";
import { allProjects, getProject } from "@/data/projects";
import { profile } from "@/data/profile";

/** Only the slugs in data/projects.ts exist; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return allProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title = `${project.title} — ${project.type} case study`;
  return {
    title,
    description: project.description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title,
      description: project.description,
      url: `/work/${project.slug}`,
      type: "article",
    },
    twitter: { card: "summary_large_image", title, description: project.description },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = allProjects.findIndex((p) => p.slug === project.slug);
  const next = allProjects[(index + 1) % allProjects.length];
  const { caseStudy } = project;

  return (
    <article className="relative">
      <div className="shell pt-10 pb-16 md:pt-14 lg:pb-24">
        <Link
          href="/work"
          className="mono-label inline-flex items-center gap-2 transition-colors hover:text-[var(--text)]"
        >
          <ArrowLeft size={13} aria-hidden />
          All work
        </Link>

        {/* Header */}
        <header className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-4">
              <ProjectLogo title={project.title} logo={project.logo} />
              <p className="eyebrow">
                {String(index + 1).padStart(2, "0")} — {project.type}
              </p>
            </div>
            <h1 className="display-xl mt-6 text-[var(--text)]">{project.title}</h1>
            <p className="lede mt-5 max-w-2xl">{project.description}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-solid"
            >
              Visit live product
              <ArrowUpRight size={14} aria-hidden />
            </a>
            <Link href="/#contact" className="btn btn-ghost">
              Start a similar project
            </Link>
          </div>
        </header>

        {/* Plate — decorative, and it repeats the title, so it is left out on
            phones where it would sit directly under the heading it echoes. */}
        <div className="surface mt-12 hidden overflow-hidden rounded-[var(--r-lg)] md:block">
          <div className="flex min-h-[280px] bg-[var(--bg-deep)] lg:min-h-[380px]">
            <ProjectFeatureGraphic title={project.title} type={project.type} />
          </div>
        </div>

        {/* Body */}
        <div className="mt-12 grid grid-cols-1 md:mt-14 gap-12 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <dl className="space-y-6">
              <div>
                <dt className="mono-label">Category</dt>
                <dd className="copy mt-2">
                  {project.type} · {project.category}
                </dd>
              </div>
              <div>
                <dt className="mono-label">Stack</dt>
                <dd className="mt-3">
                  <ul className="flex flex-wrap gap-2">
                    {project.stack.map((tag) => (
                      <li key={tag} className="chip">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="mono-label">Live</dt>
                <dd className="copy mt-2">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                  >
                    {new URL(project.url).hostname}
                    <ArrowUpRight size={13} aria-hidden />
                  </a>
                </dd>
              </div>
            </dl>
          </aside>

          <div className="max-w-3xl space-y-12">
            <section>
              <h2 className="display-md text-[var(--text)]">The problem</h2>
              <p className="copy mt-4">{caseStudy.problem}</p>
            </section>

            <section>
              <h2 className="display-md text-[var(--text)]">What I built</h2>
              <p className="copy mt-4">{caseStudy.approach}</p>
            </section>

            <section>
              <h2 className="display-md text-[var(--text)]">Highlights</h2>
              <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {caseStudy.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--hairline-strong)]">
                      <Check size={11} aria-hidden />
                    </span>
                    <span className="copy">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Call to action */}
        <div className="surface mt-16 flex flex-col items-start justify-between gap-6 rounded-[var(--r-lg)] p-7 md:flex-row md:items-center md:p-9">
          <div>
            <p className="display-md text-[var(--text)]">Have a project like this in mind?</p>
            <p className="copy mt-2">{profile.ctaSubtitle}</p>
          </div>
          <Link href="/#contact" className="btn btn-solid shrink-0">
            Start a conversation
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>

        {/* Next project */}
        {next && next.slug !== project.slug ? (
          <Link
            href={`/work/${next.slug}`}
            className="group mt-10 flex items-center justify-between gap-6 border-t border-[var(--hairline)] pt-8"
          >
            <span>
              <span className="mono-label">Next project</span>
              <span className="display-md mt-2 block text-[var(--text)] transition-colors group-hover:text-[var(--accent)]">
                {next.title}
              </span>
            </span>
            <ArrowRight
              size={20}
              aria-hidden
              className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
