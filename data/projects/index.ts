export interface Project {
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  imageUrlDark?: string;
  logoUrl?: string;
  logoUrlDark?: string;
  url: string;
  githubUrl: string;
  category: string;
}

export const projects: Project[] = [
  {
    title: "Noirly Flow",
    description:
      "Boards, workspaces, and realtime collaboration for Noirly products — signed in through Noirly Identity.",
    technologies: ["Next.js", "React", "TypeScript", "MongoDB", "Auth.js"],
    imageUrl: "/projects/noirly-flow-feature-light.png",
    imageUrlDark: "/projects/noirly-flow-feature-dark.png",
    logoUrl: "/projects/noirly-flow.svg",
    logoUrlDark: "/projects/noirly-flow.svg",
    url: "https://noirly.flow.aneesh-pissay.in/",
    githubUrl: "#",
    category: "Web",
  },
  {
    title: "Noirly Ledger",
    description:
      "Personal and team money tracking — budgets, expenses, pools, approvals, and reports across workspaces.",
    technologies: ["Next.js", "React", "TypeScript", "MongoDB", "Auth.js"],
    imageUrl: "/projects/noirly-ledger-feature-light.png",
    imageUrlDark: "/projects/noirly-ledger-feature-dark.png",
    logoUrl: "/projects/noirly-ledger.svg",
    logoUrlDark: "/projects/noirly-ledger.svg",
    url: "https://noirly.ledger.aneesh-pissay.in/",
    githubUrl: "#",
    category: "Web",
  },
  {
    title: "Noirly Pulse",
    description:
      "Realtime chat for workspaces — channels, DMs, threads, reactions, and presence.",
    technologies: ["Next.js", "React", "TypeScript", "MongoDB", "Auth.js"],
    imageUrl: "/projects/noirly-pulse-feature-light.png",
    imageUrlDark: "/projects/noirly-pulse-feature-dark.png",
    logoUrl: "/projects/noirly-pulse.svg",
    logoUrlDark: "/projects/noirly-pulse.svg",
    url: "https://noirly.pulse.aneesh-pissay.in/",
    githubUrl: "#",
    category: "Web",
  },
  {
    title: "Noirly Split",
    description:
      "Group expense splitting for friends, roommates, and trips — shared balances that settle up in realtime.",
    technologies: ["Next.js", "React", "TypeScript", "MongoDB", "Auth.js"],
    logoUrl: "/projects/noirly-split.svg",
    logoUrlDark: "/projects/noirly-split.svg",
    url: "https://noirly.split.aneesh-pissay.in/",
    githubUrl: "#",
    category: "Web",
  },
  {
    title: "Noirly Identity",
    description:
      "One Noirly account for every product — the OAuth 2.0 + OpenID Connect provider behind the suite's sign-in.",
    technologies: ["Next.js", "React", "TypeScript", "MongoDB", "OIDC"],
    logoUrl: "/projects/noirly-identity.svg",
    logoUrlDark: "/projects/noirly-identity.svg",
    url: "https://noirly.identity.aneesh-pissay.in/",
    githubUrl: "#",
    category: "Web",
  },
];
