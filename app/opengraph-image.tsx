import { renderZoneOgImage } from "@/app/og-image-shared";
import { OgLogo } from "@/app/og-logo";
import { DECK_TITLE } from "@/lib/slides";

export { OG_CONTENT_TYPE as contentType, OG_SIZE as size } from "@/app/og-image-shared";

export const alt = DECK_TITLE;

/**
 * The house card (Rule 12), replacing the palette-based OG generator this
 * deck shipped since May. Converting to the shared route also locks in Rule
 * 11: `metadataBase` is the zone URL, and a generated route is not
 * `basePath`-prefixed, so the two cannot stack into `/ai-workflow/ai-workflow/...`.
 *
 * The matching `twitter-image.tsx` is gone rather than converted: Next reuses
 * this route for `twitter:image`.
 */
export default function OpengraphImage() {
  return renderZoneOgImage({
    background: "#fff7ed",
    color: "#9a3412",
    logo: <OgLogo />,
    title: DECK_TITLE,
  });
}
