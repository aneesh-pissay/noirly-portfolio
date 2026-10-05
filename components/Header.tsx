"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Sun, Moon, Menu, X, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemePicker } from "@/components/ThemePicker";
import { ScrollProgress, DURATION, EASE_OUT, EASE_IN_OUT, SPRING, stagger } from "@noirly-dev/ui/motion";
import { useInstantEntrance } from "@noirly-dev/ui";
import type { Profile } from "@/data/profile";

interface NavLink {
  label: string;
  href: string;
}

interface HeaderProps {
  title: string;
  navLinks: NavLink[];
  profile: Profile;
}

const SECTION_IDS = ["home", "about", "stack", "experience", "work", "contact"];

function hrefToSection(href: string): string | null {
  if (href === "/") return "home";
  return href.split("#")[1] ?? null;
}

const menuItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export function Header({ title, navLinks, profile }: HeaderProps) {
  const brandName = title.replace(/\s*portfolio\s*/gi, "").trim();
  const pathname = usePathname();
  const instantEntrance = useInstantEntrance();
  const [activeSection, setActiveSection] = useState("home");
  const [isDark, setIsDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 16);
  });

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Escape closes the menu — every overlay needs a keyboard escape route.
  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {
        /* private mode — the class swap still applies for this session */
      }
      return next;
    });
  }, []);

  // Set when a nav link is clicked: holds that section lit while the smooth
  // scroll passes over the ones in between.
  const pendingSection = useRef<string | null>(null);

  useEffect(() => {
    if (pathname !== "/") return;
    let frame = 0;
    let releaseTimer = 0;

    // The active section is the last one whose top has crossed a line 35% down
    // the viewport. Sections are looked up on every pass because the ones below
    // the fold arrive in a dynamic chunk, after this effect first runs.
    function update() {
      frame = 0;
      if (pendingSection.current) return;
      const line = window.innerHeight * 0.35;
      const present = SECTION_IDS.filter((id) => document.getElementById(id));
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let active = "home";
      if (atBottom && present.length) {
        active = present[present.length - 1]!;
      } else {
        for (const id of present) {
          if (document.getElementById(id)!.getBoundingClientRect().top <= line) active = id;
        }
      }
      setActiveSection(active);
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    function release() {
      window.clearTimeout(releaseTimer);
      pendingSection.current = null;
      schedule();
    }

    // A click locks the target in; the lock lifts when the scroll settles.
    function onScroll() {
      if (pendingSection.current) {
        window.clearTimeout(releaseTimer);
        releaseTimer = window.setTimeout(release, 150);
      }
      schedule();
    }

    schedule();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(releaseTimer);
      pendingSection.current = null;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      mo.disconnect();
    };
  }, [pathname]);

  const selectSection = useCallback(
    (href: string) => {
      const section = hrefToSection(href);
      if (pathname !== "/" || !section) return;
      pendingSection.current = section;
      setActiveSection(section);
      // If the click causes no scroll (already there), nothing lifts the lock.
      window.setTimeout(() => {
        if (pendingSection.current === section) pendingSection.current = null;
      }, 1500);
    },
    [pathname],
  );

  function isActive(href: string): boolean {
    // Off the home page, "Work" stays lit across /work and every case study.
    if (pathname.startsWith("/work")) return hrefToSection(href) === "work";
    if (pathname !== "/") return pathname === href;
    return hrefToSection(href) === activeSection;
  }

  return (
    <>
      <motion.header
        initial={instantEntrance ? false : { y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: DURATION.slow, ease: EASE_OUT, delay: instantEntrance ? 0 : 0.1 }}
        className="sticky top-0 z-50"
      >
        {/* Material layer: invisible at rest, frosts in once the page moves. */}
        <motion.div
          aria-hidden
          className="absolute inset-0 border-b backdrop-blur-xl"
          animate={{
            opacity: scrolled ? 1 : 0,
            backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
          }}
          transition={{ duration: DURATION.base, ease: EASE_OUT }}
          style={{
            background: "color-mix(in srgb, var(--bg) 72%, transparent)",
            borderColor: "var(--hairline)",
          }}
        />

        <div className="shell relative flex h-[4.5rem] items-center justify-between gap-4 md:h-20">
          <Link
            href="/#home"
            aria-label={`${brandName} home`}
            className="group flex min-w-0 shrink-0 items-center gap-2.5 text-[var(--text)]"
            onClick={() => {
              setMenuOpen(false);
              selectSection("/#home");
            }}
          >
            {/* Logo-only on small screens — brand name is visually hidden until sm. */}
            <span className="inline-flex size-[4.25rem] shrink-0 sm:hidden" aria-hidden>
              <Logo variant="nav" className="size-full" />
            </span>
            <span className="hidden items-center gap-3 font-display text-xl font-bold leading-none tracking-[-0.04em] uppercase sm:flex md:text-2xl lg:text-3xl">
              <span className="inline-flex size-14 shrink-0 md:size-16" aria-hidden>
                <Logo variant="nav" className="size-full" />
              </span>
              <span className="truncate" aria-hidden>
                {brandName}
              </span>
            </span>
          </Link>

          {/* Desktop nav — one shared-layout pill slides to the active section. */}
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-1 rounded-full border border-[var(--hairline)] bg-[color-mix(in_srgb,var(--text)_4%,transparent)] p-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href} className="relative">
                    <Link
                      href={link.href}
                      onClick={() => selectSection(link.href)}
                      aria-current={active ? "page" : undefined}
                      className="relative block rounded-full px-3.5 py-2 font-mono text-xs font-semibold tracking-[0.14em] uppercase transition-colors duration-200"
                      style={{ color: active ? "var(--bg)" : "var(--text-muted)" }}
                    >
                      {active ? (
                        <span
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-[var(--text)] transition-opacity duration-200"
                        />
                      ) : null}
                      <span className="relative z-10">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <ThemePicker />
            <motion.button
              type="button"
              onClick={toggleTheme}
              whileTap={{ scale: 0.9 }}
              transition={SPRING}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[var(--hairline)] text-[var(--text-secondary)] transition-colors hover:border-[var(--hairline-strong)] hover:text-[var(--text)]"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDark ? "sun" : "moon"}
                  initial={{ y: 14, opacity: 0, rotate: -45 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: -14, opacity: 0, rotate: 45 }}
                  transition={{ duration: DURATION.base, ease: EASE_OUT }}
                  className="absolute inline-flex"
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Wrapper carries the breakpoint: `.btn` is unlayered CSS, so it
                would override a `hidden` utility placed on the link itself. */}
            <span className="hidden lg:inline-flex">
              <Link href="/#contact" className="btn btn-solid" onClick={() => selectSection("/#contact")}>
                Get in touch
                <ArrowUpRight size={14} aria-hidden />
              </Link>
            </span>

            <motion.button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              whileTap={{ scale: 0.9 }}
              transition={SPRING}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[var(--hairline)] text-[var(--text)] lg:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={menuOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: DURATION.fast, ease: EASE_OUT }}
                  className="absolute inline-flex"
                >
                  {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <ScrollProgress />
      </motion.header>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.base, ease: EASE_IN_OUT }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 backdrop-blur-2xl"
              style={{ background: "color-mix(in srgb, var(--bg) 92%, transparent)" }}
            />

            <motion.nav
              variants={stagger(0.05, 0.12)}
              initial="hidden"
              animate="show"
              className="relative flex h-full max-h-[100dvh] flex-col overflow-y-auto overscroll-contain px-5 pb-[max(6rem,env(safe-area-inset-bottom))] pt-[max(5rem,env(safe-area-inset-top))] sm:px-7"
            >
              {/*
                Auto margins, not `justify-center`. Centring a scroll container
                with justify-content splits any overflow above *and* below the
                content box, and scrollTop cannot go negative — so the top of
                the list becomes unreachable the moment it stops fitting. Auto
                margins centre when there is free space and collapse to zero
                when there is not, which keeps the first link reachable.
              */}
              <div className="m-auto flex w-full flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.div key={link.href} variants={menuItem}>
                    <Link
                      href={link.href}
                      onClick={() => {
                        setMenuOpen(false);
                        selectSection(link.href);
                      }}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className="flex items-baseline gap-4 border-b border-[var(--hairline)] py-4"
                    >
                      <span className="mono-label w-6 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="display-lg"
                        style={{
                          color: isActive(link.href)
                            ? "var(--text)"
                            : "var(--text-muted)",
                        }}
                      >
                        {link.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}

                <motion.a
                  variants={menuItem}
                  href={profile.contact.email.href}
                  className="mono-label mt-8 inline-flex items-center gap-2 text-[var(--text-secondary)]"
                >
                  {profile.contact.email.label}
                  <ArrowUpRight size={13} aria-hidden />
                </motion.a>
              </div>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
