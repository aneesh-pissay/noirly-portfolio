import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { NoirlyHead, noirlyFontClassName, SiteBackground } from "@noirly-dev/ui";
import { Header } from "@/components/Header";
import { DeferredFooter } from "@/components/DeferredFooter";
import { MotionProvider } from "@noirly-dev/ui/motion";
import { FaviconTheme } from "@/components/FaviconTheme";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DeferredStyles } from "@/components/DeferredStyles";
import { getPortfolioContent } from "@/lib/content/server";
import "./globals.css";

const navLinks = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Stack", href: "/#stack" },
  { label: "Experience", href: "/#experience" },
  { label: "Work", href: "/#work" },
  { label: "Contact", href: "/#contact" },
];

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPortfolioContent();
  const { profile } = content;
  const title = `Noirly Portfolio · ${profile.name}`;

  return {
    metadataBase: new URL("https://www.aneesh-pissay.in"),
    // Child pages set a short title ("Work", "Noirly Flow — …") and inherit
    // the site name from the template.
    title: { default: title, template: "%s · Noirly Portfolio" },
    alternates: { canonical: "/" },
    description: profile.description,
    icons: {
      icon: [
        {
          url: "/favicon-light-48.png",
          type: "image/png",
          sizes: "48x48",
          media: "(prefers-color-scheme: light)",
        },
        {
          url: "/favicon-dark-48.png",
          type: "image/png",
          sizes: "48x48",
          media: "(prefers-color-scheme: dark)",
        },
        {
          url: "/favicon-light-192.png",
          type: "image/png",
          sizes: "192x192",
          media: "(prefers-color-scheme: light)",
        },
        {
          url: "/favicon-dark-192.png",
          type: "image/png",
          sizes: "192x192",
          media: "(prefers-color-scheme: dark)",
        },
      ],
      apple: [
        {
          url: "/apple-icon.png",
          type: "image/png",
          sizes: "180x180",
        },
      ],
    },
    openGraph: {
      title,
      description: profile.description,
      url: "https://www.aneesh-pissay.in",
      siteName: "Noirly Portfolio",
      // Share images come from the opengraph-image files next to each page.
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: profile.description,
    },
    manifest: "/manifest.webmanifest",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [content, headerList] = await Promise.all([
    getPortfolioContent(),
    headers(),
  ]);
  const nonce = headerList.get("x-nonce") ?? undefined;
  const { profile } = content;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Noirly Portfolio",
        url: "https://www.aneesh-pissay.in/",
      },
      {
        "@type": "Person",
        name: profile.name,
        url: "https://www.aneesh-pissay.in/",
        image: "https://www.aneesh-pissay.in/favicon-light-192.png",
      },
      {
        "@type": "Organization",
        name: "Noirly Portfolio",
        url: "https://www.aneesh-pissay.in/",
        logo: "https://www.aneesh-pissay.in/favicon-light-192.png",
      },
    ],
  };

  return (
    <html lang="en" className="dark" suppressHydrationWarning data-theme={content.theme.id}>
      <head>
        <NoirlyHead themeId={content.theme.id} nonce={nonce} />
        <style
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `@media(max-width:767px),(pointer:coarse){[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important}[style*="translateY(110%)"],[style*="translateY(8px)"],[style*="translateY(-24px)"]{transform:none!important}[style*="blur(8px)"]{filter:none!important}}`,
          }}
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${noirlyFontClassName} flex min-h-dvh flex-col antialiased`}
      >
        {/*
          Framer Motion serialises each element's `initial` state into the SSR
          HTML (e.g. style="opacity:0"), so with JavaScript disabled the page
          would render blank. Neutralise those inline states for no-JS readers
          and crawlers that don't execute scripts.
        */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: `[style*="opacity:0"],[style*="translateY(110%)"],[style*="scale(0)"],[style*="scaleX(0)"],[style*="scaleY(0)"]{opacity:1!important;filter:none!important;transform:none!important}`,
            }}
          />
        </noscript>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteBackground />
        <DeferredStyles />
        <FaviconTheme />
        <ThemeProvider defaultThemeId={content.theme.id}>
          <MotionProvider>
            <Header title="Noirly Portfolio" navLinks={navLinks} profile={profile} />
            {/*
              No route shutter: pages swap instantly so navigation never waits
              on an animation. The landmark lives here rather than in
              app/template.tsx: Next emits the template's client chunk as a
              <script> without the CSP nonce, so the strict CSP in proxy.ts
              blocks it and hydration never completes.
            */}
            <main id="main" className="flex flex-1 flex-col">
              {children}
            </main>
            <DeferredFooter title="Noirly Portfolio" profile={profile} />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
