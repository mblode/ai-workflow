import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import {
  SlideBabysit,
  SlideClose,
  SlideFlow,
  SlideGates,
  SlideHistory,
  SlideIntro,
  SlideLadder,
  SlideMattMode,
  SlideModels,
  SlideNumbers,
  SlideParallel,
  SlidePlan,
  SlideProve,
  SlideRepo,
  SlideReview,
  SlideRubric,
  SlideSetup,
  SlideSkills,
  SlideSnippets,
  SlideYolo,
} from "@/components/slides/ai-workflow-slides";
import { SlideNavigation } from "@/components/slides/slide-navigation";
import { SITE_URL } from "@/lib/site-url";
import { DECK_TITLE, SLIDES, TOTAL_SLIDES } from "@/lib/slides";

type SlideSlug = (typeof SLIDES)[number]["slug"];

// Keyed by slug, so a slide added to SLIDES without a component fails the
// type check instead of showing the wrong slide.
const slideComponents = {
  intro: SlideIntro,
  numbers: SlideNumbers,
  setup: SlideSetup,
  yolo: SlideYolo,
  snippets: SlideSnippets,
  flow: SlideFlow,
  plan: SlidePlan,
  models: SlideModels,
  parallel: SlideParallel,
  review: SlideReview,
  rubric: SlideRubric,
  babysit: SlideBabysit,
  gates: SlideGates,
  prove: SlideProve,
  repo: SlideRepo,
  ladder: SlideLadder,
  "matt-mode": SlideMattMode,
  skills: SlideSkills,
  history: SlideHistory,
  close: SlideClose,
} satisfies Record<SlideSlug, ComponentType>;

export function generateStaticParams() {
  const params: { slide: string }[] = [];

  for (let i = 1; i <= TOTAL_SLIDES; i += 1) {
    params.push({ slide: String(i) });
  }

  return params;
}

const BASE_URL = SITE_URL;

export async function generateMetadata({ params }: { params: Promise<{ slide: string }> }) {
  const { slide } = await params;
  const slideNum = Number.parseInt(slide, 10);

  if (Number.isNaN(slideNum) || slideNum < 1 || slideNum > TOTAL_SLIDES) {
    return { title: "Slide Not Found" };
  }

  const slideData = SLIDES[slideNum - 1];
  const slideUrl = slideNum === 1 ? BASE_URL : `${BASE_URL}/${slideNum}`;

  return {
    // Every slide canonicalises to the deck root, not to itself. One slide is
    // thin and near-duplicate of its neighbours, so the deck is a single
    // indexable document rather than N competing ones.
    alternates: {
      canonical: BASE_URL,
    },
    description: `${slideData.title}. Slide ${slideNum} of ${TOTAL_SLIDES} from ${DECK_TITLE}, a talk by Matthew Blode.`,
    openGraph: {
      description: `${slideData.title}, slide ${slideNum} of ${TOTAL_SLIDES} from ${DECK_TITLE}.`,
      title: slideData.title,
      type: "article",
      url: slideUrl,
    },
    // `follow` so the outline on the root still passes crawlers through the
    // deck; `index: false` keeps the thin slide routes out of the index.
    robots: { follow: true, index: false },
    title: slideData.title,
  };
}

export default async function SlidePage({ params }: { params: Promise<{ slide: string }> }) {
  const { slide } = await params;
  const slideNum = Number.parseInt(slide, 10);

  if (Number.isNaN(slideNum) || slideNum < 1 || slideNum > TOTAL_SLIDES) {
    notFound();
  }

  const SlideContent = slideComponents[SLIDES[slideNum - 1].slug];
  const { palette } = SLIDES[slideNum - 1];

  return (
    <SlideNavigation currentSlide={slideNum} palette={palette} totalSlides={TOTAL_SLIDES}>
      <SlideContent />
    </SlideNavigation>
  );
}
