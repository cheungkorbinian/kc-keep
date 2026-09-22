/** Deterministic fire limits and compact world snapshots. No rendering dependencies. */
(function (global) {
  'use strict';
  function createFire(world, cols, rows, random) {
    const active = new Set();
    const origins = new Map();
    const limit = 24, radius = 2, delay = 3, lifetime = 4.8;
    function ignite(c, r, power = 1, origin) {
      if (c < 0 || r < 0 || c >= cols || r >= rows) return false;
      const i = r * cols + c;
      if (![1, 2].includes(world.tiles[i]) || world.wet[i] > 0.6) return false;
      if (active.has(i)) return false; // Repeated hits never restart the clock.
      if (active.size >= limit) return false;
      origin = origin == null ? i : origin;
      if (Math.abs(c - origin % cols) + Math.abs(r - Math.floor(origin / cols)) > radius) return false;
      world.burn[i] = power; world.fireAge[i] = 0;
      origins.set(i, origin); active.add(i); return true;
    }
    function extinguish(c, r, radius = 1) {
      let count = 0;
      for (let y = r-radius; y <= r+radius; y++) for (let x = c-radius; x <= c+radius; x++) {
        if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
        const i = y*cols+x;
        if (active.delete(i)) count++;
        origins.delete(i); world.burn[i] = 0; world.fireAge[i] = 0;
        world.wet[i] = Math.max(world.wet[i], 3); // ~9 seconds before ignition is possible.
      }
      return count;
    }
    function update(dt) {
      for (const i of Array.from(active)) {
        if (world.burn[i] <= 0 || world.wet[i] > 0.6 || ![1,2].includes(world.tiles[i])) {
          active.delete(i); origins.delete(i); world.burn[i] = 0; continue;
        }
        world.fireAge[i] += dt;
        if (world.fireAge[i] >= lifetime) {
          active.delete(i); origins.delete(i); world.burn[i] = 0; world.tiles[i] = 3; continue;
        }
        if (world.fireAge[i] < delay) continue;
        const c = i % cols, r = Math.floor(i / cols), origin = origins.get(i);
        for (const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]) {
          if (random() < 1 - Math.exp(-0.12*dt)) ignite(c+dc,r+dr,1,origin);
        }
      }
    }
    function snapshot() { return Array.from(active, i => [i,world.burn[i],world.fireAge[i],origins.get(i)]); }
    function restore(items) {
      active.clear();origins.clear();world.burn.fill(0);world.fireAge.fill(0);
      for (const [i,power,age,origin] of items || []) {
        if (ignite(i%cols,Math.floor(i/cols),power,origin)) world.fireAge[i] = age;
      }
    }
    return {ignite,extinguish,update,snapshot,restore,get count(){return active.size;},limit};
  }
  function capture(objects, pack) {
    return objects.map((obj,i) => { obj.persistId = i; return JSON.stringify(pack(obj)); });
  }
  function diff(objects, baseline, pack) {
    const found = new Set(), changed = [], added = [];
    for (const obj of objects) {
      const data = pack(obj), id = obj.persistId;
      if (Number.isInteger(id) && id >= 0 && id < baseline.length) {
        found.add(id);if (JSON.stringify(data) !== baseline[id]) changed.push(data);
      } else added.push(data);
    }
    return {removed:baseline.flatMap((_,i)=>found.has(i)?[]:[i]),changed,added};
  }
  function restore(objects, delta, unpack) {
    const removed = new Set(delta.removed);
    const changed = new Map(delta.changed.map(o=>[o.persistId,o]));
    for (let i=objects.length-1;i>=0;i--) {
      const obj=objects[i];
      if (removed.has(obj.persistId)) objects.splice(i,1);
      else if (changed.has(obj.persistId)) {
        const next=unpack(changed.get(obj.persistId));
        const pair=obj.pair;
        for(const key of Object.keys(obj)) delete obj[key];
        Object.assign(obj,next); // Preserve references held by landmarks and NPCs.
        if(pair)obj.pair=pair;
      }
    }
    for(const obj of delta.added) objects.push(unpack(obj));
  }
  global.KCSurvival={createFire,capture,diff,restore};
})(typeof window==='undefined'?globalThis:window);
