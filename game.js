const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const baseCanvasWidth = canvas.width;
const baseCanvasHeight = canvas.height;

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

const W = baseCanvasWidth;
const H = baseCanvasHeight;
const cell = 32;
const cols = W / cell;
const rows = H / cell;
const spawnTile = { col: 0, row: 9 };
const keepTile = { col: cols - 1, row: 9 };

function setupCanvasDpi() {
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const targetWidth = Math.round(baseCanvasWidth * dpr);
  const targetHeight = Math.round(baseCanvasHeight * dpr);
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
}

const humanTowerTypes = {
  dart: {
    name: "Archer",
    role: "Fast single low damage",
    glyph: "A",
    cost: 40,
    color: "#f4c95d",
    range: 132,
    fireRate: 0.32,
    damage: 31,
    projectileSpeed: 520,
  },
  guard: {
    name: "Shield Guard",
    role: "Cheap melee",
    glyph: "G",
    cost: 14,
    color: "#7da1d3",
    range: 48,
    fireRate: 0.55,
    damage: 8,
    projectileSpeed: 0,
    melee: true,
    groundOnly: true,
  },
  rail: {
    name: "Ballista",
    role: "Slow single high damage",
    glyph: "B",
    cost: 65,
    color: "#c9c3ae",
    range: 158,
    fireRate: 1.18,
    damage: 145,
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
    damage: 136,
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
    damage: 22,
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
    damage: 9,
    projectileSpeed: 430,
    splashRadius: 48,
    burnDps: 4,
    burnDuration: 1.6,
  },
  mortar: {
    name: "Catapult",
    role: "Slow AOE high damage",
    glyph: "C",
    cost: 95,
    color: "#8f6f42",
    range: 182,
    fireRate: 1.65,
    damage: 42,
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
    damage: 0,
    projectileSpeed: 360,
    slow: true,
    slowDuration: 2.7,
  },
  bank: {
    name: "Royal Bank",
    role: "Economy tower",
    glyph: "$",
    cost: 110,
    color: "#f0c14b",
    range: 0,
    fireRate: 999,
    damage: 0,
    projectileSpeed: 0,
    bank: true,
    bankBaseIncome: 12,
    bankLevelIncome: 3,
    bankCompound: 0.035,
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
      forks: {
        a: { name: "Sniper", desc: "Slow massive single target, air and ground", fireRateMult: 1.85, damageMult: 3.1, rangeAdd: 80, glyph: "N", final: { name: "Deadeye", desc: "Extreme single target range and damage", damageMult: 1.75, rangeAdd: 70, bossDamageMult: 1.18, glyph: "D" } },
        b: { name: "Long Volley", desc: "Long range rapid single target", fireRateMult: 0.58, damageMult: 1.15, rangeAdd: 66, glyph: "L", final: { name: "Arrow Engine", desc: "Relentless long-range single target", fireRateMult: 0.48, damageMult: 1.25, rangeAdd: 48, glyph: "E" } },
      },
    },
    b: {
      name: "Split Shot",
      desc: "Hits two targets",
      multiShot: 2,
      damageMult: 0.78,
      glyph: "M",
      forks: {
        a: { name: "Fan Shot", desc: "More targets", multiShot: 4, damageMult: 0.9, glyph: "F", final: { name: "Raincaller", desc: "Hits many targets", multiShot: 6, damageMult: 1.1, glyph: "N" } },
        b: { name: "Venom Twins", desc: "Still two targets, adds poison", multiShot: 2, bleedDps: 16, bleedDuration: 3.4, glyph: "V", final: { name: "Blackleaf", desc: "Two poisoned shots with heavy venom", bleedDpsMult: 2.1, bleedDurationAdd: 2.2, damageMult: 1.18, glyph: "B" } },
      },
    },
  },
  guard: {
    a: {
      name: "Shield Bash",
      desc: "Briefly stuns enemies",
      stunDuration: 0.32,
      damageMult: 1.2,
      glyph: "T",
      forks: {
        a: { name: "Repel Bash", desc: "Short-range stun and knockback", rangeAdd: -10, stunDurationAdd: 0.12, knockback: 22, glyph: "R", final: { name: "Gatebreaker", desc: "Hard close-range knockback", rangeAdd: -8, stunDurationAdd: 0.18, knockbackAdd: 18, damageMult: 1.25, glyph: "G" } },
        b: { name: "Crowd Bash", desc: "Short-range multi-target stun", rangeAdd: -12, multiShot: 3, damageMult: 0.92, glyph: "C", final: { name: "Bastion Guard", desc: "Close multi-stun defense", rangeAdd: -8, multiShot: 5, stunDurationAdd: 0.14, glyph: "B" } },
      },
    },
    b: {
      name: "Shield Sweep",
      desc: "Placeholder tank path; sweeping damage for now",
      multiShot: 3,
      damageMult: 1.05,
      fireRateMult: 0.82,
      glyph: "D",
      forks: {
        a: { name: "Duelist", desc: "Single-target flat damage", multiShot: 1, damageMult: 2.35, fireRateMult: 0.78, glyph: "U", final: { name: "Duelist Captain", desc: "Heavy single-target guard damage", damageMult: 1.75, fireRateMult: 0.72, glyph: "K" } },
        b: { name: "Sweeper", desc: "Improved sweep damage", multiShot: 4, damageMult: 1.35, glyph: "S", final: { name: "Shield Wall", desc: "Wide sweeping guard damage", multiShot: 6, damageMult: 1.22, glyph: "W" } },
      },
    },
  },
  rail: {
    a: {
      name: "Siege Bolt",
      desc: "Slow long-range single-target damage",
      damageMult: 1.85,
      fireRateMult: 1.12,
      rangeAdd: 34,
      glyph: "S",
      forks: {
        a: { name: "Wing Pin", desc: "Flying specialty with knockdown", airDamageMult: 1.75, stunDuration: 0.14, knockback: 34, glyph: "W", final: { name: "Dragon Pin", desc: "Brutal flying knockdown", airDamageMultAdd: 0.85, stunDurationAdd: 0.12, knockbackAdd: 24, damageMult: 1.18, glyph: "D" } },
        b: { name: "Boss Bolt", desc: "Boss damage specialty", bossDamageMult: 1.8, glyph: "O", final: { name: "Titan Bolt", desc: "Boss-piercing damage", bossDamageMultAdd: 1.2, damageMult: 1.35, rangeAdd: 28, glyph: "T" } },
      },
    },
    b: {
      name: "Repeater Frame",
      desc: "Fast short-range ballista",
      rangeAdd: -42,
      fireRateMult: 0.45,
      damageMult: 0.7,
      glyph: "R",
      forks: {
        a: { name: "Sky Repeater", desc: "Fast shots deal extra damage to air", airDamageMult: 1.75, glyph: "A", final: { name: "Sky Battery", desc: "Extreme anti-air repeater", airDamageMultAdd: 0.9, fireRateMult: 0.74, glyph: "Y" } },
        b: { name: "Focus Crank", desc: "Repeated shots scale on one target", repeatDamageAdd: 0.18, repeatDamageMax: 8, glyph: "F", final: { name: "Boss Crank", desc: "Repeated shots scale harder", repeatDamageAddAdd: 0.12, repeatDamageMaxAdd: 6, glyph: "C" } },
      },
    },
  },
  sky: {
    a: {
      name: "Dragon Piercer",
      desc: "Extreme anti-air damage",
      damageMult: 1.8,
      fireRateMult: 1.08,
      glyph: "P",
      forks: {
        a: { name: "Wing Execute", desc: "Executes air below 10% HP", executeAirThreshold: 0.1, glyph: "E", final: { name: "Wyrmslayer", desc: "Executes air below 18% HP", executeAirThresholdAdd: 0.08, damageMult: 1.35, glyph: "Y" } },
        b: { name: "Snare Bolts", desc: "Slows air", slow: true, slowDuration: 2.2, glyph: "S", final: { name: "Sky Chains", desc: "Longer air slows", slowDurationAdd: 3.2, fireRateMult: 0.82, glyph: "C" } },
      },
    },
    b: {
      name: "Skyburst Crew",
      desc: "AOE anti-air blasts",
      splashRadiusAdd: 58,
      damageMult: 0.76,
      fireRateMult: 1.12,
      glyph: "E",
      forks: {
        a: { name: "Frost Burst", desc: "Low damage splash slow", damageMult: 0.55, slow: true, slowDuration: 1.7, glyph: "F", final: { name: "Starfall Frost", desc: "Wider slowing skybursts", splashRadiusAdd: 44, slowDurationAdd: 2.4, glyph: "R" } },
        b: { name: "Ground Slash", desc: "Splash also hits ground, but targets air", splashHitsGround: true, damageMult: 1.08, glyph: "G", final: { name: "Starfall Battery", desc: "Huge mixed splash from air targets", splashRadiusAdd: 54, damageMult: 1.35, glyph: "Q" } },
      },
    },
  },
  chain: {
    a: {
      name: "Forked Lightning",
      desc: "More chain jumps",
      chainCountAdd: 3,
      chainRangeAdd: 30,
      damageMult: 1.18,
      glyph: "F",
      forks: {
        a: { name: "Storm Web", desc: "Even more jumps", chainCountAdd: 6, chainRangeAdd: 40, damageMult: 1.12, glyph: "W", final: { name: "World Web", desc: "Chains through whole packs", chainCountAdd: 8, chainRangeAdd: 50, damageMult: 1.18, glyph: "O" } },
        b: { name: "Static Chain", desc: "Brief stun on chain hits", stunDuration: 0.1, damageMult: 1.1, glyph: "S", final: { name: "Lightning Net", desc: "Longer chain stuns", stunDurationAdd: 0.12, chainCountAdd: 3, damageMult: 1.16, glyph: "N" } },
      },
    },
    b: {
      name: "Thunder Strike",
      desc: "Small AOE lightning hits",
      splashRadiusAdd: 42,
      damageMult: 1.45,
      chainCountAdd: -1,
      glyph: "T",
      forks: {
        a: { name: "Storm Burst", desc: "Bigger AOE lightning", splashRadiusAdd: 36, damageMult: 1.08, glyph: "B", final: { name: "Sky Hammer", desc: "Crushing lightning blasts", splashRadiusAdd: 44, damageMult: 1.5, glyph: "H" } },
        b: { name: "Thunderclap", desc: "Brief stun in the blast", stunDuration: 0.12, glyph: "C", final: { name: "Storm Hammer", desc: "Stronger stunning blasts", stunDurationAdd: 0.12, damageMult: 1.28, glyph: "M" } },
      },
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
      forks: {
        a: { name: "Heat Aura", desc: "Becomes close aura damage", auraDamage: true, projectileSpeed: 0, rangeAdd: -18, fireRateMult: 0.82, glyph: "A", final: { name: "Dragon Breath", desc: "Dense close fire aura", fireRateMult: 0.58, rangeAdd: 18, damageMult: 1.3, glyph: "B" } },
        b: { name: "Cinder Cone", desc: "Adds frequent burn DOT", fireRateMult: 0.82, burnDps: 18, burnDuration: 3.4, glyph: "D", final: { name: "Ash Cone", desc: "Hotter, longer cone burns", burnDpsMult: 1.9, burnDurationAdd: 2.2, fireRateMult: 0.86, glyph: "H" } },
      },
    },
    b: {
      name: "Fire Orb",
      desc: "Longer ranged explosions",
      rangeAdd: 54,
      splashRadiusAdd: 26,
      fireRateMult: 1.18,
      damageMult: 1.25,
      glyph: "O",
      forks: {
        a: { name: "Sun Orb", desc: "Bigger splash", splashRadiusAdd: 46, glyph: "S", final: { name: "Solar Orb", desc: "Huge ranged explosions", rangeAdd: 45, splashRadiusAdd: 56, damageMult: 1.25, glyph: "U" } },
        b: { name: "Pitch Orb", desc: "Adds frequent burn DOT", fireRateMult: 0.86, burnDps: 22, burnDuration: 4.1, glyph: "P", final: { name: "Meteor Orb", desc: "Long burning explosions", burnDpsMult: 1.8, burnDurationAdd: 2.5, fireRateMult: 0.88, damageMult: 1.18, glyph: "M" } },
      },
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
      forks: {
        a: { name: "Mudbreaker", desc: "Adds slow", slow: true, slowDuration: 1.8, glyph: "M", final: { name: "Worldmire", desc: "Bigger slowing siege blasts", slowDurationAdd: 2.8, splashRadiusAdd: 30, glyph: "I" } },
        b: { name: "Worldsplitter", desc: "Adds damage", damageMult: 1.55, glyph: "W", final: { name: "Core Splitter", desc: "Massive siege damage", damageMult: 1.6, splashRadiusAdd: 30, glyph: "C" } },
      },
    },
    b: {
      name: "Scatter Stones",
      desc: "Faster smaller blasts",
      fireRateMult: 0.56,
      damageMult: 0.72,
      splashRadiusAdd: 12,
      glyph: "S",
      forks: {
        a: { name: "Hail Battery", desc: "Adds range", rangeAdd: 64, glyph: "H", final: { name: "Distant Hail", desc: "Long-range bombardment", rangeAdd: 86, fireRateMult: 0.82, glyph: "D" } },
        b: { name: "Quarry Storm", desc: "Increases splash radius", splashRadiusAdd: 44, glyph: "Q", final: { name: "Stone Rain", desc: "Huge fast splash radius", splashRadiusAdd: 64, multiShot: 2, glyph: "R" } },
      },
    },
  },
  frost: {
    a: {
      name: "Deep Chill",
      desc: "Much longer single-target slow",
      slowDurationAdd: 4.2,
      rangeAdd: 18,
      glyph: "D",
      forks: {
        a: {
          name: "Creeping Cold",
          desc: "Slow spreads to two fresh targets",
          slowSpreadCount: 2,
          slowSpreadRange: 78,
          glyph: "C",
          final: { name: "Winter Plague", desc: "Slow spreads farther", slowSpreadRangeAdd: 36, slowSpreadCountAdd: 1, slowDurationAdd: 3.2, glyph: "P" },
        },
        b: {
          name: "Far Winter",
          desc: "Increased range",
          rangeAdd: 58,
          glyph: "R",
          final: { name: "Winter Prison", desc: "Extreme range and long slow", rangeAdd: 72, slowDurationAdd: 5.0, glyph: "P" },
        },
      },
    },
    b: {
      name: "Ice Shards",
      desc: "AOE slowing splash",
      splashRadiusAdd: 54,
      damageMult: 1.45,
      fireRateMult: 1.08,
      glyph: "I",
      forks: {
        a: {
          name: "Deep Freeze",
          desc: "Longer slow",
          slowDurationAdd: 3.2,
          glyph: "D",
          final: { name: "Frozen Garden", desc: "Huge slow blooms", slowDurationAdd: 4.8, splashRadiusAdd: 32, glyph: "F" },
        },
        b: {
          name: "True Cold",
          desc: "Can slow resistant enemies slightly",
          coldPierce: 0.18,
          glyph: "T",
          final: { name: "Absolute Zero", desc: "Strongly pierces slow resistance", coldPierceAdd: 0.42, slowDurationAdd: 3.2, glyph: "Z" },
        },
      },
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
    damage: 13,
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
    damage: 38,
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
    slowDuration: 1.7,
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
    slowDuration: 1.45,
    groundOnly: true,
  },
};

