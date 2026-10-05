import { renderOgCard, OG_SIZE } from "@/lib/og-card";
import { allProjects, getProject } from "@/data/projects";

export const alt = "Project case study";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return allProjects.map((project) => ({ slug: project.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);

  return renderOgCard({
    eyebrow: project ? `Case study · ${project.type}` : "Case study",
    title: project?.title ?? "Project",
    description: project?.description ?? "",
    logo: project?.logo,
  });
}
