const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  lives: document.getElementById("lives"),
  credits: document.getElementById("credits"),
  wave: document.getElementById("wave"),
  score: document.getElementById("score"),
  banner: document.getElementById("banner"),
  previewName: document.getElementById("preview-name"),
  previewDetails: document.getElementById("preview-details"),
  previewTags: document.getElementById("preview-tags"),
  towerDock: document.getElementById("tower-dock"),
  raceCopy: document.getElementById("race-copy"),
  raceButtons: [...document.querySelectorAll(".race-button")],
  start: document.getElementById("start-wave"),
  pause: document.getElementById("pause"),
  restart: document.getElementById("restart"),
  upgrade: document.getElementById("upgrade"),
  sell: document.getElementById("sell"),
  evolutionPanel: document.getElementById("evolution-panel"),
  evolutionButtons: [...document.querySelectorAll(".evolution-button")],
  difficulty: document.getElementById("difficulty"),
  difficultyValue: document.getElementById("difficulty-value"),
  difficultyLock: document.getElementById("difficulty-lock"),
  selectionTitle: document.getElementById("selection-title"),
  selectionCopy: document.getElementById("selection-copy"),
  towerCards: [],
  speedButtons: [...document.querySelectorAll(".speed-button")],
};

const W = canvas.width;
const H = canvas.height;
const cell = 32;
const cols = W / cell;
const rows = H / cell;
const spawnTile = { col: 0, row: 9 };
const keepTile = { col: cols - 1, row: 9 };

const humanTowerTypes = {
  dart: {
    name: "Archer",
    role: "Fast single low damage",
    glyph: "A",
    cost: 35,
    color: "#f4c95d",
    range: 132,
    fireRate: 0.32,
    damage: 9,
    projectileSpeed: 520,
  },
  guard: {
    name: "Shield Guard",
    role: "Cheap melee",
    glyph: "G",
    cost: 20,
    color: "#7da1d3",
    range: 48,
    fireRate: 0.55,
    damage: 4,
    projectileSpeed: 0,
    melee: true,
  },
  rail: {
    name: "Ballista",
    role: "Slow single high damage",
    glyph: "B",
    cost: 65,
    color: "#c9c3ae",
    range: 158,
    fireRate: 1.18,
    damage: 44,
    projectileSpeed: 620,
  },
  sky: {
    name: "Sky Hunter",
    role: "Flying-only high damage",
    glyph: "H",
    cost: 80,
    color: "#b8f5ff",
    range: 196,
    fireRate: 0.82,
    damage: 82,
    projectileSpeed: 720,
    antiAirOnly: true,
  },
  chain: {
    name: "Storm Mage",
    role: "Moderate chained low damage",
    glyph: "S",
    cost: 75,
    color: "#ff6f8e",
    range: 118,
    fireRate: 0.68,
    damage: 13,
    projectileSpeed: 520,
    chain: true,
    chainRange: 82,
    chainCount: 3,
  },
  flak: {
    name: "Flame Mage",
    role: "Fast AOE low damage",
    glyph: "F",
    cost: 60,
    color: "#ff8b3d",
    range: 116,
    fireRate: 0.42,
    damage: 8,
    projectileSpeed: 430,
    splashRadius: 48,
  },
  mortar: {
    name: "Catapult",
    role: "Slow AOE high damage",
    glyph: "C",
    cost: 95,
    color: "#8f6f42",
    range: 182,
    fireRate: 1.65,
    damage: 38,
    projectileSpeed: 300,
    splashRadius: 72,
  },
  frost: {
    name: "Frost Wizard",
    role: "Single-target slow",
    glyph: "W",
    cost: 70,
    color: "#5bd7e8",
    range: 112,
    fireRate: 0.82,
    damage: 4,
    projectileSpeed: 360,
    slow: true,
    slowDuration: 1.8,
  },
};

const humanEvolutions = {
  dart: {
    a: {
      name: "Rapid Volley",
      desc: "Much faster fire",
      fireRateMult: 0.55,
      damageMult: 0.9,
      glyph: "R",
      final: { name: "Storm of Arrows", desc: "Blinding fire rate", fireRateMult: 0.42, damageMult: 1.22, glyph: "V" },
    },
    b: {
      name: "Split Shot",
      desc: "Hits two targets",
      multiShot: 2,
      damageMult: 0.78,
      glyph: "M",
      final: { name: "Raincaller", desc: "Hits four targets", multiShot: 4, damageMult: 1.18, glyph: "N" },
    },
  },
  guard: {
    a: {
      name: "Shield Bash",
      desc: "Briefly stuns enemies",
      stunDuration: 0.32,
      damageMult: 1.2,
      glyph: "T",
      final: { name: "Iron Bastion", desc: "Longer stun and wider reach", stunDurationAdd: 0.22, rangeAdd: 28, glyph: "I" },
    },
    b: {
      name: "Shield Sweep",
      desc: "Sweeps several nearby enemies",
      multiShot: 3,
      damageMult: 1.05,
      fireRateMult: 0.82,
      glyph: "D",
      final: { name: "Duelist Captain", desc: "Fast sweeping strikes", fireRateMult: 0.58, multiShot: 4, damageMult: 1.25, glyph: "K" },
    },
  },
  rail: {
    a: {
      name: "Siege Bolt",
      desc: "Huge single hits",
      damageMult: 1.85,
      fireRateMult: 1.12,
      glyph: "S",
      final: { name: "Titan Bolt", desc: "Boss-piercing damage", damageMult: 1.72, rangeAdd: 28, glyph: "T" },
    },
    b: {
      name: "Longbow Frame",
      desc: "Longer range and faster reload",
      rangeAdd: 70,
      fireRateMult: 0.72,
      glyph: "L",
      final: { name: "Map Reaper", desc: "Extreme range and reload", rangeAdd: 88, fireRateMult: 0.72, glyph: "R" },
    },
  },
  sky: {
    a: {
      name: "Dragon Piercer",
      desc: "Extreme anti-air damage",
      damageMult: 1.8,
      fireRateMult: 1.08,
      glyph: "P",
      final: { name: "Wyrmslayer", desc: "Devastates flying bosses", damageMult: 1.9, glyph: "Y" },
    },
    b: {
      name: "Skyburst Crew",
      desc: "AOE anti-air blasts",
      splashRadiusAdd: 58,
      damageMult: 0.76,
      fireRateMult: 1.12,
      glyph: "E",
      final: { name: "Starfall Battery", desc: "Huge anti-air explosions", splashRadiusAdd: 54, damageMult: 1.35, glyph: "Q" },
    },
  },
  chain: {
    a: {
      name: "Forked Lightning",
      desc: "More chain jumps",
      chainCountAdd: 3,
      chainRangeAdd: 30,
      glyph: "F",
      final: { name: "Storm Web", desc: "Chains through whole packs", chainCountAdd: 5, chainRangeAdd: 45, glyph: "W" },
    },
    b: {
      name: "Thunder Strike",
      desc: "Small AOE lightning hits",
      splashRadiusAdd: 42,
      damageMult: 1.45,
      chainCountAdd: -1,
      glyph: "T",
      final: { name: "Sky Hammer", desc: "Crushing lightning blasts", splashRadiusAdd: 34, damageMult: 1.5, glyph: "H" },
    },
  },
  flak: {
    a: {
      name: "Flame Cone",
      desc: "Fast, close splash",
      fireRateMult: 0.58,
      rangeAdd: -18,
      splashRadiusAdd: 16,
      glyph: "C",
      final: { name: "Dragon Breath", desc: "Close-range firestorm", fireRateMult: 0.58, splashRadiusAdd: 28, glyph: "B" },
    },
    b: {
      name: "Fire Orb",
      desc: "Longer ranged explosions",
      rangeAdd: 54,
      splashRadiusAdd: 26,
      fireRateMult: 1.18,
      damageMult: 1.25,
      glyph: "O",
      final: { name: "Sun Orb", desc: "Huge ranged explosions", rangeAdd: 45, splashRadiusAdd: 42, damageMult: 1.35, glyph: "U" },
    },
  },
  mortar: {
    a: {
      name: "Earthbreaker",
      desc: "Bigger blast, bigger hit",
      damageMult: 1.55,
      splashRadiusAdd: 34,
      fireRateMult: 1.15,
      glyph: "E",
      final: { name: "Worldsplitter", desc: "Massive siege blast", damageMult: 1.6, splashRadiusAdd: 48, glyph: "W" },
    },
    b: {
      name: "Scatter Stones",
      desc: "Faster smaller blasts",
      fireRateMult: 0.56,
      damageMult: 0.72,
      splashRadiusAdd: 12,
      glyph: "S",
      final: { name: "Hail Battery", desc: "Relentless bombardment", fireRateMult: 0.54, multiShot: 2, glyph: "B" },
    },
  },
  frost: {
    a: {
      name: "Deep Chill",
      desc: "Much longer single-target slow",
      slowDurationAdd: 1.8,
      rangeAdd: 18,
      glyph: "D",
      final: { name: "Winter Prison", desc: "Extreme long-duration slow", slowDurationAdd: 2.2, rangeAdd: 28, glyph: "P" },
    },
    b: {
      name: "Ice Shards",
      desc: "AOE slowing splash",
      splashRadiusAdd: 54,
      damageMult: 1.45,
      fireRateMult: 1.08,
      glyph: "I",
      final: { name: "Glacier Bloom", desc: "Large AOE slow bursts", splashRadiusAdd: 38, damageMult: 1.35, glyph: "G" },
    },
  },
};

