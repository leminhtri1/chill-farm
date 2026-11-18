// The farm behind the title screen: a fully grown field at golden hour, every crop ripe in bands of
// colour, a few golden ones glowing, sprinklers, the owl scarecrow and the farmer out on the path.
import { startSeason } from './calendar.js';
import { CROP_ORDER } from './config.js';
import { createGame, plotAt } from './state.js';

const GOLDEN = new Set(['6,4', '10,7', '13,5', '8,8']);
const SPRINKLERS = new Set(['7,5', '12,6']);

export function titleFarm() {
  const game = createGame(2026);
  startSeason(game);
  game.levels.field = 3;
  game.levels.scarecrow = 2;
  game.levels.compost = 2;
  for (let r = 3; r <= 8; r += 1) {
    for (let c = 5; c <= 14; c += 1) {
      const plot = plotAt(game, c, r);
      plot.tilled = true;
      if (SPRINKLERS.has(`${c},${r}`)) {
        plot.sprinkler = true;
        plot.sprinkle = 11.6;
        continue;
      }
      // two columns for each crop: turnips, carrots, sunberries, pumpkins, moonmelons
      const kind = CROP_ORDER[Math.floor((c - 5) / 2)];
      plot.crop = { kind, growth: 1, water: 20, dry: 0, ripe: true, harvests: 0, wiggle: 0, golden: GOLDEN.has(`${c},${r}`) };
    }
  }
  // the farmer stands on the east path, admiring the moonmelons
  game.player.x = 15 * 48 + 24;
  game.player.y = 5 * 48 + 24;
  game.player.dir = 'left';
  game.clock = 0.63;
  return game;
}
