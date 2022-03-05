import { fromEvent } from "rxjs";
import { ddStreams } from "./dd";

const starts = fromEvent(document, "mousedown");
const moves = fromEvent(document, "mousemove");
const ends = fromEvent(document, "mouseup");

const { drags, drops } = ddStreams(starts, moves, ends);

drags.subscribe((event) => console.log("drag", event));
drops.subscribe((event) => console.log(event));