const orcTowerTypes = {
  grunt: {
    name: "Grunt",
    role: "Very cheap melee",
    glyph: "G",
    cost: 12,
    color: "#9ac15e",
    range: 42,
    rangeGrowth: 3,
    fireRate: 0.64,
    damage: 2,
    projectileSpeed: 0,
    melee: true,
    groundOnly: true,
  },
  spear: {
    name: "Spear Thrower",
    role: "High damage line",
    glyph: "S",
    cost: 34,
    color: "#c8a45d",
    range: 154,
    rangeGrowth: 3,
    fireRate: 0.48,
    damage: 10,
    projectileSpeed: 0,
    lineStrike: true,
    lineWidth: 22,
  },
  berserker: {
    name: "Berserker",
    role: "High melee damage",
    glyph: "B",
    cost: 52,
    color: "#d3664a",
    range: 54,
    rangeGrowth: 3,
    fireRate: 0.34,
    damage: 20,
    projectileSpeed: 0,
    melee: true,
    groundOnly: true,
  },
  wyvern: {
    name: "Wyvern Spear",
    role: "Anti-air snare",
    glyph: "W",
    cost: 78,
    color: "#b8f5ff",
    range: 92,
    rangeGrowth: 4,
    fireRate: 0.82,
    damage: 92,
    projectileSpeed: 700,
    antiAirOnly: true,
    slow: true,
    slowDuration: 1.1,
  },
  drummer: {
    name: "War Drummer",
    role: "Damage aura",
    glyph: "D",
    cost: 72,
    color: "#d9a441",
    range: 92,
    rangeGrowth: 5,
    fireRate: 0.52,
    damage: 11,
    projectileSpeed: 0,
    auraDamage: true,
    groundOnly: true,
  },
  firepot: {
    name: "Firepot",
    role: "Short AOE burn",
    glyph: "F",
    cost: 62,
    color: "#ff8b3d",
    range: 94,
    rangeGrowth: 5,
    fireRate: 0.55,
    damage: 3,
    projectileSpeed: 390,
    splashRadius: 46,
    burnDps: 12,
    burnDuration: 2.4,
  },
  crusher: {
    name: "Crusher",
    role: "Long splash stun",
    glyph: "C",
    cost: 92,
    color: "#8f6f42",
    range: 148,
    rangeGrowth: 3,
    fireRate: 1.35,
    damage: 34,
    projectileSpeed: 300,
    splashRadius: 58,
    stun: true,
    stunDuration: 0.12,
    groundOnly: true,
  },
  hexer: {
    name: "Hex Witch",
    role: "Hex aura slow",
    glyph: "H",
    cost: 76,
    color: "#a978e8",
    range: 98,
    rangeGrowth: 4,
    fireRate: 0.82,
    damage: 0,
    projectileSpeed: 0,
    auraSlow: true,
    slow: true,
    slowDuration: 0.95,
    groundOnly: true,
  },
};

const orcEvolutions = {
  grunt: {
    a: { name: "Frenzy Stab", desc: "Explodes into rapid single-target damage", fireRateMult: 0.36, damageMult: 4.2, glyph: "F", final: { name: "Blood Stabber", desc: "Extreme rapid single damage", fireRateMult: 0.58, damageMult: 1.45, glyph: "B" } },
    b: { name: "Axe Cleave", desc: "Becomes a real cleaving damage unit", multiShot: 3, damageMult: 3.1, fireRateMult: 0.92, glyph: "A", final: { name: "Axe Mob", desc: "Wide cleaving melee", multiShot: 5, damageMult: 1.25, glyph: "M" } },
  },
  spear: {
    a: { name: "Quick Spears", desc: "Very fast line strikes", fireRateMult: 0.56, damageMult: 0.78, glyph: "Q", final: { name: "Spear Storm", desc: "Extreme line speed", fireRateMult: 0.58, damageMult: 1.08, glyph: "T" } },
    b: { name: "Barbed Spears", desc: "Harder piercing lines", damageMult: 1.35, fireRateMult: 1.1, lineWidthAdd: 8, glyph: "B", final: { name: "Impaler", desc: "Huge piercing line hits", damageMult: 1.35, lineWidthAdd: 10, glyph: "I" } },
  },
  berserker: {
    a: { name: "Blood Frenzy", desc: "Rapid strikes across nearby enemies", fireRateMult: 0.5, damageMult: 1.08, multiShot: 2, glyph: "F", final: { name: "Red Rage", desc: "Relentless multi-target melee", fireRateMult: 0.58, multiShot: 4, glyph: "R" } },
    b: { name: "Skull Cleaver", desc: "Heavy cleaving hits", damageMult: 1.55, fireRateMult: 1.18, multiShot: 2, glyph: "K", final: { name: "Boss Butcher", desc: "Huge cleaving burst", damageMult: 1.45, multiShot: 3, glyph: "U" } },
  },
  wyvern: {
    a: { name: "Dragon Skewer", desc: "Extreme anti-air damage", damageMult: 1.8, glyph: "S", final: { name: "Sky Killer", desc: "Flying boss execution", damageMult: 1.9, glyph: "K" } },
    b: { name: "Net Spears", desc: "AOE anti-air blasts", splashRadiusAdd: 58, damageMult: 0.78, glyph: "N", final: { name: "Net Storm", desc: "Huge anti-air splash", splashRadiusAdd: 58, damageMult: 1.35, glyph: "M" } },
  },
  drummer: {
    a: { name: "Battle Rhythm", desc: "Faster aura pulses", fireRateMult: 0.55, damageMult: 1.1, glyph: "R", final: { name: "War Chant", desc: "Rapid area pressure", fireRateMult: 0.55, damageMult: 1.2, glyph: "C" } },
    b: { name: "Thunder Drum", desc: "Wider, harder aura", rangeAdd: 28, damageMult: 1.35, glyph: "T", final: { name: "Earth Drum", desc: "Huge damage aura", rangeAdd: 32, damageMult: 1.25, glyph: "E" } },
  },
  firepot: {
    a: { name: "Oil Fire", desc: "Wider, longer burns", splashRadiusAdd: 30, burnDurationAdd: 1.2, glyph: "O", final: { name: "Burn Pit", desc: "Huge lingering burn", splashRadiusAdd: 46, burnDurationAdd: 1.4, fireRateMult: 0.84, glyph: "P" } },
    b: { name: "Pitch Toss", desc: "Longer range, hotter burns", rangeAdd: 52, fireRateMult: 1.12, burnDpsMult: 1.35, glyph: "T", final: { name: "Meteor Pot", desc: "Long-range burning bombs", rangeAdd: 54, splashRadiusAdd: 30, burnDpsMult: 1.25, glyph: "M" } },
  },
  crusher: {
    a: { name: "War Maul", desc: "Bigger splash and damage", damageMult: 1.35, splashRadiusAdd: 28, glyph: "M", final: { name: "Mountain Breaker", desc: "Massive splash damage", damageMult: 1.3, splashRadiusAdd: 34, glyph: "B" } },
    b: { name: "Stone Volley", desc: "Faster smaller stun shots", fireRateMult: 0.68, damageMult: 0.78, splashRadiusAdd: -16, glyph: "V", final: { name: "Quake Battery", desc: "Relentless ranged stuns", fireRateMult: 0.68, damageMult: 1.12, glyph: "Q" } },
  },
  hexer: {
    a: { name: "Deep Hex", desc: "Longer slow", slowDurationAdd: 1.35, rangeAdd: 20, glyph: "D", final: { name: "Doom Hex", desc: "Huge slow field", slowDurationAdd: 1.65, rangeAdd: 38, glyph: "X" } },
    b: { name: "Pain Hex", desc: "Adds damage to the slow field", damageAdd: 12, fireRateMult: 0.85, glyph: "P", final: { name: "Soul Hex", desc: "Heavy magic damage", damageAdd: 18, fireRateMult: 0.76, glyph: "S" } },
  },
};