const orcEvolutions = {
  grunt: {
    a: {
      name: "Frenzy Stab",
      desc: "Explodes into rapid single-target damage",
      fireRateMult: 0.36,
      damageMult: 4.2,
      glyph: "F",
      forks: {
        a: { name: "Boss Gouger", desc: "Boss killer damage multiplier", bossDamageMult: 2.1, glyph: "G", final: { name: "Boss Eater", desc: "Extreme boss stabbing", bossDamageMultAdd: 1.35, damageMult: 1.28, glyph: "E" } },
        b: { name: "Wound Hex", desc: "Reduces healing by 60%", antiHealMult: 0.4, antiHealDuration: 2.6, glyph: "W", final: { name: "Rot Stabber", desc: "Longer anti-heal wounds", antiHealDurationAdd: 2.2, damageMult: 1.2, glyph: "R" } },
      },
    },
    b: {
      name: "Axe Cleave",
      desc: "Becomes a real cleaving damage unit",
      multiShot: 3,
      damageMult: 3.1,
      fireRateMult: 0.92,
      glyph: "A",
      forks: {
        a: { name: "Blood Cleave", desc: "Cleave bleeds", bleedDps: 14, bleedDuration: 3, glyph: "B", final: { name: "Blood Mob", desc: "Heavier cleaving bleed", bleedDpsMult: 1.9, bleedDurationAdd: 1.8, multiShot: 5, glyph: "M" } },
        b: { name: "Shove Cleave", desc: "Cleave knocks back", knockback: 18, glyph: "S", final: { name: "Axe Mob", desc: "Wide cleaving knockback", knockbackAdd: 14, multiShot: 5, damageMult: 1.18, glyph: "X" } },
      },
    },
  },
  spear: {
    a: {
      name: "Quick Spears",
      desc: "Fast, narrow line strikes",
      fireRateMult: 0.56,
      damageMult: 0.78,
      lineWidthAdd: -5,
      glyph: "Q",
      forks: {
        a: { name: "Needle Volley", desc: "Even faster narrow lines", fireRateMult: 0.58, damageMult: 0.92, glyph: "V", final: { name: "Spear Storm", desc: "Extreme line speed", fireRateMult: 0.52, damageMult: 1.18, glyph: "T" } },
        b: { name: "Long Skewer", desc: "Longer narrow line", rangeAdd: 24, damageMult: 1.08, glyph: "L", final: { name: "Horizon Skewer", desc: "Long, lethal narrow pierce", rangeAdd: 30, damageMult: 1.28, glyph: "H" } },
      },
    },
    b: {
      name: "Barbed Spears",
      desc: "Normal speed, wider line",
      damageMult: 1.25,
      fireRateMult: 1.1,
      lineWidthAdd: 10,
      glyph: "B",
      forks: {
        a: { name: "Impaler", desc: "Flat burst damage", damageMult: 1.45, lineWidthAdd: 8, glyph: "I", final: { name: "Giant Impaler", desc: "Huge flat line damage", damageMult: 1.55, lineWidthAdd: 10, glyph: "G" } },
        b: { name: "Bleeding Barbs", desc: "Lower hit, adds bleed", damageMult: 0.82, bleedDps: 18, bleedDuration: 3.2, glyph: "D", final: { name: "Blood Hooks", desc: "Heavy bleeding pierce", bleedDpsMult: 1.9, bleedDurationAdd: 1.8, glyph: "K" } },
      },
    },
  },
  berserker: {
    a: {
      name: "Blood Frenzy",
      desc: "Rapid strikes across nearby enemies",
      fireRateMult: 0.5,
      damageMult: 1.08,
      multiShot: 2,
      glyph: "F",
      forks: {
        a: { name: "Long Frenzy", desc: "Increased melee reach", rangeAdd: 28, glyph: "L", final: { name: "Red Reach", desc: "Relentless long melee pressure", rangeAdd: 34, fireRateMult: 0.62, multiShot: 3, glyph: "R" } },
        b: { name: "Blade Storm", desc: "Overlapping bladestorms multiply damage", bladeStormMult: 0.22, glyph: "S", final: { name: "Red Storm", desc: "Stronger overlap scaling", bladeStormMultAdd: 0.18, fireRateMult: 0.68, glyph: "D" } },
      },
    },
    b: {
      name: "Skull Cleaver",
      desc: "Heavy cleaving hits",
      damageMult: 1.55,
      fireRateMult: 1.18,
      multiShot: 2,
      glyph: "K",
      forks: {
        a: { name: "Wide Cleaver", desc: "Bigger hit cap", multiShot: 4, rangeAdd: 16, glyph: "W", final: { name: "Cleaver Mob", desc: "Huge hit cap and reach", multiShot: 6, rangeAdd: 18, glyph: "M" } },
        b: { name: "Skull Splitter", desc: "Slower but massive cleave", fireRateMult: 1.48, damageMult: 2.05, glyph: "S", final: { name: "Boss Butcher", desc: "Huge slow cleaving burst", damageMult: 1.8, multiShot: 3, glyph: "U" } },
      },
    },
  },
  wyvern: {
    a: {
      name: "Dragon Skewer",
      desc: "Extreme anti-air damage",
      damageMult: 1.8,
      glyph: "S",
      forks: {
        a: { name: "Sky Killer", desc: "Air boss damage multiplier", bossDamageMult: 1.85, glyph: "K", final: { name: "Wyrm Bane", desc: "Extreme flying boss execution", bossDamageMultAdd: 1.15, damageMult: 1.35, glyph: "B" } },
        b: { name: "Sniper Spear", desc: "Long-range anti-air sniper", rangeAdd: 84, fireRateMult: 1.08, glyph: "R", final: { name: "Cloud Harpoon", desc: "Extreme anti-air range", rangeAdd: 96, damageMult: 1.25, glyph: "H" } },
      },
    },
    b: {
      name: "Net Spears",
      desc: "AOE anti-air blasts",
      splashRadiusAdd: 58,
      damageMult: 0.78,
      glyph: "N",
      forks: {
        a: { name: "Wide Net", desc: "Bigger anti-air splash", splashRadiusAdd: 52, glyph: "W", final: { name: "Net Storm", desc: "Huge anti-air splash", splashRadiusAdd: 68, damageMult: 1.25, glyph: "M" } },
        b: { name: "Snap Net", desc: "Rapid fire, decreased range", fireRateMult: 0.54, rangeAdd: -28, glyph: "P", final: { name: "Needle Net", desc: "Very rapid short anti-air bursts", fireRateMult: 0.56, damageMult: 1.18, glyph: "D" } },
      },
    },
  },
  drummer: {
    a: {
      name: "Battle Rhythm",
      desc: "Faster aura pulses",
      fireRateMult: 0.55,
      damageMult: 1.1,
      glyph: "R",
      forks: {
        a: { name: "Frenzy Chant", desc: "Even faster aura pulses", fireRateMult: 0.62, damageMult: 1.08, glyph: "F", final: { name: "War Chant", desc: "Blinding pulse rhythm", fireRateMult: 0.55, damageMult: 1.2, glyph: "C" } },
        b: { name: "Blood Tempo", desc: "Slower but harder pulses", fireRateMult: 1.28, damageMult: 1.75, glyph: "B", final: { name: "Blood Festival", desc: "Crushing aura pulses", damageMult: 1.65, glyph: "V" } },
      },
    },
    b: {
      name: "Thunder Drum",
      desc: "Wider, harder aura",
      rangeAdd: 28,
      damageMult: 1.35,
      glyph: "T",
      forks: {
        a: { name: "Earth Drum", desc: "Larger aura", rangeAdd: 34, damageMult: 1.1, glyph: "E", final: { name: "World Drum", desc: "Huge damage aura", rangeAdd: 42, damageMult: 1.25, glyph: "W" } },
        b: { name: "Armor Break", desc: "Aura makes enemies vulnerable", vulnMult: 1.18, vulnDuration: 1.6, glyph: "A", final: { name: "Shatter Rhythm", desc: "Stronger vulnerability aura", vulnMultAdd: 0.14, vulnDurationAdd: 1.0, glyph: "S" } },
      },
    },
  },
  firepot: {
    a: {
      name: "Oil Fire",
      desc: "Wider, longer burns",
      splashRadiusAdd: 30,
      burnDurationAdd: 1.2,
      glyph: "O",
      forks: {
        a: { name: "Oil Cone", desc: "More range and wider cone", rangeAdd: 44, splashRadiusAdd: 24, glyph: "C", final: { name: "Burn Pit", desc: "Huge ranged fire spread", rangeAdd: 46, splashRadiusAdd: 42, glyph: "P" } },
        b: { name: "Long Oil", desc: "Even longer burns", burnDurationAdd: 2.4, glyph: "L", final: { name: "Tar Fire", desc: "Extreme burn duration", burnDurationAdd: 3.2, burnDpsMult: 1.25, glyph: "T" } },
      },
    },
    b: {
      name: "Pitch Toss",
      desc: "Longer range, hotter burns",
      rangeAdd: 52,
      fireRateMult: 1.12,
      burnDpsMult: 1.35,
      glyph: "T",
      forks: {
        a: { name: "Hot Shards", desc: "Small splash, faster throws", splashRadiusAdd: -24, fireRateMult: 0.62, damageMult: 1.18, glyph: "S", final: { name: "Shard Rain", desc: "Rapid small burning blasts", fireRateMult: 0.58, burnDpsMult: 1.25, glyph: "R" } },
        b: { name: "Fire Tiles", desc: "Lights tiles on fire", tileBurnDuration: 3.4, tileBurnDps: 18, tileBurnRadius: 36, glyph: "F", final: { name: "Scorched Ground", desc: "Longer, hotter fire tiles", tileBurnDurationAdd: 2.4, tileBurnDpsMult: 1.7, tileBurnRadiusAdd: 12, glyph: "G" } },
      },
    },
  },
  crusher: {
    a: {
      name: "War Maul",
      desc: "Melee splash crusher",
      shockwave: true,
      projectileSpeed: 0,
      rangeAdd: -82,
      damageMult: 1.45,
      splashRadiusAdd: 20,
      glyph: "M",
      forks: {
        a: { name: "Mountain Maul", desc: "Bigger splash and bigger hits", damageMult: 1.5, splashRadiusAdd: 30, glyph: "B", final: { name: "Mountain Breaker", desc: "Massive melee splash", damageMult: 1.45, splashRadiusAdd: 38, glyph: "K" } },
        b: { name: "War Battery", desc: "Rapid melee splashes", fireRateMult: 0.56, damageMult: 0.9, glyph: "R", final: { name: "Maul Storm", desc: "Very rapid close splashes", fireRateMult: 0.58, damageMult: 1.18, glyph: "S" } },
      },
    },
    b: {
      name: "Stone Volley",
      desc: "Short-range stun shots",
      fireRateMult: 0.68,
      damageMult: 0.78,
      splashRadiusAdd: -16,
      rangeAdd: -52,
      glyph: "V",
      forks: {
        a: { name: "Boss Quake", desc: "Slower shots, longer stuns, prioritizes bosses", fireRateMult: 1.45, stunDurationAdd: 0.28, bossPriority: true, bossDamageMult: 1.4, glyph: "Q", final: { name: "Boss Shaker", desc: "Long boss-locking stuns", stunDurationAdd: 0.3, bossDamageMultAdd: 0.9, glyph: "S" } },
        b: { name: "Pebble Volley", desc: "Small splash, max 4 enemies", splashRadiusAdd: -20, maxSplashTargets: 4, fireRateMult: 0.74, glyph: "P", final: { name: "Quake Battery", desc: "Relentless limited stuns", fireRateMult: 0.68, damageMult: 1.12, glyph: "Y" } },
      },
    },
  },
  hexer: {
    a: {
      name: "Deep Hex",
      desc: "Longer slow",
      slowDurationAdd: 2.8,
      rangeAdd: 20,
      glyph: "D",
      forks: {
        a: { name: "Wide Hex", desc: "Wider area, no more slow", rangeAdd: 48, glyph: "W", final: { name: "Doom Field", desc: "Huge hex area", rangeAdd: 64, glyph: "D" } },
        b: { name: "Snap Freeze", desc: "Less ticks, brief stun, persistent slow", fireRateMult: 1.55, stunDuration: 0.12, slowDurationAdd: 3.2, glyph: "F", final: { name: "Snap Prison", desc: "Persistent slow with sharper stuns", stunDurationAdd: 0.12, slowDurationAdd: 2.8, glyph: "P" } },
      },
    },
    b: {
      name: "Pain Hex",
      desc: "Adds damage to the slow field",
      damageAdd: 12,
      fireRateMult: 0.85,
      glyph: "P",
      forks: {
        a: { name: "Sky Hex", desc: "Damages air as well", groundOnly: false, damageAdd: 10, glyph: "A", final: { name: "Soul Hex", desc: "Heavy air and ground magic damage", damageAdd: 20, fireRateMult: 0.76, glyph: "S" } },
        b: { name: "Still Hex", desc: "Cancels enemy speed auras", cancelSpeedAuraDuration: 1.8, glyph: "C", final: { name: "Silence Hex", desc: "Long speed-aura suppression", cancelSpeedAuraDurationAdd: 2.2, rangeAdd: 24, glyph: "I" } },
      },
    },
  },
};

