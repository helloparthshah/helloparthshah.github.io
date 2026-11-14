// Turns wheel and trackpad input into one-slide steps.
//
// - A wheel click or a trackpad swipe moves exactly one slide.
// - Trackpad inertia (a long tail of shrinking deltas) is ignored.
// - Unlocks after a short quiet gap, when a new accelerating swipe starts,
//   or while a mouse wheel keeps spinning (steady, large deltas), one step
//   per `repeatMs` so fast spins can travel further.
export function createWheelStepper(step, { quietMs = 220, repeatMs = 650, threshold = 30 } = {}) {
  let acc = 0, locked = false, lastEvent = -Infinity, lastDelta = 0, steppedAt = -Infinity;
  return function onWheel(deltaY, now) {
    const quiet = now - lastEvent > quietMs;
    const size = Math.abs(deltaY), prev = Math.abs(lastDelta);
    const freshSwipe = size > 25 && size > prev * 1.8 && now - steppedAt > 450;
    const spinning = size >= 50 && size >= prev * 0.9 && now - steppedAt > repeatMs;
    lastEvent = now;
    lastDelta = deltaY;
    if (locked && !quiet && !freshSwipe && !spinning) return false;
    if (quiet) acc = 0;
    locked = false;
    acc += deltaY;
    if (Math.abs(acc) < threshold) return false;
    const dir = Math.sign(acc);
    acc = 0;
    locked = true;
    steppedAt = now;
    step(dir);
    return true;
  };
}