const races = {
  human: {
    name: "Human",
    description: "Balanced defenders with siege, mages, and anti-air.",
    towers: humanTowerTypes,
    evolutions: humanEvolutions,
    order: ["dart", "guard", "rail", "sky", "chain", "flak", "mortar", "frost"],
  },
  orc: {
    name: "Orc",
    description: "Melee-heavy maze builders with brutal short-range damage.",
    towers: orcTowerTypes,
    evolutions: orcEvolutions,
    order: ["grunt", "spear", "berserker", "wyvern", "drummer", "firepot", "crusher", "hexer"],
  },
};

let selectedRace = "human";
let raceLocked = false;
let towerTypes = races[selectedRace].towers;
let evolutions = races[selectedRace].evolutions;
let selectedBuild = "dart";
let selectedTower = null;
let hoveredTile = null;
let currentPath = [];
let lastTime = performance.now();
let spawnTimer = 0;
let waveActive = false;
let paused = false;
let ended = false;
let gameSpeed = 1;
let animTime = 0;
let difficultyLocked = false;
let nextTowerId = 1;

const state = {
  lives: 20,
  credits: 230,
  wave: 1,
  score: 0,
  spawned: 0,
  toSpawn: 0,
  waveQueue: [],
  towers: [],
  enemies: [],
  projectiles: [],
  effects: [],
  difficulty: 3,
};

const terrainDecor = Array.from({ length: 90 }, (_, index) => {
  const x = (index * 137 + 41) % W;
  const y = (index * 83 + 67) % H;
  const size = 2 + ((index * 19) % 5);
  const kind = index % 5;
  return { x, y, size, kind };
});

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSq = dx * dx + dy * dy;
  if (!lengthSq) return dist(point, start);
  const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq, 0, 1);
  return Math.hypot(point.x - (start.x + dx * t), point.y - (start.y + dy * t));
}

function lineStrikePlan(tower, stats, targets) {
  let best = null;
  for (const candidate of targets) {
    const dx = candidate.x - tower.x;
    const dy = candidate.y - tower.y;
    const distance = Math.hypot(dx, dy) || 1;
    const end = {
      x: tower.x + (dx / distance) * stats.range,
      y: tower.y + (dy / distance) * stats.range,
    };
    const hits = targets.filter(
      (enemy) => distanceToSegment(enemy, tower, end) <= (stats.lineWidth || 20) + enemy.radius * 0.65,
    );
    const leadProgress = Math.max(...hits.map(enemyProgress));
    const score = hits.length * 100000 + leadProgress;
    if (!best || score > best.score) {
      best = { end, hits, score };
    }
  }
  return best;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function tileKey(tile) {
  return `${tile.col},${tile.row}`;
}

function tileCenter(tile) {
  return {
    x: tile.col * cell + cell / 2,
    y: tile.row * cell + cell / 2,
  };
}

function tileFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * W;
  const y = ((event.clientY - rect.top) / rect.height) * H;
  return {
    col: clamp(Math.floor(x / cell), 0, cols - 1),
    row: clamp(Math.floor(y / cell), 0, rows - 1),
  };
}

function sameTile(a, b) {
  return a.col === b.col && a.row === b.row;
}

function occupiedKeys(extraBlock = null, ignoredTower = null) {
  const blocked = new Set();
  for (const tower of state.towers) {
    if (tower !== ignoredTower) blocked.add(tileKey(tower));
  }
  if (extraBlock) blocked.add(tileKey(extraBlock));
  return blocked;
}

function isGate(tile) {
  return sameTile(tile, spawnTile) || sameTile(tile, keepTile);
}

function inBounds(tile) {
  return tile.col >= 0 && tile.row >= 0 && tile.col < cols && tile.row < rows;
}

function findPath(extraBlock = null, ignoredTower = null) {
  const blocked = occupiedKeys(extraBlock, ignoredTower);
  const startKey = tileKey(spawnTile);
  const endKey = tileKey(keepTile);
  const queue = [spawnTile];
  const cameFrom = new Map([[startKey, null]]);
  const dirs = [
    { col: 1, row: 0 },
    { col: -1, row: 0 },
    { col: 0, row: 1 },
    { col: 0, row: -1 },
  ];

  while (queue.length) {
    const tile = queue.shift();
    if (tileKey(tile) === endKey) break;

    for (const dir of dirs) {
      const next = { col: tile.col + dir.col, row: tile.row + dir.row };
      const key = tileKey(next);
      if (!inBounds(next) || cameFrom.has(key)) continue;
      if (blocked.has(key) && key !== startKey && key !== endKey) continue;
      cameFrom.set(key, tile);
      queue.push(next);
    }
  }

  if (!cameFrom.has(endKey)) return [];
  const path = [];
  let cursor = keepTile;
  while (cursor) {
    path.push(cursor);
    cursor = cameFrom.get(tileKey(cursor));
  }
  return path.reverse().map(tileCenter);
}

function refreshPath() {
  currentPath = findPath();
  for (const enemy of state.enemies) {
    if (enemy.flying) continue;
    enemy.path = findPath(null, null);
    enemy.targetIndex = nearestPathIndex(enemy, enemy.path);
  }
}

function nearestPathIndex(enemy, path) {
  let best = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < path.length; i += 1) {
    const distance = dist(enemy, path[i]);
    if (distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  }
  return Math.min(best + 1, path.length - 1);
}

function canPlace(tile) {
  if (isGate(tile)) return false;
  if (state.towers.some((tower) => sameTile(tower, tile))) return false;
  return findPath(tile).length > 0;
}

function enemyProgress(enemy) {
  return enemy.targetIndex * 1000 - dist(enemy, enemy.path[enemy.targetIndex] || tileCenter(keepTile));
}

function difficultyStats() {
  const level = state.difficulty;
  const rewardByDifficulty = {
    1: 1,
    2: 1.12,
    3: 1.45,
    4: 1.95,
    5: 2.55,
  };
  return {
    hp: 1 + (level - 1) * 0.22,
    speed: 1 + (level - 1) * 0.07,
    reward: rewardByDifficulty[level] || 1,
  };
}

function scaledGold(amount) {
  return Math.round(amount * difficultyStats().reward);
}

function flyingPath() {
  const start = tileCenter(spawnTile);
  const keep = tileCenter(keepTile);
  return [{ x: start.x - 34, y: start.y }, keep];
}

function repeatType(type, count) {
  return Array.from({ length: Math.max(0, count) }, () => type);
}

function shuffled(items, seed) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = (seed * 17 + i * 31) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function wavePlan(wave) {
  if (wave % 25 === 0) {
    const extra = Math.floor(wave / 25) * 2;
    return {
      name: "Flying Boss",
      details: "An Elder Dragon ignores the maze. Sky Hunters matter.",
      tags: ["flying boss", "anti-air", "high damage"],
      queue: ["flyingBoss", ...repeatType("dragon", extra)],
      spawnGap: Math.max(0.7, 1.15 - wave * 0.014),
    };
  }

  if (wave % 10 === 0) {
    const guards = Math.floor(wave / 10) * 2;
    return {
      name: "Ground Boss",
      details: "A Siege Lord follows the maze with knight support.",
      tags: ["ground boss", "armor", "single-target"],
      queue: ["groundBoss", ...repeatType("knight", guards)],
      spawnGap: Math.max(0.62, 1.05 - wave * 0.014),
    };
  }

  if (wave >= 9 && wave % 7 === 0) {
    const dragons = 2 + Math.floor(wave / 14);
    return {
      name: "Dragon Skies",
      details: "Flying dragons cut across the field.",
      tags: ["flying", "anti-air"],
      queue: shuffled([...repeatType("dragon", dragons), ...repeatType("skeleton", 5 + wave)], wave),
      spawnGap: Math.max(0.34, 0.82 - wave * 0.018),
    };
  }

  if (wave > 5 && wave % 5 === 0) {
    return {
      name: "Knight Push",
      details: "Fallen knights test focused damage and long lanes.",
      tags: ["armor", "tanky"],
      queue: shuffled([...repeatType("knight", 4 + Math.floor(wave / 3)), ...repeatType("skeleton", 6 + wave)], wave),
      spawnGap: Math.max(0.38, 0.9 - wave * 0.018),
    };
  }

  if (wave > 3 && wave % 4 === 0) {
    return {
      name: "Centaur Rush",
      details: "Fast centaurs punish short or leaky mazes.",
      tags: ["fast", "rush"],
      queue: shuffled([...repeatType("centaur", 5 + Math.floor(wave / 2)), ...repeatType("skeleton", 5 + wave)], wave),
      spawnGap: Math.max(0.26, 0.7 - wave * 0.014),
    };
  }

  return {
    name: wave < 3 ? "Skeleton Probe" : "Skeleton Swarm",
    details: wave < 3 ? "Skeletons test your first maze." : "A broad skeleton wave rewards clean path length.",
    tags: ["baseline", "maze value"],
    queue: repeatType("skeleton", 9 + wave * 3),
    spawnGap: Math.max(0.28, 0.86 - wave * 0.026),
  };
}

