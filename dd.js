/**
 * I took the code from [Handling complex mouse and touch events](https://codepen.io/HunorMarton/post/handling-complex-mouse-and-touch-events-with-rxjs),
 * updated it to the current version of RxJs and hacked together a simple test of it as part of learning how to use RxJs.
 */
import {
  concatMap,
  takeUntil,
  map,
  first,
  Observable,
  from,
  delayWhen,
  interval,
  filter,
} from "rxjs";

const test = false;

/**
 * Creates streams for drag and drop
 * @param {Observable<Partial<PointerEvent>>} starts
 * @param {Observable<Partial<PointerEvent>>} moves
 * @param {Observable<Partial<PointerEvent>>} ends
 */
export function ddStreams(starts, moves, ends) {
  const drags = starts.pipe(
    concatMap((dragStartEvent) =>
      moves.pipe(
        takeUntil(ends),
        map((dragEvent) => {
          const x = dragEvent.x - dragStartEvent.x;
          const y = dragEvent.y - dragStartEvent.y;
          return { x, y };
        })
      )
    )
  );

  const drops = starts.pipe(
    concatMap((dragStartEvent) =>
      ends.pipe(
        first(),
        map((dragEndEvent) => {
          const x = dragEndEvent.x - dragStartEvent.x;
          const y = dragEndEvent.y - dragStartEvent.y;
          return { x, y };
        })
      )
    )
  );
  return { drags, drops };
}

if (test) {
  let time = 0;
  function down(delay = 0, x = 0, y = 0) {
    time += delay;
    return { type: "down", time, x, y };
  }
  function move(delay = 0, x = 0, y = 0) {
    time += delay;
    return { type: "move", time, x, y };
  }
  function up(delay = 0, x = 0, y = 0) {
    time += delay;
    return { type: "up", time, x, y };
  }
  const events = [
    down(),
    move(10, 0, 1),
    move(10, 1, 1),
    move(10, 2, 1),
    up(10, 2, 2),
  ];
  const stream = from(events).pipe(
    delayWhen((event) => interval(100 * event.time))
  );
  const starts = stream.pipe(filter((e) => e.type == "down"));
  const moves = stream.pipe(filter((e) => e.type == "move"));
  const ends = stream.pipe(filter((e) => e.type == "up"));
  const { drags, drops } = ddStreams(starts, moves, ends);
  drags.subscribe((x) => console.log("drag", x));
  drops.subscribe((x) => console.log("drop", x));
}
