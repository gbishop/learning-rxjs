import { filter, fromEvent, mergeWith } from "rxjs";
import { ddStreams } from "./dd";
import { hoverIntentStream } from "./hoverIntent";

function show(label, obs) {
  obs.subscribe((v) => console.log(label, v));
}

const starts = fromEvent(document, "pointerdown");
const moves = fromEvent(document, "pointermove");
const ends = fromEvent(document, "pointerup");
const enters = fromEvent(document, "pointerover");
const leaves = fromEvent(document, "pointerout");
const el = enters.pipe(
  mergeWith(leaves),
  filter((e) => e.target instanceof HTMLButtonElement)
);
show("el", el);

const { drags, drops } = ddStreams(starts, moves, ends);

drags.subscribe((event) => console.log("drag", event));
drops.subscribe((event) => console.log(event));

const hovers = hoverIntentStream(1000, el);

hovers.subscribe((event) => console.log(event.type, event.target.tagName));