function updateWavePreview() {
  const plan = wavePlan(state.wave);
  ui.previewName.textContent = `${state.wave}: ${plan.name}`;
  ui.previewDetails.textContent = plan.details;
  ui.previewTags.innerHTML = "";
  for (const tag of [...plan.tags, `${plan.queue.length} enemies`]) {
    const item = document.createElement("span");
    item.textContent = tag;
    ui.previewTags.appendChild(item);
  }
}

function makeEnemy(type = "skeleton") {
  const wave = state.wave;
  const flyingBoss = type === "flyingBoss";
  const groundBoss = type === "groundBoss";
  const boss = flyingBoss || groundBoss;
  const dragon = flyingBoss || type === "dragon";
  const runner = type === "centaur";
  const bruiser = type === "knight";
  const difficulty = difficultyStats();
  const waveScale = 1 + Math.max(0, wave - 1) * 0.055;
  const baseHp = flyingBoss
    ? 1300 + wave * 120
    : groundBoss
      ? 920 + wave * 92
    : dragon
      ? 420 + wave * 44
      : bruiser
        ? 185 + wave * 26
        : 86 + wave * 18;
  const hp = Math.round(baseHp * waveScale * difficulty.hp);
  const start = tileCenter(spawnTile);
  return {
    x: start.x - 34,
    y: start.y,
    path: flyingBoss || dragon ? flyingPath() : currentPath.length ? currentPath : findPath(),
    targetIndex: 0,
    hp,
    maxHp: hp,
    speed: (flyingBoss ? 33 + wave * 0.8 : groundBoss ? 36 + wave * 0.9 : dragon ? 42 + wave * 1.1 : runner ? 96 + wave * 2.2 : bruiser ? 43 + wave * 1.2 : 63 + wave * 1.7) * difficulty.speed,
    reward: scaledGold(flyingBoss ? 170 + wave * 4 : groundBoss ? 115 + wave * 3 : dragon ? 48 : bruiser ? 16 : runner ? 10 : 8),
    radius: flyingBoss ? 25 : groundBoss ? 23 : dragon ? 18 : bruiser ? 14 : runner ? 9 : 11,
    color: flyingBoss ? "#8f2520" : groundBoss ? "#7b6552" : dragon ? "#d13f2f" : bruiser ? "#b9b2a2" : runner ? "#73c66b" : "#d9d1bd",
    name: flyingBoss ? "Elder Dragon" : groundBoss ? "Siege Lord" : dragon ? "Dragon" : bruiser ? "Fallen Knight" : runner ? "Centaur" : "Skeleton",
    glyph: flyingBoss ? "B" : groundBoss ? "L" : dragon ? "D" : bruiser ? "K" : runner ? "C" : "S",
    flying: flyingBoss || dragon,
    boss,
    livesDamage: flyingBoss ? 6 : groundBoss ? 4 : dragon ? 2 : 1,
    slowTime: 0,
    slowSources: {},
    burnTime: 0,
    burnDps: 0,
    stunTime: 0,
  };
}

function startWave() {
  if (waveActive || ended) return;
  if (!currentPath.length) {
    ui.banner.textContent = "Open a path from gate to keep.";
    return;
  }
  if (!difficultyLocked) {
    difficultyLocked = true;
    state.difficulty = Number(ui.difficulty.value);
    ui.difficulty.disabled = true;
    ui.difficultyLock.textContent = `Locked for this run at ${state.difficulty}.`;
  }
  if (!raceLocked) {
    raceLocked = true;
    ui.raceButtons.forEach((button) => {
      button.disabled = true;
    });
    ui.raceCopy.textContent = `${races[selectedRace].name} locked for this run.`;
  }
  waveActive = true;
  const plan = wavePlan(state.wave);
  state.spawned = 0;
  state.waveQueue = [...plan.queue];
  state.toSpawn = state.waveQueue.length;
  spawnTimer = 0;
  ui.banner.textContent = `${plan.name} enters the maze`;
  ui.start.disabled = true;
}

function resetGame() {
  state.lives = 20;
  state.credits = 230;
  state.wave = 1;
  state.score = 0;
  state.spawned = 0;
  state.toSpawn = 0;
  state.waveQueue = [];
  state.towers = [];
  state.enemies = [];
  state.projectiles = [];
  state.effects = [];
  state.difficulty = Number(ui.difficulty.value);
  selectedTower = null;
  waveActive = false;
  paused = false;
  ended = false;
  difficultyLocked = false;
  raceLocked = false;
  nextTowerId = 1;
  ui.difficulty.disabled = false;
  ui.difficultyLock.textContent = "Locks when the first wave starts.";
  ui.raceButtons.forEach((button) => {
    button.disabled = false;
  });
  ui.raceCopy.textContent = races[selectedRace].description;
  refreshPath();
  ui.start.disabled = false;
  ui.pause.textContent = "Pause";
  ui.banner.textContent = "Place defenders as walls, but leave a path to the keep.";
  updateHud();
  updateWavePreview();
}

function createTower(type, tile) {
  const base = towerTypes[type];
  const center = tileCenter(tile);
  return {
    id: nextTowerId++,
    type,
    col: tile.col,
    row: tile.row,
    x: center.x,
    y: center.y,
    level: 1,
    evolution: null,
    finalForm: false,
    spent: base.cost,
    cooldown: 0,
  };
}

function applyStatModifier(stats, modifier) {
  if (!modifier) return stats;
  if (modifier.damageAdd !== undefined) stats.damage = Math.max(0, stats.damage + modifier.damageAdd);
  if (modifier.damageMult !== undefined) stats.damage = Math.max(1, Math.round(stats.damage * modifier.damageMult));
  if (modifier.burnDpsMult !== undefined) stats.burnDps = Math.max(1, Math.round((stats.burnDps || 0) * modifier.burnDpsMult));
  if (modifier.burnDurationAdd !== undefined) stats.burnDuration = (stats.burnDuration || 0) + modifier.burnDurationAdd;
  if (modifier.fireRateMult !== undefined) stats.fireRate = Math.max(0.14, stats.fireRate * modifier.fireRateMult);
  if (modifier.rangeAdd !== undefined) stats.range = Math.max(32, stats.range + modifier.rangeAdd);
  if (modifier.splashRadiusAdd !== undefined) stats.splashRadius = Math.max(0, (stats.splashRadius || 0) + modifier.splashRadiusAdd);
  if (modifier.chainRangeAdd !== undefined) stats.chainRange = (stats.chainRange || 0) + modifier.chainRangeAdd;
  if (modifier.chainCountAdd !== undefined) stats.chainCount = Math.max(0, (stats.chainCount || 0) + modifier.chainCountAdd);
  if (modifier.lineWidthAdd !== undefined) stats.lineWidth = Math.max(8, (stats.lineWidth || 0) + modifier.lineWidthAdd);
  if (modifier.multiShot !== undefined) stats.multiShot = modifier.multiShot;
  if (modifier.stunDuration !== undefined) {
    stats.stun = true;
    stats.stunDuration = modifier.stunDuration;
  }
  if (modifier.stunDurationAdd !== undefined) {
    stats.stun = true;
    stats.stunDuration = (stats.stunDuration || 0) + modifier.stunDurationAdd;
  }
  if (modifier.slowDurationAdd !== undefined) stats.slowDuration = (stats.slowDuration || 0) + modifier.slowDurationAdd;
  return stats;
}

function towerStats(tower) {
  const base = towerTypes[tower.type];
  const evolution = tower.evolution ? evolutions[tower.type]?.[tower.evolution] : null;
  const finalForm = tower.finalForm ? evolution?.final : null;
  const levelBoost = 1 + (tower.level - 1) * 0.34;
  const stats = {
    ...base,
    damage: Math.round(base.damage * levelBoost),
    range: base.range + (tower.level - 1) * (base.rangeGrowth ?? 13),
    fireRate: Math.max(0.22, base.fireRate - (tower.level - 1) * 0.06),
    splashRadius: base.splashRadius ? base.splashRadius + (tower.level - 1) * 5 : 0,
    chainCount: base.chainCount ? base.chainCount + Math.floor((tower.level - 1) / 2) : 0,
    lineWidth: base.lineWidth ? base.lineWidth + Math.floor((tower.level - 1) * 1.5) : 0,
    burnDps: base.burnDps ? Math.round(base.burnDps * levelBoost) : 0,
  };
  if (!evolution) return stats;

  stats.name = `${base.name}: ${evolution.name}`;
  stats.glyph = evolution.glyph || stats.glyph;
  applyStatModifier(stats, evolution);
  if (finalForm) {
    stats.name = `${base.name}: ${finalForm.name}`;
    stats.glyph = finalForm.glyph || stats.glyph;
    applyStatModifier(stats, finalForm);
  }
  return stats;
}

