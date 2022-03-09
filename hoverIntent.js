/** Hover after a delay from http://blog.tmtk.net/posts/2017-01-10-hover-with-rxjs/ */

const test = false;

import {
  debounceTime,
  delayWhen,
  filter,
  from,
  interval,
  map,
  Observable,
  share,
  distinctUntilKeyChanged,
  groupBy,
  mergeMap,
} from "rxjs";

function show(label, obs) {
  obs.subscribe((v) => console.log(label, v));
}

/** creates a stream of hover events
 * @param {number} Thold
 * @param {Observable<Partial<PointerEvent>>} enterLeave$
 */
export function hoverIntentStream(Thold, enterLeave$) {
  return enterLeave$.pipe(
    groupBy((e) => e.target),
    mergeMap(($group) =>
      $group.pipe(debounceTime(Thold), distinctUntilKeyChanged("type"))
    )
  );
}

if (test) {
  // fake up some test data as a hot stream
  let time = 0;
  const target = document.createElement("button"); // standin for target object
  function enter(delay = 0, screenX = 0, screenY = 0) {
    time += delay;
    return { type: "pointerover", time, screenX, screenY, target };
  }
  function move(delay = 0, screenX = 0, screenY = 0) {
    time += delay;
    return { type: "pointermove", time, screenX, screenY, target };
  }
  function leave(delay = 0, screenX = 0, screenY = 0) {
    time += delay;
    return { type: "pointerout", time, screenX, screenY, target };
  }
  const events = [
    enter(),
    leave(350, 1, 1),
    enter(50, 1, 1),
    leave(10, 2, 2),
    enter(350, 2, 2),
    leave(400, 2, 2),
    move(500, 1, 1),
  ];
  function mytimestamp() {
    return map((event) => ({
      ...event,
      timeStamp: Math.round(performance.now() - T0),
    }));
  }
  const T0 = performance.now();
  const stream = from(events).pipe(
    delayWhen((event) => interval(event.time)),
    map((event) => ({
      ...event,
      timeStamp: Math.round(performance.now() - T0),
    })),
    share()
  );
  stream.subscribe();

  const enters = stream.pipe(filter((e) => e.type == "pointerover"));
  const leaves = stream.pipe(filter((e) => e.type == "pointerout"));
  const enterLeaves = stream.pipe(
    filter((e) => e.type === "pointerover" || e.type === "pointerout")
  );
  const hover = hoverIntentStream(300, enterLeaves);
  show("hover", hover);
}
