/** Hover after a delay from http://blog.tmtk.net/posts/2017-01-10-hover-with-rxjs/ */

const test = true;

import {
  debounceTime,
  delayWhen,
  filter,
  from,
  interval,
  map,
  mergeWith,
  Observable,
  combineLatestWith,
  concat,
  distinct,
  distinctUntilChanged,
  startWith,
  switchMap,
  timer,
  NEVER,
  mapTo,
  takeUntil,
  endWith,
  timestamp,
  exhaustAll,
  exhaustMap,
  take,
  bufferWhen,
  skip,
  timeout,
  timeoutWith,
  of,
  share,
  distinctUntilKeyChanged,
  throttleTime,
  mergeAll,
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
export function hoverIntentStream1(Thold, enterLeave$) {
  const enter$ = enterLeave$.pipe(filter((e) => e.type === "pointerover"));
  const leave$ = enterLeave$.pipe(filter((e) => e.type === "pointerout"));
  const leaveHold$ = leave$.pipe(
    switchMap((leave) =>
      enter$.pipe(
        timeout({ first: Thold, with: () => of(leave) }),
        take(1),
        filter((e) => e === leave)
      )
    )
  );
  return enter$.pipe(
    switchMap((enter) =>
      concat(timer(Thold), NEVER).pipe(
        mapTo(enter),
        takeUntil(leaveHold$),
        endWith({ type: "pointerout" })
      )
    ),
    distinctUntilKeyChanged("type")
  );
}

/** creates a stream of hover events
 * @param {number} Thold
 * @param {Observable<Partial<PointerEvent>>} enterLeave$
 */
export function hoverIntentStream2(Thold, enterLeave$) {
  const enter$ = enterLeave$.pipe(filter((e) => e.type === "pointerover"));
  const leave$ = enterLeave$.pipe(filter((e) => e.type === "pointerout"));
  const enterHold$ = enter$.pipe(
    switchMap((enter) =>
      leave$.pipe(
        timeout({ first: Thold, with: () => of(enter) }),
        take(1),
        filter((e) => e === enter)
      )
    )
  );
  // show("eh", enterHold$);

  const leaveHold$ = leave$.pipe(
    switchMap((leave) =>
      enter$.pipe(
        timeout({ first: Thold, with: () => of(leave) }),
        take(1),
        filter((e) => e === leave)
      )
    )
  );
  // show("lh", leaveHold$);

  return enterHold$.pipe(mergeWith(leaveHold$));
}

/** creates a stream of hover events
 * @param {number} Thold
 * @param {Observable<Partial<PointerEvent>>} enterLeave$
 */
export function hoverIntentStream3(Thold, enterLeave$) {
  return enterLeave$.pipe(
    groupBy((e) => e.target),
    mergeMap(($group) =>
      $group.pipe(debounceTime(Thold), distinctUntilKeyChanged("type"))
    )
  );
}

export const hoverIntentStream = hoverIntentStream1;

if (test) {
  // fake up some test data as a hot stream
  let time = 0;
  const target = 1; // standin for target object
  function enter(delay = 0, x = 0, y = 0) {
    time += delay;
    return { type: "pointerover", time, x, y, target };
  }
  function move(delay = 0, x = 0, y = 0) {
    time += delay;
    return { type: "pointermove", time, x, y, target };
  }
  function leave(delay = 0, x = 0, y = 0) {
    time += delay;
    return { type: "pointerout", time, x, y, target };
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
      timestamp: Math.round(performance.now() - T0),
    }));
  }
  const T0 = performance.now();
  const stream = from(events).pipe(
    delayWhen((event) => interval(event.time)),
    mytimestamp(),
    share()
  );
  stream.subscribe();

  const enters = stream.pipe(filter((e) => e.type == "pointerover"));
  const leaves = stream.pipe(filter((e) => e.type == "pointerout"));
  const enterLeaves = stream.pipe(
    filter((e) => e.type === "pointerover" || e.type === "pointerout")
  );
  const hover = hoverIntentStream(300, enterLeaves).pipe(mytimestamp());
  show("hover", hover);
}