function upgradeCost(tower) {
  const baseCost = tower.level < 4 ? 38 + tower.level * 30 : 110 + tower.level * 62;
  if (tower.level === 2) return Math.round(baseCost * 1.15);
  if (tower.level === 3) return Math.round(baseCost * 1.2);
  return baseCost;
}

function evolutionCost(tower) {
  return Math.round((150 + towerTypes[tower.type].cost) * 1.3);
}

function finalFormCost(tower) {
  return 420 + towerTypes[tower.type].cost * 2;
}

function sellValue(tower) {
  return Math.floor(tower.spent * 0.68);
}

function updateSelection() {
  if (!selectedTower) {
    ui.selectionTitle.textContent = "No defender selected";
    ui.selectionCopy.textContent = "Every defender blocks one tile. Leave a path open.";
    ui.upgrade.disabled = true;
    ui.sell.disabled = true;
    ui.evolutionPanel.hidden = true;
    return;
  }

  const stats = towerStats(selectedTower);
  const cost = upgradeCost(selectedTower);
  const nextUpgradeText =
    selectedTower.level >= 8
      ? selectedTower.evolution && !selectedTower.finalForm
        ? "Final form available"
        : "Max level"
      : selectedTower.level >= 4 && !selectedTower.evolution
        ? "Choose an evolution"
        : `Upgrade ${cost}g`;
  const extras = [];
  const options = evolutions[selectedTower.type];
  if (stats.melee) extras.push("melee");
  if (stats.antiAirOnly) extras.push("flying only");
  if (stats.auraSlow || stats.auraDamage) extras.push("aura");
  if (stats.lineStrike) extras.push("line");
  if (stats.shockwave) extras.push("shockwave");
  if (stats.stun) extras.push("stuns");
  if (stats.burnDps) extras.push("burns");
  if (stats.multiShot) extras.push(`${stats.multiShot} shots`);
  if (stats.chain) extras.push(`${stats.chainCount} chains`);
  if (stats.splashRadius) extras.push(`${Math.round(stats.splashRadius)} splash`);
  if (stats.slow) extras.push("slows");
  if (selectedTower.finalForm) extras.push("final");
  ui.selectionTitle.textContent = `${stats.name} L${selectedTower.level}`;
  ui.selectionCopy.textContent = `Damage ${stats.damage}, range ${Math.round(stats.range)}${extras.length ? `, ${extras.join(", ")}` : ""}. ${nextUpgradeText}, sell ${sellValue(selectedTower)}g.`;
  ui.upgrade.disabled = selectedTower.level >= 8 || (selectedTower.level >= 4 && !selectedTower.evolution) || state.credits < cost;
  ui.sell.disabled = false;

  const canEvolve = selectedTower.level >= 4 && !selectedTower.evolution && options;
  const canFinal = selectedTower.level >= 8 && selectedTower.evolution && !selectedTower.finalForm && options?.[selectedTower.evolution]?.final;
  ui.evolutionPanel.hidden = !(canEvolve || canFinal);
  ui.evolutionButtons.forEach((button) => {
    if (canFinal) {
      const final = options[selectedTower.evolution].final;
      const cost = finalFormCost(selectedTower);
      button.hidden = button.dataset.evolution !== "a";
      button.disabled = state.credits < cost;
      button.textContent = `${final.name}: ${final.desc} (${cost}g)`;
      return;
    }
    const option = options?.[button.dataset.evolution];
    const cost = evolutionCost(selectedTower);
    button.hidden = false;
    button.disabled = !canEvolve || !option || state.credits < cost;
    button.textContent = option ? `${option.name}: ${option.desc} (${cost}g)` : "";
  });
}

function updateHud() {
  ui.lives.textContent = state.lives;
  ui.credits.textContent = state.credits;
  ui.wave.textContent = state.wave;
  ui.score.textContent = state.score;
  updateSelection();
}

function placeOrSelect(tile) {
  const existing = state.towers.find((tower) => sameTile(tower, tile));
  if (existing) {
    selectedTower = existing;
    updateHud();
    return;
  }

  const towerDef = towerTypes[selectedBuild];
  if (!canPlace(tile)) {
    ui.banner.textContent = isGate(tile) ? "The gate and keep must stay open." : "That would seal the maze.";
    return;
  }

  if (state.credits < towerDef.cost) {
    ui.banner.textContent = "Not enough gold.";
    return;
  }

  state.credits -= towerDef.cost;
  const tower = createTower(selectedBuild, tile);
  state.towers.push(tower);
  selectedTower = tower;
  refreshPath();
  ui.banner.textContent = `${towerDef.name} holds the line.`;
  updateHud();
}

function fireTower(tower) {
  const stats = towerStats(tower);
  const targets = state.enemies
    .filter(
      (enemy) =>
        dist(tower, enemy) <= stats.range &&
        (!stats.antiAirOnly || enemy.flying) &&
        (!stats.groundOnly || !enemy.flying),
    )
    .sort((a, b) => enemyProgress(b) - enemyProgress(a));

  const target = targets[0];
  if (!target) return;

  tower.cooldown = stats.fireRate;
  if (stats.auraSlow) {
    for (const enemy of targets) {
      applyDamage(enemy, stats.damage);
      if (state.enemies.includes(enemy)) applySlow(enemy, stats.slowDuration || 1.4, tower.id);
    }
    state.effects.push({ x: tower.x, y: tower.y, r: stats.range, life: 0.22, color: stats.color });
    return;
  }

  if (stats.auraDamage) {
    for (const enemy of targets) {
      applyDamage(enemy, stats.damage);
    }
    state.effects.push({ x: tower.x, y: tower.y, r: stats.range, life: 0.18, color: stats.color });
    return;
  }

  if (stats.shockwave) {
    const radius = stats.splashRadius || stats.range;
    const shockTargets = state.enemies
      .filter(
        (enemy) =>
          dist(tower, enemy) <= radius &&
          (!stats.antiAirOnly || enemy.flying) &&
          (!stats.groundOnly || !enemy.flying),
      )
      .sort((a, b) => enemyProgress(b) - enemyProgress(a));
    for (const enemy of shockTargets) {
      const distanceMod = 1 - clamp(dist(enemy, tower) / radius, 0, 0.55);
      applyDamage(enemy, Math.max(1, Math.round(stats.damage * distanceMod)));
    }
    state.effects.push({ x: tower.x, y: tower.y, r: radius, life: 0.2, color: stats.color });
    return;
  }

  if (stats.lineStrike) {
    const width = stats.lineWidth || 20;
    const plan = lineStrikePlan(tower, stats, targets);
    if (!plan) return;
    const lineTargets = plan.hits.sort((a, b) => enemyProgress(b) - enemyProgress(a));
    for (const enemy of lineTargets) {
      applyDamage(enemy, stats.damage);
    }
    state.effects.push({
      type: "line",
      x: tower.x,
      y: tower.y,
      x2: plan.end.x,
      y2: plan.end.y,
      r: width,
      life: 0.18,
      color: stats.color,
    });
    return;
  }

  if (stats.melee) {
    const meleeTargets = targets.slice(0, stats.multiShot || 1);
    for (const enemy of meleeTargets) {
      applyDamage(enemy, stats.damage);
      if (stats.stun && state.enemies.includes(enemy)) applyStun(enemy, stats.stunDuration || 0.25);
      state.effects.push({ x: enemy.x, y: enemy.y, r: 18, life: 0.16, color: stats.color });
    }
    return;
  }

  const shots = targets.slice(0, stats.multiShot || 1);
  for (const shotTarget of shots) {
    state.projectiles.push({
      x: tower.x,
      y: tower.y,
      prevX: tower.x,
      prevY: tower.y,
      target: shotTarget,
      speed: stats.projectileSpeed,
      damage: stats.damage,
      color: stats.color,
      chain: stats.chain,
      chainRange: stats.chainRange,
      chainCount: stats.chainCount,
      splashRadius: stats.splashRadius,
      flyingOnlySplash: stats.antiAirOnly,
      slow: stats.slow,
      slowDuration: stats.slowDuration,
      stun: stats.stun,
      stunDuration: stats.stunDuration,
      burnDps: stats.burnDps,
      burnDuration: stats.burnDuration,
    });
  }
}

function applyDamage(enemy, amount) {
  if (amount <= 0) return;
  enemy.hp -= amount;
  state.effects.push({ x: enemy.x, y: enemy.y, r: 4, life: 0.25, color: "#ffffff" });
  if (enemy.hp <= 0) {
    state.credits += enemy.reward;
    state.score += enemy.reward * 12;
    state.enemies = state.enemies.filter((item) => item !== enemy);
  }
}

