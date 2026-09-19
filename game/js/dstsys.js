/**
 * Don't Starve–style systems for 魔蚀据点 (reskin helpers).
 * Numbers inspired by DST tuning.lua / cooking.lua — original JS, no Klei code.
 */
(function (global) {
  "use strict";

  // DST-ish day: ~8 min real time default → we keep game dayLen from seasons (~180s)
  // Perish times expressed in *game days* (fraction of dayT cycles).
  const STACK = {
    wood: 20, gold: 40, meat: 20, fish: 20, honey: 40, berries: 40, seeds: 40,
    torch: 20, lantern: 10, cooked: 20, jam: 20, meatpie: 10, spicy: 10,
    trail: 10, feast: 10, warmstone: 10, mapscroll: 10, warKit: 1,
    boards: 20, rope: 20, cutstone: 20, rocks: 40, flint: 40, twigs: 40, grass: 40,
    monster: 20, dung: 20, trinket: 40, icebox: 1,
    charcoal: 40, jerky: 20, oar: 5,
  };

  /** perishDays: full spoil after N game-days; null = never */
  const PERISH = {
    meat: 6, fish: 3, berries: 6, honey: 40, cooked: 10, jam: 15,
    meatpie: 10, spicy: 10, trail: 15, feast: 10, monster: 4,
    seeds: 40, jerky: 20,
  };

  const FOOD_TAGS = {
    meat: { meat: 1 },
    monster: { meat: 1, monster: 1 },
    fish: { meat: 0.5, fish: 1 },
    berries: { fruit: 0.5 },
    honey: { sweetener: 1 },
    cooked: { meat: 1, precook: 1 },
    jam: { fruit: 1, sweetener: 0.5 },
    seeds: { seed: 1, veggie: 0.5 },
  };

  /** Tag cook recipes (cookpot) — simplified DST matching */
  const TAG_COOK = [
    { id: "meatballs", name: "肉丸", need: { meat: 1 }, ban: { monster: 1 }, out: "cooked", n: 1, hunger: 62, hp: 3, sanity: 5 },
    { id: "honey_nuggets", name: "蜜汁卤肉", need: { meat: 1, sweetener: 1 }, out: "feast", n: 1, hunger: 37, hp: 20, sanity: 15 },
    { id: "fruit_medley", name: "水果圣代", need: { fruit: 1.5 }, ban: { meat: 0.1 }, out: "jam", n: 1, hunger: 25, hp: 20, sanity: 20 },
    { id: "fishsticks", name: "炸鱼排", need: { fish: 1 }, out: "cooked", n: 1, hunger: 37, hp: 40, sanity: 10 },
    { id: "bacon_eggs", name: "培根煎蛋", need: { meat: 1.5 }, out: "meatpie", n: 1, hunger: 75, hp: 20, sanity: 5 },
    { id: "trailmix", name: "什锦干果", need: { fruit: 1, seed: 1 }, out: "trail", n: 1, hunger: 30, hp: 10, sanity: 12 },
    { id: "wetgoop", name: "湿腻焦物", need: {}, out: null, n: 0, fail: true, sanity: -15 },
  ];

  function clampInv(inv, toast) {
    for (const [k, cap] of Object.entries(STACK)) {
      const n = inv[k] || 0;
      if (n > cap) {
        inv[k] = cap;
        if (toast) toast(k + " 堆叠已满（上限 " + cap + "）。", 2);
      }
    }
  }

  function ensureSpoil(inv) {
    if (!inv._spoil) inv._spoil = {};
    for (const k of Object.keys(PERISH)) {
      if ((inv[k] || 0) > 0 && inv._spoil[k] == null) inv._spoil[k] = 0;
      if ((inv[k] || 0) <= 0) delete inv._spoil[k];
    }
  }

  /**
   * @param dayFrac how much of one game-day passed this frame (dt / dayLen)
   * @param mult season/wet/fridge multipliers
   */
  function updateSpoil(inv, dayFrac, mult, toast) {
    ensureSpoil(inv);
    mult = mult || 1;
    let spoiled = false;
    for (const [k, days] of Object.entries(PERISH)) {
      if ((inv[k] || 0) <= 0) continue;
      inv._spoil[k] = (inv._spoil[k] || 0) + dayFrac * mult;
      if (inv._spoil[k] >= days) {
        inv[k] = Math.max(0, (inv[k] || 0) - 1);
        inv._spoil[k] = 0;
        spoiled = true;
        // DST-ish: spoiled food becomes fertilizer (dung stand-in)
        inv.dung = (inv.dung || 0) + 1;
        if ((inv[k] || 0) <= 0) delete inv._spoil[k];
      }
    }
    if (spoiled && toast) toast("有食物腐坏了，变成了肥料。", 2);
    return spoiled;
  }

  function spoilFreshness(inv, key) {
    const days = PERISH[key];
    if (!days || !inv._spoil) return 1;
    return Math.max(0, 1 - (inv._spoil[key] || 0) / days);
  }

  function sumTags(slots) {
    const tags = {};
    for (const id of slots) {
      if (!id) continue;
      const t = FOOD_TAGS[id];
      if (!t) continue;
      for (const [k, v] of Object.entries(t)) tags[k] = (tags[k] || 0) + v;
    }
    return tags;
  }

  function matchCook(slots) {
    const tags = sumTags(slots);
    const filled = slots.filter(Boolean).length;
    if (filled === 0) return null;
    for (const r of TAG_COOK) {
      if (r.fail) continue;
      let ok = true;
      for (const [k, v] of Object.entries(r.need || {})) {
        if ((tags[k] || 0) < v) { ok = false; break; }
      }
      if (!ok) continue;
      if (r.ban) {
        for (const [k, v] of Object.entries(r.ban)) {
          if ((tags[k] || 0) >= v) { ok = false; break; }
        }
      }
      if (ok) return r;
    }
    return TAG_COOK.find((r) => r.fail) || null;
  }

  /** Hounded — DST-like periodic waves */
  function createHoundClock() {
    return {
      next: 420 + Math.random() * 240, // first wave ~7–11 min ≈ days 3–5-ish
      warning: 0,
      wave: 0,
    };
  }

  function updateHounds(clock, dt, seasonId, night, spawnFn, toast) {
    if (!clock) return;
    clock.next -= dt;
    if (clock.next < 30 && clock.warning <= 0) {
      clock.warning = 1;
      if (toast) toast("远方传来劫掠队的鼓噪……", 3.5);
    }
    if (clock.next > 0) return;
    clock.wave++;
    clock.warning = 0;
    const base = 3 + Math.min(6, clock.wave);
    const n = seasonId === "winter" ? base + 2 : seasonId === "summer" ? base + 1 : base;
    for (let i = 0; i < n; i++) spawnFn(i, n);
    clock.next = 200 + Math.random() * 160 - Math.min(60, clock.wave * 8);
    if (night) clock.next *= 0.85;
    const waveName = seasonId === "winter" ? "霜骨劫掠潮" : seasonId === "summer" ? "炎牙劫掠潮" : "劫掠潮";
    if (toast) toast(waveName + "！共 " + n + " 只。", 3);
    if (global.DstAudio) global.DstAudio.hound();
  }

  /** Pig King: trade meat/trinkets for gold */
  function pigKingTrade(inv, toast) {
    if ((inv.trinket || 0) > 0) {
      inv.trinket--;
      inv.gold = (inv.gold || 0) + 4 + Math.floor(Math.random() * 5);
      clampInv(inv);
      if (toast) toast("猪王收下小饰品，赏了金币。", 2.5);
      return true;
    }
    if ((inv.meat || 0) > 0) {
      inv.meat--;
      inv.gold = (inv.gold || 0) + 1;
      clampInv(inv);
      if (toast) toast("猪王啃完肉，丢给你一枚金币。", 2.5);
      return true;
    }
    if (toast) toast("猪王想要肉或饰品。", 2);
    return false;
  }

  function createWetness() {
    return { wet: 0 }; // 0–100
  }

  function updateWetness(w, dt, raining, nearFire, boat, umbrella, raincoat) {
    const rainMul = raincoat ? 0.08 : (umbrella ? 0.25 : 1);
    if (raining) w.wet = Math.min(100, w.wet + dt * 8 * rainMul);
    else if (boat) w.wet = Math.min(100, w.wet + dt * 2 * rainMul);
    else w.wet = Math.max(0, w.wet - dt * (nearFire ? 12 : 3));
    return w.wet;
  }

  /** Tool durability — DST tools break */
  function createTools() {
    return {
      axe: { max: 100, uses: 100 },
      pickaxe: { max: 100, uses: 100 },
      shovel: { max: 50, uses: 50 },
    };
  }

  function useTool(tools, kind, toast) {
    const t = tools[kind];
    if (!t) return true;
    t.uses--;
    if (t.uses <= 0) {
      t.uses = t.max;
      if (toast) toast((kind === "axe" ? "斧头" : kind === "pickaxe" ? "镐子" : "工具") + "用坏了，你又打了一把。", 2.5);
      return false;
    }
    return true;
  }

  /** Season boss schedule hooks */
  function seasonBossDue(seasonId, seasonT, flags, seasonLen) {
    // seasonT is absolute seconds; normalize within current season length
    const len = seasonLen || (global.SeasonSys && global.SeasonSys.SEASON_LEN) || 520;
    const frag = (seasonT % len) / len;
    if (seasonId === "winter" && frag > 0.72 && !flags.deerclops) return "deerclops";
    if (seasonId === "autumn" && frag > 0.75 && !flags.bearger) return "bearger";
    if (seasonId === "summer" && frag > 0.7 && !flags.dragonfly) return "dragonfly";
    if (seasonId === "spring" && frag > 0.65 && !flags.moose) return "moose";
    return null;
  }

  global.DstSys = {
    STACK, PERISH, FOOD_TAGS, TAG_COOK,
    clampInv, ensureSpoil, updateSpoil, spoilFreshness,
    matchCook, sumTags,
    createHoundClock, updateHounds,
    pigKingTrade,
    createWetness, updateWetness,
    createTools, useTool,
    seasonBossDue,
    BAG_SIZE: 15,
  };
})(window);
