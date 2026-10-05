/**
 * Every project on the site — one entry per product.
 *
 * Adding a project is adding an entry here: it gets a card on /work, its own
 * case study at /work/<slug>, a share image, and a sitemap entry. Set
 * `featured: true` to also show it on the home page (keep that to 3–4 so the
 * home page stays short), and use `order` to sort (lower first).
 */

export type ProjectCategory = "Web" | "Mobile";

export interface ProjectCaseStudy {
  /** The problem the product solves, in a sentence or two. */
  problem: string;
  /** What was built and how — the paragraph a client reads. */
  approach: string;
  /** Concrete capabilities, one per line. */
  highlights: string[];
}

export interface Project {
  slug: string;
  title: string;
  /** Short label shown above the title, e.g. "Finance". */
  type: string;
  category: ProjectCategory;
  /** One- or two-sentence summary used on cards and in link previews. */
  description: string;
  stack: string[];
  url: string;
  logo: string | null;
  featured: boolean;
  order: number;
  caseStudy: ProjectCaseStudy;
}

const projects: Project[] = [
  {
    slug: "noirly-flow",
    title: "Noirly Flow",
    type: "Task Management",
    category: "Web",
    description:
      "Boards, workspaces, and realtime collaboration for Noirly products — signed in through Noirly Identity.",
    stack: ["Next.js", "React", "TypeScript", "MongoDB", "Auth.js"],
    url: "https://noirly.flow.aneesh-pissay.in/",
    logo: "/projects/noirly-flow.svg",
    featured: true,
    order: 1,
    caseStudy: {
      problem:
        "Individuals and teams need one place to plan projects and track tasks together, without juggling separate tools or separate accounts.",
      approach:
        "Flow is a task and project management app organised around workspaces. Teams create projects, break them into tasks, and work through them together, with changes showing up for everyone in realtime. Sign-in is handled by Noirly Identity, so one account works across the whole Noirly suite.",
      highlights: [
        "Workspaces with members, invites, and role-based access control",
        "Projects and tasks with rich fields and multiple views",
        "A task drawer for editing without leaving the current view",
        "Realtime updates so the whole team sees changes as they happen",
        "Search and keyboard shortcuts for moving fast",
        "Single sign-on through Noirly Identity (OpenID Connect)",
      ],
    },
  },
  {
    slug: "noirly-ledger",
    title: "Noirly Ledger",
    type: "Finance",
    category: "Web",
    description:
      "Personal and team money tracking — budgets, expenses, pools, approvals, and reports across workspaces.",
    stack: ["Next.js", "React", "TypeScript", "MongoDB", "Auth.js"],
    url: "https://noirly.ledger.aneesh-pissay.in/",
    logo: "/projects/noirly-ledger.svg",
    featured: true,
    order: 2,
    caseStudy: {
      problem:
        "Budgeting tools usually serve either individuals or finance teams. Small teams need both: personal tracking, plus shared budgets where spending is submitted and approved.",
      approach:
        "Ledger is a budgeting and finance tracking app where personal and team spending share one transaction model, scoped by workspace. Teams get shared budget pools with expense submission and approval workflows, and remaining balances stay in sync live for everyone working on the same pool.",
      highlights: [
        "Personal expenses, category budgets, and recurring items",
        "Shared team budget pools with role-based access",
        "Expense submission with receipts and approval workflows",
        "Live remaining-balance sync on shared pools",
        "Reports with CSV and PDF export",
        "Workspace switcher for moving between personal and team books",
      ],
    },
  },
  {
    slug: "noirly-pulse",
    title: "Noirly Pulse",
    type: "Messaging",
    category: "Web",
    description:
      "Realtime chat for workspaces — channels, DMs, threads, reactions, and presence.",
    stack: ["Next.js", "React", "TypeScript", "MongoDB", "Auth.js"],
    url: "https://noirly.pulse.aneesh-pissay.in/",
    logo: "/projects/noirly-pulse.svg",
    featured: true,
    order: 3,
    caseStudy: {
      problem:
        "Teams need fast, reliable chat that feels live — messages, typing, and presence have to arrive instantly and never silently drop.",
      approach:
        "Pulse is a messaging app for the Noirly ecosystem, built on a dedicated realtime service. It covers direct messages and team channels through to threads, mentions, and search, and it is tested end to end with two real accounts exchanging messages through the full stack.",
      highlights: [
        "Direct messages with reactions, typing indicators, and presence",
        "Team workspaces with channels, threads, and mentions",
        "Search with jump-to-message",
        "Browser push notifications with per-user preferences",
        "Virtualized message lists for long conversations",
        "Two-user end-to-end tests covering delivery, receipts, and threads",
      ],
    },
  },
  {
    slug: "noirly-identity",
    title: "Noirly Identity",
    type: "Authentication",
    category: "Web",
    description:
      "One Noirly account for every product — the OAuth 2.0 + OpenID Connect provider behind the suite's sign-in.",
    stack: ["Next.js", "React", "TypeScript", "MongoDB", "OIDC"],
    url: "https://noirly.identity.aneesh-pissay.in/",
    logo: "/projects/noirly-identity.svg",
    featured: true,
    order: 4,
    caseStudy: {
      problem:
        "A suite of products needs one secure account system, instead of every app building and maintaining its own sign-in.",
      approach:
        "Identity is the central authentication service and OpenID Connect provider for every Noirly product. Apps sign users in through the standard OAuth 2.0 Authorization Code flow with PKCE, and a single Noirly account works everywhere — including Google sign-in, configured once on Identity.",
      highlights: [
        "OAuth 2.0 Authorization Code + PKCE and OpenID Connect",
        "RS256-signed ID tokens with a published JWKS",
        "Argon2id password hashing",
        "Continue with Google, configured once for the whole suite",
        "OAuth client registration for each Noirly product",
        "Security-critical paths covered by automated tests",
      ],
    },
  },
  {
    slug: "noirly-split",
    title: "Noirly Split",
    type: "Expense Sharing",
    category: "Web",
    description:
      "Group expense splitting for friends, roommates, and trips — shared balances that settle up in realtime.",
    stack: ["Next.js", "React", "TypeScript", "MongoDB", "Auth.js"],
    url: "https://noirly.split.aneesh-pissay.in/",
    logo: "/projects/noirly-split.svg",
    featured: false,
    order: 5,
    caseStudy: {
      problem:
        "Shared costs between friends, roommates, and travel groups get messy fast — who paid, who owes what, and how to settle up.",
      approach:
        "Split is a group expense app where every member sees the same live balances. Expenses can be split equally, unequally, by percentage, or by shares, with multiple payers, and the group settles up from a single dashboard.",
      highlights: [
        "Equal, unequal, percentage, and share-based splits",
        "Multiple payers on a single expense",
        "Receipts and recurring expenses",
        "Dashboard balances and reports",
        "Live sync and presence across the group",
        "Settle-up links for paying back in one tap",
      ],
    },
  },
];

/** All projects, in display order. */
export const allProjects: Project[] = [...projects].sort((a, b) => a.order - b.order);

/** The projects shown on the home page. */
export const featuredProjects: Project[] = allProjects.filter((p) => p.featured);

export function getProject(slug: string): Project | undefined {
  return allProjects.find((p) => p.slug === slug);
}