function applySlow(enemy, duration, sourceId = null) {
  if (sourceId !== null) {
    enemy.slowSources = enemy.slowSources || {};
    enemy.slowSources[sourceId] = Math.max(enemy.slowSources[sourceId] || 0, duration);
    return;
  }
  enemy.slowTime = Math.max(enemy.slowTime, duration);
}

function updateSlowSources(enemy, dt) {
  if (!enemy.slowSources) return 0;
  let stacks = 0;
  for (const sourceId of Object.keys(enemy.slowSources)) {
    enemy.slowSources[sourceId] -= dt;
    if (enemy.slowSources[sourceId] <= 0) {
      delete enemy.slowSources[sourceId];
    } else {
      stacks += 1;
    }
  }
  return stacks;
}

function applyStun(enemy, duration) {
  const bossMod = enemy.boss ? 0.35 : 1;
  enemy.stunTime = Math.max(enemy.stunTime || 0, duration * bossMod);
}

function applyBurn(enemy, dps, duration) {
  enemy.burnDps = Math.max(enemy.burnDps || 0, dps);
  enemy.burnTime = Math.max(enemy.burnTime || 0, duration);
}

function resolveProjectileHit(projectile, target) {
  const impact = { x: target.x, y: target.y };
  const hitEnemies = projectile.splashRadius
    ? state.enemies.filter(
        (enemy) => dist(enemy, impact) <= projectile.splashRadius && (!projectile.flyingOnlySplash || enemy.flying),
      )
    : [target];

  for (const enemy of hitEnemies) {
    const distanceMod = projectile.splashRadius
      ? 1 - clamp(dist(enemy, impact) / projectile.splashRadius, 0, 0.62)
      : 1;
    applyDamage(enemy, Math.max(1, Math.round(projectile.damage * distanceMod)));
    if (projectile.slow && state.enemies.includes(enemy)) {
      applySlow(enemy, projectile.slowDuration || 1.4);
    }
    if (projectile.stun && state.enemies.includes(enemy)) {
      applyStun(enemy, projectile.stunDuration || 0.2);
    }
    if (projectile.burnDps && state.enemies.includes(enemy)) {
      applyBurn(enemy, projectile.burnDps, projectile.burnDuration || 2);
    }
  }

  if (projectile.chain) {
    const chained = state.enemies
      .filter((enemy) => enemy !== target && dist(enemy, target) < projectile.chainRange)
      .sort((a, b) => dist(a, target) - dist(b, target))
      .slice(0, projectile.chainCount);
    for (const enemy of chained) {
      applyDamage(enemy, Math.round(projectile.damage * 0.55));
      state.effects.push({ x: enemy.x, y: enemy.y, r: 18, life: 0.18, color: projectile.color });
    }
  }

  const burstRadius = projectile.splashRadius || 22;
  state.effects.push({ x: impact.x, y: impact.y, r: burstRadius * 0.35, life: 0.22, color: projectile.color });
}

function updateEnemies(dt) {
  for (const enemy of [...state.enemies]) {
    if (!enemy.path.length) {
      enemy.path = currentPath;
      enemy.targetIndex = nearestPathIndex(enemy, enemy.path);
    }

    if (enemy.burnTime > 0) {
      applyDamage(enemy, enemy.burnDps * dt);
      if (!state.enemies.includes(enemy)) continue;
      enemy.burnTime = Math.max(0, enemy.burnTime - dt);
      if (enemy.burnTime <= 0) enemy.burnDps = 0;
    }

    const stunned = enemy.stunTime > 0;
    const auraSlowStacks = updateSlowSources(enemy, dt);
    const cappedAuraStacks = Math.min(auraSlowStacks, 2);
    const auraSlowMod = cappedAuraStacks ? 1 - cappedAuraStacks * 0.32 : 1;
    const projectileSlowMod = enemy.slowTime > 0 ? 0.48 : 1;
    const slowMod = Math.min(auraSlowMod, projectileSlowMod);
    enemy.slowTime = Math.max(0, enemy.slowTime - dt);
    enemy.stunTime = Math.max(0, (enemy.stunTime || 0) - dt);
    if (stunned) continue;
    let move = enemy.speed * slowMod * dt;

    while (move > 0 && enemy.targetIndex < enemy.path.length) {
      const target = enemy.path[enemy.targetIndex];
      const dx = target.x - enemy.x;
      const dy = target.y - enemy.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= move || distance < 1) {
        enemy.x = target.x;
        enemy.y = target.y;
        enemy.targetIndex += 1;
        move -= distance;
      } else {
        enemy.x += (dx / distance) * move;
        enemy.y += (dy / distance) * move;
        move = 0;
      }
    }

    if (enemy.targetIndex >= enemy.path.length) {
      state.enemies = state.enemies.filter((item) => item !== enemy);
      state.lives -= enemy.livesDamage || 1;
      state.score = Math.max(0, state.score - 25);
      if (state.lives <= 0) {
        ended = true;
        waveActive = false;
        ui.banner.textContent = "The keep has fallen. Restart to try again.";
      }
    }
  }
}

function updateProjectiles(dt) {
  for (const projectile of [...state.projectiles]) {
    if (!state.enemies.includes(projectile.target)) {
      state.projectiles = state.projectiles.filter((item) => item !== projectile);
      continue;
    }

    const dx = projectile.target.x - projectile.x;
    const dy = projectile.target.y - projectile.y;
    const distance = Math.hypot(dx, dy);
    const step = projectile.speed * dt;

    if (distance <= step) {
      resolveProjectileHit(projectile, projectile.target);
      state.projectiles = state.projectiles.filter((item) => item !== projectile);
    } else {
      projectile.prevX = projectile.x;
      projectile.prevY = projectile.y;
      projectile.x += (dx / distance) * step;
      projectile.y += (dy / distance) * step;
    }
  }
}

function update(dt) {
  if (paused || ended) return;

  if (waveActive) {
    spawnTimer -= dt;
    if (state.spawned < state.toSpawn && spawnTimer <= 0) {
      const nextType = state.waveQueue[state.spawned] || "skeleton";
      const plan = wavePlan(state.wave);
      state.enemies.push(makeEnemy(nextType));
      state.spawned += 1;
      spawnTimer = plan.spawnGap;
    }

    if (state.spawned >= state.toSpawn && state.enemies.length === 0) {
      waveActive = false;
      state.wave += 1;
      state.credits += scaledGold(32 + state.wave * 5);
      ui.banner.textContent = `Wave cleared. Build for wave ${state.wave}.`;
      ui.start.disabled = false;
      updateWavePreview();
    }
  }

  for (const tower of state.towers) {
    tower.cooldown -= dt;
    if (tower.cooldown <= 0) fireTower(tower);
  }

  updateEnemies(dt);
  updateProjectiles(dt);
  for (const effect of state.effects) {
    effect.life -= dt;
    if (effect.type !== "line") effect.r += 75 * dt;
  }
  state.effects = state.effects.filter((effect) => effect.life > 0);
  updateHud();
}

