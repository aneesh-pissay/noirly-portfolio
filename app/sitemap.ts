import type { MetadataRoute } from "next";
import { allProjects } from "@/data/projects";

const SITE = "https://www.aneesh-pissay.in";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/work`, changeFrequency: "monthly", priority: 0.9 },
    ...allProjects.map((project) => ({
      url: `${SITE}/work/${project.slug}`,
      changeFrequency: "monthly" as const,
      priority: project.featured ? 0.8 : 0.7,
    })),
  ];
}