const races = {
  human: {
    name: "Human",
    description: "Balanced defenders with siege, mages, and anti-air.",
    towers: humanTowerTypes,
    evolutions: humanEvolutions,
    order: ["dart", "guard", "rail", "sky", "chain", "flak", "mortar", "frost", "bank"],
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
let nextEnemyId = 1;

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
  fireTiles: [],
  waveTime: 0,
  testGoldGlitch: {
    guardBuys: 0,
    step: 0,
    unlocked: false,
  },
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

function bankIncome(tower) {
  const stats = towerStats(tower);
  const waveAge = Math.max(0, state.wave - (tower.builtWave || 1));
  const flatIncome = (stats.bankBaseIncome || 0) + tower.level * (stats.bankLevelIncome || 0);
  return Math.round(flatIncome * (1 + waveAge * (stats.bankCompound || 0)));
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

function scaledGold(amount) {
  return Math.round(amount);
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

function lateWaveMix(wave, focus = "balanced", leaders = []) {
  const counts = {
    skeleton: 14 + Math.floor(wave * 1.25),
    centaur: 4 + Math.floor(wave / 6),
    knight: 3 + Math.floor(wave / 7),
    splitter: 2 + Math.floor(wave / 10),
    dragon: wave % 3 === 0 ? 1 + Math.floor(wave / 30) : 0,
    healer: wave >= 25 ? 1 + Math.floor((wave - 25) / 18) : 0,
    frostWight: wave >= 35 ? 2 + Math.floor((wave - 35) / 10) : 0,
    speedBanner: wave >= 45 ? 1 + Math.floor((wave - 45) / 22) : 0,
  };

  if (focus === "fast") {
    counts.centaur += 5 + Math.floor(wave / 9);
    counts.speedBanner += wave >= 45 ? 1 : 0;
    counts.skeleton = Math.max(10, counts.skeleton - 5);
  } else if (focus === "armor") {
    counts.knight += 4 + Math.floor(wave / 10);
    counts.healer += wave >= 25 ? 1 : 0;
    counts.centaur += 2;
  } else if (focus === "split") {
    counts.splitter += 3 + Math.floor(wave / 12);
    counts.frostWight += wave >= 35 ? 1 : 0;
    counts.centaur += 2;
  } else if (focus === "air") {
    counts.dragon += 2 + Math.floor(wave / 18);
    counts.speedBanner += wave >= 45 ? 1 : 0;
    counts.centaur += 2;
    counts.skeleton = Math.max(8, counts.skeleton - 8);
  } else if (focus === "boss") {
    counts.knight += 2 + Math.floor(wave / 12);
    counts.splitter += 1 + Math.floor(wave / 18);
    counts.healer += wave >= 25 ? 1 : 0;
    counts.frostWight += wave >= 35 ? 1 : 0;
    counts.skeleton = Math.max(8, counts.skeleton - 10);
  }

  return shuffled(
    [
      ...leaders,
      ...repeatType("skeleton", counts.skeleton),
      ...repeatType("centaur", counts.centaur),
      ...repeatType("knight", counts.knight),
      ...repeatType("splitter", counts.splitter),
      ...repeatType("dragon", counts.dragon),
      ...repeatType("healer", counts.healer),
      ...repeatType("frostWight", counts.frostWight),
      ...repeatType("speedBanner", counts.speedBanner),
    ],
    wave + leaders.length * 19,
  );
}

function bossVariantTypes(wave) {
  const variants = ["splitBoss", "frostBoss", "healerBoss", "speedBoss"];
  if (wave < 50) return ["groundBoss"];
  if (wave < 100) return [variants[Math.floor(wave / 10) % variants.length]];
  const count = 2 + Math.min(3, Math.floor((wave - 100) / 50));
  return Array.from({ length: count }, (_, index) => variants[(Math.floor(wave / 10) + index) % variants.length]);
}

function wavePlan(wave) {
  if (wave % 25 === 0) {
    const extra = Math.floor(wave / 25) * 2;
    const variantBosses = wave >= 50 ? bossVariantTypes(wave) : [];
    return {
      name: wave >= 100 ? "Elder Dragon Pack" : wave >= 50 ? "Elder Dragon Variant" : "Flying Boss",
      details: wave >= 100
        ? "The Elder Dragon brings multiple boss variants below it."
        : wave >= 50
          ? "The Elder Dragon brings a boss variant through the maze."
          : "An Elder Dragon ignores the maze. Sky Hunters matter.",
      tags: wave >= 50 ? ["flying boss", "boss variants", "mixed", "anti-air"] : wave > 25 ? ["flying boss", "mixed", "anti-air", "cleanup"] : ["flying boss", "anti-air", "high damage"],
      queue: wave > 25 ? lateWaveMix(wave, "air", ["flyingBoss", ...variantBosses, ...repeatType("dragon", extra)]) : ["flyingBoss", ...repeatType("dragon", extra)],
      spawnGap: wave > 25 ? Math.max(0.34, 0.8 - wave * 0.009) : Math.max(0.7, 1.15 - wave * 0.014),
    };
  }

  if (wave % 10 === 0) {
    const guards = Math.floor(wave / 10) * 2;
    const bosses = bossVariantTypes(wave);
    const variantBossWave = wave >= 50;
    return {
      name: variantBossWave ? (wave >= 100 ? "Variant Boss Pack" : "Variant Boss") : "Ground Boss",
      details: variantBossWave
        ? wave >= 100
          ? "Multiple boss variants combine support effects inside the lane."
          : "A boss version of a support enemy leads the wave."
        : wave > 25
          ? "A Siege Lord advances inside a mixed army."
          : "A Siege Lord follows the maze with knight support.",
      tags: variantBossWave ? ["boss variants", "mixed", "support"] : wave > 25 ? ["ground boss", "mixed", "armor", "cleanup"] : ["ground boss", "armor", "single-target"],
      queue: wave > 25 ? lateWaveMix(wave, "boss", [...bosses, ...repeatType("knight", guards)]) : ["groundBoss", ...repeatType("knight", guards)],
      spawnGap: wave > 25 ? Math.max(0.34, 0.82 - wave * 0.01) : Math.max(0.62, 1.05 - wave * 0.014),
    };
  }

  if (wave >= 12 && wave % 8 === 0) {
    return {
      name: "Mixed Vanguard",
      details: "Knights hold the lane while centaurs sprint through gaps.",
      tags: ["mixed", "tanky", "fast"],
      queue: wave > 25 ? lateWaveMix(wave, "balanced") : shuffled(
        [
          ...repeatType("knight", 3 + Math.floor(wave / 5)),
          ...repeatType("centaur", 4 + Math.floor(wave / 4)),
          ...repeatType("skeleton", 6 + wave),
        ],
        wave,
      ),
      spawnGap: Math.max(0.32, 0.78 - wave * 0.014),
    };
  }

  if (wave >= 8 && wave % 6 === 0) {
    return {
      name: "Bone Carriers",
      details: "Tanky carriers split into skeletons when killed.",
      tags: ["split", "tanky", "cleanup"],
      queue: wave > 25 ? lateWaveMix(wave, "split") : shuffled(
        [
          ...repeatType("splitter", 2 + Math.floor(wave / 6)),
          ...repeatType("centaur", 2 + Math.floor(wave / 5)),
          ...repeatType("skeleton", 5 + wave),
        ],
        wave,
      ),
      spawnGap: Math.max(0.34, 0.84 - wave * 0.015),
    };
  }

  if (wave >= 9 && wave % 7 === 0) {
    const dragons = 2 + Math.floor(wave / 14);
    return {
      name: "Dragon Skies",
      details: wave > 25 ? "Dragons arrive above a mixed ground push." : "Flying dragons cut across the field.",
      tags: wave > 25 ? ["flying", "mixed", "anti-air"] : ["flying", "anti-air"],
      queue: wave > 25 ? lateWaveMix(wave, "air") : shuffled(
        [
          ...repeatType("dragon", dragons),
          ...repeatType("centaur", Math.floor(wave / 7)),
          ...repeatType("skeleton", 5 + wave),
        ],
        wave,
      ),
      spawnGap: Math.max(0.34, 0.82 - wave * 0.018),
    };
  }

  if (wave > 5 && wave % 5 === 0) {
    return {
      name: "Knight Push",
      details: wave > 25 ? "Armored knights anchor a varied lane assault." : "Fallen knights test focused damage and long lanes.",
      tags: wave > 25 ? ["armor", "mixed", "tanky"] : ["armor", "tanky"],
      queue: wave > 25 ? lateWaveMix(wave, "armor") : shuffled(
        [
          ...repeatType("knight", 4 + Math.floor(wave / 3)),
          ...repeatType("splitter", wave >= 15 ? 1 + Math.floor(wave / 15) : 0),
          ...repeatType("skeleton", 6 + wave),
        ],
        wave,
      ),
      spawnGap: Math.max(0.38, 0.9 - wave * 0.018),
    };
  }

  if (wave > 3 && wave % 4 === 0) {
    return {
      name: "Centaur Rush",
      details: wave > 25 ? "Fast centaurs lead a mixed wave through weak turns." : "Fast centaurs punish short or leaky mazes.",
      tags: wave > 25 ? ["fast", "mixed", "rush"] : ["fast", "rush"],
      queue: wave > 25 ? lateWaveMix(wave, "fast") : shuffled([...repeatType("centaur", 5 + Math.floor(wave / 2)), ...repeatType("skeleton", 5 + wave)], wave),
      spawnGap: Math.max(0.26, 0.7 - wave * 0.014),
    };
  }

  return {
    name: wave > 25 ? "Warband" : wave < 3 ? "Skeleton Probe" : "Skeleton Swarm",
    details: wave > 25 ? "A varied army checks every part of the maze." : wave < 3 ? "Skeletons test your first maze." : "A broad skeleton wave rewards clean path length.",
    tags: wave > 25 ? ["mixed", "baseline", "coverage"] : ["baseline", "maze value"],
    queue:
      wave > 25
        ? lateWaveMix(wave, "balanced")
        : wave >= 11
          ? shuffled(
              [
                ...repeatType("skeleton", 8 + wave * 2),
                ...repeatType("centaur", Math.floor(wave / 5)),
                ...repeatType("knight", Math.floor(wave / 7)),
              ],
              wave,
            )
          : repeatType("skeleton", 9 + wave * 3),
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

function makeEnemy(type = "skeleton", overrides = null) {
  const wave = state.wave;
  const flyingBoss = type === "flyingBoss";
  const groundBoss = type === "groundBoss";
  const splitBoss = type === "splitBoss";
  const frostBoss = type === "frostBoss";
  const healerBoss = type === "healerBoss";
  const speedBoss = type === "speedBoss";
  const boss = flyingBoss || groundBoss || splitBoss || frostBoss || healerBoss || speedBoss;
  const dragon = flyingBoss || type === "dragon";
  const runner = type === "centaur";
  const bruiser = type === "knight";
  const splitter = type === "splitter" || splitBoss;
  const healer = type === "healer" || healerBoss;
  const frostWight = type === "frostWight" || frostBoss;
  const speedBanner = type === "speedBanner" || speedBoss;
  const difficulty = difficultyStats();
  const lateWave = Math.max(0, wave - 12);
  const waveScale = 1 + Math.max(0, wave - 1) * 0.07 + lateWave * lateWave * 0.0016;
  const baseHp = flyingBoss
    ? 1450 + wave * 135
    : groundBoss
      ? 1040 + wave * 108
    : splitBoss
      ? 1120 + wave * 112
    : frostBoss
      ? 1180 + wave * 118
    : healerBoss
      ? 1080 + wave * 110
    : speedBoss
      ? 1020 + wave * 104
    : dragon
      ? 470 + wave * 52
      : bruiser
        ? 215 + wave * 32
        : splitter
          ? 260 + wave * 36
          : healer
            ? 170 + wave * 25
            : frostWight
              ? 250 + wave * 30
              : speedBanner
                ? 190 + wave * 24
                : runner
                  ? 80 + wave * 17
                  : 92 + wave * 21;
  const hp = Math.round(baseHp * waveScale * difficulty.hp);
  const start = tileCenter(spawnTile);
  const enemy = {
    id: nextEnemyId++,
    x: start.x - 34,
    y: start.y,
    path: flyingBoss || dragon ? flyingPath() : currentPath.length ? currentPath : findPath(),
    targetIndex: 0,
    hp,
    maxHp: hp,
    speed: (flyingBoss ? 33 + wave * 0.8 : groundBoss || splitBoss || frostBoss || healerBoss || speedBoss ? 36 + wave * 0.9 : dragon ? 42 + wave * 1.1 : runner ? 104 + wave * 2.35 : bruiser ? 42 + wave * 1.15 : splitter ? 46 + wave * 1.1 : healer ? 56 + wave * 1.35 : frostWight ? 50 + wave * 1.25 : speedBanner ? 60 + wave * 1.45 : 64 + wave * 1.75) * difficulty.speed,
    reward: scaledGold(flyingBoss ? 170 + wave * 4 : boss ? 115 + wave * 3 : dragon ? 48 : bruiser ? 17 : splitter ? 18 : healer ? 24 : frostWight ? 19 : speedBanner ? 22 : runner ? 10 : 8),
    radius: flyingBoss ? 25 : boss ? 23 : dragon ? 18 : bruiser ? 14 : splitter ? 15 : healer ? 12 : frostWight ? 13 : speedBanner ? 12 : runner ? 9 : 11,
    color: flyingBoss ? "#8f2520" : groundBoss ? "#7b6552" : splitBoss ? "#b8935b" : frostBoss ? "#8bd8ff" : healerBoss ? "#9fe3a1" : speedBoss ? "#f05f45" : dragon ? "#d13f2f" : bruiser ? "#b9b2a2" : splitter ? "#b8935b" : healer ? "#9fe3a1" : frostWight ? "#8bd8ff" : speedBanner ? "#f05f45" : runner ? "#73c66b" : "#d9d1bd",
    name: flyingBoss ? "Elder Dragon" : groundBoss ? "Siege Lord" : splitBoss ? "Bone Tyrant" : frostBoss ? "Frost Lord" : healerBoss ? "High Priest" : speedBoss ? "War Herald" : dragon ? "Dragon" : bruiser ? "Fallen Knight" : splitter ? "Bone Carrier" : healer ? (wave >= 75 ? "High Cleric" : "Cult Healer") : frostWight ? "Frost Wight" : speedBanner ? "War Banner" : runner ? "Centaur" : "Skeleton",
    glyph: flyingBoss ? "B" : groundBoss ? "L" : splitBoss ? "T" : frostBoss ? "F" : healerBoss ? "P" : speedBoss ? "W" : dragon ? "D" : bruiser ? "K" : splitter ? "P" : healer ? "H" : frostWight ? "R" : speedBanner ? "!" : runner ? "C" : "S",
    flying: flyingBoss || dragon,
    boss,
    livesDamage: flyingBoss ? 6 : groundBoss ? 4 : dragon ? 2 : 1,
    deathSpawnType: splitter ? "skeleton" : null,
    deathSpawnCount: splitBoss ? 9 : splitter ? 3 : 0,
    coldResist: frostBoss ? 0.22 : frostWight ? 0.35 : 1,
    healRadius: healerBoss ? 112 : healer ? (wave >= 75 ? 92 : 58) : 0,
    healAmount: healerBoss ? Math.round(42 * difficulty.hp) : healer ? Math.round((wave >= 75 ? 24 : 34) * difficulty.hp) : 0,
    healRate: healerBoss ? 0.62 : healer ? (wave >= 75 ? 0.72 : 1.35) : 0,
    healAuraDps: healerBoss ? Math.round((16 + wave * 0.45) * difficulty.hp) : healer && wave >= 75 ? Math.round((10 + wave * 0.35) * difficulty.hp) : 0,
    healCooldown: healer ? 0.35 : 0,
    speedAuraRadius: speedBoss ? 118 : speedBanner ? 86 : 0,
    speedAuraMult: speedBoss ? 1.36 : speedBanner ? 1.28 : 1,
    slowTime: 0,
    slowSources: {},
    burnTime: 0,
    burnDps: 0,
    bleedTime: 0,
    bleedDps: 0,
    vulnTime: 0,
    vulnMult: 1,
    stunTime: 0,
  };
  if (overrides) Object.assign(enemy, overrides);
  return enemy;
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
  state.waveTime = 0;
  for (const tower of state.towers) {
    tower.waveDamage = 0;
    tower.waveSeconds = 0;
  }
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
  state.fireTiles = [];
  state.waveTime = 0;
  state.testGoldGlitch = {
    guardBuys: 0,
    step: 0,
    unlocked: false,
  };
  state.difficulty = Number(ui.difficulty.value);
  selectedTower = null;
  waveActive = false;
  paused = false;
  ended = false;
  difficultyLocked = false;
  raceLocked = false;
  nextTowerId = 1;
  nextEnemyId = 1;
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
    specialization: null,
    finalForm: false,
    spent: base.cost,
    cooldown: 0,
    builtWave: state.wave,
    waveDamage: 0,
    totalDamage: 0,
    waveSeconds: 0,
  };
}

function applyStatModifier(stats, modifier) {
  if (!modifier) return stats;
  if (modifier.damageAdd !== undefined) stats.damage = Math.max(0, stats.damage + modifier.damageAdd);
  if (modifier.damageMult !== undefined) stats.damage = Math.max(1, Math.round(stats.damage * modifier.damageMult));
  if (modifier.projectileSpeed !== undefined) stats.projectileSpeed = modifier.projectileSpeed;
  if (modifier.auraDamage !== undefined) stats.auraDamage = modifier.auraDamage;
  if (modifier.slow !== undefined) stats.slow = modifier.slow;
  if (modifier.shockwave !== undefined) stats.shockwave = modifier.shockwave;
  if (modifier.groundOnly !== undefined) stats.groundOnly = modifier.groundOnly;
  if (modifier.burnDps !== undefined) stats.burnDps = modifier.burnDps;
  if (modifier.burnDuration !== undefined) stats.burnDuration = modifier.burnDuration;
  if (modifier.burnDpsMult !== undefined) stats.burnDps = Math.max(1, Math.round((stats.burnDps || 0) * modifier.burnDpsMult));
  if (modifier.burnDurationAdd !== undefined) stats.burnDuration = (stats.burnDuration || 0) + modifier.burnDurationAdd;
  if (modifier.bleedDps !== undefined) stats.bleedDps = modifier.bleedDps;
  if (modifier.bleedDpsMult !== undefined) stats.bleedDps = Math.max(1, Math.round((stats.bleedDps || 0) * modifier.bleedDpsMult));
  if (modifier.bleedDuration !== undefined) stats.bleedDuration = modifier.bleedDuration;
  if (modifier.bleedDurationAdd !== undefined) stats.bleedDuration = (stats.bleedDuration || 0) + modifier.bleedDurationAdd;
  if (modifier.vulnMult !== undefined) stats.vulnMult = modifier.vulnMult;
  if (modifier.vulnMultAdd !== undefined) stats.vulnMult = (stats.vulnMult || 1) + modifier.vulnMultAdd;
  if (modifier.vulnDuration !== undefined) stats.vulnDuration = modifier.vulnDuration;
  if (modifier.vulnDurationAdd !== undefined) stats.vulnDuration = (stats.vulnDuration || 0) + modifier.vulnDurationAdd;
  if (modifier.antiHealMult !== undefined) stats.antiHealMult = modifier.antiHealMult;
  if (modifier.antiHealDuration !== undefined) stats.antiHealDuration = modifier.antiHealDuration;
  if (modifier.antiHealDurationAdd !== undefined) stats.antiHealDuration = (stats.antiHealDuration || 0) + modifier.antiHealDurationAdd;
  if (modifier.bladeStormMult !== undefined) stats.bladeStormMult = modifier.bladeStormMult;
  if (modifier.bladeStormMultAdd !== undefined) stats.bladeStormMult = (stats.bladeStormMult || 0) + modifier.bladeStormMultAdd;
  if (modifier.cancelSpeedAuraDuration !== undefined) stats.cancelSpeedAuraDuration = modifier.cancelSpeedAuraDuration;
  if (modifier.cancelSpeedAuraDurationAdd !== undefined) stats.cancelSpeedAuraDuration = (stats.cancelSpeedAuraDuration || 0) + modifier.cancelSpeedAuraDurationAdd;
  if (modifier.bossPriority !== undefined) stats.bossPriority = modifier.bossPriority;
  if (modifier.maxSplashTargets !== undefined) stats.maxSplashTargets = modifier.maxSplashTargets;
  if (modifier.tileBurnDuration !== undefined) stats.tileBurnDuration = modifier.tileBurnDuration;
  if (modifier.tileBurnDurationAdd !== undefined) stats.tileBurnDuration = (stats.tileBurnDuration || 0) + modifier.tileBurnDurationAdd;
  if (modifier.tileBurnDps !== undefined) stats.tileBurnDps = modifier.tileBurnDps;
  if (modifier.tileBurnDpsMult !== undefined) stats.tileBurnDps = Math.max(1, Math.round((stats.tileBurnDps || 0) * modifier.tileBurnDpsMult));
  if (modifier.tileBurnRadius !== undefined) stats.tileBurnRadius = modifier.tileBurnRadius;
  if (modifier.tileBurnRadiusAdd !== undefined) stats.tileBurnRadius = (stats.tileBurnRadius || 0) + modifier.tileBurnRadiusAdd;
  if (modifier.airDamageMult !== undefined) stats.airDamageMult = modifier.airDamageMult;
  if (modifier.airDamageMultAdd !== undefined) stats.airDamageMult = (stats.airDamageMult || 1) + modifier.airDamageMultAdd;
  if (modifier.bossDamageMult !== undefined) stats.bossDamageMult = modifier.bossDamageMult;
  if (modifier.bossDamageMultAdd !== undefined) stats.bossDamageMult = (stats.bossDamageMult || 1) + modifier.bossDamageMultAdd;
  if (modifier.executeAirThreshold !== undefined) stats.executeAirThreshold = modifier.executeAirThreshold;
  if (modifier.executeAirThresholdAdd !== undefined) stats.executeAirThreshold = (stats.executeAirThreshold || 0) + modifier.executeAirThresholdAdd;
  if (modifier.repeatDamageAdd !== undefined) stats.repeatDamageAdd = modifier.repeatDamageAdd;
  if (modifier.repeatDamageAddAdd !== undefined) stats.repeatDamageAdd = (stats.repeatDamageAdd || 0) + modifier.repeatDamageAddAdd;
  if (modifier.repeatDamageMax !== undefined) stats.repeatDamageMax = modifier.repeatDamageMax;
  if (modifier.repeatDamageMaxAdd !== undefined) stats.repeatDamageMax = (stats.repeatDamageMax || 0) + modifier.repeatDamageMaxAdd;
  if (modifier.knockback !== undefined) stats.knockback = modifier.knockback;
  if (modifier.knockbackAdd !== undefined) stats.knockback = (stats.knockback || 0) + modifier.knockbackAdd;
  if (modifier.coldPierce !== undefined) stats.coldPierce = modifier.coldPierce;
  if (modifier.coldPierceAdd !== undefined) stats.coldPierce = (stats.coldPierce || 0) + modifier.coldPierceAdd;
  if (modifier.slowSpreadCount !== undefined) stats.slowSpreadCount = modifier.slowSpreadCount;
  if (modifier.slowSpreadCountAdd !== undefined) stats.slowSpreadCount = (stats.slowSpreadCount || 0) + modifier.slowSpreadCountAdd;
  if (modifier.slowSpreadRange !== undefined) stats.slowSpreadRange = modifier.slowSpreadRange;
  if (modifier.slowSpreadRangeAdd !== undefined) stats.slowSpreadRange = (stats.slowSpreadRange || 0) + modifier.slowSpreadRangeAdd;
  if (modifier.splashHitsGround !== undefined) stats.splashHitsGround = modifier.splashHitsGround;
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
  const specialization = tower.specialization ? evolution?.forks?.[tower.specialization] : null;
  const finalForm = tower.finalForm ? specialization?.final || evolution?.final : null;
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
    burnDuration: base.burnDuration ? base.burnDuration + (tower.level - 1) * 0.12 : 0,
  };
  if (!evolution) return stats;

  stats.name = `${base.name}: ${evolution.name}`;
  stats.glyph = evolution.glyph || stats.glyph;
  applyStatModifier(stats, evolution);
  if (specialization) {
    stats.name = `${base.name}: ${specialization.name}`;
    stats.glyph = specialization.glyph || stats.glyph;
    applyStatModifier(stats, specialization);
  }
  if (finalForm) {
    stats.name = `${base.name}: ${finalForm.name}`;
    stats.glyph = finalForm.glyph || stats.glyph;
    applyStatModifier(stats, finalForm);
  }
  return stats;
}

function upgradeCost(tower) {
  const towerCost = towerTypes[tower.type].cost;
  const levelMultipliers = {
    1: 0.85,
    2: 1.1,
    3: 1.35,
    4: 1.7,
    5: 2.05,
    6: 2.4,
    7: 2.75,
    8: 3.15,
    9: 3.6,
    10: 4.1,
    11: 4.65,
  };
  return Math.round(towerCost * (levelMultipliers[tower.level] || 5.2));
}

function evolutionCost(tower) {
  const towerCost = towerTypes[tower.type].cost;
  return Math.round(towerCost * 2.6);
}

function specializationCost(tower) {
  const towerCost = towerTypes[tower.type].cost;
  return Math.round(towerCost * 4.2);
}

function finalFormCost(tower) {
  const towerCost = towerTypes[tower.type].cost;
  return Math.round(towerCost * 10.5);
}

function sellValue(tower) {
  const refundRate = towerTypes[tower.type]?.bank ? 0.5 : 0.68;
  return Math.floor(tower.spent * refundRate);
}

function towerDps(tower) {
  return (tower.waveDamage || 0) / Math.max(1, tower.waveSeconds || 0);
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
  const options = evolutions[selectedTower.type];
  const currentEvolution = selectedTower.evolution ? options?.[selectedTower.evolution] : null;
  const hasLevelEightForks = Boolean(currentEvolution?.forks);
  const pendingEvolution = selectedTower.level >= 4 && !selectedTower.evolution && options;
  const pendingSpecialization =
    selectedTower.level >= 8 && selectedTower.evolution && hasLevelEightForks && !selectedTower.specialization;
  const pendingFinal =
    selectedTower.level >= 12 &&
    selectedTower.evolution &&
    !selectedTower.finalForm &&
    (selectedTower.specialization ? currentEvolution?.forks?.[selectedTower.specialization]?.final : currentEvolution?.final);
  const nextUpgradeText =
    selectedTower.level >= 12
      ? pendingFinal
        ? "Level 12 capstone available"
        : "Max level"
      : pendingSpecialization
        ? "Choose a level 8 branch"
        : pendingEvolution
          ? "Choose an evolution"
        : `Upgrade ${cost}g`;
  const extras = [];
  if (stats.melee) extras.push("melee");
  if (stats.bank) extras.push(`stores ${bankIncome(selectedTower)}g/wave`, `stored ${selectedTower.storedGold || 0}g`);
  if (stats.antiAirOnly) extras.push("flying only");
  if (stats.auraSlow || stats.auraDamage) extras.push("aura");
  if (stats.lineStrike) extras.push("line");
  if (stats.shockwave) extras.push("shockwave");
  if (stats.stun) extras.push("stuns");
  if (stats.knockback) extras.push("knockback");
  if (stats.burnDps) extras.push("burns");
  if (stats.bleedDps) extras.push("bleeds");
  if (stats.vulnMult) extras.push("breaks armor");
  if (stats.antiHealMult) extras.push("anti-heal");
  if (stats.bladeStormMult) extras.push("overlap scaling");
  if (stats.cancelSpeedAuraDuration) extras.push("cancels speed aura");
  if (stats.tileBurnDuration) extras.push("fire tiles");
  if (stats.bossPriority) extras.push("boss priority");
  if (stats.airDamageMult) extras.push("anti-air bonus");
  if (stats.bossDamageMult) extras.push("boss bonus");
  if (stats.repeatDamageAdd) extras.push("focus scaling");
  if (stats.executeAirThreshold) extras.push("air execute");
  if (stats.coldPierce) extras.push("pierces cold resist");
  if (stats.slowSpreadCount) extras.push("spreads slow");
  if (stats.multiShot) extras.push(`${stats.multiShot} shots`);
  if (stats.chain) extras.push(`${stats.chainCount} chains`);
  if (stats.splashRadius) extras.push(`${Math.round(stats.splashRadius)} splash`);
  if (stats.slow) extras.push("slows");
  if (selectedTower.finalForm) extras.push("capstone");
  const waveDamage = Math.round(selectedTower.waveDamage || 0);
  const totalDamage = Math.round(selectedTower.totalDamage || 0);
  const dps = towerDps(selectedTower).toFixed(1);
  extras.push(`${dps} DPS`, `${waveDamage} wave dmg`, `${totalDamage} total dmg`);
  ui.selectionTitle.textContent = `${stats.name} L${selectedTower.level}`;
  ui.selectionCopy.textContent = `Damage ${stats.damage}, range ${Math.round(stats.range)}${extras.length ? `, ${extras.join(", ")}` : ""}. ${nextUpgradeText}, sell ${sellValue(selectedTower)}g.`;
  ui.upgrade.disabled =
    selectedTower.level >= 12 || pendingEvolution || pendingSpecialization || state.credits < cost;
  ui.sell.disabled = false;

  const canEvolve = pendingEvolution;
  const canSpecialize = pendingSpecialization;
  const canFinal = pendingFinal;
  ui.evolutionPanel.hidden = !(canEvolve || canSpecialize || canFinal);
  ui.evolutionButtons.forEach((button) => {
    if (canFinal) {
      const final = selectedTower.specialization
        ? currentEvolution.forks[selectedTower.specialization].final
        : currentEvolution.final;
      const cost = finalFormCost(selectedTower);
      button.hidden = button.dataset.evolution !== "a";
      button.disabled = state.credits < cost;
      button.textContent = `${final.name}: ${final.desc} (${cost}g)`;
      return;
    }
    const option = canSpecialize ? currentEvolution?.forks?.[button.dataset.evolution] : options?.[button.dataset.evolution];
    const cost = canSpecialize ? specializationCost(selectedTower) : evolutionCost(selectedTower);
    button.hidden = false;
    button.disabled = !(canEvolve || canSpecialize) || !option || state.credits < cost;
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

function recordTestGoldGlitchBuy(type) {
  if (selectedRace !== "human" || state.testGoldGlitch.unlocked) return;
  if (type === "guard") {
    state.testGoldGlitch.guardBuys += 1;
    return;
  }
  if (type === "dart" && state.testGoldGlitch.step === 1) {
    state.testGoldGlitch.step = 2;
  }
}

function recordTestGoldGlitchSell(tower) {
  if (selectedRace !== "human" || state.testGoldGlitch.unlocked) return false;
  if (tower.type !== "guard") return false;
  if (state.testGoldGlitch.step === 0 && state.testGoldGlitch.guardBuys >= 2) {
    state.testGoldGlitch.step = 1;
    return false;
  }
  if (state.testGoldGlitch.step === 2) {
    state.testGoldGlitch.unlocked = true;
    state.credits += 999999;
    return true;
  }
  return false;
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
  recordTestGoldGlitchBuy(selectedBuild);
  selectedTower = tower;
  refreshPath();
  ui.banner.textContent = `${towerDef.name} holds the line.`;
  updateHud();
}

function timedDebuffScore(enemy, stats) {
  let score = 0;
  if (stats.slow && isSlowed(enemy)) score += 1;
  if (stats.burnDps && enemy.burnTime > 0) score += 1;
  if (stats.bleedDps && enemy.bleedTime > 0) score += 1;
  if (stats.vulnMult && enemy.vulnTime > 0) score += 1;
  if (stats.antiHealMult && enemy.antiHealTime > 0) score += 1;
  if (stats.stun && enemy.stunTime > 0) score += 1;
  if (stats.cancelSpeedAuraDuration && enemy.speedAuraSuppressedTime > 0) score += 1;
  return score;
}

function prefersFreshTimedDebuff(stats) {
  const appliesTimedDebuff =
    stats.slow ||
    stats.burnDps ||
    stats.bleedDps ||
    stats.vulnMult ||
    stats.antiHealMult ||
    stats.stun ||
    stats.cancelSpeedAuraDuration;
  return (
    appliesTimedDebuff &&
    !stats.auraSlow &&
    !stats.auraDamage &&
    !stats.splashRadius &&
    !stats.chain &&
    !stats.lineStrike &&
    !stats.melee &&
    !stats.shockwave
  );
}

function fireTower(tower) {
  const stats = towerStats(tower);
  if (stats.bank) return;
  const prefersFreshDebuff = prefersFreshTimedDebuff(stats);
  const targets = state.enemies
    .filter(
      (enemy) =>
        dist(tower, enemy) <= stats.range &&
        (!stats.antiAirOnly || enemy.flying) &&
        (!stats.groundOnly || !enemy.flying),
    )
    .sort(
      (a, b) =>
        (stats.bossPriority ? Number(b.boss) - Number(a.boss) : 0) ||
        (prefersFreshDebuff ? timedDebuffScore(a, stats) - timedDebuffScore(b, stats) : 0) ||
        enemyProgress(b) - enemyProgress(a),
    );

  const target = targets[0];
  if (!target) return;

  tower.cooldown = stats.fireRate;
  if (stats.auraSlow) {
    for (const enemy of targets) {
      applyDamage(enemy, stats.damage, tower);
      if (state.enemies.includes(enemy)) applySlow(enemy, stats.slowDuration || 1.4, tower.id, stats.coldPierce || 0);
      if (stats.cancelSpeedAuraDuration && state.enemies.includes(enemy)) {
        enemy.speedAuraSuppressedTime = Math.max(enemy.speedAuraSuppressedTime || 0, stats.cancelSpeedAuraDuration);
      }
      if (stats.stun && state.enemies.includes(enemy)) applyStun(enemy, stats.stunDuration || 0.12);
    }
    state.effects.push({ x: tower.x, y: tower.y, r: stats.range, life: 0.22, color: stats.color });
    return;
  }

  if (stats.auraDamage) {
    for (const enemy of targets) {
      if (stats.vulnMult && state.enemies.includes(enemy)) {
        applyVulnerability(enemy, stats.vulnMult, stats.vulnDuration || 1.4);
      }
      applyDamage(enemy, stats.damage, tower);
      if (stats.burnDps && state.enemies.includes(enemy)) {
        applyBurn(enemy, stats.burnDps, stats.burnDuration || 2, tower);
      }
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
      applyDamage(enemy, Math.max(1, Math.round(scaledTowerDamage(stats, enemy) * distanceMod)), tower);
      if (stats.stun && state.enemies.includes(enemy)) applyStun(enemy, stats.stunDuration || 0.12);
      if (stats.burnDps && state.enemies.includes(enemy)) applyBurn(enemy, stats.burnDps, stats.burnDuration || 2, tower);
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
      applyDamage(enemy, scaledTowerDamage(stats, enemy), tower);
      if (stats.bleedDps && state.enemies.includes(enemy)) {
        applyBleed(enemy, stats.bleedDps, stats.bleedDuration || 3, tower);
      }
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
    const bladeStormCount = stats.bladeStormMult
      ? state.towers.filter((item) => {
          if (item === tower) return false;
          const otherStats = towerStats(item);
          return otherStats.bladeStormMult && dist(item, tower) <= Math.max(stats.range, otherStats.range) + 8;
        }).length
      : 0;
    for (const enemy of meleeTargets) {
      const bladeStormDamage = stats.bladeStormMult
        ? Math.round(scaledTowerDamage(stats, enemy) * (1 + Math.min(4, bladeStormCount) * stats.bladeStormMult))
        : scaledTowerDamage(stats, enemy);
      applyDamage(enemy, bladeStormDamage, tower);
      if (stats.stun && state.enemies.includes(enemy)) applyStun(enemy, stats.stunDuration || 0.25);
      if (stats.knockback && state.enemies.includes(enemy)) applyKnockback(enemy, stats.knockback);
      if (stats.bleedDps && state.enemies.includes(enemy)) applyBleed(enemy, stats.bleedDps, stats.bleedDuration || 3, tower);
      if (stats.antiHealMult && state.enemies.includes(enemy)) applyAntiHeal(enemy, stats.antiHealMult, stats.antiHealDuration || 2);
      state.effects.push({ x: enemy.x, y: enemy.y, r: 18, life: 0.16, color: stats.color });
    }
    return;
  }

  const shots = targets.slice(0, stats.multiShot || 1);
  for (const shotTarget of shots) {
    const repeatStack =
      stats.repeatDamageAdd && tower.focusTargetId === shotTarget.id
        ? Math.min(tower.focusStacks || 0, stats.repeatDamageMax || 8)
        : 0;
    if (stats.repeatDamageAdd) {
      tower.focusTargetId = shotTarget.id;
      tower.focusStacks = tower.focusTargetId === shotTarget.id ? repeatStack + 1 : 1;
    }
    state.projectiles.push({
      x: tower.x,
      y: tower.y,
      startX: tower.x,
      startY: tower.y,
      prevX: tower.x,
      prevY: tower.y,
      target: shotTarget,
      sourceTower: tower,
      towerType: tower.type,
      speed: stats.projectileSpeed,
      travelDistance: Math.max(1, dist(tower, shotTarget)),
      progress: 0,
      arcHeight: ["mortar", "firepot", "crusher"].includes(tower.type) || stats.tileBurnDuration ? 34 : 0,
      damage: stats.damage,
      repeatStack,
      color: stats.color,
      chain: stats.chain,
      chainRange: stats.chainRange,
      chainCount: stats.chainCount,
      splashRadius: stats.splashRadius,
      maxSplashTargets: stats.maxSplashTargets,
      flyingOnlySplash: stats.antiAirOnly && !stats.splashHitsGround,
      slow: stats.slow,
      slowDuration: stats.slowDuration,
      slowSpreadCount: stats.slowSpreadCount,
      slowSpreadRange: stats.slowSpreadRange,
      coldPierce: stats.coldPierce,
      stun: stats.stun,
      stunDuration: stats.stunDuration,
      knockback: stats.knockback,
      airDamageMult: stats.airDamageMult,
      bossDamageMult: stats.bossDamageMult,
      executeAirThreshold: stats.executeAirThreshold,
      repeatDamageAdd: stats.repeatDamageAdd,
      burnDps: stats.burnDps,
      burnDuration: stats.burnDuration,
      bleedDps: stats.bleedDps,
      bleedDuration: stats.bleedDuration,
      tileBurnDuration: stats.tileBurnDuration,
      tileBurnDps: stats.tileBurnDps,
      tileBurnRadius: stats.tileBurnRadius,
    });
  }
}

function damageSourceTower(source) {
  const tower = source?.sourceTower || source?.tower || source;
  return state.towers.includes(tower) ? tower : null;
}

function creditTowerDamage(source, amount) {
  const tower = damageSourceTower(source);
  if (!tower || amount <= 0) return;
  tower.waveDamage = (tower.waveDamage || 0) + amount;
  tower.totalDamage = (tower.totalDamage || 0) + amount;
}

function applyDamage(enemy, amount, source = null) {
  if (amount <= 0) return;
  const damage = amount * (enemy.vulnTime > 0 ? enemy.vulnMult || 1 : 1);
  const dealt = Math.max(0, Math.min(enemy.hp, damage));
  enemy.hp -= damage;
  creditTowerDamage(source, dealt);
  state.effects.push({ x: enemy.x, y: enemy.y, r: 4, life: 0.25, color: "#ffffff" });
  if (enemy.hp <= 0) {
    spawnDeathChildren(enemy);
    state.credits += enemy.reward;
    state.score += enemy.reward * 12;
    state.enemies = state.enemies.filter((item) => item !== enemy);
  }
}

function scaledTowerDamage(stats, enemy, repeatStack = 0) {
  let damage = stats.damage;
  if (enemy.flying && stats.airDamageMult) damage *= stats.airDamageMult;
  if (enemy.boss && stats.bossDamageMult) damage *= stats.bossDamageMult;
  if (stats.repeatDamageAdd && repeatStack) damage *= 1 + Math.min(repeatStack, stats.repeatDamageMax || 8) * stats.repeatDamageAdd;
  return Math.max(1, Math.round(damage));
}

function applyKnockback(enemy, distance) {
  if (!enemy.path?.length || distance <= 0 || enemy.flying) return;
  const bossMod = enemy.boss ? 0.35 : 1;
  let remaining = distance * bossMod;
  while (remaining > 0) {
    const index = Math.max(0, enemy.targetIndex - 2);
    const target = enemy.path[index];
    if (!target) return;
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const step = Math.hypot(dx, dy);
    if (step <= remaining || step < 1) {
      enemy.x = target.x;
      enemy.y = target.y;
      enemy.targetIndex = Math.max(1, index + 1);
      remaining -= step;
      if (index === 0) return;
    } else {
      enemy.x += (dx / step) * remaining;
      enemy.y += (dy / step) * remaining;
      return;
    }
  }
}

function spawnDeathChildren(enemy) {
  if (!enemy.deathSpawnType || !enemy.deathSpawnCount) return;
  const childCount = enemy.deathSpawnCount;
  const baseHp = Math.max(18, Math.round(enemy.maxHp * 0.16));
  const baseReward = Math.max(1, Math.round(enemy.reward * 0.12));
  for (let i = 0; i < childCount; i += 1) {
    const angle = (Math.PI * 2 * i) / childCount + 0.35;
    const offset = 9 + i * 2;
    const child = makeEnemy(enemy.deathSpawnType, {
      x: enemy.x + Math.cos(angle) * offset,
      y: enemy.y + Math.sin(angle) * offset,
      path: enemy.path,
      targetIndex: enemy.targetIndex,
      hp: baseHp,
      maxHp: baseHp,
      speed: enemy.speed * 1.22,
      reward: baseReward,
      radius: 9,
      name: "Bone Spawn",
      glyph: "s",
      deathSpawnType: null,
      deathSpawnCount: 0,
      slowTime: 0,
      slowSources: {},
      burnTime: 0,
      burnDps: 0,
      bleedTime: 0,
      bleedDps: 0,
      vulnTime: 0,
      vulnMult: 1,
      stunTime: 0,
    });
    state.enemies.push(child);
  }
  state.effects.push({ x: enemy.x, y: enemy.y, r: 26, life: 0.24, color: "#d9d1bd" });
}

function applySlow(enemy, duration, sourceId = null, coldPierce = 0) {
  const resist = Math.min(1, (enemy.coldResist || 1) + coldPierce);
  const resistedDuration = duration * resist;
  if (coldPierce > 0) {
    enemy.coldPierceEffect = Math.max(enemy.coldPierceEffect || 0, coldPierce);
    enemy.coldPierceTime = Math.max(enemy.coldPierceTime || 0, resistedDuration);
  }
  if (sourceId !== null) {
    enemy.slowSources = enemy.slowSources || {};
    enemy.slowSources[sourceId] = Math.max(enemy.slowSources[sourceId] || 0, resistedDuration);
    return;
  }
  enemy.slowTime = Math.max(enemy.slowTime, resistedDuration);
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

function isSlowed(enemy) {
  return enemy.slowTime > 0 || Object.keys(enemy.slowSources || {}).length > 0;
}

function applyStun(enemy, duration) {
  const bossMod = enemy.boss ? 0.35 : 1;
  enemy.stunTime = Math.max(enemy.stunTime || 0, duration * bossMod);
}

function applyBurn(enemy, dps, duration, source = null) {
  if (dps >= (enemy.burnDps || 0)) enemy.burnSource = source;
  enemy.burnDps = Math.max(enemy.burnDps || 0, dps);
  enemy.burnTime = Math.max(enemy.burnTime || 0, duration);
}

function applyBleed(enemy, dps, duration, source = null) {
  if (dps >= (enemy.bleedDps || 0)) enemy.bleedSource = source;
  enemy.bleedDps = Math.max(enemy.bleedDps || 0, dps);
  enemy.bleedTime = Math.max(enemy.bleedTime || 0, duration);
}

function applyVulnerability(enemy, multiplier, duration) {
  enemy.vulnMult = Math.max(enemy.vulnMult || 1, multiplier);
  enemy.vulnTime = Math.max(enemy.vulnTime || 0, duration);
}

function healEnemy(enemy, amount, source) {
  if (amount <= 0 || enemy.hp >= enemy.maxHp) return;
  const healed = amount * (enemy.antiHealTime > 0 ? enemy.antiHealMult || 1 : 1);
  enemy.hp = Math.min(enemy.maxHp, enemy.hp + healed);
  state.effects.push({ x: enemy.x, y: enemy.y, r: 10, life: 0.18, color: source?.color || "#9fe3a1" });
}

function applyAntiHeal(enemy, multiplier, duration) {
  enemy.antiHealMult = Math.min(enemy.antiHealMult || 1, multiplier);
  enemy.antiHealTime = Math.max(enemy.antiHealTime || 0, duration);
}

function updateSupportEnemies(dt) {
  for (const support of [...state.enemies]) {
    if (!state.enemies.includes(support)) continue;
    if (support.healAuraDps) {
      for (const ally of state.enemies) {
        if (ally !== support && !ally.flying && dist(support, ally) <= support.healRadius) {
          healEnemy(ally, support.healAuraDps * dt, support);
        }
      }
      support.healFxCooldown = Math.max(0, (support.healFxCooldown || 0) - dt);
      if (support.healFxCooldown <= 0) {
        state.effects.push({ x: support.x, y: support.y, r: support.healRadius, life: 0.16, color: "#9fe3a1" });
        support.healFxCooldown = 0.28;
      }
    } else if (support.healAmount) {
      support.healCooldown = Math.max(0, (support.healCooldown || 0) - dt);
      if (support.healCooldown <= 0) {
        const target = state.enemies
          .filter((enemy) => enemy !== support && !enemy.flying && enemy.hp < enemy.maxHp && dist(support, enemy) <= support.healRadius)
          .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
        if (target) {
          healEnemy(target, support.healAmount, support);
          state.effects.push({ x: support.x, y: support.y, r: support.healRadius, life: 0.12, color: "#9fe3a1" });
        }
        support.healCooldown = support.healRate;
      }
    }
  }
}

function speedAuraMultiplier(enemy) {
  let multiplier = 1;
  for (const support of state.enemies) {
    if (support === enemy || !support.speedAuraRadius) continue;
    if (support.speedAuraSuppressedTime > 0) continue;
    if (dist(support, enemy) <= support.speedAuraRadius) {
      multiplier = Math.max(multiplier, support.speedAuraMult || 1);
    }
  }
  return multiplier;
}

function resolveProjectileHit(projectile, target) {
  const impact = { x: target.x, y: target.y };
  const hitEnemies = projectile.splashRadius
    ? state.enemies.filter(
        (enemy) => dist(enemy, impact) <= projectile.splashRadius && (!projectile.flyingOnlySplash || enemy.flying),
      )
      .sort((a, b) => dist(a, impact) - dist(b, impact))
      .slice(0, projectile.maxSplashTargets || state.enemies.length)
    : [target];

  for (const enemy of hitEnemies) {
    const distanceMod = projectile.splashRadius
      ? 1 - clamp(dist(enemy, impact) / projectile.splashRadius, 0, 0.62)
      : 1;
    const damage = scaledTowerDamage(projectile, enemy, projectile.repeatStack) * distanceMod;
    applyDamage(enemy, Math.max(1, Math.round(damage)), projectile);
    if (projectile.slow && state.enemies.includes(enemy)) {
      applySlow(enemy, projectile.slowDuration || 1.4, null, projectile.coldPierce || 0);
    }
    if (projectile.stun && state.enemies.includes(enemy)) {
      applyStun(enemy, projectile.stunDuration || 0.2);
    }
    if (projectile.knockback && state.enemies.includes(enemy)) {
      applyKnockback(enemy, projectile.knockback);
    }
    if (
      projectile.executeAirThreshold &&
      enemy.flying &&
      state.enemies.includes(enemy) &&
      enemy.hp / enemy.maxHp <= projectile.executeAirThreshold
    ) {
      applyDamage(enemy, enemy.hp + 1, projectile);
    }
    if (projectile.burnDps && state.enemies.includes(enemy)) {
      applyBurn(enemy, projectile.burnDps, projectile.burnDuration || 2, projectile);
    }
    if (projectile.bleedDps && state.enemies.includes(enemy)) {
      applyBleed(enemy, projectile.bleedDps, projectile.bleedDuration || 3, projectile);
    }
  }

  if (projectile.slowSpreadCount && state.enemies.includes(target)) {
    const spreadTargets = state.enemies
      .filter(
        (enemy) =>
          enemy !== target &&
          dist(enemy, target) <= (projectile.slowSpreadRange || 74) &&
          enemy.slowTime <= 0 &&
          Object.keys(enemy.slowSources || {}).length === 0,
      )
      .sort((a, b) => dist(a, target) - dist(b, target))
      .slice(0, projectile.slowSpreadCount);
    for (const enemy of spreadTargets) {
      applySlow(enemy, projectile.slowDuration || 1.4, null, projectile.coldPierce || 0);
      state.effects.push({ x: enemy.x, y: enemy.y, r: 16, life: 0.18, color: projectile.color });
    }
  }

  if (projectile.chain) {
    const chained = state.enemies
      .filter((enemy) => enemy !== target && dist(enemy, target) < projectile.chainRange)
      .sort((a, b) => dist(a, target) - dist(b, target))
      .slice(0, projectile.chainCount);
    for (const enemy of chained) {
      applyDamage(enemy, Math.round(scaledTowerDamage(projectile, enemy) * 0.55), projectile);
      if (projectile.stun && state.enemies.includes(enemy)) {
        applyStun(enemy, (projectile.stunDuration || 0.2) * 0.65);
      }
      state.effects.push({ x: enemy.x, y: enemy.y, r: 18, life: 0.18, color: projectile.color });
    }
  }

  const burstRadius = projectile.splashRadius || 22;
  state.effects.push({ x: impact.x, y: impact.y, r: burstRadius * 0.35, life: 0.22, color: projectile.color });
  if (projectile.tileBurnDuration && projectile.tileBurnDps) {
    state.fireTiles.push({
      x: impact.x,
      y: impact.y,
      r: projectile.tileBurnRadius || 34,
      dps: projectile.tileBurnDps,
      duration: projectile.tileBurnDuration,
      life: projectile.tileBurnDuration,
      color: projectile.color,
      sourceTower: projectile.sourceTower,
    });
  }
}

function updateEnemies(dt) {
  updateSupportEnemies(dt);

  for (const enemy of [...state.enemies]) {
    if (!enemy.path.length) {
      enemy.path = currentPath;
      enemy.targetIndex = nearestPathIndex(enemy, enemy.path);
    }

    if (enemy.burnTime > 0) {
      applyDamage(enemy, enemy.burnDps * dt, enemy.burnSource);
      if (!state.enemies.includes(enemy)) continue;
      enemy.burnTime = Math.max(0, enemy.burnTime - dt);
      if (enemy.burnTime <= 0) {
        enemy.burnDps = 0;
        enemy.burnSource = null;
      }
    }
    if (enemy.bleedTime > 0) {
      applyDamage(enemy, enemy.bleedDps * dt, enemy.bleedSource);
      if (!state.enemies.includes(enemy)) continue;
      enemy.bleedTime = Math.max(0, enemy.bleedTime - dt);
      if (enemy.bleedTime <= 0) {
        enemy.bleedDps = 0;
        enemy.bleedSource = null;
      }
    }
    for (const fireTile of state.fireTiles) {
      if (dist(enemy, fireTile) <= fireTile.r && !enemy.flying) {
        applyBurn(enemy, fireTile.dps, 1.1, fireTile.sourceTower);
        break;
      }
    }

    const stunned = enemy.stunTime > 0;
    const auraSlowStacks = updateSlowSources(enemy, dt);
    const cappedAuraStacks = Math.min(auraSlowStacks, 2);
    const slowEffect = Math.min(1, (enemy.coldResist || 1) + (enemy.coldPierceTime > 0 ? enemy.coldPierceEffect || 0 : 0));
    const auraSlowMod = cappedAuraStacks ? 1 - cappedAuraStacks * 0.32 * slowEffect : 1;
    const projectileSlowMod = enemy.slowTime > 0 ? 1 - 0.52 * slowEffect : 1;
    const slowMod = Math.min(auraSlowMod, projectileSlowMod);
    enemy.slowTime = Math.max(0, enemy.slowTime - dt);
    enemy.coldPierceTime = Math.max(0, (enemy.coldPierceTime || 0) - dt);
    if (enemy.coldPierceTime <= 0) enemy.coldPierceEffect = 0;
    enemy.stunTime = Math.max(0, (enemy.stunTime || 0) - dt);
    enemy.vulnTime = Math.max(0, (enemy.vulnTime || 0) - dt);
    if (enemy.vulnTime <= 0) enemy.vulnMult = 1;
    enemy.antiHealTime = Math.max(0, (enemy.antiHealTime || 0) - dt);
    if (enemy.antiHealTime <= 0) enemy.antiHealMult = 1;
    enemy.speedAuraSuppressedTime = Math.max(0, (enemy.speedAuraSuppressedTime || 0) - dt);
    if (stunned) continue;
    let move = enemy.speed * slowMod * speedAuraMultiplier(enemy) * dt;

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
      projectile.progress = 1;
      resolveProjectileHit(projectile, projectile.target);
      state.projectiles = state.projectiles.filter((item) => item !== projectile);
    } else {
      projectile.prevX = projectile.x;
      projectile.prevY = projectile.y;
      projectile.x += (dx / distance) * step;
      projectile.y += (dy / distance) * step;
      projectile.progress = Math.min(1, (projectile.progress || 0) + step / (projectile.travelDistance || distance));
    }
  }
}

function update(dt) {
  if (paused || ended) return;

  if (waveActive) {
    state.waveTime += dt;
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
      let bankGold = 0;
      for (const tower of state.towers.filter((tower) => towerTypes[tower.type]?.bank)) {
        const income = bankIncome(tower);
        tower.storedGold = (tower.storedGold || 0) + income;
        bankGold += income;
      }
      state.wave += 1;
      const clearGold = scaledGold(32 + state.wave * 5);
      state.credits += clearGold;
      ui.banner.textContent = `Wave cleared. Build for wave ${state.wave}.${bankGold ? ` Banks stored ${bankGold}g.` : ""}`;
      ui.start.disabled = false;
      updateWavePreview();
    }
  }

  for (const tower of state.towers) {
    if (waveActive) tower.waveSeconds = (tower.waveSeconds || 0) + dt;
    tower.cooldown -= dt;
    if (tower.cooldown <= 0) fireTower(tower);
  }

  updateEnemies(dt);
  updateProjectiles(dt);
  for (const fireTile of state.fireTiles) {
    fireTile.life -= dt;
  }
  state.fireTiles = state.fireTiles.filter((fireTile) => fireTile.life > 0);
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

  for (const fireTile of state.fireTiles) {
    ctx.globalAlpha = clamp(fireTile.life / fireTile.duration, 0.15, 0.45);
    ctx.fillStyle = "#ff8b3d";
    ctx.beginPath();
    ctx.arc(fireTile.x, fireTile.y, fireTile.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = "rgba(12,18,11,0.22)";
  ctx.fillRect(0, 0, W, 12);
  ctx.fillRect(0, H - 12, W, 12);
}

function drawSoftShadow(x, y, width, height, alpha = 0.28) {
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 5, width, height, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
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
  ctx.strokeStyle = "rgba(8,10,7,0.32)";
  ctx.lineWidth = 34;
  ctx.beginPath();
  currentPath.forEach((point, i) => (i ? ctx.lineTo(point.x, point.y + 4) : ctx.moveTo(point.x, point.y + 4)));
  ctx.stroke();
  ctx.strokeStyle = "rgba(35,24,14,0.62)";
  ctx.lineWidth = 32;
  ctx.beginPath();
  currentPath.forEach((point, i) => (i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
  ctx.stroke();
  ctx.strokeStyle = "rgba(62,43,27,0.55)";
  ctx.lineWidth = 28;
  ctx.beginPath();
  currentPath.forEach((point, i) => (i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
  ctx.stroke();
  ctx.strokeStyle = "rgba(157,113,63,0.72)";
  ctx.lineWidth = 18;
  ctx.stroke();
  ctx.strokeStyle = "rgba(213,166,92,0.18)";
  ctx.lineWidth = 11;
  ctx.setLineDash([4, 14]);
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
    "     c     ",
    "    ccc    ",
    "   cchcc   ",
    "    hhh    ",
    "   bgbgb   ",
    "  bbgggbb  ",
    "    ggg b  ",
    "   yy yy   ",
    "  b y y b  ",
    " b       b ",
    "           ",
  ],
  guard: [
    "    sss    ",
    "   swwws   ",
    "  sswwwss  ",
    "  swbwbws  ",
    "   wwwww   ",
    "  ssbbbss  ",
    "   bbbbb   ",
    "   y y y   ",
    "  s y y s  ",
    " s       s ",
    "           ",
  ],
  ballista: [
    " w       w ",
    "  w     w  ",
    "   w c w   ",
    "sssswssssss",
    "  bbbbbb   ",
    " yyyyyyyyy ",
    "  bb   bb  ",
    " b       b ",
    "           ",
  ],
  sky: [
    "     c     ",
    "    cwc    ",
    "   cwwwc   ",
    "  cwwwwwc  ",
    " b  www  b ",
    "bb  yyy  bb",
    "   yyyyy   ",
    "  b y y b  ",
    " b       b ",
    "           ",
  ],
  mage: [
    "     c     ",
    "    ccc    ",
    "   cchcc   ",
    "    hhh    ",
    "  mmmmmmm  ",
    "  mmmsmmm  ",
    "   mmmmm   ",
    "    y y    ",
    "   s   s   ",
    "  s     s  ",
    "           ",
  ],
  catapult: [
    "     w     ",
    "    www    ",
    "   wwwww   ",
    "     w     ",
    "  bbbbbbb  ",
    " byyyyyyyb ",
    "  yyyyyyy  ",
    " bb     bb ",
    " b       b ",
    "           ",
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

function shadeColor(hex, amount) {
  const color = hex.replace("#", "");
  const value = Number.parseInt(color.length === 3 ? color.split("").map((char) => char + char).join("") : color, 16);
  const r = clamp((value >> 16) + amount, 0, 255);
  const g = clamp(((value >> 8) & 255) + amount, 0, 255);
  const b = clamp((value & 255) + amount, 0, 255);
  return `rgb(${r},${g},${b})`;
}

function drawIsoPixelSprite(pattern, x, y, scale, palette, flip = false) {
  const height = pattern.length;
  const width = pattern[0].length;
  const originX = x - (width * scale) / 2;
  const originY = y - (height * scale) / 2;
  const depthX = Math.max(1, Math.round(scale * 0.55));
  const depthY = Math.max(1, Math.round(scale * 0.55));

  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(x + 4, y + height * scale * 0.44, width * scale * 0.45, scale * 1.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  for (let row = height - 1; row >= 0; row -= 1) {
    for (let col = width - 1; col >= 0; col -= 1) {
      const sourceCol = flip ? width - 1 - col : col;
      const key = pattern[row][sourceCol];
      const color = palette[key];
      if (!color) continue;
      if (row < Math.floor(height * 0.48)) continue;
      const px = Math.round(originX + col * scale);
      const py = Math.round(originY + row * scale);
      ctx.fillStyle = "rgba(0,0,0,0.34)";
      ctx.fillRect(px + depthX, py + depthY, scale, scale);
      if (row >= Math.floor(height * 0.42)) {
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.fillRect(px + depthX, py + depthY + scale - 1, scale, Math.max(1, Math.round(scale * 0.55)));
      }
    }
  }

  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const sourceCol = flip ? width - 1 - col : col;
      const key = pattern[row][sourceCol];
      const color = palette[key];
      if (!color) continue;
      const px = Math.round(originX + col * scale);
      const py = Math.round(originY + row * scale - col * 0.14);
      ctx.fillStyle = color;
      ctx.fillRect(px, py, scale, scale);
      if (row <= 2) {
        ctx.fillStyle = shadeColor(color, 42);
        ctx.fillRect(px, py, scale, Math.max(1, Math.round(scale * 0.35)));
      }
      if (col >= Math.floor(width * 0.58)) {
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(px + scale - 1, py, 1, scale);
      }
    }
  }
}

function drawTowerFootprint(tower, stats, active) {
  ctx.save();
  ctx.fillStyle = active ? "rgba(244,201,93,0.16)" : "rgba(0,0,0,0.18)";
  ctx.strokeStyle = active ? "rgba(244,201,93,0.76)" : `${stats.color}66`;
  ctx.lineWidth = active ? 3 : 2;
  ctx.beginPath();
  ctx.moveTo(tower.x, tower.y + 4);
  ctx.lineTo(tower.x + 15, tower.y + 11);
  ctx.lineTo(tower.x + 2, tower.y + 18);
  ctx.lineTo(tower.x - 15, tower.y + 11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function branchAccentColor(tower, stats) {
  if (tower.finalForm) return "#fff6df";
  if (tower.specialization === "a") return "#91ddec";
  if (tower.specialization === "b") return "#ff8b3d";
  if (tower.evolution === "a") return shadeColor(stats.color, 52);
  if (tower.evolution === "b") return "#d9a441";
  return stats.color;
}

function drawTowerUpgradeDetails(tower, stats) {
  const accent = branchAccentColor(tower, stats);
  const ringCount = tower.finalForm ? 4 : tower.specialization ? 3 : tower.evolution ? 2 : tower.level >= 4 ? 1 : 0;
  if (!ringCount) return;
  ctx.save();
  for (let i = 0; i < ringCount; i += 1) {
    const pulse = tower.finalForm && i === ringCount - 1 ? Math.sin(animTime * 5) * 0.08 : 0;
    ctx.globalAlpha = 0.46 + i * 0.09 + pulse;
    ctx.strokeStyle = i % 2 === 0 ? accent : "#fff6df";
    ctx.lineWidth = tower.finalForm && i === ringCount - 1 ? 3 : 2;
    ctx.beginPath();
    ctx.ellipse(tower.x + 1, tower.y + 10, 12 + i * 3.5, 4.5 + i * 1.3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTowerFinalFlair(tower, stats) {
  if (!tower.finalForm) return;
  const accent = branchAccentColor(tower, stats);
  ctx.save();
  ctx.globalAlpha = 0.18 + Math.sin(animTime * 4.5) * 0.04;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(tower.x + 1, tower.y - 6, 19, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#f4c95d";
  ctx.strokeStyle = "#101216";
  ctx.lineWidth = 1;
  const crownY = tower.y - 27;
  ctx.beginPath();
  ctx.moveTo(tower.x - 8, crownY + 6);
  ctx.lineTo(tower.x - 8, crownY);
  ctx.lineTo(tower.x - 3, crownY + 4);
  ctx.lineTo(tower.x + 1, crownY - 3);
  ctx.lineTo(tower.x + 5, crownY + 4);
  ctx.lineTo(tower.x + 10, crownY);
  ctx.lineTo(tower.x + 10, crownY + 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
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
  const slowed = isSlowed(enemy);
  const color = enemy.stunTime > 0 ? "#f4c95d" : slowed ? "#b8f5ff" : enemy.burnTime > 0 ? "#ff8b3d" : enemy.antiHealTime > 0 ? "#78e08f" : enemy.bleedTime > 0 ? "#ff6f8e" : enemy.vulnTime > 0 ? "#d9a441" : enemy.color;
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
  drawSoftShadow(tower.x, tower.y + 17, 19, 7, active ? 0.42 : 0.3);
  drawTowerFootprint(tower, stats, active);

  if (stats.bank) {
    ctx.fillStyle = shadeColor(stats.color, -96);
    ctx.beginPath();
    ctx.moveTo(tower.x - 12, tower.y - 1);
    ctx.lineTo(tower.x, tower.y - 9);
    ctx.lineTo(tower.x + 13, tower.y - 2);
    ctx.lineTo(tower.x + 13, tower.y + 13);
    ctx.lineTo(tower.x - 12, tower.y + 13);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#101216";
    ctx.fillRect(tower.x - 9, tower.y - 2, 20, 17);
    ctx.strokeStyle = "#f0c14b";
    ctx.lineWidth = 2;
    ctx.strokeRect(tower.x - 9, tower.y - 2, 20, 17);
    ctx.fillStyle = "#f0c14b";
    ctx.font = "900 18px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", tower.x, tower.y + 1);
  } else {
    const bob = Math.sin(animTime * 3.2 + tower.col * 0.7 + tower.row * 0.4) * 1.2;
    const spriteScale = tower.finalForm ? 2.9 : tower.specialization ? 2.9 : tower.evolution ? 2.65 : tower.level >= 4 ? 2.35 : 2;
    drawIsoPixelSprite(spritePatterns[defenderSprite(tower, stats)], tower.x, tower.y - 9 + bob, spriteScale, defenderPalette(stats, tower));
    if (tower.level >= 4 || tower.evolution) drawTowerUpgradeDetails(tower, stats);
    drawTowerFinalFlair(tower, stats);
  }

  ctx.fillStyle = "#101216";
  ctx.font = "700 11px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(tower.level, tower.x + 12, tower.y + 13);
  ctx.restore();
}

function drawSelectedRange() {
  if (!selectedTower) return;
  const stats = towerStats(selectedTower);
  if (!stats.range) return;
  ctx.save();
  ctx.fillStyle = "rgba(244,201,93,0.08)";
  ctx.strokeStyle = "rgba(244,201,93,0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(selectedTower.x, selectedTower.y, stats.range, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
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

  if (
    enemy.name === "Fallen Knight" ||
    enemy.name === "Siege Lord" ||
    enemy.name === "Bone Carrier" ||
    enemy.name === "Bone Tyrant" ||
    enemy.name === "Frost Lord" ||
    enemy.name === "High Priest" ||
    enemy.name === "War Herald"
  ) {
    drawPixelSprite(spritePatterns.knight, enemy.x, enemy.y - 2 + bob, enemy.boss ? 4 : 3, enemyPalette(enemy));
    return;
  }

  drawPixelSprite(spritePatterns.skeleton, enemy.x, enemy.y - 2 + bob, 3, enemyPalette(enemy));
}

function drawEnemies(enemies = state.enemies) {
  for (const enemy of enemies) {
    if (enemy.healRadius || enemy.speedAuraRadius) {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = enemy.healRadius ? "#9fe3a1" : "#f05f45";
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.healRadius || enemy.speedAuraRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    drawSoftShadow(enemy.x, enemy.y + enemy.radius + 3, enemy.radius * 0.95, enemy.flying ? 6 : 4, enemy.flying ? 0.16 : 0.28);
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

function drawProjectile(projectile) {
    const arcHeight = projectile.arcHeight || 0;
    const height = arcHeight * Math.sin((projectile.progress || 0) * Math.PI);
    const drawY = projectile.y - height;
    const prevProgress = Math.max(0, (projectile.progress || 0) - 0.04);
    const prevHeight = arcHeight * Math.sin(prevProgress * Math.PI);
    const prevY = (projectile.prevY ?? projectile.y) - prevHeight;
    if (arcHeight) drawSoftShadow(projectile.x, projectile.y + 4, 5, 2, 0.18);
    ctx.strokeStyle = projectile.color;
    ctx.globalAlpha = 0.58;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(projectile.prevX ?? projectile.x, prevY);
    ctx.lineTo(projectile.x, drawY);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = projectile.color;
    ctx.beginPath();
    ctx.arc(projectile.x, drawY, arcHeight ? 5 : 4, 0, Math.PI * 2);
    ctx.fill();
}

function drawProjectiles() {
  for (const projectile of state.projectiles) {
    drawProjectile(projectile);
  }
}

function drawWorldObjects() {
  const objects = [
    ...state.towers.map((tower) => ({ kind: "tower", y: tower.y + 11, item: tower })),
    ...state.enemies.map((enemy) => ({ kind: "enemy", y: enemy.y + enemy.radius, item: enemy })),
    ...state.projectiles.map((projectile) => ({ kind: "projectile", y: projectile.y, item: projectile })),
  ].sort((a, b) => a.y - b.y);

  for (const object of objects) {
    if (object.kind === "tower") drawTower(object.item);
    if (object.kind === "enemy") drawEnemies([object.item]);
    if (object.kind === "projectile") drawProjectile(object.item);
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
  if (stats.range) {
    ctx.arc(center.x, center.y, stats.range, 0, Math.PI * 2);
    ctx.fill();
  }
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
  drawSelectedRange();
  drawWorldObjects();
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
    .replace("Royal Bank", "Bank")
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
  const options = evolutions[selectedTower.type];
  const evolution = selectedTower.evolution ? evolutions[selectedTower.type]?.[selectedTower.evolution] : null;
  const needsEvolution = selectedTower.level >= 4 && !selectedTower.evolution && options;
  const needsSpecialization = selectedTower.level >= 8 && evolution?.forks && !selectedTower.specialization;
  if (selectedTower.level >= 12 || needsEvolution || needsSpecialization || state.credits < cost) return;
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

function trySpecializeSelected(specializationKey) {
  if (!selectedTower || selectedTower.level < 8 || !selectedTower.evolution || selectedTower.specialization) return;
  const option = evolutions[selectedTower.type]?.[selectedTower.evolution]?.forks?.[specializationKey];
  if (!option) return;
  const cost = specializationCost(selectedTower);
  if (state.credits < cost) return;
  state.credits -= cost;
  selectedTower.spent += cost;
  selectedTower.specialization = specializationKey;
  ui.banner.textContent = `${towerTypes[selectedTower.type].name} chose ${option.name} for ${cost}g.`;
  updateHud();
}

function tryFinalFormSelected() {
  if (!selectedTower || selectedTower.level < 12 || !selectedTower.evolution || selectedTower.finalForm) return;
  const evolution = evolutions[selectedTower.type]?.[selectedTower.evolution];
  const final = selectedTower.specialization ? evolution?.forks?.[selectedTower.specialization]?.final : evolution?.final;
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
  const storedGold = towerTypes[selectedTower.type]?.bank ? selectedTower.storedGold || 0 : 0;
  const goldGlitched = recordTestGoldGlitchSell(selectedTower);
  state.credits += sellValue(selectedTower) + storedGold;
  state.towers = state.towers.filter((tower) => tower !== selectedTower);
  selectedTower = null;
  refreshPath();
  ui.banner.textContent = goldGlitched
    ? "Test gold glitch triggered. Spend wildly."
    : storedGold
      ? `Bank sold. Collected ${storedGold}g.`
      : "Defender sold.";
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
    const evolution = selectedTower?.evolution ? evolutions[selectedTower.type]?.[selectedTower.evolution] : null;
    if (selectedTower?.level >= 12 && selectedTower.evolution && !selectedTower.finalForm) {
      tryFinalFormSelected();
      return;
    }
    if (selectedTower?.level >= 8 && evolution?.forks && !selectedTower.specialization) {
      trySpecializeSelected(button.dataset.evolution);
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
    const evolution = selectedTower?.evolution ? evolutions[selectedTower.type]?.[selectedTower.evolution] : null;
    if (selectedTower?.level >= 12 && selectedTower.evolution && !selectedTower.finalForm) {
      tryFinalFormSelected();
    } else if (selectedTower?.level >= 8 && evolution?.forks && !selectedTower.specialization) {
      trySpecializeSelected("a");
    } else {
      tryEvolveSelected("a");
    }
  } else if (key === "b") {
    event.preventDefault();
    const evolution = selectedTower?.evolution ? evolutions[selectedTower.type]?.[selectedTower.evolution] : null;
    if (selectedTower?.level >= 8 && evolution?.forks && !selectedTower.specialization) {
      trySpecializeSelected("b");
    } else {
      tryEvolveSelected("b");
    }
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

window.addEventListener("resize", setupCanvasDpi);

setupCanvasDpi();
renderTowerDock();
resetGame();
requestAnimationFrame(loop);
