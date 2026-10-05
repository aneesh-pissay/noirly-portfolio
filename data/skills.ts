export type SkillIconKey = "Globe" | "Smartphone" | "Server" | "Cloud";

export interface SkillCard {
  iconKey: SkillIconKey;
  title: string;
  tags: string[];
  color: string;
}

export const skillCards: SkillCard[] = [
  {
    iconKey: "Globe",
    title: "Frontend",
    tags: ["React", "Next.js", "TypeScript", "Tailwind"],
    color: "var(--text)",
  },
  {
    iconKey: "Smartphone",
    title: "Mobile",
    tags: ["React Native", "iOS", "Android", "Redux"],
    color: "var(--text)",
  },
  {
    iconKey: "Server",
    title: "Backend",
    tags: ["Node.js", "Express", "MongoDB", "REST APIs"],
    color: "var(--text)",
  },
  {
    iconKey: "Cloud",
    title: "DevOps",
    tags: ["AWS", "Docker", "CI/CD", "GitHub Actions"],
    color: "var(--text)",
  },
];

/** One entry on the /skills page. `iconKey` resolves through lib/content/icons. */
export interface Skill {
  label: string;
  category: string;
  color: string;
  iconKey: string;
}

export const skills: Skill[] = [
  { label: "JavaScript", category: "Frontend & Languages", color: "#F7DF1E", iconKey: "javascript" },
  { label: "TypeScript", category: "Frontend & Languages", color: "#3178C6", iconKey: "typescript" },
  { label: "React", category: "Frontend & Languages", color: "#61DAFB", iconKey: "react" },
  { label: "Next.js", category: "Frontend & Languages", color: "#000000", iconKey: "react" },

  { label: "React Native", category: "Mobile & Backend", color: "#61DAFB", iconKey: "react" },
  { label: "Android", category: "Mobile & Backend", color: "#3DDC84", iconKey: "android" },
  { label: "Node.js", category: "Mobile & Backend", color: "#339933", iconKey: "nodejs" },
  { label: "Firebase", category: "Mobile & Backend", color: "#FFCA28", iconKey: "firebase" },
  { label: "MongoDB", category: "Mobile & Backend", color: "#47A248", iconKey: "mongodb" },

  { label: "Azure", category: "DevOps & Cloud", color: "#0078D4", iconKey: "azure" },
  { label: "Git", category: "DevOps & Cloud", color: "#F05032", iconKey: "git" },
  { label: "Docker", category: "DevOps & Cloud", color: "#2496ED", iconKey: "docker" },
  { label: "Fastlane", category: "DevOps & Cloud", color: "#00D4AA", iconKey: "fastlane" },
  { label: "GitHub Actions", category: "DevOps & Cloud", color: "#2088FF", iconKey: "github-actions" },
  { label: "CI/CD Pipelines", category: "DevOps & Cloud", color: "#FF6B35", iconKey: "ci-cd" },

  { label: "Jest", category: "Testing & QA", color: "#C21325", iconKey: "jest" },
  { label: "Detox", category: "Testing & QA", color: "#61DAFB", iconKey: "detox" },
  { label: "Cypress", category: "Testing & QA", color: "#17202C", iconKey: "cypress" },
];
