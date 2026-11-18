# chill-farm

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/leminhtri1/chill-farm/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/leminhtri1/chill-farm/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

Chill Farm is a cozy farming game for the desktop browser: till, plant, water and harvest five original crops, cook them into jams and juices at the preserves workshop, donate produce to restore the village's pond, bridge and bakery, befriend three villagers, and pick a perk each time you level up. Sell at Hazel's market stall, fill neighbours' orders and upgrade your farm, then see which ribbon you win at the Harvest Festival after 10 days (about 15 minutes). All art is drawn in code and every sound and the music-box tune are synthesised with WebAudio, so the game is plain static files with no assets and no network requests.

## Run it

```sh
node serve.ts   # then open http://localhost:8080 in Chrome
```

## How to play

- **Goal:** earn 4,000 coins in 10 days for the blue ribbon (10,000 for gold). Your score is every coin you earn.
- **Move:** WASD or the arrow keys, or click any tile to walk there.
- **Act:** Space / E on the tile you face, or click it. The action fits the tile: till bare field, plant on tilled soil, water a thirsty crop (it shows a drop), harvest a sparkling ripe one.
- **Seeds:** 1–6, Q / R or the mouse wheel pick a seed packet or a sprinkler on the hotbar.
- **Water:** refill the can at the well. A crop that never goes dry is *Perfect* and sells for more.
- **Market:** sell your basket, buy seeds, sprinklers and upgrades (Bigger Field, Watering Can, Compost Heap, Scarecrow, Comfy Boots). Each day has a *Hot pick* crop that sells for 1.5x.
- **Orders:** the village board pays extra for baskets of crops, for a few days only. From day 2, neighbours also post timed **rush orders** (bottom right of the screen) that pay 1.5x if you bring the crops to the board before the timer runs out. They come more often as the festival nears.
- **Day goals:** every morning sets a coin goal for the day that rises through the season. Meet it for a bonus.
- **Crows** land on your crops: click them or walk up to shoo them before they eat. They grow bolder each day, and from day 4 they arrive in flocks. They love golden crops best.
- **Preserves workshop** (left of the field): load a kettle with up to 5 of one crop and it cooks them into jars (Turnip Pickles, Carrot Juice, Sunberry Jam, Pumpkin Butter, Moonmelon Jam) worth 1.6x the crop. Kettles are few and keep cooking overnight, so every harvest is a choice: sell now, or preserve for later.
- **Village restoration:** the hammer bubbles mark landmarks that need produce. Clean the **pond** (ducks come home and scare off half the crows), fix the **bridge** over the creek (the seed merchant crosses with Moonmelon seeds) and then reopen the **bakery** across it (jars sell for 25% more). Each one changes the map.
- **Friends and perks:** Granny Fern, Baker Bo and Little Pip each take one liked gift a day (a jar counts double) and grow hearts from gifts and orders; each heart makes their orders pay more, and a best friend sends a hamper. Farm work earns experience, and every level-up offers two perk cards to pick one from (Green Thumb, Jam Master, Extra Kettle, Golden Touch and more).
- Quick harvests build a **combo**, and now and then a crop ripens **golden**. It glows in the field and pays a big bonus when harvested.
- Esc / P pauses, H shows help, M mutes. Rainy days water everything for you.

## How it is built

`game/` is the whole game: `index.html` and plain ES modules under `game/src/`, each with one job:

- **Rules:** `config.js` (every balance number), `state.js` (a new season and map helpers), `farm.js` (till, plant, water, grow, harvest), `market.js`, `orders.js` (the village board), `challenges.js` (day goals, rush orders, crow flocks), `preserves.js` (the workshop's kettles and jars), `restoration.js` (donations and landmarks), `villagers.js` (gifts and hearts), `skills.js` (experience, levels and perks), `critters.js` (crows and butterflies), `calendar.js` (clock, weather, mornings) and `player.js` (walking and reach).
- **Art:** every sprite is drawn with canvas shapes. `draw-kit.js` holds shared helpers, then `farmer-art.js`, `crop-art.js`, `building-art.js`, `nature-art.js`, `critter-art.js`, `icon-art.js`, `festival-art.js` (lanterns and fireworks), `workshop-art.js` (workshop, kettles, jars), `landmark-art.js` (pond, creek, bridge, bakery before and after) and `villager-art.js` (villagers, portraits, hearts, perk icons).
- **Screen:** `scene.js` (the farm, light and weather), `hud.js`, `challenge-hud.js`, `play-overlays.js`, `panels.js` with `panel-kit.js`, `workshop-panel.js`, `restore-panel.js`, `friend-panel.js` and `perk-panel.js`, `screens.js` (title, day card, results), `particles.js`, `feedback.js` (events to sounds and effects) and `render.js`.
- **App:** `app.js` (shared state), `title-farm.js`, `season-flow.js`, `farm-controls.js`, `panel-controls.js`, `input.js`, `game-update.js`, `audio.js`, `best-score.js`, `tutorial.js` and `main.js` (the loop).

`main.ts` hands the game and its screenshots in for the make.fun bounty and writes `dossier.json` with the kit's `vendor/makefun-game.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=eh1gzvjg&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
