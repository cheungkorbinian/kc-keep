/**
 * Don't Starve–inspired seasons & comfort helpers (no Klei code).
 */
(function (global) {
  "use strict";

  const SEASONS = [
    {
      id: "spring",
      name: "春",
      dayLen: 200,
      nightAt: 0.76,
      ambient: 52,
      hunger: 1.0,
      fuel: 1.0,
      rainChance: 1.35,
      raid: 0.9,
      tint: [40, 90, 50],
    },
    {
      id: "summer",
      name: "夏",
      dayLen: 190,
      nightAt: 0.8,
      ambient: 78,
      hunger: 1.25,
      fuel: 0.85,
      rainChance: 0.55,
      raid: 0.75,
      tint: [120, 70, 20],
      overheat: true,
    },
    {
      id: "autumn",
      name: "秋",
      dayLen: 195,
      nightAt: 0.72,
      ambient: 48,
      hunger: 1.05,
      fuel: 1.1,
      rainChance: 1.0,
      raid: 1.15,
      tint: [110, 55, 25],
    },
    {
      id: "winter",
      name: "冬",
      dayLen: 220,
      nightAt: 0.58,
      ambient: 12,
      hunger: 1.35,
      fuel: 1.55,
      rainChance: 0.4,
      raid: 1.4,
      tint: [60, 90, 140],
      freeze: true,
    },
  ];

  /** Seconds of gameplay per season (≈ several day cycles). */
  const SEASON_LEN = 520;

  function seasonAt(seasonT) {
    const i = Math.floor(seasonT / SEASON_LEN) % SEASONS.length;
    return SEASONS[i];
  }

  function comfortTarget(season, lit, night, torchOn, inCave, wet, raining) {
    let t = season.ambient;
    if (night) t -= 18;
    if (inCave) t -= 10;
    if (lit > 0.35) t += 28 * lit;
    else if (torchOn) t += 14;
    if (season.overheat && !night && lit < 0.2) t += 8;
    // DST-ish: rain / soaked clothes pull temperature down
    if (raining) t -= 6;
    if ((wet || 0) > 40) t -= 4 + Math.min(10, (wet - 40) * 0.12);
    return Math.max(0, Math.min(100, t));
  }

  global.SeasonSys = { SEASONS, SEASON_LEN, seasonAt, comfortTarget };
})(window);