function drawTerrain() {
  const grass = ctx.createLinearGradient(0, 0, W, H);
  grass.addColorStop(0, "#1d3519");
  grass.addColorStop(0.52, "#172916");
  grass.addColorStop(1, "#233018");
  ctx.fillStyle = grass;
  ctx.fillRect(0, 0, W, H);

  for (const item of terrainDecor) {
    const nearGate =
      Math.abs(item.y - tileCenter(spawnTile).y) < 38 || Math.abs(item.y - tileCenter(keepTile).y) < 48;
    if (nearGate && (item.x < 80 || item.x > W - 120)) continue;
    ctx.fillStyle =
      item.kind === 0
        ? "rgba(255,246,223,0.08)"
        : item.kind === 1
          ? "rgba(91,58,35,0.22)"
          : item.kind === 2
            ? "rgba(115,198,107,0.16)"
            : "rgba(0,0,0,0.12)";
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(12,18,11,0.22)";
  ctx.fillRect(0, 0, W, 12);
  ctx.fillRect(0, H - 12, W, 12);
}

function drawGrid() {
  ctx.strokeStyle = "rgba(255,246,223,0.055)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += cell) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += cell) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

function drawPath() {
  if (!currentPath.length) return;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(62,43,27,0.55)";
  ctx.lineWidth = 28;
  ctx.beginPath();
  currentPath.forEach((point, i) => (i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
  ctx.stroke();
  ctx.strokeStyle = "rgba(157,113,63,0.72)";
  ctx.lineWidth = 18;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,246,223,0.26)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 10]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawShield(x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x + 9, y - 5);
  ctx.lineTo(x + 7, y + 8);
  ctx.lineTo(x, y + 13);
  ctx.lineTo(x - 7, y + 8);
  ctx.lineTo(x - 9, y - 5);
  ctx.closePath();
  ctx.fill();
}

const spritePatterns = {
  archer: [
    "   c   ",
    "  ccc  ",
    "  hhh  ",
    " bgbgb ",
    "  ggg b",
    "  y y  ",
    " b   b ",
  ],
  guard: [
    "  sss  ",
    " swwws ",
    " swbws ",
    "  www  ",
    "  bbb  ",
    "  y y  ",
    " s   s ",
  ],
  ballista: [
    " w   w ",
    "  w w  ",
    "ssscsss",
    "  bbb  ",
    " yyyyy ",
    " b   b ",
    "       ",
  ],
  sky: [
    "   c   ",
    "  cwc  ",
    " cwwwc ",
    "b  w  b",
    "  yyy  ",
    " b   b ",
    "       ",
  ],
  mage: [
    "   c   ",
    "  ccc  ",
    "  hhh  ",
    " mmmmm ",
    "  mmm  ",
    "  y y  ",
    " s   s ",
  ],
  catapult: [
    "   w   ",
    "  www  ",
    "   w   ",
    " bbbbb ",
    " yyyyy ",
    " b   b ",
    "       ",
  ],
  skeleton: [
    "  www  ",
    " w k w ",
    "  www  ",
    "   w   ",
    " w w w ",
    "  y y  ",
    " w   w ",
  ],
  centaur: [
    "       ",
    "    h  ",
    "   hhh ",
    "bbbbbb ",
    "b yy b ",
    " y  y  ",
    "y    y ",
  ],
  knight: [
    "  sss  ",
    " swwws ",
    " swbws ",
    "  www  ",
    " sssss ",
    "  y y  ",
    " s   s ",
  ],
  dragon: [
    "w  r  w",
    " wwrrww",
    "  rrr  ",
    " rrrrr ",
    "  rrr  ",
    " r y r ",
    "r     r",
  ],
};

function drawPixelSprite(pattern, x, y, scale, palette, flip = false) {
  const height = pattern.length;
  const width = pattern[0].length;
  const originX = x - (width * scale) / 2;
  const originY = y - (height * scale) / 2;
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const sourceCol = flip ? width - 1 - col : col;
      const key = pattern[row][sourceCol];
      const color = palette[key];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(originX + col * scale), Math.round(originY + row * scale), scale, scale);
    }
  }
}

function defenderSprite(tower, stats) {
  if (tower.type === "dart" || tower.type === "spear") return "archer";
  if (tower.type === "guard" || tower.type === "grunt" || tower.type === "berserker") return "guard";
  if (tower.type === "rail" || tower.type === "drummer") return "ballista";
  if (tower.type === "sky" || tower.type === "wyvern") return "sky";
  if (tower.type === "mortar" || tower.type === "crusher") return "catapult";
  return "mage";
}

function defenderPalette(stats, tower) {
  return {
    b: "#18100a",
    c: "#33270f",
    g: tower.type === "frost" ? "#5bd7e8" : stats.color,
    h: "#f0caa3",
    k: "#111111",
    m: stats.color,
    r: "#d13f2f",
    s: stats.color,
    w: "#fff6df",
    y: "#6b4c2f",
  };
}

function enemyPalette(enemy) {
  const slowed = enemy.slowTime > 0 || Object.keys(enemy.slowSources || {}).length > 0;
  const color = enemy.stunTime > 0 ? "#f4c95d" : slowed ? "#b8f5ff" : enemy.burnTime > 0 ? "#ff8b3d" : enemy.color;
  return {
    b: "#17120d",
    h: "#8f6f42",
    k: "#111111",
    r: color,
    s: color,
    w: enemy.name === "Skeleton" ? "#f1eadb" : "#fff6df",
    y: "#5a3724",
  };
}

