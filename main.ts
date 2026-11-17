// Chill Farm: the make.fun best-game-01 hand-in program (Node 22, standard library only).
//
// It copies the playable game (game/, plain static files: index.html plus its ES modules, with all
// art drawn in code and all sounds synthesised with WebAudio, so there are no asset files at all)
// and the screenshots/ taken with Playwright into the output directory, then writes dossier.json
// with the kit's unchanged vendor/makefun-game.ts. The output directory is /output in the grader;
// MAKEFUN_OUTPUT_DIR overrides it locally:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Play it locally with `node serve.ts` and open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** Copy one directory of the repository into the output, failing loudly if it is missing. */
function handIn(name: string, required: boolean): void {
  const from = join(repoRoot, name);
  const to = join(outputDir, name);
  mkdirSync(to, { recursive: true });
  if (!existsSync(from)) {
    if (required) throw new Error(`chill-farm: ${name}/ is missing from the repository`);
    return;
  }
  cpSync(from, to, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
handIn('game', true);
handIn('screenshots', false);

const shots = readdirSync(join(outputDir, 'screenshots')).filter((file) => !file.startsWith('.'));
if (shots.length < 3 || shots.length > 4) {
  console.warn(`chill-farm: expected 3 or 4 screenshots, found ${shots.length}`);
}

// The gate scorer's caps: more than 4 screenshots, one over 256 KiB, more than 993 game entries or
// 48 MiB of game files would be refused, and the source text the judge outlines is capped at 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
