# Crownfall Defense Shape

## Core Loop

Place defenders, shape the maze, start a wave, defeat enemies for gold, upgrade or sell defenders, then survive the next wave.

## Loss And Score

The run is endless. The player loses when enough enemies reach the keep and keep health reaches zero. The score and highest wave become the measure of success.

## Map

The first map is an open battlefield grid with a left-side spawn gate and a right-side keep gate. Every defender occupies a tile and acts as a blocker, so the player designs the enemy route. A placement is illegal if it fully seals the route from spawn to keep.

## Theme

Fantasy siege defense inspired by open-map Warcraft 3 tower defense mods. The player commands archers, melee wall units, siege weapons, and wizards defending a castle keep from skeletons, centaurs, fallen knights, and dragons.

## Defenders

| Defender | Role | Intended Use |
| --- | --- | --- |
| Archer | Single target, fast, low damage | Cheap early coverage and finishing weakened enemies. |
| Shield Guard | Melee wall, low range | Blocks tiles while stabbing enemies that pass nearby. |
| Ballista | Single target, slow, high damage | Deletes tough enemies and rewards good placement. |
| Sky Hunter | Flying-only high damage | Dedicated answer to dragons and flying boss waves. |
| Storm Mage | Moderate fire rate, chained low damage | Handles clustered enemies along bends. |
| Flame Mage | Fast AOE, low damage | Clears small enemies and smooths out swarms. |
| Catapult | Slow AOE, high damage | Punishes dense groups, especially around corners. |
| Frost Wizard | AOE slow | Support defender that improves every other defender nearby. |

## Enemy Types

Skeletons are the baseline. Centaurs pressure weak coverage with speed. Fallen knights test single-target damage. Dragons are flying enemies that ignore the maze and move directly toward the keep. Ground boss waves arrive every 10 waves. Flying boss waves arrive every 25 waves and override the ground boss cadence when they overlap.

## Run Controls

Difficulty increases enemy health and speed without changing the basic income, tower cost, or upgrade economy. Speed can be set to 1x, 2x, or 3x.

## Keyboard Shortcuts

Number keys 1-8 select defenders. W starts the next wave. Space pauses or resumes. U upgrades the selected defender, S sells it, A/B choose available evolution branches, and F activates a final form when available. Bracket keys adjust speed down or up.

## Later Tower Evolutions

At level 4, defenders can pay gold to branch into specialized upgrades. Evolved defenders can continue upgrading to level 8, where they can pay for a final form based on the chosen branch.

| Defender | Evolution A | Evolution B |
| --- | --- | --- |
| Archer | Rapid Volley | Split Shot |
| Shield Guard | Bulwark | Blademaster |
| Ballista | Siege Bolt | Longbow Frame |
| Sky Hunter | Dragon Piercer | Skyburst Crew |
| Storm Mage | Forked Lightning | Thunder Strike |
| Flame Mage | Flame Cone | Fire Orb |
| Catapult | Earthbreaker | Scatter Stones |
| Frost Wizard | Deep Freeze | Ice Shards |

## Session Feel

Readable and tactical, with the pressure scaling until the maze finally breaks.

## Visual Direction

Use compact pixel-sprite silhouettes for defenders and enemies, with simple bobbing/flying motion, projectile trails, hit bursts, and clear health bars. Keep the sprites code-native until the game needs a real art asset pipeline.
