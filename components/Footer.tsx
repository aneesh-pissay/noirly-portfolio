"use client";

import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { Reveal, StaggerGroup, RevealItem, fadeUp } from "@noirly-dev/ui/motion";
import type { Profile } from "@/data/profile";

interface FooterProps {
  title: string;
  profile: Profile;
}

const footerLinks = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Stack", href: "/#stack" },
  { label: "Experience", href: "/#experience" },
  { label: "Work", href: "/#work" },
  { label: "Contact", href: "/#contact" },
];

export function Footer({ title, profile }: FooterProps) {
  const brandName = title.replace(/\s*portfolio\s*/gi, "").trim();
  const currentYear = new Date().getFullYear();
  const connectLinks = [
    { label: profile.contact.email.label, href: profile.contact.email.href, external: false },
    { label: "LinkedIn", href: profile.contact.linkedin.href, external: true },
    { label: "GitHub", href: profile.contact.github.href, external: true },
  ];

  return (
    <footer className="relative border-t border-[var(--hairline)]">
      <div className="shell py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <Reveal variants={fadeUp} className="md:col-span-5">
            <div className="flex items-center gap-4 text-[var(--text)]">
              <span className="inline-flex size-[4.25rem] shrink-0 md:size-20">
                <Logo variant="nav" className="size-full" />
              </span>
              <p className="display-md">{brandName}</p>
            </div>
            <p className="mono-label mt-4">
              {profile.name} — {profile.role}
            </p>
            <p className="copy mt-4 max-w-sm">
              Selected work across web, mobile, and the Noirly product family.
            </p>
          </Reveal>

          <div className="md:col-span-3">
            <p className="mono-label">Explore</p>
            <StaggerGroup gap={0.04} as="ul" className="mt-4 flex flex-col gap-2.5">
              {footerLinks.map((link) => (
                <RevealItem key={link.href} as="li">
                  <Link
                    href={link.href}
                    className="group inline-flex min-h-[28px] items-center gap-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={13}
                      aria-hidden
                      className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </Link>
                </RevealItem>
              ))}
            </StaggerGroup>
          </div>

          <div className="md:col-span-4">
            <p className="mono-label">Connect</p>
            <StaggerGroup gap={0.04} as="ul" className="mt-4 flex flex-col gap-2.5">
              {connectLinks.map((link) => (
                <RevealItem key={link.href} as="li">
                  <a
                    href={link.href}
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="group inline-flex min-h-[28px] items-center gap-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={13}
                      aria-hidden
                      className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </a>
                </RevealItem>
              ))}
            </StaggerGroup>
          </div>
        </div>

        <div className="mono-label mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--hairline)] pt-7">
          <span>
            © {currentYear} {profile.name}
          </span>

          <Link
            href="/#home"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--hairline)] px-4 py-2 transition-colors hover:border-[var(--hairline-strong)] hover:text-[var(--text)]"
          >
            Back to top
            <ArrowUp size={13} aria-hidden />
          </Link>
        </div>
      </div>
    </footer>
  );
}
