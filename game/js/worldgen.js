/**
 * World generator — Don't Starve Together forest map structure (reskin).
 *
 * Faithfully mirrors DST survival forest generation shape (original JS, no Klei code):
 *   tasksets/forest.lua "default" tasks → story graph (locks/keys) → room blobs
 *   → background fill → continent in ocean.
 *
 * Size from forest_map.lua (non-cave): default == large == 425, medium 400, huge 450.
 */
(function (global) {
  "use strict";

  const DEFAULT_SIZE = 425; // DST default == large
  const SIZE_VARIATION = 2; // DST SIZE_VARIATION

  /** Keep numeric ids stable for game.js. Names follow DST ground types. */
  const BIOME = {
    OCEAN: 0,
    MEADOW: 1,   // WORLD_TILES.GRASS
    FOREST: 2,   // WORLD_TILES.FOREST / DECIDUOUS
    MAGIC: 3,    // WORLD_TILES.MARSH (purple tileset = swamp)
    WAR: 4,      // WORLD_TILES.DIRT / Badlands / Lightning Bluff
    MINES: 5,    // WORLD_TILES.ROCKY
    SHORE: 6,
    SAVANNA: 7,  // WORLD_TILES.SAVANNA
  };

  // Aliases matching DST names in comments / tooling
  const GRASS = BIOME.MEADOW;
  const FOREST = BIOME.FOREST;
  const MARSH = BIOME.MAGIC;
  const BADLANDS = BIOME.WAR;
  const ROCKY = BIOME.MINES;
  const SAVANNA = BIOME.SAVANNA;

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash2(x, y, s) {
    const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
    return n - Math.floor(n);
  }

  function noise2(x, y, s) {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = x - x0, fy = y - y0;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a = hash2(x0, y0, s);
    const b = hash2(x0 + 1, y0, s);
    const c = hash2(x0, y0 + 1, s);
    const d = hash2(x0 + 1, y0 + 1, s);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  }

  function fbm(x, y, s, oct) {
    let v = 0, amp = 0.5, freq = 1, norm = 0;
    for (let i = 0; i < oct; i++) {
      v += noise2(x * freq, y * freq, s + i * 19) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return v / norm;
  }

  function irand(rand, a, b) {
    return a + Math.floor(rand() * (b - a + 1));
  }

  function pickN(rand, arr, n) {
    const pool = arr.slice();
    const out = [];
    while (out.length < n && pool.length) {
      out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
    }
    return out;
  }

  /**
   * DST keys as bit flags (simplified RestrictNodesByKey).
   * Mirrors KEYS from lockandkey used by default forest tasks.
   */
  const K = {
    NONE: 0,
    PICKAXE: 1 << 0,
    AXE: 1 << 1,
    GRASS: 1 << 2,
    WOOD: 1 << 3,
    TIER1: 1 << 4,
    TIER2: 1 << 5,
    TIER3: 1 << 6,
    TIER4: 1 << 7,
    TIER5: 1 << 8,
    ROCKS: 1 << 9,
    STONE: 1 << 10,
    TRINKETS: 1 << 11,
    MEAT: 1 << 12,
    POOP: 1 << 13,
    WOOL: 1 << 14,
    SPIDERS: 1 << 15,
    SILK: 1 << 16,
    HONEY: 1 << 17,
    PIGS: 1 << 18,
    GOLD: 1 << 19,
    WALRUS: 1 << 20,
    HOUNDS: 1 << 21,
    BEEHAT: 1 << 22,
  };

  const L = {
    NONE: 0,
    ROCKS: K.TIER1, // after start pick — Dig that rock
    BEEHIVE: K.TIER1,
    BASIC_COMBAT: K.TIER1,
    SPIDERDENS: K.TIER2,
    TIER1: K.TIER1,
    TIER2: K.TIER2,
    TIER3: K.TIER3,
    TIER4: K.TIER4,
    PIGKING: K.TIER2,
    PIGGIFTS: K.TIER1,
    ADVANCED_COMBAT: K.TIER3,
    MONSTERS_DEFEATED: K.TIER3,
    SPIDERS_DEFEATED: K.TIER1,
    KILLERBEES: K.TIER3,
    TREES: K.TIER2,
  };

  function roomsVar(rand, base) {
    return base + irand(rand, 0, SIZE_VARIATION);
  }

  /**
   * Required + optional tasks from tasksets/forest.lua "default"
   * and room_bg / room_choices from dst_tasks_forestworld.lua.
   * roomList: { biome, weight } — stamped as sub-blobs inside the task.
   */
  function buildTaskDefs(rand) {
    const required = [
      {
        id: "Make a pick",
        label: "出生草地",
        landmark: "camp",
        locks: L.NONE,
        keys: K.PICKAXE | K.AXE | K.GRASS | K.WOOD | K.TIER1,
        bg: GRASS,
        start: true,
        rooms: () => [
          { biome: FOREST, n: roomsVar(rand, 1) },
          { biome: SAVANNA, n: 1 }, // BarePlain / Plain mix
          { biome: SAVANNA, n: roomsVar(rand, 1) },
          { biome: GRASS, n: 1 }, // Clearing
        ],
      },
      {
        id: "Dig that rock",
        label: "矿脉",
        landmark: "mines",
        locks: L.ROCKS,
        keys: K.TRINKETS | K.STONE | K.WOOD | K.TIER1 | K.ROCKS,
        bg: ROCKY,
        rooms: () => [
          { biome: ROCKY, n: 1 }, // Graveyard-ish rocky
          { biome: ROCKY, n: roomsVar(rand, 1) },
          { biome: FOREST, n: Math.max(0, irand(rand, 0, SIZE_VARIATION)) },
          { biome: GRASS, n: Math.max(0, irand(rand, 0, SIZE_VARIATION)) },
        ],
      },
      {
        id: "Great Plains",
        label: "大草原",
        landmark: "savanna",
        locks: L.ROCKS | L.BASIC_COMBAT | L.TIER1,
        keys: K.MEAT | K.POOP | K.WOOL | K.GRASS | K.TIER2,
        bg: SAVANNA,
        rooms: () => [
          { biome: SAVANNA, n: roomsVar(rand, 1) }, // BeefalowPlain
          { biome: SAVANNA, n: roomsVar(rand, 1) }, // Plain
          { biome: GRASS, n: 2 },
        ],
      },
      {
        id: "Squeltch",
        label: "沼泽",
        landmark: "ruin", // purple marsh → existing "ruin" content pocket
        locks: L.SPIDERDENS | L.TIER2,
        keys: K.MEAT | K.SILK | K.SPIDERS | K.TIER3,
        bg: MARSH,
        rooms: () => [
          { biome: MARSH, n: 5 + irand(rand, 0, SIZE_VARIATION) },
          { biome: MARSH, n: 1 }, // SlightlyMermySwamp
        ],
      },
      {
        id: "Beeeees!",
        label: "蜂区",
        landmark: "bees",
        locks: L.BEEHIVE | L.TIER1,
        keys: K.HONEY | K.TIER2,
        bg: GRASS,
        rooms: () => [
          { biome: GRASS, n: 1 }, // BeeClearing
          { biome: FOREST, n: Math.max(0, irand(rand, 0, SIZE_VARIATION) - 1) },
          { biome: GRASS, n: 1 }, // BeeQueenBee
          { biome: GRASS, n: Math.max(1, irand(rand, 0, SIZE_VARIATION)) },
        ],
      },
      {
        id: "Speak to the king",
        label: "猪王落叶林",
        landmark: "pigking",
        locks: L.PIGKING | L.TIER2,
        keys: K.PIGS | K.GOLD | K.TIER3,
        bg: GRASS, // room_bg GRASS, background BGDeciduous → treat as leafy forest
        rooms: () => [
          { biome: GRASS, n: 1 }, // PigKingdom clearing
          { biome: FOREST, n: 1 }, // MagicalDeciduous
          { biome: FOREST, n: 3 + irand(rand, 0, SIZE_VARIATION) },
        ],
      },
      {
        id: "Forest hunters",
        label: "密林",
        landmark: "forest",
        locks: L.ADVANCED_COMBAT | L.MONSTERS_DEFEATED | L.TIER3,
        keys: K.WALRUS | K.TIER4,
        bg: FOREST,
        rooms: () => [
          { biome: FOREST, n: 1 },
          { biome: FOREST, n: 1 },
          { biome: FOREST, n: 2 }, // ForestMole
          { biome: FOREST, n: 1 },
          { biome: GRASS, n: 1 },
        ],
      },
      {
        id: "For a nice walk",
        label: "漫步林",
        landmark: "walk",
        locks: L.BASIC_COMBAT | L.TIER2,
        keys: K.POOP | K.WOOL | K.WOOD | K.GRASS | K.TIER2,
        bg: FOREST,
        rooms: () => [
          { biome: SAVANNA, n: 1 },
          { biome: FOREST, n: roomsVar(rand, 1) },
          { biome: FOREST, n: roomsVar(rand, 1) },
          { biome: FOREST, n: Math.max(0, irand(rand, 0, SIZE_VARIATION)) },
        ],
      },
      {
        id: "Badlands",
        label: "恶地",
        landmark: "red",
        locks: L.ADVANCED_COMBAT | L.MONSTERS_DEFEATED | L.TIER4,
        keys: K.HOUNDS | K.TIER5 | K.ROCKS,
        bg: BADLANDS,
        rooms: () => [
          { biome: BADLANDS, n: 1 }, // DragonflyArena
          { biome: BADLANDS, n: 2 },
          { biome: BADLANDS, n: rand() < 0.33 ? 2 : 1 },
          { biome: SAVANNA, n: 1 },
          { biome: BADLANDS, n: rand() < 0.5 ? 2 : 1 },
        ],
      },
      {
        id: "Lightning Bluff",
        label: "雷崖",
        landmark: "bluff",
        locks: L.SPIDERS_DEFEATED,
        keys: K.PICKAXE | K.TIER2,
        bg: BADLANDS,
        rooms: () => [
          { biome: BADLANDS, n: 1 },
          { biome: BADLANDS, n: 1 },
          { biome: BADLANDS, n: 1 }, // Oasis still dirt ring
          { biome: BADLANDS, n: 2 },
        ],
      },
    ];

    // optionaltasks from tasksets/forest.lua — pick numoptionaltasks = 5
    const optionalPool = [
      {
        id: "Befriend the pigs",
        label: "猪村",
        landmark: "pigs",
        locks: L.PIGGIFTS | L.TIER1,
        keys: K.PIGS | K.MEAT | K.GRASS | K.WOOD | K.TIER2,
        bg: FOREST,
        rooms: () => [
          { biome: FOREST, n: 1 },
          { biome: FOREST, n: roomsVar(rand, 1) },
          { biome: MARSH, n: Math.max(0, irand(rand, 0, SIZE_VARIATION)) },
          { biome: FOREST, n: Math.max(0, irand(rand, 0, SIZE_VARIATION)) },
          { biome: GRASS, n: 1 },
        ],
      },
      {
        id: "Kill the spiders",
        label: "蛛巢",
        landmark: "spiders",
        locks: L.SPIDERDENS | L.MONSTERS_DEFEATED | L.TIER3,
        keys: K.SPIDERS | K.TIER4,
        bg: ROCKY,
        rooms: () => [
          { biome: FOREST, n: 2 },
          { biome: FOREST, n: Math.max(0, irand(rand, 0, SIZE_VARIATION)) },
          { biome: FOREST, n: Math.max(0, irand(rand, 0, SIZE_VARIATION)) },
          { biome: GRASS, n: 1 },
        ],
      },
      {
        id: "Killer bees!",
        label: "杀人蜂",
        landmark: "wasps",
        locks: L.KILLERBEES | L.TIER3,
        keys: K.HONEY | K.TIER3,
        bg: GRASS,
        rooms: () => [
          { biome: GRASS, n: Math.max(1, irand(rand, 0, SIZE_VARIATION)) },
          { biome: FOREST, n: Math.max(0, irand(rand, 0, SIZE_VARIATION)) },
          { biome: GRASS, n: Math.max(1, irand(rand, 0, SIZE_VARIATION)) },
        ],
      },
      {
        id: "Make a Beehat",
        label: "蜂帽岗",
        landmark: "beehat",
        locks: L.SPIDERS_DEFEATED | L.TIER1,
        keys: K.BEEHAT | K.GRASS | K.TIER1,
        bg: GRASS,
        rooms: () => [
          { biome: ROCKY, n: Math.max(1, irand(rand, 0, SIZE_VARIATION)) },
          { biome: GRASS, n: Math.max(1, irand(rand, 0, SIZE_VARIATION)) },
        ],
      },
      {
        id: "The hunters",
        label: "海象猎场",
        landmark: "hunters",
        locks: L.ADVANCED_COMBAT | L.MONSTERS_DEFEATED | L.TIER4,
        keys: K.WALRUS | K.TIER5,
        bg: SAVANNA,
        rooms: () => [
          { biome: SAVANNA, n: 1 },
          { biome: GRASS, n: 1 },
          { biome: ROCKY, n: 1 },
          { biome: GRASS, n: 2 },
          { biome: GRASS, n: 2 },
          { biome: ROCKY, n: 2 },
        ],
      },
      {
        id: "Magic meadow",
        label: "魔法草甸",
        landmark: "meadow",
        locks: L.TIER1,
        keys: K.GRASS | K.MEAT | K.TIER1,
        bg: FOREST,
        rooms: () => [
          { biome: GRASS, n: 2 },
          { biome: GRASS, n: 2 },
        ],
      },
      {
        id: "Frogs and bugs",
        label: "蛙塘",
        landmark: "frogs",
        locks: L.BASIC_COMBAT | L.TIER1,
        keys: K.MEAT | K.GRASS | K.HONEY | K.TIER2,
        bg: GRASS,
        rooms: () => [
          { biome: GRASS, n: 1 },
          { biome: GRASS, n: 1 },
          { biome: GRASS, n: roomsVar(rand, 1) },
          { biome: GRASS, n: 2 },
          { biome: GRASS, n: 1 },
        ],
      },
      {
        id: "Mole Colony Deciduous",
        label: "鼹鼠落叶林",
        landmark: "moles_d",
        locks: L.TIER1,
        keys: K.TIER2,
        bg: FOREST,
        rooms: () => [
          { biome: FOREST, n: 1 },
          { biome: FOREST, n: 2 },
          { biome: FOREST, n: 2 },
          { biome: GRASS, n: 1 },
        ],
      },
      {
        id: "Mole Colony Rocks",
        label: "鼹鼠岩地",
        landmark: "moles_r",
        locks: L.TIER1,
        keys: K.ROCKS | K.GOLD | K.TIER2,
        bg: ROCKY,
        rooms: () => [
          { biome: ROCKY, n: 1 },
          { biome: ROCKY, n: 2 + irand(rand, 0, SIZE_VARIATION) },
          { biome: ROCKY, n: 1 },
        ],
      },
      {
        id: "MooseBreedingTask",
        label: "麋鹿繁殖地",
        landmark: "moose",
        locks: L.TREES | L.TIER2,
        keys: K.PIGS | K.WOOD | K.MEAT | K.TIER2,
        bg: GRASS,
        rooms: () => [{ biome: GRASS, n: 1 }],
      },
    ];

    const optional = pickN(rand, optionalPool, 5);
    return required.concat(optional);
  }

  function taskRoomCount(task) {
    return task.rooms().reduce((s, r) => s + r.n, 0);
  }

  /** Story placement: start node + attach unlockable tasks (default branching). */
  function placeStory(tasks, cols, rows, rand) {
    const placed = [];
    const start = tasks.find((t) => t.start) || tasks[0];
    const cx = cols * 0.5;
    const cy = rows * 0.58; // DST spawn tends south of center
    const startNode = {
      task: start,
      c: cx + (rand() - 0.5) * 8,
      r: cy + (rand() - 0.5) * 6,
      depth: 0,
      parent: null,
    };
    placed.push(startNode);
    let keys = start.keys | K.NONE;
    const remaining = tasks.filter((t) => t !== start);

    // default branching: prefer 1–2 children per node, fan outward
    let guard = 0;
    while (remaining.length && guard++ < 80) {
      // find placeable tasks
      const candidates = [];
      for (let i = 0; i < remaining.length; i++) {
        const t = remaining[i];
        if ((t.locks & keys) === t.locks || t.locks === L.NONE) {
          candidates.push(i);
        }
      }
      // soften: if stuck, allow nearest lock match
      if (!candidates.length) {
        let best = 0, bestScore = -1;
        for (let i = 0; i < remaining.length; i++) {
          const need = remaining[i].locks;
          let score = 0;
          for (let b = 0; b < 32; b++) {
            const bit = 1 << b;
            if (need & bit) score += (keys & bit) ? 2 : -1;
          }
          if (score > bestScore) { bestScore = score; best = i; }
        }
        candidates.push(best);
      }

      const idx = candidates[Math.floor(rand() * candidates.length)];
      const task = remaining.splice(idx, 1)[0];

      // choose parent among placed that could unlock (has overlapping keys) else random shallow
      let parents = placed.filter((p) => (p.task.keys & task.locks) === task.locks || task.locks === L.NONE);
      if (!parents.length) parents = placed.slice();
      // branching default: prefer shallower / fewer children
      parents.sort((a, b) => {
        const ca = placed.filter((x) => x.parent === a).length;
        const cb = placed.filter((x) => x.parent === b).length;
        return (ca - cb) || (a.depth - b.depth);
      });
      const parent = parents[Math.min(parents.length - 1, irand(rand, 0, Math.min(2, parents.length - 1)))];

      const roomN = Math.max(3, taskRoomCount(task));
      const dist = 48 + roomN * 5.5 + rand() * 22;
      // fan angle away from map center + sibling spread
      const siblings = placed.filter((x) => x.parent === parent);
      const baseAng = Math.atan2(parent.r - cy, parent.c - cx);
      const ang = baseAng + (siblings.length - 0.5) * 0.85 + (rand() - 0.5) * 0.55;

      let c = parent.c + Math.cos(ang) * dist;
      let r = parent.r + Math.sin(ang) * dist;
      // keep on continent band (leave ocean margin ~18%)
      const margin = cols * 0.14;
      c = Math.max(margin, Math.min(cols - margin, c));
      r = Math.max(margin, Math.min(rows - margin, r));
      // separation
      for (let k = 0; k < 6; k++) {
        for (const o of placed) {
          const dx = c - o.c, dy = r - o.r;
          const d = Math.hypot(dx, dy);
          const minD = 32 + roomN * 1.2;
          if (d < minD && d > 0.1) {
            c += (dx / d) * (minD - d) * 0.55;
            r += (dy / d) * (minD - d) * 0.55;
          }
        }
        c = Math.max(margin, Math.min(cols - margin, c));
        r = Math.max(margin, Math.min(rows - margin, r));
      }

      const node = { task, c, r, depth: parent.depth + 1, parent };
      placed.push(node);
      keys |= task.keys;
    }

    return placed;
  }

  function stampDisk(tiles, biomes, cols, rows, hc, hr, rad, tile, biome, seed) {
    const R = Math.ceil(rad + 4);
    for (let y = -R; y <= R; y++) {
      for (let x = -R; x <= R; x++) {
        const c = Math.round(hc + x), r = Math.round(hr + y);
        if (c < 1 || r < 1 || c >= cols - 1 || r >= rows - 1) continue;
        const n = (fbm(c * 0.07, r * 0.07, seed, 3) - 0.5) * rad * 0.35;
        if (x * x + y * y > (rad + n) * (rad + n)) continue;
        const i = r * cols + c;
        tiles[i] = tile;
        biomes[i] = biome;
      }
    }
  }

  function carvePath(tiles, biomes, cols, rows, a, b, width, biome, seed) {
    const steps = Math.ceil(Math.hypot(b.c - a.c, b.r - a.r) * 1.35);
    for (let i = 0; i <= steps; i++) {
      const t = i / Math.max(1, steps);
      const c = a.c + (b.c - a.c) * t + Math.sin(t * 7.2) * 2.2;
      const r = a.r + (b.r - a.r) * t + Math.cos(t * 5.5) * 1.8;
      stampDisk(tiles, biomes, cols, rows, c, r, width, biome === MARSH ? 2 : 1, biome, seed + i);
    }
  }

  function generate(opts) {
    const cols = opts.cols || DEFAULT_SIZE;
    const rows = opts.rows || DEFAULT_SIZE;
    const seed = (opts.seed || 1) >>> 0;
    const rand = mulberry32(seed);

    const tiles = new Uint8Array(cols * rows); // 0 ocean, 1 land, 2 marsh magic tile
    const biomes = new Uint8Array(cols * rows);
    const owner = new Int16Array(cols * rows); // task index or -1
    owner.fill(-1);

    const taskDefs = buildTaskDefs(rand);
    const story = placeStory(taskDefs, cols, rows, rand);

    // Fill ocean
    tiles.fill(0);
    biomes.fill(BIOME.OCEAN);

    // Stamp each task: background blob + room sub-blobs (DST room graph → spatial blobs)
    story.forEach((node, ti) => {
      const rooms = node.task.rooms();
      const total = Math.max(1, rooms.reduce((s, x) => s + x.n, 0));
      const taskRad = 22 + Math.sqrt(total) * 13.5;
      // background_room biome
      stampDisk(tiles, biomes, cols, rows, node.c, node.r, taskRad, node.task.bg === MARSH ? 2 : 1, node.task.bg, seed + ti * 17);

      let angle = rand() * Math.PI * 2;
      rooms.forEach((room, ri) => {
        for (let k = 0; k < room.n; k++) {
          angle += 0.85 + rand() * 0.65;
          const dist = 5 + rand() * (taskRad * 0.62);
          const rc = node.c + Math.cos(angle) * dist;
          const rr = node.r + Math.sin(angle) * dist;
          const roomRad = 9 + rand() * 7 + (room.n > 3 ? 3 : 0);
          const tile = room.biome === MARSH ? 2 : 1;
          stampDisk(tiles, biomes, cols, rows, rc, rr, roomRad, tile, room.biome, seed + ti * 31 + ri * 9 + k);
        }
      });

      // mark ownership for fill
      const R = Math.ceil(taskRad + 6);
      for (let y = -R; y <= R; y++) {
        for (let x = -R; x <= R; x++) {
          const c = Math.round(node.c + x), r = Math.round(node.r + y);
          if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
          if (x * x + y * y > (taskRad + 6) * (taskRad + 6)) continue;
          const i = r * cols + c;
          if (tiles[i] !== 0) owner[i] = ti;
        }
      }
    });

    // Link tasks (story edges) — DST joins nodes; we carve land corridors
    for (const node of story) {
      if (!node.parent) continue;
      // road-like: grass / savanna connector between biomes
      const linkBiome = (node.task.bg === MARSH || node.parent.task.bg === MARSH)
        ? GRASS
        : (node.task.bg === BADLANDS || node.parent.task.bg === BADLANDS ? BADLANDS : SAVANNA);
      carvePath(tiles, biomes, cols, rows, node.parent, node, 3.2, linkBiome, seed + 99);
    }

    // Grow land so tasks fuse into one continent (DST WorldSim join)
    for (let pass = 0; pass < 5; pass++) {
      const nextT = new Uint8Array(tiles);
      const nextB = new Uint8Array(biomes);
      for (let r = 2; r < rows - 2; r++) {
        for (let c = 2; c < cols - 2; c++) {
          const i = r * cols + c;
          if (tiles[i] !== 0) continue;
          let land = 0, biomeVote = {};
          for (let y = -2; y <= 2; y++) {
            for (let x = -2; x <= 2; x++) {
              const j = (r + y) * cols + (c + x);
              if (tiles[j] !== 0) {
                land++;
                biomeVote[biomes[j]] = (biomeVote[biomes[j]] || 0) + 1;
              }
            }
          }
          const need = pass < 2 ? 6 : (pass < 4 ? 7 : 8);
          if (land >= need) {
            let best = GRASS, bv = -1;
            for (const k in biomeVote) {
              if (biomeVote[k] > bv) { bv = biomeVote[k]; best = +k; }
            }
            nextT[i] = best === MARSH ? 2 : 1;
            nextB[i] = best;
          }
        }
      }
      for (let i = 0; i < tiles.length; i++) {
        if (tiles[i] === 0 && nextT[i] !== 0) {
          tiles[i] = nextT[i];
          biomes[i] = nextB[i];
        }
      }
    }

    // Shore band (coast tiles near ocean)
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        const i = r * cols + c;
        if (tiles[i] === 0) continue;
        let oceanNear = false;
        for (let y = -2; y <= 2 && !oceanNear; y++) {
          for (let x = -2; x <= 2; x++) {
            if (tiles[(r + y) * cols + (c + x)] === 0) { oceanNear = true; break; }
          }
        }
        if (oceanNear) biomes[i] = BIOME.SHORE;
      }
    }

    // Small ponds inside marsh / grass (DST ponds)
    for (let n = 0; n < 40; n++) {
      const c = irand(rand, 20, cols - 21);
      const r = irand(rand, 20, rows - 21);
      const i = r * cols + c;
      if (biomes[i] !== MARSH && biomes[i] !== GRASS) continue;
      const rad = 1 + irand(rand, 0, 2);
      for (let y = -rad; y <= rad; y++) {
        for (let x = -rad; x <= rad; x++) {
          if (x * x + y * y > rad * rad) continue;
          const j = (r + y) * cols + (c + x);
          tiles[j] = 0;
          biomes[j] = BIOME.OCEAN;
        }
      }
    }

    // Landmarks for game content (stable keys used by game.js)
    function findLandmark(key) {
      const node = story.find((n) => n.task.landmark === key);
      return node ? { c: node.c, r: node.r, label: node.task.label, task: node.task.id } : null;
    }

    const landmarks = {
      camp: findLandmark("camp"),
      mines: findLandmark("mines"),
      savanna: findLandmark("savanna"),
      ruin: findLandmark("ruin"),
      forest: findLandmark("forest"),
      red: findLandmark("red"),
      bees: findLandmark("bees"),
      pigking: findLandmark("pigking"),
      walk: findLandmark("walk"),
      bluff: findLandmark("bluff"),
      frogs: findLandmark("frogs"),
      moles: findLandmark("moles_d") || findLandmark("moles_r"),
      moles_r: findLandmark("moles_r"),
      moose: findLandmark("moose"),
      wasps: findLandmark("wasps"),
      hunters: findLandmark("hunters"),
      pigs: findLandmark("pigs"),
      spiders: findLandmark("spiders"),
      beehat: findLandmark("beehat"),
      meadow: findLandmark("meadow"),
    };

    // Fallbacks if somehow missing
    if (!landmarks.camp) landmarks.camp = { c: cols * 0.5, r: rows * 0.58, label: "出生草地", task: "Make a pick" };
    if (!landmarks.red) landmarks.red = findLandmark("bluff") || { c: cols * 0.35, r: rows * 0.28, label: "恶地", task: "Badlands" };
    if (!landmarks.ruin) landmarks.ruin = { c: cols * 0.62, r: rows * 0.32, label: "沼泽", task: "Squeltch" };
    if (!landmarks.forest) landmarks.forest = { c: cols * 0.32, r: rows * 0.4, label: "密林", task: "Forest hunters" };
    if (!landmarks.mines) landmarks.mines = { c: cols * 0.65, r: rows * 0.5, label: "矿脉", task: "Dig that rock" };

    // Densities from DST forest rooms (distributepercent × prefab weights), scaled for our tile loop.
    // Sources: terrain_grass/forest/marsh/rocky/savanna.lua — not copied, only ratios.
    const density = {
      // BGGrass pct=.275 · grass/flower heavy · beehive≈0.003 · spiderden rare
      [BIOME.MEADOW]: { tree: 0.014, bush: 0.038, rock: 0.004, sheep: 0.003, gold: 0.0004, enemy: 0.0022 },
      // BGForest/DeepForest pct=.6–.8 · evergreen high · spiderden 0.02–0.05 (dens via setpiece)
      [BIOME.FOREST]: { tree: 0.062, bush: 0.018, rock: 0.006, sheep: 0.001, gold: 0.0007, enemy: 0.012 },
      // BGMarsh pct=.25 · tentacle-like threat · almost no saplings
      [BIOME.MAGIC]: { tree: 0.008, bush: 0.006, rock: 0.005, sheep: 0, gold: 0.0008, enemy: 0.032 },
      // Badlands / chess — sparse flora, higher combat
      [BIOME.WAR]: { tree: 0.003, bush: 0.004, rock: 0.016, sheep: 0, gold: 0.002, enemy: 0.038 },
      // BGRocky pct=.1 · rock1/rock2/flint heavy · tallbird-level rare
      [BIOME.MINES]: { tree: 0.004, bush: 0.003, rock: 0.032, sheep: 0.0003, gold: 0.016, enemy: 0.016 },
      [BIOME.SHORE]: { tree: 0.004, bush: 0.012, rock: 0.014, sheep: 0.001, gold: 0.001, enemy: 0.014 },
      // BGSavanna/Plain · perma_grass · rabbithole · beefalo on BarePlain
      [BIOME.SAVANNA]: { tree: 0.004, bush: 0.022, rock: 0.005, sheep: 0.012, gold: 0.0004, enemy: 0.006 },
      [BIOME.OCEAN]: { tree: 0, bush: 0, rock: 0, sheep: 0, gold: 0, enemy: 0 },
    };

    const hubs = story.map((n) => ({
      id: n.task.landmark || n.task.id,
      task: n.task.id,
      label: n.task.label,
      biome: n.task.bg,
      c: n.c,
      r: n.r,
      depth: n.depth,
    }));

    return {
      cols,
      rows,
      tiles,
      biomes,
      hubs,
      landmarks,
      density,
      BIOME,
      seed,
      sizePreset: "default", // DST forest_map: default == large == 425
      tasks: story.map((n) => n.task.id),
      storyMode: "dst_forest_default",
    };
  }

  global.OpenWorldGen = { BIOME, generate, DEFAULT_SIZE, SIZE_VARIATION };
})(window);
