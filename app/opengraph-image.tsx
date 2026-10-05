import { renderOgCard, OG_SIZE } from "@/lib/og-card";
import { profile } from "@/data/profile";

export const alt = `${profile.name} — ${profile.role}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return renderOgCard({
    eyebrow: profile.role,
    title: `${profile.title} ${profile.titleAccent}`,
    description: profile.description,
  });
}
