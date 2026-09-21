const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'../game/js');
const noop=()=>{};
const canvasContext=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),measureText:s=>({width:String(s).length*7}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),getImageData:()=>({data:new Uint8ClampedArray(4)})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
const element=()=>({style:{},classList:{add:noop},addEventListener:noop,getContext:()=>canvasContext,width:1280,height:720,getBoundingClientRect:()=>({left:0,top:0,width:1280,height:720})});
const storage=new Map();const listeners={};
const sandbox={console,performance,Math,Date,Set,Map,Uint8Array,Float32Array,Int32Array,Uint8ClampedArray,Array,JSON,
  document:{getElementById:element,createElement:element},innerWidth:1280,innerHeight:720,devicePixelRatio:1,
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
  addEventListener:(k,fn)=>{(listeners[k] ||= []).push(fn);},requestAnimationFrame:noop,setTimeout:noop,
  KCUI:{init:api=>sandbox.ui=api,update:noop,label:x=>x,mapped:x=>x,isOpen:false},
};sandbox.window=sandbox;
const c=vm.createContext(sandbox);
for(const file of ['worldgen.js','enemies.js','seasons.js','dstsys.js','survival.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});
let src=fs.readFileSync(path.join(root,'game.js'),'utf8');
src=src.slice(0,src.indexOf('  loadAll().then'))+'})();';
src=src.replace('  resize();\n  window.__game',`  window.testAPI={saveGame,loadGame,snapshotWorld,validateSave,importSaveText,updateTiles,updateJourney,tryHarvest,tryInteract,useBucket,makeFirebreak,upgradeKeep,canUpgradeKeep,castSpell,updateProjectiles,kill,resetRunState,returnToMainMenu,
  get journey(){return journey;},get props(){return props;},get buildings(){return buildings;},get entities(){return entities;},get fires(){return fires;},get state(){return state;},get player(){return player;},get world(){return world;},get inv(){return inv;},get quests(){return quests;},get fireSystem(){return fireSystem;},get mouse(){return mouse;},get worldSeed(){return worldSeed;},get fog(){return fog;},get toolDur(){return toolDur;},get saveKey(){return SAVE_KEY;},setRain:v=>rain=v,setDay:v=>dayT=v,setState:v=>state=v};
  resize();\n  window.__game`);
vm.runInContext(src,c,{filename:'game.js'});
const g=c.__game,t=c.testAPI;
for(const key of Object.keys(g.PATHS))g.imgs[key]={width:192,height:192,naturalWidth:192,naturalHeight:192};
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS '+name);}
g.startWithCharacter('woodie');assert.equal(t.state,2);
test('KC6 starts with enhanced axe',()=>assert.equal(t.toolDur.axe.max,160));
let tree=t.props.find(p=>p.kind==='tree'),rock=t.props.find(p=>p.kind==='rock');
const treeId=tree.persistId,rockId=rock.persistId;
const tile=10000;
test('world changes survive actual generation and reload',()=>{
  tree._summerImg=g.imgs.tree1;const stumpImage=tree.stumpImg;tree.kind='stump';tree.hp=0;t.props.splice(t.props.indexOf(rock),1);
  t.world.tiles[tile]=3;
  t.props.push({kind:'woodwall',x:tree.x+100,y:tree.y,hp:12,max:55,solid:true});
  const boss=t.entities.find(e=>e.boss);assert(boss);t.kill(boss);
  const bossId=boss.persistId;
  assert.equal(t.saveGame(false),true);
  const saved=JSON.parse(storage.get(t.saveKey));assert.equal(saved.v,3);assert(t.validateSave(saved));
  assert.equal(t.loadGame(),true);
  assert.equal(t.props.find(p=>p.persistId===treeId).kind,'stump');
  assert.equal(t.props.find(p=>p.persistId===treeId)._summerImg,g.imgs.tree1);
  assert.equal(t.props.find(p=>p.persistId===treeId).stumpImg,stumpImage);
  const hole=t.props.find(p=>p.pair);if(hole)assert.equal(hole.pair.pair,hole);
  assert(!t.props.some(p=>p.persistId===rockId));
  assert.equal(t.world.tiles[tile],3);
  assert(t.props.some(p=>p.kind==='woodwall'&&p.hp===12));
  assert(t.entities.find(e=>e.persistId===bossId).dead);
  assert.equal(t.player.charId,'woodie');assert.equal(t.toolDur.axe.max,160);
  const count=t.props.length;assert(t.saveGame(false));assert(t.loadGame());assert.equal(t.props.length,count);
});
test('rain does not produce a full map-sized wetness snapshot',()=>{
  t.world.wet.fill(1.2);const bytes=JSON.stringify(t.snapshotWorld()).length;
  assert(bytes<2_000_000,`Snapshot too large: ${bytes}`);console.log('snapshot bytes:',bytes);t.world.wet.fill(0);
});
test('fire never exceeds 24 active cells and repeated hits preserve age',()=>{
  for(let y=20;y<28;y++)for(let x=20;x<28;x++){const i=y*425+x;t.world.tiles[i]=1;t.world.wet[i]=0;g.applyFire(x,y,1);}
  assert.equal(t.fireSystem.count,24);t.fireSystem.update(1);g.applyFire(20,20,1);assert.equal(t.world.fireAge[20*425+20],1);
});
test('extinguishing prevents immediate reignition',()=>{
  t.fireSystem.extinguish(20,20,1);assert.equal(g.applyFire(20,20,1),false);assert.equal(t.world.burn[20*425+20],0);
});
test('fire spread cannot cross its origin radius even with worst-case random',()=>{
  const n=21,world={tiles:new Uint8Array(n*n).fill(1),wet:new Float32Array(n*n),burn:new Float32Array(n*n),fireAge:new Float32Array(n*n)};
  const fire=c.KCSurvival.createFire(world,n,n,()=>0);fire.ignite(10,10);
  const burned=new Set();for(let step=0;step<600;step++){fire.update(.033);for(let i=0;i<world.tiles.length;i++)if(world.burn[i]>0||world.tiles[i]===3)burned.add(i);assert(fire.count<=24);}
  assert(burned.size>1);for(const i of burned)assert(Math.abs(i%n-10)+Math.abs(Math.floor(i/n)-10)<=2);
  assert.equal(fire.count,0);
});
test('bucket fills at shore, extinguishes, and uses a charge',()=>{
  t.inv.bucket=1;t.inv.bucketWater=0;t.player.x=30*64;t.player.y=30*64;t.world.tiles[30*425+31]=0;t.useBucket();assert.equal(t.inv.bucketWater,3);
  t.world.tiles[30*425+30]=1;t.world.wet[30*425+30]=0;t.mouse.wx=t.player.x;t.mouse.wy=t.player.y;
  t.fireSystem.extinguish(24,24,10);t.world.wet[30*425+30]=0;g.applyFire(30,30);t.useBucket();
  assert.equal(t.inv.bucketWater,2);assert.equal(t.world.burn[30*425+30],0);
});
test('firebreak requires stone, changes terrain, and resists fire',()=>{
  t.inv.rocks=1;t.world.tiles[30*425+30]=1;t.makeFirebreak();assert.equal(t.inv.rocks,0);assert.equal(t.world.tiles[30*425+30],3);assert.equal(g.applyFire(30,30),false);
});
test('keep upgrades require camp and exploration, persist their bonuses',()=>{
  t.inv.wood=100;t.inv.rocks=100;t.inv.gold=100;t.inv.boards=100;t.inv.cutstone=100;
  const camp=g.landmarks.camp;t.player.x=camp.c*64;t.player.y=camp.r*64;
  assert(t.canUpgradeKeep());t.upgradeKeep();assert.equal(t.journey.keepLevel,1);assert.equal(t.player.maxHp,165);
  for(const q of t.quests)q.done=false;assert.equal(t.canUpgradeKeep(),false);
  t.quests.find(q=>q.id==='explore').done=true;t.upgradeKeep();assert.equal(t.journey.keepLevel,2);
  assert.equal(t.canUpgradeKeep(),false);t.quests.find(q=>q.id==='bear').done=true;t.upgradeKeep();assert.equal(t.journey.keepLevel,3);
  t.saveGame(false);t.loadGame();assert.equal(t.journey.keepLevel,3);assert.equal(t.player.maxHp,195);
});
test('tutorial tracks gathered food and an actual night-to-day transition',()=>{
  t.inv.berries=1;t.inv.wood=3;t.setDay(.8);t.updateJourney(.1);t.setDay(.1);t.updateJourney(.1);
  assert(t.journey.tutorial.wood);assert(t.journey.tutorial.food);assert(t.journey.tutorial.dawn);
});
test('malformed imports preserve the existing save',()=>{
  const original=storage.get(t.saveKey);assert.match(t.importSaveText('{oops'),/JSON/);assert.equal(storage.get(t.saveKey),original);
  const invalid=JSON.parse(original);invalid.worldChanges.terrain=[[999999,1,1,0,0]];assert.equal(t.validateSave(invalid),false);
});
test('valid import backs up the previous save',()=>{
  t.setState(3);const old=storage.get(t.saveKey);t.inv.gold=113;assert.match(t.importSaveText(old),/成功/);assert.equal(JSON.parse(storage.get(t.saveKey+'-backup')).inv.gold,113);
});
test('endgame requires both keep level 3 and the warlord',()=>{
  t.journey.victory=false;t.quests.find(q=>q.id==='warlord').done=false;t.updateJourney(.1);assert.equal(t.journey.victory,false);
  t.quests.find(q=>q.id==='warlord').done=true;t.updateJourney(.1);assert.equal(t.journey.victory,true);
});

test('legacy saves still load without duplicate structures',()=>{
  const legacy={v:1,worldSeed:t.worldSeed,player:{x:0,y:0,hp:100,mp:100,hunger:90,corr:0},fires:[],chests:[{x:3,y:4,store:{wood:8}}],fences:[{x:5,y:6}],farms:[{x:1,y:2,planted:true,stage:2,grow:12}]};
  storage.set(t.saveKey,JSON.stringify(legacy));assert(t.loadGame());
  assert.equal(t.props.filter(p=>p.kind==='chest').length,1);assert.equal(t.props.filter(p=>p.kind==='fence').length,1);
  assert.equal(t.props.find(p=>p.kind==='farm').stage,2);assert.equal(t.fires.length,0);
});
test('v2 saves preserve character identity and construction types',()=>{
  const v2={v:2,worldSeed:t.worldSeed,player:{charId:'willow',x:0,y:0,hp:100,mp:90,hunger:80,corr:2},
    fires:[{x:10,y:20,lit:false,fuel:0,pit:true,permanent:true}],
    structures:[{kind:'woodwall',x:30,y:40,hp:12,imageKey:'woodFence'}],
    ownedBuildings:[{kind:'firepit',x:10,y:20,owned:true,firepit:true,imageKey:'rock'}]};
  storage.set(t.saveKey,JSON.stringify(v2));assert(t.loadGame());assert.equal(t.player.charId,'willow');assert.equal(t.player.maxHp,120);assert(t.player.fireSanity);
  assert(t.props.some(p=>p.kind==='woodwall'&&p.hp===12));assert.equal(t.fires[0].building,t.buildings.find(b=>b.firepit));
});
test('malformed nested import data is rejected before changing the run',()=>{
  const base=JSON.parse(storage.get(t.saveKey));
  for(const change of [{fires:[null]},{inv:{wood:'bad'}},{toolDur:{axe:null}},{cookSlots:'bad'},{journey:{keepLevel:8}}]){
    assert.equal(t.validateSave({...base,...change}),false);
  }
});
test('harvesting honors target, nearest resource, tools and stale targets',()=>{
  t.props.splice(0,t.props.length);t.player.x=0;t.player.y=0;t.player.tool='axe';
  const near={kind:'tree',x:10,y:0,hp:5},far={kind:'tree',x:50,y:0,hp:5};t.props.push(far,near);
  t.tryHarvest(0,0,64,far);assert.equal(far.hp,4);assert.equal(near.hp,5);
  t.tryHarvest(0,0,64);assert.equal(near.hp,4);
  t.player.tool='knife';t.tryHarvest(0,0,64);assert.equal(near.hp,4);
  t.player.tool='pickaxe';t.tryHarvest(0,0,64);assert.equal(near.hp,4);
  t.player.tool='axe';t.tryHarvest(0,0,64,{kind:'tree',x:0,y:0,hp:5});assert.equal(near.hp,4);
  const berry={kind:'berry',x:20,y:0,ripe:true};t.props.push(berry);t.inv.berries=0;t.player.tool='knife';t.tryHarvest(0,0,64,berry);assert.equal(berry.ripe,false);assert(t.inv.berries>=1);
});
test('fuel increases monotonically and a full fire consumes no materials',()=>{
  t.fires.splice(0,t.fires.length,{x:0,y:0,lit:true,fuel:155});t.inv.wood=4;t.inv.charcoal=0;
  t.tryInteract();assert.equal(t.fires[0].fuel,160);assert.equal(t.inv.wood,3);t.tryInteract();assert.equal(t.inv.wood,3);
});
test('exit saves from pause and retains the run on storage failure',()=>{
  t.setState(3);t.returnToMainMenu();assert.equal(t.state,1);
  const original=c.localStorage.setItem;c.localStorage.setItem=()=>{throw new Error('simulated quota');};
  const oldConsole=c.console;c.console={...console,warn:noop};t.setState(3);t.returnToMainMenu();assert.equal(t.state,3);
  c.console=oldConsole;c.localStorage.setItem=original;
});
console.log(`${checks} expedition checks passed`);
