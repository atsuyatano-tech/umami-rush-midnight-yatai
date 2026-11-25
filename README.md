# umami-rush-midnight-yatai

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/atsuyatano-tech/umami-rush-midnight-yatai/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/atsuyatano-tech/umami-rush-midnight-yatai/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**UMAMI RUSH — Midnight Yatai**: a 2D cooking game about one chef, one lantern-lit street-food stall, and a 150-second dinner rush. Order tickets land on the rail as pictorial ingredient sequences with fat patience bars. You run the counter — FRIDGE bins → CHOP BOARD → a 3-pan teppan GRILL with a raw → cooking → PERFECT (gold zone) → overdone → burnt doneness gradient → PLATING in ticket order with ghost outlines for what's missing → the PASS window — while the chef's two hands and real walking time force you to plan routes. The menu is a modular base × protein × topping matrix (8 named dishes); consecutive tickets deliberately share a prep step, tips scale with remaining patience, and combos multiply until burnt food or a late ticket breaks them. The last 30 seconds are the RUSH. Keyboard and mouse, fully offline, no build step.

## Run it

```sh
python3 -m http.server --directory game 8080   # then open http://localhost:8080
# hand-in program (writes game/, screenshots/ and dossier.json to the output dir):
MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=waf1qbyg&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
