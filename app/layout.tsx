import { Agentation } from "agentation";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SITE_URL } from "@/lib/site-url";
import { DECK_SUMMARY, DECK_TITLE } from "@/lib/slides";

const glide = localFont({
  adjustFontFallback: "Arial",
  display: "swap",
  src: [
    { path: "./fonts/glide-variable.woff2", style: "normal" },
    { path: "./fonts/glide-variable-italic.woff2", style: "italic" },
  ],
  variable: "--font-glide",
  weight: "100 950",
});

const glideMono = localFont({
  display: "swap",
  src: "./fonts/glide-mono.woff2",
  variable: "--font-glide-mono",
  weight: "400",
});

const BASE_URL = SITE_URL;

export const metadata: Metadata = {
  alternates: {
    canonical: BASE_URL,
  },
  appleWebApp: {
    title: DECK_TITLE,
  },
  authors: [{ name: "Matthew Blode", url: "https://blode.co" }],
  creator: "Matthew Blode",
  description: DECK_SUMMARY,
  keywords: [DECK_TITLE, "Matthew Blode", "Claude Code", "Codex", "AI agents", "Workflow"],
  // The zone URL, not the bare origin (Rule 11). Correct because the card
  // is a generated `opengraph-image.tsx` route: Next does not prefix those
  // with `basePath`, so `metadataBase` supplies the prefix exactly once.
  metadataBase: new URL(BASE_URL),
  openGraph: {
    description: DECK_SUMMARY,
    locale: "en_US",
    // Every blode.co path shares one site name. The product is already in
    // og:title, so this slot says who made it. See zone-conventions.md Rule 9.
    siteName: "Matthew Blode",
    title: DECK_TITLE,
    type: "website",
    url: BASE_URL,
  },
  other: {
    "theme-color": "#211f1e",
  },
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    index: true,
  },
  title: {
    // `Product: what it is`, colon rather than a pipe, under 60 characters so
    // it does not truncate in the SERP.
    default: `${DECK_TITLE}: a talk by Matthew Blode`,
    template: `%s | ${DECK_TITLE}`,
  },
  twitter: {
    card: "summary_large_image",
    creator: "@mattblode",
    site: "@mattblode",
    description: DECK_SUMMARY,
    title: DECK_TITLE,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": `${BASE_URL}/#webpage`,
      "@type": "WebPage",
      about: { "@id": `${BASE_URL}/#presentation` },
      breadcrumb: { "@id": `${BASE_URL}/#breadcrumb` },
      inLanguage: "en-US",
      isPartOf: { "@id": "https://blode.co/#website" },
      description: `${DECK_TITLE} is a talk by Matthew Blode at Sharing AI tools and workflow, Mark My Words, 13 November 2026.`,
      name: DECK_TITLE,
      publisher: { "@id": "https://blode.co/#organization" },
      url: BASE_URL,
    },
    {
      "@id": `${BASE_URL}/#presentation`,
      "@type": "PresentationDigitalDocument",
      isPartOf: { "@id": "https://blode.co/#website" },
      publisher: { "@id": "https://blode.co/#organization" },
      about: ["AI agents", "Developer workflow"],
      author: {
        "@id": "https://blode.co/#person",
      },
      description: DECK_SUMMARY,
      headline: `${DECK_TITLE}: a talk by Matthew Blode`,
      name: DECK_TITLE,
      url: BASE_URL,
    },
    {
      "@id": `${BASE_URL}/#breadcrumb`,
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          item: "https://blode.co/",
          // Not "Home". This crumb is the one piece of chrome above the fold on
          // every zone, so it says who made the thing.
          name: "Matthew Blode",
          position: 1,
        },
        {
          "@type": "ListItem",
          item: "https://blode.co/projects",
          name: "Projects",
          position: 2,
        },
        { "@type": "ListItem", item: BASE_URL, name: DECK_TITLE, position: 3 },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${glide.variable} ${glideMono.variable}`} lang="en">
      <head>
        <link href={process.env.NEXT_PUBLIC_POSTHOG_HOST} rel="preconnect" />
        <script id="json-ld" type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
        {/* Headlines wait for Display to pin their lines before animating.
            Without JavaScript that never happens, so play them regardless. */}
        <noscript>
          <style>{".honk-display { animation-play-state: running !important; }"}</style>
        </noscript>
      </head>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
