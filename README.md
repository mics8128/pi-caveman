# pi-caveman

Pi extension inspired by [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman).

Goal: bring Caveman **full mode** to [pi coding agent](https://github.com/mariozechner/pi-coding-agent)-style extensions with minimal runtime machinery.

## Source

This project adapts the prompt behavior from `juliusbrussee/caveman`:

- Caveman full-mode session rules
- Per-turn short reinforcement reminder
- Caveman compress concept for natural-language memory files

Original project supports many agents, Claude Code hooks, statusline badges, stats, MCP shrink, commit/review/compress skills, and multiple intensity modes. This repo keeps only pieces useful for my pi workflow.

## What Changed

Compared with upstream caveman:

- Packaged as a pi extension under `~/.pi/agent/extensions/pi-caveman/`
- Fixed mode to **full** only
- Always enabled; no on/off command
- Injects full Caveman rules once per pi session
- Injects original short reminder each prompt
- Removes mode-switching prompt text not needed for fixed full mode
- Removes Claude Code-specific statusline setup and flag-file logic
- Removes footer/status badge in pi UI
- Adds `/caveman-compress <filepath>` command
- Supports `/caveman:compress <filepath>` alias
- Stores project as standalone git repo for version management

## Behavior

Always enabled.

First prompt in each session injects full Caveman full-mode rules:

```txt
CAVEMAN MODE ACTIVE — level: full
```

Every prompt also injects short reminder:

```txt
CAVEMAN MODE ACTIVE (full). Drop articles/filler/pleasantries/hedging. Fragments OK. Code/commits/security: write normal.
```

No visible status badge is shown.

## Commands

```txt
/caveman-compress <filepath>
/caveman:compress <filepath>
```

`/caveman-compress` asks the agent to compress natural-language memory files while preserving code, paths, commands, URLs, headings, lists, tables, and exact technical content. It creates `FILE.original.md` before overwriting the source file.

## Install

Clone or copy this directory to pi's global extension path:

```bash
mkdir -p ~/.pi/agent/extensions
git clone https://github.com/mics8128/pi-caveman ~/.pi/agent/extensions/pi-caveman
```

Then reload pi:

```txt
/reload
```

## Development

```bash
cd ~/.pi/agent/extensions/pi-caveman
git status
```

Pi auto-discovers directory extensions with `index.ts` from:

```txt
~/.pi/agent/extensions/*/index.ts
```

## License / Attribution

MIT License, same as upstream [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman).

Prompt wording and caveman concept adapted from upstream. See `LICENSE` for copied upstream license text.
