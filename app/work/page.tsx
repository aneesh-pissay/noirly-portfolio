import type { Metadata } from "next";
import { WorkGrid } from "@/components/work/WorkGrid";
import { allProjects } from "@/data/projects";

const description =
  "Products designed, built, and shipped end to end — web apps, realtime systems, and the platform services behind them.";

export const metadata: Metadata = {
  title: "Work",
  description,
  alternates: { canonical: "/work" },
  openGraph: { title: "Work", description, url: "/work" },
};

export default function WorkPage() {
  return (
    <section className="relative">
      <div className="shell section-y">
        <p className="eyebrow">Selected work · {allProjects.length} projects</p>
        <h1 className="display-lg mt-5 max-w-3xl text-[var(--text)]">
          Products I&apos;ve built and shipped
        </h1>
        <p className="lede mt-5 max-w-2xl">{description}</p>

        <WorkGrid projects={allProjects} />
      </div>
    </section>
  );
}
