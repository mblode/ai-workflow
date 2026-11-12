// Exports the deck to PowerPoint for a venue that wants a .pptx: one slide per
// deck slide, the same clicks, and the speaker notes in Presenter View.
//
//   npm run build && npm start      # in one terminal
//   npm run export-pptx             # in another
//
// Each slide is a 3840x2160 screenshot of the real deck, so fonts and stickers
// match exactly but the text isn't editable. Every reveal is another full
// frame stacked on top that fades in on click; pixels that don't change don't
// visibly fade, so only the new part appears. Entrance motion (dealt cards,
// rolling digits) becomes that fade. Notes come from
// docs/ai-workflow-speaker-notes.md, the same beats as the presenter window, with
// everything under a `Flags:` line left out.
//
// Takes the same deck URL argument, DECK_URL and CHROME_PATH as export-pdf.
// OUT sets the file path.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import PptxGenJS from "pptxgenjs";
// The package's index also exports React components Node can't load, so
// import the parser's own file.
import { parseSpeakerNotes } from "../packages/deck-presenter/src/speaker-notes.ts";
import { captureDeck, deckUrlFromArgs, launchBrowser } from "./capture-deck.mjs";

const OUT = process.env.OUT ?? "out/ai-workflow.pptx";
const DECK_TITLE = "Claude doesn’t have taste. You do.";
// Matches the dark slides, so the fade between slides never flashes white.
const BACKGROUND = "201F1D";
const FADE_MS = 400;
const LAYOUT = "SCREENSHOT";

const notesFor = (beats, clicks) => {
  const header = clicks ? `${clicks} click${clicks === 1 ? "" : "s"} on this slide` : "No clicks";
  return [header, "", ...beats.map((beat) => beat.replace(/^- /, "• "))].join("\n");
};

// PowerPoint's own markup for "fade in on click", one per stacked frame, in
// the main sequence. pptxgenjs writes no animations, so these are added to
// each slide's XML after it builds the file.
const clickFade = (nextId, shapeId) => {
  const [outer, group, effect, show, fade] = [nextId(), nextId(), nextId(), nextId(), nextId()];
  const target = `<p:tgtEl><p:spTgt spid="${shapeId}"/></p:tgtEl>`;
  return `<p:par><p:cTn id="${outer}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="${group}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="${effect}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" nodeType="clickEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:set><p:cBhvr><p:cTn id="${show}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>${target}<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set><p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${fade}" dur="${FADE_MS}"/>${target}</p:cBhvr></p:animEffect></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`;
};

const timingFor = (shapeIds) => {
  let id = 2;
  const nextId = () => {
    id += 1;
    return id;
  };
  const clicks = shapeIds.map((shapeId) => clickFade(nextId, shapeId)).join("");
  return `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${clicks}</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>`;
};

/** Adds a fade between slides and the click fades to every slide's XML. */
const addMotion = async (pptx) => {
  const zip = await JSZip.loadAsync(pptx);
  const slideFiles = zip.file(/^ppt\/slides\/slide\d+\.xml$/);
  for (const file of slideFiles) {
    const xml = await file.async("string");
    if (!xml.includes("</p:clrMapOvr>") || xml.includes("<p:timing")) {
      throw new Error(`Unexpected slide markup in ${file.name}; pptxgenjs may have changed.`);
    }
    // The first picture is the slide as it opens; each one after is a click.
    const [, ...clickShapeIds] = [...xml.matchAll(/<p:pic>.*?<p:cNvPr id="(?<id>\d+)"/gs)].map(
      (match) => match.groups.id,
    );
    const motion = `<p:transition spd="med"><p:fade/></p:transition>${
      clickShapeIds.length ? timingFor(clickShapeIds) : ""
    }`;
    // cSld, clrMapOvr, transition, timing is the order the schema requires.
    zip.file(file.name, xml.replace("</p:clrMapOvr>", `</p:clrMapOvr>${motion}`));
  }
  return zip.generateAsync({ compression: "DEFLATE", type: "nodebuffer" });
};

const browser = await launchBrowser();

try {
  const slides = await captureDeck(browser, deckUrlFromArgs());
  const notes = parseSpeakerNotes(
    await readFile("docs/ai-workflow-speaker-notes.md", "utf-8"),
    slides.length,
  );

  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_16x9";
  pres.title = DECK_TITLE;
  pres.author = "Matthew Blode";
  pres.subject = "Claude for Marketing, Melbourne, 5 November 2026";
  // A real title on every slide, parked just above it so it never shows: the
  // slide lists and screen readers read it, and PowerPoint's accessibility
  // checker stops reporting every slide as untitled.
  pres.defineSlideMaster({
    background: { color: BACKGROUND },
    objects: [
      {
        placeholder: {
          options: { color: "FFFFFF", h: 0.6, name: "title", type: "title", w: 10, x: 0, y: -0.7 },
          text: "",
        },
      },
    ],
    title: LAYOUT,
  });

  for (const [index, { frames, text, title }] of slides.entries()) {
    const slide = pres.addSlide({ masterName: LAYOUT });
    slide.addText(title, { placeholder: "title" });
    for (const [step, frame] of frames.entries()) {
      slide.addImage({
        // The opening frame carries the whole slide's words; the click frames
        // only repeat them, so they get a short label.
        altText: step === 0 ? text || title : `${title}, after click ${step}`,
        data: `image/png;base64,${frame.toString("base64")}`,
        h: 5.625,
        objectName: step === 0 ? `Slide ${index + 1}` : `Click ${step}`,
        w: 10,
        x: 0,
        y: 0,
      });
    }
    slide.addNotes(notesFor(notes[index], frames.length - 1));
  }

  const pptx = await addMotion(await pres.write({ outputType: "nodebuffer" }));
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, pptx);
  const clicks = slides.reduce((sum, { frames }) => sum + frames.length - 1, 0);
  console.log(`${slides.length} slides, ${clicks} clicks → ${OUT}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
