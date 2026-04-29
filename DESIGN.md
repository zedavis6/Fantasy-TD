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
| Shield Guard | Cheap melee, very low early damage | Cheap maze shaping with later stun or sweep evolutions. |
| Ballista | Single target, slow, high damage | Deletes tough enemies and rewards good placement. |
| Sky Hunter | Flying-only high damage | Dedicated answer to dragons and flying boss waves. |
| Storm Mage | Moderate fire rate, chained low damage | Handles clustered enemies along bends. |
| Flame Mage | Fast AOE, low damage | Clears small enemies and smooths out swarms. |
| Catapult | Slow AOE, high damage | Punishes dense groups, especially around corners. |
| Frost Wizard | Single-target projectile slow | Starts as precise control, then branches into longer slows or AOE slow splash. |

## Enemy Types

Skeletons are the baseline. Centaurs pressure weak coverage with speed. Fallen knights test single-target damage. Dragons are flying enemies that ignore the maze and move directly toward the keep. Ground boss waves arrive every 10 waves. Flying boss waves arrive every 25 waves and override the ground boss cadence when they overlap.

## Run Controls

Difficulty increases enemy health and speed, and also scales kill and wave-clear gold upward so higher difficulties remain manageable. Reward multipliers are stepped by difficulty: 1.00x, 1.12x, 1.45x, 1.95x, and 2.55x. Difficulty locks when the first wave starts to prevent income exploits. Speed can be set to 1x, 2x, or 3x.

## Wave Preview

The game previews the next wave with a named pattern, short tactical note, tags, and enemy count. Patterns include Skeleton Swarm, Centaur Rush, Knight Push, Dragon Skies, Ground Boss, and Flying Boss.

## Keyboard Shortcuts

Number keys 1-8 select defenders. W starts the next wave. Space pauses or resumes. U upgrades the selected defender, S sells it, A/B choose available evolution branches, and F activates a final form when available. Bracket keys adjust speed down or up.

## Later Tower Evolutions

At level 4, defenders can pay gold to branch into specialized upgrades. The level 2 upgrade stays cheap, level 3 and 4 are modestly more expensive, and evolution costs about 30% more so branching is a meaningful commitment.

| Defender | Evolution A | Evolution B |
| --- | --- | --- |
| Archer | Rapid Volley | Split Shot |
| Shield Guard | Shield Bash | Shield Sweep |
| Ballista | Siege Bolt | Longbow Frame |
| Sky Hunter | Dragon Piercer | Skyburst Crew |
| Storm Mage | Forked Lightning | Thunder Strike |
| Flame Mage | Flame Cone | Fire Orb |
| Catapult | Earthbreaker | Scatter Stones |
| Frost Wizard | Deep Chill | Ice Shards |

## Session Feel

Readable and tactical, with the pressure scaling until the maze finally breaks.

## Visual Direction

Use compact pixel-sprite silhouettes for defenders and enemies, with simple bobbing/flying motion, projectile trails, hit bursts, and clear health bars. Keep the sprites code-native until the game needs a real art asset pipeline.

## Interface Direction

Keep the defender picker as a compact overlay on the map so the side panel can stay focused on selected defender details, wave preview, and run controls.

## Castle Races

Race is selected before wave 1 and locks when the first wave starts. Each race has a separate tower roster and evolution set.

Human is the baseline balanced race with archers, guards, siege weapons, mages, dedicated anti-air, and the Frost Wizard's targeted projectile slow.

Orc is the first alternate race: melee-heavy maze building, extra-cheap weak Grunts, lower range, and higher raw damage once its real towers are placed or evolved. Its Spear Thrower finds the best piercing line, War Drummer pulses a ground damage aura, Firepot burns over time, Wyvern Spear snares flying enemies, Crusher fires ranged splash stuns, and Hex Witch uses a stacking slow aura instead of a projectile.
