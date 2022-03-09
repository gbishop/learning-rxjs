import {
  endWith,
  filter,
  fromEvent,
  mapTo,
  mergeWith,
  switchMap,
  takeUntil,
  timer,
} from "rxjs";
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

const { drags, drops } = ddStreams(starts, moves, ends);

drags.subscribe((event) => console.log("drag", event));
drops.subscribe((event) => console.log(event));

const hovers = hoverIntentStream(500, el);

hovers.subscribe((event) => {
  event.target instanceof HTMLButtonElement &&
    event.target.classList.toggle("highlight", event.type === "pointerover");
});

/* I'm using the transitionend event to synchronize the click with css transition.
   We could a timer and do it in js as well.
*/
fromEvent(document, "transitionend").subscribe(
  (event) => event.target instanceof HTMLButtonElement && event.target.click()
);

document.addEventListener("click", (e) => {
  if (e.target instanceof HTMLButtonElement) {
    document.getElementById("report").innerText =
      e.target.innerText + " clicked";
  }
});
