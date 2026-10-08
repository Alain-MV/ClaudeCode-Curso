# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

An Arkanoid/Breakout game to be built in plain HTML, CSS, and JavaScript with **zero dependencies**, playable in the browser. The game itself is **not implemented yet** — so far the repo contains only prepared assets and a spec-driven workflow. Keep the no-dependencies / no-build constraint: there is no package manager, bundler, or test runner. Run the game by opening the HTML file in a browser (or `python3 -m http.server` for a local server, needed so the spritesheet/sounds load without `file://` CORS issues).

The project is authored in **Spanish** (README, and the intended language of specs). Match the user's language in replies and spec content.

## Spec-driven workflow

Work on this project is meant to flow through two user-invocable skills (duplicated under both `skills/` and `.agents/skills/` so Claude Code, Codex, and Gemini CLI all find them — the two copies are identical, keep them in sync):

- **`/spec <description>`** — designs a spec by asking clarifying questions, then writes `specs/NN-slug.md` (zero-padded sequential number). New specs are saved in `Draft` state; the human promotes to `Approved`. Also seeds `specs/.spec-config.yml` (`AutoCreateBranch: true` by default) on first run. The `specs/` folder does not exist yet; the first spec will create it.
- **`/spec-impl <NN-slug>`** — implements a spec **only** if its status means "Approved" (any language). Creates/switches to a `spec-NN-slug` git branch, then implements the plan step by step, pausing after each step for diff review. Never commits automatically.

Implications when writing code here: follow the approved spec exactly (flag suboptimal parts as observations, don't silently deviate), and don't implement anything outside the current spec's scope.

Note: `/spec-impl` expects a git repo (it manages branches), but this directory is **not currently a git repository** — initialize one before relying on that flow.

## Assets

`assets/spritesheet.js` is the rendering layer the game code will build on. Load it with a `<script>` tag; it exposes globals (no modules):

- `SPRITES` — source rects for `paddle`, `ball`, and `blocks` (keyed by color).
- `EXPLOSION_FRAMES` / `EXPLOSION_DURATION` — per-color block-break animation frames.
- `loadSpritesheet(cb)` — async-loads `assets/spritesheet-breakout.png` into an offscreen canvas, then fires `cb`; drawing before load is a no-op.
- `drawSprite(ctx, name, x, y, w, h)` — draws a named sprite; block names use the `block_<color>` prefix (e.g. `block_red`).
- `drawFrame(ctx, frame, x, y, w, h)` — draws an arbitrary frame rect (used for explosion animation).

Sound effects live in `assets/sounds/` (`break-sound.mp3`, `ball-bounce.mp3`).
