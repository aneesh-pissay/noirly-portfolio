"use client";

import { ArrowUpRight, Github, Linkedin, Mail, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import { StaggerGroup, RevealItem, SpotlightCard, fadeUp } from "@noirly-dev/ui/motion";
import { profile as defaultProfile } from "@/data/profile";
import type { Profile } from "@/data/profile";

interface Channel {
  key: string;
  label: string;
  value: string;
  href: string;
  Icon: LucideIcon;
  external: boolean;
}

export function Contact({ profile = defaultProfile }: { profile?: Profile }) {
  const channels: Channel[] = [
    {
      key: "email",
      label: "Email",
      value: profile.contact.email.label,
      href: profile.contact.email.href,
      Icon: Mail,
      external: false,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      value: profile.contact.linkedin.label,
      href: profile.contact.linkedin.href,
      Icon: Linkedin,
      external: true,
    },
    {
      key: "github",
      label: "GitHub",
      value: profile.contact.github.label,
      href: profile.contact.github.href,
      Icon: Github,
      external: true,
    },
  ];

  return (
    <section id="contact" className="section-rule relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="aura bottom-[-10rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2" />
      </div>

      <div className="shell section-y relative">
        <SectionHeading
          index="05"
          eyebrow="Contact"
          title={profile.ctaTitle}
          subtitle={profile.ctaSubtitle}
          align="center"
          className="mx-auto max-w-2xl"
        />

        {/* The form is the primary path: it works for every visitor, unlike a
            mailto: link, which does nothing without a configured mail app. */}
        <StaggerGroup gap={0.09} delay={0.1} className="mx-auto mt-10 max-w-3xl">
          <RevealItem variants={fadeUp}>
            <SpotlightCard animateIn={false} lift={false}>
              <ContactForm email={profile.contact.email} />
            </SpotlightCard>
          </RevealItem>
        </StaggerGroup>

        <p className="mono-label mt-10 text-center">Or reach me directly</p>

        <StaggerGroup
          gap={0.09}
          as="ul"
          className="mx-auto mt-5 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {channels.map(({ key, label, value, href, Icon, external }) => (
            <RevealItem key={key} as="li" variants={fadeUp}>
              <SpotlightCard animateIn={false} className="h-full">
                <a
                  href={href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="flex min-h-[9.5rem] flex-col justify-between gap-6 p-6"
                >
                  <span className="flex items-center justify-between">
                    <Icon size={19} aria-hidden className="text-[var(--text-secondary)]" />
                    <ArrowUpRight
                      size={15}
                      aria-hidden
                      className="text-[var(--text-muted)] transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </span>
                  <span className="block">
                    <span className="mono-label block">{label}</span>
                    <span className="mt-2 block truncate text-sm font-medium text-[var(--text)]">
                      {value}
                    </span>
                  </span>
                </a>
              </SpotlightCard>
            </RevealItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