function drawTower(tower) {
  const stats = towerStats(tower);
  const active = selectedTower === tower;
  ctx.save();
  const x = tower.col * cell;
  const y = tower.row * cell;
  ctx.fillStyle = stats.melee ? "#24334a" : "#21190f";
  ctx.strokeStyle = active ? "#f4c95d" : stats.color;
  ctx.lineWidth = active ? 4 : 3;
  ctx.fillRect(x + 3, y + 3, cell - 6, cell - 6);
  ctx.strokeRect(x + 3, y + 3, cell - 6, cell - 6);

  if (active) {
    ctx.fillStyle = "rgba(244,201,93,0.08)";
    ctx.strokeStyle = "rgba(244,201,93,0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, stats.range, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  const bob = Math.sin(animTime * 3.2 + tower.col * 0.7 + tower.row * 0.4) * 1.2;
  drawPixelSprite(spritePatterns[defenderSprite(tower, stats)], tower.x, tower.y - 2 + bob, 3, defenderPalette(stats, tower));

  ctx.fillStyle = "#fff6df";
  ctx.font = "800 10px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(stats.glyph, tower.x, tower.y - 1);
  if (tower.evolution) {
    ctx.strokeStyle = "#f4c95d";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, 15, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "#101216";
  ctx.font = "700 11px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(tower.level, tower.x + 11, tower.y + 11);
  ctx.restore();
}

function drawEnemyShape(enemy) {
  const bob = Math.sin(animTime * (enemy.flying ? 7.5 : 6) + enemy.x * 0.03) * (enemy.flying ? 3 : 1.5);
  if (enemy.flying) {
    drawPixelSprite(spritePatterns.dragon, enemy.x, enemy.y - 3 + bob, enemy.boss ? 4 : 3, enemyPalette(enemy));
    return;
  }

  if (enemy.name === "Centaur") {
    drawPixelSprite(spritePatterns.centaur, enemy.x, enemy.y - 1 + bob, 3, enemyPalette(enemy));
    return;
  }

  if (enemy.name === "Fallen Knight" || enemy.name === "Siege Lord") {
    drawPixelSprite(spritePatterns.knight, enemy.x, enemy.y - 2 + bob, enemy.boss ? 4 : 3, enemyPalette(enemy));
    return;
  }

  drawPixelSprite(spritePatterns.skeleton, enemy.x, enemy.y - 2 + bob, 3, enemyPalette(enemy));
}

function drawEnemies() {
  for (const enemy of state.enemies) {
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(enemy.x, enemy.y + enemy.radius + 7, enemy.radius * 0.95, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    drawEnemyShape(enemy);
    ctx.fillStyle = "#17120d";
    ctx.font = "700 10px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(enemy.glyph, enemy.x, enemy.y + 0.5);

    const width = 32;
    const healthPct = clamp(enemy.hp / enemy.maxHp, 0, 1);
    ctx.fillStyle = "#101216";
    ctx.fillRect(enemy.x - width / 2, enemy.y - enemy.radius - 11, width, 4);
    ctx.fillStyle = healthPct > 0.45 ? "#73c66b" : "#ff5b5b";
    ctx.fillRect(enemy.x - width / 2, enemy.y - enemy.radius - 11, width * healthPct, 4);
  }
}

function drawProjectiles() {
  for (const projectile of state.projectiles) {
    ctx.strokeStyle = projectile.color;
    ctx.globalAlpha = 0.58;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(projectile.prevX ?? projectile.x, projectile.prevY ?? projectile.y);
    ctx.lineTo(projectile.x, projectile.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = projectile.color;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEffects() {
  for (const effect of state.effects) {
    ctx.strokeStyle = effect.color;
    ctx.globalAlpha = clamp(effect.life * 4, 0, 0.7);
    if (effect.type === "line") {
      ctx.lineCap = "round";
      ctx.lineWidth = effect.r;
      ctx.beginPath();
      ctx.moveTo(effect.x, effect.y);
      ctx.lineTo(effect.x2, effect.y2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      continue;
    }
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = effect.color;
    ctx.globalAlpha = clamp(effect.life * 1.8, 0, 0.16);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawPlacementPreview() {
  if (!hoveredTile || selectedTower) return;
  const center = tileCenter(hoveredTile);
  const stats = towerTypes[selectedBuild];
  const ok = canPlace(hoveredTile) && state.credits >= stats.cost;

  ctx.fillStyle = ok ? "rgba(109,230,164,0.1)" : "rgba(255,91,91,0.12)";
  ctx.fillRect(hoveredTile.col * cell + 2, hoveredTile.row * cell + 2, cell - 4, cell - 4);
  ctx.strokeStyle = ok ? "rgba(109,230,164,0.55)" : "rgba(255,91,91,0.65)";
  ctx.strokeRect(hoveredTile.col * cell + 2, hoveredTile.row * cell + 2, cell - 4, cell - 4);
  ctx.fillStyle = ok ? "rgba(244,201,93,0.06)" : "rgba(255,91,91,0.04)";
  ctx.beginPath();
  ctx.arc(center.x, center.y, stats.range, 0, Math.PI * 2);
  ctx.fill();
}

function drawGates() {
  const spawn = tileCenter(spawnTile);
  const keep = tileCenter(keepTile);
  ctx.fillStyle = "#3f2d1d";
  ctx.fillRect(0, spawn.y - 35, 28, 70);
  ctx.fillStyle = "#17100a";
  ctx.fillRect(6, spawn.y - 25, 13, 50);
  ctx.fillStyle = "#f0c14b";
  ctx.font = "700 12px system-ui";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("GATE", 26, spawn.y);

  ctx.fillStyle = "#4b4335";
  ctx.strokeStyle = "#f0c14b";
  ctx.lineWidth = 4;
  ctx.fillRect(884, keep.y - 42, 58, 84);
  ctx.strokeRect(884, keep.y - 42, 58, 84);
  ctx.fillStyle = "#6c6250";
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      ctx.fillRect(890 + col * 17, keep.y - 34 + row * 17, 10, 9);
    }
  }
  ctx.fillStyle = "#201611";
  ctx.fillRect(903, keep.y, 20, 42);
  ctx.fillStyle = "#b9b2a2";
  ctx.fillRect(890, keep.y - 56, 12, 20);
  ctx.fillRect(914, keep.y - 56, 12, 20);
  ctx.fillRect(938, keep.y - 56, 12, 20);
}

function render() {
  ctx.clearRect(0, 0, W, H);
  drawTerrain();
  drawGrid();
  drawPath();
  drawGates();
  drawPlacementPreview();
  state.towers.forEach(drawTower);
  drawEnemies();
  drawProjectiles();
  drawEffects();
}

function loop(now) {
  const dt = Math.min(0.04, ((now - lastTime) / 1000) * gameSpeed);
  lastTime = now;
  animTime += dt;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

function shortTowerName(name) {
  return name
    .replace("Shield Guard", "Guard")
    .replace("Spear Thrower", "Spear")
    .replace("Frost Wizard", "Frost")
    .replace("Storm Mage", "Storm")
    .replace("Flame Mage", "Flame")
    .replace("Sky Hunter", "Sky");
}

function renderTowerDock() {
  const race = races[selectedRace];
  ui.towerDock.innerHTML = "";
  race.order.forEach((type, index) => {
    const tower = race.towers[type];
    const button = document.createElement("button");
    button.className = `tower-card${type === selectedBuild ? " active" : ""}`;
    button.dataset.tower = type;
    button.title = `${index + 1} - ${tower.name}: ${tower.role}, ${tower.cost}g`;

    const swatch = document.createElement("span");
    swatch.className = "tower-swatch";
    swatch.style.background = tower.color;

    const text = document.createElement("span");
    const name = document.createElement("b");
    name.textContent = shortTowerName(tower.name);
    const detail = document.createElement("small");
    detail.textContent = `${index + 1} - ${tower.cost}g`;
    text.append(name, detail);
    button.append(swatch, text);
    button.addEventListener("click", () => {
      selectBuild(type);
    });
    ui.towerDock.appendChild(button);
  });
  ui.towerCards = [...document.querySelectorAll(".tower-card")];
}

function selectRace(raceKey) {
  if (raceLocked || waveActive || state.wave > 1 || state.towers.length || state.enemies.length) return;
  selectedRace = raceKey;
  towerTypes = races[selectedRace].towers;
  evolutions = races[selectedRace].evolutions;
  selectedBuild = races[selectedRace].order[0];
  selectedTower = null;
  ui.raceButtons.forEach((button) => button.classList.toggle("active", button.dataset.race === raceKey));
  ui.raceCopy.textContent = races[selectedRace].description;
  renderTowerDock();
  updateHud();
}

function selectBuild(type) {
  selectedBuild = type;
  selectedTower = null;
  ui.towerCards.forEach((item) => item.classList.toggle("active", item.dataset.tower === type));
  updateHud();
}

function togglePause() {
  paused = !paused;
  ui.pause.textContent = paused ? "Resume Space" : "Pause Space";
  ui.banner.textContent = paused ? "Paused" : waveActive ? `Wave ${state.wave} in progress` : "Ready.";
}

function setGameSpeed(speed) {
  gameSpeed = speed;
  ui.speedButtons.forEach((item) => item.classList.toggle("active", Number(item.dataset.speed) === speed));
  ui.banner.textContent = `${speed}x speed`;
}

function tryUpgradeSelected() {
  if (!selectedTower) return;
  const cost = upgradeCost(selectedTower);
  if (selectedTower.level >= 8 || (selectedTower.level >= 4 && !selectedTower.evolution) || state.credits < cost) return;
  state.credits -= cost;
  selectedTower.spent += cost;
  selectedTower.level += 1;
  ui.banner.textContent = `${towerTypes[selectedTower.type].name} upgraded.`;
  updateHud();
}

function tryEvolveSelected(evolutionKey) {
  if (!selectedTower || selectedTower.level < 4 || selectedTower.evolution) return;
  const option = evolutions[selectedTower.type]?.[evolutionKey];
  if (!option) return;
  const cost = evolutionCost(selectedTower);
  if (state.credits < cost) return;
  state.credits -= cost;
  selectedTower.spent += cost;
  selectedTower.evolution = evolutionKey;
  ui.banner.textContent = `${towerTypes[selectedTower.type].name} became ${option.name} for ${cost}g.`;
  updateHud();
}

function tryFinalFormSelected() {
  if (!selectedTower || selectedTower.level < 8 || !selectedTower.evolution || selectedTower.finalForm) return;
  const final = evolutions[selectedTower.type]?.[selectedTower.evolution]?.final;
  if (!final) return;
  const cost = finalFormCost(selectedTower);
  if (state.credits < cost) return;
  state.credits -= cost;
  selectedTower.spent += cost;
  selectedTower.finalForm = true;
  ui.banner.textContent = `${towerTypes[selectedTower.type].name} reached ${final.name} for ${cost}g.`;
  updateHud();
}

function sellSelected() {
  if (!selectedTower) return;
  state.credits += sellValue(selectedTower);
  state.towers = state.towers.filter((tower) => tower !== selectedTower);
  selectedTower = null;
  refreshPath();
  ui.banner.textContent = "Defender sold.";
  updateHud();
}

ui.start.addEventListener("click", startWave);
ui.restart.addEventListener("click", resetGame);
ui.difficulty.addEventListener("input", () => {
  if (difficultyLocked) {
    ui.difficulty.value = state.difficulty;
    return;
  }
  state.difficulty = Number(ui.difficulty.value);
  ui.difficultyValue.textContent = state.difficulty;
});
ui.pause.addEventListener("click", () => {
  togglePause();
});

ui.speedButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setGameSpeed(Number(button.dataset.speed));
  });
});

ui.raceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectRace(button.dataset.race);
  });
});

ui.upgrade.addEventListener("click", () => {
  tryUpgradeSelected();
});

ui.evolutionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (selectedTower?.level >= 8 && selectedTower.evolution && !selectedTower.finalForm) {
      tryFinalFormSelected();
      return;
    }
    tryEvolveSelected(button.dataset.evolution);
  });
});

ui.sell.addEventListener("click", () => {
  sellSelected();
});

document.addEventListener("keydown", (event) => {
  const activeTag = document.activeElement?.tagName;
  if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") return;

  const towerIndex = Number(event.key) - 1;
  if (towerIndex >= 0 && towerIndex < ui.towerCards.length) {
    event.preventDefault();
    selectBuild(ui.towerCards[towerIndex].dataset.tower);
    return;
  }

  const key = event.key.toLowerCase();
  if (key === "w") {
    event.preventDefault();
    startWave();
  } else if (event.code === "Space") {
    event.preventDefault();
    togglePause();
  } else if (key === "u") {
    event.preventDefault();
    tryUpgradeSelected();
  } else if (key === "s") {
    event.preventDefault();
    sellSelected();
  } else if (key === "a") {
    event.preventDefault();
    if (selectedTower?.level >= 8 && selectedTower.evolution && !selectedTower.finalForm) {
      tryFinalFormSelected();
    } else {
      tryEvolveSelected("a");
    }
  } else if (key === "b") {
    event.preventDefault();
    tryEvolveSelected("b");
  } else if (key === "f") {
    event.preventDefault();
    tryFinalFormSelected();
  } else if (event.key === "[") {
    event.preventDefault();
    setGameSpeed(Math.max(1, gameSpeed - 1));
  } else if (event.key === "]") {
    event.preventDefault();
    setGameSpeed(Math.min(3, gameSpeed + 1));
  }
});

canvas.addEventListener("mousemove", (event) => {
  hoveredTile = tileFromEvent(event);
});

canvas.addEventListener("mouseleave", () => {
  hoveredTile = null;
});

canvas.addEventListener("click", (event) => {
  placeOrSelect(tileFromEvent(event));
});

renderTowerDock();
resetGame();
requestAnimationFrame(loop);
