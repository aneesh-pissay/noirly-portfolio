export interface FeaturedProject {
  title: string;
  type: string;
  description: string;
  stack: string[];
  url: string;
  logo: string | null;
}

export const featuredProjects: FeaturedProject[] = [
  {
    title: "Noirly Flow",
    type: "Task Management",
    description:
      "Boards, workspaces, and realtime collaboration for Noirly products — signed in through Noirly Identity.",
    stack: ["Next.js", "React", "TypeScript", "MongoDB", "Auth.js"],
    url: "https://noirly.flow.aneesh-pissay.in/",
    logo: "/projects/noirly-flow.svg",
  },
  {
    title: "Noirly Ledger",
    type: "Finance",
    description:
      "Personal and team money tracking — budgets, expenses, pools, approvals, and reports across workspaces.",
    stack: ["Next.js", "React", "TypeScript", "MongoDB", "Auth.js"],
    url: "https://noirly.ledger.aneesh-pissay.in/",
    logo: "/projects/noirly-ledger.svg",
  },
  {
    title: "Noirly Pulse",
    type: "Messaging",
    description:
      "Realtime chat for workspaces — channels, DMs, threads, reactions, and presence.",
    stack: ["Next.js", "React", "TypeScript", "MongoDB", "Auth.js"],
    url: "https://noirly.pulse.aneesh-pissay.in/",
    logo: "/projects/noirly-pulse.svg",
  },
  {
    title: "Noirly Split",
    type: "Expense Sharing",
    description:
      "Group expense splitting for friends, roommates, and trips — shared balances that settle up in realtime.",
    stack: ["Next.js", "React", "TypeScript", "MongoDB", "Auth.js"],
    url: "https://noirly.split.aneesh-pissay.in/",
    logo: "/projects/noirly-split.svg",
  },
  {
    title: "Noirly Identity",
    type: "Authentication",
    description:
      "One Noirly account for every product — the OAuth 2.0 + OpenID Connect provider behind the suite's sign-in.",
    stack: ["Next.js", "React", "TypeScript", "MongoDB", "OIDC"],
    url: "https://noirly.identity.aneesh-pissay.in/",
    logo: "/projects/noirly-identity.svg",
  },
];
