// The farm behind the title screen: a fully grown field at golden hour, every crop ripe in bands of
// colour, a few golden ones glowing, the workshop's kettles steaming, the village restored, friends
// about, and the farmer out on the path.
import { startSeason } from './calendar.js';
import { CROP_ORDER } from './config.js';
import { createGame, plotAt } from './state.js';

const GOLDEN = new Set(['6,4', '10,7', '13,5', '8,8']);

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
      // two columns for each crop: turnips, carrots, sunberries, pumpkins, moonmelons
      const kind = CROP_ORDER[Math.floor((c - 5) / 2)];
      plot.crop = { kind, growth: 1, water: 20, dry: 0, ripe: true, harvests: 0, wiggle: 0, golden: GOLDEN.has(`${c},${r}`) };
    }
  }
  // the farmer stands on the east path, admiring the moonmelons
  game.player.x = 15 * 48 + 24;
  game.player.y = 5 * 48 + 24;
  game.player.dir = 'left';
  // a busy workshop with jars on the shelf, and the village brought back to life
  game.kettles[0] = { kind: 'berry', qty: 5, left: 20, total: 40 };
  game.kettles[1] = { kind: 'carrot', qty: 5, left: 30, total: 40 };
  Object.assign(game.goods, { turnip: 3, carrot: 2, berry: 4, pumpkin: 1 });
  Object.assign(game.restored, { pond: true, bridge: true, bakery: true });
  Object.assign(game.friends.fern, { hearts: 4 });
  Object.assign(game.friends.bo, { hearts: 5 });
  Object.assign(game.friends.pip, { hearts: 3 });
  game.clock = 0.63;
  return game;
}
