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
  SlideParallel,
  SlidePlan,
  SlideRepo,
  SlideReview,
  SlideRubric,
  SlideSetup,
  SlideSinceMay,
  SlideSkills,
  SlideSnippets,
  SlideYolo,
} from "@/components/slides/ai-workflow-slides";
import { SlideNavigation } from "@/components/slides/slide-navigation";
import { SITE_URL } from "@/lib/site-url";
import { DECK_TITLE, SLIDES, TOTAL_SLIDES } from "@/lib/slides";

// Order matches SLIDES in lib/slides.ts.
const slideComponents = [
  SlideIntro,
  SlideSinceMay,
  SlideSetup,
  SlideYolo,
  SlideSnippets,
  SlideFlow,
  SlidePlan,
  SlideModels,
  SlideParallel,
  SlideReview,
  SlideRubric,
  SlideBabysit,
  SlideGates,
  SlideRepo,
  SlideLadder,
  SlideMattMode,
  SlideSkills,
  SlideHistory,
  SlideClose,
];

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

  const SlideContent = slideComponents[slideNum - 1];
  const { palette } = SLIDES[slideNum - 1];

  return (
    <SlideNavigation currentSlide={slideNum} palette={palette} totalSlides={TOTAL_SLIDES}>
      <SlideContent />
    </SlideNavigation>
  );
}
