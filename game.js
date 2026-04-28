const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  lives: document.getElementById("lives"),
  credits: document.getElementById("credits"),
  wave: document.getElementById("wave"),
  score: document.getElementById("score"),
  banner: document.getElementById("banner"),
  start: document.getElementById("start-wave"),
  pause: document.getElementById("pause"),
  restart: document.getElementById("restart"),
  upgrade: document.getElementById("upgrade"),
  sell: document.getElementById("sell"),
  evolutionPanel: document.getElementById("evolution-panel"),
  evolutionButtons: [...document.querySelectorAll(".evolution-button")],
  difficulty: document.getElementById("difficulty"),
  difficultyValue: document.getElementById("difficulty-value"),
  selectionTitle: document.getElementById("selection-title"),
  selectionCopy: document.getElementById("selection-copy"),
  towerCards: [...document.querySelectorAll(".tower-card")],
  speedButtons: [...document.querySelectorAll(".speed-button")],
};

const W = canvas.width;
const H = canvas.height;
const cell = 32;
const cols = W / cell;
const rows = H / cell;
const spawnTile = { col: 0, row: 9 };
const keepTile = { col: cols - 1, row: 9 };

const towerTypes = {
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
    role: "Melee wall",
    glyph: "G",
    cost: 30,
    color: "#7da1d3",
    range: 48,
    fireRate: 0.55,
    damage: 11,
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
    role: "AOE slow",
    glyph: "W",
    cost: 70,
    color: "#5bd7e8",
    range: 112,
    fireRate: 0.82,
    damage: 4,
    projectileSpeed: 360,
    splashRadius: 58,
    slow: true,
    slowDuration: 1.8,
  },
};

const evolutions = {
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
      name: "Bulwark",
      desc: "Wider reach and more damage",
      rangeAdd: 20,
      damageMult: 1.45,
      glyph: "T",
      final: { name: "Iron Bastion", desc: "Huge melee zone", rangeAdd: 34, damageMult: 1.35, glyph: "I" },
    },
    b: {
      name: "Blademaster",
      desc: "Fast melee strikes",
      fireRateMult: 0.48,
      damageMult: 1.15,
      glyph: "D",
      final: { name: "Duelist Captain", desc: "Very fast cleaving strikes", fireRateMult: 0.62, multiShot: 3, glyph: "K" },
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
      name: "Deep Freeze",
      desc: "Stronger, longer slow",
      slowDurationAdd: 1.25,
      splashRadiusAdd: 18,
      glyph: "D",
      final: { name: "Winter Prison", desc: "Enormous slow field", slowDurationAdd: 1.6, splashRadiusAdd: 38, glyph: "P" },
    },
    b: {
      name: "Ice Shards",
      desc: "Slow plus real damage",
      damageMult: 2.7,
      fireRateMult: 0.82,
      glyph: "I",
      final: { name: "Glacier Lance", desc: "Heavy freezing damage", damageMult: 1.8, fireRateMult: 0.76, glyph: "G" },
    },
  },
};

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

const state = {
  lives: 20,
  credits: 190,
  wave: 1,
  score: 0,
  spawned: 0,
  toSpawn: 0,
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
  return {
    hp: 1 + (level - 1) * 0.22,
    speed: 1 + (level - 1) * 0.07,
  };
}

function flyingPath() {
  const start = tileCenter(spawnTile);
  const keep = tileCenter(keepTile);
  return [{ x: start.x - 34, y: start.y }, keep];
}

function makeEnemy(spawnIndex = 0) {
  const wave = state.wave;
  const typeRoll = Math.random();
  const flyingBoss = wave % 25 === 0 && spawnIndex === 0;
  const groundBoss = !flyingBoss && wave % 10 === 0 && spawnIndex === 0;
  const boss = flyingBoss || groundBoss;
  const dragon = flyingBoss || (!groundBoss && wave >= 9 && typeRoll < 0.12);
  const runner = !dragon && wave > 3 && typeRoll > 0.72;
  const bruiser = !dragon && wave > 5 && typeRoll < 0.2;
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
    reward: flyingBoss ? 170 + wave * 4 : groundBoss ? 115 + wave * 3 : dragon ? 48 : bruiser ? 16 : runner ? 10 : 8,
    radius: flyingBoss ? 25 : groundBoss ? 23 : dragon ? 18 : bruiser ? 14 : runner ? 9 : 11,
    color: flyingBoss ? "#8f2520" : groundBoss ? "#7b6552" : dragon ? "#d13f2f" : bruiser ? "#b9b2a2" : runner ? "#73c66b" : "#d9d1bd",
    name: flyingBoss ? "Elder Dragon" : groundBoss ? "Siege Lord" : dragon ? "Dragon" : bruiser ? "Fallen Knight" : runner ? "Centaur" : "Skeleton",
    glyph: flyingBoss ? "B" : groundBoss ? "L" : dragon ? "D" : bruiser ? "K" : runner ? "C" : "S",
    flying: flyingBoss || dragon,
    boss,
    livesDamage: flyingBoss ? 6 : groundBoss ? 4 : dragon ? 2 : 1,
    slowTime: 0,
  };
}

