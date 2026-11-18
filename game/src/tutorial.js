// First-season guidance: a friendly tip that walks a new farmer through the core loop, one step at
// a time, and steps aside once each thing has been done.

const STEPS = [
  { done: (g) => g.plots.some((p) => p && p.tilled), tip: 'Click a dashed plot (or face it and press Space) to till the soil' },
  { done: (g) => g.stats.planted > 0, tip: 'Click the tilled soil again to plant a turnip seed' },
  { done: (g) => g.plots.some((p) => p && p.crop && p.crop.water > 0) || g.stats.harvested > 0, tip: 'Water your seedling: click it again. Crops only grow while watered' },
  { done: (g) => g.stats.harvested > 0, tip: 'Plant the rest of your seeds while it grows. Refill water at the well' },
  { done: (g) => g.earned > 0, tip: "Ripe crops sparkle: harvest them, then sell at Hazel's stall (top right)" },
  { done: (g) => g.seeds.carrot > 0 || g.seeds.turnip > 6 || g.levels.field > 0 || g.day > 1, tip: 'Buy more seeds at the stall. Carrots earn more, and check the order board!' },
];

/** Once the basics are done, a nudge toward the deeper systems on the next days. */
const DEPTH_STEPS = [
  { done: (g) => g.stats.processed > 0 || g.kettles.some(Boolean), tip: 'Try the Preserves Workshop (left): jars sell for much more' },
  { done: (g) => g.stats.donated > 0, tip: 'Hammer bubbles need produce: clean the pond to scare off crows' },
  { done: (g) => g.stats.gifts > 0, tip: 'Click a villager to give a gift and earn friendship hearts' },
];

export function tutorialTip(game) {
  if (game.day > 4) return null;
  if (game.day <= 2) for (const step of STEPS) if (!step.done(game)) return step.tip;
  if (game.day < 2) return null;
  for (const step of DEPTH_STEPS) if (!step.done(game)) return step.tip;
  return null;
}
