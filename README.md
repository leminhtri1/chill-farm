# chill-farm

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/leminhtri1/chill-farm/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/leminhtri1/chill-farm/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

Chill Farm is a cozy farming game for the desktop browser: till, plant, water and harvest five original crops, sell them at Hazel's market stall, fill neighbours' orders and upgrade your farm, then see which ribbon you win at the Harvest Festival after 10 days. All art is drawn in code and every sound and the music-box tune are synthesised with WebAudio, so the game is plain static files with no assets and no network requests.

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
- **Orders:** the village board pays extra for baskets of crops, for a few days only.
- **Crows** land on your crops: click them or walk up to shoo them before they eat.
- Quick harvests build a **combo**, and now and then a crop comes up **golden**.
- Esc / P pauses, H shows help, M mutes. Rainy days water everything for you.

## How it is built

`game/` is the whole game: `index.html` and plain ES modules under `game/src/`, each with one job: `config.js` (balance), `state.js`, `farm.js` (field rules), `market.js`, `orders.js`, `critters.js`, `calendar.js`, `player.js`, `art.js` (every sprite drawn with canvas shapes), `scene.js`, `hud.js`, `panels.js`, `screens.js`, `particles.js`, `feedback.js`, `audio.js`, `input.js`, `tutorial.js` and `main.js` (the loop). `main.ts` hands the game and its screenshots in for the make.fun bounty and writes `dossier.json` with the kit's `vendor/makefun-game.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=eh1gzvjg&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