function startWave() {
  if (waveActive || ended) return;
  if (!currentPath.length) {
    ui.banner.textContent = "Open a path from gate to keep.";
    return;
  }
  waveActive = true;
  state.spawned = 0;
  state.toSpawn =
    state.wave % 25 === 0
      ? 1 + Math.floor(state.wave / 25) * 3
      : state.wave % 10 === 0
        ? 1 + Math.floor(state.wave / 10) * 3
        : 9 + state.wave * 3;
  spawnTimer = 0;
  ui.banner.textContent =
    state.wave % 25 === 0
      ? `Flying boss wave ${state.wave}`
      : state.wave % 10 === 0
        ? `Ground boss wave ${state.wave}`
        : `Wave ${state.wave} enters the maze`;
  ui.start.disabled = true;
}

function resetGame() {
  state.lives = 20;
  state.credits = 190;
  state.wave = 1;
  state.score = 0;
  state.spawned = 0;
  state.toSpawn = 0;
  state.towers = [];
  state.enemies = [];
  state.projectiles = [];
  state.effects = [];
  state.difficulty = Number(ui.difficulty.value);
  selectedTower = null;
  waveActive = false;
  paused = false;
  ended = false;
  refreshPath();
  ui.start.disabled = false;
  ui.pause.textContent = "Pause";
  ui.banner.textContent = "Place defenders as walls, but leave a path to the keep.";
  updateHud();
}

function createTower(type, tile) {
  const base = towerTypes[type];
  const center = tileCenter(tile);
  return {
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
  if (modifier.damageMult !== undefined) stats.damage = Math.max(1, Math.round(stats.damage * modifier.damageMult));
  if (modifier.fireRateMult !== undefined) stats.fireRate = Math.max(0.14, stats.fireRate * modifier.fireRateMult);
  if (modifier.rangeAdd !== undefined) stats.range = Math.max(32, stats.range + modifier.rangeAdd);
  if (modifier.splashRadiusAdd !== undefined) stats.splashRadius = Math.max(0, (stats.splashRadius || 0) + modifier.splashRadiusAdd);
  if (modifier.chainRangeAdd !== undefined) stats.chainRange = (stats.chainRange || 0) + modifier.chainRangeAdd;
  if (modifier.chainCountAdd !== undefined) stats.chainCount = Math.max(0, (stats.chainCount || 0) + modifier.chainCountAdd);
  if (modifier.multiShot !== undefined) stats.multiShot = modifier.multiShot;
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
    range: base.range + (tower.level - 1) * 13,
    fireRate: Math.max(0.22, base.fireRate - (tower.level - 1) * 0.06),
    splashRadius: base.splashRadius ? base.splashRadius + (tower.level - 1) * 5 : 0,
    chainCount: base.chainCount ? base.chainCount + Math.floor((tower.level - 1) / 2) : 0,
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
  return tower.level < 4 ? 38 + tower.level * 30 : 110 + tower.level * 62;
}

function evolutionCost(tower) {
  return 150 + towerTypes[tower.type].cost;
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
  if (stats.melee) extras.push("blocks");
  if (stats.antiAirOnly) extras.push("flying only");
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
    .filter((enemy) => dist(tower, enemy) <= stats.range && (!stats.antiAirOnly || enemy.flying))
    .sort((a, b) => enemyProgress(b) - enemyProgress(a));

  const target = targets[0];
  if (!target) return;

  tower.cooldown = stats.fireRate;
  if (stats.melee) {
    const meleeTargets = targets.slice(0, stats.multiShot || 1);
    for (const enemy of meleeTargets) {
      applyDamage(enemy, stats.damage);
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
    });
  }
}

function applyDamage(enemy, amount) {
  enemy.hp -= amount;
  state.effects.push({ x: enemy.x, y: enemy.y, r: 4, life: 0.25, color: "#ffffff" });
  if (enemy.hp <= 0) {
    state.credits += enemy.reward;
    state.score += enemy.reward * 12;
    state.enemies = state.enemies.filter((item) => item !== enemy);
  }
}

function applySlow(enemy, duration) {
  enemy.slowTime = Math.max(enemy.slowTime, duration);
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

    const slowMod = enemy.slowTime > 0 ? 0.48 : 1;
    enemy.slowTime = Math.max(0, enemy.slowTime - dt);
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
      state.enemies.push(makeEnemy(state.spawned));
      state.spawned += 1;
      spawnTimer =
        state.wave % 25 === 0 || state.wave % 10 === 0
          ? Math.max(0.56, 1.05 - state.wave * 0.018)
          : Math.max(0.28, 0.86 - state.wave * 0.026);
    }

    if (state.spawned >= state.toSpawn && state.enemies.length === 0) {
      waveActive = false;
      state.wave += 1;
      state.credits += 32 + state.wave * 5;
      ui.banner.textContent = `Wave cleared. Build for wave ${state.wave}.`;
      ui.start.disabled = false;
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
    effect.r += 75 * dt;
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
  if (tower.type === "dart") return "archer";
  if (tower.type === "guard") return "guard";
  if (tower.type === "rail") return "ballista";
  if (tower.type === "sky") return "sky";
  if (tower.type === "mortar") return "catapult";
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
  const color = enemy.slowTime > 0 ? "#b8f5ff" : enemy.color;
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

ui.towerCards.forEach((button) => {
  button.addEventListener("click", () => {
    selectBuild(button.dataset.tower);
  });
});

ui.start.addEventListener("click", startWave);
ui.restart.addEventListener("click", resetGame);
ui.difficulty.addEventListener("input", () => {
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

resetGame();
requestAnimationFrame(loop);
