import { skillCards, skills, type Skill, type SkillCard } from "@/data/skills";
import { profile, type Profile } from "@/data/profile";
import { allProjects, featuredProjects, type Project } from "@/data/projects";
import { projects as catalogProjects, type Project as CatalogProject } from "@/data/projects/index";
import { workExperience, type WorkExperience } from "@/data/experience";
import { DEFAULT_THEME_ID } from "@/lib/themes/index";

export interface PortfolioTheme {
  id: string;
  name: string;
}

export interface PortfolioContent {
  profile: Profile;
  /** Home-page selection. */
  projects: Project[];
  /** Everything, for /work. */
  allProjects: Project[];
  catalogProjects: CatalogProject[];
  experience: WorkExperience[];
  skills: Skill[];
  skillCards: SkillCard[];
  theme: PortfolioTheme;
}

/**
 * All portfolio content is static and lives in `data/`. Edit those files and
 * redeploy to change what the site shows — there is no content API.
 */
const content: PortfolioContent = {
  profile,
  projects: featuredProjects,
  allProjects,
  catalogProjects,
  experience: workExperience,
  skills,
  skillCards,
  theme: { id: DEFAULT_THEME_ID, name: "Warm Gold" },
};

export async function getPortfolioContent(): Promise<PortfolioContent> {
  return content;
}
