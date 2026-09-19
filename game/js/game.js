(() => {
  "use strict";

  const TILE = 64;
  let COLS = 180;
  let ROWS = 180;
  const UNIT = 192;
  const WATER = [71, 171, 169];
  const WORLD_SIZE = { cols: 425, rows: 425 }; // DST default/large tile count

  const STATE = { BOOT: 0, MENU: 1, CHAR: 6, CODEX: 7, PLAY: 2, PAUSE: 3, DEAD: 4, WIN: 5 };

  let charPick = "wilson";
  const CHARACTERS = [
    { id: "wilson", name: "KC1", desc: "均衡幸存者 · 生命/饥饿 150（DST）", hp: 150, hunger: 150, corr: 0, speed: 175 },
    { id: "willow", name: "KC2", desc: "喜火不怕黑 · 生命 120 · 火旁回理智", hp: 120, hunger: 150, corr: 5, speed: 180, fireSanity: true },
    { id: "wx", name: "KC3", desc: "机器 · 生命 150 · 雨中受伤 · 雷击回能", hp: 150, hunger: 150, corr: 0, speed: 170, robot: true },
    { id: "wolfgang", name: "KC4", desc: "饥饿 200 · 吃饱变壮（伤害/移速）", hp: 200, hunger: 200, corr: 0, speed: 170, mighty: true },
    { id: "wendy", name: "KC5", desc: "生命 150 · 黑暗理智流失减半", hp: 150, hunger: 150, corr: 10, speed: 175, nightSanity: true },
    { id: "woodie", name: "KC6", desc: "伐木高手 · 饥饿流失加快 · 斧头更耐用", hp: 150, hunger: 150, corr: 0, speed: 175, lumberjack: true },
  ];

  const T_WATER = 0, T_GRASS = 1, T_MAGIC = 2, T_ASH = 3, T_ICE = 4;

  function asset(path) {
    // index.html lives in /game/, assets live in pack root
    const q = path.indexOf("?");
    const file = q >= 0 ? path.slice(0, q) : path;
    const query = q >= 0 ? path.slice(q) : "";
    return "../" + file.split("/").map(encodeURIComponent).join("/") + query;
  }

  const PATHS = {
    tilesGrass: "Terrain/Tileset/Tilemap_color1.png",
    tilesSavanna: "Terrain/Tileset/Tilemap_color2.png",
    tilesDirt: "Terrain/Tileset/Tilemap_color3.png",
    tilesRocky: "Terrain/Tileset/Tilemap_color4.png",
    tilesMagic: "Terrain/Tileset/Tilemap_color5.png",
    water: "Terrain/Tileset/Water Background color.png",
    foam: "Terrain/Tileset/Water Foam.png",
    shadow: "Terrain/Tileset/Shadow.png",
    titleSplash: "game/assets/kc-keep-title.png?v=74",
    // Player is Pawn (gather / build). Warrior kept for combat NPCs elsewhere.
    pawnIdle: "Units/Blue Units/Pawn/Pawn_Idle.png",
    pawnRun: "Units/Blue Units/Pawn/Pawn_Run.png",
    pawnIdleAxe: "Units/Blue Units/Pawn/Pawn_Idle Axe.png",
    pawnRunAxe: "Units/Blue Units/Pawn/Pawn_Run Axe.png",
    pawnAtkAxe: "Units/Blue Units/Pawn/Pawn_Interact Axe.png",
    pawnIdlePick: "Units/Blue Units/Pawn/Pawn_Idle Pickaxe.png",
    pawnRunPick: "Units/Blue Units/Pawn/Pawn_Run Pickaxe.png",
    pawnAtkPick: "Units/Blue Units/Pawn/Pawn_Interact Pickaxe.png",
    pawnIdleKnife: "Units/Blue Units/Pawn/Pawn_Idle Knife.png",
    pawnRunKnife: "Units/Blue Units/Pawn/Pawn_Run Knife.png",
    pawnAtkKnife: "Units/Blue Units/Pawn/Pawn_Interact Knife.png",
    pawnIdleHammer: "Units/Blue Units/Pawn/Pawn_Idle Hammer.png",
    pawnRunHammer: "Units/Blue Units/Pawn/Pawn_Run Hammer.png",
    pawnAtkHammer: "Units/Blue Units/Pawn/Pawn_Interact Hammer.png",
    pawnIdleWood: "Units/Blue Units/Pawn/Pawn_Idle Wood.png",
    pawnRunWood: "Units/Blue Units/Pawn/Pawn_Run Wood.png",
    pawnIdleGold: "Units/Blue Units/Pawn/Pawn_Idle Gold.png",
    pawnRunGold: "Units/Blue Units/Pawn/Pawn_Run Gold.png",
    pawnIdleMeat: "Units/Blue Units/Pawn/Pawn_Idle Meat.png",
    pawnRunMeat: "Units/Blue Units/Pawn/Pawn_Run Meat.png",
    wIdle: "Units/Blue Units/Warrior/Warrior_Idle.png",
    wRun: "Units/Blue Units/Warrior/Warrior_Run.png",
    wAtk1: "Units/Blue Units/Warrior/Warrior_Attack1.png",
    wAtk2: "Units/Blue Units/Warrior/Warrior_Attack2.png",
    wGuard: "Units/Blue Units/Warrior/Warrior_Guard.png",
    rIdle: "Units/Red Units/Warrior/Warrior_Idle.png",
    rRun: "Units/Red Units/Warrior/Warrior_Run.png",
    rAtk1: "Units/Red Units/Warrior/Warrior_Attack1.png",
    rAtk2: "Units/Red Units/Warrior/Warrior_Attack2.png",
    aIdle: "Units/Red Units/Archer/Archer_Idle.png",
    aRun: "Units/Red Units/Archer/Archer_Run.png",
    aShoot: "Units/Red Units/Archer/Archer_Shoot.png",
    arrow: "Units/Red Units/Archer/Arrow.png",
    pIdle: "Units/Purple Units/Warrior/Warrior_Idle.png",
    pRun: "Units/Purple Units/Warrior/Warrior_Run.png",
    pAtk: "Units/Purple Units/Warrior/Warrior_Attack1.png",
    mIdle: "Units/Blue Units/Monk/Idle.png",
    mHeal: "Units/Blue Units/Monk/Heal.png",
    mHealFx: "Units/Blue Units/Monk/Heal_Effect.png",
    house: "Buildings/Blue Buildings/House1.png",
    house2: "Buildings/Blue Buildings/House2.png",
    house3: "Buildings/Blue Buildings/House3.png",
    monastery: "Buildings/Blue Buildings/Monastery.png",
    towerB: "Buildings/Blue Buildings/Tower.png",
    archeryB: "Buildings/Blue Buildings/Archery.png",
    barracksB: "Buildings/Blue Buildings/Barracks.png",
    castleB: "Buildings/Blue Buildings/Castle.png",
    castleR: "Buildings/Red Buildings/Castle.png",
    barracksR: "Buildings/Red Buildings/Barracks.png",
    towerR: "Buildings/Red Buildings/Tower.png",
    houseR: "Buildings/Red Buildings/House2.png",
    archeryR: "Buildings/Red Buildings/Archery.png",
    monasteryR: "Buildings/Red Buildings/Monastery.png",
    castleP: "Buildings/Purple Buildings/Castle.png",
    towerP: "Buildings/Purple Buildings/Tower.png",
    houseP: "Buildings/Purple Buildings/House1.png",
    barracksP: "Buildings/Purple Buildings/Barracks.png",
    archeryP: "Buildings/Purple Buildings/Archery.png",
    castleY: "Buildings/Yellow Buildings/Castle.png",
    towerY: "Buildings/Yellow Buildings/Tower.png",
    houseY: "Buildings/Yellow Buildings/House2.png",
    monasteryY: "Buildings/Yellow Buildings/Monastery.png",
    archeryY: "Buildings/Yellow Buildings/Archery.png",
    castleK: "Buildings/Black Buildings/Castle.png",
    towerK: "Buildings/Black Buildings/Tower.png",
    houseK: "Buildings/Black Buildings/House3.png",
    monasteryK: "Buildings/Black Buildings/Monastery.png",
    tree1: "Terrain/Resources/Wood/Trees/Tree1.png",
    tree2: "Terrain/Resources/Wood/Trees/Tree2.png",
    tree3: "Terrain/Resources/Wood/Trees/Tree3.png",
    tree4: "Terrain/Resources/Wood/Trees/Tree4.png",
    stump: "Terrain/Resources/Wood/Trees/Stump 1.png",
    stump2: "Terrain/Resources/Wood/Trees/Stump 2.png",
    gold: "Terrain/Resources/Gold/Gold Stones/Gold Stone 1.png",
    goldHi: "Terrain/Resources/Gold/Gold Stones/Gold Stone 1_Highlight.png",
    gold2: "Terrain/Resources/Gold/Gold Stones/Gold Stone 2.png",
    gold3: "Terrain/Resources/Gold/Gold Stones/Gold Stone 3.png",
    sheepI: "Terrain/Resources/Meat/Sheep/Sheep_Idle.png",
    sheepM: "Terrain/Resources/Meat/Sheep/Sheep_Move.png",
    woodIcon: "Terrain/Resources/Wood/Wood Resource/Wood Resource.png",
    goldIcon: "Terrain/Resources/Gold/Gold Resource/Gold_Resource.png",
    meatIcon: "Terrain/Resources/Meat/Meat Resource/Meat Resource.png",
    bush: "Terrain/Decorations/Bushes/Bushe1.png",
    bush2: "Terrain/Decorations/Bushes/Bushe2.png",
    bush3: "Terrain/Decorations/Bushes/Bushe3.png",
    bush4: "Terrain/Decorations/Bushes/Bushe4.png",
    rock: "Terrain/Decorations/Rocks/Rock1.png",
    rock2: "Terrain/Decorations/Rocks/Rock2.png",
    rock3: "Terrain/Decorations/Rocks/Rock3.png",
    rock4: "Terrain/Decorations/Rocks/Rock4.png",
    waterRock1: "Terrain/Decorations/Rocks in the Water/Water Rocks_01.png",
    waterRock2: "Terrain/Decorations/Rocks in the Water/Water Rocks_02.png",
    rubberDuck: "Terrain/Decorations/Rubber Duck/Rubber duck.png",
    deco1: "Tiny Swords (Update 010)/Deco/01.png",
    deco2: "Tiny Swords (Update 010)/Deco/02.png",
    deco3: "Tiny Swords (Update 010)/Deco/03.png",
    deco4: "Tiny Swords (Update 010)/Deco/04.png",
    deco5: "Tiny Swords (Update 010)/Deco/05.png",
    deco6: "Tiny Swords (Update 010)/Deco/06.png",
    happySheep: "Tiny Swords (Update 010)/Resources/Sheep/HappySheep_Idle.png",
    dynamite: "Tiny Swords (Update 010)/Factions/Goblins/Troops/TNT/Dynamite/Dynamite.png",
    woodTowerG: "Tiny Swords (Update 010)/Factions/Goblins/Buildings/Wood_Tower/Wood_Tower_Red.png",
    barrelGob: "Tiny Swords (Update 010)/Factions/Goblins/Troops/Barrel/Red/Barrel_Red.png",
    bkIdle: "Units/Black Units/Warrior/Warrior_Idle.png",
    bkRun: "Units/Black Units/Warrior/Warrior_Run.png",
    bkAtk: "Units/Black Units/Warrior/Warrior_Attack1.png",
    ykIdle: "Units/Yellow Units/Warrior/Warrior_Idle.png",
    ykRun: "Units/Yellow Units/Warrior/Warrior_Run.png",
    ykAtk: "Units/Yellow Units/Warrior/Warrior_Attack1.png",
    cannonUp: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Cannon/Cannon_Up.png",
    cannonDown: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Cannon/Cannon_Down.png",
    cloud: "Terrain/Decorations/Clouds/Clouds_01.png",
    cloud2: "Terrain/Decorations/Clouds/Clouds_02.png",
    cloud3: "Terrain/Decorations/Clouds/Clouds_03.png",
    fire: "Particle FX/Fire_02.png",
    fireB: "Particle FX/Fire_03.png",
    boom: "Particle FX/Explosion_01.png",
    dust: "Particle FX/Dust_01.png",
    splash: "Particle FX/Water Splash.png",
    avatar: "UI Elements/UI Elements/Human Avatars/Avatars_01.png",
    avatarWar: "UI Elements/UI Elements/Human Avatars/Avatars_05.png",
    barBase: "UI Elements/UI Elements/Bars/BigBar_Base.png",
    barFill: "UI Elements/UI Elements/Bars/BigBar_Fill.png",
    icoWood: "UI Elements/UI Elements/Icons/Icon_02.png",
    icoGold: "UI Elements/UI Elements/Icons/Icon_03.png",
    icoMeat: "UI Elements/UI Elements/Icons/Icon_04.png",
    icoSword: "UI Elements/UI Elements/Icons/Icon_05.png",
    icoShield: "UI Elements/UI Elements/Icons/Icon_06.png",
    icoGem: "UI Elements/UI Elements/Icons/Icon_07.png",
    paper: "UI Elements/UI Elements/Papers/RegularPaper.png",
    banner: "UI Elements/UI Elements/Banners/Banner.png",
    btn: "UI Elements/UI Elements/Buttons/BigBlueButton_Regular.png",
    btnP: "UI Elements/UI Elements/Buttons/BigBlueButton_Pressed.png",
    cursor: "UI Elements/UI Elements/Cursors/Cursor_01.png",
    cursorAtk: "UI Elements/UI Elements/Cursors/Cursor_02.png",
    uiCarved: "Tiny Swords (Update 010)/UI/Banners/Carved_9Slides.png",
    uiBtnBlue: "Tiny Swords (Update 010)/UI/Buttons/Button_Blue_9Slides.png",
    uiBtnBlueP: "Tiny Swords (Update 010)/UI/Buttons/Button_Blue_9Slides_Pressed.png",
    goldMine: "Tiny Swords (Update 010)/Resources/Gold Mine/GoldMine_Active.png",
    goldMineOff: "Tiny Swords (Update 010)/Resources/Gold Mine/GoldMine_Inactive.png",
    goblinHouse: "Tiny Swords (Update 010)/Factions/Goblins/Buildings/Wood_House/Goblin_House.png",
    goblinHut: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Goblin Hut/Goblin Hut.png",
    gnomeTower: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Gnome Buildings/Gnome Tower.png",
    gnomeHut: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Gnome Buildings/Gnome Hut.png",
    hexBolt: "Tiny Swords (Enemy Pack)/Enemy Pack/Hex Shaman/Hex Shaman_Projectile.png",
    gnollBone: "Tiny Swords (Enemy Pack)/Enemy Pack/Gnoll/Gnoll_Bone.png",
    caveIdle: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Cave/Cave_Idle.png",
    woodFence: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Wooden Fence/Wooden Fence_64x64 tile.png",
    deadTree: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Dead Tree/Dead Tree.png",
    skullSpike: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Skull decorations/Skull Spike_01.png",
    bones1: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Skull decorations/Bones_01.png",
    bones2: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Skull decorations/Bones_02.png",
    minotaurGuard: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Minotaur Guard/Minotaur_Guard.png",
    pandaGuard: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Panda Guard/Panda_Guard.png",
    skullGuard: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Skull Guard/Skull_Guard.png",
    turtleGuard: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Turtle Guard/Turtle_Guard_Out.png",
    pigIdle: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Pig/Pig_Idle.png",
    pigRun: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Pig/Pig_Run.png",
    boatIdle: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Boat/Boat_Idle.png",
    harpoon: "Tiny Swords (Enemy Pack)/Enemy Pack/Harpoon Shark/Harpoon.png",
    bombSpin: "Tiny Swords (Enemy Pack)/Enemy Pack/Bomb Fish/Bomb_Spinning.png",
    pirateTowerG: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Pirate Tower/Pirate Tower_Ground.png",
    pirateTowerW: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Pirate Tower/Pirate Tower_Water.png",
    acorn: "Tiny Swords (Enemy Pack)/Enemy Pack/Slingshot Gnome/Acorn_Projectile.png",
    icoBuff1: "UI Elements/UI Elements/Icons/Icon_08.png",
    icoBuff2: "UI Elements/UI Elements/Icons/Icon_05.png",
    icoBuff3: "UI Elements/UI Elements/Icons/Icon_03.png",
    fishHut: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Fish Hut/Fish Hut.png",
    cannonBall: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Cannon/Cannon_Ball.png",
    cannonRight: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Cannon/Cannon_Right.png",
    cannonUpRight: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Cannon/Cannon_UpRight.png",
    cannonDownRight: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Cannon/Cannon_DownRight.png",
    castleKU010: "Tiny Swords (Update 010)/Factions/Knights/Buildings/Castle/Castle_Blue.png",
    castleKBuild: "Tiny Swords (Update 010)/Factions/Knights/Buildings/Castle/Castle_Construction.png",
    goldMineDead: "Tiny Swords (Update 010)/Resources/Gold Mine/GoldMine_Destroyed.png",
    seahorseIdle: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Seahorse Boat/Seahorse Boat_Idle.png",
    lancerIdle: "Units/Red Units/Lancer/Lancer_Idle.png",
    lancerRun: "Units/Red Units/Lancer/Lancer_Run.png",
    lancerAtk: "Units/Red Units/Lancer/Lancer_Right_Attack.png",
    icoActForm: "UI Elements/UI Elements/Icons/Icon_05.png",
    icoActUse: "UI Elements/UI Elements/Icons/Icon_10.png",
    icoActEat: "UI Elements/UI Elements/Icons/Icon_04.png",
    icoActTorch: "UI Elements/UI Elements/Icons/Icon_07.png",
    icoActHammer: "UI Elements/UI Elements/Icons/Icon_01.png",
    icoActGather: "UI Elements/UI Elements/Icons/Icon_01.png",
    slotSq: "UI Elements/UI Elements/Buttons/TinySquareBlueButton.png",
    slotSqRed: "UI Elements/UI Elements/Buttons/TinySquareRedButton.png",
    btnRed: "UI Elements/UI Elements/Buttons/BigRedButton_Regular.png",

    // —— Extra Free Pack buildings (missing colors) ——
    houseR1: "Buildings/Red Buildings/House1.png",
    houseR3: "Buildings/Red Buildings/House3.png",
    houseP2: "Buildings/Purple Buildings/House2.png",
    houseP3: "Buildings/Purple Buildings/House3.png",
    monasteryP: "Buildings/Purple Buildings/Monastery.png",
    houseY1: "Buildings/Yellow Buildings/House1.png",
    houseY3: "Buildings/Yellow Buildings/House3.png",
    barracksY: "Buildings/Yellow Buildings/Barracks.png",
    houseK1: "Buildings/Black Buildings/House1.png",
    houseK2: "Buildings/Black Buildings/House2.png",
    archeryK: "Buildings/Black Buildings/Archery.png",
    barracksK: "Buildings/Black Buildings/Barracks.png",
    castleKFree: "Buildings/Black Buildings/Castle.png",
    // —— Blue Archer / Lancer (camp guards) ——
    bArcherIdle: "Units/Blue Units/Archer/Archer_Idle.png",
    bArcherRun: "Units/Blue Units/Archer/Archer_Run.png",
    bArcherShoot: "Units/Blue Units/Archer/Archer_Shoot.png",
    bArrow: "Units/Blue Units/Archer/Arrow.png",
    bLancerIdle: "Units/Blue Units/Lancer/Lancer_Idle.png",
    bLancerRun: "Units/Blue Units/Lancer/Lancer_Run.png",
    bLancerAtk: "Units/Blue Units/Lancer/Lancer_Right_Attack.png",
    // —— Update 010 deco 07–18 ——
    deco7: "Tiny Swords (Update 010)/Deco/07.png",
    deco8: "Tiny Swords (Update 010)/Deco/08.png",
    deco9: "Tiny Swords (Update 010)/Deco/09.png",
    deco10: "Tiny Swords (Update 010)/Deco/10.png",
    deco11: "Tiny Swords (Update 010)/Deco/11.png",
    deco12: "Tiny Swords (Update 010)/Deco/12.png",
    deco13: "Tiny Swords (Update 010)/Deco/13.png",
    deco14: "Tiny Swords (Update 010)/Deco/14.png",
    deco15: "Tiny Swords (Update 010)/Deco/15.png",
    deco16: "Tiny Swords (Update 010)/Deco/16.png",
    deco17: "Tiny Swords (Update 010)/Deco/17.png",
    deco18: "Tiny Swords (Update 010)/Deco/18.png",
    // —— Extra terrain resources ——
    stump3: "Terrain/Resources/Wood/Trees/Stump 3.png",
    stump4: "Terrain/Resources/Wood/Trees/Stump 4.png",
    gold4: "Terrain/Resources/Gold/Gold Stones/Gold Stone 4.png",
    gold5: "Terrain/Resources/Gold/Gold Stones/Gold Stone 5.png",
    gold6: "Terrain/Resources/Gold/Gold Stones/Gold Stone 6.png",
    tool1: "Terrain/Resources/Tools/Tool_01.png",
    tool2: "Terrain/Resources/Tools/Tool_02.png",
    tool3: "Terrain/Resources/Tools/Tool_03.png",
    tool4: "Terrain/Resources/Tools/Tool_04.png",
    waterRock3: "Terrain/Decorations/Rocks in the Water/Water Rocks_03.png",
    waterRock4: "Terrain/Decorations/Rocks in the Water/Water Rocks_04.png",
    cloud4: "Terrain/Decorations/Clouds/Clouds_04.png",
    cloud5: "Terrain/Decorations/Clouds/Clouds_05.png",
    // —— Update 010 Knight buildings ——
    knightHouseB: "Tiny Swords (Update 010)/Factions/Knights/Buildings/House/House_Blue.png",
    knightHouseR: "Tiny Swords (Update 010)/Factions/Knights/Buildings/House/House_Red.png",
    knightHouseP: "Tiny Swords (Update 010)/Factions/Knights/Buildings/House/House_Purple.png",
    knightHouseY: "Tiny Swords (Update 010)/Factions/Knights/Buildings/House/House_Yellow.png",
    knightTowerB: "Tiny Swords (Update 010)/Factions/Knights/Buildings/Tower/Tower_Blue.png",
    knightTowerR: "Tiny Swords (Update 010)/Factions/Knights/Buildings/Tower/Tower_Red.png",
    knightTowerP: "Tiny Swords (Update 010)/Factions/Knights/Buildings/Tower/Tower_Purple.png",
    knightTowerY: "Tiny Swords (Update 010)/Factions/Knights/Buildings/Tower/Tower_Yellow.png",
    castleKR: "Tiny Swords (Update 010)/Factions/Knights/Buildings/Castle/Castle_Red.png",
    castleKP: "Tiny Swords (Update 010)/Factions/Knights/Buildings/Castle/Castle_Purple.png",
    castleKY: "Tiny Swords (Update 010)/Factions/Knights/Buildings/Castle/Castle_Yellow.png",
    // —— Update 010 Goblin towers ——
    woodTowerB: "Tiny Swords (Update 010)/Factions/Goblins/Buildings/Wood_Tower/Wood_Tower_Blue.png",
    woodTowerP: "Tiny Swords (Update 010)/Factions/Goblins/Buildings/Wood_Tower/Wood_Tower_Purple.png",
    woodTowerY: "Tiny Swords (Update 010)/Factions/Goblins/Buildings/Wood_Tower/Wood_Tower_Yellow.png",
    // —— FX leftovers ——
    fire1: "Particle FX/Fire_01.png",
    dust2: "Particle FX/Dust_02.png",
    boom2: "Particle FX/Explosion_02.png",
    goldResHi: "Terrain/Resources/Gold/Gold Resource/Gold_Resource_Highlight.png",
    cloud6: "Terrain/Decorations/Clouds/Clouds_06.png",
    cloud7: "Terrain/Decorations/Clouds/Clouds_07.png",
    cloud8: "Terrain/Decorations/Clouds/Clouds_08.png",
    gold2Hi: "Terrain/Resources/Gold/Gold Stones/Gold Stone 2_Highlight.png",
    gold3Hi: "Terrain/Resources/Gold/Gold Stones/Gold Stone 3_Highlight.png",
    gold4Hi: "Terrain/Resources/Gold/Gold Stones/Gold Stone 4_Highlight.png",
    gold5Hi: "Terrain/Resources/Gold/Gold Stones/Gold Stone 5_Highlight.png",
    gold6Hi: "Terrain/Resources/Gold/Gold Stones/Gold Stone 6_Highlight.png",
    sheepGrass: "Terrain/Resources/Meat/Sheep/Sheep_Grass.png",
    yArcherIdle: "Units/Yellow Units/Archer/Archer_Idle.png",
    yArcherRun: "Units/Yellow Units/Archer/Archer_Run.png",
    yArcherShoot: "Units/Yellow Units/Archer/Archer_Shoot.png",
    pArcherIdle: "Units/Purple Units/Archer/Archer_Idle.png",
    pArcherRun: "Units/Purple Units/Archer/Archer_Run.png",
    pArcherShoot: "Units/Purple Units/Archer/Archer_Shoot.png",
    kArcherIdle: "Units/Black Units/Archer/Archer_Idle.png",
    kArcherRun: "Units/Black Units/Archer/Archer_Run.png",
    kArcherShoot: "Units/Black Units/Archer/Archer_Shoot.png",
    yLancerIdle: "Units/Yellow Units/Lancer/Lancer_Idle.png",
    yLancerRun: "Units/Yellow Units/Lancer/Lancer_Run.png",
    yLancerAtk: "Units/Yellow Units/Lancer/Lancer_Right_Attack.png",
    pLancerIdle: "Units/Purple Units/Lancer/Lancer_Idle.png",
    pLancerRun: "Units/Purple Units/Lancer/Lancer_Run.png",
    pLancerAtk: "Units/Purple Units/Lancer/Lancer_Right_Attack.png",
    kLancerIdle: "Units/Black Units/Lancer/Lancer_Idle.png",
    kLancerRun: "Units/Black Units/Lancer/Lancer_Run.png",
    kLancerAtk: "Units/Black Units/Lancer/Lancer_Right_Attack.png",
    knightHouseDestroyed: "Tiny Swords (Update 010)/Factions/Knights/Buildings/House/House_Destroyed.png",
    knightTowerDestroyed: "Tiny Swords (Update 010)/Factions/Knights/Buildings/Tower/Tower_Destroyed.png",
    castleKDestroyed: "Tiny Swords (Update 010)/Factions/Knights/Buildings/Castle/Castle_Destroyed.png",
    woodTowerDestroyed: "Tiny Swords (Update 010)/Factions/Goblins/Buildings/Wood_Tower/Wood_Tower_Destroyed.png",
    goblinHouseDestroyed: "Tiny Swords (Update 010)/Factions/Goblins/Buildings/Wood_House/Goblin_House_Destroyed.png",
    u010Tree: "Tiny Swords (Update 010)/Resources/Trees/Tree.png",
    u010Sheep: "Tiny Swords (Update 010)/Resources/Sheep/HappySheep_All.png",
    u010Wood: "Tiny Swords (Update 010)/Resources/Resources/W_Idle.png",
    u010GoldRes: "Tiny Swords (Update 010)/Resources/Resources/G_Idle.png",
    u010Meat: "Tiny Swords (Update 010)/Resources/Resources/M_Idle.png",
    u010Bridge: "Tiny Swords (Update 010)/Terrain/Bridge/Bridge_All.png",
    u010WaterRock1: "Tiny Swords (Update 010)/Terrain/Water/Rocks/Rocks_01.png",
    u010WaterRock2: "Tiny Swords (Update 010)/Terrain/Water/Rocks/Rocks_02.png",
    u010WaterRock3: "Tiny Swords (Update 010)/Terrain/Water/Rocks/Rocks_03.png",
    u010WaterRock4: "Tiny Swords (Update 010)/Terrain/Water/Rocks/Rocks_04.png",
    u010Fire: "Tiny Swords (Update 010)/Effects/Fire/Fire.png",
    u010Boom: "Tiny Swords (Update 010)/Effects/Explosion/Explosions.png",
    // —— AUTO: remaining pack assets (full inventory) ——
    pack_Units_Black_Units_Archer_Arrow_png: "Units/Black Units/Archer/Arrow.png",
    pack_Units_Black_Units_Lancer_Lancer_DownRight_Attack_png: "Units/Black Units/Lancer/Lancer_DownRight_Attack.png",
    pack_Units_Black_Units_Lancer_Lancer_DownRight_Defence_png: "Units/Black Units/Lancer/Lancer_DownRight_Defence.png",
    pack_Units_Black_Units_Lancer_Lancer_Down_Attack_png: "Units/Black Units/Lancer/Lancer_Down_Attack.png",
    pack_Units_Black_Units_Lancer_Lancer_Down_Defence_png: "Units/Black Units/Lancer/Lancer_Down_Defence.png",
    pack_Units_Black_Units_Lancer_Lancer_Right_Defence_png: "Units/Black Units/Lancer/Lancer_Right_Defence.png",
    pack_Units_Black_Units_Lancer_Lancer_UpRight_Attack_png: "Units/Black Units/Lancer/Lancer_UpRight_Attack.png",
    pack_Units_Black_Units_Lancer_Lancer_UpRight_Defence_png: "Units/Black Units/Lancer/Lancer_UpRight_Defence.png",
    pack_Units_Black_Units_Lancer_Lancer_Up_Attack_png: "Units/Black Units/Lancer/Lancer_Up_Attack.png",
    pack_Units_Black_Units_Lancer_Lancer_Up_Defence_png: "Units/Black Units/Lancer/Lancer_Up_Defence.png",
    pack_Units_Black_Units_Monk_Heal_png: "Units/Black Units/Monk/Heal.png",
    pack_Units_Black_Units_Monk_Heal_Effect_png: "Units/Black Units/Monk/Heal_Effect.png",
    pack_Units_Black_Units_Monk_Idle_png: "Units/Black Units/Monk/Idle.png",
    pack_Units_Black_Units_Monk_Run_png: "Units/Black Units/Monk/Run.png",
    pack_Units_Black_Units_Pawn_Pawn_Idle_Axe_png: "Units/Black Units/Pawn/Pawn_Idle Axe.png",
    pack_Units_Black_Units_Pawn_Pawn_Idle_Gold_png: "Units/Black Units/Pawn/Pawn_Idle Gold.png",
    pack_Units_Black_Units_Pawn_Pawn_Idle_Hammer_png: "Units/Black Units/Pawn/Pawn_Idle Hammer.png",
    pack_Units_Black_Units_Pawn_Pawn_Idle_Knife_png: "Units/Black Units/Pawn/Pawn_Idle Knife.png",
    pack_Units_Black_Units_Pawn_Pawn_Idle_Meat_png: "Units/Black Units/Pawn/Pawn_Idle Meat.png",
    pack_Units_Black_Units_Pawn_Pawn_Idle_Pickaxe_png: "Units/Black Units/Pawn/Pawn_Idle Pickaxe.png",
    pack_Units_Black_Units_Pawn_Pawn_Idle_Wood_png: "Units/Black Units/Pawn/Pawn_Idle Wood.png",
    pack_Units_Black_Units_Pawn_Pawn_Idle_png: "Units/Black Units/Pawn/Pawn_Idle.png",
    pack_Units_Black_Units_Pawn_Pawn_Interact_Axe_png: "Units/Black Units/Pawn/Pawn_Interact Axe.png",
    pack_Units_Black_Units_Pawn_Pawn_Interact_Hammer_png: "Units/Black Units/Pawn/Pawn_Interact Hammer.png",
    pack_Units_Black_Units_Pawn_Pawn_Interact_Knife_png: "Units/Black Units/Pawn/Pawn_Interact Knife.png",
    pack_Units_Black_Units_Pawn_Pawn_Interact_Pickaxe_png: "Units/Black Units/Pawn/Pawn_Interact Pickaxe.png",
    pack_Units_Black_Units_Pawn_Pawn_Run_Axe_png: "Units/Black Units/Pawn/Pawn_Run Axe.png",
    pack_Units_Black_Units_Pawn_Pawn_Run_Gold_png: "Units/Black Units/Pawn/Pawn_Run Gold.png",
    pack_Units_Black_Units_Pawn_Pawn_Run_Hammer_png: "Units/Black Units/Pawn/Pawn_Run Hammer.png",
    pack_Units_Black_Units_Pawn_Pawn_Run_Knife_png: "Units/Black Units/Pawn/Pawn_Run Knife.png",
    pack_Units_Black_Units_Pawn_Pawn_Run_Meat_png: "Units/Black Units/Pawn/Pawn_Run Meat.png",
    pack_Units_Black_Units_Pawn_Pawn_Run_Pickaxe_png: "Units/Black Units/Pawn/Pawn_Run Pickaxe.png",
    pack_Units_Black_Units_Pawn_Pawn_Run_Wood_png: "Units/Black Units/Pawn/Pawn_Run Wood.png",
    pack_Units_Black_Units_Pawn_Pawn_Run_png: "Units/Black Units/Pawn/Pawn_Run.png",
    pack_Units_Black_Units_Warrior_Warrior_Attack2_png: "Units/Black Units/Warrior/Warrior_Attack2.png",
    pack_Units_Black_Units_Warrior_Warrior_Guard_png: "Units/Black Units/Warrior/Warrior_Guard.png",
    pack_Units_Blue_Units_Lancer_Lancer_DownRight_Attack_png: "Units/Blue Units/Lancer/Lancer_DownRight_Attack.png",
    pack_Units_Blue_Units_Lancer_Lancer_DownRight_Defence_png: "Units/Blue Units/Lancer/Lancer_DownRight_Defence.png",
    pack_Units_Blue_Units_Lancer_Lancer_Down_Attack_png: "Units/Blue Units/Lancer/Lancer_Down_Attack.png",
    pack_Units_Blue_Units_Lancer_Lancer_Down_Defence_png: "Units/Blue Units/Lancer/Lancer_Down_Defence.png",
    pack_Units_Blue_Units_Lancer_Lancer_Right_Defence_png: "Units/Blue Units/Lancer/Lancer_Right_Defence.png",
    pack_Units_Blue_Units_Lancer_Lancer_UpRight_Attack_png: "Units/Blue Units/Lancer/Lancer_UpRight_Attack.png",
    pack_Units_Blue_Units_Lancer_Lancer_UpRight_Defence_png: "Units/Blue Units/Lancer/Lancer_UpRight_Defence.png",
    pack_Units_Blue_Units_Lancer_Lancer_Up_Attack_png: "Units/Blue Units/Lancer/Lancer_Up_Attack.png",
    pack_Units_Blue_Units_Lancer_Lancer_Up_Defence_png: "Units/Blue Units/Lancer/Lancer_Up_Defence.png",
    pack_Units_Blue_Units_Monk_Run_png: "Units/Blue Units/Monk/Run.png",
    pack_Units_Purple_Units_Archer_Arrow_png: "Units/Purple Units/Archer/Arrow.png",
    pack_Units_Purple_Units_Lancer_Lancer_DownRight_Attack_png: "Units/Purple Units/Lancer/Lancer_DownRight_Attack.png",
    pack_Units_Purple_Units_Lancer_Lancer_DownRight_Defence_png: "Units/Purple Units/Lancer/Lancer_DownRight_Defence.png",
    pack_Units_Purple_Units_Lancer_Lancer_Down_Attack_png: "Units/Purple Units/Lancer/Lancer_Down_Attack.png",
    pack_Units_Purple_Units_Lancer_Lancer_Down_Defence_png: "Units/Purple Units/Lancer/Lancer_Down_Defence.png",
    pack_Units_Purple_Units_Lancer_Lancer_Right_Defence_png: "Units/Purple Units/Lancer/Lancer_Right_Defence.png",
    pack_Units_Purple_Units_Lancer_Lancer_UpRight_Attack_png: "Units/Purple Units/Lancer/Lancer_UpRight_Attack.png",
    pack_Units_Purple_Units_Lancer_Lancer_UpRight_Defence_png: "Units/Purple Units/Lancer/Lancer_UpRight_Defence.png",
    pack_Units_Purple_Units_Lancer_Lancer_Up_Attack_png: "Units/Purple Units/Lancer/Lancer_Up_Attack.png",
    pack_Units_Purple_Units_Lancer_Lancer_Up_Defence_png: "Units/Purple Units/Lancer/Lancer_Up_Defence.png",
    pack_Units_Purple_Units_Monk_Heal_png: "Units/Purple Units/Monk/Heal.png",
    pack_Units_Purple_Units_Monk_Heal_Effect_png: "Units/Purple Units/Monk/Heal_Effect.png",
    pack_Units_Purple_Units_Monk_Idle_png: "Units/Purple Units/Monk/Idle.png",
    pack_Units_Purple_Units_Monk_Run_png: "Units/Purple Units/Monk/Run.png",
    pack_Units_Purple_Units_Pawn_Pawn_Idle_Axe_png: "Units/Purple Units/Pawn/Pawn_Idle Axe.png",
    pack_Units_Purple_Units_Pawn_Pawn_Idle_Gold_png: "Units/Purple Units/Pawn/Pawn_Idle Gold.png",
    pack_Units_Purple_Units_Pawn_Pawn_Idle_Hammer_png: "Units/Purple Units/Pawn/Pawn_Idle Hammer.png",
    pack_Units_Purple_Units_Pawn_Pawn_Idle_Knife_png: "Units/Purple Units/Pawn/Pawn_Idle Knife.png",
    pack_Units_Purple_Units_Pawn_Pawn_Idle_Meat_png: "Units/Purple Units/Pawn/Pawn_Idle Meat.png",
    pack_Units_Purple_Units_Pawn_Pawn_Idle_Pickaxe_png: "Units/Purple Units/Pawn/Pawn_Idle Pickaxe.png",
    pack_Units_Purple_Units_Pawn_Pawn_Idle_Wood_png: "Units/Purple Units/Pawn/Pawn_Idle Wood.png",
    pack_Units_Purple_Units_Pawn_Pawn_Idle_png: "Units/Purple Units/Pawn/Pawn_Idle.png",
    pack_Units_Purple_Units_Pawn_Pawn_Interact_Axe_png: "Units/Purple Units/Pawn/Pawn_Interact Axe.png",
    pack_Units_Purple_Units_Pawn_Pawn_Interact_Hammer_png: "Units/Purple Units/Pawn/Pawn_Interact Hammer.png",
    pack_Units_Purple_Units_Pawn_Pawn_Interact_Knife_png: "Units/Purple Units/Pawn/Pawn_Interact Knife.png",
    pack_Units_Purple_Units_Pawn_Pawn_Interact_Pickaxe_png: "Units/Purple Units/Pawn/Pawn_Interact Pickaxe.png",
    pack_Units_Purple_Units_Pawn_Pawn_Run_Axe_png: "Units/Purple Units/Pawn/Pawn_Run Axe.png",
    pack_Units_Purple_Units_Pawn_Pawn_Run_Gold_png: "Units/Purple Units/Pawn/Pawn_Run Gold.png",
    pack_Units_Purple_Units_Pawn_Pawn_Run_Hammer_png: "Units/Purple Units/Pawn/Pawn_Run Hammer.png",
    pack_Units_Purple_Units_Pawn_Pawn_Run_Knife_png: "Units/Purple Units/Pawn/Pawn_Run Knife.png",
    pack_Units_Purple_Units_Pawn_Pawn_Run_Meat_png: "Units/Purple Units/Pawn/Pawn_Run Meat.png",
    pack_Units_Purple_Units_Pawn_Pawn_Run_Pickaxe_png: "Units/Purple Units/Pawn/Pawn_Run Pickaxe.png",
    pack_Units_Purple_Units_Pawn_Pawn_Run_Wood_png: "Units/Purple Units/Pawn/Pawn_Run Wood.png",
    pack_Units_Purple_Units_Pawn_Pawn_Run_png: "Units/Purple Units/Pawn/Pawn_Run.png",
    pack_Units_Purple_Units_Warrior_Warrior_Attack2_png: "Units/Purple Units/Warrior/Warrior_Attack2.png",
    pack_Units_Purple_Units_Warrior_Warrior_Guard_png: "Units/Purple Units/Warrior/Warrior_Guard.png",
    pack_Units_Red_Units_Lancer_Lancer_DownRight_Attack_png: "Units/Red Units/Lancer/Lancer_DownRight_Attack.png",
    pack_Units_Red_Units_Lancer_Lancer_DownRight_Defence_png: "Units/Red Units/Lancer/Lancer_DownRight_Defence.png",
    pack_Units_Red_Units_Lancer_Lancer_Down_Attack_png: "Units/Red Units/Lancer/Lancer_Down_Attack.png",
    pack_Units_Red_Units_Lancer_Lancer_Down_Defence_png: "Units/Red Units/Lancer/Lancer_Down_Defence.png",
    pack_Units_Red_Units_Lancer_Lancer_Right_Defence_png: "Units/Red Units/Lancer/Lancer_Right_Defence.png",
    pack_Units_Red_Units_Lancer_Lancer_UpRight_Attack_png: "Units/Red Units/Lancer/Lancer_UpRight_Attack.png",
    pack_Units_Red_Units_Lancer_Lancer_UpRight_Defence_png: "Units/Red Units/Lancer/Lancer_UpRight_Defence.png",
    pack_Units_Red_Units_Lancer_Lancer_Up_Attack_png: "Units/Red Units/Lancer/Lancer_Up_Attack.png",
    pack_Units_Red_Units_Lancer_Lancer_Up_Defence_png: "Units/Red Units/Lancer/Lancer_Up_Defence.png",
    pack_Units_Red_Units_Monk_Heal_png: "Units/Red Units/Monk/Heal.png",
    pack_Units_Red_Units_Monk_Heal_Effect_png: "Units/Red Units/Monk/Heal_Effect.png",
    pack_Units_Red_Units_Monk_Idle_png: "Units/Red Units/Monk/Idle.png",
    pack_Units_Red_Units_Monk_Run_png: "Units/Red Units/Monk/Run.png",
    pack_Units_Red_Units_Pawn_Pawn_Idle_Axe_png: "Units/Red Units/Pawn/Pawn_Idle Axe.png",
    pack_Units_Red_Units_Pawn_Pawn_Idle_Gold_png: "Units/Red Units/Pawn/Pawn_Idle Gold.png",
    pack_Units_Red_Units_Pawn_Pawn_Idle_Hammer_png: "Units/Red Units/Pawn/Pawn_Idle Hammer.png",
    pack_Units_Red_Units_Pawn_Pawn_Idle_Knife_png: "Units/Red Units/Pawn/Pawn_Idle Knife.png",
    pack_Units_Red_Units_Pawn_Pawn_Idle_Meat_png: "Units/Red Units/Pawn/Pawn_Idle Meat.png",
    pack_Units_Red_Units_Pawn_Pawn_Idle_Pickaxe_png: "Units/Red Units/Pawn/Pawn_Idle Pickaxe.png",
    pack_Units_Red_Units_Pawn_Pawn_Idle_Wood_png: "Units/Red Units/Pawn/Pawn_Idle Wood.png",
    pack_Units_Red_Units_Pawn_Pawn_Idle_png: "Units/Red Units/Pawn/Pawn_Idle.png",
    pack_Units_Red_Units_Pawn_Pawn_Interact_Axe_png: "Units/Red Units/Pawn/Pawn_Interact Axe.png",
    pack_Units_Red_Units_Pawn_Pawn_Interact_Hammer_png: "Units/Red Units/Pawn/Pawn_Interact Hammer.png",
    pack_Units_Red_Units_Pawn_Pawn_Interact_Knife_png: "Units/Red Units/Pawn/Pawn_Interact Knife.png",
    pack_Units_Red_Units_Pawn_Pawn_Interact_Pickaxe_png: "Units/Red Units/Pawn/Pawn_Interact Pickaxe.png",
    pack_Units_Red_Units_Pawn_Pawn_Run_Axe_png: "Units/Red Units/Pawn/Pawn_Run Axe.png",
    pack_Units_Red_Units_Pawn_Pawn_Run_Gold_png: "Units/Red Units/Pawn/Pawn_Run Gold.png",
    pack_Units_Red_Units_Pawn_Pawn_Run_Hammer_png: "Units/Red Units/Pawn/Pawn_Run Hammer.png",
    pack_Units_Red_Units_Pawn_Pawn_Run_Knife_png: "Units/Red Units/Pawn/Pawn_Run Knife.png",
    pack_Units_Red_Units_Pawn_Pawn_Run_Meat_png: "Units/Red Units/Pawn/Pawn_Run Meat.png",
    pack_Units_Red_Units_Pawn_Pawn_Run_Pickaxe_png: "Units/Red Units/Pawn/Pawn_Run Pickaxe.png",
    pack_Units_Red_Units_Pawn_Pawn_Run_Wood_png: "Units/Red Units/Pawn/Pawn_Run Wood.png",
    pack_Units_Red_Units_Pawn_Pawn_Run_png: "Units/Red Units/Pawn/Pawn_Run.png",
    pack_Units_Red_Units_Warrior_Warrior_Guard_png: "Units/Red Units/Warrior/Warrior_Guard.png",
    pack_Units_Yellow_Units_Archer_Arrow_png: "Units/Yellow Units/Archer/Arrow.png",
    pack_Units_Yellow_Units_Lancer_Lancer_DownRight_Attack_png: "Units/Yellow Units/Lancer/Lancer_DownRight_Attack.png",
    pack_Units_Yellow_Units_Lancer_Lancer_DownRight_Defence_png: "Units/Yellow Units/Lancer/Lancer_DownRight_Defence.png",
    pack_Units_Yellow_Units_Lancer_Lancer_Down_Attack_png: "Units/Yellow Units/Lancer/Lancer_Down_Attack.png",
    pack_Units_Yellow_Units_Lancer_Lancer_Down_Defence_png: "Units/Yellow Units/Lancer/Lancer_Down_Defence.png",
    pack_Units_Yellow_Units_Lancer_Lancer_Right_Defence_png: "Units/Yellow Units/Lancer/Lancer_Right_Defence.png",
    pack_Units_Yellow_Units_Lancer_Lancer_UpRight_Attack_png: "Units/Yellow Units/Lancer/Lancer_UpRight_Attack.png",
    pack_Units_Yellow_Units_Lancer_Lancer_UpRight_Defence_png: "Units/Yellow Units/Lancer/Lancer_UpRight_Defence.png",
    pack_Units_Yellow_Units_Lancer_Lancer_Up_Attack_png: "Units/Yellow Units/Lancer/Lancer_Up_Attack.png",
    pack_Units_Yellow_Units_Lancer_Lancer_Up_Defence_png: "Units/Yellow Units/Lancer/Lancer_Up_Defence.png",
    pack_Units_Yellow_Units_Monk_Heal_png: "Units/Yellow Units/Monk/Heal.png",
    pack_Units_Yellow_Units_Monk_Heal_Effect_png: "Units/Yellow Units/Monk/Heal_Effect.png",
    pack_Units_Yellow_Units_Monk_Idle_png: "Units/Yellow Units/Monk/Idle.png",
    pack_Units_Yellow_Units_Monk_Run_png: "Units/Yellow Units/Monk/Run.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Idle_Axe_png: "Units/Yellow Units/Pawn/Pawn_Idle Axe.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Idle_Gold_png: "Units/Yellow Units/Pawn/Pawn_Idle Gold.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Idle_Hammer_png: "Units/Yellow Units/Pawn/Pawn_Idle Hammer.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Idle_Knife_png: "Units/Yellow Units/Pawn/Pawn_Idle Knife.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Idle_Meat_png: "Units/Yellow Units/Pawn/Pawn_Idle Meat.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Idle_Pickaxe_png: "Units/Yellow Units/Pawn/Pawn_Idle Pickaxe.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Idle_Wood_png: "Units/Yellow Units/Pawn/Pawn_Idle Wood.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Idle_png: "Units/Yellow Units/Pawn/Pawn_Idle.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Interact_Axe_png: "Units/Yellow Units/Pawn/Pawn_Interact Axe.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Interact_Hammer_png: "Units/Yellow Units/Pawn/Pawn_Interact Hammer.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Interact_Knife_png: "Units/Yellow Units/Pawn/Pawn_Interact Knife.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Interact_Pickaxe_png: "Units/Yellow Units/Pawn/Pawn_Interact Pickaxe.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Run_Axe_png: "Units/Yellow Units/Pawn/Pawn_Run Axe.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Run_Gold_png: "Units/Yellow Units/Pawn/Pawn_Run Gold.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Run_Hammer_png: "Units/Yellow Units/Pawn/Pawn_Run Hammer.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Run_Knife_png: "Units/Yellow Units/Pawn/Pawn_Run Knife.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Run_Meat_png: "Units/Yellow Units/Pawn/Pawn_Run Meat.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Run_Pickaxe_png: "Units/Yellow Units/Pawn/Pawn_Run Pickaxe.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Run_Wood_png: "Units/Yellow Units/Pawn/Pawn_Run Wood.png",
    pack_Units_Yellow_Units_Pawn_Pawn_Run_png: "Units/Yellow Units/Pawn/Pawn_Run.png",
    pack_Units_Yellow_Units_Warrior_Warrior_Attack2_png: "Units/Yellow Units/Warrior/Warrior_Attack2.png",
    pack_Units_Yellow_Units_Warrior_Warrior_Guard_png: "Units/Yellow Units/Warrior/Warrior_Guard.png",
    pack_UI_Elements_UI_Banners_from_the_store_page_Banner_Banner_png: "UI Elements/UI Banners from the store page/Banner/Banner.png",
    pack_UI_Elements_UI_Banners_from_the_store_page_Banner_Slots_png: "UI Elements/UI Banners from the store page/Banner/Slots.png",
    pack_UI_Elements_UI_Banners_from_the_store_page_Ribbons_Ribbon_Black_png: "UI Elements/UI Banners from the store page/Ribbons/Ribbon_Black.png",
    pack_UI_Elements_UI_Banners_from_the_store_page_Ribbons_Ribbon_Blue_png: "UI Elements/UI Banners from the store page/Ribbons/Ribbon_Blue.png",
    pack_UI_Elements_UI_Banners_from_the_store_page_Ribbons_Ribbon_Purple_png: "UI Elements/UI Banners from the store page/Ribbons/Ribbon_Purple.png",
    pack_UI_Elements_UI_Banners_from_the_store_page_Ribbons_Ribbon_Red_png: "UI Elements/UI Banners from the store page/Ribbons/Ribbon_Red.png",
    pack_UI_Elements_UI_Banners_from_the_store_page_Ribbons_Ribbon_Yellow_png: "UI Elements/UI Banners from the store page/Ribbons/Ribbon_Yellow.png",
    pack_UI_Elements_UI_Elements_Banners_Banner_Slots_png: "UI Elements/UI Elements/Banners/Banner_Slots.png",
    pack_UI_Elements_UI_Elements_Bars_SmallBar_Fill_png: "UI Elements/UI Elements/Bars/SmallBar_Fill.png",
    pack_UI_Elements_UI_Elements_Buttons_BigRedButton_Pressed_png: "UI Elements/UI Elements/Buttons/BigRedButton_Pressed.png",
    pack_UI_Elements_UI_Elements_Buttons_BigRedButton_Regular_png: "UI Elements/UI Elements/Buttons/BigRedButton_Regular.png",
    pack_UI_Elements_UI_Elements_Buttons_SmallBlueRoundButton_Pressed_png: "UI Elements/UI Elements/Buttons/SmallBlueRoundButton_Pressed.png",
    pack_UI_Elements_UI_Elements_Buttons_SmallBlueRoundButton_Regular_png: "UI Elements/UI Elements/Buttons/SmallBlueRoundButton_Regular.png",
    pack_UI_Elements_UI_Elements_Buttons_SmallBlueSquareButton_Pressed_png: "UI Elements/UI Elements/Buttons/SmallBlueSquareButton_Pressed.png",
    pack_UI_Elements_UI_Elements_Buttons_SmallBlueSquareButton_Regular_png: "UI Elements/UI Elements/Buttons/SmallBlueSquareButton_Regular.png",
    pack_UI_Elements_UI_Elements_Buttons_SmallRedRoundButton_Pressed_png: "UI Elements/UI Elements/Buttons/SmallRedRoundButton_Pressed.png",
    pack_UI_Elements_UI_Elements_Buttons_SmallRedRoundButton_Regular_png: "UI Elements/UI Elements/Buttons/SmallRedRoundButton_Regular.png",
    pack_UI_Elements_UI_Elements_Buttons_SmallRedSquareButton_Pressed_png: "UI Elements/UI Elements/Buttons/SmallRedSquareButton_Pressed.png",
    pack_UI_Elements_UI_Elements_Buttons_SmallRedSquareButton_Regular_png: "UI Elements/UI Elements/Buttons/SmallRedSquareButton_Regular.png",
    pack_UI_Elements_UI_Elements_Buttons_TinyRoundBlueButton_png: "UI Elements/UI Elements/Buttons/TinyRoundBlueButton.png",
    pack_UI_Elements_UI_Elements_Buttons_TinyRoundRedButton_png: "UI Elements/UI Elements/Buttons/TinyRoundRedButton.png",
    pack_UI_Elements_UI_Elements_Buttons_TinySquareBlueButton_png: "UI Elements/UI Elements/Buttons/TinySquareBlueButton.png",
    pack_UI_Elements_UI_Elements_Buttons_TinySquareRedButton_png: "UI Elements/UI Elements/Buttons/TinySquareRedButton.png",
    pack_UI_Elements_UI_Elements_Cursors_Cursor_03_png: "UI Elements/UI Elements/Cursors/Cursor_03.png",
    pack_UI_Elements_UI_Elements_Cursors_Cursor_04_png: "UI Elements/UI Elements/Cursors/Cursor_04.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_02_png: "UI Elements/UI Elements/Human Avatars/Avatars_02.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_03_png: "UI Elements/UI Elements/Human Avatars/Avatars_03.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_04_png: "UI Elements/UI Elements/Human Avatars/Avatars_04.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_06_png: "UI Elements/UI Elements/Human Avatars/Avatars_06.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_07_png: "UI Elements/UI Elements/Human Avatars/Avatars_07.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_08_png: "UI Elements/UI Elements/Human Avatars/Avatars_08.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_09_png: "UI Elements/UI Elements/Human Avatars/Avatars_09.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_10_png: "UI Elements/UI Elements/Human Avatars/Avatars_10.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_11_png: "UI Elements/UI Elements/Human Avatars/Avatars_11.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_12_png: "UI Elements/UI Elements/Human Avatars/Avatars_12.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_13_png: "UI Elements/UI Elements/Human Avatars/Avatars_13.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_14_png: "UI Elements/UI Elements/Human Avatars/Avatars_14.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_15_png: "UI Elements/UI Elements/Human Avatars/Avatars_15.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_16_png: "UI Elements/UI Elements/Human Avatars/Avatars_16.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_17_png: "UI Elements/UI Elements/Human Avatars/Avatars_17.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_18_png: "UI Elements/UI Elements/Human Avatars/Avatars_18.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_19_png: "UI Elements/UI Elements/Human Avatars/Avatars_19.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_20_png: "UI Elements/UI Elements/Human Avatars/Avatars_20.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_21_png: "UI Elements/UI Elements/Human Avatars/Avatars_21.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_22_png: "UI Elements/UI Elements/Human Avatars/Avatars_22.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_23_png: "UI Elements/UI Elements/Human Avatars/Avatars_23.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_24_png: "UI Elements/UI Elements/Human Avatars/Avatars_24.png",
    pack_UI_Elements_UI_Elements_Human_Avatars_Avatars_25_png: "UI Elements/UI Elements/Human Avatars/Avatars_25.png",
    pack_UI_Elements_UI_Elements_Icons_Icon_11_png: "UI Elements/UI Elements/Icons/Icon_11.png",
    pack_UI_Elements_UI_Elements_Icons_Icon_12_png: "UI Elements/UI Elements/Icons/Icon_12.png",
    pack_UI_Elements_UI_Elements_Papers_SpecialPaper_png: "UI Elements/UI Elements/Papers/SpecialPaper.png",
    pack_UI_Elements_UI_Elements_Ribbons_BigRibbons_png: "UI Elements/UI Elements/Ribbons/BigRibbons.png",
    pack_UI_Elements_UI_Elements_Ribbons_SmallRibbons_png: "UI Elements/UI Elements/Ribbons/SmallRibbons.png",
    pack_UI_Elements_UI_Elements_Swords_Swords_png: "UI Elements/UI Elements/Swords/Swords.png",
    pack_UI_Elements_UI_Elements_Wood_Table_WoodTable_png: "UI Elements/UI Elements/Wood Table/WoodTable.png",
    pack_UI_Elements_UI_Elements_Wood_Table_WoodTable_Slots_png: "UI Elements/UI Elements/Wood Table/WoodTable_Slots.png",
    pack_ep_Enemy_Pack_Bomb_Fish_Bomb_FuseLit_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Bomb Fish/Bomb_FuseLit.png",
    pack_ep_Enemy_Pack_Bomb_Fish_Bomb_Idle_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Bomb Fish/Bomb_Idle.png",
    pack_ep_Enemy_Pack_Extra_Boat_Paddle_Shark_Row_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Boat/Paddle Shark_Row.png",
    pack_ep_Enemy_Pack_Extra_Gnoll_Hit_Gnoll_Hit_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Gnoll Hit/Gnoll_Hit.png",
    pack_ep_Enemy_Pack_Extra_Hex_Shaman_Transformation_Spell_Hex_Shaman_Explosion_Spell_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Hex Shaman Transformation Spell/Hex Shaman_Explosion Spell.png",
    pack_ep_Enemy_Pack_Extra_Hex_Shaman_Transformation_Spell_Hex_Shaman_Transformation_Spell_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Hex Shaman Transformation Spell/Hex Shaman_Transformation Spell.png",
    pack_ep_Enemy_Pack_Extra_Lizard_Hit_Lizard_Hit_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Lizard Hit/Lizard_Hit.png",
    pack_ep_Enemy_Pack_Extra_Seahorse_Boat_Seahorse_Boat_Bomb_Fish_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Seahorse Boat/Seahorse Boat_Bomb Fish.png",
    pack_ep_Enemy_Pack_Extra_Seahorse_Boat_Seahorse_Boat_Harpoon_Shark_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Seahorse Boat/Seahorse Boat_Harpoon Shark.png",
    pack_ep_Enemy_Pack_Extra_Seahorse_Boat_Seahorse_Boat_Paddle_Shark_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Seahorse Boat/Seahorse Boat_Paddle Shark.png",
    pack_ep_Enemy_Pack_Extra_Skull_decorations_Bones_03_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Skull decorations/Bones_03.png",
    pack_ep_Enemy_Pack_Extra_Skull_decorations_Skull_Spike_02_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Skull decorations/Skull Spike_02.png",
    pack_ep_Enemy_Pack_Extra_Spear_Goblin_Strong_Attack_Spear_Goblin_Attack_Strong_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Spear Goblin Strong Attack/Spear Goblin_Attack Strong.png",
    pack_ep_Enemy_Pack_Extra_Troll_Dead_Troll_ClubPart1_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Troll Dead/Troll_ClubPart1.png",
    pack_ep_Enemy_Pack_Extra_Troll_Dead_Troll_ClubPart2_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Troll Dead/Troll_ClubPart2.png",
    pack_ep_Enemy_Pack_Extra_Troll_Dead_Troll_Dead_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Troll Dead/Troll_Dead.png",
    pack_ep_Enemy_Pack_Extra_Turtle_Guard_Turtle_Guard_In_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Extra/Turtle Guard/Turtle_Guard_In.png",
    pack_ep_Enemy_Pack_Hex_Shaman_Hex_Shaman_Explosion_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Hex Shaman/Hex Shaman_Explosion.png",
    pack_ep_Enemy_Pack_Imp_Imp_Attack_End_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Imp/Imp_Attack_End.png",
    pack_ep_Enemy_Pack_Imp_Imp_Attack_Loop_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Imp/Imp_Attack_Loop.png",
    pack_ep_Enemy_Pack_Troll_Troll_Recovery_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Troll/Troll_Recovery.png",
    pack_ep_Enemy_Pack_Troll_Troll_Windup_png: "Tiny Swords (Enemy Pack)/Enemy Pack/Troll/Troll_Windup.png",
    pack_u010_Factions_Goblins_Buildings_Wood_Tower_Wood_Tower_InConstruction_png: "Tiny Swords (Update 010)/Factions/Goblins/Buildings/Wood_Tower/Wood_Tower_InConstruction.png",
    pack_u010_Factions_Goblins_Troops_Barrel_Blue_Barrel_Blue_png: "Tiny Swords (Update 010)/Factions/Goblins/Troops/Barrel/Blue/Barrel_Blue.png",
    pack_u010_Factions_Goblins_Troops_TNT_Purple_TNT_Purple_png: "Tiny Swords (Update 010)/Factions/Goblins/Troops/TNT/Purple/TNT_Purple.png",
    pack_u010_Factions_Goblins_Troops_TNT_Yellow_TNT_Yellow_png: "Tiny Swords (Update 010)/Factions/Goblins/Troops/TNT/Yellow/TNT_Yellow.png",
    pack_u010_Factions_Goblins_Troops_Torch_Blue_Torch_Blue_png: "Tiny Swords (Update 010)/Factions/Goblins/Troops/Torch/Blue/Torch_Blue.png",
    pack_u010_Factions_Goblins_Troops_Torch_Purple_Torch_Purple_png: "Tiny Swords (Update 010)/Factions/Goblins/Troops/Torch/Purple/Torch_Purple.png",
    pack_u010_Factions_Goblins_Troops_Torch_Yellow_Torch_Yellow_png: "Tiny Swords (Update 010)/Factions/Goblins/Troops/Torch/Yellow/Torch_Yellow.png",
    pack_u010_Factions_Knights_Buildings_House_House_Construction_png: "Tiny Swords (Update 010)/Factions/Knights/Buildings/House/House_Construction.png",
    pack_u010_Factions_Knights_Buildings_Tower_Tower_Construction_png: "Tiny Swords (Update 010)/Factions/Knights/Buildings/Tower/Tower_Construction.png",
    pack_u010_Factions_Knights_Troops_Archer_Archer_Bow_Archer_Blue_NoArms_png: "Tiny Swords (Update 010)/Factions/Knights/Troops/Archer/Archer + Bow/Archer_Blue_(NoArms).png",
    pack_u010_Factions_Knights_Troops_Archer_Archer_Bow_Archer_Bow_Blue_png: "Tiny Swords (Update 010)/Factions/Knights/Troops/Archer/Archer + Bow/Archer_Bow_Blue.png",
    pack_u010_Factions_Knights_Troops_Archer_Archer_Bow_Archer_Bow_Purple_png: "Tiny Swords (Update 010)/Factions/Knights/Troops/Archer/Archer + Bow/Archer_Bow_Purple.png",
    pack_u010_Factions_Knights_Troops_Archer_Archer_Bow_Archer_Bow_Red_png: "Tiny Swords (Update 010)/Factions/Knights/Troops/Archer/Archer + Bow/Archer_Bow_Red.png",
    pack_u010_Factions_Knights_Troops_Archer_Archer_Bow_Archer_Bow_Yellow_png: "Tiny Swords (Update 010)/Factions/Knights/Troops/Archer/Archer + Bow/Archer_Bow_Yellow.png",
    pack_u010_Factions_Knights_Troops_Archer_Archer_Bow_Archer_Purple_NoArms_png: "Tiny Swords (Update 010)/Factions/Knights/Troops/Archer/Archer + Bow/Archer_Purple_(NoArms).png",
    pack_u010_Factions_Knights_Troops_Archer_Archer_Bow_Archer_Red_NoArms_png: "Tiny Swords (Update 010)/Factions/Knights/Troops/Archer/Archer + Bow/Archer_Red_(NoArms).png",
    pack_u010_Factions_Knights_Troops_Archer_Archer_Bow_Archer_Yellow_NoArms_png: "Tiny Swords (Update 010)/Factions/Knights/Troops/Archer/Archer + Bow/Archer_Yellow_(NoArms).png",
    pack_u010_Factions_Knights_Troops_Archer_Arrow_Arrow_png: "Tiny Swords (Update 010)/Factions/Knights/Troops/Archer/Arrow/Arrow.png",
    pack_u010_Factions_Knights_Troops_Archer_Purple_Archer_Purlple_png: "Tiny Swords (Update 010)/Factions/Knights/Troops/Archer/Purple/Archer_Purlple.png",
    pack_u010_Factions_Knights_Troops_Archer_Yellow_Archer_Yellow_png: "Tiny Swords (Update 010)/Factions/Knights/Troops/Archer/Yellow/Archer_Yellow.png",
    pack_u010_Factions_Knights_Troops_Dead_Dead_png: "Tiny Swords (Update 010)/Factions/Knights/Troops/Dead/Dead.png",
    pack_u010_Factions_Knights_Troops_Pawn_Purple_Pawn_Purple_png: "Tiny Swords (Update 010)/Factions/Knights/Troops/Pawn/Purple/Pawn_Purple.png",
    pack_u010_Factions_Knights_Troops_Pawn_Red_Pawn_Red_png: "Tiny Swords (Update 010)/Factions/Knights/Troops/Pawn/Red/Pawn_Red.png",
    pack_u010_Factions_Knights_Troops_Warrior_Purple_Warrior_Purple_png: "Tiny Swords (Update 010)/Factions/Knights/Troops/Warrior/Purple/Warrior_Purple.png",
    pack_u010_Resources_Resources_G_Idle_NoShadow_png: "Tiny Swords (Update 010)/Resources/Resources/G_Idle_(NoShadow).png",
    pack_u010_Resources_Resources_G_Spawn_png: "Tiny Swords (Update 010)/Resources/Resources/G_Spawn.png",
    pack_u010_Resources_Resources_M_Idle_NoShadow_png: "Tiny Swords (Update 010)/Resources/Resources/M_Idle_(NoShadow).png",
    pack_u010_Resources_Resources_M_Spawn_png: "Tiny Swords (Update 010)/Resources/Resources/M_Spawn.png",
    pack_u010_Resources_Resources_W_Idle_NoShadow_png: "Tiny Swords (Update 010)/Resources/Resources/W_Idle_(NoShadow).png",
    pack_u010_Resources_Resources_W_Spawn_png: "Tiny Swords (Update 010)/Resources/Resources/W_Spawn.png",
    pack_u010_Resources_Sheep_HappySheep_Bouncing_png: "Tiny Swords (Update 010)/Resources/Sheep/HappySheep_Bouncing.png",
    pack_u010_Terrain_Ground_Shadows_png: "Tiny Swords (Update 010)/Terrain/Ground/Shadows.png",
    pack_u010_Terrain_Ground_Tilemap_Elevation_png: "Tiny Swords (Update 010)/Terrain/Ground/Tilemap_Elevation.png",
    pack_u010_Terrain_Ground_Tilemap_Flat_png: "Tiny Swords (Update 010)/Terrain/Ground/Tilemap_Flat.png",
    pack_u010_Terrain_Water_Foam_Foam_png: "Tiny Swords (Update 010)/Terrain/Water/Foam/Foam.png",
    pack_u010_Terrain_Water_Water_png: "Tiny Swords (Update 010)/Terrain/Water/Water.png",
    pack_u010_UI_Banners_Banner_Connection_Down_png: "Tiny Swords (Update 010)/UI/Banners/Banner_Connection_Down.png",
    pack_u010_UI_Banners_Banner_Connection_Left_png: "Tiny Swords (Update 010)/UI/Banners/Banner_Connection_Left.png",
    pack_u010_UI_Banners_Banner_Connection_Right_png: "Tiny Swords (Update 010)/UI/Banners/Banner_Connection_Right.png",
    pack_u010_UI_Banners_Banner_Connection_Up_png: "Tiny Swords (Update 010)/UI/Banners/Banner_Connection_Up.png",
    pack_u010_UI_Banners_Banner_Horizontal_png: "Tiny Swords (Update 010)/UI/Banners/Banner_Horizontal.png",
    pack_u010_UI_Banners_Banner_Vertical_png: "Tiny Swords (Update 010)/UI/Banners/Banner_Vertical.png",
    pack_u010_UI_Banners_Carved_3Slides_png: "Tiny Swords (Update 010)/UI/Banners/Carved_3Slides.png",
    pack_u010_UI_Banners_Carved_Regular_png: "Tiny Swords (Update 010)/UI/Banners/Carved_Regular.png",
    pack_u010_UI_Buttons_Button_Blue_png: "Tiny Swords (Update 010)/UI/Buttons/Button_Blue.png",
    pack_u010_UI_Buttons_Button_Blue_3Slides_png: "Tiny Swords (Update 010)/UI/Buttons/Button_Blue_3Slides.png",
    pack_u010_UI_Buttons_Button_Blue_3Slides_Pressed_png: "Tiny Swords (Update 010)/UI/Buttons/Button_Blue_3Slides_Pressed.png",
    pack_u010_UI_Buttons_Button_Blue_Pressed_png: "Tiny Swords (Update 010)/UI/Buttons/Button_Blue_Pressed.png",
    pack_u010_UI_Buttons_Button_Disable_png: "Tiny Swords (Update 010)/UI/Buttons/Button_Disable.png",
    pack_u010_UI_Buttons_Button_Disable_3Slides_png: "Tiny Swords (Update 010)/UI/Buttons/Button_Disable_3Slides.png",
    pack_u010_UI_Buttons_Button_Disable_9Slides_png: "Tiny Swords (Update 010)/UI/Buttons/Button_Disable_9Slides.png",
    pack_u010_UI_Buttons_Button_Hover_png: "Tiny Swords (Update 010)/UI/Buttons/Button_Hover.png",
    pack_u010_UI_Buttons_Button_Hover_3Slides_png: "Tiny Swords (Update 010)/UI/Buttons/Button_Hover_3Slides.png",
    pack_u010_UI_Buttons_Button_Hover_9Slides_png: "Tiny Swords (Update 010)/UI/Buttons/Button_Hover_9Slides.png",
    pack_u010_UI_Buttons_Button_Red_png: "Tiny Swords (Update 010)/UI/Buttons/Button_Red.png",
    pack_u010_UI_Buttons_Button_Red_3Slides_png: "Tiny Swords (Update 010)/UI/Buttons/Button_Red_3Slides.png",
    pack_u010_UI_Buttons_Button_Red_3Slides_Pressed_png: "Tiny Swords (Update 010)/UI/Buttons/Button_Red_3Slides_Pressed.png",
    pack_u010_UI_Buttons_Button_Red_9Slides_png: "Tiny Swords (Update 010)/UI/Buttons/Button_Red_9Slides.png",
    pack_u010_UI_Buttons_Button_Red_9Slides_Pressed_png: "Tiny Swords (Update 010)/UI/Buttons/Button_Red_9Slides_Pressed.png",
    pack_u010_UI_Buttons_Button_Red_Pressed_png: "Tiny Swords (Update 010)/UI/Buttons/Button_Red_Pressed.png",
    pack_u010_UI_Icons_Disable_01_png: "Tiny Swords (Update 010)/UI/Icons/Disable_01.png",
    pack_u010_UI_Icons_Disable_02_png: "Tiny Swords (Update 010)/UI/Icons/Disable_02.png",
    pack_u010_UI_Icons_Disable_03_png: "Tiny Swords (Update 010)/UI/Icons/Disable_03.png",
    pack_u010_UI_Icons_Disable_04_png: "Tiny Swords (Update 010)/UI/Icons/Disable_04.png",
    pack_u010_UI_Icons_Disable_05_png: "Tiny Swords (Update 010)/UI/Icons/Disable_05.png",
    pack_u010_UI_Icons_Disable_06_png: "Tiny Swords (Update 010)/UI/Icons/Disable_06.png",
    pack_u010_UI_Icons_Disable_07_png: "Tiny Swords (Update 010)/UI/Icons/Disable_07.png",
    pack_u010_UI_Icons_Disable_08_png: "Tiny Swords (Update 010)/UI/Icons/Disable_08.png",
    pack_u010_UI_Icons_Disable_09_png: "Tiny Swords (Update 010)/UI/Icons/Disable_09.png",
    pack_u010_UI_Icons_Disable_10_png: "Tiny Swords (Update 010)/UI/Icons/Disable_10.png",
    pack_u010_UI_Icons_Pressed_01_png: "Tiny Swords (Update 010)/UI/Icons/Pressed_01.png",
    pack_u010_UI_Icons_Pressed_02_png: "Tiny Swords (Update 010)/UI/Icons/Pressed_02.png",
    pack_u010_UI_Icons_Pressed_03_png: "Tiny Swords (Update 010)/UI/Icons/Pressed_03.png",
    pack_u010_UI_Icons_Pressed_04_png: "Tiny Swords (Update 010)/UI/Icons/Pressed_04.png",
    pack_u010_UI_Icons_Pressed_05_png: "Tiny Swords (Update 010)/UI/Icons/Pressed_05.png",
    pack_u010_UI_Icons_Pressed_06_png: "Tiny Swords (Update 010)/UI/Icons/Pressed_06.png",
    pack_u010_UI_Icons_Pressed_07_png: "Tiny Swords (Update 010)/UI/Icons/Pressed_07.png",
    pack_u010_UI_Icons_Pressed_08_png: "Tiny Swords (Update 010)/UI/Icons/Pressed_08.png",
    pack_u010_UI_Icons_Pressed_09_png: "Tiny Swords (Update 010)/UI/Icons/Pressed_09.png",
    pack_u010_UI_Icons_Pressed_10_png: "Tiny Swords (Update 010)/UI/Icons/Pressed_10.png",
    pack_u010_UI_Icons_Regular_01_png: "Tiny Swords (Update 010)/UI/Icons/Regular_01.png",
    pack_u010_UI_Icons_Regular_02_png: "Tiny Swords (Update 010)/UI/Icons/Regular_02.png",
    pack_u010_UI_Icons_Regular_03_png: "Tiny Swords (Update 010)/UI/Icons/Regular_03.png",
    pack_u010_UI_Icons_Regular_04_png: "Tiny Swords (Update 010)/UI/Icons/Regular_04.png",
    pack_u010_UI_Icons_Regular_05_png: "Tiny Swords (Update 010)/UI/Icons/Regular_05.png",
    pack_u010_UI_Icons_Regular_06_png: "Tiny Swords (Update 010)/UI/Icons/Regular_06.png",
    pack_u010_UI_Icons_Regular_07_png: "Tiny Swords (Update 010)/UI/Icons/Regular_07.png",
    pack_u010_UI_Icons_Regular_08_png: "Tiny Swords (Update 010)/UI/Icons/Regular_08.png",
    pack_u010_UI_Icons_Regular_09_png: "Tiny Swords (Update 010)/UI/Icons/Regular_09.png",
    pack_u010_UI_Icons_Regular_10_png: "Tiny Swords (Update 010)/UI/Icons/Regular_10.png",
    pack_u010_UI_Pointers_01_png: "Tiny Swords (Update 010)/UI/Pointers/01.png",
    pack_u010_UI_Pointers_02_png: "Tiny Swords (Update 010)/UI/Pointers/02.png",
    pack_u010_UI_Pointers_03_png: "Tiny Swords (Update 010)/UI/Pointers/03.png",
    pack_u010_UI_Pointers_04_png: "Tiny Swords (Update 010)/UI/Pointers/04.png",
    pack_u010_UI_Pointers_05_png: "Tiny Swords (Update 010)/UI/Pointers/05.png",
    pack_u010_UI_Pointers_06_png: "Tiny Swords (Update 010)/UI/Pointers/06.png",
    pack_u010_UI_Ribbons_Ribbon_Blue_3Slides_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Blue_3Slides.png",
    pack_u010_UI_Ribbons_Ribbon_Blue_Connection_Down_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Blue_Connection_Down.png",
    pack_u010_UI_Ribbons_Ribbon_Blue_Connection_Down_Pressed_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Blue_Connection_Down_Pressed.png",
    pack_u010_UI_Ribbons_Ribbon_Blue_Connection_Left_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Blue_Connection_Left.png",
    pack_u010_UI_Ribbons_Ribbon_Blue_Connection_Left_Pressed_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Blue_Connection_Left_Pressed.png",
    pack_u010_UI_Ribbons_Ribbon_Blue_Connection_Right_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Blue_Connection_Right.png",
    pack_u010_UI_Ribbons_Ribbon_Blue_Connection_Right_Pressed_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Blue_Connection_Right_Pressed.png",
    pack_u010_UI_Ribbons_Ribbon_Blue_Connection_Up_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Blue_Connection_Up.png",
    pack_u010_UI_Ribbons_Ribbon_Blue_Connection_Up_Pressed_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Blue_Connection_Up_Pressed.png",
    pack_u010_UI_Ribbons_Ribbon_Red_3Slides_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Red_3Slides.png",
    pack_u010_UI_Ribbons_Ribbon_Red_Connection_Down_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Red_Connection_Down.png",
    pack_u010_UI_Ribbons_Ribbon_Red_Connection_Down_Pressed_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Red_Connection_Down_Pressed.png",
    pack_u010_UI_Ribbons_Ribbon_Red_Connection_Left_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Red_Connection_Left.png",
    pack_u010_UI_Ribbons_Ribbon_Red_Connection_Left_Pressed_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Red_Connection_Left_Pressed.png",
    pack_u010_UI_Ribbons_Ribbon_Red_Connection_Right_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Red_Connection_Right.png",
    pack_u010_UI_Ribbons_Ribbon_Red_Connection_Right_Pressed_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Red_Connection_Right_Pressed.png",
    pack_u010_UI_Ribbons_Ribbon_Red_Connection_Up_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Red_Connection_Up.png",
    pack_u010_UI_Ribbons_Ribbon_Red_Connection_Up_Pressed_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Red_Connection_Up_Pressed.png",
    pack_u010_UI_Ribbons_Ribbon_Yellow_3Slides_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Yellow_3Slides.png",
    pack_u010_UI_Ribbons_Ribbon_Yellow_Connection_Down_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Yellow_Connection_Down.png",
    pack_u010_UI_Ribbons_Ribbon_Yellow_Connection_Down_Pressed_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Yellow_Connection_Down_Pressed.png",
    pack_u010_UI_Ribbons_Ribbon_Yellow_Connection_Left_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Yellow_Connection_Left.png",
    pack_u010_UI_Ribbons_Ribbon_Yellow_Connection_Left_Pressed_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Yellow_Connection_Left_Pressed.png",
    pack_u010_UI_Ribbons_Ribbon_Yellow_Connection_Right_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Yellow_Connection_Right.png",
    pack_u010_UI_Ribbons_Ribbon_Yellow_Connection_Right_Pressed_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Yellow_Connection_Right_Pressed.png",
    pack_u010_UI_Ribbons_Ribbon_Yellow_Connection_Up_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Yellow_Connection_Up.png",
    pack_u010_UI_Ribbons_Ribbon_Yellow_Connection_Up_Pressed_png: "Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Yellow_Connection_Up_Pressed.png",
    icoActClose: "UI Elements/UI Elements/Icons/Icon_09.png",
  };

  const imgs = {};
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const boot = document.getElementById("boot");
  const loadfill = document.getElementById("loadfill");
  const loadtext = document.getElementById("loadtext");

  const keys = new Set();
  const mouse = { x: 0, y: 0, wx: 0, wy: 0, left: false, right: false, leftClick: false, rightClick: false };
  // DST-style: LMB walk/action, hold-drag move; RMB examine; F gather; Space action; J attack
  let moveTarget = null;
  let pendingAct = null; // { type, target, x, y }
  let cursorHint = "";
  let lmbDownAt = 0;
  let lmbDrag = false;
  let uiHover = null;

  let W = 1280, H = 720, dpr = 1;
  let state = STATE.BOOT;
  let time = 0;
  let dt = 0;
  let last = 0;
  let shake = 0;
  let seed = (Date.now() % 99991) + 17;

  const world = {
    tiles: [],
    wet: [],
    burn: [],
    elec: [],
    fireAge: [],
    iceAge: [],
  };

  const camera = { x: 0, y: 0 };
  const particles = [];
  const floats = [];
  const drops = [];
  const projectiles = [];
  const entities = [];
  const buildings = [];
  const props = [];
  const clouds = [];
  const toasts = [];

  let player = null;
  let monk = null;
  let warlord = null;
  let campfire = null;
  const fires = [];
  let dayT = 0.15;
  let seasonT = 0;
  let seasonId = "spring";
  let wasSeasonId = "spring";
  let rain = 0;
  let rainTimer = 40;
  let inCave = false;
  let caveEntrance = null;
  let caveInterior = null;
  let overworldReturn = null;
  let boatDock = null;
  let islandHub = null;
  let onIsland = false;
  let spoilAcc = 0;
  let wildfireCd = 80;
  let winterStormCd = 100;
  let summerThunderCd = 55;
  let winterStormT = 0;
  let phantomCd = 0;
  let combo = 0;
  let interactHint = "";
  let menuBtn = { hover: false, pressed: false };
  let codex = {
    tab: 0,
    scroll: 0,
    sel: 0,
    proceedToChar: false,
    tabs: ["建筑", "生物", "友方", "资源"],
  };

  let chestOpen = null;
  let chestHover = "";
  let saveToast = 0;
  let autoSaveAcc = 0;
  const SAVE_KEY = "moreshidian_save_v1";
  let testMode = false; // 测试模式：不扣血/饿/理智等
  const landmarks = { camp: null, ruin: null, red: null, forest: null, mines: null, savanna: null, bees: null, pigking: null, bluff: null, walk: null, frogs: null, moles: null, moles_r: null, moose: null, wasps: null, hunters: null, pigs: null, spiders: null, beehat: null, meadow: null };
  let miniCanvas = null;
  let miniCtx = null;
  let fog = null;
  let biomes = null;
  let worldSeed = 0;

  const inv = { wood: 0, gold: 0, meat: 2, fish: 0, honey: 0, torch: 0, lantern: 0, cooked: 0, warKit: 0, warmstone: 0, berries: 0, seeds: 0, jam: 0, meatpie: 0, spicy: 0, trail: 0, feast: 0, mapscroll: 0, boards: 0, rope: 0, cutstone: 0, rocks: 0, silk: 0, flint: 0, trinket: 0, dung: 0, twigs: 0, grass: 0, charcoal: 0, jerky: 0, oar: 0, mast: 0, anchor: 0, winterhat: 0, beehat: 0, raincoat: 0, carrot: 0, carrot_seed: 0 };
  let warmstoneHeat = 0; // 0–100 heatrock charge
  let birdCd = 40;
  let houndClock = null;
  let wetness = { wet: 0 };
  let toolDur = null;
  let seasonBossFlags = {};
  let cookSlots = [null, null, null, null];
  let cookSlotHover = -1;
  let cookJob = null; // { need, t, out, n, hunger, hp, name }
  let roastJob = null; // { t, need, out } campfire roast
  let sailJob = null; // { t, need, x, y, msg, onIsland, onSeaIsland, questIsland, questSea }
  let wormholeCd = 0;
  let smolderJob = null; // { t, need, c, r } summer wildfire telegraph
  let springFrogCd = 40;
  let pigKing = null;
  const runes = { fire: true, ice: false, lightning: false };
  let spell = "fire";
  let craftOpen = false;
  let craftHover = -1;
  let craftTab = "tools";
  let cookOpen = false;
  let cookHover = -1;
  let bagOpen = false;
  let bagHover = -1;
  let bearBoss = null;
  let corpse = null;
  let pirateTower = null;
  let pirateRaidCd = 40;
  let fishHut = null;
  let trollBoss = null;
  let minotaurBoss = null;
  let mooseBoss = null;
  let gnomeTower = null;
  let seaDock = null;
  let seaIsland = null;
  let onSeaIsland = false;
  let raidCd = 12;
  let wasNight = false;
  const quests = [
    { id: "wood", title: "据点薪火", desc: "砍伐树木，收集 8 木材", done: false, check: () => inv.wood >= 8 },
    { id: "fuel", title: "守夜之火", desc: "让营火燃料达到 40（空格添柴）", done: false, check: () => campfire && campfire.fuel >= 40 },
    { id: "food", title: "果腹之猎", desc: "狩猎山羊，取得 3 份羊肉", done: false, check: () => inv.meat >= 3 },
    { id: "torch", title: "携火远行", desc: "制作一把火把（Tab 合成）", done: false, check: () => inv.torch >= 1 },
    { id: "war", title: "披甲上阵", desc: "合成成套武装，以战士形态作战", done: false, check: () => inv.warKit >= 1 },
    { id: "trap", title: "陷阱", desc: "制作并放置一个陷阱", done: false, check: () => props.some((p) => p.kind === "trap") },
    { id: "cave", title: "矿脉洞窟", desc: "进入矿脉旁的洞穴探一探", done: false },
    { id: "berry", title: "浆果丛", desc: "采集 6 浆果或栽下一丛浆果", done: false, check: () => inv.berries >= 6 || props.some((p) => p.kind === "berry" && p.planted) },
    { id: "batqueen", title: "蝠后巢穴", desc: "在洞窟击败蝠后", done: false },
    { id: "bear", title: "密林熊王", desc: "击败密林熊穴中的熊王", done: false },
    { id: "troll", title: "矿脉巨魔", desc: "击败矿脉旁的巨魔酋长", done: false },
    { id: "gnome", title: "侏儒塔", desc: "靠近密林侏儒塔并击退守卫", done: false },
    { id: "island", title: "乘船离岛", desc: "乘船抵达离岛", done: false },
    { id: "pirate", title: "海盗塔", desc: "靠近并摧毁岸边海盗塔", done: false },
    { id: "fish", title: "渔棚垂钓", desc: "在岸边渔棚钓到鱼", done: false },
    { id: "sea", title: "海马航线", desc: "乘海马船抵达秘岛", done: false },
    { id: "corpse", title: "捡回遗物", desc: "若陨落，从尸体处取回物资", done: false },
    { id: "chest", title: "据点仓储", desc: "制作并放置一只木箱", done: false, check: () => props.some((p) => p.kind === "chest") },
    { id: "cleanse", title: "圣坛净化", desc: "在修道院向僧侣祈祷，清除魔蚀", done: false },
    { id: "explore", title: "踏足荒野", desc: "探索密林或矿脉（小地图会点亮）", done: false },
    { id: "ruin", title: "奥术废墟", desc: "探索废墟，拾取冰与雷符文", done: false, check: () => runes.ice && runes.lightning },
    { id: "mino", title: "废墟守卫", desc: "击败废墟牛头人", done: false },
    { id: "honey", title: "采蜜", desc: "取得 2 份蜂蜜（击杀刺蜂）", done: false, check: () => inv.honey >= 2 },
    { id: "boards", title: "精炼木板", desc: "在精炼页锯出木板", done: false, check: () => (inv.boards || 0) >= 1 },
    { id: "pigking", title: "猪王交易", desc: "找到猪王并用肉或饰品换金币", done: false },
    { id: "hound", title: "扛过劫掠潮", desc: "在季节劫掠潮中至少击杀 1 只", done: false },
    { id: "science2", title: "炼金引擎", desc: "建造炼金引擎", done: false, check: () => buildings.some((b) => b.alchemy) },
    { id: "tech", title: "据点工法", desc: "在勘测台研究一项科技", done: false, check: () => player && player.tech && (player.tech.stonewall || player.tech.lantern) },
    { id: "warlord", title: "红堡僭主", desc: "击败北方红堡的首领", done: false },
  ];

  function rand() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }
  function irand(a, b) { return a + Math.floor(rand() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function dist(ax, ay, bx, by) { return Math.hypot(bx - ax, by - ay); }
  function hash2(x, y) {
    const s = Math.sin(x * 127.1 + y * 311.7 + 19.19) * 43758.5453;
    return s - Math.floor(s);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error(src));
      im.src = asset(src);
    });
  }

  async function loadImageSafe(p) {
    try { return await loadImage(p); }
    catch (err) { console.warn("missing", p); return null; }
  }

  async function loadAll() {
    const entries = Object.entries(PATHS);
    const enemyEntries = [];
    if (window.EnemyPack && window.EnemyPack.ENEMIES) {
      for (const [id, def] of Object.entries(window.EnemyPack.ENEMIES)) {
        enemyEntries.push(["en_" + id + "_idle", def.idle]);
        enemyEntries.push(["en_" + id + "_run", def.run]);
        enemyEntries.push(["en_" + id + "_atk", def.atk]);
        enemyEntries.push(["en_" + id + "_avatar", def.avatar]);
      }
    }
    const all = entries.concat(enemyEntries);
    let done = 0;
    for (const [k, p] of all) {
      imgs[k] = await loadImageSafe(p);
      done++;
      loadfill.style.width = ((done / all.length) * 100).toFixed(1) + "%";
      loadtext.textContent = "装载画卷 " + done + " / " + all.length;
    }
  }

  function idx(c, r) { return r * COLS + c; }
  function inb(c, r) { return c >= 0 && r >= 0 && c < COLS && r < ROWS; }
  function tileAt(x, y) {
    const c = Math.floor(x / TILE), r = Math.floor(y / TILE);
    if (!inb(c, r)) return T_WATER;
    return world.tiles[idx(c, r)];
  }
  function setTile(c, r, t) {
    if (inb(c, r)) world.tiles[idx(c, r)] = t;
  }
  function walkable(x, y) {
    const t = tileAt(x, y);
    return t === T_GRASS || t === T_MAGIC || t === T_ASH || t === T_ICE;
  }

  function landNoise(c, r) {
    const cx = 30, cy = 30;
    const dx = (c - cx) / 23;
    const dy = (r - cy) / 20;
    const n = (hash2(c * 0.18, r * 0.18) + hash2(c * 0.07, r * 0.09) * 0.6) / 1.6;
    return dx * dx + dy * dy < 0.78 + (n - 0.5) * 0.35;
  }

  function generate() {
    worldSeed = (seed >>> 0) || ((Date.now() % 99991) + 17);
    if (!window.OpenWorldGen) {
      console.error("OpenWorldGen missing");
      return;
    }
    const gen = window.OpenWorldGen.generate({
      cols: WORLD_SIZE.cols,
      rows: WORLD_SIZE.rows,
      seed: worldSeed,
    });
    COLS = gen.cols;
    ROWS = gen.rows;
    biomes = gen.biomes;
    fog = new Uint8Array(COLS * ROWS);

    world.tiles = gen.tiles;
    world.wet = new Float32Array(COLS * ROWS);
    world.burn = new Float32Array(COLS * ROWS);
    world.elec = new Float32Array(COLS * ROWS);
    world.fireAge = new Float32Array(COLS * ROWS);
    world.iceAge = new Float32Array(COLS * ROWS);

    entities.length = 0;
    buildings.length = 0;
    props.length = 0;
    drops.length = 0;
    projectiles.length = 0;
    particles.length = 0;
    clouds.length = 0;

    Object.assign(landmarks, gen.landmarks);
    const campC = landmarks.camp.c, campR = landmarks.camp.r;
    const redC = landmarks.red.c, redR = landmarks.red.r;
    const magicCx = landmarks.ruin.c, magicCy = landmarks.ruin.r;
    const B = gen.BIOME;
    const dens = gen.density;

    // Blue camp — mid spacing (not cramped, not a vacant lot) + dressed yard
    const campTiles = [
      ["towerB", imgs.towerB, -3, -2, 128, 256],
      ["house", imgs.house, 0, -3, 128, 192],
      ["monastery", imgs.monastery, 3, -2, 192, 320],
      ["archeryB", imgs.archeryB, -3, 2, 192, 256],
      ["barracksB", imgs.barracksB, 3, 2, 192, 256],
      ["house2", imgs.house2, 0, 3, 128, 192],
    ];
    for (const [k, img, dc, dr, w, h] of campTiles) {
      if (!img) continue;
      const tx = (campC + dc + 0.5) * TILE, ty = (campR + dr + 0.5) * TILE;
      if (buildingBlocksXY(tx, ty, 40)) continue;
      addBuildingAt(k, img, campC + dc, campR + dr, w, h);
    }
    unifyCampYard(campC, campR, 7, B.MEADOW);
    for (const b of buildings) {
      if (b.solid === false) continue;
      clearPropsNear(b.x, b.y, Math.max(72, (b.footW || 48) + 30));
    }
    // Fence just outside the six buildings (south gate)
    placeFenceRing(campC, campR, 6, 5);
    scrubFencesThroughBuildings();
    scrubPropsOnFences(80);
    clearCampTreesOnFence(campC, campR, 7, 6);
    // Camp keeps only the player + one monk (spawned later) — no extra friendlies

    // Red fortress — cross layout on 4-tile spacing
    paveCross(redC, redR, 5);
    addBuildingAt("castleR", imgs.castleR, redC, redR, 320, 256);
    addBuildingAt("towerR", imgs.towerR, redC - 4, redR, 128, 256);
    addBuildingAt("barracksR", imgs.barracksR, redC + 4, redR, 192, 256);
    addBuildingAt("houseR", imgs.houseR, redC + 2, redR + 4, 128, 192);
    if (imgs.houseR1) addBuildingAt("houseR1", imgs.houseR1, redC - 3, redR + 3, 128, 192);
    if (imgs.houseR3) addBuildingAt("houseR3", imgs.houseR3, redC + 4, redR + 2, 128, 192);
    if (imgs.archeryR) addBuildingAt("archeryR", imgs.archeryR, redC + 4, redR - 3, 192, 256);
    if (imgs.monasteryR) addBuildingAt("monasteryR", imgs.monasteryR, redC - 4, redR + 3, 192, 320);
    for (let i = 0; i < 4; i++) {
      const g = spawnEnemy(i % 2 === 0 ? "warrior" : "archer", (redC - 1.5 + i) * TILE, (redR + 3) * TILE, false);
      if (g) { g.homeX = g.x; g.homeY = g.y; g.castleGuard = true; }
    }
    for (let i = 0; i < 2; i++) {
      const L = spawnEnemy("lancer", (redC - 2 + i * 4) * TILE, (redR + 2) * TILE, false);
      if (L) { L.homeX = L.x; L.homeY = L.y; L.castleGuard = true; }
    }

    fires.length = 0;
    // Central fire — plaza stays walkable between buildings
    campfire = { x: (campC + 0.5) * TILE, y: (campR + 0.5) * TILE, lit: true, fuel: 55 };
    fires.push(campfire);
    // Soft fill so the mid-yard isn't bare grass (props, not more buildings)
    {
      const cx = (campC + 0.5) * TILE, cy = (campR + 0.5) * TILE;
      const decos = [imgs.deco1, imgs.deco2, imgs.deco3, imgs.deco4, imgs.deco5, imgs.deco6,
        imgs.deco7, imgs.deco8, imgs.deco9, imgs.deco10].filter(Boolean);
      for (let i = 0; i < decos.length; i++) {
        const a = (i / decos.length) * Math.PI * 2 + 0.35;
        const rad = 1.6 + (i % 3) * 0.45;
        const dx = cx + Math.cos(a) * rad * TILE;
        const dy = cy + Math.sin(a) * rad * TILE;
        if (buildingBlocksXY(dx, dy, 32)) continue;
        if (dist(dx, dy, cx, cy) < 52) continue;
        if (props.some((p) => p.kind === "fence" && dist(p.x, p.y, dx, dy) < 44)) continue;
        props.push({
          kind: "deco", img: decos[i],
          x: dx, y: dy,
          fw: 64, fh: 64, frames: 1, hp: 99, solid: false, z: 0,
        });
      }
      if (imgs.bush2 || imgs.bush) {
        props.push({
          kind: "berry", img: imgs.bush2 || imgs.bush,
          x: cx + 88, y: cy + 48,
          fw: 128, fh: 128, frames: 8, hp: 99, ripe: true, grow: 0,
        });
        props.push({
          kind: "berry", img: imgs.bush || imgs.bush2,
          x: cx - 92, y: cy + 40,
          fw: 128, fh: 128, frames: 8, hp: 99, ripe: true, grow: 0,
        });
      }
      if (imgs.rock) {
        props.push(makeRockProp(cx + 64, cy - 56, imgs.rock));
        props.push(makeRockProp(cx - 70, cy - 48, imgs.rock3 || imgs.rock2 || imgs.rock));
      }
      props.push({
        kind: "chest", x: cx + 12, y: cy + 96,
        fw: 48, fh: 40, frames: 1, hp: 40, max: 40, solid: true, z: 0,
        store: { wood: 4, flint: 2, gold: 1 },
      });
    }
    gnomeTower = null;
    if (landmarks.forest) {
      const fc = Math.round(landmarks.forest.c), fr = Math.round(landmarks.forest.r);
      // Goblin row (east), gnome row (west) — 3-tile spacing
      if (imgs.goblinHut) {
        addBuildingAt("goblinHut", imgs.goblinHut, fc + 2, fr, 160, 160);
        if (imgs.goblinHouse) addBuildingAt("goblinHouse", imgs.goblinHouse, fc + 5, fr, 160, 160);
        if (imgs.woodTowerG) addBuildingAt("woodTowerG", imgs.woodTowerG, fc + 3, fr - 3, 128, 192);
        if (imgs.woodTowerB) addBuildingAt("woodTowerB", imgs.woodTowerB, fc + 6, fr - 2, 128, 192);
        if (imgs.woodTowerY) addBuildingAt("woodTowerY", imgs.woodTowerY, fc + 1, fr - 4, 128, 192);
        if (imgs.woodTowerP) addBuildingAt("woodTowerP", imgs.woodTowerP, fc + 4, fr - 5, 128, 192);
        for (let i = 0; i < 3; i++) {
          const g = spawnEnemy("spear_goblin", (fc + 2 + i) * TILE, (fr + 2) * TILE, false);
          if (g) { g.homeX = g.x; g.homeY = g.y; g.hutGuard = true; }
        }
        const tg = spawnEnemy("torch_goblin", (fc + 4) * TILE, (fr + 2) * TILE, false);
        if (tg) { tg.nightOnly = false; tg.homeX = tg.x; tg.homeY = tg.y; tg.hutGuard = true; }
        const bg = spawnEnemy("barrel_goblin", (fc + 3) * TILE, (fr + 3) * TILE, false);
        if (bg) { bg.homeX = bg.x; bg.homeY = bg.y; bg.hutGuard = true; }
        const tnt = spawnEnemy("tnt_goblin", (fc + 5) * TILE, (fr + 3) * TILE, false);
        if (tnt) { tnt.homeX = tnt.x; tnt.homeY = tnt.y; tnt.hutGuard = true; }
        const tg2 = spawnEnemy("clan_torch", (fc + 2.5) * TILE, (fr + 3.5) * TILE, false);
        if (tg2) { tg2.nightOnly = false; tg2.homeX = tg2.x; tg2.homeY = tg2.y; tg2.hutGuard = true; }
        const bg2 = spawnEnemy(rand() < 0.5 ? "barrel_goblin_y" : "barrel_goblin_p", (fc + 4.5) * TILE, (fr + 2.5) * TILE, false);
        if (bg2) { bg2.homeX = bg2.x; bg2.homeY = bg2.y; bg2.hutGuard = true; }
        const tnt2 = spawnEnemy("tnt_goblin_b", (fc + 1.5) * TILE, (fr + 2.5) * TILE, false);
        if (tnt2) { tnt2.homeX = tnt2.x; tnt2.homeY = tnt2.y; tnt2.hutGuard = true; }
        const bb = spawnEnemy("barrel_goblin_b", (fc + 3.5) * TILE, (fr + 4) * TILE, false);
        if (bb) { bb.homeX = bb.x; bb.homeY = bb.y; bb.hutGuard = true; }
        const tp = spawnEnemy("clan_torch_p", (fc + 5) * TILE, (fr + 1.5) * TILE, false);
        if (tp) { tp.nightOnly = false; tp.homeX = tp.x; tp.homeY = tp.y; tp.hutGuard = true; }
        const ty = spawnEnemy("clan_torch_y", (fc + 0.5) * TILE, (fr + 3) * TILE, false);
        if (ty) { ty.nightOnly = false; ty.homeX = ty.x; ty.homeY = ty.y; ty.hutGuard = true; }
        const tntp = spawnEnemy("tnt_goblin_p", (fc + 6) * TILE, (fr + 3) * TILE, false);
        if (tntp) { tntp.homeX = tntp.x; tntp.homeY = tntp.y; tntp.hutGuard = true; }
        if (imgs.pack_u010_Factions_Goblins_Buildings_Wood_Tower_Wood_Tower_InConstruction_png) {
          addBuildingAt("woodTowerBuild", imgs.pack_u010_Factions_Goblins_Buildings_Wood_Tower_Wood_Tower_InConstruction_png, fc - 1, fr - 3, 128, 192);
        }
      }
      if (imgs.gnomeTower) {
        gnomeTower = addBuildingAt("gnomeTower", imgs.gnomeTower, fc - 3, fr, 128, 256);
        if (imgs.gnomeHut) addBuildingAt("gnomeHut", imgs.gnomeHut, fc - 5, fr, 128, 192);
        for (let i = 0; i < 3; i++) {
          const g = spawnEnemy("sling_gnome", (fc - 4 + i) * TILE, (fr + 2) * TILE, false);
          if (g) { g.homeX = g.x; g.homeY = g.y; g.gnomeGuard = true; }
        }
        for (let i = 0; i < 2; i++) {
          const g = spawnEnemy("gnome", (fc - 3.5 + i) * TILE, (fr + 3) * TILE, false);
          if (g) { g.homeX = g.x; g.homeY = g.y; g.gnomeGuard = true; }
        }
      }
    }
    // Cave mouth + multi-room DST-ish cave layer (bats / rocky / spider / deep)
    caveEntrance = null;
    caveInterior = null;
    inCave = false;
    overworldReturn = null;
    if (landmarks.mines) {
      const mc = landmarks.mines.c, mr = landmarks.mines.r;
      const mmc = Math.round(mc), mmr = Math.round(mr);
      caveEntrance = tileXY(mmc, mmr);
      addBuildingAt("cave", imgs.caveIdle, mmc, mmr, 192, 192);
      if (imgs.goldMine) {
        const gm = addBuildingAt("goldMine", imgs.goldMine, mmc - 3, mmr, 192, 160);
        gm.mineStock = 14; gm.mineMax = 14; gm.regen = 0; gm.depleted = false;
      }
      if (imgs.towerK) addBuildingAt("towerK", imgs.towerK, mmc + 3, mmr, 128, 256);
      for (let i = 0; i < 2; i++) {
        const g = spawnEnemy("troll", (mmc - 1 + i * 2) * TILE, (mmr + 2) * TILE, false);
        if (g) { g.homeX = g.x; g.homeY = g.y; g.mineGuard = true; }
      }

      const carveEll = (cx, cy, rw, rh) => {
        for (let r = cy - rh; r <= cy + rh; r++) {
          for (let c = cx - rw; c <= cx + rw; c++) {
            if (!inb(c, r)) continue;
            const dx = (c - cx) / rw, dy = (r - cy) / rh;
            if (dx * dx + dy * dy > 1.05) continue;
            world.tiles[idx(c, r)] = T_ASH;
            biomes[idx(c, r)] = B.MINES;
          }
        }
      };
      const carveHall = (c0, r0, c1, r1, w) => {
        const steps = Math.max(Math.abs(c1 - c0), Math.abs(r1 - r0), 1);
        for (let i = 0; i <= steps; i++) {
          const c = Math.round(c0 + (c1 - c0) * (i / steps));
          const r = Math.round(r0 + (r1 - r0) * (i / steps));
          for (let dr = -w; dr <= w; dr++) for (let dc = -w; dc <= w; dc++) {
            if (!inb(c + dc, r + dr)) continue;
            world.tiles[idx(c + dc, r + dr)] = T_ASH;
            biomes[idx(c + dc, r + dr)] = B.MINES;
          }
        }
      };
      const spawnCaveMob = (kind, x, y, phantom) => {
        const e = spawnEnemy(kind, x, y, !!phantom);
        if (e) {
          e.caveDweller = true;
          e.homeX = e.x; e.homeY = e.y;
          e.nightOnly = false;
          e.raid = false;
        }
        return e;
      };

      // Room centers (tile) — inspired by DST cave rooms: generic / bats / rocky / spiders / deep
      const hub = { c: Math.max(10, mc - 14), r: Math.min(ROWS - 12, mr + 10) };
      const bats = { c: hub.c, r: hub.r - 14 };
      const rocky = { c: hub.c + 16, r: hub.r - 4 };
      const spiders = { c: hub.c - 15, r: hub.r - 2 };
      const deep = { c: hub.c + 2, r: hub.r - 26 };

      carveEll(hub.c, hub.r, 9, 7);
      carveEll(bats.c, bats.r, 8, 7);
      carveEll(rocky.c, rocky.r, 9, 6);
      carveEll(spiders.c, spiders.r, 7, 7);
      carveEll(deep.c, deep.r, 10, 8);
      carveHall(hub.c, hub.r, bats.c, bats.r, 2);
      carveHall(hub.c, hub.r, rocky.c, rocky.r, 2);
      carveHall(hub.c, hub.r, spiders.c, spiders.r, 2);
      carveHall(bats.c, bats.r, deep.c, deep.r, 2);

      // Exit / rope at hub south
      caveInterior = { x: hub.c * TILE + 32, y: (hub.r + 4) * TILE + 32 };
      // Light mushrooms / gold / dens by room
      for (let i = 0; i < 10; i++) {
        props.push(makeGoldProp(
          (rocky.c + (rand() - 0.5) * 10) * TILE + 32,
          (rocky.r + (rand() - 0.5) * 7) * TILE + 40,
          { caveOnly: true }
        ));
      }
      for (let i = 0; i < 6; i++) {
        props.push({
          kind: "berry", img: imgs.bush3 || imgs.bush,
          x: (deep.c + (rand() - 0.5) * 8) * TILE + 32,
          y: (deep.r + (rand() - 0.5) * 6) * TILE + 36,
          fw: 128, fh: 128, frames: 8, hp: 99, ripe: true, grow: 0, caveOnly: true, mush: true,
        });
      }
      for (let i = 0; i < 3; i++) {
        props.push({
          kind: "spiderden", x: (spiders.c + (i - 1) * 3) * TILE + 32, y: spiders.r * TILE + 32,
          fw: 64, fh: 64, frames: 1, hp: 70, max: 70, solid: true, z: 0, nest: 4, caveOnly: true,
        });
      }
      // Hub fire pit (player can refuel)
      spawnPlayerFire(hub.c * TILE + 32, hub.r * TILE + 10);
      if (fires.length) fires[fires.length - 1].fuel = 35;

      for (let i = 0; i < 7; i++) spawnCaveMob("bat", (bats.c + (rand() - 0.5) * 8) * TILE, (bats.r + (rand() - 0.5) * 6) * TILE);
      for (let i = 0; i < 4; i++) spawnCaveMob("spider", (spiders.c + (rand() - 0.5) * 6) * TILE, (spiders.r + (rand() - 0.5) * 5) * TILE);
      for (let i = 0; i < 3; i++) spawnCaveMob("spear_goblin", (rocky.c + (rand() - 0.5) * 6) * TILE, (rocky.r + (rand() - 0.5) * 4) * TILE);
      spawnCaveMob("troll", rocky.c * TILE + 40, rocky.r * TILE);
      const queen = spawnCaveMob("bat_queen", deep.c * TILE, deep.r * TILE - 40);
      if (queen) { queen.boss = true; queen.name = "蝠后"; queen.hp = Math.floor(queen.hp * 1.1); queen.maxHp = queen.hp; }
      for (let i = 0; i < 3; i++) {
        const p = spawnCaveMob("skull", (deep.c + (rand() - 0.5) * 6) * TILE, (deep.r + (rand() - 0.5) * 5) * TILE, true);
        if (p) p.name = "洞穴梦魇";
      }
      // Landmark props for player orientation
      props.push({
        kind: "caveSign", x: bats.c * TILE, y: bats.r * TILE, fw: 32, fh: 32, hp: 999, solid: false, z: 0,
        label: "蝠穴", caveOnly: true,
      });
      props.push({
        kind: "caveSign", x: rocky.c * TILE, y: rocky.r * TILE, fw: 32, fh: 32, hp: 999, solid: false, z: 0,
        label: "矿脉厅", caveOnly: true,
      });
      props.push({
        kind: "caveSign", x: spiders.c * TILE, y: spiders.r * TILE, fw: 32, fh: 32, hp: 999, solid: false, z: 0,
        label: "蛛巢廊", caveOnly: true,
      });
      props.push({
        kind: "caveSign", x: deep.c * TILE, y: deep.r * TILE, fw: 32, fh: 32, hp: 999, solid: false, z: 0,
        label: "深层", caveOnly: true,
      });
    }

    // Troll chieftain camp near mines entrance
    trollBoss = null;
    mooseBoss = null;
    warmstoneHeat = 0;
    if (landmarks.mines) {
      const mc = landmarks.mines.c, mr = landmarks.mines.r;
      const tx = (mc - 3) * TILE, ty = (mr + 2) * TILE;
      for (let r = mr; r < mr + 4; r++) for (let c = mc - 4; c < mc - 1; c++) {
        if (inb(c, r)) { world.tiles[idx(c, r)] = T_ASH; biomes[idx(c, r)] = B.MINES; }
      }
      if (imgs.deadTree) {
        props.push({
          kind: "deadTree", img: imgs.deadTree,
          x: tx - 40, y: ty - 10, hp: 6, max: 6, fw: 192, fh: 256, frames: 1, z: 1,
        });
      }
      trollBoss = spawnEnemy("troll", tx, ty, false);
      if (trollBoss) {
        trollBoss.boss = true;
        trollBoss.trollChief = true;
        trollBoss.hp = Math.floor(trollBoss.hp * 1.35);
        trollBoss.maxHp = trollBoss.hp;
        trollBoss.dmg = Math.floor(trollBoss.dmg * 1.15);
        trollBoss.homeX = trollBoss.x; trollBoss.homeY = trollBoss.y;
        trollBoss.name = "巨魔酋长";
      }
      for (let i = 0; i < 2; i++) {
        const s = spawnEnemy("spider", tx + (i - 0.5) * 55, ty + 40, false);
        if (s) { s.homeX = s.x; s.homeY = s.y; }
      }
    }

    // Shore boat -> small island pocket (east edge)
    boatDock = null; islandHub = null; onIsland = false;
    {
      let dockC = null, dockR = null;
      for (let r = ROWS - 20; r > 10 && !dockC; r--) {
        for (let c = 8; c < COLS - 8; c++) {
          if (biomes[idx(c, r)] === B.SHORE && world.tiles[idx(c, r)] !== T_WATER) {
            if (inb(c, r + 1) && world.tiles[idx(c, r + 1)] === T_WATER) {
              dockC = c; dockR = r; break;
            }
          }
        }
      }
      if (dockC == null) { dockC = Math.floor(COLS * 0.55); dockR = Math.floor(ROWS * 0.72); }
      boatDock = { x: dockC * TILE + 32, y: dockR * TILE + 32 };
      addBuilding("boat", imgs.boatIdle, boatDock.x, boatDock.y + 20, 50, 30, 192, 192);
      const ic = Math.min(COLS - 14, Math.floor(COLS * 0.82));
      const ir = Math.min(ROWS - 14, Math.floor(ROWS * 0.55));
      islandHub = { x: (ic + 3) * TILE, y: (ir + 3) * TILE };
      for (let r = ir; r < ir + 8; r++) {
        for (let c = ic; c < ic + 8; c++) {
          if (!inb(c, r)) continue;
          world.tiles[idx(c, r)] = T_GRASS;
          biomes[idx(c, r)] = B.MEADOW;
        }
      }
      // ring water
      for (let r = ir - 1; r < ir + 9; r++) {
        for (let c = ic - 1; c < ic + 9; c++) {
          if (!inb(c, r)) continue;
          if (r === ir - 1 || r === ir + 8 || c === ic - 1 || c === ic + 8) {
            world.tiles[idx(c, r)] = T_WATER;
            biomes[idx(c, r)] = B.OCEAN;
          }
        }
      }
      for (let i = 0; i < 4; i++) {
        props.push({
          kind: "berry", img: imgs.bush2 || imgs.bush, x: islandHub.x + (i - 1.5) * 40, y: islandHub.y + 30,
          fw: 128, fh: 128, frames: 8, hp: 99, ripe: true, grow: 0,
        });
      }
      const gn = spawnEnemy("gnoll", islandHub.x + 50, islandHub.y - 20, false);
      if (gn) { gn.homeX = gn.x; gn.homeY = gn.y; }
      spawnPlayerFire(islandHub.x - 30, islandHub.y + 10);
      addBuilding("boat", imgs.boatIdle, islandHub.x + 40, islandHub.y + 60, 50, 30, 192, 192);
      // paddle sharks near dock waters
      for (let i = 0; i < 3; i++) {
        let sx = boatDock.x + (rand() - 0.5) * 200;
        let sy = boatDock.y + 80 + rand() * 60;
        let placed = false;
        for (let t = 0; t < 10; t++) {
          if (tileAt(sx, sy) === T_WATER) { placed = true; break; }
          sy += 24; sx += (rand() - 0.5) * 40;
        }
        if (!placed) continue;
        const sh = spawnEnemy(rand() < 0.5 ? "paddle_shark" : "harpoon_shark", sx, sy, false);
        if (sh) { sh.homeX = sh.x; sh.homeY = sh.y; sh.aquatic = true; }
      }
    }

    // Pirate tower near shore dock
    pirateTower = null;
    if (boatDock && imgs.pirateTowerG) {
      const px = boatDock.x - 140, py = boatDock.y - 30;
      addBuilding("pirateTower", imgs.pirateTowerG, px, py, 40, 50, 128, 192);
      const b = buildings[buildings.length - 1];
      b.pirate = true;
      b.hp = 180; b.maxHp = 180;
      b.cd = 0;
      pirateTower = b;
      for (let i = 0; i < 2; i++) {
        const g = spawnEnemy("gnoll", px + (i - 0.5) * 60, py + 50, false);
        if (g) { g.homeX = g.x; g.homeY = g.y; g.pirate = true; }
      }
      for (let i = 0; i < 2; i++) {
        let bx = px + (i - 0.5) * 70, by = py + 90;
        for (let t = 0; t < 10 && tileAt(bx, by) !== T_WATER; t++) by += 28;
        if (tileAt(bx, by) !== T_WATER) continue;
        const bf = spawnEnemy("bomb_fish", bx, by, false);
        if (bf) { bf.homeX = bf.x; bf.homeY = bf.y; bf.pirate = true; bf.aquatic = true; }
      }
    }

    // Fish hut opposite side of dock
    fishHut = null;
    if (boatDock && imgs.fishHut) {
      const fx = boatDock.x + 160, fy = boatDock.y + 10;
      addBuilding("fishHut", imgs.fishHut, fx, fy, 48, 40, 192, 192);
      const fh = buildings[buildings.length - 1];
      fh.frames = 8;
      fh.fishCd = 0;
      fishHut = fh;
    }

    // West shore seahorse -> secret island
    seaDock = null; seaIsland = null; onSeaIsland = false;
    if (imgs.seahorseIdle) {
      let best = null, bestScore = 1e9;
      for (let r = 20; r < ROWS - 20; r++) {
        for (let c = 8; c < Math.floor(COLS * 0.38); c++) {
          if (biomes[idx(c, r)] !== B.SHORE) continue;
          const sc = Math.abs(r - ROWS * 0.45) + c * 0.15;
          if (sc < bestScore) { bestScore = sc; best = { c, r }; }
        }
      }
      if (best) {
        const dc = best.c, dr = best.r;
        for (let r = dr - 1; r <= dr + 2; r++) for (let c = dc - 1; c <= dc + 2; c++) {
          if (inb(c, r)) { world.tiles[idx(c, r)] = T_GRASS; biomes[idx(c, r)] = B.SHORE; }
        }
        seaDock = { x: dc * TILE + 32, y: dr * TILE + 32 };
        addBuilding("seahorse", imgs.seahorseIdle, seaDock.x, seaDock.y + 16, 50, 30, 192, 192);
        const ic = Math.max(3, dc - 11), ir = clamp(dr - 1, 4, ROWS - 12);
        for (let r = ir; r < ir + 7; r++) for (let c = ic; c < ic + 7; c++) {
          if (!inb(c, r)) continue;
          const edge = r === ir || r === ir + 6 || c === ic || c === ic + 6;
          world.tiles[idx(c, r)] = edge ? T_WATER : T_GRASS;
          biomes[idx(c, r)] = edge ? B.OCEAN : B.MAGIC;
        }
        // larger walkable pad (avoid feeling boxed by water foam)
        for (let r = ir + 1; r < ir + 6; r++) for (let c = ic + 1; c < ic + 6; c++) {
          if (inb(c, r)) { world.tiles[idx(c, r)] = T_GRASS; biomes[idx(c, r)] = B.MAGIC; }
        }
        seaIsland = { x: (ic + 3) * TILE, y: (ir + 3) * TILE };
        // return boat sits ON the island so player can E to leave
        addBuilding("seahorse", imgs.seahorseIdle, seaIsland.x - 50, seaIsland.y + 55, 50, 30, 192, 192);
        spawnPickup(seaIsland.x, seaIsland.y - 20, "gold");
        spawnPickup(seaIsland.x + 24, seaIsland.y, "gold");
        const hex = spawnEnemy("hex_shaman", seaIsland.x + 40, seaIsland.y - 10, false);
        if (hex) { hex.homeX = hex.x; hex.homeY = hex.y; }
        const imp = spawnEnemy("imp", seaIsland.x - 30, seaIsland.y + 10, false);
        if (imp) { imp.homeX = imp.x; imp.homeY = imp.y; }
        spawnPlayerFire(seaIsland.x + 10, seaIsland.y + 20);
      }
    }

    // Bear den near forest
    bearBoss = null;
    if (landmarks.forest) {
      const fc = landmarks.forest.c, fr = landmarks.forest.r;
      const bx = (fc - 2) * TILE, by = (fr + 2) * TILE;
      for (let r = fr; r < fr + 5; r++) for (let c = fc - 3; c < fc + 1; c++) {
        if (inb(c, r)) { world.tiles[idx(c, r)] = T_GRASS; biomes[idx(c, r)] = B.FOREST; }
      }
      props.push(makeRockProp(bx, by, imgs.rock, { den: true }));
      props.push(makeRockProp(bx + 50, by + 20, imgs.rock2 || imgs.rock, { den: true }));
      bearBoss = spawnEnemy("bear", bx + 30, by + 40, false);
      if (bearBoss) {
        bearBoss.boss = true;
        bearBoss.name = "密林熊王";
        bearBoss.hp = 220; bearBoss.maxHp = 220;
        bearBoss.dmg = 26; bearBoss.aggro = 640;
        bearBoss.homeX = bearBoss.x; bearBoss.homeY = bearBoss.y;
      }
    }

    for (let r = 4; r < ROWS - 4; r++) {
      for (let c = 4; c < COLS - 4; c++) {
        const bi = biomes[idx(c, r)];
        if (bi === B.OCEAN) continue;
        if (nearBuilding(c * TILE, r * TILE, 160)) continue;
        const d = dens[bi] || dens[B.MEADOW];
        const roll = rand();
        if (roll < d.tree) {
          const trees = [imgs.tree1, imgs.tree2, imgs.tree3, imgs.tree4].filter(Boolean);
          // Forest prefers denser canopy sprites; savanna thinner
          let pickTree = trees[0] || imgs.tree1;
          if (bi === B.FOREST && trees.length) pickTree = trees[irand(0, trees.length - 1)];
          else if (bi === B.SAVANNA) pickTree = imgs.tree3 || imgs.tree2 || imgs.tree1;
          else if (bi === B.MAGIC) pickTree = imgs.deadTree || imgs.tree4 || imgs.tree1;
          else pickTree = trees[irand(0, Math.min(1, trees.length - 1))] || imgs.tree1;
          const tsm = treeSheetFor(pickTree);
          props.push({
            kind: "tree",
            img: pickTree,
            stumpImg: [imgs.stump, imgs.stump2, imgs.stump3, imgs.stump4].filter(Boolean)[irand(0, 3)] || imgs.stump,
            x: c * TILE + 32, y: r * TILE + 40,
            hp: 4, max: 4, fw: tsm.fw, fh: tsm.fh, frames: tsm.frames, z: 1,
          });
        } else if (roll < d.tree + d.gold) {
          const gv = pickGoldVariant();
          props.push(makeGoldProp(c * TILE + 32, r * TILE + 40, { img: gv.img, hi: gv.hi }));
        } else if (roll < d.tree + d.gold + d.bush) {
          const bimgs = [imgs.bush, imgs.bush2, imgs.bush3, imgs.bush4].filter(Boolean);
          const berry = rand() < 0.55;
          props.push({
            kind: berry ? "berry" : "bush",
            img: pick(bimgs) || imgs.bush,
            x: c * TILE + 32, y: r * TILE + 36,
            fw: 128, fh: 128, frames: 8, z: 0,
            hp: berry ? 99 : 1, max: 99,
            ripe: berry ? (rand() < 0.7) : false,
            grow: berry ? rand() * 40 : 0,
          });
        } else if (roll < d.tree + d.gold + d.bush + d.rock) {
          props.push(makeRockProp(c * TILE + 32, r * TILE + 32));
        }
      }
    }

    // Clearing outside yard fence (DST: resources ring the start, not empty meadow)
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      const rad = 6.4 + (i % 3) * 0.6; // just outside fence (half≈6)
      const c = Math.round(campC + Math.cos(a) * rad);
      const r = Math.round(campR + Math.sin(a) * rad);
      if (!inb(c, r) || world.tiles[idx(c, r)] === T_WATER) continue;
      if (buildingBlocksXY(c * TILE + 32, r * TILE + 32, 20)) continue;
      if (props.some((p) => p.kind === "fence" && dist(p.x, p.y, c * TILE + 32, r * TILE + 32) < 48)) continue;
      if (i % 3 === 0) {
        props.push({
          kind: "bush", img: imgs.bush || imgs.bush2,
          x: c * TILE + 32, y: r * TILE + 36,
          fw: 128, fh: 128, frames: 8, z: 0, hp: 1, max: 1,
        });
      } else if (i % 3 === 1) {
        props.push({
          kind: "berry", img: imgs.bush2 || imgs.bush,
          x: c * TILE + 32, y: r * TILE + 36,
          fw: 128, fh: 128, frames: 8, hp: 99, ripe: true, grow: 0,
        });
      } else {
        props.push(makeRockProp(c * TILE + 32, r * TILE + 32, imgs.rock));
      }
    }

    // DS-scale fauna: more attempts across 425² continents
    for (let i = 0; i < 72; i++) {
      const c = irand(4, COLS - 5), r = irand(4, ROWS - 5);
      const bi = biomes[idx(c, r)];
      if (bi !== B.MEADOW && bi !== B.SHORE && bi !== B.FOREST && bi !== B.SAVANNA) continue;
      spawnSheep(c, r);
    }
    for (let i = 0; i < 36; i++) {
      const c = irand(4, COLS - 5), r = irand(4, ROWS - 5);
      const bi = biomes[idx(c, r)];
      if (bi !== B.FOREST && bi !== B.MEADOW && bi !== B.SAVANNA) continue;
      if (world.tiles[idx(c, r)] === T_WATER) continue;
      spawnPig(c, r);
    }

    // Wild beehives — BeeClearing / BeeQueenBee rooms: 1 hive + flowers at Beeeees!, sparse elsewhere (BGGrass beehive≈0.003)
    const beeC = landmarks.bees ? landmarks.bees.c : campC;
    const beeR = landmarks.bees ? landmarks.bees.r : campR;
    if (landmarks.bees) {
      const bc0 = Math.round(beeC), br0 = Math.round(beeR);
      if (imgs.monasteryY) addBuildingAt("monasteryY", imgs.monasteryY, bc0 - 3, br0, 192, 320);
      if (imgs.towerY) addBuildingAt("towerY2", imgs.towerY, bc0 + 3, br0, 128, 256);
      props.push({
        kind: "beehive", x: (bc0 + 0.5) * TILE, y: (br0 + 0.5) * TILE,
        fw: 48, fh: 56, frames: 1, hp: 55, max: 55, solid: false, z: 0,
        honeyLeft: 5, anger: 0, queenish: true,
      });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const c = Math.round(beeC + Math.cos(a) * 3), r = Math.round(beeR + Math.sin(a) * 3);
        if (!inb(c, r) || world.tiles[idx(c, r)] === T_WATER) continue;
        props.push({
          kind: "berry", img: imgs.bush2 || imgs.bush,
          x: c * TILE + 32, y: r * TILE + 36,
          fw: 128, fh: 128, frames: 8, hp: 99, ripe: true, grow: 0, flowerPatch: true,
        });
      }
      // BeeQueenBee-ish: 1–2 extra hives nearby + angry bees
      for (let i = 0; i < 1 + (rand() < 0.5 ? 1 : 0); i++) {
        const c = Math.round(beeC + (rand() - 0.5) * 10);
        const r = Math.round(beeR + (rand() - 0.5) * 10);
        if (!inb(c, r) || biomes[idx(c, r)] === B.OCEAN) continue;
        props.push({
          kind: "beehive", x: c * TILE + 32, y: r * TILE + 32,
          fw: 48, fh: 56, frames: 1, hp: 40, max: 40, solid: false, z: 0,
          honeyLeft: 3, anger: 0,
        });
      }
      for (let i = 0; i < 4; i++) {
        const e = spawnEnemy("bee", (beeC + (rand() - 0.5) * 6) * TILE, (beeR + (rand() - 0.5) * 6) * TILE, false);
        if (e) { e.homeX = beeC * TILE; e.homeY = beeR * TILE; e.passive = true; }
      }
    }
    // Sparse meadow hives (BGGrass beehive weight)
    for (let i = 0; i < 8; i++) {
      const c = irand(6, COLS - 7), r = irand(6, ROWS - 7);
      if (biomes[idx(c, r)] !== B.MEADOW) continue;
      if (world.tiles[idx(c, r)] === T_WATER) continue;
      if (Math.hypot(c - campC, r - campR) < 24) continue;
      if (landmarks.bees && Math.hypot(c - beeC, r - beeR) < 20) continue;
      props.push({
        kind: "beehive", x: c * TILE + 32, y: r * TILE + 32,
        fw: 48, fh: 56, frames: 1, hp: 40, max: 40, solid: false, z: 0,
        honeyLeft: 3, anger: 0,
      });
    }


    // DST setpieces: PigKingdom, SpiderCity/Village, Graveyard, BarePlain beefalo
    pigKing = null;
    if (landmarks.pigking) {
      const pc = landmarks.pigking.c, pr = landmarks.pigking.r;
      const ppc = Math.round(pc), ppr = Math.round(pr);
      pigKing = tileXY(ppc, ppr);
      paveRect(ppc - 5, ppr - 5, ppc + 5, ppr + 5);
      addBuildingAt("pigking", imgs.castleY || imgs.houseY || imgs.houseR || imgs.house, ppc, ppr, 192, 256);
      if (imgs.towerY) addBuildingAt("towerY", imgs.towerY, ppc - 3, ppr - 2, 128, 256);
      if (imgs.archeryY) addBuildingAt("archeryY", imgs.archeryY, ppc + 3, ppr - 2, 192, 256);
      if (imgs.barracksY) addBuildingAt("barracksY", imgs.barracksY, ppc - 4, ppr + 2, 192, 256);
      if (imgs.houseY1) addBuildingAt("houseY1", imgs.houseY1, ppc + 4, ppr + 2, 128, 192);
      if (imgs.houseY3) addBuildingAt("houseY3", imgs.houseY3, ppc - 2, ppr + 4, 128, 192);

      // Courtyard ring: fixed 8 slots on radius 4
      const hutN = 8;
      for (let i = 0; i < hutN; i++) {
        const a = (i / hutN) * Math.PI * 2 + Math.PI / hutN;
        const hc = Math.round(ppc + Math.cos(a) * 4);
        const hr = Math.round(ppr + Math.sin(a) * 4);
        const hut = addBuildingAt("pigHut", imgs.houseY || imgs.houseR || imgs.house, hc, hr, 96, 128);
        spawnPig(hc, hr + 1, hut);
        if (i % 2 === 0) {
          const prd = spawnEnemy("pig_rider", (hc + 0.5) * TILE, (hr + 1.5) * TILE, false);
          if (prd) { prd.homeX = hut.x; prd.homeY = hut.y; prd.hutGuard = true; }
        }
      }
      for (let i = 0; i < 3; i++) spawnPig(ppc + (i - 1), ppr + 2);
      for (let i = 0; i < 2; i++) {
        const pd = spawnEnemy("panda", (ppc - 2 + i * 4) * TILE, (ppr + 6) * TILE, false);
        if (pd) { pd.homeX = pd.x; pd.homeY = pd.y; }
      }
      if (imgs.pandaGuard) addBuildingAt("pandaGuard", imgs.pandaGuard, ppc + 5, ppr + 3, 256, 256);
    }
    // SpiderCity near forest hub (distribute spiderden weight) + SpiderVillage cluster (5+random dens)
    if (landmarks.forest) {
      const fc = landmarks.forest.c, fr = landmarks.forest.r;
      for (let i = 0; i < 4; i++) {
        const c = Math.round(fc + (rand() - 0.5) * 18);
        const r = Math.round(fr + (rand() - 0.5) * 18);
        if (!inb(c, r) || (biomes[idx(c, r)] !== B.FOREST && biomes[idx(c, r)] !== B.MAGIC)) continue;
        if (Math.hypot(c - campC, r - campR) < 22) continue;
        props.push({
          kind: "spiderden", x: c * TILE + 32, y: r * TILE + 32,
          fw: 64, fh: 64, frames: 1, hp: 60, max: 60, solid: true, z: 0, nest: 3,
        });
        for (let s = 0; s < 2; s++) {
          const sp = spawnEnemy("spider", (c + (rand() - 0.5) * 2) * TILE, (r + (rand() - 0.5) * 2) * TILE, false);
          if (sp) { sp.homeX = c * TILE; sp.homeY = r * TILE; sp.passive = true; sp.denSpider = true; }
        }
      }
    }
    // SpiderVillage: dense den cluster (5 + random(3) dens)
    {
      let vc = null, vr = null;
      for (let t = 0; t < 50 && vc == null; t++) {
        const c = irand(12, COLS - 13), r = irand(12, ROWS - 13);
        const bi = biomes[idx(c, r)];
        if (bi !== B.FOREST && bi !== B.MINES && bi !== B.MAGIC) continue;
        if (Math.hypot(c - campC, r - campR) < 35) continue;
        vc = c; vr = r;
      }
      if (vc != null) {
        const denN = 5 + irand(0, 3);
        for (let i = 0; i < denN; i++) {
          const c = Math.round(vc + (rand() - 0.5) * 8);
          const r = Math.round(vr + (rand() - 0.5) * 8);
          if (!inb(c, r) || world.tiles[idx(c, r)] === T_WATER) continue;
          props.push({
            kind: "spiderden", x: c * TILE + 32, y: r * TILE + 32,
            fw: 64, fh: 64, frames: 1, hp: 70, max: 70, solid: true, z: 0, nest: 4,
          });
          const sp = spawnEnemy("spider", c * TILE + 20, r * TILE + 20, false);
          if (sp) { sp.homeX = c * TILE; sp.homeY = r * TILE; sp.passive = true; sp.denSpider = true; }
        }
        // goldnugget pile like SpiderVillage countprefabs
        for (let i = 0; i < 3 + irand(0, 3); i++) {
          props.push(makeGoldProp(
            (vc + (rand() - 0.5) * 4) * TILE + 32,
            (vr + (rand() - 0.5) * 4) * TILE + 40
          ));
        }
      }
    }
    // Sparse dens in deep forest / marsh (BGForest spiderden 0.02)
    for (let i = 0; i < 8; i++) {
      const c = irand(8, COLS - 9), r = irand(8, ROWS - 9);
      const bi = biomes[idx(c, r)];
      if (bi !== B.FOREST && bi !== B.MAGIC) continue;
      if (Math.hypot(c - campC, r - campR) < 28) continue;
      props.push({
        kind: "spiderden", x: c * TILE + 32, y: r * TILE + 32,
        fw: 64, fh: 64, frames: 1, hp: 60, max: 60, solid: true, z: 0, nest: 3,
      });
      const sp = spawnEnemy("spider", c * TILE + 36 + (rand() - 0.5) * 40, r * TILE + 36 + (rand() - 0.5) * 40, false);
      if (sp) { sp.homeX = c * TILE; sp.homeY = r * TILE; sp.passive = true; sp.denSpider = true; }
    }
    // Beefalo-like herds on savanna (BarePlain beefalo=0.2)
    if (landmarks.savanna) {
      const sc = landmarks.savanna.c, sr = landmarks.savanna.r;
      for (let i = 0; i < 12; i++) {
        const c = Math.round(sc + (rand() - 0.5) * 24);
        const r = Math.round(sr + (rand() - 0.5) * 24);
        spawnSheep(c, r);
        const sh = entities[entities.length - 1];
        if (sh && sh.kind === "sheep") { sh.beefalo = true; sh.hp = sh.maxHp = 50; sh.passive = true; }
      }
    }
    // Graveyard room: gravestone = 4 + random(4) near forest or mines
    {
      const gc = landmarks.forest ? landmarks.forest.c : (landmarks.mines ? landmarks.mines.c : campC);
      const gr = landmarks.forest ? landmarks.forest.r + 8 : (landmarks.mines ? landmarks.mines.r : campR);
      const graveN = 4 + irand(0, 4);
      for (let i = 0; i < graveN; i++) {
        const c = Math.round(gc + (rand() - 0.5) * 12);
        const r = Math.round(gr + (rand() - 0.5) * 10);
        if (!inb(c, r) || world.tiles[idx(c, r)] === T_WATER) continue;
        props.push({
          kind: "grave", x: c * TILE + 32, y: r * TILE + 32,
          fw: 48, fh: 48, frames: 1, hp: 20, max: 20, solid: false, z: 0, dug: false,
        });
      }
      for (let i = 0; i < Math.min(5, graveN); i++) {
        props.push(makeGoldProp(
          (gc + (rand() - 0.5) * 6) * TILE + 32,
          (gr + (rand() - 0.5) * 6) * TILE + 40
        ));
      }
    }
    // Wormhole pair (DST)
    {
      const spots = [];
      for (let t = 0; t < 40 && spots.length < 2; t++) {
        const c = irand(20, COLS - 21), r = irand(20, ROWS - 21);
        if (world.tiles[idx(c, r)] === T_WATER) continue;
        if (Math.hypot(c - campC, r - campR) < 25) continue;
        spots.push({ c, r });
      }
      if (spots.length === 2) {
        const a = { kind: "wormhole", x: spots[0].c * TILE + 32, y: spots[0].r * TILE + 32, fw: 64, fh: 64, frames: 1, hp: 999, solid: false, z: 0, link: 1 };
        const b = { kind: "wormhole", x: spots[1].c * TILE + 32, y: spots[1].r * TILE + 32, fw: 64, fh: 64, frames: 1, hp: 999, solid: false, z: 0, link: 0 };
        a.pair = b; b.pair = a;
        props.push(a, b);
      }
    }


    // south yard in front of house2 / gate
    monk = spawnNpc("monk", (campC - 1.5) * TILE, (campR + 4.4) * TILE);
    if (monk) {
      if (buildingBlocksXY(monk.x, monk.y, 12)) {
        monk.x = (campC + 0.5) * TILE;
        monk.y = (campR + 4.6) * TILE;
      }
      monk.homeX = monk.x;
      monk.homeY = monk.y;
    }
    // spawn player at south gate
    player = spawnPlayer((campC + 0.5) * TILE, (campR + 5.5) * TILE);
    if (buildingBlocksXY(player.x, player.y, 8)) {
      player.x = (campC + 0.5) * TILE;
      player.y = (campR + 6.2) * TILE;
    }
    refreshFenceLinks();
    player.speed = 175;
    if (window.DstSys) {
      if (!houndClock) houndClock = window.DstSys.createHoundClock();
      if (!toolDur) toolDur = window.DstSys.createTools();
      if (!wetness) wetness = window.DstSys.createWetness();
    }

    // DST-style biome fauna — safe start, biome-fit, passive wildlife tags
    const nearWater = (c, r) => {
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        if (inb(c + dx, r + dy) && world.tiles[idx(c + dx, r + dy)] === T_WATER) return true;
      }
      return false;
    };
    for (let r = 6; r < ROWS - 6; r += 3) {
      for (let c = 6; c < COLS - 6; c += 3) {
        const bi = biomes[idx(c, r)];
        const d = dens[bi];
        if (!d || rand() >= d.enemy) continue;
        // DST-ish starter bubble: no hostiles in ~28 tiles of camp
        if (Math.hypot(c - campC, r - campR) < 28) continue;
        if (world.tiles[idx(c, r)] === T_WATER && bi !== B.OCEAN && bi !== B.SHORE) continue;
        let kind = "spear_goblin";
        let phantom = false;
        let tags = {};
        if (bi === B.WAR) {
          // Chess / badlands — knights & lizards; sparse bombers
          const roll = rand();
          if (roll < 0.18) kind = "lancer";
          else if (roll < 0.36) kind = "black_knight";
          else if (roll < 0.54) kind = "lizard";
          else if (roll < 0.66) kind = "archer";
          else if (roll < 0.8) kind = "gnoll";
          else if (roll < 0.9) kind = "bomber_goblin";
          else kind = "warrior";
        } else if (bi === B.MAGIC) {
          // Marsh — frogs / turtles / snakes; dens & casters deeper in
          const roll = rand();
          if (roll < 0.28) { kind = "frog"; tags.passive = true; }
          else if (roll < 0.48) kind = "turtle";
          else if (roll < 0.62) kind = "snake";
          else if (roll < 0.76) { kind = "spider"; tags.passive = true; }
          else if (roll < 0.88) kind = "hex_shaman";
          else kind = "imp";
        } else if (bi === B.FOREST) {
          const roll = rand();
          if (roll < 0.28) { kind = "spider"; tags.passive = true; }
          else if (roll < 0.42) kind = "panda";
          else if (roll < 0.58) kind = "sling_gnome";
          else if (roll < 0.72) kind = "gnome";
          else if (roll < 0.86) kind = "spear_goblin";
          else kind = "gnoll";
        } else if (bi === B.MINES) {
          // Rocky — spiders / rare troll; bats stay nightOnly (surface)
          const roll = rand();
          if (roll < 0.12) kind = "troll";
          else if (roll < 0.4) { kind = "spider"; tags.passive = true; }
          else if (roll < 0.62) kind = "bat"; // nightOnly from pack
          else kind = "spear_goblin";
        } else if (bi === B.SAVANNA) {
          // Plains — koalefant/beefalo neighbors: lizards, snakes; rare bear far out
          const roll = rand();
          if (roll < 0.4) kind = "lizard";
          else if (roll < 0.68) kind = "snake";
          else if (roll < 0.82) kind = "bee";
          else if (Math.hypot(c - campC, r - campR) > 70 && roll < 0.94) kind = "bear";
          else kind = "gnoll";
          if (kind === "bee") tags.passive = true;
        } else if (bi === B.MEADOW) {
          // Grasslands — butterflies/bees/snakes; goblins rare & farther out
          const distCamp = Math.hypot(c - campC, r - campR);
          if (distCamp > 70 && rand() < 0.025) kind = "bear";
          else if (rand() < 0.45) { kind = "bee"; tags.passive = true; }
          else if (rand() < 0.55) kind = "snake";
          else if (distCamp > 40 && rand() < 0.35) kind = "thief"; // nightOnly
          else if (distCamp > 45) kind = "spear_goblin";
          else { kind = "bee"; tags.passive = true; }
        } else if (bi === B.SHORE) {
          // Coast — aquatics only in water tiles; land turtles/gnolls stay inland of the wet edge
          const onWater = world.tiles[idx(c, r)] === T_WATER;
          if (onWater) {
            const roll = rand();
            if (roll < 0.35) kind = "bomb_fish";
            else if (roll < 0.7) kind = "harpoon_shark";
            else kind = "paddle_shark";
          } else if (nearWater(c, r)) {
            // Avoid 1-tile peninsulas where land AI wedges into water and freezes
            let wet = 0;
            for (const [dc, dr] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
              if (inb(c + dc, r + dr) && world.tiles[idx(c + dc, r + dr)] === T_WATER) wet++;
            }
            if (wet >= 3) continue;
            kind = rand() < 0.55 ? "turtle" : "gnoll";
          } else {
            kind = rand() < 0.55 ? "turtle" : "gnoll";
          }
        } else if (bi === B.OCEAN) {
          if (world.tiles[idx(c, r)] !== T_WATER) continue;
          kind = rand() < 0.55 ? "bomb_fish" : "harpoon_shark";
        } else {
          kind = rand() < 0.22 ? "archer" : (rand() < 0.45 ? "spear_goblin" : "warrior");
        }
        const sx = c * TILE + 32, sy = r * TILE + 32;
        const aquaticKind = kind === "harpoon_shark" || kind === "paddle_shark" || kind === "bomb_fish";
        if (aquaticKind) {
          if (world.tiles[idx(c, r)] !== T_WATER) continue;
        } else if (!walkable(sx, sy)) continue;
        let crowded = false;
        for (const o of entities) {
          if (!o.dead && dist(o.x, o.y, sx, sy) < 48) { crowded = true; break; }
        }
        if (crowded) continue;
        const e = spawnEnemy(kind, sx, sy, phantom);
        if (!e) continue;
        e.homeX = e.x; e.homeY = e.y;
        e.homeBiome = bi;
        if (tags.passive) e.passive = true;
        // Bees from wild meadow are passive until hive/player provocation (DST)
        if (kind === "bee" && !e.passive) e.passive = true;
        if (aquaticKind) {
          e.aquatic = true;
        }
        if (kind === "frog") { e.frog = true; e.passive = true; }
        if (bi === B.MAGIC && (kind === "turtle" || kind === "snake" || kind === "frog")) {
          e.marshBound = true;
        }
      }
    }
    warlord = spawnEnemy("warlord", redC * TILE + 40, (redR + 2) * TILE, false);

    // Ruin / marsh fortress + minotaur / turtles
    minotaurBoss = null;
    if (landmarks.ruin) {
      const rc = Math.round(landmarks.ruin.c), rr = Math.round(landmarks.ruin.r);
      paveCross(rc, rr, 5);
      if (imgs.castleP) addBuildingAt("castleP", imgs.castleP, rc, rr, 320, 256);
      if (imgs.towerP) addBuildingAt("towerP", imgs.towerP, rc - 4, rr, 128, 256);
      if (imgs.monasteryP) addBuildingAt("monasteryP", imgs.monasteryP, rc + 4, rr - 2, 192, 320);
      if (imgs.archeryP) addBuildingAt("archeryP", imgs.archeryP, rc - 5, rr + 1, 192, 256);
      if (imgs.houseP2) addBuildingAt("houseP2", imgs.houseP2, rc - 2, rr + 4, 128, 192);
      if (imgs.houseP3) addBuildingAt("houseP3", imgs.houseP3, rc + 3, rr + 3, 128, 192);
      for (let i = 0; i < 2; i++) {
        const pa = spawnEnemy("purple_archer", (rc - 2 + i * 4) * TILE, (rr + 2) * TILE, false);
        if (pa) { pa.homeX = pa.x; pa.homeY = pa.y; pa.castleGuard = true; }
      }
      const pl = spawnEnemy("purple_lancer", (rc + 1) * TILE, (rr + 3) * TILE, false);
      if (pl) { pl.homeX = pl.x; pl.homeY = pl.y; pl.castleGuard = true; }

      if (imgs.barracksP) addBuildingAt("barracksP", imgs.barracksP, rc + 4, rr, 192, 256);
      if (imgs.houseP) addBuildingAt("houseP", imgs.houseP, rc + 2, rr + 4, 128, 192);
      if (imgs.turtleGuard) addBuildingAt("turtleGuard", imgs.turtleGuard, rc - 2, rr + 3, 320, 320);
      if (imgs.skullGuard) addBuildingAt("skullGuard", imgs.skullGuard, rc + 3, rr - 3, 256, 256);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const bx = (rc + Math.cos(a) * 3.2) * TILE;
        const by = (rr + Math.sin(a) * 3.2) * TILE;
        props.push({
          kind: "skullDeco",
          img: (i % 2 === 0 ? imgs.skullSpike : (imgs.bones1 || imgs.bones2)),
          x: bx, y: by,
          fw: i % 2 === 0 ? 64 : 64, fh: i % 2 === 0 ? 128 : 64,
          frames: 1, hp: 99, solid: false, z: 0, spike: i % 2 === 0,
        });
      }
      if (imgs.minotaurGuard) {
        addBuildingAt("minoGuard", imgs.minotaurGuard, rc - 2, rr - 1, 320, 320);
      }
      minotaurBoss = spawnEnemy("minotaur", (rc + 0.5) * TILE, (rr + 1.2) * TILE, false);
      if (minotaurBoss) {
        minotaurBoss.boss = true;
        minotaurBoss.minoBoss = true;
        minotaurBoss.homeX = minotaurBoss.x;
        minotaurBoss.homeY = minotaurBoss.y;
      }
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const tu = spawnEnemy("turtle", (rc + Math.cos(a) * 4) * TILE, (rr + Math.sin(a) * 4) * TILE, false);
        if (tu) { tu.homeX = tu.x; tu.homeY = tu.y; tu.hutGuard = true; }
      }
      for (let i = 0; i < 3; i++) {
        const sk = spawnEnemy("skull", (rc + 2 + i) * TILE, (rr + 0.5) * TILE, false);
        if (sk) { sk.nightOnly = false; sk.homeX = sk.x; sk.homeY = sk.y; }
      }
      const sh = spawnEnemy("hex_shaman", (rc - 3) * TILE, (rr + 2) * TILE, false);
      if (sh) { sh.homeX = sh.x; sh.homeY = sh.y; }
    }

    if (imgs.knightHouseDestroyed) addBuildingAt("ruinHouse", imgs.knightHouseDestroyed, magicCx - 5, magicCy + 2, 128, 160);
    if (imgs.knightTowerDestroyed) addBuildingAt("ruinTower", imgs.knightTowerDestroyed, magicCx + 5, magicCy - 1, 128, 200);
    if (imgs.castleKDestroyed) addBuildingAt("ruinCastle", imgs.castleKDestroyed, magicCx + 2, magicCy + 4, 220, 200);
    if (imgs.woodTowerDestroyed) addBuildingAt("ruinWoodTower", imgs.woodTowerDestroyed, magicCx - 3, magicCy - 4, 128, 180);
    if (imgs.goblinHouseDestroyed) addBuildingAt("ruinGoblinHouse", imgs.goblinHouseDestroyed, magicCx + 4, magicCy + 1, 128, 160);
    spawnPickup((magicCx - 1) * TILE, (magicCy + 1) * TILE, "rune_ice");
    spawnPickup((magicCx + 2) * TILE, (magicCy - 1) * TILE, "rune_lightning");

    const cloudImgs = [imgs.cloud, imgs.cloud2, imgs.cloud3, imgs.cloud4, imgs.cloud5, imgs.cloud6, imgs.cloud7, imgs.cloud8].filter(Boolean);
    for (let i = 0; i < 18; i++) {
      clouds.push({
        x: rand() * COLS * TILE,
        y: rand() * ROWS * TILE * 0.55,
        s: 0.7 + rand() * 0.9,
        v: 10 + rand() * 16,
        img: cloudImgs[i % cloudImgs.length] || imgs.cloud,
      });
    }
    scrubPropsOnFences(80);
    if (landmarks.camp) clearCampTreesOnFence(landmarks.camp.c, landmarks.camp.r, 7, 6);
    // Trees planted on wet edges clip into water — pull them inland or remove
    for (let i = props.length - 1; i >= 0; i--) {
      const p = props[i];
      if (!p || (p.kind !== "tree" && p.kind !== "deadTree")) continue;
      const tc = Math.floor(p.x / TILE), tr = Math.floor(p.y / TILE);
      if (!inb(tc, tr) || world.tiles[idx(tc, tr)] === T_WATER) { props.splice(i, 1); continue; }
      let wet = 0;
      for (const [dc, dr] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        if (!inb(tc + dc, tr + dr) || world.tiles[idx(tc + dc, tr + dr)] === T_WATER) wet++;
      }
      if (wet >= 2) props.splice(i, 1);
    }
    const toolImgs = [imgs.tool1, imgs.tool2, imgs.tool3, imgs.tool4].filter(Boolean);
    for (let i = 0; i < 16 && toolImgs.length; i++) {
      const c = irand(6, COLS - 7), r = irand(6, ROWS - 7);
      if (!walkable(c * TILE, r * TILE) || nearBuilding(c * TILE, r * TILE, 120)) continue;
      props.push({
        kind: "tool", img: toolImgs[i % toolImgs.length],
        x: c * TILE + 32, y: r * TILE + 32,
        fw: 64, fh: 64, frames: 1, hp: 1, solid: false, z: 0,
      });
    }
    const crateImgs = [imgs.u010Wood, imgs.u010GoldRes, imgs.u010Meat].filter(Boolean);
    for (let i = 0; i < 20 && crateImgs.length; i++) {
      const c = irand(6, COLS - 7), r = irand(6, ROWS - 7);
      if (!walkable(c * TILE, r * TILE) || nearBuilding(c * TILE, r * TILE, 140)) continue;
      props.push({
        kind: "crate", img: crateImgs[i % crateImgs.length],
        x: c * TILE + 32, y: r * TILE + 32,
        fw: 128, fh: 128, frames: 8, hp: 2, solid: true, z: 0,
      });
    }
    if (imgs.u010Tree) {
      for (let i = 0; i < 40; i++) {
        const c = irand(6, COLS - 7), r = irand(6, ROWS - 7);
        if (!walkable(c * TILE, r * TILE) || nearBuilding(c * TILE, r * TILE, 140)) continue;
        if (rand() > 0.08) continue;
        const usm = treeSheetFor(imgs.u010Tree);
        props.push({
          kind: "tree", img: imgs.u010Tree, stumpImg: imgs.stump3 || imgs.stump,
          x: c * TILE + 32, y: r * TILE + 40,
          hp: 4, max: 4, fw: usm.fw, fh: usm.fh, frames: usm.frames, z: 1,
        });
      }
    }
    if (imgs.u010Bridge) {
      for (const shore of [{ c: campC + 18, r: campR }, { c: campC - 16, r: campR + 4 }]) {
        props.push({
          kind: "bridge", img: imgs.u010Bridge,
          x: shore.c * TILE + 32, y: shore.r * TILE + 32,
          fw: 192, fh: 128, frames: 1, hp: 99, solid: false, z: 0,
        });
      }
    }


    // —— Remaining pack extras (Enemy Pack / Units / UI props) ——
    const skullDeco = [imgs.pack_ep_Enemy_Pack_Extra_Skull_decorations_Bones_03_png, imgs.pack_ep_Enemy_Pack_Extra_Skull_decorations_Skull_Spike_02_png].filter(Boolean);
    for (let i = 0; i < 12 && skullDeco.length; i++) {
      const c = irand(6, COLS - 7), r = irand(6, ROWS - 7);
      if (!walkable(c * TILE, r * TILE) || nearBuilding(c * TILE, r * TILE, 100)) continue;
      props.push({
        kind: "deco", img: skullDeco[i % skullDeco.length],
        x: c * TILE + 32, y: r * TILE + 32,
        fw: 64, fh: 64, frames: 1, hp: 99, solid: false, z: 0,
      });
    }
    const boatImgs = [imgs.pack_ep_Enemy_Pack_Extra_Seahorse_Boat_Seahorse_Boat_Bomb_Fish_png, imgs.pack_ep_Enemy_Pack_Extra_Seahorse_Boat_Seahorse_Boat_Harpoon_Shark_png, imgs.pack_ep_Enemy_Pack_Extra_Seahorse_Boat_Seahorse_Boat_Paddle_Shark_png, imgs.pack_ep_Enemy_Pack_Extra_Boat_Paddle_Shark_Row_png].filter(Boolean);
    for (let i = 0; i < 8 && boatImgs.length; i++) {
      const c = irand(4, COLS - 5), r = irand(4, ROWS - 5);
      if (!biomes || biomes[idx(c, r)] !== B.SHORE) continue;
      props.push({
        kind: "boatDeco", img: boatImgs[i % boatImgs.length],
        x: c * TILE + 32, y: r * TILE + 32,
        fw: 192, fh: 192, frames: 1, hp: 99, solid: false, z: 0,
      });
    }
    if (imgs.pack_ep_Enemy_Pack_Extra_Troll_Dead_Troll_Dead_png) {
      for (let i = 0; i < 3; i++) {
        const c = irand(8, COLS - 9), r = irand(8, ROWS - 9);
        if (!walkable(c * TILE, r * TILE)) continue;
        props.push({
          kind: "corpse", img: imgs.pack_ep_Enemy_Pack_Extra_Troll_Dead_Troll_Dead_png,
          x: c * TILE + 32, y: r * TILE + 32,
          fw: 256, fh: 256, frames: 1, hp: 99, solid: false, z: 0,
        });
      }
    }
    if (imgs.pack_u010_Resources_Sheep_HappySheep_Bouncing_png) {
      for (let i = 0; i < 6; i++) {
        const c = irand(8, COLS - 9), r = irand(8, ROWS - 9);
        if (!walkable(c * TILE, r * TILE) || nearBuilding(c * TILE, r * TILE, 120)) continue;
        const sh = spawnNpc("sheep", c * TILE, r * TILE);
        if (sh) { sh.imgOverride = imgs.pack_u010_Resources_Sheep_HappySheep_Bouncing_png; sh.fw = 128; sh.fh = 128; sh.frames = 8; sh.bounceSheep = true; }
      }
    }
    // Camp friendlies: only the real monk (spawned with landmarks). No dress-up NPCs.

    // Shore dressing: water rocks + rubber duck
    if (imgs.waterRock1 || imgs.rubberDuck) {
      for (let i = 0; i < 28; i++) {
        const c = irand(4, COLS - 5), r = irand(4, ROWS - 5);
        if (!biomes || biomes[idx(c, r)] !== B.SHORE) continue;
        if (world.tiles[idx(c, r)] === T_WATER) {
          props.push({
            kind: "waterRock",
            img: [imgs.waterRock1, imgs.waterRock2, imgs.waterRock3, imgs.waterRock4,
              imgs.u010WaterRock1, imgs.u010WaterRock2, imgs.u010WaterRock3, imgs.u010WaterRock4, imgs.rock].filter(Boolean)[irand(0, 8)] || imgs.rock,
            x: c * TILE + 32, y: r * TILE + 32,
            fw: 64, fh: 64, frames: 1, hp: 99, solid: false, z: 0,
          });
        } else if (imgs.rubberDuck && rand() < 0.12) {
          props.push({
            kind: "duck", img: imgs.rubberDuck,
            x: c * TILE + 32, y: r * TILE + 20,
            fw: 64, fh: 64, frames: 1, hp: 99, solid: false, z: 0,
          });
        }
      }
    }
    // Fish hut turtles (merm-ish)
    if (fishHut) {
      for (let i = 0; i < 2; i++) {
        const tu = spawnEnemy("turtle", fishHut.x + (i - 0.5) * 60, fishHut.y + 40, false);
        if (tu) { tu.homeX = tu.x; tu.homeY = tu.y; tu.hutGuard = true; }
      }
      const bf = spawnEnemy("bomb_fish", fishHut.x + 80, fishHut.y + 20, false);
      if (bf) {
        bf.homeX = bf.x; bf.homeY = bf.y; bf.aquatic = true;
        // Nudge into water if hut sits on land
        for (let t = 0; t < 8 && tileAt(bf.x, bf.y) !== T_WATER; t++) bf.y += 28;
        bf.homeX = bf.x; bf.homeY = bf.y;
      }
    }
    // Black shadow outpost near bluff / cave feel
    if (landmarks.bluff && imgs.castleK) {
      const bc = Math.round(landmarks.bluff.c), br = Math.round(landmarks.bluff.r);
      addBuildingAt("castleK", imgs.castleK, bc, br, 320, 256);
      if (imgs.houseK) addBuildingAt("houseK", imgs.houseK, bc + 3, br + 2, 128, 192);
      if (imgs.houseK1) addBuildingAt("houseK1", imgs.houseK1, bc + 5, br, 128, 192);
      if (imgs.houseK2) addBuildingAt("houseK2", imgs.houseK2, bc - 5, br + 1, 128, 192);
      if (imgs.towerK) addBuildingAt("towerK2", imgs.towerK, bc - 3, br, 128, 256);
      if (imgs.archeryK) addBuildingAt("archeryK", imgs.archeryK, bc + 2, br - 3, 192, 256);
      if (imgs.barracksK) addBuildingAt("barracksK", imgs.barracksK, bc - 2, br + 3, 192, 256);
      if (imgs.castleKFree) addBuildingAt("castleKFree", imgs.castleKFree, bc, br - 4, 320, 256);
      if (imgs.monasteryK) addBuildingAt("monasteryK", imgs.monasteryK, bc - 4, br - 2, 192, 320);
      for (let i = 0; i < 2; i++) {
        const ka = spawnEnemy("black_archer", (bc - 2 + i * 4) * TILE, (br + 2) * TILE, false);
        if (ka) { ka.homeX = ka.x; ka.homeY = ka.y; ka.castleGuard = true; }
      }
      const kl = spawnEnemy("black_lancer", (bc + 1) * TILE, (br + 1) * TILE, false);
      if (kl) { kl.homeX = kl.x; kl.homeY = kl.y; kl.castleGuard = true; }

      for (let i = 0; i < 3; i++) {
        const g = spawnEnemy(rand() < 0.5 ? "imp" : "skull", (bc - 1 + i) * TILE, (br + 3) * TILE, true);
        if (g) { g.homeX = g.x; g.homeY = g.y; g.nightOnly = false; }
      }
    }

    // —— Landmark setpieces: frogs / moles / wasps / hunters / moose / walk / pigs / shore battery ——
    if (landmarks.frogs) {
      const fc = Math.round(landmarks.frogs.c), fr = Math.round(landmarks.frogs.r);
      for (let i = 0; i < 5; i++) {
        const pc = Math.round(fc + (rand() - 0.5) * 10);
        const pr = Math.round(fr + (rand() - 0.5) * 10);
        if (!inb(pc, pr)) continue;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (!inb(pc + dx, pr + dy)) continue;
          if (Math.abs(dx) + Math.abs(dy) > 2) continue;
          world.tiles[idx(pc + dx, pr + dy)] = T_WATER;
          biomes[idx(pc + dx, pr + dy)] = B.MAGIC;
        }
      }
      for (let i = 0; i < 4; i++) {
        const tu = spawnEnemy("turtle", (fc + (rand() - 0.5) * 8) * TILE, (fr + (rand() - 0.5) * 8) * TILE, false);
        if (tu) { tu.homeX = tu.x; tu.homeY = tu.y; }
      }
      for (let i = 0; i < 8; i++) {
        const frg = spawnEnemy("frog", (fc + (rand() - 0.5) * 10) * TILE, (fr + (rand() - 0.5) * 10) * TILE, false);
        if (frg) { frg.homeX = frg.x; frg.homeY = frg.y; frg.passive = true; frg.frog = true; }
      }
      if (imgs.waterRock1) {
        for (let i = 0; i < 4; i++) {
          props.push({
            kind: "waterRock", img: imgs.waterRock1,
            x: (fc + (rand() - 0.5) * 6) * TILE + 32, y: (fr + (rand() - 0.5) * 6) * TILE + 32,
            fw: 64, fh: 64, frames: 1, hp: 99, solid: false, z: 0, frogsLeft: 3,
          });
        }
      }
      // Invisible pond sensors on carved water
      for (let i = 0; i < 3; i++) {
        props.push({
          kind: "pondWake",
          x: (fc + (rand() - 0.5) * 8) * TILE + 32, y: (fr + (rand() - 0.5) * 8) * TILE + 32,
          fw: 32, fh: 32, frames: 1, hp: 99, solid: false, z: 0, frogsLeft: 2,
        });
      }
    }
    if (landmarks.moles || landmarks.moles_r) {
      const spots = [];
      for (const lm of [landmarks.moles, landmarks.moles_r]) {
        if (!lm) continue;
        if (spots.some((s) => Math.hypot(s.c - lm.c, s.r - lm.r) < 4)) continue;
        spots.push(lm);
      }
      for (const lm of spots) {
        const mc0 = Math.round(lm.c), mr0 = Math.round(lm.r);
        for (let i = 0; i < 5; i++) {
          const c = Math.round(mc0 + (rand() - 0.5) * 8);
          const r = Math.round(mr0 + (rand() - 0.5) * 8);
          if (!inb(c, r) || world.tiles[idx(c, r)] === T_WATER) continue;
          props.push({
            kind: "molehole", x: c * TILE + 32, y: r * TILE + 32,
            fw: 48, fh: 32, frames: 1, hp: 20, max: 20, solid: false, z: 0, dug: false,
          });
        }
        // Surface rocky: spiders nest-tied; bats remain nightOnly (DST cave bats ≠ day surface)
        for (let i = 0; i < 2; i++) {
          const sp = spawnEnemy("spider", (mc0 + 2 + i) * TILE, (mr0 - 1) * TILE, false);
          if (sp) { sp.homeX = sp.x; sp.homeY = sp.y; sp.passive = true; sp.denSpider = true; }
        }
        const bat = spawnEnemy("bat", mc0 * TILE, mr0 * TILE, false);
        if (bat) { bat.homeX = bat.x; bat.homeY = bat.y; }
        if (imgs.rock) {
          for (let i = 0; i < 4; i++) {
            props.push(makeRockProp(
              (mc0 + (rand() - 0.5) * 5) * TILE + 32,
              (mr0 + (rand() - 0.5) * 5) * TILE + 32,
              imgs.rock2 || imgs.rock
            ));
          }
        }
      }
    }
    if (landmarks.wasps) {
      const wc = Math.round(landmarks.wasps.c), wr = Math.round(landmarks.wasps.r);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const c = Math.round(wc + Math.cos(a) * 3);
        const r = Math.round(wr + Math.sin(a) * 3);
        if (!inb(c, r)) continue;
        props.push({
          kind: "beehive", x: c * TILE + 32, y: r * TILE + 32,
          fw: 48, fh: 56, frames: 1, hp: 50, max: 50, solid: false, z: 0,
          honeyLeft: 2, anger: 2, wasp: true,
        });
        for (let b = 0; b < 2; b++) {
          const bee = spawnEnemy("bee", (c + (rand() - 0.5)) * TILE, (r + (rand() - 0.5)) * TILE, false);
          if (bee) { bee.homeX = c * TILE; bee.homeY = r * TILE; bee.aggro = Math.max(bee.aggro, 640); bee.dmg = 8; bee.name = "狂蜂"; bee.passive = false; bee.killer = true; }
        }
      }
    }
    if (landmarks.hunters) {
      const hc = Math.round(landmarks.hunters.c), hr = Math.round(landmarks.hunters.r);
      paveRect(hc - 3, hr - 3, hc + 3, hr + 3);
      if (imgs.goblinHut) addBuildingAt("huntHut", imgs.goblinHut, hc, hr, 160, 160);
      if (imgs.woodTowerG) addBuildingAt("huntTower", imgs.woodTowerG, hc + 3, hr - 2, 128, 192);
      if (imgs.barrelGob) {
        for (let i = 0; i < 3; i++) {
          props.push({
            kind: "barrel", img: imgs.barrelGob,
            x: (hc - 2 + i) * TILE + 32, y: (hr + 2) * TILE + 28,
            fw: 64, fh: 64, frames: 1, hp: 30, max: 30, solid: true, z: 0,
          });
        }
      }
      if (imgs.dynamite) {
        props.push({
          kind: "dynamiteDeco", img: imgs.dynamite,
          x: (hc + 1) * TILE + 32, y: (hr + 1) * TILE + 20,
          fw: 48, fh: 48, frames: 1, hp: 15, max: 15, solid: false, z: 0,
        });
      }
      for (let i = 0; i < 5; i++) {
        const g = spawnEnemy("gnoll", (hc + (rand() - 0.5) * 5) * TILE, (hr + (rand() - 0.5) * 5) * TILE, false);
        if (g) { g.homeX = g.x; g.homeY = g.y; g.hutGuard = true; }
      }
      for (let i = 0; i < 3; i++) {
        const th = spawnEnemy("thief", (hc - 1 + i) * TILE, (hr + 3) * TILE, false);
        // Bandit camp: awake on site (like a setpiece fight), but leash home
        if (th) { th.nightOnly = false; th.homeX = th.x; th.homeY = th.y; th.hutGuard = true; }
      }
      const bg = spawnEnemy("bomber_goblin", (hc - 2) * TILE, (hr - 1) * TILE, false);
      if (bg) { bg.homeX = bg.x; bg.homeY = bg.y; }
    }
    if (landmarks.moose) {
      const mc1 = Math.round(landmarks.moose.c), mr1 = Math.round(landmarks.moose.r);
      mooseBoss = spawnEnemy("bear", (mc1 + 0.5) * TILE, (mr1 + 0.5) * TILE, false);
      if (mooseBoss) {
        mooseBoss.boss = true;
        mooseBoss.mooseBoss = true;
        mooseBoss.hp = mooseBoss.maxHp = 360;
        mooseBoss.dmg = 26;
        mooseBoss.aggro = 720;
        mooseBoss.name = "潮沼巢主";
        mooseBoss.homeX = mooseBoss.x;
        mooseBoss.homeY = mooseBoss.y;
      }
      for (let i = 0; i < 6; i++) {
        spawnSheep(mc1 + (rand() - 0.5) * 8, mr1 + (rand() - 0.5) * 8);
        const sh = entities[entities.length - 1];
        if (sh && sh.kind === "sheep") { sh.beefalo = true; sh.hp = sh.maxHp = 45; sh.passive = true; }
      }
      for (let i = 0; i < 3; i++) {
        const lz = spawnEnemy("lizard", (mc1 + Math.cos(i) * 4) * TILE, (mr1 + Math.sin(i) * 4) * TILE, false);
        if (lz) { lz.homeX = lz.x; lz.homeY = lz.y; }
      }
    }
    if (landmarks.walk) {
      const wc = Math.round(landmarks.walk.c), wr = Math.round(landmarks.walk.r);
      paveCross(wc, wr, 6);
      if (imgs.castleKBuild || imgs.castleK || imgs.castleKU010) {
        addBuildingAt("knightCastle", imgs.castleKU010 || imgs.castleK || imgs.castleKBuild, wc, wr - 1, 256, 256);
        if (imgs.knightHouseB) addBuildingAt("knightHouseB", imgs.knightHouseB, wc - 3, wr + 1, 128, 192);
        if (imgs.knightHouseR) addBuildingAt("knightHouseR", imgs.knightHouseR, wc + 3, wr + 1, 128, 192);
        if (imgs.knightTowerB) addBuildingAt("knightTowerB", imgs.knightTowerB, wc - 4, wr - 2, 128, 256);
        if (imgs.knightTowerY) addBuildingAt("knightTowerY", imgs.knightTowerY, wc + 4, wr - 2, 128, 256);
        if (imgs.knightHouseP) addBuildingAt("knightHouseP", imgs.knightHouseP, wc - 2, wr + 3, 128, 192);
        if (imgs.knightHouseY) addBuildingAt("knightHouseY", imgs.knightHouseY, wc + 2, wr + 3, 128, 192);
        if (imgs.knightTowerR) addBuildingAt("knightTowerR", imgs.knightTowerR, wc - 5, wr, 128, 256);
        if (imgs.knightTowerP) addBuildingAt("knightTowerP", imgs.knightTowerP, wc + 5, wr, 128, 256);
        if (imgs.castleKR) addBuildingAt("castleKR", imgs.castleKR, wc - 6, wr - 3, 256, 256);
        if (imgs.castleKP) addBuildingAt("castleKP", imgs.castleKP, wc + 6, wr - 3, 256, 256);
        if (imgs.castleKY) addBuildingAt("castleKY", imgs.castleKY, wc, wr - 5, 256, 256);
        for (let i = 0; i < 3; i++) {
          const kw = spawnEnemy("knight_warrior", (wc - 1 + i) * TILE, (wr + 2) * TILE, false);
          if (kw) { kw.homeX = kw.x; kw.homeY = kw.y; kw.castleGuard = true; }
        }
        for (let i = 0; i < 2; i++) {
          const ka = spawnEnemy("knight_archer", (wc - 2 + i * 4) * TILE, (wr + 1) * TILE, false);
          if (ka) { ka.homeX = ka.x; ka.homeY = ka.y; ka.castleGuard = true; }
        }
        const kp = spawnEnemy("knight_pawn", (wc + 0.5) * TILE, (wr + 3) * TILE, false);
        if (kp) { kp.homeX = kp.x; kp.homeY = kp.y; kp.passive = true; kp.animal = true; kp.enemy = false; }
        const kwr = spawnEnemy("knight_warrior_r", (wc - 3) * TILE, (wr + 2) * TILE, false);
        if (kwr) { kwr.homeX = kwr.x; kwr.homeY = kwr.y; kwr.castleGuard = true; }
        const kwy = spawnEnemy("knight_warrior_y", (wc + 3) * TILE, (wr + 2) * TILE, false);
        if (kwy) { kwy.homeX = kwy.x; kwy.homeY = kwy.y; kwy.castleGuard = true; }
        const kar = spawnEnemy("knight_archer_r", (wc) * TILE, (wr - 1) * TILE, false);
        if (kar) { kar.homeX = kar.x; kar.homeY = kar.y; kar.castleGuard = true; }
        const kpy = spawnEnemy("knight_pawn_y", (wc + 2) * TILE, (wr + 3.5) * TILE, false);
        if (kpy) { kpy.homeX = kpy.x; kpy.homeY = kpy.y; kpy.passive = true; kpy.animal = true; kpy.enemy = false; }
        const kap = spawnEnemy("knight_archer_p", (wc - 4) * TILE, (wr + 1) * TILE, false);
        if (kap) { kap.homeX = kap.x; kap.homeY = kap.y; kap.castleGuard = true; }
        const kay = spawnEnemy("knight_archer_y", (wc + 4) * TILE, (wr + 1) * TILE, false);
        if (kay) { kay.homeX = kay.x; kay.homeY = kay.y; kay.castleGuard = true; }
        const kwp = spawnEnemy("knight_warrior_p", (wc) * TILE, (wr + 4) * TILE, false);
        if (kwp) { kwp.homeX = kwp.x; kwp.homeY = kwp.y; kwp.castleGuard = true; }
        const kpp = spawnEnemy("knight_pawn_p", (wc - 1) * TILE, (wr + 3.5) * TILE, false);
        if (kpp) { kpp.homeX = kpp.x; kpp.homeY = kpp.y; kpp.passive = true; kpp.animal = true; kpp.enemy = false; }
        const kpr = spawnEnemy("knight_pawn_r", (wc + 3) * TILE, (wr + 3.5) * TILE, false);
        if (kpr) { kpr.homeX = kpr.x; kpr.homeY = kpr.y; kpr.passive = true; kpr.animal = true; kpr.enemy = false; }
        if (imgs.pack_u010_Factions_Knights_Buildings_House_House_Construction_png) addBuildingAt("knightHouseBuild", imgs.pack_u010_Factions_Knights_Buildings_House_House_Construction_png, wc - 7, wr + 2, 128, 192);
        if (imgs.pack_u010_Factions_Knights_Buildings_Tower_Tower_Construction_png) addBuildingAt("knightTowerBuild", imgs.pack_u010_Factions_Knights_Buildings_Tower_Tower_Construction_png, wc + 7, wr + 2, 128, 256);

      }
      placeFenceRing(wc, wr, 5, 5);
      for (let i = 0; i < 4; i++) {
        const yg = spawnEnemy("yellow_guard", (wc - 2 + i) * TILE, (wr + 2) * TILE, false);
        if (yg) { yg.homeX = yg.x; yg.homeY = yg.y; }
      }
      for (let i = 0; i < 2; i++) {
        const ya = spawnEnemy("yellow_archer", (wc - 3 + i * 6) * TILE, (wr) * TILE, false);
        if (ya) { ya.homeX = ya.x; ya.homeY = ya.y; ya.castleGuard = true; }
      }
      const yl = spawnEnemy("yellow_lancer", (wc + 1) * TILE, (wr + 3) * TILE, false);
      if (yl) { yl.homeX = yl.x; yl.homeY = yl.y; yl.castleGuard = true; }
      if (imgs.towerY) addBuildingAt("walkTower", imgs.towerY, wc + 4, wr - 1, 128, 256);
    }
    if (landmarks.pigs && !landmarks.pigking) {
      const pc = Math.round(landmarks.pigs.c), pr = Math.round(landmarks.pigs.r);
      paveRect(pc - 3, pr - 3, pc + 3, pr + 3);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const hc = Math.round(pc + Math.cos(a) * 3);
        const hr = Math.round(pr + Math.sin(a) * 3);
        const hut = addBuildingAt("pigHut", imgs.houseY || imgs.houseR || imgs.house, hc, hr, 96, 128);
        spawnPig(hc, hr + 1, hut);
      }
      for (let i = 0; i < 2; i++) {
        const prd = spawnEnemy("pig_rider", (pc + i * 2 - 1) * TILE, (pr + 2) * TILE, false);
        if (prd) { prd.homeX = prd.x; prd.homeY = prd.y; }
      }
    } else if (landmarks.pigs && landmarks.pigking) {
      const pc = Math.round(landmarks.pigs.c), pr = Math.round(landmarks.pigs.r);
      for (let i = 0; i < 3; i++) {
        const prd = spawnEnemy("pig_rider", (pc + (rand() - 0.5) * 4) * TILE, (pr + (rand() - 0.5) * 4) * TILE, false);
        if (prd) { prd.homeX = prd.x; prd.homeY = prd.y; }
      }
      spawnPig(pc, pr);
    }
    {
      // DST-ish: pirate/cannon threat sits down-coast, not on the starter dock pad
      const base = boatDock || fishHut;
      if (base && Math.hypot(base.x / TILE - campC, base.y / TILE - campR) > 18) {
        const bc = Math.round(base.x / TILE), br = Math.round(base.y / TILE);
        const cc = Math.min(COLS - 10, Math.max(8, bc + (boatDock ? -7 : 6)));
        const cr = Math.min(ROWS - 10, Math.max(8, br + 4));
        if (imgs.cannonUp || imgs.cannonDown || imgs.cannonRight) {
          for (let i = 0; i < 3; i++) {
            props.push({
              kind: "cannonProp",
              img: imgs.cannonRight || imgs.cannonUp || imgs.cannonDown,
              x: (cc + i * 2) * TILE + 32, y: cr * TILE + 28,
              fw: 96, fh: 96, frames: 1, hp: 90, max: 90, solid: true, z: 0,
              cd: 1 + i * 0.4, range: true,
            });
          }
        }
        if (imgs.barrelGob) {
          props.push({
            kind: "barrel", img: imgs.barrelGob,
            x: (cc + 1) * TILE + 32, y: (cr + 2) * TILE + 28,
            fw: 64, fh: 64, frames: 1, hp: 30, max: 30, solid: true, z: 0,
          });
        }
        for (let i = 0; i < 2; i++) {
          const bg = spawnEnemy("bomber_goblin", (cc + i) * TILE, (cr + 1) * TILE, false);
          if (bg) { bg.homeX = bg.x; bg.homeY = bg.y; bg.hutGuard = true; }
        }
        for (let i = 0; i < 2; i++) {
          let sx = cc + i * 3, sy = cr + 5;
          for (let t = 0; t < 12; t++) {
            if (inb(sx, sy) && world.tiles[idx(sx, sy)] === T_WATER) break;
            sy++;
          }
          if (!inb(sx, sy) || world.tiles[idx(sx, sy)] !== T_WATER) continue;
          const sh = spawnEnemy(rand() < 0.5 ? "harpoon_shark" : "paddle_shark", sx * TILE, sy * TILE, false);
          if (sh) { sh.homeX = sh.x; sh.homeY = sh.y; sh.aquatic = true; }
        }
      }
    }
    // Orphaned optional landmarks: SpiderVillage / Beehat rocks / Magic meadow
    if (landmarks.spiders) {
      const sc = Math.round(landmarks.spiders.c), sr = Math.round(landmarks.spiders.r);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const c = Math.round(sc + Math.cos(a) * (2 + (i % 3)));
        const r = Math.round(sr + Math.sin(a) * (2 + (i % 3)));
        if (!inb(c, r) || world.tiles[idx(c, r)] === T_WATER) continue;
        props.push({
          kind: "spiderden", x: c * TILE + 32, y: r * TILE + 32,
          fw: 64, fh: 64, frames: 1, hp: 70, max: 70, solid: true, z: 0, nest: 5, denTier: 3,
        });
        const sp = spawnEnemy("spider", (c + 0.3) * TILE, (r + 0.3) * TILE, false);
        if (sp) { sp.homeX = c * TILE; sp.homeY = r * TILE; sp.denSpider = true; sp.passive = true; }
      }
      for (let i = 0; i < 3; i++) {
        props.push(makeGoldProp(
          (sc + (i - 1) * 2) * TILE + 32,
          (sr + 3) * TILE + 32
        ));
      }
    }
    if (landmarks.beehat) {
      const bc = Math.round(landmarks.beehat.c), br = Math.round(landmarks.beehat.r);
      paveRect(bc - 3, br - 3, bc + 3, br + 3);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const c = Math.round(bc + Math.cos(a) * 3), r = Math.round(br + Math.sin(a) * 3);
        if (!inb(c, r)) continue;
        props.push(makeRockProp(c * TILE + 32, r * TILE + 32, imgs.rock2 || imgs.rock));
      }
      for (let i = 0; i < 5; i++) {
        const bee = spawnEnemy("bee", (bc + (rand() - 0.5) * 5) * TILE, (br + (rand() - 0.5) * 5) * TILE, false);
        if (bee) { bee.homeX = bc * TILE; bee.homeY = br * TILE; bee.passive = true; }
      }
      // silk-ish pickups for beehat craft loop
      for (let i = 0; i < 2; i++) spawnPickup((bc + i - 0.5) * TILE, (br + 2) * TILE, "silk");
    }
    if (landmarks.meadow) {
      const mc = Math.round(landmarks.meadow.c), mr = Math.round(landmarks.meadow.r);
      for (let i = 0; i < 10; i++) {
        const c = Math.round(mc + (rand() - 0.5) * 10), r = Math.round(mr + (rand() - 0.5) * 10);
        if (!inb(c, r) || world.tiles[idx(c, r)] === T_WATER) continue;
        props.push({
          kind: "berry", img: imgs.bush2 || imgs.bush,
          x: c * TILE + 32, y: r * TILE + 36,
          fw: 128, fh: 128, frames: 8, hp: 99, ripe: true, grow: 0, flowerPatch: true,
        });
      }
      for (let i = 0; i < 3; i++) {
        const bee = spawnEnemy("bee", (mc + (rand() - 0.5) * 6) * TILE, (mr + (rand() - 0.5) * 6) * TILE, false);
        if (bee) { bee.homeX = mc * TILE; bee.homeY = mr * TILE; bee.passive = true; }
      }
      for (let i = 0; i < 2; i++) {
        const sn = spawnEnemy("snake", (mc + (i - 0.5) * 4) * TILE, (mr + 3) * TILE, false);
        if (sn) { sn.homeX = sn.x; sn.homeY = sn.y; sn.passive = true; sn.aggro = 220; }
      }
    }
    if (landmarks.bluff) {
      const bc = Math.round(landmarks.bluff.c), br = Math.round(landmarks.bluff.r);
      for (let i = 0; i < 3; i++) {
        const bk = spawnEnemy("black_knight", (bc - 1 + i) * TILE, (br + 4) * TILE, true);
        if (bk) { bk.homeX = bk.x; bk.homeY = bk.y; bk.nightOnly = false; }
      }
    }


    // Default den tiers for any dens missing them
    for (const p of props) {
      if (p.kind !== "spiderden") continue;
      if (p.denTier == null) {
        p.denTier = (p.nest || 0) >= 4 ? 2 : 1;
        if ((p.nest || 0) >= 5) p.denTier = 3;
      }
    }
    revealFog(player.x, player.y, 16);
    buildMinimap();
    toast("饥荒式大陆已生成：任务分区相连，外圈是海。跟紧营火向外探索。", 5);
  }

  function revealFog(x, y, radiusTiles) {
    if (!fog) return;
    const cc = Math.floor(x / TILE), rr = Math.floor(y / TILE);
    const R = radiusTiles;
    for (let y0 = -R; y0 <= R; y0++) {
      for (let x0 = -R; x0 <= R; x0++) {
        if (x0 * x0 + y0 * y0 > R * R) continue;
        const c = cc + x0, r = rr + y0;
        if (inb(c, r)) fog[idx(c, r)] = 1;
      }
    }
  }

  function buildMinimap() {
    if (!miniCanvas || miniCanvas.width !== COLS || miniCanvas.height !== ROWS) {
      miniCanvas = document.createElement("canvas");
      miniCanvas.width = COLS;
      miniCanvas.height = ROWS;
      miniCtx = miniCanvas.getContext("2d");
    }
    const img = miniCtx.createImageData(COLS, ROWS);
    const d = img.data;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = (r * COLS + c) * 4;
        const id = idx(c, r);
        if (fog && !fog[id]) {
          d[i] = 18; d[i + 1] = 22; d[i + 2] = 26; d[i + 3] = 255;
          continue;
        }
        const t = world.tiles[id];
        let col;
        if (world.burn[id] > 0) col = [224, 112, 48];
        else if (t === T_WATER) col = [55, 130, 132];
        else if (t === T_MAGIC) col = [98, 62, 140];
        else if (t === T_ASH) col = [70, 55, 42];
        else if (t === T_ICE) col = [170, 220, 230];
        else if (biomes && biomes[id] === 2) col = [62, 110, 68]; // forest
        else if (biomes && biomes[id] === 3) col = [78, 58, 110]; // marsh
        else if (biomes && biomes[id] === 5) col = [120, 118, 72]; // rocky
        else if (biomes && biomes[id] === 4) col = [120, 78, 62]; // badlands
        else if (biomes && biomes[id] === 7) col = [150, 140, 70]; // savanna
        else if (biomes && biomes[id] === 6) col = [180, 170, 110]; // shore
        else col = [92, 140, 78];
        d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
      }
    }
    miniCtx.putImageData(img, 0, 0);
  }

  function smoothLand() {
    const next = new Uint8Array(world.tiles);
    for (let r = 1; r < ROWS - 1; r++) {
      for (let c = 1; c < COLS - 1; c++) {
        let n = 0;
        for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) {
          if (world.tiles[idx(c + x, r + y)] !== T_WATER) n++;
        }
        next[idx(c, r)] = n >= 5 ? (world.tiles[idx(c, r)] === T_WATER ? T_GRASS : world.tiles[idx(c, r)]) : T_WATER;
      }
    }
    world.tiles = next;
  }

  function clearAround(c, r, rad, t) {
    for (let y = r - rad; y <= r + rad; y++) {
      for (let x = c - rad; x <= c + rad; x++) {
        if (inb(x, y) && world.tiles[idx(x, y)] !== T_WATER) setTile(x, y, t);
      }
    }
  }

  // Match character collision radius (player.r ≈ 14)
  const CHAR_R = 14;

  function tileXY(c, r) {
    return { x: (c + 0.5) * TILE, y: (r + 0.5) * TILE };
  }

  function clearPropsNear(x, y, rad) {
    for (let i = props.length - 1; i >= 0; i--) {
      const p = props[i];
      if (p.kind === "wormhole" || p.kind === "corpse") continue;
      if (dist(p.x, p.y, x, y) < rad) props.splice(i, 1);
    }
  }

  /** Stamp packed-earth paths (still used by docks / setpieces). */
  function paveRect(c0, r0, c1, r1) {
    const loC = Math.min(c0, c1), hiC = Math.max(c0, c1);
    const loR = Math.min(r0, r1), hiR = Math.max(r0, r1);
    for (let r = loR; r <= hiR; r++) {
      for (let c = loC; c <= hiC; c++) {
        if (!inb(c, r)) continue;
        if (world.tiles[idx(c, r)] === T_WATER) continue;
        world.tiles[idx(c, r)] = T_ASH;
      }
    }
  }
  function paveCross(c, r, arm) {
    // Compact grass plaza (ash cross looked like broken water/stone tiles)
    const rad = Math.max(2, Math.min(arm, 4));
    for (let rr = r - rad; rr <= r + rad; rr++) {
      for (let cc = c - rad; cc <= c + rad; cc++) {
        if (!inb(cc, rr)) continue;
        if (world.tiles[idx(cc, rr)] === T_WATER || world.tiles[idx(cc, rr)] === T_ICE) continue;
        world.tiles[idx(cc, rr)] = T_GRASS;
      }
    }
  }
  function pavePath(c0, r0, c1, r1) {
    paveRect(Math.min(c0, c1), r0, Math.max(c0, c1), r0);
    paveRect(c1, Math.min(r0, r1), c1, Math.max(r0, r1));
  }
  /** Flatten camp to one meadow grass sheet so biome/path colors don't hard-cut. */
  function unifyCampYard(c0, r0, rad, biomeId) {
    for (let r = r0 - rad; r <= r0 + rad; r++) {
      for (let c = c0 - rad; c <= c0 + rad; c++) {
        if (!inb(c, r)) continue;
        const t = world.tiles[idx(c, r)];
        if (t === T_WATER || t === T_ICE) continue;
        world.tiles[idx(c, r)] = T_GRASS;
        if (biomes) biomes[idx(c, r)] = biomeId;
      }
    }
  }

  function addBuilding(kind, img, x, y, hw, hh, w, h) {
    // Footprint matches building base (art width/height), not a single CHAR_R point.
    const bw = w || 128, bh = h || 192;
    const soft = kind === "boat" || kind === "seahorse" || kind === "boatkit" || kind === "lightning_rod"
      || kind === "firepit" || kind === "dock"
      || kind === "minoGuard" || kind === "pandaGuard" || kind === "turtleGuard" || kind === "skullGuard";
    // DST-style: collide at wall feet — cover sprite bottom (+24 draw) but not roof
    let footW = soft ? CHAR_R : Math.max(40, Math.min(96, bw * 0.4));
    let footNorth = soft ? CHAR_R : Math.max(28, Math.min(48, 34 + bw * 0.02));
    let footSouth = soft ? CHAR_R : Math.max(28, Math.min(42, bh * 0.12 + 10));
    if (!soft && /house|barracks/i.test(kind)) {
      footW = Math.max(footW, Math.min(86, bw * 0.4));
      footSouth = Math.max(footSouth, 30);
    }
    if (!soft && /monastery/i.test(kind)) {
      footW = Math.max(footW, Math.min(92, bw * 0.42));
      footSouth = Math.max(footSouth, 30);
    }
    if (!soft && /castle/i.test(kind)) {
      footW = Math.max(footW, Math.min(118, bw * 0.38));
      footSouth = Math.max(footSouth, 34);
      footNorth = Math.max(footNorth, 36);
    }
    if (!soft && /archery/i.test(kind)) {
      footW = Math.max(footW, 72);
      footSouth = Math.max(footSouth, 38);
      footNorth = Math.min(footNorth, 44);
    }
    if (!soft && /tower/i.test(kind)) {
      footW = Math.max(36, Math.min(50, bw * 0.3));
      footNorth = Math.min(footNorth, 44);
      footSouth = Math.max(footSouth, 28);
    }
    buildings.push({
      kind, img, x, y,
      hw: footW, hh: footNorth, r: footW,
      footW, footH: footNorth, footNorth, footSouth,
      w: bw, h: bh,
      solid: !soft,
    });
    if (!soft) clearPropsNear(x, y, Math.max(90, footW + 40));
    return buildings[buildings.length - 1];
  }

  function hitsBuildingFoot(b, x, y, padX, padN, padS) {
    if (!b || b.solid === false) return false;
    padX = padX || 0; padN = padN || 0; padS = padS || 0;
    const fw = (b.footW || 44) + padX;
    const north = (b.footNorth != null ? b.footNorth : (b.footH || 70)) + padN;
    const south = (b.footSouth != null ? b.footSouth : 18) + padS;
    const dx = Math.abs(x - b.x);
    const dy = y - b.y;
    return dx < fw && dy > -north && dy < south;
  }

  function buildingBlocksXY(x, y, pad) {
    pad = pad || 0;
    for (const b of buildings) {
      if (hitsBuildingFoot(b, x, y, pad, pad * 0.8, pad * 0.35)) return b;
    }
    return null;
  }

  /** Full drawn building volume — fence scrub uses wall band, not full roof (avoids eating yard rails). */
  function hitsBuildingVisual(b, x, y, pad) {
    if (!b || b.solid === false) return false;
    pad = pad == null ? 6 : pad;
    const hw = Math.max((b.footW || 44) + 16, (b.w || 128) * 0.4) + pad;
    // Only scrub rails that punch through the wall band (~lower half), not distant roof
    const north = Math.max((b.footNorth != null ? b.footNorth : 40) + 36, (b.h || 160) * 0.35) + pad;
    const south = Math.max((b.footSouth != null ? b.footSouth : 24) + 16, 28) + pad;
    const dx = Math.abs(x - b.x);
    const dy = y - b.y;
    return dx < hw && dy > -north && dy < south;
  }

  function scrubFencesThroughBuildings() {
    let removed = false;
    for (let i = props.length - 1; i >= 0; i--) {
      const p = props[i];
      if (!p) continue;
      if (p.kind !== "fence" && p.kind !== "woodwall" && p.kind !== "haywall" && p.kind !== "stonewall") continue;
      let hit = false;
      for (const b of buildings) {
        if (hitsBuildingVisual(b, p.x, p.y, 10)) { hit = true; break; }
      }
      if (hit) { props.splice(i, 1); removed = true; }
    }
    if (removed) refreshFenceLinks();
  }

  /** Fence/wall blocks rails between posts (not just post centers). */
  function hitsFenceProp(p, x, y, er) {
    if (!p || p.gone || (p.hp != null && p.hp <= 0)) return false;
    er = er || 0;
    const mask = p.fenceMask != null ? p.fenceMask : fenceMaskAt(p.x, p.y);
    const n = !!(mask & 1), e = !!(mask & 2), s = !!(mask & 4), w = !!(mask & 8);
    const thick = 12 + er * 0.4;
    const half = TILE * 0.55; // reach mid-gap to next post (TILE spacing)
    const isVert = p.orient === "v" || ((n || s) && p.orient !== "h");
    const isHoriz = p.orient === "h" || e || w || (!isVert && !(n || s));
    // post core
    if (Math.abs(x - p.x) < 14 + er * 0.35 && Math.abs(y - p.y) < 14 + er * 0.35) return true;
    // E-W rail bar (covers space between big posts)
    if (isHoriz) {
      if (Math.abs(y - p.y) < thick && Math.abs(x - p.x) < half + er * 0.25) return true;
    }
    // N-S rail bar
    if (isVert || n || s) {
      if (Math.abs(x - p.x) < thick && Math.abs(y - p.y) < half + er * 0.25) return true;
    }
    // built walls: fuller tile block
    if (p.kind === "stonewall" || p.kind === "woodwall" || p.kind === "haywall") {
      if (Math.abs(x - p.x) < TILE * 0.42 + er && Math.abs(y - p.y) < TILE * 0.42 + er) return true;
    }
    return false;
  }

  /** DST-inspired fence links: bitmask N=1 E=2 S=4 W=8 → spritesheet tile. */
  function fenceMaskAt(x, y) {
    const linkR = TILE * 0.85;
    let m = 0;
    for (const p of props) {
      if (!p || p.gone) continue;
      if (p.kind !== "fence" && p.kind !== "woodwall" && p.kind !== "haywall" && p.kind !== "stonewall") continue;
      const dx = p.x - x, dy = p.y - y;
      if (Math.abs(dx) < 4 && dy < -linkR * 0.55 && dy > -linkR * 1.35) m |= 1; // N
      else if (dx > linkR * 0.55 && dx < linkR * 1.35 && Math.abs(dy) < 4) m |= 2; // E
      else if (Math.abs(dx) < 4 && dy > linkR * 0.55 && dy < linkR * 1.35) m |= 4; // S
      else if (dx < -linkR * 0.55 && dx > -linkR * 1.35 && Math.abs(dy) < 4) m |= 8; // W
    }
    return m;
  }

  /** Infer west/east wall so we pick sheet col 0 vs 3 (left/right vertical tiles). */
  function inferFenceSide(p) {
    if (p.side === "e" || p.side === "w") return p.side;
    let east = 0, west = 0;
    for (const o of props) {
      if (!o || o === p) continue;
      if (o.kind !== "fence" && o.kind !== "woodwall" && o.kind !== "haywall" && o.kind !== "stonewall") continue;
      if (Math.abs(o.y - p.y) > TILE * 10) continue;
      if (o.x > p.x + 10) east++;
      if (o.x < p.x - 10) west++;
    }
    // more fence to the east ⇒ this post is on the west wall → use left tile
    return east >= west ? "w" : "e";
  }

  /**
   * Wooden Fence_64x64 tile.png is a 4×3 autotile sample enclosure:
   *  row0 top, row1 sides (c0 left / c3 right), row2 bottom.
   */
  function fenceTileForMask(mask, p) {
    const n = !!(mask & 1), e = !!(mask & 2), s = !!(mask & 4), w = !!(mask & 8);
    const side = p ? inferFenceSide(p) : "w";
    const vertCol = side === "e" ? 3 : 0;
    // force vertical sheet tiles when tagged as side fence
    if (p && p.orient === "v") return { c: vertCol, r: 1 };
    // corners (match sheet sample)
    if (e && s && !w && !n) return { c: 0, r: 0 }; // NW
    if (w && s && !e && !n) return { c: 3, r: 0 }; // NE
    if (e && n && !w && !s) return { c: 0, r: 2 }; // SW
    if (w && n && !e && !s) return { c: 3, r: 2 }; // SE
    // pure runs
    if ((e || w) && !n && !s) {
      if (e && w) return { c: 1, r: 0 };
      if (e) return { c: 0, r: 0 };
      if (w) return { c: 3, r: 0 };
    }
    if ((n || s) && !e && !w) return { c: vertCol, r: 1 };
    // T / mixed — prefer horizontal mid if E-W present
    if (e && w) return { c: 1, r: 0 };
    if (n || s) return { c: vertCol, r: 1 };
    return { c: vertCol, r: 1 };
  }

  function refreshFenceLinks() {
    for (const p of props) {
      if (!p || (p.kind !== "fence" && p.kind !== "woodwall" && p.kind !== "haywall" && p.kind !== "stonewall")) continue;
      const m = fenceMaskAt(p.x, p.y);
      p.fenceMask = m;
      const vert = !!(m & 1) || !!(m & 4);
      const horiz = !!(m & 2) || !!(m & 8);
      if (vert && !horiz) p.orient = "v";
      else if (horiz && !vert) p.orient = "h";
      else if (p.orient !== "v" && p.orient !== "h") p.orient = horiz ? "h" : "v";
      if (p.orient === "v") p.side = inferFenceSide(p);
      p.fenceTile = fenceTileForMask(m, p);
    }
  }

  function tryAddFenceTile(c, r, orient, side) {
    if (!inb(c, r)) return null;
    const tt = world.tiles[idx(c, r)];
    if (tt === T_WATER || tt === T_ICE) return null;
    const x = (c + 0.5) * TILE, y = (r + 0.5) * TILE;
    if (buildingBlocksXY(x, y, 12)) return null;
    if (props.some((p) => (p.kind === "fence" || p.kind === "woodwall") && Math.abs(p.x - x) < 8 && Math.abs(p.y - y) < 8)) return null;
    const p = {
      kind: "fence", img: imgs.woodFence, x, y,
      fw: 64, fh: 64, frames: 1, hp: 40, max: 40, solid: true, z: 0, wallMat: "fence",
      orient: orient || "h",
      side: side || null, // "w" | "e" for vertical sheet col
    };
    props.push(p);
    return p;
  }

  /** DST DEPLOYMODE.WALL spacing 1 — ring with south gate. Uses sheet autotile. */
  function placeFenceRing(c0, r0, halfW, halfH) {
    if (!imgs.woodFence) return;
    for (let i = -halfW; i <= halfW; i++) {
      tryAddFenceTile(c0 + i, r0 - halfH, "h");
      if (Math.abs(i) > 1) tryAddFenceTile(c0 + i, r0 + halfH, "h");
    }
    for (let j = -halfH + 1; j <= halfH - 1; j++) {
      tryAddFenceTile(c0 - halfW, r0 + j, "v", "w");
      tryAddFenceTile(c0 + halfW, r0 + j, "v", "e");
    }
    scrubFencesThroughBuildings();
    refreshFenceLinks();
  }

  /** Remove bushes/decos stuck in fence rails (clipping). */
  function scrubPropsOnFences(rad) {
    rad = rad || 40;
    for (let i = props.length - 1; i >= 0; i--) {
      const p = props[i];
      if (!p) continue;
      if (p.kind !== "bush" && p.kind !== "berry" && p.kind !== "deco" && p.kind !== "rock"
          && p.kind !== "tree" && p.kind !== "deadTree" && p.kind !== "stump") continue;
      let hit = false;
      for (const f of props) {
        if (!f || (f.kind !== "fence" && f.kind !== "woodwall" && f.kind !== "haywall" && f.kind !== "stonewall")) continue;
        if (dist(p.x, p.y, f.x, f.y) < rad) { hit = true; break; }
      }
      if (hit) props.splice(i, 1);
    }
  }

  /** Trees near the start fence visually clip through posts — clear the ring. */
  function clearCampTreesOnFence(c0, r0, halfW, halfH) {
    const pad = 1.35;
    const minC = c0 - halfW - pad, maxC = c0 + halfW + pad;
    const minR = r0 - halfH - pad, maxR = r0 + halfH + pad;
    for (let i = props.length - 1; i >= 0; i--) {
      const p = props[i];
      if (!p || (p.kind !== "tree" && p.kind !== "deadTree" && p.kind !== "stump")) continue;
      const tc = p.x / TILE, tr = p.y / TILE;
      if (tc < minC || tc > maxC || tr < minR || tr > maxR) continue;
      const inside = tc >= c0 - halfW + 0.35 && tc <= c0 + halfW - 0.35
        && tr >= r0 - halfH + 0.35 && tr <= r0 + halfH - 0.35;
      let nearFence = false;
      for (const f of props) {
        if (!f || f.kind !== "fence") continue;
        if (dist(p.x, p.y, f.x, f.y) < 96) { nearFence = true; break; }
      }
      if (nearFence || inside) props.splice(i, 1);
    }
  }

  /** Place building on integer tile grid (neater compounds). */
  function addBuildingAt(kind, img, c, r, w, h) {
    const p = tileXY(c, r);
    return addBuilding(kind, img, p.x, p.y, CHAR_R, CHAR_R, w, h);
  }

  function nearBuilding(x, y, d) {
    return buildings.some((b) => {
      if (b.solid === false) return dist(x, y, b.x, b.y) < d;
      return hitsBuildingFoot(b, x, y, 10, 10, 10);
    });
  }

  /** Draw-matched body hitbox (torso), not the foot shadow. */
  function actorHit(e) {
    if (!e) return { x: 0, y: 0, r: CHAR_R };
    const fw = e.fw || 192, fh = e.fh || 192;
    let scale = 1;
    if (e.kind === "warlord") scale = 1.12;
    else if (e.kind === "troll") scale = 0.62;
    else if (e.kind === "bat_queen") scale = 1.45;
    else if (e.kind === "bear") scale = 0.92;
    else if (e.kind === "turtle" || e.kind === "minotaur") scale = 0.62;
    else if (e.kind === "panda" || e.kind === "pig_rider") scale = 0.72;
    else if (e.pack && fw >= 256) scale = 0.78;
    else if (e.pack) scale = 0.95;
    else if (e.kind === "player") scale = 1;
    // Must match drawActor foot offset so the circle sits on the visible body
    const oy = e.kind === "sheep" ? fh - 18 : Math.min(168, fh * scale * 0.82);
    const bodyY = e.y - oy * 0.52;
    const r = Math.max(e.r || 18, Math.min(46, fw * scale * 0.17));
    return { x: e.x, y: bodyY, r, foot: oy, feetY: e.y };
  }

  /** Prop pick/reach. Trees & ores use base (trunk/feet) — canopy mid made F miss while standing at the trunk. */
  function propHit(p) {
    if (!p) return { x: 0, y: 0, r: 24 };
    const fw = p.fw || 64, fh = p.fh || 64;
    if (p.kind === "tree" || p.kind === "stump" || p.kind === "deadTree") {
      return { x: p.x, y: p.y - 18, r: 30 };
    }
    if (p.kind === "gold") return { x: p.x, y: p.y - 20, r: 34 };
    if (p.kind === "rock") return { x: p.x, y: p.y - 12, r: 24 };
    let oy = fh - 16;
    if (p.kind === "fence" || p.kind === "haywall" || p.kind === "woodwall" || p.kind === "stonewall") oy = 48;
    else if (p.kind === "berry" || p.kind === "bush") oy = (fh || 128) - 16;
    else if (p.kind === "beehive") oy = 120;
    else if (p.kind === "chest") oy = 28;
    else if (p.kind === "meatrack") oy = 52;
    const bodyY = p.y - oy * 0.45;
    const r = Math.max(18, Math.min(58, Math.max(fw, fh) * 0.22));
    return { x: p.x, y: bodyY, r };
  }

  function dropHit(d) {
    return { x: d.x, y: d.y - 10, r: 22 };
  }

  /** Off-screen spawn point (DST-like: approach from beyond camera, no pop-in). */
  function pickOffscreenSpawn(minDist, maxDist, needDark) {
    minDist = minDist == null ? 360 : minDist;
    maxDist = maxDist == null ? 520 : maxDist;
    const pad = 64;
    const L = camera.x - pad, R = camera.x + W + pad, T = camera.y - pad, B = camera.y + H + pad;
    for (let i = 0; i < 28; i++) {
      const a = rand() * Math.PI * 2;
      let distAway = minDist + rand() * (maxDist - minDist);
      let x = player.x + Math.cos(a) * distAway;
      let y = player.y + Math.sin(a) * distAway;
      // push outside view if still inside
      if (x > L && x < R && y > T && y < B) {
        const cx = camera.x + W / 2, cy = camera.y + H / 2;
        const dx = x - cx, dy = y - cy;
        const Len = Math.hypot(dx, dy) || 1;
        const need = Math.max(W, H) * 0.55 + 80;
        x = cx + (dx / Len) * need;
        y = cy + (dy / Len) * need;
      }
      if (!walkable(x, y)) continue;
      if (needDark && lightAt(x, y) > 0.5) continue;
      return { x, y };
    }
    return null;
  }

  function spawnPlayer(x, y) {
    return {
      kind: "player", x, y, vx: 0, vy: 0, r: 14,
      hp: 150, maxHp: 150, mp: 100, maxMp: 100,
      hunger: 150, maxHunger: 150, corr: 0, stamina: 100,
      facing: 1, anim: "idle", frame: 0, acc: 0,
      attacking: 0, atkKind: 1, hurt: 0, dead: false,
      tech: { stonewall: false, lantern: false, science1: false, science2: false, magic2: false },
      invul: 0, speed: 155, torchOn: false, armor: 0,
      tool: "axe", hold: null, atkFrames: 6,
      form: "pawn", warRank: 0, guarding: 0,
      temp: 55,
      buffSpeed: 0, buffPower: 0, buffWarm: 0, buffCool: 0,
    };
  }

  function spawnNpc(kind, x, y) {
    const e = { kind, x, y, r: 14, hp: 999, facing: 1, anim: "idle", frame: 0, acc: 0, npc: true };
    entities.push(e);
    return e;
  }

  function spawnEnemy(kind, x, y, phantom) {
    const pack = window.EnemyPack && window.EnemyPack.ENEMIES && window.EnemyPack.ENEMIES[kind];
    let e = null;
    if (pack) {
      e = {
        kind, x, y, homeX: x, homeY: y, r: pack.r,
        hp: pack.hp, maxHp: pack.hp, speed: pack.speed,
        aggro: Math.floor(pack.aggro * 1.25), dmg: pack.dmg,
        facing: -1, anim: "idle", frame: 0, acc: 0,
        attacking: 0, hurt: 0, dead: false, cd: rand() * 2,
        phantom: !!phantom, enemy: true, pack: true,
        name: pack.name,
        fw: pack.fw, fh: pack.fh,
        idleFrames: pack.idleFrames, runFrames: pack.runFrames, atkFrames: pack.atkFrames,
        nightOnly: !!pack.nightOnly,
        ranged: pack.ranged || null,
      };
      if (kind === "harpoon_shark" || kind === "paddle_shark" || kind === "bomb_fish") e.aquatic = true;
    } else {
      const stats = {
        warrior: { hp: 55, speed: 78, aggro: 480, dmg: 11, r: 14 },
        archer: { hp: 36, speed: 70, aggro: 560, dmg: 8, r: 13 },
        warlord: { hp: 260, speed: 88, aggro: 620, dmg: 18, r: 18 },
        lancer: { hp: 70, speed: 82, aggro: 500, dmg: 15, r: 16 },
        black_knight: { hp: 75, speed: 80, aggro: 520, dmg: 16, r: 15 },
        yellow_guard: { hp: 60, speed: 85, aggro: 480, dmg: 13, r: 14 },
        blue_archer: { hp: 40, speed: 72, aggro: 520, dmg: 9, r: 13 },
        blue_lancer: { hp: 65, speed: 80, aggro: 480, dmg: 14, r: 15 },
        yellow_archer: { hp: 38, speed: 74, aggro: 540, dmg: 9, r: 13 },
        purple_archer: { hp: 38, speed: 74, aggro: 540, dmg: 9, r: 13 },
        black_archer: { hp: 42, speed: 70, aggro: 560, dmg: 10, r: 13 },
        yellow_lancer: { hp: 62, speed: 82, aggro: 480, dmg: 14, r: 15 },
        purple_lancer: { hp: 62, speed: 80, aggro: 480, dmg: 14, r: 15 },
        black_lancer: { hp: 68, speed: 78, aggro: 500, dmg: 15, r: 15 },
      }[kind];
      if (!stats) {
        console.warn("unknown enemy", kind);
        return null;
      }
      const names = {
        warlord: "红堡僭主", archer: "赤旗弓手", lancer: "赤旗枪骑",
        black_knight: "暗影骑士", yellow_guard: "金鬃卫士",
        blue_archer: "蓝旗弓手", blue_lancer: "蓝旗枪骑",
        yellow_archer: "金旗弓手", purple_archer: "紫旗弓手", black_archer: "黑旗弓手",
        yellow_lancer: "金旗枪骑", purple_lancer: "紫旗枪骑", black_lancer: "黑旗枪骑",
      };
      e = {
        kind, x, y, homeX: x, homeY: y, r: stats.r,
        hp: stats.hp, maxHp: stats.hp, speed: stats.speed,
        aggro: stats.aggro, dmg: stats.dmg,
        facing: -1, anim: "idle", frame: 0, acc: 0,
        attacking: 0, hurt: 0, dead: false, cd: rand() * 2,
        phantom: !!phantom, enemy: true,
        name: names[kind] || (phantom ? "魔蚀虚影" : "赤旗武士"),
      };
    }
    // Unstick from solids / other units so packs don't spawn stacked & frozen
    const er = e.r || 14;
    for (let tries = 0; tries < 10; tries++) {
      let blocked = collides(e);
      if (!blocked) {
        for (const o of entities) {
          if (o === e || o.dead) continue;
          if (dist(o.x, o.y, e.x, e.y) < er + (o.r || 14) + 6) { blocked = true; break; }
        }
      }
      if (!blocked) break;
      const a = rand() * Math.PI * 2;
      e.x += Math.cos(a) * (18 + tries * 6);
      e.y += Math.sin(a) * (18 + tries * 6);
      e.x = clamp(e.x, TILE, COLS * TILE - TILE);
      e.y = clamp(e.y, TILE, ROWS * TILE - TILE);
    }
    e.homeX = e.x; e.homeY = e.y;
    entities.push(e);
    return e;
  }

  function spawnFence(x, y, stout) {
    let kind = "fence", wallMat = "fence", hp = 40;
    let img = imgs.woodFence || imgs.rock;
    if (stout === true || stout === "stone") {
      kind = "stonewall"; wallMat = "stone"; hp = 90; img = imgs.rock2 || imgs.rock;
    } else if (stout === "hay") {
      kind = "haywall"; wallMat = "hay"; hp = 25; img = imgs.bush || imgs.woodFence || imgs.rock;
    } else if (stout === "wood") {
      kind = "woodwall"; wallMat = "wood"; hp = 55; img = imgs.woodFence || imgs.rock;
    }
    props.push({
      kind, img, x, y,
      fw: 64, fh: 64, frames: 1,
      hp, max: hp, solid: true, z: 0, stout: wallMat === "stone", wallMat,
      orient: "h",
    });
    refreshFenceLinks();
    const last = props[props.length - 1];
    if (last) {
      const m = last.fenceMask || 0;
      const vert = (m & 1) || (m & 4);
      const horiz = (m & 2) || (m & 8);
      if (vert && !horiz) last.orient = "v";
      else last.orient = "h";
    }
  }

  function spawnTrap(x, y) {
    props.push({
      kind: "trap", img: imgs.rock2 || imgs.rock, x, y,
      fw: 64, fh: 64, frames: 1, hp: 25, max: 25, solid: false, z: 0,
      bait: 0, sprung: false, cd: 0,
    });
  }

  function spawnFarm(x, y) {
    // legacy: redirect to berry bush (Don't Starve–style crop)
    spawnBerryBush(x, y);
  }

  function spawnBerryBush(x, y) {
    const bimgs = [imgs.bush, imgs.bush2, imgs.bush3, imgs.bush4].filter(Boolean);
    props.push({
      kind: "berry",
      img: bimgs[0] || imgs.bush,
      x, y,
      fw: 128, fh: 128, frames: 8, z: 0,
      hp: 99, max: 99, solid: false,
      ripe: false, grow: 0, planted: true,
    });
  }

  function spawnChest(x, y, store) {
    props.push({
      kind: "chest", img: imgs.woodIcon || imgs.house3, x, y,
      fw: 64, fh: 64, frames: 1, hp: 90, max: 90, solid: true, z: 0,
      store: store || { wood: 0, gold: 0, meat: 0, fish: 0, torch: 0, cooked: 0, berries: 0, seeds: 0, jam: 0 },
    });
  }

  function spawnWatchtower(x, y) {
    addBuilding("watchtower", imgs.towerB, x, y, 48, 32, 128, 256);
    const b = buildings[buildings.length - 1];
    b.owned = true;
    b.cd = 0;
    b.range = 280;
  }

  function spawnPlayerFire(x, y, opts) {
    const f = {
      x, y, lit: true,
      fuel: (opts && opts.pit) ? 110 : 45,
      pit: !!(opts && opts.pit),
      permanent: !!(opts && opts.pit),
    };
    fires.push(f);
    if (f.pit) {
      addBuilding("firepit", imgs.rock2 || imgs.rock, x, y, 22, 18, 64, 64);
      const b = buildings[buildings.length - 1];
      b.owned = true; b.firepit = true; b.solid = false;
      f.building = b;
    }
    syncPrimaryFire();
    return f;
  }

  function syncPrimaryFire() {
    if (!fires.length) { campfire = null; return; }
    // keep campfire pointing at nearest lit fire to player, else first
    let best = fires[0], bestD = 1e9;
    if (player) {
      for (const f of fires) {
        const d = dist(player.x, player.y, f.x, f.y);
        if (d < bestD) { bestD = d; best = f; }
      }
    }
    campfire = best;
  }

  function nearestFire(maxDist) {
    maxDist = maxDist == null ? 90 : maxDist;
    let best = null, bestD = maxDist;
    for (const f of fires) {
      const d = dist(player.x, player.y, f.x, f.y);
      if (d < bestD) { bestD = d; best = f; }
    }
    return best;
  }

  function canPlaceBuild(x, y, kind) {
    const c = Math.floor(x / TILE), r = Math.floor(y / TILE);
    if (!inb(c, r)) return false;
    const t = world.tiles[idx(c, r)];
    if (t === T_WATER || t === T_ICE) return false;
    if (t !== T_GRASS && t !== T_MAGIC && t !== T_ASH && kind !== "turf") return false;
    if (nearBuilding(x, y, 42) && kind !== "turf" && kind !== "campfire" && kind !== "firepit" && kind !== "lightning_rod") return false;
    for (const p of props) {
      if (!p.solid || (p.hp != null && p.hp <= 0)) continue;
      if (dist(x, y, p.x, p.y) < 40) return false;
    }
    if (kind === "boatkit" || kind === "grassboat" || kind === "seakit" || kind === "dock") {
      let nearW = false;
      for (let dy = -3; dy <= 3 && !nearW; dy++) for (let dx = -3; dx <= 3; dx++) {
        if (inb(c + dx, r + dy) && world.tiles[idx(c + dx, r + dy)] === T_WATER) nearW = true;
      }
      // boat kits may sit on pier ash next to water
      if (!nearW && (kind === "boatkit" || kind === "grassboat" || kind === "dock")) return false;
    }
    return true;
  }

  function placeAhead(kind) {
    const ang = player.facing >= 0 ? 0 : Math.PI;
    let x = player.x + Math.cos(ang) * 56;
    let y = player.y + Math.sin(ang) * 20;
    // Snap buildables to tile centers for neat compounds
    if (kind !== "turf" && kind !== "campfire" && kind !== "firepit") {
      x = (Math.floor(x / TILE) + 0.5) * TILE;
      y = (Math.floor(y / TILE) + 0.5) * TILE;
    }
    if (!canPlaceBuild(x, y, kind)) {
      toast(kind === "boatkit" || kind === "grassboat" || kind === "seakit" || kind === "dock" ? "需要靠岸或合适的空地。" : "这里放不了（水面/障碍/太挤）。");
      return false;
    }
    if (kind === "fence") spawnFence(x, y, false);
    else if (kind === "haywall") spawnFence(x, y, "hay");
    else if (kind === "woodwall") spawnFence(x, y, "wood");
    else if (kind === "stonewall") spawnFence(x, y, "stone");
    else if (kind === "chest") spawnChest(x, y);
    else if (kind === "watchtower") spawnWatchtower(x, y);
    else if (kind === "campfire") spawnPlayerFire(x, y);
    else if (kind === "firepit") spawnPlayerFire(x, y, { pit: true });
    else if (kind === "trap") spawnTrap(x, y);
    else if (kind === "farm" || kind === "berrybush") spawnBerryBush(x, y);
    else if (kind === "cookpot") spawnCookpot(x, y);
    else if (kind === "bench") spawnBench(x, y);
    else if (kind === "icebox") spawnIcebox(x, y);
    else if (kind === "alchemy") spawnAlchemy(x, y);
    else if (kind === "shadow") spawnShadowManip(x, y);
    else if (kind === "meatrack") spawnMeatrack(x, y);
    else if (kind === "seakit") spawnSeaKit(x, y);
    else if (kind === "boatkit") spawnBoatKit(x, y);
    else if (kind === "grassboat") spawnBoatKit(x, y, { grass: true });
    else if (kind === "dock") spawnDock(x, y);
    else if (kind === "tent") spawnTent(x, y);
    else if (kind === "siesta") spawnSiesta(x, y);
    else if (kind === "endofire") spawnEndoFire(x, y);
    else if (kind === "farmplot") spawnFarmPlot(x, y);
    else if (kind === "lightning_rod") spawnLightningRod(x, y);
    else if (kind === "turf") {
      const c = Math.floor(x / TILE), r = Math.floor(y / TILE);
      if (inb(c, r) && world.tiles[idx(c, r)] !== T_WATER) {
        world.tiles[idx(c, r)] = T_ASH;
        if (biomes && window.OpenWorldGen) biomes[idx(c, r)] = window.OpenWorldGen.BIOME.MEADOW;
        clearPropsNear((c + 0.5) * TILE, (r + 0.5) * TILE, 36);
        toast("铺好了石砖路。", 1.2);
      }
    }
    return true;
  }

  function spawnTent(x, y) {
    addBuilding("tent", imgs.house3 || imgs.house, x, y, 36, 28, 96, 128);
    const b = buildings[buildings.length - 1];
    b.owned = true;
    b.tent = true;
  }

  function spawnSiesta(x, y) {
    addBuilding("siesta", imgs.house2 || imgs.house3 || imgs.house, x, y, 36, 28, 96, 128);
    const b = buildings[buildings.length - 1];
    b.owned = true;
    b.siesta = true;
  }

  function spawnEndoFire(x, y) {
    addBuilding("endofire", imgs.rock2 || imgs.rock || imgs.house3, x, y, 28, 22, 64, 64);
    const b = buildings[buildings.length - 1];
    b.owned = true;
    b.endo = true;
    fires.push({ x, y, lit: true, fuel: 45, endo: true });
  }

  function spawnFarmPlot(x, y) {
    props.push({
      kind: "farm", x, y,
      fw: 64, fh: 48, frames: 1, hp: 99, max: 99, solid: false, z: 0,
      planted: false, stage: 0, grow: 0,
    });
  }

  function spawnLightningRod(x, y) {
    addBuilding("lightning_rod", null, x, y, 18, 18, 32, 96);
    const b = buildings[buildings.length - 1];
    b.owned = true;
    b.lightningRod = true;
  }

  function nearLightningRod(rad) {
    rad = rad || 220;
    return buildings.some((b) => b.lightningRod && dist(player.x, player.y, b.x, b.y) < rad);
  }

  function summonAbigail() {
    // remove previous ally
    for (let i = entities.length - 1; i >= 0; i--) {
      if (entities[i].abigail) entities.splice(i, 1);
    }
    const e = spawnEnemy("skull", player.x + 30, player.y - 20, true);
    if (!e) { toast("花瓣枯萎了……"); return; }
    e.abigail = true;
    e.ally = true;
    e.enemy = false;
    e.phantom = true;
    e.name = "阿比盖尔";
    e.hp = e.maxHp = 90;
    e.dmg = 14;
    e.speed = 150;
    e.aggro = 520;
    e.life = 55;
    e.homeX = player.x; e.homeY = player.y;
    toast("阿比盖尔现身……她会跟在你身边一段时间。", 3.5);
  }

  function spawnMeatrack(x, y) {
    props.push({
      kind: "meatrack", x, y,
      fw: 48, fh: 64, frames: 1, hp: 80, max: 80, solid: true, z: 0,
      drying: null, dryT: 0, dryNeed: 55,
    });
  }

  function spawnSeaKit(x, y) {
    addBuilding("seakit", imgs.house3 || imgs.house, x, y, 40, 28, 96, 128);
    const b = buildings[buildings.length - 1];
    b.owned = true;
    b.seakit = true;
    if (player) {
      player.tech = player.tech || {};
      player.tech.seafaring = true;
    }
  }

  function spawnBoatKit(x, y, opts) {
    addBuilding("boatkit", imgs.boatIdle || imgs.house, x, y, 50, 30, 192, 192);
    const b = buildings[buildings.length - 1];
    b.owned = true;
    b.boatkit = true;
    b.grass = !!(opts && opts.grass);
    if (b.grass) b.name = "草筏";
  }

  function pavePierFromDock(x, y) {
    const c0 = Math.floor(x / TILE), r0 = Math.floor(y / TILE);
    if (!inb(c0, r0)) return;
    let bestDx = 0, bestDy = 1, best = -1;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      let score = 0;
      for (let s = 1; s <= 4; s++) {
        const c = c0 + dx * s, r = r0 + dy * s;
        if (!inb(c, r)) break;
        if (world.tiles[idx(c, r)] === T_WATER) score += 3;
        else if (world.tiles[idx(c, r)] === T_ASH) score += 1;
        else break;
      }
      if (score > best) { best = score; bestDx = dx; bestDy = dy; }
    }
    // shore pad
    if (world.tiles[idx(c0, r0)] !== T_WATER) world.tiles[idx(c0, r0)] = T_ASH;
    let paved = 0;
    for (let s = 1; s <= 3; s++) {
      const c = c0 + bestDx * s, r = r0 + bestDy * s;
      if (!inb(c, r)) break;
      const t = world.tiles[idx(c, r)];
      if (t === T_WATER || t === T_ICE || t === T_ASH) {
        world.tiles[idx(c, r)] = T_ASH;
        if (world.wet) world.wet[idx(c, r)] = 0;
        paved++;
      } else break;
    }
    return paved;
  }

  function spawnDock(x, y, opts) {
    addBuilding("dock", imgs.woodFence || imgs.rock2 || imgs.house3, x, y, 36, 24, 96, 64);
    const b = buildings[buildings.length - 1];
    b.owned = true;
    b.dock = true;
    b.solid = false;
    const paved = pavePierFromDock(x, y);
    b.pier = true;
    if (!(opts && opts.silent) && paved > 0) toast("栈桥伸入水面，可在此垂钓启航。", 2.2);
  }

  function nearDock(rad) {
    rad = rad || 90;
    if (boatDock && dist(player.x, player.y, boatDock.x, boatDock.y) < rad) return true;
    if (seaDock && dist(player.x, player.y, seaDock.x, seaDock.y) < rad) return true;
    return buildings.some((b) => b.dock && dist(player.x, player.y, b.x, b.y) < rad);
  }

  function spawnBench(x, y) {
    addBuilding("bench", imgs.house3 || imgs.house, x, y, 40, 28, 96, 128);
    const b = buildings[buildings.length - 1];
    b.owned = true;
    b.bench = true;
  }

  function spawnCookpot(x, y) {
    addBuilding("cookpot", null, x, y, 28, 20, 64, 64);
    const b = buildings[buildings.length - 1];
    b.owned = true;
    b.cook = true;
  }

  function spawnIcebox(x, y) {
    addBuilding("icebox", imgs.house3 || imgs.house, x, y, 36, 28, 96, 128);
    const b = buildings[buildings.length - 1];
    b.owned = true;
    b.icebox = true;
    b.store = { meat: 0, cooked: 0, fish: 0, berries: 0, jam: 0, jerky: 0, feast: 0, meatpie: 0, honey: 0, seeds: 0 };
  }

  function spawnAlchemy(x, y) {
    addBuilding("alchemy", imgs.monastery || imgs.house, x, y, 50, 36, 128, 192);
    const b = buildings[buildings.length - 1];
    b.owned = true;
    b.alchemy = true;
  }

  function spawnShadowManip(x, y) {
    addBuilding("shadow", imgs.towerB || imgs.house, x, y, 40, 32, 96, 160);
    const b = buildings[buildings.length - 1];
    b.owned = true;
    b.shadow = true;
  }

  function spawnSheep(c, r) {
    if (!inb(c, r) || world.tiles[idx(c, r)] === T_WATER) return;
    entities.push({
      kind: "sheep", x: c * TILE + 32, y: r * TILE + 32, r: 12,
      hp: 18, maxHp: 18, speed: 55, facing: 1,
      anim: "idle", frame: 0, acc: 0, wander: 0, enemy: false, animal: true,
      happy: !!imgs.happySheep && rand() < 0.35,
    });
  }

  
  function spawnPig(c, r, hut) {
    if (!inb(c, r) || world.tiles[idx(c, r)] === T_WATER) return null;
    const x = c * TILE + 32, y = r * TILE + 32;
    const hx = hut ? hut.x : x, hy = hut ? hut.y + 20 : y;
    const e = {
      kind: "pig", x, y, homeX: hx, homeY: hy, r: 13,
      hp: 28, maxHp: 28, speed: 70, facing: 1,
      anim: "idle", frame: 0, acc: 0, wander: 0, enemy: false, animal: true,
      name: "猪人", hut: hut || null,
    };
    entities.push(e);
    return e;
  }

function spawnPickup(x, y, kind) {
    drops.push({ x, y, kind, t: 0 });
  }

  function toast(msg, life) {
    toasts.push({ msg, life: life || 3.2, max: life || 3.2 });
  }

  function floatText(x, y, text, color) {
    floats.push({ x, y, text, color: color || "#fff", t: 0, life: 0.9 });
  }

  function burst(x, y, kind) {
    particles.push({ kind, x, y, t: 0, life: kind === "boom" ? 0.55 : kind === "dust" ? 0.4 : 0.5, frame: 0 });
  }

  function applyFire(c, r, power) {
    if (!inb(c, r)) return;
    const t = world.tiles[idx(c, r)];
    if (t === T_WATER || t === T_ICE) {
      world.wet[idx(c, r)] = 0;
      return;
    }
    if (t === T_ASH) return;
    world.burn[idx(c, r)] = Math.max(world.burn[idx(c, r)], power || 1);
    world.fireAge[idx(c, r)] = 0;
  }

  function freezeWater(c, r) {
    if (!inb(c, r)) return;
    if (world.tiles[idx(c, r)] === T_WATER) {
      world.tiles[idx(c, r)] = T_ICE;
      world.iceAge[idx(c, r)] = 16;
    }
  }

  function electrify(c, r, radius) {
    const seen = new Set();
    const q = [[c, r]];
    while (q.length) {
      const [x, y] = q.pop();
      const k = x + "," + y;
      if (seen.has(k) || !inb(x, y)) continue;
      if (Math.hypot(x - c, y - r) > radius) continue;
      const t = world.tiles[idx(x, y)];
      const wet = world.wet[idx(x, y)] > 0;
      if (t !== T_WATER && t !== T_ICE && !wet) continue;
      seen.add(k);
      world.elec[idx(x, y)] = 0.45;
      q.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    for (const e of [player, ...entities]) {
      if (!e || e.dead) continue;
      const tc = Math.floor(e.x / TILE), tr = Math.floor(e.y / TILE);
      if (world.elec[idx(tc, tr)] > 0) {
        hurt(e, 16 + (rain > 0 ? 10 : 0), "lightning");
      }
    }
  }

  function hurt(e, dmg, src) {
    if (!e || e.dead || e.npc) return;
    if (e.kind === "player" && testMode) return;
    if (e.kind === "player" && e.invul > 0) return;
    if (e.kind === "player" && src === "lightning" && e.robot) {
      e.hp = Math.min(e.maxHp, e.hp + Math.max(8, dmg * 0.6));
      e.buffSpeed = Math.max(e.buffSpeed || 0, 10);
      floatText(e.x, e.y - 40, "充能", "#ffe56a");
      return;
    }
    let mul = e.kind === "player" && e.corr > 80 ? 1.15 : 1;
    if (e.kind === "player" && (inv.beehat || 0) > 0 && src === "bee") {
      mul *= 0.15;
    }
    if (e.kind === "player" && e.armor > 0 && src !== "hunger" && src !== "dark") {
      mul *= Math.max(0.55, 1 - e.armor * 0.12);
    }
    if (e.kind === "player" && e.form === "warrior" && src !== "hunger" && src !== "dark") {
      mul *= (e.warRank || 1) >= 2 ? 0.82 : 0.9;
    }
    if (e.kind === "player" && e.guarding && src !== "hunger" && src !== "dark") {
      mul *= 0.45;
      floatText(e.x, e.y - 48, "格挡", "#cde");
    }
    e.hp -= dmg * mul;
    e.hurt = 0.18;
    // Hit a pig → village revenge pack (not lunar werepigs)
    if (e.kind === "pig" && src !== "hunger" && src !== "dark") {
      e.friend = false;
      e.hostile = true;
      e.enemy = true;
      e.animal = false;
      e.dmg = e.dmg || 14;
      e.aggro = e.aggro || 520;
      e.speed = Math.max(e.speed, 95);
      e.name = "愤怒猪人";
      let allies = 0;
      for (const o of entities) {
        if (!o || o.dead || o === e || o.kind !== "pig" || o.friend) continue;
        if (dist(o.x, o.y, e.x, e.y) > 240) continue;
        o.friend = false; o.hostile = true; o.enemy = true; o.animal = false;
        o.dmg = o.dmg || 14; o.aggro = Math.max(o.aggro || 0, 500);
        o.speed = Math.max(o.speed || 70, 92); o.name = "复仇猪人";
        allies++;
      }
      if (allies) toast("猪村开始报复！", 2.2);
    }
    if (e.kind === "sheep" && e.beefalo && src !== "hunger") {
      e.hostile = true;
      e.enemy = true;
      e.animal = false;
      e.dmg = e.dmg || 18;
      e.aggro = 640;
      e.speed = Math.max(e.speed, 88);
      e.name = "狂暴犀牛羊";
      // herd shares aggro
      for (const o of entities) {
        if (!o || o.dead || o === e || !o.beefalo) continue;
        if (dist(o.x, o.y, e.x, e.y) > 220) continue;
        o.hostile = true; o.enemy = true; o.animal = false;
        o.dmg = o.dmg || 16; o.aggro = 600; o.speed = Math.max(o.speed, 85);
        o.name = "狂暴犀牛羊";
      }
      toast("犀牛羊群被激怒了！", 2.5);
    }
    if (e.passive && e.enemy && src !== "hunger" && src !== "dark" && src !== "cold" && src !== "heat") {
      e.passive = false;
      e._provoked = true;
    }
    if (e.kind === "player") {
      e.invul = 0.35;
      shake = Math.max(shake, 7);
    }
    floatText(e.x, e.y - 40, Math.round(dmg).toString(), src === "fire" ? "#ffb15a" : src === "ice" ? "#9fe9ff" : src === "lightning" ? "#f6f17a" : src === "dark" ? "#8aa0ff" : src === "cold" ? "#9cf" : src === "heat" ? "#f86" : "#fff4d2");
    if (e.hp <= 0) kill(e);
  }

  function kill(e) {
    e.dead = true;
    e.hp = 0;
    burst(e.x, e.y - 20, "boom");
    if (e.kind === "sheep") {
      spawnPickup(e.x, e.y, "meat");
      floatText(e.x, e.y, "羊肉", "#ff8a8a");
    } else if (e.kind === "pig") {
      spawnPickup(e.x, e.y, "meat");
      spawnPickup(e.x + 8, e.y, "meat");
      if (e.kind === "spider" || e.kind === "skull") spawnPickup(e.x - 8, e.y, "monster");
      if (e.hound) {
        const q = quests.find((x) => x.id === "hound");
        if (q && !q.done) { q.done = true; toast("任务完成：扛过劫掠潮", 3); }
      }
      floatText(e.x, e.y, "猪肉", "#ff8a8a");
    } else if (e.enemy && !e.phantom) {
      if (rand() < 0.45) spawnPickup(e.x, e.y, "gold");
      if (rand() < 0.2) spawnPickup(e.x + 10, e.y, "meat");
    }
    if (e === warlord) {
      quests.find((q) => q.id === "warlord").done = true;
      toast("红堡僭主已陨落。这座岛暂时安静了。", 5);
      player._winTimer = 1.4;
    }
    if (e.kind === "bat_queen") {
      const q = quests.find((x) => x.id === "batqueen");
      if (q) q.done = true;
      spawnPickup(e.x, e.y, "gold");
      spawnPickup(e.x + 12, e.y, "gold");
      inv.warmstone = (inv.warmstone || 0) + 1;
      inv.berries = (inv.berries || 0) + 4;
      toast("蝠后坠落。你从巢中搜出暖石与浆果。", 4);
    }
    if (e.kind === "bear" && e.boss) {
      const q = quests.find((x) => x.id === "bear");
      if (q) q.done = true;
      spawnPickup(e.x, e.y, "meat");
      spawnPickup(e.x + 10, e.y, "meat");
      spawnPickup(e.x, e.y + 8, "gold");
      inv.warKit = Math.max(inv.warKit || 0, 1);
      if (!player.warRank) player.warRank = 1;
      toast("熊王倒下。你剥下厚皮，解锁武装锻造资格。", 4.5);
    }
    if (e.trollChief) {
      const q = quests.find((x) => x.id === "troll");
      if (q) q.done = true;
      spawnPickup(e.x, e.y, "meat");
      spawnPickup(e.x + 12, e.y, "gold");
      spawnPickup(e.x - 8, e.y + 6, "gold");
      inv.gold = (inv.gold || 0) + 5;
      toast("巨魔酋长倒下。矿脉暂时安宁。", 4);
    }
    if (e.gnomeGuard) {
      const q = quests.find((x) => x.id === "gnome");
      if (q && !q.done) {
        const left = entities.some((x) => x.gnomeGuard && !x.dead && x !== e);
        if (!left) { q.done = true; toast("侏儒塔守卫已清。", 3); }
      }
    }
    if (e.minoBoss) {
      const q = quests.find((x) => x.id === "mino");
      if (q) q.done = true;
      spawnPickup(e.x, e.y, "gold");
      spawnPickup(e.x + 14, e.y, "gold");
      inv.gold = (inv.gold || 0) + 8;
      inv.honey = (inv.honey || 0) + 1;
      toast("牛头人倒下。废墟的符文气息平静了。", 4);
    }
    if (e.kind === "bee") {
      if (rand() < 0.7) {
        inv.honey = (inv.honey || 0) + 1;
        floatText(e.x, e.y, "蜂蜜", "#ffe56a");
      }
    }
    if (e.beeQueen) {
      spawnPickup(e.x, e.y, "honey");
      spawnPickup(e.x + 10, e.y, "silk");
      spawnPickup(e.x - 8, e.y, "gold");
      inv.honey = (inv.honey || 0) + 3;
      toast("蜂后倒下。取得蜜与丝。", 4);
    }
    if (e.shadowCreep) {
      if (rand() < 0.55) spawnPickup(e.x, e.y, "trinket");
      else if (rand() < 0.5) spawnPickup(e.x, e.y, "gold");
      player.corr = Math.max(0, player.corr - 4);
    }
    if (e.kind === "turtle" || e.kind === "panda" || e.kind === "pig_rider") {
      spawnPickup(e.x, e.y, "meat");
      if (rand() < 0.4) spawnPickup(e.x + 10, e.y, "meat");
    }
    if (e.kind === "frog" || e.frog) {
      if (rand() < 0.7) spawnPickup(e.x, e.y, "meat");
      else spawnPickup(e.x, e.y, "monster");
    }
    if (e.bird || e.kind === "crow") {
      if (rand() < 0.7) spawnPickup(e.x, e.y, "seeds");
      if (rand() < 0.25) spawnPickup(e.x + 6, e.y, "seeds");
    }
    if (e.kind === "lizard" && rand() < 0.35) spawnPickup(e.x, e.y, "monster");
    if (e.kind === "thief" && rand() < 0.5) {
      inv.gold = (inv.gold || 0) + 1 + irand(0, 2);
      floatText(e.x, e.y, "金币", "#ffe56a");
    }
    if (e.kind === "spider") {
      inv.silk = (inv.silk || 0) + 1 + (rand() < 0.35 ? 1 : 0);
      if (rand() < 0.55) spawnPickup(e.x, e.y, "monster");
      floatText(e.x, e.y, "丝绸", "#e8e0f0");
    }
    if (e.kind === "player") {
      dropCorpse();
      toast("你倒下了……物资落在原地。点击可在营火旁重生。", 4);
      state = STATE.DEAD;
    }
  }

  function dropCorpse() {
    const bag = {};
    for (const [k, v] of Object.entries(inv)) {
      if (typeof v === "number" && v > 0) bag[k] = v;
    }
    // lose half torch/war soft - keep bag full DS-like (lose some meat)
    if (bag.meat) bag.meat = Math.max(0, bag.meat - 1);
    corpse = {
      kind: "corpse", x: player.x, y: player.y,
      fw: 48, fh: 32, frames: 1, hp: 999, solid: false,
      bag, t: 0,
    };
    props.push(corpse);
    // empty inventory
    for (const k of Object.keys(inv)) {
      if (typeof inv[k] === "number") inv[k] = 0;
    }
    inv.meat = 0;
    player.torchOn = false;
    player.form = "pawn";
  }

  function respawnAtCamp() {
    if (!player) return;
    if (!campfire) {
      if (fires && fires.length) campfire = fires[0];
      else if (landmarks && landmarks.camp) {
        campfire = { x: landmarks.camp.c * TILE + 40, y: landmarks.camp.r * TILE + 40, lit: true, fuel: 60 };
        fires.push(campfire);
      }
    }
    if (!campfire) {
      toast("找不到营火，请新的放逐。", 3);
      state = STATE.MENU;
      return;
    }
    player.dead = false;
    player.hp = player.maxHp * 0.55;
    player.mp = player.maxMp * 0.4;
    player.hunger = Math.min(player.maxHunger || 150, 75);
    player.corr = Math.min(40, player.corr || 0);
    player.temp = 50;
    player.x = campfire.x + 40;
    player.y = campfire.y + 50;
    player.attacking = 0;
    player.invul = 2.5;
    clearMoveTarget();
    dayT = 0.12;
    inCave = false; onIsland = false; onSeaIsland = false;
    state = STATE.PLAY;
    inv.meat = 1;
    inv.torch = 1;
    toast("你在营火旁醒来，赤手空拳。空格取回遗物。", 4);
    const q = quests.find((x) => x.id === "corpse");
    if (q && !q.done && corpse) toast("任务：找到尸体取回遗物。", 3);
  }

  function lootCorpse() {
    if (!corpse || !corpse.bag) return;
    for (const [k, n] of Object.entries(corpse.bag)) {
      inv[k] = (inv[k] || 0) + n;
    }
    floatText(corpse.x, corpse.y - 20, "取回遗物", "#ffe56a");
    corpse.gone = true;
    props.splice(0, props.length, ...props.filter((p) => !p.gone));
    const q = quests.find((x) => x.id === "corpse");
    if (q) q.done = true;
    corpse = null;
    toast("你取回了散落的物资。", 3);
  }

  function meleeHit(origin, range, arcFacing, dmg) {
    const oh = actorHit(origin);
    const aimX = origin.kind === "player" ? mouse.wx : origin.x + origin.facing * 40;
    const aimY = origin.kind === "player" ? mouse.wy : oh.y;
    const ang = Math.atan2(aimY - oh.y, aimX - oh.x);
    const targets = origin.kind === "player"
      ? entities.filter((e) => !e.dead && (e.enemy || e.animal))
      : [player];
    for (const t of targets) {
      const th = actorHit(t);
      // Feet decide "in reach"; body decides aim — clicking/aiming the torso now connects
      const dFeet = dist(origin.x, origin.y, t.x, t.y);
      if (dFeet > range + th.r) continue;
      const a = Math.atan2(th.y - oh.y, th.x - oh.x);
      let diff = Math.abs(a - ang);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      // Wide arc when very close (DST bump); tighter when aiming from afar
      const arc = dFeet < 36 ? 1.55 : 1.25;
      if (diff < arc) {
        hurt(t, dmg, "melee");
        burst((origin.x + th.x) / 2, (oh.y + th.y) / 2, "dust");
      }
    }
    if (origin.kind === "player") {
      tryHitPirateTower(origin.x, origin.y, range + 20, dmg);
    }
  }

  function tryHitPirateTower(x, y, range, dmg) {
    if (!pirateTower || pirateTower.hp == null || pirateTower.hp <= 0) return;
    if (dist(x, y, pirateTower.x, pirateTower.y) > range + 36) return;
    pirateTower.hp -= dmg;
    floatText(pirateTower.x, pirateTower.y - 160, Math.round(dmg).toString(), "#fff");
    burst(pirateTower.x, pirateTower.y - 80, "dust");
    shake = Math.max(shake, 4);
    if (pirateTower.hp <= 0) {
      toast("海盗塔崩塌！岸边暂时安静了。", 4);
      const q = quests.find((x) => x.id === "pirate");
      if (q) q.done = true;
      inv.gold = (inv.gold || 0) + 8;
      inv.wood = (inv.wood || 0) + 6;
      spawnPickup(pirateTower.x, pirateTower.y + 20, "gold");
      const ix = buildings.indexOf(pirateTower);
      if (ix >= 0) buildings.splice(ix, 1);
      pirateTower = null;
    }
  }

  function tryRepair(x, y, range) {
    for (const p of props) {
      if (p.kind !== "fence" && p.kind !== "haywall" && p.kind !== "woodwall" && p.kind !== "stonewall" && p.kind !== "chest") continue;
      { const h = propHit(p); if (dist(x, y, h.x, h.y) > range + h.r * 0.3) continue; }
      if (p.hp >= (p.max || 40)) { floatText(p.x, p.y - 20, "完好", "#cfe"); return; }
      p.hp = Math.min(p.max || 40, p.hp + 12);
      burst(p.x, p.y - 20, "dust");
      floatText(p.x, p.y - 24, "修理", "#9fe");
      return;
    }
    toast("附近没有可修的栅栏/木箱。");
  }

  function tryHarvest(x, y, range) {
    const tool = player.tool || "axe";
    const nearProp = (p, mul) => {
      const h = propHit(p);
      return dist(x, y, h.x, h.y) <= range + h.r * (mul == null ? 0.35 : mul);
    };
    // Berry pick (knife or bare tool near ripe berry)
    for (const p of props) {
      if (p.kind === "berry" && p.ripe && nearProp(p)) {
        p.ripe = false;
        p.grow = 0;
        inv.berries = (inv.berries || 0) + 1 + (rand() < 0.25 ? 1 : 0);
        floatText(p.x, p.y - 24, "+浆果", "#d45cff");
        burst(p.x, p.y - 10, "dust");
        return;
      }
      if (p.kind === "farm" && p.planted && p.stage >= 3 && nearProp(p)) {
        const crop = p.cropType || "berry";
        p.planted = false; p.stage = 0; p.grow = 0; p.cropType = null;
        if (crop === "carrot") {
          inv.carrot = (inv.carrot || 0) + 2 + (rand() < 0.4 ? 1 : 0);
          floatText(p.x, p.y - 24, "+胡萝卜", "#e8a060");
        } else {
          inv.berries = (inv.berries || 0) + 2 + (rand() < 0.4 ? 1 : 0);
          floatText(p.x, p.y - 24, "+收成", "#d45cff");
        }
        burst(p.x, p.y - 10, "dust");
        return;
      }
    }
    for (const p of props) {
      if (p.hp <= 0) continue;
      if (p.kind !== "tree" && p.kind !== "gold" && p.kind !== "rock" && p.kind !== "bush" && p.kind !== "spiderden") continue;
      if (tool === "axe" && (p.kind === "gold" || p.kind === "rock")) continue;
      if (tool === "pickaxe" && (p.kind === "tree" || p.kind === "bush" || p.kind === "spiderden")) continue;
      if (!nearProp(p, (p.kind === "gold" || p.kind === "rock") ? 0.55 : 0.4)) continue;
      if (p.kind === "gold" || p.kind === "rock") ensureMineStats(p);
      if (window.DstSys && toolDur) {
        const tk = (p.kind === "gold" || p.kind === "rock") ? "pickaxe" : "axe";
        // Woodie: axe lasts longer (DST lumberjack)
        if (!(tk === "axe" && player.lumberjack && rand() < 0.55)) {
          window.DstSys.useTool(toolDur, tk, toast);
        }
      }
      p.hp -= 1;
      burst(p.x, p.y - 30, "dust");
      shake = Math.max(shake, 3);
      if (p.hp <= 0) {
        if (p.kind === "tree") {
          p.kind = "stump"; p.img = imgs.stump; p.fw = 192; p.fh = 256; p.frames = 1;
          spawnPickup(p.x, p.y + 8, "wood");
          spawnPickup(p.x + 12, p.y, "wood");
          if (rand() < 0.35) spawnPickup(p.x - 8, p.y, "twigs");
          if (rand() < 0.2) spawnPickup(p.x + 4, p.y + 12, "flint");
        } else if (p.kind === "gold" || p.kind === "rock") {
          p.gone = true;
          dropMineLoot(p);
        } else if (p.kind === "bush") {
          p.gone = true;
          if (rand() < 0.4) spawnPickup(p.x, p.y, "twigs");
          if (rand() < 0.35) spawnPickup(p.x + 6, p.y, "grass");
        } else if (p.kind === "spiderden") {
          p.gone = true;
          spawnPickup(p.x, p.y, "silk");
          if (rand() < 0.55) spawnPickup(p.x + 8, p.y, "silk");
          if (rand() < 0.35) spawnPickup(p.x - 6, p.y, "monster");
          // chance to leave a weaker nest
          if ((p.denTier || 1) >= 2 && rand() < 0.4) {
            props.push({
              kind: "spiderden", x: p.x, y: p.y,
              fw: 64, fh: 64, frames: 1, hp: 35, max: 35, solid: true, z: 0,
              nest: 2, denTier: Math.max(1, (p.denTier || 2) - 1),
            });
            toast("砸毁蛛巢，残巢仍在蠕动……", 2);
          } else toast("砸毁了蛛巢。", 1.8);
        }
      }
      break;
    }
    props.splice(0, props.length, ...props.filter((p) => !p.gone));
  }

  function tryDemolish() {
    if (player.form === "warrior") { toast("先按 Q 卸甲，用锤子拆除。"); return; }
    player.tool = "hammer";
    player.hold = "hammer";
    let best = null, bestD = 70;
    for (const p of props) {
      if (p.kind !== "fence" && p.kind !== "haywall" && p.kind !== "woodwall" && p.kind !== "stonewall" && p.kind !== "chest" && p.kind !== "trap" && p.kind !== "farm") continue;
      const h = propHit(p);
      const d = dist(player.x, player.y, h.x, h.y) - h.r * 0.2;
      if (d < bestD) { bestD = d; best = p; }
    }
    let bBest = null;
    for (const b of buildings) {
      if (!b.owned) continue;
      const d = dist(player.x, player.y, b.x, b.y);
      if (d < bestD) { bestD = d; bBest = b; best = null; }
    }
    if (bBest) {
      buildings.splice(buildings.indexOf(bBest), 1);
      inv.wood += 4; inv.gold += 1;
      toast("拆除哨塔，回收部分材料。");
      burst(bBest.x, bBest.y, "dust");
      return;
    }
    if (!best) { toast("附近没有可拆的设施。"); return; }
    best.gone = true;
    if (best.kind === "fence") { inv.wood += 1; toast("拆了栅栏。"); }
    else if (best.kind === "haywall") { inv.grass = (inv.grass || 0) + 1; toast("拆了草墙。"); }
    else if (best.kind === "woodwall") { inv.boards = (inv.boards || 0) + 1; toast("拆了木墙。"); }
    else if (best.kind === "stonewall") { inv.cutstone = (inv.cutstone || 0) + 1; toast("拆了石墙。"); }
    else if (best.kind === "chest") {
      // spill contents
      if (best.store) {
        for (const [k, n] of Object.entries(best.store)) inv[k] = (inv[k] || 0) + (n || 0);
      }
      inv.wood += 2;
      toast("拆了木箱，物资已取出。");
    } else if (best.kind === "trap") { inv.wood += 1; toast("收起了陷阱。"); }
    else if (best.kind === "farm") { inv.wood += 1; toast("铲平了农田。"); }
    burst(best.x, best.y, "dust");
    props.splice(0, props.length, ...props.filter((p) => !p.gone));
  }

  function castSpell() {
    if (player.attacking > 0 || player.dead) return;
    const type = spell;
    if (type === "ice" && !runes.ice) { toast("你还没有冰霜符文。去东北废墟找找。"); return; }
    if (type === "lightning" && !runes.lightning) { toast("雷霆符文仍沉睡在奥术废墟中。"); return; }
    const cost = type === "fire" ? 18 : type === "ice" ? 16 : 22;
    if (player.mp < cost) { toast("魔力不足"); return; }
    faceMouse();
    player.mp -= cost;
    {
      const corrCost = (type === "lightning" ? 6 : 3.5) * ((player.tech && player.tech.shadow) ? 0.5 : 1);
      player.corr = Math.min(100, player.corr + corrCost);
    }
    player.attacking = 0.38;
    player.anim = "atk";
    player.frame = 0;
    // Aim from caster torso toward cursor body (or locked enemy torso) — not foot shadows
    const ph = actorHit(player);
    const locked = entityUnderCursor();
    let aimX = mouse.wx, aimY = mouse.wy;
    if (locked) {
      const th = actorHit(locked);
      aimX = th.x; aimY = th.y;
    }
    const ang = Math.atan2(aimY - ph.y, aimX - ph.x);
    const spd = type === "lightning" ? 420 : 280;
    projectiles.push({
      kind: type, x: ph.x, y: ph.y,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      life: 1.15, r: 14, from: "player",
    });
  }

  function shootArrow(e, tx, ty) {
    const ang = Math.atan2(ty - e.y, tx - e.x);
    projectiles.push({
      kind: "arrow", x: e.x, y: e.y - 16,
      vx: Math.cos(ang) * 260, vy: Math.sin(ang) * 260,
      life: 1.4, r: 6, from: "enemy", dmg: e.dmg,
    });
  }

  function shootHex(e, tx, ty) {
    const ang = Math.atan2(ty - e.y, tx - e.x);
    projectiles.push({
      kind: "hex", x: e.x, y: e.y - 20,
      vx: Math.cos(ang) * 210, vy: Math.sin(ang) * 210,
      life: 2.2, dmg: e.dmg + 4, frame: 0,
    });
  }

  function shootBone(e, tx, ty) {
    const ang = Math.atan2(ty - e.y, tx - e.x);
    projectiles.push({
      kind: "bone", x: e.x, y: e.y - 16,
      vx: Math.cos(ang) * 260, vy: Math.sin(ang) * 260,
      life: 1.8, dmg: e.dmg, frame: 0,
    });
  }

  function shootHarpoon(e, tx, ty) {
    const ang = Math.atan2(ty - e.y, tx - e.x);
    projectiles.push({
      kind: "harpoon", x: e.x, y: e.y - 16,
      vx: Math.cos(ang) * 300, vy: Math.sin(ang) * 300,
      life: 2.0, dmg: e.dmg + 3, frame: 0,
    });
  }

  function shootAcorn(e, tx, ty) {
    const ang = Math.atan2(ty - e.y, tx - e.x);
    projectiles.push({
      kind: "acorn", x: e.x, y: e.y - 14,
      vx: Math.cos(ang) * 240, vy: Math.sin(ang) * 240,
      life: 1.7, dmg: e.dmg, frame: 0,
    });
  }

  function shootBomb(e, tx, ty) {
    const ang = Math.atan2(ty - e.y, tx - e.x);
    projectiles.push({
      kind: "bomb", x: e.x, y: e.y - 16,
      vx: Math.cos(ang) * 200, vy: Math.sin(ang) * 200,
      life: 2.1, dmg: e.dmg + 6, frame: 0,
    });
  }


  function updatePirateTower(dt) {
    if (!pirateTower || pirateTower.hp <= 0) return;
    pirateTower.cd = (pirateTower.cd || 0) - dt;
    const d = dist(pirateTower.x, pirateTower.y, player.x, player.y);
    if (d < 360 && pirateTower.cd <= 0 && !player.dead) {
      pirateTower.cd = 1.6;
      const ang = Math.atan2(player.y - pirateTower.y, player.x - pirateTower.x);
      const useCannon = rand() < 0.35 && imgs.cannonBall;
      projectiles.push({
        kind: useCannon ? "cannon" : "arrow",
        x: pirateTower.x, y: pirateTower.y - 100,
        vx: Math.cos(ang) * (useCannon ? 220 : 280),
        vy: Math.sin(ang) * (useCannon ? 220 : 280),
        life: useCannon ? 2.2 : 1.6,
        dmg: useCannon ? 18 : 11,
        friendly: false,
        frame: 0,
      });
    }
    // coastal pirate reinforcements at night near tower
    if (isNight() && !inCave) {
      pirateRaidCd -= dt;
      if (pirateRaidCd <= 0 && d < 500) {
        pirateRaidCd = 35 + rand() * 25;
        const a = rand() * Math.PI * 2;
        let ex = pirateTower.x + Math.cos(a) * 90, ey = pirateTower.y + Math.sin(a) * 90;
        const useShark = rand() < 0.5;
        if (useShark) {
          for (let t = 0; t < 10 && tileAt(ex, ey) !== T_WATER; t++) {
            ey += 30; ex += (rand() - 0.5) * 40;
          }
          if (tileAt(ex, ey) !== T_WATER) {
            const e = spawnEnemy("gnoll", pirateTower.x + Math.cos(a) * 90, pirateTower.y + Math.sin(a) * 90, false);
            if (e) { e.raid = true; e.pirate = true; }
          } else {
            const e = spawnEnemy("paddle_shark", ex, ey, false);
            if (e) { e.raid = true; e.pirate = true; e.aquatic = true; }
          }
        } else {
          const e = spawnEnemy("gnoll", ex, ey, false);
          if (e) { e.raid = true; e.pirate = true; }
        }
        toast("海盗塔派出喽啰！", 2);
      }
    }
  }

  function updateWatchtowers(dt) {
    for (const b of buildings) {
      if (!b.owned || b.kind !== "watchtower") continue;
      b.cd = (b.cd || 0) - dt;
      if (b.cd > 0) continue;
      let target = null, best = b.range || 280;
      for (const e of entities) {
        if (!e.enemy || e.dead || e.ally || e.friend || e.animal) continue;
        if (e.passive && !e._provoked && !e.killer && !e.werepig) continue;
        if (e.kind === "pig" && !e.hostile && !e.werepig) continue;
        const d = dist(b.x, b.y, e.x, e.y);
        let score = d;
        if (e.raid || e.hound) score *= 0.7;
        if (e.seasonBoss || e.boss) score *= 0.55;
        if (score < best) { best = score; target = e; }
      }
      if (!target) continue;
      b.cd = 1.15;
      const ang = Math.atan2(target.y - b.y, target.x - b.x);
      projectiles.push({
        kind: "arrow", x: b.x, y: b.y - 80,
        vx: Math.cos(ang) * 320, vy: Math.sin(ang) * 320,
        life: 1.4, dmg: 10, friendly: true,
      });
    }
  }


  function faceMouse() {
    if (mouse.wx < player.x) player.facing = -1;
    else if (mouse.wx > player.x) player.facing = 1;
  }

  function facePoint(x, y) {
    if (x < player.x) player.facing = -1;
    else if (x > player.x) player.facing = 1;
  }

  /** Screen-pick radius in world pixels for cursor targeting (DST hover). */
  const CURSOR_R = 42;

  function entityUnderCursor() {
    let best = null, bestD = 1e9;
    for (const e of entities) {
      if (e.dead || e === player || e.npc) continue;
      if (!e.enemy && !e.animal) continue;
      const h = actorHit(e);
      const d = dist(mouse.wx, mouse.wy, h.x, h.y);
      if (d < h.r + 10 && d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  function propUnderCursor() {
    let best = null, bestD = 1e9;
    for (const p of props) {
      if (p.gone) continue;
      const h = propHit(p);
      const d = dist(mouse.wx, mouse.wy, h.x, h.y);
      if (d < h.r + 8 && d < bestD) { bestD = d; best = p; }
    }
    return best;
  }

  function dropUnderCursor() {
    let best = null, bestD = 1e9;
    for (const d of drops) {
      const h = dropHit(d);
      const dd = dist(mouse.wx, mouse.wy, h.x, h.y);
      if (dd < h.r + 8 && dd < bestD) { bestD = dd; best = d; }
    }
    return best;
  }

  function buildingUnderCursor() {
    let best = null, bestD = 1e9;
    for (const b of buildings) {
      const bodyY = b.y - Math.min(120, (b.h || 128) * 0.35);
      const rr = Math.max(36, (b.footW || 40) + 12);
      const d = dist(mouse.wx, mouse.wy, b.x, bodyY);
      if (d < rr && d < bestD) { bestD = d; best = b; }
    }
    return best;
  }

  function isInteractProp(p) {
    if (!p) return false;
    return p.kind === "chest" || p.kind === "trap" || p.kind === "beehive" || p.kind === "wormhole"
      || p.kind === "grave" || p.kind === "molehole" || p.kind === "stump" || p.kind === "corpse" || p.kind === "meatrack" || (p.kind === "berry" && p.ripe);
  }

  function isHarvestProp(p) {
    if (!p) return false;
    if (p.kind === "berry" && p.ripe) return true;
    if (p.kind === "farm" && p.planted && p.stage >= 3) return true;
    if (p.hp > 0 && (p.kind === "tree" || p.kind === "gold" || p.kind === "rock" || p.kind === "bush"
      || p.kind === "spiderden" || p.kind === "fence" || p.kind === "haywall" || p.kind === "woodwall" || p.kind === "stonewall"
      || p.kind === "barrel" || p.kind === "cannonProp")) return true;
    return false;
  }

  function harvestVerb(p) {
    if (!p) return "行动";
    if (p.kind === "tree") return "砍伐";
    if (p.kind === "gold") return "开采";
    if (p.kind === "rock") return "开采";
    if (p.kind === "bush") return "采集";
    if (p.kind === "berry" || p.kind === "farm") return "采摘";
    if (p.kind === "spiderden") return "砸毁";
    if (p.kind === "fence" || p.kind === "haywall" || p.kind === "woodwall" || p.kind === "stonewall") return "锤击";
    if (p.kind === "barrel") return "砸毁";
    if (p.kind === "cannonProp") return "拆毁";
    return "行动";
  }

  function interactVerbNearby() {
    // Mirror doActionNearby priority for Space/F hints
    const hv = nearestHarvestable(56);
    if (hv) {
      const h = propHit(hv);
      if (dist(player.x, player.y, h.x, h.y) - h.r * 0.35 <= 56) return harvestVerb(hv);
    }
    if (pigKing && dist(player.x, player.y, pigKing.x, pigKing.y) < 80) return "交易";
    if (monk && dist(player.x, player.y, monk.x, monk.y) < 70) return "祈祷";
    if (nearestFire(78)) {
      const f = nearestFire(78);
      if (f && f.lit && ((inv.meat || 0) > 0 || (inv.fish || 0) > 0) && !roastJob) return "烤制";
      return "添柴";
    }
    if (props.some((p) => p.kind === "stump" && !p.dug && dist(player.x, player.y, p.x, p.y) < 52)) return "挖桩";
    if (props.some((p) => p.kind === "corpse" && dist(player.x, player.y, p.x, p.y) < 56)) return "拾取遗物";
    if (props.some((p) => p.kind === "chest" && dist(player.x, player.y, p.x, p.y) < 56)) return "打开";
    if (buildings.some((b) => b.icebox && dist(player.x, player.y, b.x, b.y) < 64)) return "开冰箱";
    if (entities.some((e) => e.kind === "pig" && !e.dead && !e.hostile && dist(player.x, player.y, e.x, e.y) < 56) && (inv.meat || 0) > 0) return "喂肉";
    if (props.some((p) => p.kind === "beehive" && (p.honeyLeft || 0) > 0 && dist(player.x, player.y, p.x, p.y) < 52)) return "取蜜";
    if (props.some((p) => p.kind === "wormhole" && dist(player.x, player.y, p.x, p.y) < 48)) return "进入";
    if (props.some((p) => p.kind === "grave" && !p.dug && dist(player.x, player.y, p.x, p.y) < 48)) return "挖掘";
    if (props.some((p) => p.kind === "molehole" && !p.dug && dist(player.x, player.y, p.x, p.y) < 48)) return "掏洞";
    if (props.some((p) => p.kind === "farm" && p.planted && p.stage < 3 && dist(player.x, player.y, p.x, p.y) < 52) && (inv.dung || 0) > 0) return "施肥";
    if (buildings.some((b) => b.cook && dist(player.x, player.y, b.x, b.y) < 60)) return "烹饪";
    if (buildings.some((b) => b.bench && dist(player.x, player.y, b.x, b.y) < 70)) return "勘测";
    if (!inCave && caveEntrance && dist(player.x, player.y, caveEntrance.x, caveEntrance.y) < 72) return "进入";
    if (inCave && caveInterior && dist(player.x, player.y, caveInterior.x, caveInterior.y) < 48) return "离开";
    if (drops.some((d) => dist(player.x, player.y, d.x, d.y) < 48)) return "拾取";
    return null;
  }

  /** Resolve what LMB / hover would do under cursor (DST LMBaction). */
  function resolveCursorPrimary() {
    const forceAtk = keys.has("ControlLeft") || keys.has("ControlRight");
    const ent = entityUnderCursor();
    const prop = propUnderCursor();
    const drop = dropUnderCursor();
    const bld = buildingUnderCursor();

    if (forceAtk && ent) return { type: "attack", target: ent, label: "攻击 " + (ent.name || "目标") };
    // Prefer feeding calm pigs when holding meat (DST befriend)
    if (ent && ent.kind === "pig" && !ent.hostile && !ent.friend && (inv.meat || 0) > 0 && !forceAtk) {
      return { type: "interact", target: ent, label: "喂肉" };
    }
    if (ent && (!prop || dist(mouse.wx, mouse.wy, ent.x, ent.y) <= dist(mouse.wx, mouse.wy, prop.x, prop.y) + 6)) {
      return { type: "attack", target: ent, label: "攻击 " + (ent.name || "目标") };
    }
    if (prop && isHarvestProp(prop) && !(prop.kind === "berry" && isInteractProp(prop))) {
      return { type: "harvest", target: prop, label: harvestVerb(prop) };
    }
    if (prop && prop.kind === "berry" && prop.ripe) {
      return { type: "harvest", target: prop, label: "采摘" };
    }
    if (prop && isInteractProp(prop)) {
      let lab = "互动";
      if (prop.kind === "chest") lab = "打开";
      else if (prop.kind === "beehive") lab = "取蜜";
      else if (prop.kind === "wormhole") lab = "进入";
      else if (prop.kind === "grave") lab = "挖掘";
      else if (prop.kind === "molehole") lab = "掏洞";
      else if (prop.kind === "stump") lab = "挖桩";
      else if (prop.kind === "tool") lab = "拾取";
      else if (prop.kind === "crate") lab = "砸开";
      else if (prop.kind === "corpse") lab = "拾取遗物";
      else if (prop.kind === "trap") lab = "放饵";
      return { type: "interact", target: prop, label: lab };
    }
    if (drop) return { type: "pickup", target: drop, label: "拾取" };
    if (bld && (bld.cook || bld.icebox || bld.bench || bld.kind === "house" || bld.kind === "boat" || bld.kind === "seahorse"
      || bld.kind === "cave" || bld.kind === "pigking" || bld.kind === "fishHut")) {
      let lab = "互动";
      if (bld.cook) lab = "烹饪";
      else if (bld.icebox) lab = "开冰箱";
      else if (bld.bench) lab = "勘测";
      else if (bld.kind === "house") lab = "歇息";
      else if (bld.kind === "boat" || bld.kind === "seahorse") lab = "乘船";
      else if (bld.kind === "cave") lab = "进入";
      else if (bld.kind === "pigking") lab = "交易";
      else if (bld.kind === "fishHut") lab = "垂钓";
      return { type: "interact", target: bld, label: lab };
    }

    if (monk && dist(mouse.wx, mouse.wy, monk.x, monk.y) < 48) {
      return { type: "interact", target: monk, label: "祈祷" };
    }
    return { type: "walkto", x: mouse.wx, y: mouse.wy, label: "行走" };
  }

  function resolveCursorSecondary() {
    const ent = entityUnderCursor();
    if (ent) return { type: "examine", target: ent, label: "检查 " + (ent.name || "生物") };
    const prop = propUnderCursor();
    if (prop) {
      const names = {
        tree: "树", stump: "树桩", gold: "矿石", rock: "石头", bush: "灌木", berry: "浆果丛",
        rock: "石头", chest: "木箱", trap: "陷阱", beehive: "蜂巢", wormhole: "虫洞",
        grave: "坟墓", molehole: "鼹鼠洞", corpse: "尸体", spiderden: "蛛巢", fence: "栅栏", haywall: "草墙", woodwall: "木墙", stonewall: "石墙",
        barrel: "炸药桶", cannonProp: "岸防炮", dynamiteDeco: "炸药",
      };
      return { type: "examine", target: prop, label: "检查 " + (names[prop.kind] || prop.kind) };
    }
    const bld = buildingUnderCursor();
    if (bld) return { type: "examine", target: bld, label: "检查建筑" };
    if (monk && dist(mouse.wx, mouse.wy, monk.x, monk.y) < 48) return { type: "examine", target: monk, label: "检查僧侣" };
    return { type: "examine", label: "检查地面" };
  }

  function updateCursorHint() {
    if (state !== STATE.PLAY || craftOpen || cookOpen || bagOpen || chestOpen) {
      cursorHint = "";
      return;
    }
    const p = resolveCursorPrimary();
    const s = resolveCursorSecondary();
    cursorHint = "左键 " + p.label + "  ·  右键 " + s.label;
  }

  function setMoveTo(x, y, act) {
    moveTarget = { x, y };
    pendingAct = act || null;
  }

  function clearMoveTarget() {
    moveTarget = null;
    pendingAct = null;
  }

  function tryPickupOne(d) {
    if (!d) return false;
    if (d.kind === "wood") { gainItem("wood", 1); floatText(d.x, d.y, "+木材", "#c9843a"); }
    else if (d.kind === "gold") { gainItem("gold", 1); floatText(d.x, d.y, "+金子", "#e8c44a"); }
    else if (d.kind === "rocks") { gainItem("rocks", 1); floatText(d.x, d.y, "+石头", "#9ab0b8"); }
    else if (d.kind === "silk") { gainItem("silk", 1); floatText(d.x, d.y, "+丝绸", "#e8e0f0"); }
    else if (d.kind === "meat") { gainItem("meat", 1); floatText(d.x, d.y, "+羊肉", "#e07070"); }
    else if (d.kind === "berries") { gainItem("berries", 1); floatText(d.x, d.y, "+浆果", "#d45cff"); }
    else if (d.kind === "twigs") { gainItem("twigs", 1); floatText(d.x, d.y, "+树枝", "#c4a060"); }
    else if (d.kind === "grass") { gainItem("grass", 1); floatText(d.x, d.y, "+草", "#6ecf7a"); }
    else if (d.kind === "flint") { gainItem("flint", 1); floatText(d.x, d.y, "+燧石", "#aaa"); }
    else if (d.kind === "seeds") { gainItem("seeds", 1); floatText(d.x, d.y, "+种子", "#cde"); }
    else if (d.kind === "honey") { gainItem("honey", 1); floatText(d.x, d.y, "+蜜", "#ffe56a"); }
    else if (d.kind === "trinket") { gainItem("trinket", 1); floatText(d.x, d.y, "+饰品", "#e8c44a"); }
    else if (d.kind === "dung") { gainItem("dung", 1); floatText(d.x, d.y, "+粪", "#8a6a3a"); }
    else if (d.kind === "monster") { gainItem("monster", 1); floatText(d.x, d.y, "+怪物肉", "#6a4a6a"); }
    else if (d.kind === "rune_ice") { runes.ice = true; toast("获得冰霜符文。C 施放。"); }
    else if (d.kind === "rune_lightning") { runes.lightning = true; toast("获得雷电符文。C 施放。"); }
    else return false;
    const i = drops.indexOf(d);
    if (i >= 0) drops.splice(i, 1);
    return true;
  }

  function doPrimaryAction(act) {
    if (!act) return;
    if (act.type === "walkto") {
      setMoveTo(act.x, act.y, null);
      return;
    }
    let tx = act.target ? act.target.x : act.x;
    let ty = act.target ? act.target.y : act.y;
    let reachPad = 0;
    if (act.target) {
      if (act.type === "attack" && (act.target.enemy || act.target.animal)) {
        const h = actorHit(act.target); tx = h.x; ty = h.y; reachPad = h.r * 0.35;
      } else if (act.type === "harvest" || act.type === "interact") {
        const h = propHit(act.target); tx = h.x; ty = h.y; reachPad = h.r * 0.35;
      } else if (act.type === "pickup") {
        const h = dropHit(act.target); tx = h.x; ty = h.y; reachPad = h.r;
      }
    }
    const reach = (act.type === "attack" ? 58 : (act.type === "harvest" ? 56 : 64)) + reachPad;
    if (act.target && dist(player.x, player.y, tx, ty) > reach) {
      setMoveTo(act.target.x, act.target.y, act);
      return;
    }
    if (act.type === "attack") {
      facePoint(tx, ty);
      startAttack(true);
      return;
    }
    if (act.type === "harvest") {
      facePoint(tx, ty);
      // Prefer correct tool for this prop
      if (act.target) {
        if (act.target.kind === "gold" || act.target.kind === "rock") player.tool = "pickaxe";
        else if (act.target.kind === "tree" || act.target.kind === "bush" || act.target.kind === "spiderden") player.tool = "axe";
        else if (act.target.kind === "fence" || act.target.kind === "haywall" || act.target.kind === "woodwall" || act.target.kind === "stonewall") player.tool = "hammer";
        else player.tool = "knife";
      }
      startAttack(false);
      return;
    }
    if (act.type === "pickup") {
      if (!tryPickupOne(act.target)) {
        // walk onto it — auto pickupNear still helps when close
        setMoveTo(tx, ty, null);
      }
      return;
    }
    if (act.type === "interact") {
      tryInteract();
      return;
    }
  }

  function doExamine(act) {
    if (!act) return;
    if (act.target && act.target.name) {
      toast(act.target.name + (act.target.hp != null ? (" · 生命 " + Math.ceil(act.target.hp)) : ""), 2.2);
      return;
    }
    if (act.target && act.target.kind) {
      const p = act.target;
      let extra = "";
      if (p.kind === "tree") extra = " · 可用斧砍伐";
      else if (p.kind === "stump") extra = " · 可用铲子挖掉";
      else if (p.kind === "gold" || p.kind === "rock") {
        ensureMineStats(p);
        const size = (p.mineTier || 2) >= 3 ? "大" : (p.mineTier || 2) <= 1 ? "小" : "中";
        extra = " · " + size + " · 可用镐开采";
      }
      else if (p.kind === "berry") extra = p.ripe ? " · 成熟可采" : " · 尚未成熟";
      else if (p.kind === "beehive") extra = " · 蜂蜜×" + (p.honeyLeft || 0);
      else if (p.kind === "grave") extra = p.dug ? " · 已挖开" : " · 需铲子";
      else if (p.kind === "molehole") extra = p.dug ? " · 已掏空" : " · 可用铲子";
      else if (p.fuel != null) extra = " · 燃料 " + Math.floor(p.fuel);
      toast((act.label || "检查") + extra, 2.4);
      return;
    }
    const bi = biomes && inb(Math.floor(mouse.wx / TILE), Math.floor(mouse.wy / TILE))
      ? biomes[idx(Math.floor(mouse.wx / TILE), Math.floor(mouse.wy / TILE))] : -1;
    const B = window.OpenWorldGen && window.OpenWorldGen.BIOME;
    let biomeName = "荒野";
    if (B) {
      if (bi === B.MEADOW) biomeName = "草地";
      else if (bi === B.FOREST) biomeName = "森林";
      else if (bi === B.MAGIC) biomeName = "沼泽";
      else if (bi === B.WAR) biomeName = "恶地";
      else if (bi === B.MINES) biomeName = "矿区";
      else if (bi === B.SAVANNA) biomeName = "草原";
      else if (bi === B.SHORE) biomeName = "海岸";
      else if (bi === B.OCEAN) biomeName = "海洋";
    }
    toast("检查：" + biomeName, 1.8);
  }

  function onPrimaryDown() {
    if (craftOpen || cookOpen || bagOpen || chestOpen) return;
    lmbDownAt = performance.now();
    lmbDrag = false;
    const act = resolveCursorPrimary();
    if (act.type === "walkto") {
      setMoveTo(act.x, act.y, null);
      lmbDrag = true;
    } else {
      doPrimaryAction(act);
    }
  }

  function onPrimaryHold(dt) {
    if (!mouse.left || craftOpen || cookOpen || bagOpen || chestOpen) return;
    // DST draggingonground: hold LMB on open ground to keep walking toward cursor
    if (lmbDrag || resolveCursorPrimary().type === "walkto") {
      lmbDrag = true;
      setMoveTo(mouse.wx, mouse.wy, null);
    }
  }

  function onSecondaryDown() {
    if (craftOpen) { craftOpen = false; return; }
    if (cookOpen) { cookOpen = false; return; }
    if (bagOpen) { bagOpen = false; return; }
    if (chestOpen) { chestOpen = null; return; }
    clearMoveTarget();
    doExamine(resolveCursorSecondary());
  }

  function isResourceProp(p) {
    if (!p || p.hp <= 0) return false;
    if (p.kind === "berry" && p.ripe) return true;
    if (p.kind === "farm" && p.planted && p.stage >= 3) return true;
    return p.kind === "tree" || p.kind === "gold" || p.kind === "rock" || p.kind === "bush";
  }

  function nearestHarvestable(range, opts) {
    opts = opts || {};
    const resourcesOnly = !!opts.resourcesOnly;
    let best = null, bestD = range;
    for (const p of props) {
      if (p.kind === "berry" && p.ripe) {
        const h = propHit(p);
        const d = dist(player.x, player.y, h.x, h.y) - h.r * 0.35;
        if (d < bestD) { bestD = d; best = p; }
        continue;
      }
      if (p.kind === "farm" && p.planted && p.stage >= 3) {
        const h = propHit(p);
        const d = dist(player.x, player.y, h.x, h.y) - h.r * 0.35;
        if (d < bestD) { bestD = d; best = p; }
        continue;
      }
      if (p.hp <= 0) continue;
      if (resourcesOnly) {
        if (p.kind !== "tree" && p.kind !== "gold" && p.kind !== "rock" && p.kind !== "bush") continue;
      } else if (p.kind !== "tree" && p.kind !== "gold" && p.kind !== "rock" && p.kind !== "bush"
          && p.kind !== "fence" && p.kind !== "chest" && p.kind !== "trap" && p.kind !== "farm") continue;
      const h = propHit(p);
      const d = dist(player.x, player.y, h.x, h.y) - h.r * 0.35;
      if (d < bestD) { bestD = d; best = p; }
    }
    return best;
  }

  function nearestCombatTarget(range) {
    let best = null, bestD = range;
    for (const e of entities) {
      if (e.dead || (!e.enemy && !e.animal)) continue;
      const h = actorHit(e);
      const d = dist(player.x, player.y, h.x, h.y) - h.r * 0.3;
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  function pickPlayerTool() {
    const harvest = nearestHarvestable(64);
    const foe = nearestCombatTarget(70);
    // Prefer harvest when standing next to resources; combat if enemy closer
    if (harvest && foe) {
      const hh = propHit(harvest), fh = actorHit(foe);
      const dh = dist(player.x, player.y, hh.x, hh.y) - hh.r * 0.3;
      const df = dist(player.x, player.y, fh.x, fh.y) - fh.r * 0.3;
      if (df + 8 < dh) return "knife";
    }
    if (harvest) {
      if (harvest.kind === "berry" || (harvest.kind === "farm" && harvest.stage >= 3)) return "knife";
      if (harvest.kind === "tree" || harvest.kind === "bush") return "axe";
      if (harvest.kind === "gold" || harvest.kind === "rock") return "pickaxe";
      if (harvest.kind === "fence" || harvest.kind === "haywall" || harvest.kind === "woodwall" || harvest.kind === "stonewall" || harvest.kind === "chest" || harvest.kind === "farm" || harvest.kind === "trap") return "hammer";
    }
    if (foe) return "knife";
    // default: axe outdoors (survival feel)
    return player.tool || "axe";
  }

  function toolAtkFrames(tool) {
    if (tool === "knife") return 4;
    if (tool === "hammer") return 3;
    return 6; // axe / pickaxe
  }

  function startAttack(forceCombat) {
    if (player.attacking > 0 || player.dead) return;
    faceMouse();

    // Armed form: warrior sword combos. Auto-slip to pawn if clearly harvesting.
    if (player.form === "warrior") {
      const harvest = forceCombat ? null : nearestHarvestable(60);
      const foe = nearestCombatTarget(78);
      if (harvest && (!foe || dist(player.x, player.y, harvest.x, harvest.y) + 12 < dist(player.x, player.y, foe.x, foe.y))) {
        setForm("pawn", true);
        toast("卸甲采集。", 1.2);
      } else {
        player.tool = "sword";
        player.hold = null;
        player.atkKind = combo % 2 === 0 ? 1 : 2;
        combo++;
        player.atkFrames = 4;
        player.attacking = 0.42;
        player.anim = "atk";
        player.frame = 0;
        player._didHit = false;
        return;
      }
    }

    // F / Ctrl force-attack: prefer knife/combat over harvest tools
    let tool;
    if (forceCombat) {
      const foe = nearestCombatTarget(90) || entityUnderCursor();
      if (foe) facePoint(foe.x, foe.y);
      tool = "knife";
    } else {
      tool = pickPlayerTool();
    }
    player.tool = tool;
    player.hold = tool;
    const frames = toolAtkFrames(tool);
    player.atkFrames = frames;
    player.attacking = frames / 12 + 0.08;
    player.atkKind = 1;
    combo++;
    player.anim = "atk";
    player.frame = 0;
    player._didHit = false;
  }

  function updatePlayer(dt) {
    if (player.dead) return;
    player.invul = Math.max(0, player.invul - dt);
    player.hurt = Math.max(0, player.hurt - dt);
    player.attacking = Math.max(0, player.attacking - dt);

    let ix = 0, iy = 0;
    if (keys.has("KeyW") || keys.has("ArrowUp")) iy -= 1;
    if (keys.has("KeyS") || keys.has("ArrowDown")) iy += 1;
    if (keys.has("KeyA") || keys.has("ArrowLeft")) ix -= 1;
    if (keys.has("KeyD") || keys.has("ArrowRight")) ix += 1;
    // WASD cancels click-to-move (DST: keyboard overrides drag)
    const usingKeys = !!(ix || iy);
    if (usingKeys) clearMoveTarget();

    if (!usingKeys) onPrimaryHold(dt);

    // Hold Space/F to keep chopping/mining (DST hold Do Action)
    if (!craftOpen && !cookOpen && !bagOpen && !chestOpen && player.attacking <= 0
        && (keys.has("Space") || keys.has("KeyF"))) {
      const harvest = nearestHarvestable(72, { resourcesOnly: true });
      if (harvest) {
        const h = propHit(harvest);
        const hd = dist(player.x, player.y, h.x, h.y) - h.r * 0.35;
        if (hd <= 68) {
          faceToward(harvest.x, harvest.y);
          if (harvest.kind === "gold" || harvest.kind === "rock") player.tool = "pickaxe";
          else if (harvest.kind === "tree" || harvest.kind === "bush") player.tool = "axe";
          startAttack(false);
        }
      }
    }

    // DST click-to-move / walk-to-action
    if (moveTarget && !ix && !iy) {
      const dx = moveTarget.x - player.x;
      const dy = moveTarget.y - player.y;
      const md = Math.hypot(dx, dy);
      if (md < 10) {
        const act = pendingAct;
        clearMoveTarget();
        if (act) doPrimaryAction(act);
      } else {
        ix = dx / md;
        iy = dy / md;
        if (pendingAct && pendingAct.target) {
          const reach = pendingAct.type === "attack" ? 58 : 56;
          if (dist(player.x, player.y, pendingAct.target.x, pendingAct.target.y) <= reach) {
            const act = pendingAct;
            clearMoveTarget();
            doPrimaryAction(act);
            ix = 0; iy = 0;
          }
        }
      }
    }

    const len = Math.hypot(ix, iy) || 1;
    ix /= len; iy /= len;

    const starving = player.hunger < ((player.maxHunger || 150) * 0.15);
    const shift = keys.has("ShiftLeft") || keys.has("ShiftRight");
    const dash = shift && player.stamina > 12 && !starving && (ix || iy);
    player.buffSpeed = Math.max(0, (player.buffSpeed || 0) - dt);
    player.buffPower = Math.max(0, (player.buffPower || 0) - dt);
    player.buffWarm = Math.max(0, (player.buffWarm || 0) - dt);
    player.buffCool = Math.max(0, (player.buffCool || 0) - dt);
    let spd = player.speed * (starving ? 0.7 : 1) * (dash ? 1.7 : 1);
    if (player.form === "warrior") spd *= 0.92;
    if (player._iceSlow > 0) { player._iceSlow = Math.max(0, player._iceSlow - dt); spd *= 0.72; }
    {
      const tcw = Math.floor(player.x / TILE), trw = Math.floor(player.y / TILE);
      if (inb(tcw, trw)) {
        if (world.tiles[idx(tcw, trw)] === T_ASH && world.wet && world.wet[idx(tcw, trw)] > 0.7) spd *= 0.88;
        const Bref = window.OpenWorldGen && window.OpenWorldGen.BIOME;
        if (Bref && biomes) {
          const bi = biomes[idx(tcw, trw)];
          if (bi === Bref.FOREST) spd *= 0.84;
          else if (bi === Bref.MAGIC) spd *= 0.76 + ((world.wet && world.wet[idx(tcw, trw)]) > 0.5 ? -0.06 : 0);
          else if (bi === Bref.MINES) spd *= 1.08;
          else if (bi === Bref.SAVANNA) spd *= 1.05;
          else if (bi === Bref.SHORE) spd *= 0.95;
        }
      }
    }
    if (player.buffSpeed > 0) spd *= 1.22;
    if (player.hunger > (player.maxHunger || 150) * 0.8) spd *= 1.08;
    // Wolfgang mighty / wimpy (DST-inspired thresholds)
    if (player.mighty) {
      const mh = player.maxHunger || 200;
      if (player.hunger > mh * 0.75) { spd *= 1.18; player._mighty = true; player._wimpy = false; }
      else if (player.hunger < mh * 0.35) { spd *= 0.82; player._mighty = false; player._wimpy = true; }
      else { player._mighty = false; player._wimpy = false; }
    }
    if (player.attacking > 0) spd *= 0.35;

    if (dash) player.stamina -= 28 * dt;
    else player.stamina = Math.min(100, player.stamina + 18 * dt);

    // Warrior guard: hold Shift while standing still
    player.guarding = 0;
    if (player.form === "warrior" && shift && !ix && !iy && player.attacking <= 0) {
      player.guarding = 1;
      player.anim = "guard";
      player.stamina = Math.min(100, player.stamina + 8 * dt);
    } else if (player.attacking <= 0) {
      if (ix || iy) {
        player.anim = "run";
        if (Math.abs(ix) > 0.01) player.facing = ix < 0 ? -1 : 1;
      } else {
        player.anim = "idle";
      }
    }
    // Mouse aim facing is applied in startAttack / castSpell when clicks happen.

    // Ice slip (DST-ish / deerclops freeze payoff)
    if (tileAt(player.x, player.y) === T_ICE && (ix || iy)) {
      spd *= 0.88;
      ix += (player.facing || 1) * 0.35;
      const L2 = Math.hypot(ix, iy) || 1;
      ix /= L2; iy /= L2;
    }
    moveCircle(player, ix * spd * dt, iy * spd * dt);

    // carry pose when not mid-swing (pawn only)
    if (player.attacking <= 0 && player.form !== "warrior" && player.anim !== "guard") {
      if ((inv.wood || 0) >= 6) player.hold = "wood";
      else if ((inv.gold || 0) >= 4) player.hold = "gold";
      else if ((inv.meat || 0) + (inv.cooked || 0) >= 3) player.hold = "meat";
      else if (player.tool) player.hold = player.tool;
      else player.hold = null;
    }

    player.acc += dt;
    const atkN = player.atkFrames || 6;
    const fps = player.anim === "run" ? 10 : player.anim === "atk" ? 12 : player.anim === "guard" ? 6 : 8;
    const frames = player.anim === "run" ? 6 : player.anim === "atk" ? atkN : player.anim === "guard" ? 6 : 8;
    if (player.acc > 1 / fps) {
      player.acc = 0;
      player.frame = (player.frame + 1) % frames;
    }
    const hitFrame = Math.max(1, Math.floor(atkN * 0.45));
    if (player.attacking > 0 && !player._didHit && player.frame >= hitFrame) {
      player._didHit = true;
      if (player.form === "warrior" || player.tool === "sword") {
        const rank = player.warRank || 1;
        let dmg = (player.atkKind === 2 ? 24 : 20) + (rank >= 2 ? 6 : 0);
        if (player.buffPower > 0) dmg += 8;
        if (player._mighty) dmg = Math.floor(dmg * 1.35);
        if (player._wimpy) dmg = Math.floor(dmg * 0.7);
        meleeHit(player, 64, player.facing, dmg);
      } else {
        const tool = player.tool || "knife";
        if (tool === "knife") {
          let kd = 16 + (player.buffPower > 0 ? 6 : 0);
          if (player._mighty) kd = Math.floor(kd * 1.35);
          if (player._wimpy) kd = Math.floor(kd * 0.7);
          meleeHit(player, 52, player.facing, kd);
        } else if (tool === "hammer") {
          tryRepair(player.x, player.y, 56);
          meleeHit(player, 42, player.facing, 8);
        } else {
          tryHarvest(player.x, player.y, 56);
          meleeHit(player, 40, player.facing, 6);
        }
      }
    }

    // Clicks handled on mousedown (DST OnLeftClick / OnRightClick). Hold updates via onPrimaryHold.
    updateCursorHint();

    // DST: calories_per_day=75 / total_day_time → ~half of 150 hunger per day
    if (testMode) {
      player.hp = player.maxHp;
      player.mp = player.maxMp;
      player.hunger = player.maxHunger || 150;
      player.corr = 0;
      player.temp = 52;
      if (wetness) wetness.wet = 0;
      player._starveAcc = 0;
    } else {
    const seasonH = currentSeason();
    const dayLenH = (seasonH && seasonH.dayLen) || 170;
    const hungerRate = (75 / dayLenH) * ((seasonH && seasonH.hunger) || 1);
    let hRate = hungerRate + (rain > 0 ? hungerRate * 0.08 : 0);
    if (player.lumberjack) hRate *= 1.35;
    player.hunger = Math.max(0, player.hunger - dt * hRate);
    if (player.hunger <= 0) {
      player._starveAcc = (player._starveAcc || 0) + dt;
      if (player._starveAcc >= 1) {
        player._starveAcc = 0;
        hurt(player, 6, "hunger");
      }
    }

    {
      const tcM = Math.floor(player.x / TILE), trM = Math.floor(player.y / TILE);
      const Bref = window.OpenWorldGen && window.OpenWorldGen.BIOME;
      const onMagic = tileAt(player.x, player.y) === T_MAGIC
        || (biomes && Bref && inb(tcM, trM) && biomes[idx(tcM, trM)] === Bref.MAGIC);
      if (onMagic) player.corr = Math.min(100, player.corr + dt * (4.5 + (wetness.wet || 0) * 0.02));
    }

    const hungMul = player.hunger > (player.maxHunger || 150) * 0.8 ? 1.2 : player.hunger < 30 ? 0.45 : 1;
    player.mp = Math.min(player.maxMp, player.mp + dt * 11 * hungMul);

    const tc = Math.floor(player.x / TILE), tr = Math.floor(player.y / TILE);
    if (inb(tc, tr) && world.burn[idx(tc, tr)] > 0) hurt(player, 9 * dt, "fire");
    if (inb(tc, tr) && world.elec[idx(tc, tr)] > 0) hurt(player, 14 * dt, "lightning");
    } // end !testMode survival drains

    phantomCd -= dt;
    wormholeCd = Math.max(0, wormholeCd - dt);
    {
      const corr = player.corr || 0;
      // Tiered sanity shadows (DST-ish)
      if (corr > 35 && corr <= 65 && phantomCd <= 0 && rand() < dt * 0.15) {
        phantomCd = 10;
        floatText(player.x + (rand() - 0.5) * 80, player.y - 40, "……", "#a090d0");
      } else if (corr > 65 && corr <= 80 && phantomCd <= 0) {
        phantomCd = 22;
        const pt = pickOffscreenSpawn(300, 420, false) || { x: player.x + 320, y: player.y };
        const e = spawnEnemy("skull", pt.x, pt.y, true);
        if (e) { e.dmg = 5; e.hp = e.maxHp = 20; e.name = "虚影"; e.aggro = 280; e.speed *= 0.85; e.nightOnly = false; }
        toast("余光里掠过影子……", 2);
      } else if (corr > 80 && phantomCd <= 0) {
        phantomCd = isNight() ? 12 : 18;
        const n = (corr > 92 && isNight()) ? 2 : 1;
        for (let i = 0; i < n; i++) {
          const kind = isNight() ? (rand() < 0.45 ? "imp" : "skull") : "skull";
          const pt = pickOffscreenSpawn(320 + i * 40, 480 + i * 40, false);
          if (!pt) continue;
          const e = spawnEnemy(kind, pt.x, pt.y, true);
          if (e) {
            e.shadowCreep = true; e.phantom = true; e.nightOnly = false;
            e.name = "暗影"; e.aggro = 360; e.dmg = Math.max(6, (e.dmg || 8) - 2);
            e.hp = e.maxHp = Math.min(e.maxHp || 30, 28);
          }
        }
        toast(isNight() ? "暗影自夜雾中凝成形体！" : "理智崩溃……影子从黑暗里爬出来。", 3);
      }
    }

    interactHint = "";
    const nearMonk = monk && dist(player.x, player.y, monk.x, monk.y) < 70;
    const nearHouse = buildings.some((b) => (b.kind === "house" || b.tent || b.siesta) && dist(player.x, player.y, b.x, b.y) < 80);
    const nearF = nearestFire(70);
    const nearCorpseH = props.find((p) => p.kind === "corpse" && dist(player.x, player.y, p.x, p.y) < 56);
    const nearChest = props.find((p) => p.kind === "chest" && dist(player.x, player.y, p.x, p.y) < 56);
    const nearTrap = props.find((p) => p.kind === "trap" && dist(player.x, player.y, p.x, p.y) < 48);
    const nearBerry = props.find((p) => p.kind === "berry" && p.ripe && dist(player.x, player.y, p.x, p.y) < 52);
    const nearHive = props.find((p) => p.kind === "beehive" && (p.honeyLeft || 0) > 0 && dist(player.x, player.y, p.x, p.y) < 52);
    const nearMine = buildings.find((b) => b.kind === "goldMine" && dist(player.x, player.y, b.x, b.y) < 78);
    const nearCaveIn = !inCave && caveEntrance && dist(player.x, player.y, caveEntrance.x, caveEntrance.y) < 72;
    const nearCaveOut = inCave && caveInterior && dist(player.x, player.y, caveInterior.x, caveInterior.y) < 48;
    const boatPoint = onIsland && islandHub ? islandHub : boatDock;
    const seaPoint = onSeaIsland && seaIsland ? seaIsland : seaDock;
    const nearBoat = boatPoint && dist(player.x, player.y, boatPoint.x, boatPoint.y) < (onIsland ? 140 : 100);
    const nearFish = fishHut && dist(player.x, player.y, fishHut.x, fishHut.y) < 70;
    const nearSea = seaPoint && dist(player.x, player.y, seaPoint.x, seaPoint.y) < (onSeaIsland ? 140 : 100);
    const nearPot = buildings.some((b) => b.cook && dist(player.x, player.y, b.x, b.y) < 60);
    if (nearCorpseH) interactHint = "空格  取回尸体上的遗物";
    else if (pigKing && dist(player.x, player.y, pigKing.x, pigKing.y) < 80) interactHint = "空格  向猪王献上肉/饰品换金币";
    else if (nearMonk) interactHint = "空格  祈祷净化魔蚀（8 金币）";
    else if (nearSea) interactHint = onSeaIsland ? "空格  海马船返回" : "空格  乘海马船赴秘岛";
    else if (nearFish) interactHint = "空格  在渔棚垂钓";
    else if (nearBoat) interactHint = onIsland ? "空格  乘船返回大陆" : "空格  乘船前往离岛";
    else if (nearPot) interactHint = "空格  打开/关闭烹饪锅";
    else if (buildings.some((b) => b.bench && dist(player.x, player.y, b.x, b.y) < 70)) interactHint = "空格  科学机器勘测（5 金）";
    else if (nearCaveIn) interactHint = "空格  进入矿脉洞窟";
    else if (nearCaveOut) interactHint = "空格  离开洞窟，返回地面";
    else if (nearF) {
      if (roastJob) interactHint = "空格  烤制中 " + Math.ceil(Math.max(0, roastJob.need - roastJob.t)) + "s";
      else if (nearF.lit && ((inv.meat || 0) > 0 || (inv.fish || 0) > 0))
        interactHint = "空格  烤制生肉/鱼 · Shift+空格 添柴 · 燃料 " + Math.floor(nearF.fuel || 0);
      else interactHint = "空格  添柴 · 燃料 " + Math.floor(nearF.fuel || 0) + (nearF.lit ? "" : " · 已熄灭");
    }
    else if (nearChest) interactHint = "空格  打开/关闭木箱";
    else if (props.some((p) => p.kind === "meatrack" && dist(player.x, player.y, p.x, p.y) < 52)) {
      const rk = props.find((p) => p.kind === "meatrack" && dist(player.x, player.y, p.x, p.y) < 52);
      if (rk.drying === "done") interactHint = "空格  取下肉干";
      else if (rk.drying) interactHint = "晾晒中 " + Math.floor((rk.dryT / (rk.dryNeed || 55)) * 100) + "%";
      else interactHint = "空格  挂肉晾晒";
    }
    else if (buildings.some((b) => b.dock && dist(player.x, player.y, b.x, b.y) < 72)) interactHint = "空格  码头垂钓";
    else if (buildings.some((b) => b.boatkit && dist(player.x, player.y, b.x, b.y) < 70)) interactHint = "空格  驾船启航";
    else if (nearBerry) interactHint = "空格/F  采摘浆果丛";
    else if (props.some((p) => p.kind === "berry" && !p.ripe && dist(player.x, player.y, p.x, p.y) < 52)) interactHint = "浆果丛还在长";
    else if (nearHive) interactHint = "空格  取蜜（可能惊蜂）";
    else if (nearMine) interactHint = (nearMine.depleted || (nearMine.mineStock || 0) <= 0)
      ? "金矿枯竭（等待回填）"
      : "空格  开采金矿 · 余 " + (nearMine.mineStock || 0);
    else if (props.some((p) => p.kind === "wormhole" && dist(player.x, player.y, p.x, p.y) < 48)) interactHint = "空格  进入虫洞";
    else if (props.some((p) => p.kind === "molehole" && !p.dug && dist(player.x, player.y, p.x, p.y) < 48)) {
      interactHint = (inv.shovel || 0) > 0 ? "空格  用铲子掏鼹鼠洞" : "需要铲子才能掏洞";
    } else if (props.some((p) => p.kind === "grave" && !p.dug && dist(player.x, player.y, p.x, p.y) < 48)) {
      interactHint = (inv.shovel || 0) > 0 ? "空格  用铲子挖掘坟墓" : "需要铲子才能挖坟（科学机器解锁）";
    }
    else if (nearTrap) interactHint = "空格  放饵（肉）· " + (nearTrap.bait || 0);
    else if (nearHouse) {
      if (buildings.some((b) => b.siesta && dist(player.x, player.y, b.x, b.y) < 80))
        interactHint = "空格  遮阳棚小憩（白天降温）";
      else if (buildings.some((b) => b.tent && dist(player.x, player.y, b.x, b.y) < 80))
        interactHint = "空格  在帐篷歇息至黎明（消耗饥饿）";
      else interactHint = "空格  在小屋歇息至黎明（自动存档）";
    }
    else if (drops.some((d) => dist(player.x, player.y, d.x, d.y) < 48)) interactHint = "空格  拾取地上物品";
    else {
      const hv2 = nearestHarvestable(56);
      if (hv2) {
        const hh = propHit(hv2);
        if (dist(player.x, player.y, hh.x, hh.y) - hh.r * 0.35 <= 56) {
          interactHint = "空格/F  " + harvestVerb(hv2) + "（可按住）";
        }
      }
    }

    revealFog(player.x, player.y, 9);
    pickupNear();
    updateQuests();
    checkExploreQuest();
    if (player._winTimer > 0) {
      player._winTimer -= dt;
      if (player._winTimer <= 0) state = STATE.WIN;
    }
  }

  function checkExploreQuest() {
    const q = quests.find((x) => x.id === "explore");
    if (!q || q.done || !biomes || !window.OpenWorldGen) return;
    const B = window.OpenWorldGen.BIOME;
    const c = Math.floor(player.x / TILE), r = Math.floor(player.y / TILE);
    if (!inb(c, r)) return;
    const bi = biomes[idx(c, r)];
    if (bi === B.FOREST || bi === B.MINES) {
      q.done = true;
      toast("任务完成：踏足荒野", 3);
    }
  }

  function pickupNear() {
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      const dh = dropHit(d);
      if (dist(player.x, player.y, dh.x, dh.y) < 28 + dh.r) {
        if (d.kind === "wood") { gainItem("wood", 1); floatText(d.x, d.y, "+木材", "#c9843a"); }
        if (d.kind === "gold") { gainItem("gold", 1); floatText(d.x, d.y, "+金子", "#e8c44a"); }
        if (d.kind === "rocks") { gainItem("rocks", 1); floatText(d.x, d.y, "+石头", "#9ab0b8"); }
        if (d.kind === "meat") { gainItem("meat", 1); floatText(d.x, d.y, "+羊肉", "#e07070"); }
        if (d.kind === "berries") { gainItem("berries", 1); floatText(d.x, d.y, "+浆果", "#d45cff"); }
        if (d.kind === "twigs") { gainItem("twigs", 1); floatText(d.x, d.y, "+树枝", "#c4a060"); }
        if (d.kind === "grass") { gainItem("grass", 1); floatText(d.x, d.y, "+草", "#6ecf7a"); }
        if (d.kind === "flint") { gainItem("flint", 1); floatText(d.x, d.y, "+燧石", "#aaa"); }
        if (d.kind === "silk") { gainItem("silk", 1); floatText(d.x, d.y, "+丝绸", "#e8e0f0"); }
        if (d.kind === "seeds") { gainItem("seeds", 1); floatText(d.x, d.y, "+种子", "#cde"); }
        if (d.kind === "honey") { gainItem("honey", 1); floatText(d.x, d.y, "+蜜", "#ffe56a"); }
        if (d.kind === "trinket") { gainItem("trinket", 1); floatText(d.x, d.y, "+饰品", "#e8c44a"); }
        if (d.kind === "dung") { gainItem("dung", 1); floatText(d.x, d.y, "+粪", "#8a6a3a"); }
        if (d.kind === "monster") { gainItem("monster", 1); floatText(d.x, d.y, "+怪物肉", "#6a4a6a"); }
        if (d.kind === "rune_ice") { runes.ice = true; toast("获得冰霜符文：选 2 后按 C 施放。"); }
        if (d.kind === "rune_lightning") { runes.lightning = true; toast("获得雷霆符文：雨水与水域会传导电击。"); }
        drops.splice(i, 1);
      }
    }
  }

  function updateQuests() {
    // Keep tracking for save compat; no quest UI / completion toasts.
    for (const q of quests) {
      if (q.done || !q.check) continue;
      if (q.check()) q.done = true;
    }
  }

  function faceToward(x, y) {
    if (x !== player.x) player.facing = x < player.x ? -1 : 1;
  }

  /** DST Action: F/Space harvest nearest tree/rock/ore first, else interact/pickup. */
  function doActionNearby(opts) {
    opts = opts || {};
    if (cookOpen) { tryCookSlots(); return; }
    if (craftOpen || bagOpen || chestOpen) return;
    const harvestOnly = !!opts.harvestOnly;
    const harvest = nearestHarvestable(harvestOnly ? 78 : 70, { resourcesOnly: true })
      || (!harvestOnly ? nearestHarvestable(56) : null);
    const fire = nearestFire(52);
    if (harvest) {
      const h = propHit(harvest);
      const hd = dist(player.x, player.y, h.x, h.y) - h.r * 0.35;
      if (hd <= (harvestOnly ? 74 : 66)) {
        let preferHarvest = true;
        if (!harvestOnly && fire && !isResourceProp(harvest)) {
          const fd = dist(player.x, player.y, fire.x, fire.y);
          if (fd + 12 < hd) preferHarvest = false;
        }
        if (isResourceProp(harvest)) preferHarvest = true;
        if (!harvestOnly && !isResourceProp(harvest)) {
          const chest = props.find((p) => p.kind === "chest" && dist(player.x, player.y, p.x, p.y) < 52);
          if (chest && dist(player.x, player.y, chest.x, chest.y) + 10 < hd) preferHarvest = false;
        }
        if (preferHarvest || harvestOnly) {
          faceToward(harvest.x, harvest.y);
          doPrimaryAction({ type: "harvest", target: harvest, label: harvestVerb(harvest) });
          return;
        }
      }
    }
    if (harvestOnly) {
      toast("附近没有可采集的目标。", 1.2);
      return;
    }
    const nearDrop = drops.find((d) => dist(player.x, player.y, d.x, d.y) < 52);
    tryInteract();
    if (nearDrop) tryPickupOne(nearDrop);
  }

  function tryInteract() {
    if (pigKing && dist(player.x, player.y, pigKing.x, pigKing.y) < 80) {
      const before = inv.gold || 0;
      if (window.DstSys) window.DstSys.pigKingTrade(inv, toast);
      if ((inv.gold || 0) > before) {
        const q = quests.find((x) => x.id === "pigking");
        if (q && !q.done) { q.done = true; toast("任务完成：猪王交易", 3); }
      }
      return;
    }
    if (monk && dist(player.x, player.y, monk.x, monk.y) < 70) {
      if (inv.gold < 8 && player.corr > 1) { toast("僧侣需要 8 金币作为香火。"); return; }
      if (player.corr <= 1) { toast("你的灵魂此刻足够清澈。"); return; }
      inv.gold -= 8;
      player.corr = 0;
      player.hp = Math.min(player.maxHp, player.hp + 25);
      monk.anim = "heal"; monk.frame = 0; monk.acc = 0;
      burst(player.x, player.y - 20, "heal");
      quests.find((q) => q.id === "cleanse").done = true;
      toast("圣水洗过骨髓，魔蚀散去。");
      return;
    }
    const fire = nearestFire(78);
    if (fire) {
      // Relight cold firepit with wood even when fuel is 0
      if (!fire.lit && (fire.pit || fire.permanent) && (inv.wood || 0) > 0) {
        inv.wood--;
        fire.fuel = Math.min(120, (fire.fuel || 0) + 35);
        fire.lit = true;
        syncPrimaryFire();
        toast("重新点燃了火坑。", 2);
        return;
      }
      // Campfire roast (DST): cook raw meat/fish on the fire
      if (roastJob) {
        toast("还在烤……约 " + Math.ceil(Math.max(0, roastJob.need - roastJob.t)) + " 秒。", 1.5);
        return;
      }
      if (fire.lit && fire.fuel > 0 && ((inv.meat || 0) > 0 || (inv.fish || 0) > 0) && !keys.has("ShiftLeft") && !keys.has("ShiftRight")) {
        const fish = (inv.fish || 0) > 0 && ((inv.meat || 0) <= 0 || rand() < 0.5);
        if (fish) inv.fish--; else inv.meat--;
        roastJob = { t: 0, need: 3.2, out: "cooked", name: fish ? "烤鱼" : "烤肉" };
        toast("架上火边烤制……", 2);
        return;
      }
      if ((inv.charcoal || 0) > 0) {
        inv.charcoal--;
        fire.fuel = Math.min(160, (fire.fuel || 0) + 42);
        fire.lit = true;
        syncPrimaryFire();
        toast("添了木炭。燃料 " + Math.floor(fire.fuel));
        return;
      }
      if (inv.wood <= 0) { toast("没有木头/木炭可添柴。Shift+空格可强制添柴（若有肉则先烤）。"); return; }
      inv.wood--;
      fire.fuel = Math.min(140, (fire.fuel || 0) + 28);
      fire.lit = true;
      syncPrimaryFire();
      toast("添了一捆柴。燃料 " + Math.floor(fire.fuel));
      return;
    }
    const nearCorpse = props.find((p) => p.kind === "corpse" && dist(player.x, player.y, p.x, p.y) < 56);
    if (nearCorpse) {
      lootCorpse();
      return;
    }
    const rack = props.find((p) => p.kind === "meatrack" && dist(player.x, player.y, p.x, p.y) < 52);
    if (rack) {
      if (rack.drying === "done") {
        const was = rack.dryFrom || "meat";
        rack.drying = null;
        rack.dryT = 0;
        rack.dryFrom = null;
        gainItem("jerky", 1);
        if (was === "monster") {
          player.corr = Math.min(100, (player.corr || 0) + 3);
          toast("取下肉干（气味怪异，微损理智）。");
        } else if (was === "fish") toast("取下鱼干。");
        else toast("取下肉干。");
        return;
      }
      if (rack.drying) {
        toast("还在晾晒……" + Math.floor((rack.dryT / (rack.dryNeed || 55)) * 100) + "%");
        return;
      }
      if ((inv.meat || 0) <= 0 && (inv.monster || 0) <= 0 && (inv.fish || 0) <= 0) {
        toast("需要生肉/鱼挂上晾晒。");
        return;
      }
      if ((inv.meat || 0) > 0) { inv.meat--; rack.drying = "meat"; rack.dryFrom = "meat"; rack.dryNeed = 55; }
      else if ((inv.fish || 0) > 0) { inv.fish--; rack.drying = "fish"; rack.dryFrom = "fish"; rack.dryNeed = 48; }
      else { inv.monster--; rack.drying = "monster"; rack.dryFrom = "monster"; rack.dryNeed = 60; }
      rack.dryT = 0;
      toast(rack.drying === "fish" ? "挂上鱼晾晒（稍快）。" : rack.drying === "monster" ? "挂上怪物肉晾晒……" : "挂上生肉晾晒。");
      return;
    }
    const ownBoat = buildings.find((b) => b.boatkit && dist(player.x, player.y, b.x, b.y) < 70);
    if (ownBoat) {
      const pc = Math.floor(player.x / TILE), pr = Math.floor(player.y / TILE);
      let nearWater = false;
      for (let dy = -2; dy <= 2 && !nearWater; dy++) for (let dx = -2; dx <= 2; dx++) {
        if (inb(pc + dx, pr + dy) && world.tiles[idx(pc + dx, pr + dy)] === T_WATER) nearWater = true;
      }
      if (!nearWater && !nearDock(100)) { toast("把船放到岸边或码头再启航。"); return; }
      if (!islandHub) { toast("这片海没有离岛航线。"); return; }
      sailToIsland(ownBoat);
      if (ownBoat.grass) toast("草筏颠簸，航程更久。", 2);
      else if ((inv.oar || 0) > 0) toast("桨起风生，航程更稳。", 2);
      return;
    }
    const chest = props.find((p) => p.kind === "chest" && dist(player.x, player.y, p.x, p.y) < 56);
    if (chest) {
      chestOpen = chestOpen === chest ? null : chest;
      toast(chestOpen ? "打开木箱。点击物资存取。" : "关上木箱。");
      return;
    }
    const fridge = buildings.find((b) => b.icebox && dist(player.x, player.y, b.x, b.y) < 64);
    if (fridge) {
      if (!fridge.store) fridge.store = { meat: 0, cooked: 0, fish: 0, berries: 0, jam: 0, jerky: 0, feast: 0, meatpie: 0, honey: 0, seeds: 0 };
      chestOpen = chestOpen === fridge ? null : fridge;
      toast(chestOpen ? "打开冰箱。食物在此腐坏极慢。" : "关上冰箱。");
      return;
    }
    // Feed meat to hire village pigs
    {
      const pig = entities.find((e) => e.kind === "pig" && !e.dead && !e.hostile && dist(player.x, player.y, e.x, e.y) < 56);
      if (pig && (inv.meat || 0) > 0) {
        inv.meat--;
        pig.friend = true;
        pig.friendT = 180; // ~seconds of loyalty
        pig.name = "结交猪人";
        pig.speed = Math.max(pig.speed, 95);
        pig.dmg = 16;
        pig.aggro = 520;
        toast("猪人接过肉，愿意跟你走一阵。", 3);
        floatText(pig.x, pig.y - 36, "友好", "#7ecf6a");
        return;
      }
    }
    const trap = props.find((p) => p.kind === "trap" && !p.sprung && dist(player.x, player.y, p.x, p.y) < 48);
    if (trap) {
      if ((inv.meat || 0) > 0) { inv.meat--; toast("放上肉饵。"); }
      else if ((inv.berries || 0) > 0) { inv.berries--; toast("放上浆果饵（易捕鸟）。"); }
      else if ((inv.seeds || 0) > 0) { inv.seeds--; toast("放上种子饵（易捕鸟）。"); }
      else { toast("需要肉 / 浆果 / 种子作饵。"); return; }
      trap.bait = Math.min(3, (trap.bait || 0) + 1);
      toast("诱饵 ×" + trap.bait);
      return;
    }
    const hive = props.find((p) => p.kind === "beehive" && dist(player.x, player.y, p.x, p.y) < 52);
    if (hive && (hive.honeyLeft || 0) > 0) {
      hive.honeyLeft--;
      inv.honey = (inv.honey || 0) + 1;
      floatText(hive.x, hive.y - 30, "+蜜", "#ffe56a");
      const mad = hive.wasp ? 0.9 : 0.55;
      if (rand() < mad || hive.honeyLeft <= 0 || (hive.anger || 0) > 0) {
        hive.anger = (hive.anger || 0) + 1;
        const n = hive.wasp ? 2 : 1;
        for (let i = 0; i < n; i++) {
          const bee = spawnEnemy("bee", hive.x + (rand() - 0.5) * 40, hive.y + (rand() - 0.5) * 40, false);
          if (bee) {
            bee.homeX = hive.x; bee.homeY = hive.y;
            bee.passive = false;
            if (hive.wasp) { bee.aggro = Math.max(bee.aggro, 700); bee.dmg = 8; bee.name = "狂蜂"; bee.killer = true; }
          }
        }
        toast(hive.wasp ? "狂蜂巢被激怒！" : (hive.honeyLeft <= 0 ? "蜂巢空了，蜂群怒了！" : "惊动了刺蜂！"), 2.5);
        if (hive.queenish && (hive.anger || 0) >= 3 && !hive.queenSpawned) {
          hive.queenSpawned = true;
          const q = spawnEnemy("bat_queen", hive.x + 40, hive.y - 20, false);
          if (q) {
            q.beeQueen = true; q.boss = true; q.name = "蜂后";
            q.hp = q.maxHp = 280; q.dmg = 18; q.aggro = 820;
            q.homeX = hive.x; q.homeY = hive.y; q.nightOnly = false; q.passive = false;
          }
          for (let k = 0; k < 4; k++) {
            const bee = spawnEnemy("bee", hive.x + (rand() - 0.5) * 80, hive.y + (rand() - 0.5) * 80, false);
            if (bee) { bee.killer = true; bee.passive = false; bee.name = "狂蜂"; bee.aggro = 700; bee.dmg = 9; bee.homeX = hive.x; bee.homeY = hive.y; }
          }
          toast("蜂后苏醒！蜂群倾巢而出！", 5);
        }
      } else toast("舀到一勺蜂蜜。");
      return;
    }
    // Gold mine building harvest
    const gm = buildings.find((b) => b.kind === "goldMine" && dist(player.x, player.y, b.x, b.y) < 78);
    if (gm) {
      if ((gm.mineStock || 0) <= 0) {
        toast("矿脉枯竭了，等待回填……", 2);
        return;
      }
      if (toolDur && window.DstSys) window.DstSys.useTool(toolDur, "pickaxe", toast);
      gm.mineStock--;
      gainItem("gold", 1);
      if (rand() < 0.3) gainItem("flint", 1);
      floatText(gm.x, gm.y - 40, "+金", "#e8c44a");
      burst(gm.x, gm.y - 20, "dust");
      if (gm.mineStock <= 0) {
        gm.depleted = true;
        gm.regen = 0;
        gm.img = imgs.goldMineOff || imgs.goldMineDead || gm.img;
        toast("金矿采空了。过些日子会重新富集。", 3);
      } else toast("开采金矿 · 余量 " + gm.mineStock, 1.5);
      return;
    }
    const hole = props.find((p) => p.kind === "wormhole" && dist(player.x, player.y, p.x, p.y) < 48);
    if (hole && hole.pair) {
      if (wormholeCd > 0) { toast("虫洞还在痉挛……稍等。"); return; }
      player.x = hole.pair.x;
      player.y = hole.pair.y + 40;
      player.corr = Math.min(100, player.corr + 6);
      wormholeCd = 4;
      toast("穿过虫洞……神智一阵发麻。", 2.5);
      burst(player.x, player.y, "heal");
      return;
    }
    const mole = props.find((p) => p.kind === "molehole" && !p.dug && dist(player.x, player.y, p.x, p.y) < 48);
    if (mole) {
      if ((inv.shovel || 0) <= 0) { toast("需要铲子才能掏鼹鼠洞。"); return; }
      mole.dug = true;
      if (toolDur && window.DstSys) window.DstSys.useTool(toolDur, "shovel", toast);
      if (rand() < 0.45) { gainItem("gold", 1); toast("掏出一点矿金。"); }
      else if (rand() < 0.5) { gainItem("flint", 1); toast("掏出燧石。"); }
      else if (rand() < 0.4) { gainItem("seeds", 1); toast("掏出几粒种子。"); }
      else toast("洞里空空如也。");
      if (rand() < 0.4) {
        const bat = spawnEnemy("bat", mole.x + (rand() - 0.5) * 30, mole.y + (rand() - 0.5) * 30, false);
        if (bat) {
          bat.nightOnly = false; bat.lightFlee = true;
          bat.homeX = mole.x; bat.homeY = mole.y;
          bat.passive = false; bat._provoked = true;
          bat.aggro = Math.max(bat.aggro, 560);
          toast("洞中扑出惧火的巨蝠！", 2);
        }
      }
      burst(mole.x, mole.y, "dust");
      return;
    }
    const grave = props.find((p) => p.kind === "grave" && !p.dug && dist(player.x, player.y, p.x, p.y) < 48);
    if (grave) {
      if ((inv.shovel || 0) <= 0) { toast("需要铲子（科学机器旁制作）。"); return; }
      grave.dug = true;
      if (toolDur && window.DstSys) window.DstSys.useTool(toolDur, "shovel", toast);
      if (rand() < 0.55) { gainItem("trinket", 1); toast("挖出一件小饰品。可拿去猪王处换金。"); }
      else if (rand() < 0.5) { gainItem("gold", 1); toast("挖出一点金子。"); }
      else toast("空坟一座。");
      player.corr = Math.min(100, (player.corr || 0) + 8);
      burst(grave.x, grave.y, "dust");
      return;
    }
    const toolProp = props.find((p) => (p.kind === "tool" || p.kind === "crate") && !p.gone && dist(player.x, player.y, p.x, p.y) < 52);
    if (toolProp) {
      toolProp.gone = true;
      if (toolProp.kind === "tool") {
        spawnPickup(toolProp.x, toolProp.y, rand() < 0.5 ? "flint" : "twigs");
        toast("捡到了散落工具的零件。", 1.6);
      } else {
        const loot = ["wood", "gold", "meat"][irand(0, 2)];
        spawnPickup(toolProp.x, toolProp.y, loot);
        if (rand() < 0.4) spawnPickup(toolProp.x + 10, toolProp.y, "twigs");
        toast("砸开了资源箱。", 1.6);
      }
      burst(toolProp.x, toolProp.y, "dust");
      props.splice(0, props.length, ...props.filter((p) => !p.gone));
      return;
    }
    const stump = props.find((p) => p.kind === "stump" && !p.dug && dist(player.x, player.y, p.x, p.y) < 52);
    if (stump) {
      if ((inv.shovel || 0) <= 0) { toast("需要铲子挖树桩。"); return; }
      stump.dug = true;
      stump.gone = true;
      if (toolDur && window.DstSys) window.DstSys.useTool(toolDur, "shovel", toast);
      spawnPickup(stump.x, stump.y, "twigs");
      if (rand() < 0.55) spawnPickup(stump.x + 8, stump.y, "seeds");
      if (stump.burnt && rand() < 0.4) spawnPickup(stump.x - 6, stump.y, "charcoal");
      toast("挖掉树桩，腾出空地。", 2);
      burst(stump.x, stump.y, "dust");
      props.splice(0, props.length, ...props.filter((p) => !p.gone));
      return;
    }
    {
      const sp = onSeaIsland && seaIsland ? seaIsland : seaDock;
      if (sp && dist(player.x, player.y, sp.x, sp.y) < (onSeaIsland ? 140 : 100)) {
        sailToSeaIsland();
        return;
      }
    }
    if (fishHut && dist(player.x, player.y, fishHut.x, fishHut.y) < 70) {
      tryFish(fishHut);
      return;
    }
    {
      const dock = buildings.find((b) => b.dock && dist(player.x, player.y, b.x, b.y) < 72);
      if (dock) { tryFish(dock); return; }
    }
    {
      const bp = onIsland && islandHub ? islandHub : boatDock;
      if (bp && dist(player.x, player.y, bp.x, bp.y) < (onIsland ? 140 : 100)) {
        sailToIsland();
        return;
      }
    }
    const pot = buildings.find((b) => b.cook && dist(player.x, player.y, b.x, b.y) < 60);
    if (pot) {
      cookOpen = !cookOpen;
      craftOpen = false;
      toast(cookOpen ? "打开烹饪锅。" : "离开烹饪锅。");
      return;
    }
    const bench = buildings.find((b) => b.bench && dist(player.x, player.y, b.x, b.y) < 70);
    if (bench) {
      if (inv.gold < 5) { toast("勘测需要 5 金币。"); return; }
      inv.gold -= 5;
      revealFog(player.x, player.y, 28);
      buildMinimap();
      toast("舆图铺开，大片迷雾散去。", 3);
      return;
    }
    if (!inCave && caveEntrance && dist(player.x, player.y, caveEntrance.x, caveEntrance.y) < 72) {
      enterCave();
      return;
    }
    if (inCave && caveInterior && dist(player.x, player.y, caveInterior.x, caveInterior.y) < 48) {
      exitCave();
      return;
    }
    const farmP = props.find((p) => p.kind === "farm" && dist(player.x, player.y, p.x, p.y) < 52);
    if (farmP) {
      if (!farmP.planted) {
        if ((inv.carrot_seed || 0) > 0) {
          inv.carrot_seed--;
          farmP.cropType = "carrot";
        } else if ((inv.seeds || 0) > 0) {
          inv.seeds--;
          farmP.cropType = "berry";
        } else if ((inv.berries || 0) > 0) {
          inv.berries--;
          farmP.cropType = "berry";
        } else { toast("需要浆果苗 / 胡萝卜种 / 浆果才能播种。"); return; }
        farmP.planted = true; farmP.stage = 0; farmP.grow = 0; farmP.fert = 0;
        toast((farmP.cropType === "carrot" ? "播下了胡萝卜。" : "播下了浆果苗。") + "可施肥加速。");
        return;
      }
      if (farmP.stage >= 3) {
        const crop = farmP.cropType || "berry";
        const fertBonus = (farmP.fert || 0) > 0 ? 1 : 0;
        farmP.planted = false; farmP.stage = 0; farmP.grow = 0; farmP.fert = 0; farmP.cropType = null;
        if (crop === "carrot") {
          inv.carrot = (inv.carrot || 0) + 2 + irand(0, 2) + fertBonus;
          if (rand() < 0.3) inv.carrot_seed = (inv.carrot_seed || 0) + 1;
          toast("收获了胡萝卜。");
        } else {
          inv.berries = (inv.berries || 0) + 2 + irand(0, 2) + fertBonus;
          if (rand() < 0.35) inv.seeds = (inv.seeds || 0) + 1;
          toast("收获了浆果。");
        }
        return;
      }
      if ((inv.dung || 0) > 0 && (farmP.fert || 0) < 2) {
        inv.dung--;
        farmP.fert = (farmP.fert || 0) + 1;
        farmP.grow = (farmP.grow || 0) + 18;
        toast("施了肥，作物长得更快。", 2);
        return;
      }
      const need = 35;
      const pct = Math.min(99, Math.floor(((farmP.grow || 0) / need) * 100));
      toast("作物生长中 · 阶段 " + (farmP.stage + 1) + "/3 · " + pct + "%" + ((farmP.fert || 0) ? " · 已施肥" : " · 空格施肥"), 2.5);
      return;
    }
    const siesta = buildings.find((b) => b.siesta && dist(player.x, player.y, b.x, b.y) < 80);
    if (siesta) {
      if (isNight()) { toast("遮阳棚适合白天小憩。"); return; }
      if (player.hunger < 20) { toast("太饿了，先吃点东西。"); return; }
      dayT = Math.min(0.95, dayT + 0.22);
      player.hp = Math.min(player.maxHp, player.hp + 15);
      player.hunger = Math.max(5, player.hunger - 12);
      player.temp = Math.max(35, (player.temp || 55) - 18);
      player.corr = Math.max(0, player.corr - 6);
      toast("小憩一阵，暑气消了些。");
      return;
    }
    const tent = buildings.find((b) => b.tent && dist(player.x, player.y, b.x, b.y) < 80);
    if (tent) {
      if (!isNight()) { toast("帐篷适合夜里歇息。"); return; }
      if (player.hunger < 35) { toast("太饿了，撑不到天亮。"); return; }
      dayT = 0.08;
      player.hp = Math.min(player.maxHp, player.hp + 55);
      player.hunger = Math.max(10, player.hunger - 28);
      player.corr = Math.max(0, player.corr - 12);
      saveGame(true);
      toast("你在帐篷睡到了黎明。（已自动存档）");
      return;
    }
    const house = buildings.find((b) => b.kind === "house" && dist(player.x, player.y, b.x, b.y) < 80);
    if (house) {
      if (!isNight()) { toast("现在是白昼，先去探索吧。"); return; }
      dayT = 0.08;
      player.hp = Math.min(player.maxHp, player.hp + 40);
      player.hunger = Math.min(player.maxHunger || 150, player.hunger + 18);
      saveGame(true);
      toast("你在小屋睡到了黎明。（已自动存档）");
    }
  }


  function sailToSeaIsland() {
    if (!seaIsland || !seaDock) return;
    if (sailJob) return;
    const going = !onSeaIsland;
    const need = 2.2 + ((inv.oar || 0) > 0 ? -0.4 : 0);
    sailJob = {
      t: 0, need: Math.max(1.4, need),
      x: going ? seaIsland.x : seaDock.x,
      y: going ? seaIsland.y + 40 : seaDock.y - 40,
      setSea: going, setIsland: false,
      msg: going ? "秘岛雾气沉沉。靠近岛上的海马船可返回。" : "海马船载你回到西岸。",
      questSea: going,
    };
    toast(going ? "启航驶向秘岛……" : "启航返回西岸……", 2);
    clearMoveTarget();
  }

  function tryFish(spot) {
    spot = spot || fishHut;
    if (!spot) return;
    const now = time;
    const cd = spot.dock ? 3.2 : 4;
    if ((spot.lastFish || 0) + cd > now) {
      toast("鱼线还在晃，再等等。");
      return;
    }
    spot.lastFish = now;
    const miss = spot.dock ? 0.14 : 0.22;
    if (rand() < miss) {
      toast("一条溜了……");
      burst(spot.x, spot.y - 20, "dust");
      return;
    }
    inv.fish = (inv.fish || 0) + 1;
    if (spot.dock && wetness) wetness.wet = Math.max(0, (wetness.wet || 0) - 4);
    floatText(spot.x, spot.y - 40, "+鱼", "#7ec8ff");
    burst(spot.x, spot.y - 16, "heal");
    const q = quests.find((x) => x.id === "fish");
    if (q && !q.done) { q.done = true; toast("钓到了！可进炖锅烤成鱼肉。", 3); }
    else toast(spot.dock ? "码头钓到一条鱼。" : "钓到一条鱼。炖锅可烤。");
  }

  function sailToIsland(boat) {
    if (!islandHub || !boatDock) return;
    if (sailJob) return;
    const going = !onIsland;
    const grass = !!(boat && boat.grass);
    let need = 2.8 + ((inv.oar || 0) > 0 ? -0.5 : 0) + ((inv.mast || 0) > 0 ? -0.4 : 0);
    if (grass) need += 1.1;
    if (nearDock(100) && !grass) need -= 0.55;
    else if (nearDock(100) && grass) need -= 0.2;
    if (rain > 0) need *= grass ? 1.4 : 1.25;
    sailJob = {
      t: 0, need: Math.max(1.4, need),
      x: going ? islandHub.x : boatDock.x,
      y: going ? islandHub.y + 50 : boatDock.y - 40,
      setIsland: going, setSea: false,
      msg: going ? (grass ? "草筏晃向离岛……" : "小船驶向离岛。靠近岛上的船可返回大陆。") : "船靠回大陆岸边。",
      questIsland: going,
      mast: (inv.mast || 0) > 0 && !grass,
      anchor: (inv.anchor || 0) > 0,
      grass,
    };
    toast(going ? (nearDock(100) ? "自码头启航……" : "启航……海风扑面。") : "返航大陆……", 2);
    clearMoveTarget();
    if (window.DstAudio && window.DstAudio.sail) window.DstAudio.sail();
  }

  function updateSailJob(dt) {
    if (!sailJob) return;
    sailJob.t += dt;
    const bob = sailJob.anchor ? 1.5 : 4;
    player.x += Math.sin(time * 6) * bob * dt;
    player.y += Math.cos(time * 5) * (bob * 0.75) * dt;
    if (sailJob.t < sailJob.need) return;
    const j = sailJob;
    sailJob = null;
    onIsland = !!j.setIsland;
    onSeaIsland = !!j.setSea;
    player.x = j.x;
    player.y = j.y;
    if (j.questIsland) {
      const iq = quests.find((x) => x.id === "island");
      if (iq && !iq.done) { iq.done = true; toast("任务完成：乘船离岛", 3); }
    }
    if (j.questSea) {
      const q = quests.find((x) => x.id === "sea");
      if (q) q.done = true;
    }
    if (j.mast) {
      player.corr = Math.max(0, player.corr - 8);
      toast("风帆鼓起，旅途心安。", 2);
    }
    if (j.grass && wetness) wetness.wet = Math.min(100, (wetness.wet || 0) + 12);
    if (j.anchor && rand() < (j.grass ? 0.28 : 0.5)) {
      gainItem("fish", 1);
      toast("抛锚时捞到一条鱼。", 2);
    }
    toast(j.msg, 3.5);
  }

  function enterCave() {
    if (!caveInterior || !caveEntrance) return;
    overworldReturn = { x: player.x, y: player.y };
    player.x = caveInterior.x;
    player.y = caveInterior.y - 40;
    inCave = true;
    clearMoveTarget();
    const q = quests.find((x) => x.id === "cave");
    if (q && !q.done) { q.done = true; toast("任务完成：矿脉洞窟", 3); }
    toast("多厅洞窟：蝠穴·矿脉厅·蛛巢廊·深层。回到绳索处空格离开。", 5);
    if (window.DstAudio && window.DstAudio.cave) window.DstAudio.cave();
  }

  function exitCave() {
    inCave = false;
    clearMoveTarget();
    if (overworldReturn) {
      player.x = overworldReturn.x;
      player.y = overworldReturn.y;
    } else if (caveEntrance) {
      player.x = caveEntrance.x;
      player.y = caveEntrance.y + 50;
    }
    overworldReturn = null;
    toast("你爬回了地面。", 2.5);
    if (window.DstAudio && window.DstAudio.day) window.DstAudio.day();
  }

  function getLights() {
    const lights = [];
    for (const f of fires) {
      if (f.lit && f.fuel > 0) lights.push({ x: f.x, y: f.y, r: 70 + f.fuel * 1.1, warm: true });
    }
    if (player && player.torchOn) {
      if ((inv.lantern || 0) > 0) lights.push({ x: player.x, y: player.y - 8, r: 150, warm: true });
      else if (inv.torch > 0) lights.push({ x: player.x, y: player.y - 8, r: 115, warm: true });
    }
    for (const e of entities) {
      if (e.dead) continue;
      if (e.kind === "torch_goblin") lights.push({ x: e.x, y: e.y - 6, r: 72, warm: true });
    }
    return lights;
  }

  function lightAt(x, y) {
    let best = 0;
    for (const L of getLights()) {
      const d = dist(x, y, L.x, L.y);
      if (d < L.r) best = Math.max(best, 1 - d / L.r);
    }
    return best;
  }

  function setForm(form, silent) {
    if (!player) return;
    if (form === "warrior" && !inv.warKit) {
      toast("还没有成套武装。Tab 合成。");
      return;
    }
    player.form = form === "warrior" ? "warrior" : "pawn";
    player.attacking = 0;
    player.anim = "idle";
    player.frame = 0;
    if (player.form === "warrior") {
      player.hold = null;
      player.tool = "sword";
      if (!silent) {
        burst(player.x, player.y - 10, "dust");
        toast("武装形态：剑术连招，采集请按 Q 卸甲。", 2.8);
      }
    } else {
      player.tool = "axe";
      if (!silent) {
        burst(player.x, player.y - 10, "dust");
        toast("工匠形态：斧镐刀锤待命。", 2.5);
      }
    }
  }

  function toggleForm() {
    if (!inv.warKit) { toast("先合成「成套武装」。"); return; }
    if (player.attacking > 0) return;
    setForm(player.form === "warrior" ? "pawn" : "warrior");
  }

  function craftCtx() {
    return {
      inv, player, campfire, toast,
      spawnFence, placeAhead, nearestFire, syncPrimaryFire, setForm, summonAbigail,
      repairTools() {
        if (!toolDur && window.DstSys) toolDur = window.DstSys.createTools();
        if (!toolDur) return;
        for (const k of Object.keys(toolDur)) toolDur[k].uses = toolDur[k].max;
      },
      nearBench() {
        return buildings.some((b) => b.bench && dist(player.x, player.y, b.x, b.y) < 90);
      },
      nearAlchemy() {
        return buildings.some((b) => b.alchemy && dist(player.x, player.y, b.x, b.y) < 100);
      },
      nearShadow() {
        return buildings.some((b) => b.shadow && dist(player.x, player.y, b.x, b.y) < 100);
      },
      nearSeaKit() {
        return buildings.some((b) => b.seakit && dist(player.x, player.y, b.x, b.y) < 100);
      },
      /** DST prototyper: must stand near science / magic stations */
      hasScience(level) {
        if (level <= 1) return this.nearBench() || this.nearAlchemy();
        if (level <= 2) return this.nearAlchemy();
        return false;
      },
      hasMagic(level) {
        if (level <= 2) return this.nearShadow();
        return false;
      },
      repairTool(kind) {
        if (!toolDur) toolDur = window.DstSys.createTools();
        if (toolDur[kind]) { toolDur[kind].uses = toolDur[kind].max; }
        toast((kind === "axe" ? "斧头" : kind === "pickaxe" ? "镐子" : "工具") + "耐久已满。");
      },
      seasonId: (currentSeason() || {}).id,
    };
  }

  function canAfford(cost) {
    for (const [k, n] of Object.entries(cost || {})) {
      if ((inv[k] || 0) < n) return false;
    }
    return true;
  }

  function payCost(cost) {
    for (const [k, n] of Object.entries(cost || {})) inv[k] = (inv[k] || 0) - n;
    if (window.DstSys) window.DstSys.clampInv(inv);
  }

  function gainItem(key, n) {
    inv[key] = (inv[key] || 0) + (n || 1);
    if (window.DstSys) {
      window.DstSys.ensureSpoil(inv);
      window.DstSys.clampInv(inv, toast);
    }
  }

  function tryCraft(recipe) {
    if (!recipe) return;
    if (recipe.nearFire && !nearestFire(90)) {
      toast("需要靠近营火。");
      return;
    }
    const ctx = craftCtx();
    // DST TECH gates (prototype near station, or already unlocked)
    if (recipe.science === 1 && !ctx.hasScience(1)) {
      toast("需要靠近科学机器（或已研究过一级科学）。");
      return;
    }
    if (recipe.science === 2 && !ctx.hasScience(2)) {
      toast("需要靠近炼金引擎（二级科学）。");
      return;
    }
    if (recipe.magic === 2 && !ctx.hasMagic(2)) {
      toast("需要暗影操控器（魔法科技）。");
      return;
    }
    if (recipe.char && player && player.charId !== recipe.char) {
      toast("这是专属配方，当前角色无法制作。");
      return;
    }
    if (!canAfford(recipe.cost)) { toast("材料不足。"); return; }
    payCost(recipe.cost);
    const ok = recipe.craft(ctx);
    if (ok === false) {
      for (const [k, n] of Object.entries(recipe.cost || {})) inv[k] = (inv[k] || 0) + n;
    } else {
      if (window.DstSys) window.DstSys.clampInv(inv, toast);
      if (window.DstAudio) window.DstAudio.craft();
    }
  }

  function currentSeason() {
    if (!window.SeasonSys) return { id: "spring", name: "春", dayLen: 180, nightAt: 0.62, ambient: 50, hunger: 1, fuel: 1, rainChance: 1, raid: 1, tint: [40, 80, 60] };
    return window.SeasonSys.seasonAt(seasonT);
  }

  function isNight() {
    const s = currentSeason();
    return dayT > (s.nightAt || 0.62);
  }

  function isFullMoon() {
    // kept for ambience UI; pigs no longer transform on full moon
    if (!isNight()) return false;
    const s = currentSeason();
    const dayLen = (s && s.dayLen) || 170;
    const dayIdx = Math.floor(seasonT / dayLen);
    return dayIdx % 8 === 0;
  }

  function enragePig(e, reason) {
    if (!e || e.dead || e.kind !== "pig" || e.friend) return;
    e.werepig = true; e.hostile = true; e.enemy = true; e.animal = false;
    e.dmg = 18; e.aggro = 640; e.speed = Math.max(e.speed || 80, 108);
    e.name = "狂战士猪人";
    e._enrageReason = reason || "rage";
  }

  function calmPig(e) {
    if (!e || e.kind !== "pig" || !e.werepig) return;
    e.werepig = false; e.hostile = false; e.enemy = false; e.animal = true;
    e.name = "猪人"; e.dmg = 14; e.aggro = 0; e.speed = 70;
    if (e.hut) { e.homeX = e.hut.x; e.homeY = e.hut.y; }
  }

  function updateSurvival(dt) {
    const season = currentSeason();
    seasonId = season.id;
    if (seasonId !== wasSeasonId) {
      toast("季节更替：" + season.name + "。", 3.5);
      if (seasonId === "winter" && imgs.deadTree) {
        let n = 0;
        for (const p of props) {
          if (p.kind === "tree" && rand() < 0.22) {
            p._summerImg = p.img;
            p._summerFw = p.fw; p._summerFh = p.fh; p._summerFrames = p.frames;
            p.img = imgs.deadTree;
            const dsm = treeSheetFor(imgs.deadTree);
            p.fw = dsm.fw; p.fh = dsm.fh; p.frames = dsm.frames;
            n++;
          }
        }
        if (n) toast("寒霜抽干了部分树木。", 2.5);
      }
      if (wasSeasonId === "winter") {
        for (const p of props) {
          if (p.kind === "tree" && p._summerImg) {
            p.img = p._summerImg;
            p.fw = p._summerFw || 192;
            p.fh = p._summerFh || 256;
            p.frames = p._summerFrames || 8;
          }
        }
      }
      wasSeasonId = seasonId;
    }

    const night = isNight();
    let anyWentOut = false;
    let burn = (night ? 1.15 : 0.32) * (season.fuel || 1);
    if (rain > 0) burn *= 1.55; // DST: rain eats campfire fuel
    for (const f of fires) {
      if (!f.lit) continue;
      let rate = f.pit ? burn * 0.28 : burn;
      if (f.pit && rain > 0) rate *= 0.45; // firepit resists rain better than campfire
      f.fuel = Math.max(0, (f.fuel || 0) - dt * rate);
      if (f.fuel <= 0) {
        f.fuel = 0; f.lit = false;
        if (!f.pit && !f.permanent) anyWentOut = true;
      }
    }
    syncPrimaryFire();
    if (anyWentOut && night) toast("有营火熄灭了！", 2.5);
    // pit can be dark but remains placeable to relight

    if (night && !wasNight) {
      if (isFullMoon()) toast("满月高悬，阴影拉长……", 3);
      else toast(season.freeze ? "寒夜降临。离火一步都危险。" : "夜幕降临。待在火光里，或点燃火把。", 3.5);
      // Pig berserk: high corruption aura or nearby unlit village — not lunar lycanthropy
      let pigRage = 0;
      if ((player.corr || 0) >= 72) {
        for (const e of entities) {
          if (e.kind !== "pig" || e.dead || e.friend) continue;
          if (dist(e.x, e.y, player.x, player.y) < 520) { enragePig(e, "corr"); pigRage++; }
        }
        if (pigRage) toast("魔蚀气息激怒了附近的猪人！", 3.5);
      }
      for (const e of entities) {
        if (e.kind !== "pig" || e.dead || e.friend || e.werepig || !e.hut) continue;
        const hut = e.hut;
        const nearFire = fires.some((f) => f.lit && dist(f.x, f.y, hut.x, hut.y) < 160);
        if (!nearFire && dist(player.x, player.y, hut.x, hut.y) < 280) {
          enragePig(e, "darkhut"); pigRage++;
        }
      }
      if (pigRage && (player.corr || 0) < 72) toast("熄火的猪村陷入恐慌暴动！", 3.2);
      if (window.DstAudio) window.DstAudio.night();
      raidCd = 6 + rand() * 6;
    }
    if (!night && wasNight) {
      for (const e of entities) {
        if (e.kind !== "pig" || !e.werepig) continue;
        // corruption-frenzy lasts into day until corr drops; darkhut calms at dawn
        if (e._enrageReason === "corr" && (player.corr || 0) >= 55) continue;
        calmPig(e);
      }
      for (let i = entities.length - 1; i >= 0; i--) {
        const e = entities[i];
        if (e.raid && e.nightOnly && !e.caveDweller && e.enemy && !e.dead && dist(e.x, e.y, player.x, player.y) > 380) {
          entities.splice(i, 1);
        }
      }
      toast("黎明到了。", 2);
      if (window.DstAudio && window.DstAudio.day) window.DstAudio.day();
    }
    wasNight = night;

    // Continuous food spoil (DST perish) + fridge / season / wet multipliers
    if (window.DstSys) {
      const dayLen = season.dayLen || 180;
      const nearIce = buildings.some((b) => b.icebox && dist(player.x, player.y, b.x, b.y) < 90);
      let spoilMul = 1;
      if (nearIce) spoilMul *= 0.35;
      if (season.id === "summer") spoilMul *= 1.25;
      if (season.id === "winter") spoilMul *= 0.75;
      if ((wetness.wet || 0) > 50) spoilMul *= 1.3;
      window.DstSys.updateSpoil(inv, dt / dayLen, spoilMul, toast);
      // Foods inside icebox perish much slower (true fridge)
      for (const b of buildings) {
        if (!b.icebox || !b.store) continue;
        const fake = Object.assign({}, b.store, { _spoil: b._spoil || (b._spoil = {}) });
        // mirror counts into fake inv shape
        const boxInv = { _spoil: b._spoil };
        for (const k of Object.keys(b.store)) boxInv[k] = b.store[k] || 0;
        window.DstSys.updateSpoil(boxInv, dt / dayLen, 0.2, null);
        for (const k of Object.keys(b.store)) b.store[k] = boxInv[k] || 0;
        b._spoil = boxInv._spoil;
      }
      window.DstSys.clampInv(inv);
    }

    // Meatrack drying (DST-ish: ~half day)
    {
      const dayLenD = (season.dayLen || 170);
      for (const p of props) {
        if (p.kind !== "meatrack" || !p.drying || p.drying === "done") continue;
        p.dryNeed = p.dryNeed || 55;
        p.dryT = (p.dryT || 0) + dt;
        // rain slows drying
        if (rain > 0) p.dryT -= dt * 0.4;
        if (p.dryT >= p.dryNeed) {
          p.drying = "done";
          p.dryT = p.dryNeed;
          floatText(p.x, p.y - 40, "肉干好了", "#e8c44a");
        }
      }
    }

    const lit = lightAt(player.x, player.y);
    // Warmstone (heatrock): charge by fire, cool by endo / ambient
    if ((inv.warmstone || 0) > 0) {
      const nearEndo = fires.some((f) => f.endo && f.lit && (f.fuel || 0) > 0 && dist(player.x, player.y, f.x, f.y) < 90);
      const nearLit = fires.some((f) => !f.endo && f.lit && (f.fuel || 0) > 0 && dist(player.x, player.y, f.x, f.y) < 90);
      if (nearEndo) warmstoneHeat = Math.max(0, warmstoneHeat - dt * 18);
      else if (nearLit) warmstoneHeat = Math.min(100, warmstoneHeat + dt * 14);
      else {
        // drifts toward ambient comfort
        const drift = season.overheat ? 4 : (season.freeze ? -6 : -2);
        warmstoneHeat = Math.max(0, Math.min(100, warmstoneHeat + dt * drift * 0.35));
      }
    } else warmstoneHeat = Math.max(0, warmstoneHeat - dt * 8);

    // Temperature
    if (window.SeasonSys) {
      const wetV = wetness && wetness.wet || 0;
      let target = window.SeasonSys.comfortTarget(
        season, lit, night,
        player.torchOn && ((inv.lantern || 0) > 0 || inv.torch > 0),
        inCave, wetV, rain > 0
      );
      if ((inv.warmstone || 0) > 0) {
        const bonus = (warmstoneHeat / 100) * 22 - (season.overheat ? (100 - warmstoneHeat) / 100 * 8 : 0);
        target = Math.max(0, Math.min(100, target + bonus));
      }
      if (player.buffWarm > 0) target = Math.min(100, target + 22);
      if (player.buffCool > 0) target = Math.max(0, target - 20);
      if ((inv.winterhat || 0) > 0 && target < 50) target = Math.min(58, target + 14);
      player.temp += (target - player.temp) * Math.min(1, dt * 0.55);
    }
    // Soaked torch sputters
    if (player.torchOn && (wetness.wet || 0) > 55 && (inv.lantern || 0) <= 0 && rand() < dt * 0.08) {
      player.torchOn = false;
      toast("火把被雨水浇灭了。", 2);
    }
    if (player.temp < 22) {
      player._freezeAcc = (player._freezeAcc || 0) + dt;
      if (player._freezeAcc >= 2) {
        player._freezeAcc = 0;
        hurt(player, 4 + (season.freeze ? 3 : 0), "cold");
        floatText(player.x, player.y - 36, "寒冷", "#9cf");
      }
      player.hunger = Math.max(0, player.hunger - dt * 0.12);
    } else player._freezeAcc = 0;
    if (player.temp > 82 && season.overheat) {
      player._heatAcc = (player._heatAcc || 0) + dt;
      if (player._heatAcc >= 2.4) {
        player._heatAcc = 0;
        hurt(player, 4, "heat");
        floatText(player.x, player.y - 36, "过热", "#f86");
      }
    } else player._heatAcc = 0;

    // Sanity: daylight + light restore; dark drains (DST-like)
    if (!night && !inCave && lit >= 0.35) {
      player.corr = Math.max(0, player.corr - dt * 1.8);
    } else if (lit >= 0.55) {
      player.corr = Math.max(0, player.corr - dt * 0.9);
    }
    if (player.fireSanity && lit >= 0.4) {
      player.corr = Math.max(0, player.corr - dt * 2.2);
    }
    if (player.robot && rain > 0) {
      player._rainHurt = (player._rainHurt || 0) + dt;
      if (player._rainHurt > 2) { player._rainHurt = 0; hurt(player, 3, "rain"); }
    } else player._rainHurt = 0;
    // Darkness (surface night or cave)
    const darkThreat = (night && lit < 0.28) || (inCave && lit < 0.22);
    if (darkThreat) {
      let drain = inCave ? 4.5 : 7.5;
      if (player.nightSanity) drain *= 0.5;
      player.corr = Math.min(100, player.corr + dt * drain);
      player._darkAcc = (player._darkAcc || 0) + dt;
      if (player._darkAcc >= 2.2) {
        player._darkAcc = 0;
        hurt(player, 5, "dark");
          floatText(player.x, player.y - 36, "阴影", "#6a7cff");
      }
    } else {
      player._darkAcc = 0;
    }

    if (night && !inCave) {
      raidCd -= dt;
      if (raidCd <= 0) {
        raidCd = (22 + rand() * 18) / (season.raid || 1);
        const n = 1 + (rand() < 0.55 ? 1 : 0) + (rand() < 0.2 * (season.raid || 1) ? 1 : 0);
        const kinds = season.freeze
          ? ["skull", "skull", "bat", "torch_goblin", "thief"]
          : ["torch_goblin", "thief", "skull", "bat", "thief", "gnoll"];
        if (seasonT > 0.4 || (houndClock && houndClock.wave > 1)) kinds.push("bomber_goblin");
        let spawned = 0;
        for (const p of props) {
          if (spawned >= n) break;
          if (p.kind !== "spiderden" || (p.nest || 0) <= 0) continue;
          if (dist(player.x, player.y, p.x, p.y) > 520) continue;
          p.nest--;
          const e = spawnEnemy("spider", p.x + (rand() - 0.5) * 30, p.y + (rand() - 0.5) * 30, false);
          if (e) {
            e.raid = true; e.homeX = p.x; e.homeY = p.y; e.passive = false; e._provoked = true;
            spawned++;
          }
        }
        for (let i = spawned; i < n; i++) {
          const pt = pickOffscreenSpawn(380, 560, true);
          if (!pt) continue;
          const e = spawnEnemy(pick(kinds), pt.x, pt.y, false);
          if (e) {
            e.raid = true; e.homeX = pt.x; e.homeY = pt.y;
            e.aggro = Math.max(e.aggro, 700);
          }
        }
        toast("夜袭从视野外逼近……", 2.5);
      }
    } else {
      raidCd = Math.min(raidCd, 10);
    }

    if (player.torchOn && (night || inCave) && (inv.lantern || 0) <= 0 && inv.torch > 0) {
      player._torchTick = (player._torchTick || 0) + dt;
      if (player._torchTick > 90) {
        player._torchTick = 0;
        inv.torch = Math.max(0, inv.torch - 1);
        if (inv.torch <= 0) { player.torchOn = false; toast("火把烧尽了。"); }
        else toast("火把烧去一截。");
      }
    }

    // Wetness (rain / ocean / wet tiles)
    if (window.DstSys) {
      const nearF = !!(nearestFire(100) && nearestFire(100).lit);
      window.DstSys.updateWetness(wetness, dt, rain > 0, nearF, onIsland || onSeaIsland, (inv.umbrella || 0) > 0 || (inv.raincoat || 0) > 0, !!(inv.raincoat || 0));
      const ptc = Math.floor(player.x / TILE), ptr = Math.floor(player.y / TILE);
      if (inb(ptc, ptr) && world.wet && world.wet[idx(ptc, ptr)] > 0.45 && !nearF) {
        wetness.wet = Math.min(100, (wetness.wet || 0) + dt * 5.5 * world.wet[idx(ptc, ptr)]);
      }
      if (wetness.wet > 55) {
        player.temp = Math.max(0, player.temp - dt * (0.6 + (wetness.wet - 55) * 0.02));
        player.corr = Math.min(100, player.corr + dt * (0.35 + (wetness.wet > 80 ? 0.5 : 0)));
      }
    }

    // Hounded waves
    if (window.DstSys && houndClock && !inCave && !player.dead) {
      window.DstSys.updateHounds(houndClock, dt, season.id, night, (i, n) => {
        const pt = pickOffscreenSpawn(420, 620, false);
        if (!pt) return;
        const x = pt.x, y = pt.y;
        const wave = (houndClock && houndClock.wave) || 1;
        let kind = "gnoll";
        const roll = rand();
        if (season.id === "winter" && roll < 0.55) kind = "skull";
        else if (season.id === "summer" && roll < 0.45) kind = "torch_goblin";
        else if (roll < 0.18) kind = "spear_goblin";
        else if (wave >= 4 && roll < 0.3) kind = "bomber_goblin";
        const e = spawnEnemy(kind, x, y, false);
        if (e) {
          e.raid = true; e.hound = true; e.nightOnly = false;
          e.passive = false; e.aggro = Math.max(e.aggro, 720); e.speed *= 1.18;
          e.homeX = x; e.homeY = y;
          if (season.id === "summer") {
            e.houndFire = true; e.name = "炎牙劫掠者"; e.dmg = (e.dmg || 9) + 3;
          } else if (season.id === "winter") {
            e.houndIce = true; e.name = kind === "skull" ? "霜骨斥候" : "寒牙劫掠者";
            e.dmg = (e.dmg || 9) + 2;
          } else e.name = kind === "gnoll" ? "掷骨劫掠队" : (e.name || "劫掠者");
        }
      }, toast);
    }

    // Season culmination bosses (DST Deerclops / Bearger / Dragonfly / Moose hooks)
    if (window.DstSys && !inCave && !player.dead) {
      const due = window.DstSys.seasonBossDue(season.id, seasonT, seasonBossFlags, window.SeasonSys && window.SeasonSys.SEASON_LEN);
      if (due) {
        seasonBossFlags[due === "deerclops" ? "deerclops" : due === "bearger" ? "bearger" : due === "dragonfly" ? "dragonfly" : "moose"] = true;
        const pt = pickOffscreenSpawn(440, 640, false) || {
          x: player.x + Math.cos(rand() * Math.PI * 2) * 480,
          y: player.y + Math.sin(rand() * Math.PI * 2) * 480,
        };
        const x = pt.x, y = pt.y;
        let e = null;
        if (due === "deerclops" || due === "bearger") {
          e = spawnEnemy("bear", x, y, false);
          if (e) {
            e.hp = e.maxHp = due === "deerclops" ? 420 : 380; e.dmg = 28; e.aggro = 900; e.boss = true;
            e.name = due === "deerclops" ? "霜原巨熊" : "丰收暴熊";
            e.seasonBoss = due; e._bossCd = 0;
          }
        } else if (due === "dragonfly") {
          e = spawnEnemy("warlord", x, y, false);
          if (e) {
            e.hp = e.maxHp = 360; e.dmg = 22; e.aggro = 850; e.boss = true; e.name = "炎纹督军";
            e.pack = true; e.seasonBoss = "dragonfly"; e._bossCd = 0;
          }
        } else {
          e = spawnEnemy("bear", x, y, false);
          if (e) {
            e.hp = e.maxHp = 340; e.dmg = 24; e.aggro = 800; e.boss = true; e.name = "潮沼巨兽";
            e.mooseBoss = true; e.seasonBoss = "moose"; e._bossCd = 0;
          }
        }
        if (e) toast("灾厄兽潮：" + e.name + "现身！", 5);
      }
    }

    // Marsh ponds: stepping near wakes frogs
    if (!inCave && landmarks && landmarks.frogs) {
      for (const p of props) {
        if (p.kind !== "waterRock" && p.kind !== "pondWake") continue;
        if (dist(player.x, player.y, p.x, p.y) > 70) continue;
        p._frog = (p._frog || 0) + dt;
        if (p._frog > 2.2 && (p.frogsLeft == null ? (p.frogsLeft = 3) : p.frogsLeft) > 0) {
          p._frog = 0; p.frogsLeft--;
          const frg = spawnEnemy("frog", p.x + (rand() - 0.5) * 30, p.y + (rand() - 0.5) * 30, false);
          if (frg) {
            frg.homeX = p.x; frg.homeY = p.y; frg.frog = true;
            frg.passive = false; frg._provoked = true;
            frg.aggro = Math.max(frg.aggro, 560);
            toast("蛙群被惊醒了！", 1.8);
          }
        }
      }
    }
    // Marsh surge: lingering on wet/magic tiles wakes lizard packs (not DST frog rain)
    if (!inCave && !player.dead && rain > 0) {
      const ptc2 = Math.floor(player.x / TILE), ptr2 = Math.floor(player.y / TILE);
      const Bref = window.OpenWorldGen && window.OpenWorldGen.BIOME;
      const bi2 = (inb(ptc2, ptr2) && biomes) ? biomes[idx(ptc2, ptr2)] : -1;
      const soggy = inb(ptc2, ptr2) && (
        (world.wet && world.wet[idx(ptc2, ptr2)] > 0.55) ||
        (Bref && bi2 === Bref.MAGIC) ||
        world.tiles[idx(ptc2, ptr2)] === T_WATER
      );
      if (soggy) {
        springFrogCd -= dt;
        if (springFrogCd <= 0) {
          springFrogCd = 38 + rand() * 30;
          let spawned = 0;
          for (let i = 0; i < 3 && spawned < 2; i++) {
            const a = rand() * Math.PI * 2;
            const fx = player.x + Math.cos(a) * (100 + rand() * 80);
            const fy = player.y + Math.sin(a) * (100 + rand() * 80);
            const kind = rand() < 0.55 ? "frog" : "lizard";
            const frg = spawnEnemy(kind, fx, fy, false);
            if (frg) {
              frg.frog = kind === "frog"; frg.passive = false; frg._provoked = true;
              frg.homeX = fx; frg.homeY = fy; frg.aggro = 500;
              if (kind === "lizard") frg.name = "潮沼蜥蜴";
              spawned++;
            }
          }
          if (spawned) toast("潮沼生物被你踩醒了！", 2.2);
        }
      } else springFrogCd = Math.min(springFrogCd, 50);
    } else springFrogCd = Math.min(springFrogCd, 50);

    // Spider dens slowly regrow nests / tier up over game-days
    {
      const dayLenG = (season.dayLen || 170);
      for (const p of props) {
        if (p.kind !== "spiderden") continue;
        if (p.denTier == null) p.denTier = 1;
        p._grow = (p._grow || 0) + dt / dayLenG;
        const maxNest = 2 + (p.denTier || 1) * 2;
        if (p._grow >= 1.15) {
          p._grow = 0;
          if ((p.nest || 0) < maxNest) {
            p.nest = (p.nest || 0) + 1;
            p.hp = Math.min(p.max || 70, (p.hp || 40) + 6);
          } else if ((p.denTier || 1) < 3 && rand() < 0.45) {
            p.denTier++;
            p.max = Math.max(p.max || 55, 40 + p.denTier * 15);
            p.hp = p.max;
            p.nest = Math.max(p.nest || 0, 3);
            if (dist(player.x, player.y, p.x, p.y) < 420) toast("蛛巢变得更臃肿了……", 2);
          }
        }
      }
    }

    // Spider dens: territorial wake; elites guard damaged / high-tier nests
    for (const p of props) {
      if (p.kind !== "spiderden" || (p.nest || 0) <= 0) continue;
      if (p.denTier == null) p.denTier = 1;
      const dd = dist(player.x, player.y, p.x, p.y);
      const night = isNight();
      const hurtNest = (p.hp || 40) < (p.max || 55) * 0.72;
      const wakeR = (hurtNest ? 110 : 58) + p.denTier * 14 + (night ? 20 : 0);
      if (dd > wakeR) continue;
      p._wake = (p._wake || 0) + dt;
      const need = hurtNest ? 0.7 : (night ? 1.0 : 1.7);
      if (p._wake > need) {
        p._wake = 0;
        p.nest--;
        const sp = spawnEnemy("spider", p.x + (rand() - 0.5) * 40, p.y + (rand() - 0.5) * 40, false);
        if (sp) {
          sp.homeX = p.x; sp.homeY = p.y; sp.aggro = Math.max(sp.aggro, 640 + p.denTier * 40);
          sp.passive = false; sp._provoked = true;
          if ((hurtNest || p.denTier >= 2) && rand() < 0.4 + p.denTier * 0.12) {
            sp._warrior = true;
            sp.hp = sp.maxHp = Math.floor((sp.maxHp || 30) * 1.65);
            sp.dmg = (sp.dmg || 8) + 4;
            sp.speed *= 1.12;
            sp.name = "甲壳卫蛛";
            toast("甲壳卫蛛护巢出击！", 1.8);
          } else toast(hurtNest ? "破损的蛛巢狂躁起来！" : (night ? "蛛巢苏醒！" : "你惊动了蛛巢！"), 1.5);
        }
      }
    }

    // Summer wildfire pressure — smolder telegraph then ignite
    if (season.id === "summer" && !inCave) {
      if (smolderJob) {
        smolderJob.t += dt;
        if (Math.floor(smolderJob.t * 2) !== Math.floor((smolderJob.t - dt) * 2)) {
          floatText((smolderJob.c + 0.5) * TILE, (smolderJob.r + 0.2) * TILE, "冒烟…", "#e8a060");
        }
        if (smolderJob.t >= smolderJob.need) {
          const c = smolderJob.c, r = smolderJob.r;
          applyFire(c, r, 1.2);
          applyFire(c + 1, r, 1); applyFire(c, r + 1, 1);
          toast("闷烧爆成野火！快用水域或冰法截断。", 3.5);
          smolderJob = null;
        }
      } else {
        wildfireCd -= dt;
        if (wildfireCd <= 0) {
          wildfireCd = 70 + rand() * 50;
          const ang = rand() * Math.PI * 2;
          const distAway = 140 + rand() * 160;
          const fx = player.x + Math.cos(ang) * distAway;
          const fy = player.y + Math.sin(ang) * distAway;
          const c = Math.floor(fx / TILE), r = Math.floor(fy / TILE);
          if (inb(c, r) && (world.tiles[idx(c, r)] === T_GRASS || world.tiles[idx(c, r)] === T_MAGIC) && world.burn[idx(c, r)] <= 0) {
            smolderJob = { t: 0, need: 3.2 + rand() * 1.2, c, r };
            toast("地面开始冒烟……野火将至！", 3);
            floatText((c + 0.5) * TILE, r * TILE, "闷烧", "#c07040");
          }
        }
      }
    } else {
      wildfireCd = Math.min(wildfireCd, 90);
      smolderJob = null;
    }

    // Summer thunder — lightning rod protects the strike site, not just the player
    if ((season.id === "summer" || season.id === "spring") && rain > 0 && !inCave && !player.dead) {
      summerThunderCd -= dt;
      if (summerThunderCd <= 0) {
        summerThunderCd = 18 + rand() * 22;
        const ang = rand() * Math.PI * 2;
        const lx = player.x + Math.cos(ang) * (40 + rand() * 110);
        const ly = player.y + Math.sin(ang) * (40 + rand() * 110);
        const rod = buildings.find((b) => b.lightningRod && dist(lx, ly, b.x, b.y) < 240);
        if (rod) {
          rod.charged = 4.5;
          electrify(Math.floor(rod.x / TILE), Math.floor(rod.y / TILE), 2);
          toast("避雷针吸收了雷击。", 1.6);
        } else if (rand() < 0.55) {
          const lc = Math.floor(lx / TILE), lr = Math.floor(ly / TILE);
          electrify(lc, lr, rain > 0 ? 4 : 2);
          if (dist(player.x, player.y, lx, ly) < 70) hurt(player, 18, "lightning");
          // hay/wood walls near bolt may catch fire
          for (const p of props) {
            if ((p.kind === "haywall" || p.kind === "woodwall") && dist(p.x, p.y, lx, ly) < 70) {
              p.hp = (p.hp || 40) - (p.kind === "haywall" ? 18 : 10);
              if (p.hp <= 0) { p.gone = true; burst(p.x, p.y, "boom"); }
            }
          }
          props.splice(0, props.length, ...props.filter((p) => !p.gone));
          toast("雷击落地！", 2);
          if (window.DstAudio) window.DstAudio.warn();
          // Thunder crack flushes marsh fauna
          const Bth = window.OpenWorldGen && window.OpenWorldGen.BIOME;
          const biL = biomes ? biomes[idx(lc, lr)] : -1;
          if (Bth && (biL === Bth.MAGIC || biL === Bth.SHORE) && rand() < 0.55) {
            for (let k = 0; k < 2; k++) {
              const frg = spawnEnemy(rand() < 0.5 ? "frog" : "lizard",
                lx + (rand() - 0.5) * 50, ly + (rand() - 0.5) * 50, false);
              if (frg) {
                frg.passive = false; frg._provoked = true; frg.aggro = 540;
                frg.homeX = lx; frg.homeY = ly;
              }
            }
            toast("雷声惊起潮沼兽群！", 2);
          }
        }
      }
    } else {
      summerThunderCd = Math.min(summerThunderCd || 55, 60);
    }

    if (season.id === "winter" && !inCave) {
      if (winterStormT > 0) {
        winterStormT -= dt;
        player.temp = Math.max(0, player.temp - dt * ((inv.winterhat || 0) > 0 ? 2.2 : 4.5));
        player.hunger = Math.max(0, player.hunger - dt * 0.25);
        // fires burn faster in storm
        for (const f of fires) {
          if (f.lit && f.fuel > 0) f.fuel = Math.max(0, f.fuel - dt * 1.8);
        }
        if (lightAt(player.x, player.y) < 0.35) {
          player._stormHurt = (player._stormHurt || 0) + dt;
          if (player._stormHurt >= 2.2) {
            player._stormHurt = 0;
            hurt(player, 6, "cold");
            floatText(player.x, player.y - 40, "冻伤", "#cfe");
          }
        } else player._stormHurt = 0;
        if (winterStormT <= 0) toast("暴风雪歇了。", 2);
      } else {
        winterStormCd -= dt;
        if (winterStormCd <= 0) {
          winterStormCd = 85 + rand() * 55;
          winterStormT = 14 + rand() * 10;
          player.temp = Math.max(0, player.temp - 12);
          toast("暴风雪袭来！视线受阻，快回营火。", 3.5);
        }
      }
    } else {
      winterStormCd = Math.min(winterStormCd || 100, 110);
      winterStormT = 0;
    }

    for (const f of fires) {
      if (f.endo && f.lit && f.fuel > 0 && dist(player.x, player.y, f.x, f.y) < 90) {
        player.temp = Math.max(28, (player.temp || 55) - dt * 10);
      }
    }
    if (!isNight() && !inCave && !player.dead) {
      birdCd -= dt;
      if (birdCd <= 0) {
        birdCd = 26 + rand() * 36;
        const bi = biomes ? biomes[idx(Math.floor(player.x / TILE), Math.floor(player.y / TILE))] : 0;
        const Bref = window.OpenWorldGen && window.OpenWorldGen.BIOME;
        const edge = pickOffscreenSpawn(260, 400, false) || {
          x: player.x + Math.cos(rand() * Math.PI * 2) * 340,
          y: player.y + Math.sin(rand() * Math.PI * 2) * 340,
        };
        const dx = edge.x, dy = edge.y;
        if (Bref && bi === Bref.MINES && rand() < 0.55) {
          const crow = spawnEnemy("crow", dx, dy, false);
          if (crow) {
            crow.bird = true; crow.passive = true; crow.nightOnly = false;
            crow.enemy = false; crow.animal = true; crow.scavenger = true;
            crow.homeX = dx; crow.homeY = dy; crow.name = "矿脉拾荒鸦";
            crow.aggro = 180; crow.dmg = 0; crow._stealCd = 4;
          }
          floatText(dx, dy - 20, "拾荒鸦", "#aaa");
          // sometimes leave scrap, not farm seeds
          if (rand() < 0.3) spawnPickup(dx + 10, dy, rand() < 0.5 ? "flint" : "rocks");
        } else if (Bref && (bi === Bref.MEADOW || bi === Bref.FOREST || bi === Bref.SAVANNA) && rand() < 0.55) {
          if (rand() < 0.65) spawnPickup(dx, dy, "seeds");
          else spawnPickup(dx, dy, "honey");
          floatText(dx, dy - 20, "飞鸟过境", "#cde");
        }
      }
    }
    updateFarms(dt);
    updateTraps(dt);
    updateShoreCannons(dt);
    // Gold mine slow regen
    for (const b of buildings) {
      if (b.kind !== "goldMine" || !b.depleted) continue;
      b.regen = (b.regen || 0) + dt;
      if (b.regen > 220) {
        b.depleted = false;
        b.mineStock = Math.max(6, Math.floor((b.mineMax || 14) * 0.7));
        b.regen = 0;
        b.img = imgs.goldMine || b.img;
        if (dist(player.x, player.y, b.x, b.y) < 520) toast("金矿重新富集了。", 2.5);
      }
    }
  }

  function updateShoreCannons(dt) {
    if (player.dead || inCave) return;
    for (const p of props) {
      if (p.kind !== "cannonProp" || !p.armed || (p.hp || 0) <= 0) continue;
      p.cd = (p.cd || 0) - dt;
      const d = dist(p.x, p.y, player.x, player.y);
      if (d > 340 || d < 40) continue;
      // face player with available sprites
      const ang = Math.atan2(player.y - p.y, player.x - p.x);
      const deg = (ang * 180 / Math.PI + 360) % 360;
      if (deg > 45 && deg < 135 && imgs.cannonDown) p.img = imgs.cannonDown;
      else if (deg > 225 && deg < 315 && imgs.cannonUp) p.img = imgs.cannonUp;
      else if (imgs.cannonRight) p.img = imgs.cannonRight;
      if (p.cd > 0) continue;
      p.cd = 2.4 + rand() * 0.8;
      projectiles.push({
        kind: "cannon",
        x: p.x, y: p.y - 20,
        vx: Math.cos(ang) * 240, vy: Math.sin(ang) * 240,
        life: 2.0, dmg: 16, friendly: false, frame: 0,
      });
    }
  }

  function updateFarms(dt) {
    const season = currentSeason();
    const growMul = season.id === "winter" ? 0.25 : season.id === "spring" ? 1.35 : season.id === "summer" ? 1.15 : 1;
    for (const p of props) {
      if (p.kind === "berry") {
        if (season.id === "winter") { p.ripe = false; continue; }
        if (!p.ripe) {
          p.grow = (p.grow || 0) + dt * growMul;
          if (p.grow > 55) { p.ripe = true; p.grow = 0; }
        }
      }
      if (p.kind === "farm" && p.planted && p.stage < 3) {
        if (season.id === "winter") continue;
        let mul = growMul;
        if ((p.fert || 0) > 0) mul *= 1 + 0.35 * p.fert;
        if (rain > 0) mul *= 1.15; // rain helps crops
        p.grow = (p.grow || 0) + dt * mul;
        if (p.grow > 35) { p.grow = 0; p.stage++; }
      }
    }
  }

  function updateTraps(dt) {
    for (const p of props) {
      if (p.kind !== "trap") continue;
      p.cd = Math.max(0, (p.cd || 0) - dt);
      if (p.sprung) {
        p._sprungT = (p._sprungT || 0) + dt;
        if (p._sprungT > 8) { p.sprung = false; p._sprungT = 0; }
        continue;
      }
      if (p.cd > 0) continue;
      // Berry/seeds bait: chance to catch birds (DST bird trap feel)
      if ((p.bait || 0) > 0 && rand() < dt * 0.06) {
        p.sprung = true; p.bait = 0; p.cd = 14; p._sprungT = 0;
        spawnPickup(p.x, p.y, "seeds");
        spawnPickup(p.x + 8, p.y, "meat");
        floatText(p.x, p.y - 20, "捕鸟!", "#cde");
        burst(p.x, p.y, "dust");
        continue;
      }
      for (const e of entities) {
        if (e.dead || e.npc) continue;
        if (dist(e.x, e.y, p.x, p.y) > 22) continue;
        if (e.animal || e.kind === "spider" || e.kind === "sheep" || e.kind === "pig") {
          const baited = (p.bait || 0) > 0;
          p.sprung = true;
          p.bait = 0;
          p.cd = 12;
          e.dead = true;
          e._fade = 0;
          spawnPickup(p.x, p.y, "meat");
          if (baited) spawnPickup(p.x + 8, p.y, "meat");
          if (e.beefalo) spawnPickup(p.x - 8, p.y, "dung");
          floatText(p.x, p.y - 20, "捕获!", "#e07070");
          burst(p.x, p.y, "dust");
          break;
        }
        if (e.enemy) {
          p.sprung = true;
          p.bait = Math.max(0, (p.bait || 0) - 1);
          p.cd = 6;
          hurt(e, 18 + (p.bait > 0 ? 8 : 0), "melee");
          floatText(p.x, p.y - 20, "绊倒!", "#fc6");
          burst(p.x, p.y, "dust");
          break;
        }
      }
    }
  }

  function eat() {
    const freshMul = (key) => {
      if (!window.DstSys) return 1;
      const f = window.DstSys.spoilFreshness(inv, key);
      return f;
    };
    const consume = (key, hunger, hp, extra, defSanity) => {
      if ((inv[key] || 0) <= 0) return false;
      inv[key]--;
      let h = hunger, heal = hp, san = defSanity != null ? defSanity : 0;
      let cool = 0;
      if (inv._cookBoost && inv._cookBoost[key] && (inv._cookBoost[key].n || 0) > 0) {
        const b = inv._cookBoost[key];
        h = b.hunger != null ? b.hunger : h;
        heal = b.hp != null ? b.hp : heal;
        if (b.sanity != null) san = b.sanity;
        if (b.cool) cool = b.cool;
        b.n--;
        if (b.n <= 0) delete inv._cookBoost[key];
      }
      const f = freshMul(key);
      if (f < 0.25) {
        player.corr = Math.min(100, player.corr + 10);
        toast("食物快馊了……勉强咽下，理智受损。", 2.5);
        san = Math.min(san, 0);
      } else if (f < 0.5) {
        toast("有点不新鲜，但还能吃。", 1.8);
        san *= 0.5;
      }
      player.hunger = Math.min(player.maxHunger || 150, player.hunger + h * (0.55 + 0.45 * f));
      player.hp = Math.min(player.maxHp, player.hp + Math.max(0, heal * f));
      if (san) player.corr = Math.max(0, Math.min(100, player.corr - san * f));
      if (cool > 0) {
        player.buffCool = Math.max(player.buffCool || 0, cool);
        player.temp = Math.max(25, (player.temp || 55) - 10);
      }
      if (extra) extra(f);
      if (inv._spoil && inv._spoil[key] != null && (inv[key] || 0) > 0) {
      } else if (inv._spoil) delete inv._spoil[key];
      return true;
    };
    if (consume("jerky", 50, 8, () => toast("嚼着肉干，耐饿。"), 3)) return;
    if ((inv.monster || 0) > 0 && (inv.feast || 0) <= 0 && (inv.meatpie || 0) <= 0 && (inv.cooked || 0) <= 0 && (inv.jam || 0) <= 0 && (inv.meat || 0) <= 0 && (inv.berries || 0) <= 0) {
      inv.monster--;
      player.hunger = Math.min(player.maxHunger || 150, player.hunger + 28);
      player.hp = Math.min(player.maxHp, player.hp + 4);
      player.corr = Math.min(100, player.corr + 18);
      toast("怪物肉下肚……理智下降。");
      return;
    }
    if (consume("feast", 90, 45, () => {
      player.hunger = player.maxHunger || 150;
      player.mp = Math.min(player.maxMp, player.mp + 30);
      player.temp = Math.min(100, player.temp + 10);
      player.buffSpeed = Math.max(player.buffSpeed, 12);
      player.buffPower = Math.max(player.buffPower, 12);
      toast("据点大餐！全身暖洋洋。");
    }, 15)) return;
    if (consume("meatpie", 72, 30, () => toast("肉馅饼扎实。"), 5)) return;
    if (consume("spicy", 48, 8, () => {
      player.buffWarm = Math.max(player.buffWarm, 45);
      player.temp = Math.min(100, player.temp + 20);
      toast("辛香炖下肚，身子热起来了。");
    }, 5)) return;
    if (consume("trail", 28, 4, () => {
      player.buffSpeed = Math.max(player.buffSpeed, 25);
      toast("果脯提神，脚步轻快。");
    }, 10)) return;
    if (consume("jam", 50, 28, () => {
      if ((player.buffCool || 0) <= 0) player.temp = Math.min(100, player.temp + 6);
      toast("果酱甜滋滋。");
    }, 12)) return;
    if (consume("cooked", 58, 22, () => toast("熟食下肚。"), 5)) return;
    if (consume("carrot", 22, 4, () => toast("胡萝卜脆生生。"), 1)) return;
    if (consume("berries", 18, 6, () => toast("浆果酸甜。"), 2)) return;
    if (consume("honey", 12, 8, () => toast("蜂蜜甜滋滋，心情好了点。"), 8)) return;
    if (consume("fish", 34, 10, () => toast("生鱼腥，但填了肚子。进炖锅更好。"), 0)) return;
    if (consume("meat", 42, 16, (f) => {
      if (rand() < 0.15) {
        player.corr = Math.min(100, player.corr + 8);
        toast("这块肉带着魔力……好吃，但加深了魔蚀。");
      } else toast("饱餐一顿。");
    }, 0)) return;
    toast("没有食物了。猎羊、钓鱼、采果或烤熟。");
  }

  function useMapScroll() {
    if ((inv.mapscroll || 0) <= 0) { toast("没有舆图卷。Tab 可合成。"); return; }
    inv.mapscroll--;
    revealFog(player.x, player.y, 22);
    buildMinimap();
    toast("舆图展开，迷雾退去。", 2.5);
  }

  function moveCircle(e, dx, dy) {
    const ox = e.x, oy = e.y;
    e.x += dx;
    if (collides(e)) e.x = ox;
    e.y += dy;
    if (collides(e)) e.y = oy;
    // slide if blocked diagonally (reduces tree/rock stuck)
    if (e.x === ox && e.y === oy && (Math.abs(dx) + Math.abs(dy) > 0.01)) {
      e.x = ox + dx;
      if (collides(e)) e.x = ox;
      else { e.y = oy; }
      if (e.x === ox) {
        e.y = oy + dy;
        if (collides(e)) e.y = oy;
      }
      // still stuck → nudge perpendicular then toward open tile
      if (e.x === ox && e.y === oy) {
        const px = -dy * 0.85, py = dx * 0.85;
        e.x = ox + px; e.y = oy + py;
        if (collides(e)) { e.x = ox - px; e.y = oy - py; }
        if (collides(e)) { e.x = ox; e.y = oy; e._stuck = (e._stuck || 0) + 1; }
        else e._stuck = 0;
      } else e._stuck = 0;
    } else e._stuck = 0;
    e.x = clamp(e.x, TILE, COLS * TILE - TILE);
    e.y = clamp(e.y, TILE, ROWS * TILE - TILE);
    // hard unstick: teleport a step toward home / player if jammed too long
    if ((e._stuck || 0) > 6) {
      e._stuck = 0;
      const tx = player && !player.dead ? player.x : (e.homeX || e.x);
      const ty = player && !player.dead ? player.y : (e.homeY || e.y);
      const a = Math.atan2(ty - e.y, tx - e.x) + (rand() - 0.5) * 1.2;
      e.x = clamp(e.x + Math.cos(a) * 28, TILE, COLS * TILE - TILE);
      e.y = clamp(e.y + Math.sin(a) * 28, TILE, ROWS * TILE - TILE);
      if (collides(e)) { e.x = ox; e.y = oy; }
    }
  }

  /** Soft push so melee packs don't occupy the same pixel. */
  function separateEntities(dt) {
    const list = entities;
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      if (!a || a.dead || a.kind === "player" || a.npc) continue;
      const ar = a.r != null ? a.r : CHAR_R;
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j];
        if (!b || b.dead || b.kind === "player" || b.npc) continue;
        if (!!a.aquatic !== !!b.aquatic) continue;
        const br = b.r != null ? b.r : CHAR_R;
        const minD = ar + br + 6;
        let d = dist(a.x, a.y, b.x, b.y);
        if (d >= minD) continue;
        // Exact overlap used to skip push (d < 0.01) — that froze stacked shore packs
        const ang = d < 0.05
          ? (hash2(a.x + b.x, a.y + b.y + i) * Math.PI * 2)
          : Math.atan2(a.y - b.y, a.x - b.x);
        const push = d < 0.05 ? minD * 0.55 : (minD - d) * 0.55;
        const ax = a.x, ay = a.y, bx = b.x, by = b.y;
        a.x += Math.cos(ang) * push;
        a.y += Math.sin(ang) * push;
        if (collides(a)) { a.x = ax; a.y = ay; }
        b.x -= Math.cos(ang) * push;
        b.y -= Math.sin(ang) * push;
        if (collides(b)) { b.x = bx; b.y = by; }
      }
    }
  }

  function collides(e) {
    const tw = tileAt(e.x, e.y);
    const tw2 = tileAt(e.x, e.y + 8);
    if (e.aquatic) {
      // Stay in water/ice — walking onto land made sharks freeze on the shore
      if (tw !== T_WATER && tw !== T_ICE && tw2 !== T_WATER && tw2 !== T_ICE) return true;
    } else if (!walkable(e.x, e.y) && !walkable(e.x, e.y + 8)) return true;
    const er = e.r != null ? e.r : CHAR_R;
    for (const b of buildings) {
      if (b.solid === false) continue;
      const pad = (e.kind === "player") ? er * 0.9 : er * 0.5;
      if (hitsBuildingFoot(b, e.x, e.y, pad, pad * 0.5, pad * 0.35)) return true;
    }
    for (const p of props) {
      // Props also use character-scale collision (not full sprite width)
      if (p.kind === "tree" && p.hp > 0 && dist(e.x, e.y, p.x, p.y) < er + CHAR_R) return true;
      if (p.kind === "rock" && dist(e.x, e.y, p.x, p.y) < er + CHAR_R) return true;
      if ((p.kind === "fence" || p.kind === "haywall" || p.kind === "woodwall" || p.kind === "stonewall") && hitsFenceProp(p, e.x, e.y, er)) return true;
      if (p.kind === "chest" && dist(e.x, e.y, p.x, p.y) < er + CHAR_R) return true;
      if (p.kind === "gold" && dist(e.x, e.y, p.x, p.y) < er + CHAR_R) return true;
      if (p.kind === "spiderden" && p.solid && !(e.kind === "spider" || e.denSpider)
          && dist(e.x, e.y, p.x, p.y) < er + CHAR_R * 0.85) return true;
      if (p.kind === "meatrack" && p.solid && dist(e.x, e.y, p.x, p.y) < er + CHAR_R) return true;
    }
    return false;
  }

  function updateEntities(dt) {
    const ACTIVE = 1600; // keep AI alive farther on DS-scale map
    for (const e of entities) {
      if (e.dead) continue;
      e.hurt = Math.max(0, e.hurt - dt);
      e.acc += dt;
      if (e.kind !== "monk" && e.kind !== "sheep" && e.kind !== "pig" && !e.bird) {
        const dPlayer = dist(e.x, e.y, player.x, player.y);
        if (dPlayer > ACTIVE && e !== warlord && e !== bearBoss && !e.boss) continue;
      }
      if (e.kind === "monk") {
        const fps = e.anim === "heal" ? 12 : 7;
        const frames = e.anim === "heal" ? 11 : 6;
        if (e.acc > 1 / fps) { e.acc = 0; e.frame++; }
        if (e.anim === "heal" && e.frame >= frames) { e.anim = "idle"; e.frame = 0; }
        else e.frame %= frames;
        continue;
      }
      if ((e.kind === "sheep" || e.kind === "pig" || e.bird) && !e.hostile) {
        if (e.bird) {
          e.wander = (e.wander || 0) - dt;
          if (e.wander <= 0) {
            e.wander = 0.6 + rand() * 1.5;
            e._ix = (rand() - 0.5); e._iy = (rand() - 0.5);
          }
          const pdB = dist(e.x, e.y, player.x, player.y);
          if (pdB < 120) { e._ix = e.x - player.x; e._iy = e.y - player.y; }
          const Lb = Math.hypot(e._ix || 0, e._iy || 0);
          if (Lb > 0.1) {
            moveCircle(e, (e._ix / Lb) * e.speed * 1.2 * dt, (e._iy / Lb) * e.speed * 1.2 * dt);
            e.anim = "run";
          } else e.anim = "idle";
          if (e.acc > 0.1) { e.acc = 0; e.frame = (e.frame + 1) % (e.runFrames || 4); }
          continue;
        }
        // Befriended pigs: follow player, fight hostiles (DST)
        if (e.kind === "pig" && e.friend) {
          e.friendT = (e.friendT || 0) - dt;
          if (e.friendT <= 0) {
            e.friend = false;
            e.name = "猪人";
            toast("猪人吃腻了，自行走开。", 2);
          } else {
            let foe = null, fd = 260;
            for (const o of entities) {
              if (!o || o.dead || !o.enemy || o.ally || o.friend) continue;
              const dd = dist(e.x, e.y, o.x, o.y);
              if (dd < fd) { fd = dd; foe = o; }
            }
            const follow = foe || player;
            const ang = Math.atan2(follow.y - e.y, follow.x - e.x);
            e.facing = Math.cos(ang) < 0 ? -1 : 1;
            const td = dist(e.x, e.y, follow.x, follow.y);
            if (td > (foe ? 36 : 54)) moveCircle(e, Math.cos(ang) * e.speed * dt, Math.sin(ang) * e.speed * dt);
            e.anim = td > 40 ? "run" : "idle";
            e.cd = (e.cd || 0) - dt;
            if (foe && td < 42 && e.cd <= 0) {
              e.cd = 0.85;
              hurt(foe, e.dmg || 14, "melee");
            }
            // night: still lean toward home if far from hut
            if (isNight() && !foe && dist(e.x, e.y, e.homeX || e.x, e.homeY || e.y) > 200 && dist(e.x, e.y, player.x, player.y) > 160) {
              const hx = (e.homeX || e.x) - e.x, hy = (e.homeY || e.y) - e.y;
              const Lh = Math.hypot(hx, hy) || 1;
              moveCircle(e, (hx / Lh) * e.speed * 0.6 * dt, (hy / Lh) * e.speed * 0.6 * dt);
            }
            const frames = e.anim === "run" ? 4 : 10;
            if (e.acc > 0.12) { e.acc = 0; e.frame = (e.frame + 1) % frames; }
            continue;
          }
        }
        // Herd sheep leave dung occasionally
        if (e.beefalo) {
          e._dungCd = (e._dungCd || 12) - dt;
          if (e._dungCd <= 0) {
            e._dungCd = 28 + rand() * 24;
            if (rand() < 0.4) spawnPickup(e.x + (rand() - 0.5) * 20, e.y + 8, "dung");
          }
          // stampede if player sprints close or fire nearby
          const sprint = keys.has("ShiftLeft") || keys.has("ShiftRight");
          const fireNear = fires.some((f) => f.lit && dist(f.x, f.y, e.x, e.y) < 90);
          if (!e.hostile && ((sprint && dist(e.x, e.y, player.x, player.y) < 95) || fireNear)) {
            e.hostile = true; e._stampede = 6;
            floatText(e.x, e.y - 30, "惊群!", "#c9a06a");
          }
          if (e._stampede > 0) e._stampede -= dt;
          else if (e.hostile && !e._provoked) e.hostile = false;
        }
        e.wander -= dt;
        if (e.wander <= 0) {
          e.wander = 1 + rand() * 3;
          e._ix = rand() < 0.4 ? 0 : (rand() - 0.5);
          e._iy = rand() < 0.4 ? 0 : (rand() - 0.5);
          // pigs: night village patrol loop around hut (not sleeping indoors)
          if (e.kind === "pig" && e.hut && isNight() && !e.werepig && !e.hostile) {
            const ang = rand() * Math.PI * 2;
            e._ix = (e.hut.x + Math.cos(ang) * 70) - e.x;
            e._iy = (e.hut.y + Math.sin(ang) * 70) - e.y;
          }
        }
        const fleeR = e.kind === "pig" ? 110 : (e.beefalo ? 70 : 90);
        const pd = dist(e.x, e.y, player.x, player.y);
        if (e.kind === "pig" && e.werepig && e.hostile) {
          e._ix = player.x - e.x; e._iy = player.y - e.y;
          e.cd = (e.cd || 0) - dt;
          if (pd < 40 && e.cd <= 0) {
            e.cd = 0.9;
            hurt(player, e.dmg || 18, "melee");
          }
        } else if (e.beefalo && e.hostile) {
          e._ix = player.x - e.x; e._iy = player.y - e.y;
          e.cd = (e.cd || 0) - dt;
          if (pd < 42 && e.cd <= 0) {
            e.cd = 1.0;
            hurt(player, 12, "melee");
            floatText(player.x, player.y - 40, "冲撞!", "#c9a06a");
          }
        } else if (pd < fleeR && !(e.kind === "pig" && e.friend)) {
          e._ix = e.x - player.x; e._iy = e.y - player.y;
        }
        const L = Math.hypot(e._ix || 0, e._iy || 0);
        if (L > 0.1) {
          const spdMul = (e.beefalo && e.hostile) ? 1.15 : 1;
          moveCircle(e, (e._ix / L) * e.speed * spdMul * dt, (e._iy / L) * e.speed * spdMul * dt);
          e.facing = e._ix < 0 ? -1 : 1;
          e.anim = "run";
        } else e.anim = "idle";
        const frames = e.kind === "pig"
          ? (e.anim === "run" ? 4 : 10)
          : (e.anim === "run" ? 4 : 6);
        if (e.acc > 0.12) { e.acc = 0; e.frame = (e.frame + 1) % frames; }
        continue;
      }

      const night = isNight();
      const d = dist(e.x, e.y, player.x, player.y);
      e.cd -= dt;
      e.attacking = Math.max(0, e.attacking - dt);

      // Night raiders rest by day unless already fighting / raiding
      if (e.nightOnly && !e.caveDweller && !night && !e._provoked && !e.raid) {
        const hx = (e.homeX || e.x) - e.x, hy = (e.homeY || e.y) - e.y;
        const Lh = Math.hypot(hx, hy);
        if (Lh > 16) moveCircle(e, (hx / Lh) * e.speed * 0.35 * dt, (hy / Lh) * e.speed * 0.35 * dt);
        e.anim = Lh > 16 ? "run" : "idle";
        if (e.acc > 0.14) { e.acc = 0; e.frame = (e.frame + 1) % (e.idleFrames || 8); }
        continue;
      }

      // Light-shy flyers peel off near bright fire
      if (e.lightFlee && !e.dead) {
        const lit = nearestFire(110);
        if (lit && lit.lit) {
          const ax = e.x - lit.x, ay = e.y - lit.y;
          const L = Math.hypot(ax, ay) || 1;
          moveCircle(e, (ax / L) * e.speed * 1.1 * dt, (ay / L) * e.speed * 1.1 * dt);
          e.anim = "run";
          if (e.acc > 0.1) { e.acc = 0; e.frame = (e.frame + 1) % (e.runFrames || 4); }
          continue;
        }
      }

      // Scavenger crows nibble ground loot then leave
      if (e.scavenger && !e.dead) {
        e._stealCd = (e._stealCd || 0) - dt;
        if (e._stealCd <= 0) {
          e._stealCd = 5 + rand() * 4;
          let best = null, bd = 90, bi = -1;
          for (let di = 0; di < drops.length; di++) {
            const p = drops[di];
            if (!p || p.kind === "boat") continue;
            const dd = dist(e.x, e.y, p.x, p.y);
            if (dd < bd) { bd = dd; best = p; bi = di; }
          }
          if (best && bi >= 0) {
            drops.splice(bi, 1);
            floatText(best.x, best.y - 16, "被叼走", "#aaa");
            e._ix = e.x - player.x; e._iy = e.y - player.y;
          }
        }
      }

      // Passive fauna: bees / den spiders wake if close at night or nest threatened
      if (e.passive && !e._provoked && !e.killer && !e.hostile) {
        const wake = (e.kind === "spider" || e.denSpider) && (night || e._nestGuard) && d < (e.aggro * 0.55);
        if (!wake) {
          const hx = (e.homeX || e.x) - e.x, hy = (e.homeY || e.y) - e.y;
          const Lh = Math.hypot(hx, hy);
          if (Lh > 24) moveCircle(e, (hx / Lh) * e.speed * 0.4 * dt, (hy / Lh) * e.speed * 0.4 * dt);
          else {
            e.wander = (e.wander || 0) - dt;
            if (e.wander <= 0) {
              e.wander = 1.2 + rand() * 2.5;
              e._ix = (rand() - 0.5); e._iy = (rand() - 0.5);
            }
            const Lw = Math.hypot(e._ix || 0, e._iy || 0);
            if (Lw > 0.1 && Lh < 90) moveCircle(e, (e._ix / Lw) * e.speed * 0.35 * dt, (e._iy / Lw) * e.speed * 0.35 * dt);
          }
          e.anim = "idle";
          if (e.acc > 0.14) { e.acc = 0; e.frame = (e.frame + 1) % (e.idleFrames || 8); }
          continue;
        }
        // dusk spiders leave dens
        e.passive = false;
      }

      if (e.kind === "bee" && (inv.beehat || 0) > 0) {
        // beehat: bees ignore player but still wander
        e.passive = true; e._provoked = false; e.killer = false;
        const hx = (e.homeX || e.x) - e.x, hy = (e.homeY || e.y) - e.y;
        const Lh = Math.hypot(hx, hy);
        if (Lh > 30) moveCircle(e, (hx / Lh) * e.speed * 0.35 * dt, (hy / Lh) * e.speed * 0.35 * dt);
        e.anim = Lh > 30 ? "run" : "idle";
        if (e.acc > 0.14) { e.acc = 0; e.frame = (e.frame + 1) % (e.idleFrames || 8); }
        continue;
      }

      // Fire / torch keeps spiders from closing in (DST light fear — soft)
      let aggroMul = night ? 1.55 : 1.15;
      if ((e.kind === "spider" || e.denSpider) && lightAt(player.x, player.y) > 0.5) aggroMul *= 0.45;
      if ((e.kind === "spider" || e.denSpider) && lightAt(e.x, e.y) > 0.55 && d > 50) {
        const away = Math.atan2(e.y - player.y, e.x - player.x);
        moveCircle(e, Math.cos(away) * e.speed * 0.5 * dt, Math.sin(away) * e.speed * 0.5 * dt);
        e.anim = "run";
        if (e.acc > 0.12) { e.acc = 0; e.frame = (e.frame + 1) % (e.runFrames || 6); }
        continue;
      }
      const aggro = e.aggro * aggroMul;

      // Leash: give up chase far from home (DST-ish territory)
      const homeD = dist(e.x, e.y, e.homeX || e.x, e.homeY || e.y);
      let leash = e.boss || e.raid || e.hound ? 9999 : (e.hutGuard || e.castleGuard ? 280 : 420);
      if (e.aquatic) leash = 220;
      if (e.frog || e.marshBound) leash = 160;
      // Aquatics prefer water — retreat if stranded on land chasing player
      if (e.aquatic && tileAt(e.x, e.y) !== T_WATER && tileAt(e.x, e.y) !== T_ICE) {
        const hx = (e.homeX || e.x) - e.x, hy = (e.homeY || e.y) - e.y;
        const Lh = Math.hypot(hx, hy) || 1;
        moveCircle(e, (hx / Lh) * e.speed * 0.85 * dt, (hy / Lh) * e.speed * 0.85 * dt);
        e.anim = "run";
        if (e.acc > 0.12) { e.acc = 0; e.frame = (e.frame + 1) % (e.runFrames || 6); }
        continue;
      }
      if (!e.raid && !e.hound && homeD > leash && d > 140) {
        const hx = (e.homeX || e.x) - e.x, hy = (e.homeY || e.y) - e.y;
        const Lh = Math.hypot(hx, hy) || 1;
        moveCircle(e, (hx / Lh) * e.speed * 0.7 * dt, (hy / Lh) * e.speed * 0.7 * dt);
        e.anim = "run";
        if (e.acc > 0.12) { e.acc = 0; e.frame = (e.frame + 1) % (e.runFrames || 6); }
        continue;
      }

      // Abigail ally AI
      if (e.ally || e.abigail) {
        e.life = (e.life || 0) - dt;
        if (e.life <= 0) { e.dead = true; toast("阿比盖尔消散了。", 2); continue; }
        let foe = null, fd = 280;
        for (const o of entities) {
          if (!o || o.dead || o.npc || o.ally || o === e || !o.enemy) continue;
          const dd = dist(e.x, e.y, o.x, o.y);
          if (dd < fd) { fd = dd; foe = o; }
        }
        const follow = foe || player;
        const ang = Math.atan2(follow.y - e.y, follow.x - e.x);
        e.facing = Math.cos(ang) < 0 ? -1 : 1;
        const td = dist(e.x, e.y, follow.x, follow.y);
        if (td > 40) moveCircle(e, Math.cos(ang) * e.speed * dt, Math.sin(ang) * e.speed * dt);
        e.anim = "run";
        e.cd -= dt;
        if (foe && td < 42 && e.cd <= 0) {
          e.cd = 0.7;
          hurt(foe, e.dmg || 12, "ghost");
        }
        continue;
      }

      if (d < aggro && !player.dead) {
        const ang = Math.atan2(player.y - e.y, player.x - e.x);
        e.facing = Math.cos(ang) < 0 ? -1 : 1;
        const ranged = e.kind === "archer" || e.kind === "blue_archer" || e.kind === "yellow_archer" || e.kind === "purple_archer" || e.kind === "black_archer" || e.kind === "knight_archer" || e.kind === "knight_archer_r" || e.kind === "knight_archer_p" || e.kind === "knight_archer_y" || e.ranged === "hex" || e.ranged === "bone" || e.ranged === "harpoon" || e.ranged === "acorn" || e.ranged === "bomb";
        if (ranged) {
          const prefer = e.kind === "archer" ? 220 : 200;
          if (d < prefer - 60) moveCircle(e, -Math.cos(ang) * e.speed * dt, -Math.sin(ang) * e.speed * dt);
          else if (d > prefer + 40) moveCircle(e, Math.cos(ang) * e.speed * dt, Math.sin(ang) * e.speed * dt);
          e.anim = e.attacking > 0 ? "atk" : "run";
          if (e.cd <= 0 && d < 360) {
            e.cd = e.ranged === "hex" ? 1.9 : e.ranged === "bone" ? 1.45 : 1.6;
            e.attacking = 0.55; e.frame = 0; e._shot = false;
          }
          const shotFrame = e.ranged === "hex" ? 6 : 4;
          if (e.attacking > 0 && !e._shot && e.frame >= shotFrame) {
            e._shot = true;
            if (e.ranged === "hex") shootHex(e, player.x, player.y);
            else if (e.ranged === "bone") shootBone(e, player.x, player.y);
            else if (e.ranged === "harpoon") shootHarpoon(e, player.x, player.y);
            else if (e.ranged === "acorn") shootAcorn(e, player.x, player.y);
            else if (e.ranged === "bomb") shootBomb(e, player.x, player.y);
            else shootArrow(e, player.x, player.y);
          }
        } else {
          const reach = e.kind === "troll" || e.kind === "bear" ? 48 : 36;
          if (d > reach) {
            const spd = e.speed * dt;
            const bx = e.x, by = e.y;
            moveCircle(e, Math.cos(ang) * spd, Math.sin(ang) * spd);
            // if blocked toward player, try flank angles (DST-ish chase around trees)
            if (e.x === bx && e.y === by) {
              for (const off of [0.85, -0.85, 1.4, -1.4]) {
                moveCircle(e, Math.cos(ang + off) * spd, Math.sin(ang + off) * spd);
                if (e.x !== bx || e.y !== by) break;
              }
            }
            e.anim = "run";
          } else {
            e.anim = e.attacking > 0 ? "atk" : "idle";
            if (e.cd <= 0) {
              e.cd = e.kind === "warlord" || e.kind === "troll" ? 1.05 : 1.25;
              e.attacking = 0.45; e.frame = 0; e._didHit = false;
            }
          }
          if (e.attacking > 0 && !e._didHit && e.frame >= 2) {
            e._didHit = true;
            const ph = actorHit(player);
            if (dist(e.x, e.y, ph.x, ph.y) < reach + ph.r) {
              hurt(player, e.dmg, e.kind === "bee" ? "bee" : "melee");
              if (e.houndFire) {
                player.temp = Math.min(100, (player.temp || 55) + 14);
                applyFire(Math.floor(player.x / TILE), Math.floor(player.y / TILE), 0.7);
                floatText(player.x, player.y - 48, "灼烧!", "#f86");
              } else if (e.houndIce) {
                player.temp = Math.max(0, (player.temp || 55) - 14);
                player.buffSpeed = Math.min(player.buffSpeed || 0, 0); // cancel speed briefly
                player._iceSlow = Math.max(player._iceSlow || 0, 2.2);
                floatText(player.x, player.y - 48, "冰缓!", "#9cf");
              }
              if (e.seasonBoss === "deerclops") {
                player.temp = Math.max(0, (player.temp || 55) - 18);
                freezeWater(Math.floor(player.x / TILE), Math.floor(player.y / TILE));
                floatText(player.x, player.y - 48, "冰寒!", "#9cf");
              } else if (e.seasonBoss === "bearger") {
                shake = Math.max(shake, 14);
                player.x += (player.x - e.x) * 0.08;
                player.y += (player.y - e.y) * 0.08;
                floatText(player.x, player.y - 48, "震击!", "#c9a06a");
              } else if (e.seasonBoss === "moose") {
                const knock = Math.atan2(player.y - e.y, player.x - e.x);
                player.x += Math.cos(knock) * 36;
                player.y += Math.sin(knock) * 36;
                floatText(player.x, player.y - 48, "冲撞!", "#e8a060");
              }
            }
          }
        }
        // Season boss pulse specials while aggro'd
        if (e.seasonBoss && d < aggro) {
          e._bossCd = (e._bossCd || 0) - dt;
          if (e._bossCd <= 0) {
            if (e.seasonBoss === "dragonfly") {
              e._bossCd = 1.8;
              applyFire(Math.floor(e.x / TILE), Math.floor(e.y / TILE), 1.1);
              applyFire(Math.floor(e.x / TILE) + (rand() < 0.5 ? 1 : -1), Math.floor(e.y / TILE), 0.8);
            } else if (e.seasonBoss === "deerclops") {
              e._bossCd = 4.2;
              const pc = Math.floor(player.x / TILE), pr = Math.floor(player.y / TILE);
              for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) freezeWater(pc + dc, pr + dr);
              player.temp = Math.max(0, (player.temp || 55) - 10);
              floatText(player.x, player.y - 56, "冰环!", "#9cf");
              shake = Math.max(shake, 8);
            } else if (e.seasonBoss === "bearger") {
              e._bossCd = 5.0;
              shake = Math.max(shake, 18);
              if (d < 160) {
                hurt(player, 8, "melee");
                player.x += (player.x - e.x) * 0.06;
                player.y += (player.y - e.y) * 0.06;
              }
              floatText(e.x, e.y - 60, "地裂!", "#c9a06a");
              burst(e.x, e.y, "dust");
            } else if (e.seasonBoss === "moose") {
              e._bossCd = 3.6;
              const ang = Math.atan2(player.y - e.y, player.x - e.x);
              e.x += Math.cos(ang) * 70;
              e.y += Math.sin(ang) * 70;
              if (dist(e.x, e.y, player.x, player.y) < 70) {
                hurt(player, 10, "melee");
                player.x += Math.cos(ang) * 40;
                player.y += Math.sin(ang) * 40;
              }
              floatText(e.x, e.y - 56, "俯冲!", "#e8a060");
            } else e._bossCd = 3;
          }
        }
      } else {
        const hx = e.homeX - e.x, hy = e.homeY - e.y;
        const L = Math.hypot(hx, hy);
        if (L > 20) {
          moveCircle(e, (hx / L) * e.speed * 0.45 * dt, (hy / L) * e.speed * 0.45 * dt);
          e.anim = "run";
        } else e.anim = "idle";
      }
      const fps = e.anim === "run" ? 9 : e.anim === "atk" ? 12 : 7;
      let frames;
      if (e.pack) {
        frames = e.anim === "atk" ? (e.atkFrames || 6) : e.anim === "run" ? (e.runFrames || 6) : (e.idleFrames || 8);
      } else {
        // Prefer live sheet metadata so tall units (lancers 12/6/3) don't wrap into empty cells
        const sheet = unitSheet(e);
        frames = (sheet && sheet[3]) ? sheet[3] : (e.anim === "atk" ? 4 : e.anim === "run" ? 6 : 8);
      }
      if (e.acc > 1 / fps) { e.acc = 0; e.frame = (e.frame + 1) % Math.max(1, frames); }

      // raid undead melt away after dawn if far from the player
      if (e.raid && e.nightOnly && !e.caveDweller && !isNight() && dist(e.x, e.y, player.x, player.y) > 420) {
        e.dead = true; e._fade = 2;
      }

      const tc = Math.floor(e.x / TILE), tr = Math.floor(e.y / TILE);
      if (inb(tc, tr) && world.burn[idx(tc, tr)] > 0) hurt(e, 14 * dt, "fire");
      if (tileAt(e.x, e.y) === T_ICE) e.x += e.facing * 20 * dt;
    }
    for (let i = entities.length - 1; i >= 0; i--) {
      const e = entities[i];
      if (e.dead && e.phantom) entities.splice(i, 1);
      else if (e.dead && e.kind !== "warlord") {
        e._fade = (e._fade || 0) + dt;
        if (e._fade > 2.5) entities.splice(i, 1);
      }
    }
  }

  function updateProjectiles(dt) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      const c = Math.floor(p.x / TILE), r = Math.floor(p.y / TILE);
      if (p.life <= 0 || !inb(c, r)) { projectiles.splice(i, 1); continue; }

      if (p.kind === "fire") {
        if (world.tiles[idx(c, r)] === T_GRASS || world.tiles[idx(c, r)] === T_MAGIC) applyFire(c, r, 1);
        if (world.tiles[idx(c, r)] === T_WATER) { burst(p.x, p.y, "splash"); projectiles.splice(i, 1); continue; }
        hitScan(p, i, 22, "fire");
      } else if (p.kind === "ice") {
        freezeWater(c, r);
        freezeWater(c + 1, r); freezeWater(c - 1, r); freezeWater(c, r + 1); freezeWater(c, r - 1);
        hitScan(p, i, 14, "ice");
      } else if (p.kind === "lightning") {
        if (world.tiles[idx(c, r)] === T_WATER || world.wet[idx(c, r)] > 0 || rain > 0) {
          electrify(c, r, rain > 0 ? 5 : 3);
          burst(p.x, p.y, "boom");
          projectiles.splice(i, 1);
          continue;
        }
        hitScan(p, i, 26, "lightning");
      } else if (p.kind === "arrow") {
        if (p.friendly) {
          for (const e of entities) {
            if (!e.enemy || e.dead) continue;
            const h = actorHit(e);
            if (dist(p.x, p.y, h.x, h.y) < 18 + h.r * 0.25) {
              hurt(e, p.dmg, "arrow");
              projectiles.splice(i, 1);
              break;
            }
          }
        } else {
          const ph = actorHit(player);
          if (dist(p.x, p.y, ph.x, ph.y) < 18 + ph.r * 0.2) {
            hurt(player, p.dmg, "arrow");
            projectiles.splice(i, 1);
          }
        }
      } else if (p.kind === "hex" || p.kind === "bone" || p.kind === "harpoon" || p.kind === "acorn" || p.kind === "cannon" || p.kind === "bomb") {
        p.frame = (p.frame || 0) + dt * 10;
        const ph = actorHit(player);
        const hitR = (p.kind === "bomb" ? 26 : 20) + ph.r * 0.2;
        if (dist(p.x, p.y, ph.x, ph.y) < hitR) {
          hurt(player, p.dmg, p.kind);
          if (p.kind === "hex") player.corr = Math.min(100, player.corr + 4);
          if (p.kind === "bomb") burst(p.x, p.y, "boom");
          projectiles.splice(i, 1);
        }
      }
    }
  }

  function hitScan(p, i, dmg, src) {
    for (const e of entities) {
      if (e.dead || e.npc) continue;
      if (!e.enemy && !e.animal) continue;
      const h = actorHit(e);
      // Body volume (not foot shadow) — fire/ice/lightning must connect on the sprite
      if (dist(p.x, p.y, h.x, h.y) < 20 + h.r * 0.45) {
        hurt(e, dmg + (src === "fire" ? player.corr * 0.08 : 0), src);
        if (src === "ice") e.cd = Math.max(e.cd, 0.8);
        burst(p.x, p.y, src === "fire" ? "boom" : "dust");
        projectiles.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  function updateTiles(dt) {
    let wallsBurned = false;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = idx(c, r);
        if (rain > 0 && world.tiles[i] !== T_WATER) world.wet[i] = 1.2;
        else world.wet[i] = Math.max(0, world.wet[i] - dt * 0.25);

        if (world.elec[i] > 0) world.elec[i] -= dt;

        if (world.tiles[i] === T_ICE) {
          world.iceAge[i] -= dt;
          let nearHeat = world.burn[i] > 0;
          if (!nearHeat) {
            for (const f of fires) {
              if (f.lit && (f.fuel || 0) > 0 && Math.hypot(f.x - (c + 0.5) * TILE, f.y - (r + 0.5) * TILE) < 90) {
                nearHeat = true; break;
              }
            }
          }
          if (nearHeat) world.iceAge[i] -= dt * 3.5;
          if (world.iceAge[i] <= 0 || rain > 0.5) world.tiles[i] = T_WATER;
        }

        if (world.burn[i] > 0) {
          world.fireAge[i] += dt;
          if (world.wet[i] > 0.6) { world.burn[i] = 0; continue; }
          if (world.fireAge[i] > 1.6) {
            for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const ni = idx(c + dc, r + dr);
              if (inb(c + dc, r + dr) && (world.tiles[ni] === T_GRASS || world.tiles[ni] === T_MAGIC) && world.burn[ni] <= 0 && rand() < 0.15) {
                applyFire(c + dc, r + dr, 1);
              }
            }
            for (const p of props) {
              if (p.kind === "tree" && p.hp > 0 && Math.floor(p.x / TILE) === c && Math.floor(p.y / TILE) === r) {
                p.hp -= dt * 1.2;
                if (p.hp <= 0) {
                  p.kind = "stump"; p.img = imgs.stump; p.frames = 1; p.burnt = true;
                  spawnPickup(p.x, p.y, "charcoal");
                  if (rand() < 0.45) spawnPickup(p.x + 10, p.y, "charcoal");
                }
              }
              // Hay / wood walls catch fire
              if ((p.kind === "haywall" || p.kind === "woodwall") && p.hp > 0
                  && Math.floor(p.x / TILE) === c && Math.floor(p.y / TILE) === r) {
                p.hp -= dt * (p.kind === "haywall" ? 2.4 : 1.1);
                if (p.hp <= 0) {
                  p.gone = true; wallsBurned = true;
                  burst(p.x, p.y, "boom");
                  if (p.kind === "haywall" && rand() < 0.4) spawnPickup(p.x, p.y, "grass");
                }
              }
            }
          }
          if (world.fireAge[i] > 5.5) {
            world.burn[i] = 0;
            if (world.tiles[i] === T_GRASS || world.tiles[i] === T_MAGIC) world.tiles[i] = T_ASH;
          }
        }
      }
    }
    if (wallsBurned) props.splice(0, props.length, ...props.filter((p) => !p.gone));
  }

  function updateWeather(dt) {
    const season = currentSeason();
    const dayLen = season.dayLen || 180;
    dayT += dt / dayLen;
    if (dayT >= 1) dayT -= 1;
    seasonT += dt;

    rainTimer -= dt;
    if (rain <= 0 && rainTimer < 0) {
      const chanceMul = season.rainChance || 1;
      if (rand() < Math.min(0.95, 0.55 * chanceMul)) {
        rain = 18 + rand() * 10;
        toast(season.id === "winter" ? "寒雨夹雪。火烧得更快。" : "奥术雨落下。雷法将顺着水泽扩散。", 3);
      }
      rainTimer = (50 + rand() * 40) / Math.max(0.4, chanceMul);
    }
    if (rain > 0) rain = Math.max(0, rain - dt);
    const warm = nearestFire(90);
    if (warm && warm.lit && player.hunger < 95) player.hunger += dt * 3.2;
    // hunger drain scaled by season (extra on top of player update)
    if (player && !player.dead) {
      const extra = Math.max(0, (season.hunger || 1) - 1);
      if (extra > 0) player.hunger = Math.max(0, player.hunger - dt * 0.35 * extra);
    }
    updateSurvival(dt);
    updateWatchtowers(dt);
    updatePirateTower(dt);
    if (testMode && player && !player.dead) {
      player.hp = player.maxHp;
      player.mp = player.maxMp;
      player.hunger = player.maxHunger || 150;
      player.corr = 0;
      player.temp = 52;
      if (wetness) wetness.wet = 0;
    }
    autoSaveAcc += dt;
    if (autoSaveAcc > 90) { autoSaveAcc = 0; saveGame(false); }
  }

  function updateFx(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].t += dt;
      if (particles[i].t > particles[i].life) particles.splice(i, 1);
    }
    for (let i = floats.length - 1; i >= 0; i--) {
      floats[i].t += dt; floats[i].y -= 22 * dt;
      if (floats[i].t > floats[i].life) floats.splice(i, 1);
    }
    for (let i = toasts.length - 1; i >= 0; i--) {
      toasts[i].life -= dt;
      if (toasts[i].life <= 0) toasts.splice(i, 1);
    }
    for (const c of clouds) {
      c.x += c.v * dt;
      if (c.x > COLS * TILE + 200) c.x = -300;
    }
    shake = Math.max(0, shake - dt * 18);
  }

  function grassTile(c, r) {
    // Map edge counts as water so coast tiles get edge art instead of interior fills
    const land = (cc, rr) => inb(cc, rr) && world.tiles[idx(cc, rr)] !== T_WATER && world.tiles[idx(cc, rr)] !== T_ICE;
    const n = land(c, r - 1);
    const s = land(c, r + 1);
    const w = land(c - 1, r);
    const e = land(c + 1, r);
    // Inland fill must stay on seamless center (1,1). Mixing (1,2)/(2,1)/(2,2)
    // stamped dark seam edges onto every tile (looked like a shore grid).
    if (n && s && w && e) return [1, 1];
    const row = !n ? 0 : !s ? 3 : 1;
    const col = !w ? 0 : !e ? 3 : 1;
    return [col, row];
  }

  function drawFrame(img, fw, fh, frame, dx, dy, flip, scale) {
    if (!img) return;
    scale = scale || 1;
    const cols = Math.max(1, Math.floor(img.width / fw));
    const sx = (frame % cols) * fw;
    const sy = Math.floor(frame / cols) * fh;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (flip) {
      ctx.translate(dx + fw * scale, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, sx, sy, fw, fh, 0, 0, fw * scale, fh * scale);
    } else {
      ctx.drawImage(img, sx, sy, fw, fh, dx, dy, fw * scale, fh * scale);
    }
    ctx.restore();
  }

  /** Clamp frame size to what the sheet actually tiles — wrong fh made Tree3/4 / Dead Tree jump frames. */
  function sheetInfo(img, fwHint, fhHint) {
    if (!img || !img.width) return { fw: fwHint || 64, fh: fhHint || 64, frames: 1 };
    let fw = fwHint || 64;
    let fh = fhHint || 64;
    if (fw > img.width) fw = img.width;
    if (fh > img.height) fh = img.height;
    // Single-row strips: prefer full image height when hint overshoots
    if (img.height < (fhHint || fh) && img.width >= fw) fh = img.height;
    const cols = Math.max(1, Math.floor(img.width / fw));
    const rows = Math.max(1, Math.floor(img.height / fh));
    return { fw, fh, frames: Math.max(1, cols * rows) };
  }

  function goldHiForImg(img) {
    if (img === imgs.gold2) return imgs.gold2Hi || imgs.goldHi;
    if (img === imgs.gold3) return imgs.gold3Hi || imgs.goldHi;
    if (img === imgs.gold4) return imgs.gold4Hi || imgs.goldHi;
    if (img === imgs.gold5) return imgs.gold5Hi || imgs.goldHi;
    if (img === imgs.gold6) return imgs.gold6Hi || imgs.goldHi;
    return imgs.goldHi;
  }

  function pickGoldVariant() {
    const list = [
      [imgs.gold, imgs.goldHi],
      [imgs.gold2, imgs.gold2Hi],
      [imgs.gold3, imgs.gold3Hi],
      [imgs.gold4, imgs.gold4Hi],
      [imgs.gold5, imgs.gold5Hi],
      [imgs.gold6, imgs.gold6Hi],
    ].filter((x) => x[0]);
    const pick = list[irand(0, list.length - 1)] || [imgs.gold, imgs.goldHi];
    return { img: pick[0], hi: pick[1] || goldHiForImg(pick[0]) };
  }

  /**
   * Visual mass tiers from Tiny Swords art (opaque bbox):
   * Gold 1–2 small, 3–4 mid, 5–6 large; Rock1/3 small, Rock2 mid, Rock4 large.
   * DST-ish: bigger nodes take more pickaxe work and drop more.
   */
  function mineTierFromImg(kind, img) {
    if (kind === "gold") {
      if (img === imgs.gold || img === imgs.gold2) return 1;
      if (img === imgs.gold3 || img === imgs.gold4) return 2;
      if (img === imgs.gold5 || img === imgs.gold6) return 3;
      return 2;
    }
    if (kind === "rock") {
      if (img === imgs.rock || img === imgs.rock3) return 1;
      if (img === imgs.rock2) return 2;
      if (img === imgs.rock4) return 3;
      return 2;
    }
    return 2;
  }

  function mineStatsForTier(kind, tier) {
    tier = clamp(tier || 2, 1, 3);
    if (kind === "gold") {
      if (tier === 1) return { hp: 4, goldMin: 1, goldMax: 2, flintChance: 0.2 };
      if (tier === 2) return { hp: 6, goldMin: 2, goldMax: 3, flintChance: 0.35 };
      return { hp: 8, goldMin: 3, goldMax: 5, flintChance: 0.5 };
    }
    // rocks: DST boulder → rocks + flint, rare gold nugget
    if (tier === 1) return { hp: 3, rocksMin: 1, rocksMax: 2, flintMin: 0, flintMax: 1, goldChance: 0.06 };
    if (tier === 2) return { hp: 5, rocksMin: 2, rocksMax: 3, flintMin: 1, flintMax: 1, goldChance: 0.12 };
    return { hp: 7, rocksMin: 3, rocksMax: 4, flintMin: 1, flintMax: 2, goldChance: 0.22 };
  }

  function ensureMineStats(p) {
    if (!p || (p.kind !== "gold" && p.kind !== "rock")) return;
    if (!p.mineTier) p.mineTier = mineTierFromImg(p.kind, p.img);
    const st = mineStatsForTier(p.kind, p.mineTier);
    // Legacy worlds used hp:99 decoration rocks — normalize on first touch
    if (p.max == null || p.max > 20 || p.hp > 20) {
      p.max = st.hp;
      p.hp = st.hp;
    }
  }

  function dropMineLoot(p) {
    if (!p) return;
    const tier = p.mineTier || mineTierFromImg(p.kind, p.img);
    const st = mineStatsForTier(p.kind, tier);
    const scatter = (n, kind) => {
      for (let i = 0; i < n; i++) {
        spawnPickup(p.x + (rand() - 0.5) * 28, p.y + (rand() - 0.5) * 18, kind);
      }
    };
    if (p.kind === "gold") {
      scatter(irand(st.goldMin, st.goldMax), "gold");
      if (rand() < st.flintChance) scatter(1, "flint");
    } else if (p.kind === "rock") {
      scatter(irand(st.rocksMin, st.rocksMax), "rocks");
      const fn = irand(st.flintMin, st.flintMax);
      if (fn > 0) scatter(fn, "flint");
      if (rand() < st.goldChance) scatter(1, "gold");
    }
  }

  function makeGoldProp(x, y, extra) {
    const gv = (extra && extra.img) ? { img: extra.img, hi: extra.hi || goldHiForImg(extra.img) } : pickGoldVariant();
    const tier = mineTierFromImg("gold", gv.img);
    const st = mineStatsForTier("gold", tier);
    const p = {
      kind: "gold", img: gv.img, hi: gv.hi, x, y,
      hp: st.hp, max: st.hp, fw: 128, fh: 128, frames: 1, z: 0,
      mineTier: tier, solid: true,
    };
    if (extra) Object.assign(p, extra, { img: gv.img, hi: gv.hi, hp: st.hp, max: st.hp, mineTier: tier });
    return p;
  }

  function makeRockProp(x, y, img, extra) {
    const pool = [imgs.rock, imgs.rock2, imgs.rock3, imgs.rock4].filter(Boolean);
    img = img || pool[irand(0, pool.length - 1)] || imgs.rock;
    const tier = mineTierFromImg("rock", img);
    const st = mineStatsForTier("rock", tier);
    const p = {
      kind: "rock", img, x, y,
      hp: st.hp, max: st.hp, fw: 64, fh: 64, frames: 1, z: 0,
      mineTier: tier, solid: true,
    };
    if (extra) Object.assign(p, extra, { img, hp: st.hp, max: st.hp, mineTier: tier });
    return p;
  }

  function treeSheetFor(img) {
    if (!img || !img.width) return { fw: 192, fh: 256, frames: 1 };
    const w = img.width, h = img.height;
    // Dead Tree.png is one still (384×320) spanning full width — slicing at 192 clips it in half.
    if (w < 192 * 3) return { fw: w, fh: h, frames: 1 };
    // Update 010 tree atlas
    if (w === 768 && h === 576) return sheetInfo(img, 192, 192);
    // Tree1/2 strips 1536×256; Tree3/4 often 1536×192
    const fhHint = h <= 192 ? 192 : (h === 320 ? 320 : 256);
    return sheetInfo(img, 192, fhHint);
  }

  /** Foot-biased depth so tall canopies / ore tops don't flip draw order mid-sprite. */
  function propDepthY(p) {
    if (!p) return 0;
    if (p.kind === "fence" || p.kind === "haywall" || p.kind === "woodwall" || p.kind === "stonewall") return p.y;
    if (p.kind === "deco" || p.kind === "bush" || p.kind === "berry") return p.y - 2;
    // Slightly north bias: standing beside a rock/ore stays in front until clearly behind
    if (p.kind === "gold" || p.kind === "rock") return p.y - 6;
    if (p.kind === "tree" || p.kind === "deadTree" || p.kind === "stump") return p.y - 2;
    return p.y;
  }

  function worldToScreen(x, y) {
    return [x - camera.x, y - camera.y];
  }

  function drawWorld() {
    const camShakeX = (hash2(time, 1) - 0.5) * shake;
    const camShakeY = (hash2(time, 2) - 0.5) * shake;
    camera.x = clamp(player.x - W / 2 + camShakeX, 0, COLS * TILE - W);
    camera.y = clamp(player.y - H / 2 + camShakeY, 0, ROWS * TILE - H);

    ctx.fillStyle = "rgb(" + WATER.join(",") + ")";
    ctx.fillRect(0, 0, W, H);

    const c0 = Math.max(0, Math.floor(camera.x / TILE) - 2);
    const r0 = Math.max(0, Math.floor(camera.y / TILE) - 2);
    const c1 = Math.min(COLS, Math.ceil((camera.x + W) / TILE) + 2);
    const r1 = Math.min(ROWS, Math.ceil((camera.y + H) / TILE) + 2);

    for (let r = r0; r < r1; r++) {
      for (let c = c0; c < c1; c++) {
        const t = world.tiles[idx(c, r)];
        const sx = c * TILE - camera.x;
        const sy = r * TILE - camera.y;
        if (t === T_WATER) {
          if (imgs.water) ctx.drawImage(imgs.water, 0, 0, 64, 64, sx, sy, TILE, TILE);
          const landN = inb(c, r - 1) && world.tiles[idx(c, r - 1)] !== T_WATER && world.tiles[idx(c, r - 1)] !== T_ICE;
          const landS = inb(c, r + 1) && world.tiles[idx(c, r + 1)] !== T_WATER && world.tiles[idx(c, r + 1)] !== T_ICE;
          const landE = inb(c + 1, r) && world.tiles[idx(c + 1, r)] !== T_WATER && world.tiles[idx(c + 1, r)] !== T_ICE;
          const landW = inb(c - 1, r) && world.tiles[idx(c - 1, r)] !== T_WATER && world.tiles[idx(c - 1, r)] !== T_ICE;
          // Grass edge tiles already carry a light fringe — skip bright foam sprites (looked like white squares)
          // Soft dark wash under land edges only
          if (landN) {
            ctx.fillStyle = "rgba(12,28,36,0.35)";
            ctx.fillRect(sx, sy, TILE, 10);
          }
          if (landS) {
            ctx.fillStyle = "rgba(12,28,36,0.22)";
            ctx.fillRect(sx, sy + TILE - 8, TILE, 8);
          }
          if (landW) {
            ctx.fillStyle = "rgba(12,28,36,0.28)";
            ctx.fillRect(sx, sy, 8, TILE);
          }
          if (landE) {
            ctx.fillStyle = "rgba(12,28,36,0.28)";
            ctx.fillRect(sx + TILE - 8, sy, 8, TILE);
          }
          continue;
        }
        if (t === T_ICE) {
          ctx.fillStyle = "rgba(180,230,240,0.85)";
          ctx.fillRect(sx, sy, TILE, TILE);
          ctx.strokeStyle = "rgba(255,255,255,0.35)";
          ctx.strokeRect(sx + 8, sy + 8, 48, 48);
          continue;
        }
        const bi = biomes ? biomes[idx(c, r)] : 0;
        const Bref = window.OpenWorldGen && window.OpenWorldGen.BIOME;
        let sheet = imgs.tilesGrass;
        if (t === T_MAGIC || (Bref && bi === Bref.MAGIC)) sheet = imgs.tilesMagic || sheet;
        else if (Bref && bi === Bref.SAVANNA) sheet = imgs.tilesSavanna || sheet;
        else if (Bref && bi === Bref.WAR) sheet = imgs.tilesDirt || sheet;
        else if (Bref && bi === Bref.MINES) sheet = imgs.tilesRocky || sheet;
        else if (t === T_ASH) sheet = imgs.tilesGrass; // same sheet as meadow — avoid color3 dark-green cuts
        else if (Bref && bi === Bref.FOREST) sheet = imgs.tilesGrass;
        else if (Bref && bi === Bref.SHORE) sheet = imgs.tilesSavanna || sheet;
        const [tc, tr] = grassTile(c, r);
        if (sheet) ctx.drawImage(sheet, tc * 64, tr * 64, 64, 64, sx, sy, 64, 64);
        if (t === T_ASH) {
          const mine = Bref && bi === Bref.MINES;
          ctx.fillStyle = mine ? "rgba(40,28,20,0.45)" : "rgba(130, 100, 60, 0.12)";
          ctx.fillRect(sx, sy, 64, 64);
        }
        // Shore rim on land — all four sides (not only south)
        const waterN = !inb(c, r - 1) || world.tiles[idx(c, r - 1)] === T_WATER || world.tiles[idx(c, r - 1)] === T_ICE;
        const waterS = !inb(c, r + 1) || world.tiles[idx(c, r + 1)] === T_WATER || world.tiles[idx(c, r + 1)] === T_ICE;
        const waterW = !inb(c - 1, r) || world.tiles[idx(c - 1, r)] === T_WATER || world.tiles[idx(c - 1, r)] === T_ICE;
        const waterE = !inb(c + 1, r) || world.tiles[idx(c + 1, r)] === T_WATER || world.tiles[idx(c + 1, r)] === T_ICE;
        if (waterS) {
          ctx.fillStyle = "rgba(18,36,44,0.42)";
          ctx.fillRect(sx, sy + 50, 64, 14);
        }
        if (waterN) {
          ctx.fillStyle = "rgba(18,36,44,0.28)";
          ctx.fillRect(sx, sy, 64, 8);
        }
        if (waterW) {
          ctx.fillStyle = "rgba(18,36,44,0.32)";
          ctx.fillRect(sx, sy, 8, 64);
        }
        if (waterE) {
          ctx.fillStyle = "rgba(18,36,44,0.32)";
          ctx.fillRect(sx + 56, sy, 8, 64);
        }
        if (world.elec[idx(c, r)] > 0) {
          ctx.fillStyle = "rgba(255,240,120," + (0.2 + Math.sin(time * 30) * 0.1) + ")";
          ctx.fillRect(sx, sy, 64, 64);
        }
      }
    }

    for (let r = r0; r < r1; r++) {
      for (let c = c0; c < c1; c++) {
        if (world.burn[idx(c, r)] > 0 && imgs.fire) {
          const f = Math.floor(time * 12) % 10;
          drawFrame(imgs.fire, 64, 64, f, c * TILE - camera.x, r * TILE - camera.y - 20, false, 1.15);
        }
      }
    }
    if (smolderJob) {
      const sx = smolderJob.c * TILE - camera.x;
      const sy = smolderJob.r * TILE - camera.y;
      const pulse = 0.25 + 0.2 * Math.sin(time * 8);
      ctx.fillStyle = "rgba(200,90,40," + pulse + ")";
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = "rgba(40,20,10," + (0.15 + pulse * 0.4) + ")";
      ctx.beginPath();
      ctx.arc(sx + TILE * 0.5, sy + TILE * 0.4, 10 + pulse * 16, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawShadow(x, y, sc) {
    if (!imgs.shadow) return;
    const [sx, sy] = worldToScreen(x, y);
    ctx.globalAlpha = 0.35;
    ctx.drawImage(imgs.shadow, 0, 0, 192, 192, sx - 48 * sc, sy - 18 * sc, 96 * sc, 48 * sc);
    ctx.globalAlpha = 1;
  }

  function unitSheet(e) {
    if (e.imgOverride) {
      return [e.imgOverride, e.fw || 192, e.fh || 192, e.frames || 8];
    }
    if (e.kind === "player") {
      if (e.form === "warrior") {
        if (e.anim === "guard") return [imgs.wGuard, 192, 192, 6];
        if (e.anim === "run") return [imgs.wRun, 192, 192, 6];
        if (e.anim === "atk") return [e.atkKind === 2 ? imgs.wAtk2 : imgs.wAtk1, 192, 192, 4];
        return [imgs.wIdle, 192, 192, 8];
      }
      const hold = e.hold || e.tool || null;
      if (e.anim === "atk") {
        if (hold === "pickaxe") return [imgs.pawnAtkPick, 192, 192, 6];
        if (hold === "knife") return [imgs.pawnAtkKnife, 192, 192, 4];
        if (hold === "hammer") return [imgs.pawnAtkHammer, 192, 192, 3];
        return [imgs.pawnAtkAxe, 192, 192, 6];
      }
      if (e.anim === "run") {
        if (hold === "axe") return [imgs.pawnRunAxe, 192, 192, 6];
        if (hold === "pickaxe") return [imgs.pawnRunPick, 192, 192, 6];
        if (hold === "knife") return [imgs.pawnRunKnife, 192, 192, 6];
        if (hold === "hammer") return [imgs.pawnRunHammer, 192, 192, 6];
        if (hold === "wood") return [imgs.pawnRunWood, 192, 192, 6];
        if (hold === "gold") return [imgs.pawnRunGold, 192, 192, 6];
        if (hold === "meat") return [imgs.pawnRunMeat, 192, 192, 6];
        return [imgs.pawnRun, 192, 192, 6];
      }
      if (hold === "axe") return [imgs.pawnIdleAxe, 192, 192, 8];
      if (hold === "pickaxe") return [imgs.pawnIdlePick, 192, 192, 8];
      if (hold === "knife") return [imgs.pawnIdleKnife, 192, 192, 8];
      if (hold === "hammer") return [imgs.pawnIdleHammer, 192, 192, 8];
      if (hold === "wood") return [imgs.pawnIdleWood, 192, 192, 8];
      if (hold === "gold") return [imgs.pawnIdleGold, 192, 192, 8];
      if (hold === "meat") return [imgs.pawnIdleMeat, 192, 192, 8];
      return [imgs.pawnIdle, 192, 192, 8];
    }
    if (e.kind === "monk") {
      if (e.anim === "heal") return [imgs.mHeal, 192, 192, 11];
      return [imgs.mIdle, 192, 192, 6];
    }
    if (e.kind === "sheep") {
      if (e.happy && imgs.happySheep) {
        const fr = Math.floor(time * 6 + e.x) % 8;
        return [imgs.happySheep, 128, 128, 8];
      }
      if (e.anim === "run") return [imgs.sheepM, 128, 128, 4];
      return [imgs.sheepI, 128, 128, 6];
    }
    if (e.kind === "pig") {
      if (e.anim === "run") return [imgs.pigRun, 192, 192, 4];
      return [imgs.pigIdle, 192, 192, 10];
    }
    if (e.pack) {
      const fw = e.fw || 192, fh = e.fh || 192;
      const prefix = "en_" + e.kind + "_";
      if (e.anim === "run") return [imgs[prefix + "run"], fw, fh, e.runFrames || 6];
      if (e.anim === "atk") return [imgs[prefix + "atk"], fw, fh, e.atkFrames || 6];
      return [imgs[prefix + "idle"], fw, fh, e.idleFrames || 8];
    }
    if (e.kind === "lancer") {
      // Free Pack lancer strips are 320×320 cells (Idle 12 / Run 6 / Atk 3)
      if (e.anim === "atk") return [imgs.lancerAtk, 320, 320, 3];
      if (e.anim === "run") return [imgs.lancerRun, 320, 320, 6];
      return [imgs.lancerIdle, 320, 320, 12];
    }
    if (e.kind === "blue_lancer") {
      if (e.anim === "atk") return [imgs.bLancerAtk || imgs.lancerAtk, 320, 320, 3];
      if (e.anim === "run") return [imgs.bLancerRun || imgs.lancerRun, 320, 320, 6];
      return [imgs.bLancerIdle || imgs.lancerIdle, 320, 320, 12];
    }
    if (e.kind === "blue_archer") {
      if (e.anim === "atk") return [imgs.bArcherShoot || imgs.aShoot, 192, 192, 6];
      if (e.anim === "run") return [imgs.bArcherRun || imgs.aRun, 192, 192, 6];
      return [imgs.bArcherIdle || imgs.aIdle, 192, 192, 6];
    }
    if (e.kind === "yellow_archer") {
      if (e.anim === "atk") return [imgs.yArcherShoot || imgs.aShoot, 192, 192, 6];
      if (e.anim === "run") return [imgs.yArcherRun || imgs.aRun, 192, 192, 6];
      return [imgs.yArcherIdle || imgs.aIdle, 192, 192, 6];
    }
    if (e.kind === "purple_archer") {
      if (e.anim === "atk") return [imgs.pArcherShoot || imgs.aShoot, 192, 192, 6];
      if (e.anim === "run") return [imgs.pArcherRun || imgs.aRun, 192, 192, 6];
      return [imgs.pArcherIdle || imgs.aIdle, 192, 192, 6];
    }
    if (e.kind === "black_archer") {
      if (e.anim === "atk") return [imgs.kArcherShoot || imgs.aShoot, 192, 192, 6];
      if (e.anim === "run") return [imgs.kArcherRun || imgs.aRun, 192, 192, 6];
      return [imgs.kArcherIdle || imgs.aIdle, 192, 192, 6];
    }
    if (e.kind === "yellow_lancer") {
      if (e.anim === "atk") return [imgs.yLancerAtk || imgs.lancerAtk, 320, 320, 3];
      if (e.anim === "run") return [imgs.yLancerRun || imgs.lancerRun, 320, 320, 6];
      return [imgs.yLancerIdle || imgs.lancerIdle, 320, 320, 12];
    }
    if (e.kind === "purple_lancer") {
      if (e.anim === "atk") return [imgs.pLancerAtk || imgs.lancerAtk, 320, 320, 3];
      if (e.anim === "run") return [imgs.pLancerRun || imgs.lancerRun, 320, 320, 6];
      return [imgs.pLancerIdle || imgs.lancerIdle, 320, 320, 12];
    }
    if (e.kind === "black_lancer") {
      if (e.anim === "atk") return [imgs.kLancerAtk || imgs.lancerAtk, 320, 320, 3];
      if (e.anim === "run") return [imgs.kLancerRun || imgs.lancerRun, 320, 320, 6];
      return [imgs.kLancerIdle || imgs.lancerIdle, 320, 320, 12];
    }
    if (e.kind === "black_knight") {
      if (e.anim === "atk") return [imgs.bkAtk || imgs.rAtk1, 192, 192, 4];
      if (e.anim === "run") return [imgs.bkRun || imgs.rRun, 192, 192, 6];
      return [imgs.bkIdle || imgs.rIdle, 192, 192, 8];
    }
    if (e.kind === "yellow_guard") {
      if (e.anim === "atk") return [imgs.ykAtk || imgs.rAtk1, 192, 192, 4];
      if (e.anim === "run") return [imgs.ykRun || imgs.rRun, 192, 192, 6];
      return [imgs.ykIdle || imgs.rIdle, 192, 192, 8];
    }
    if (e.kind === "archer") {
      if (e.anim === "atk") return [imgs.aShoot, 192, 192, 8];
      if (e.anim === "run") return [imgs.aRun, 192, 192, 4];
      return [imgs.aIdle, 192, 192, 6];
    }
    const idle = e.phantom ? imgs.pIdle : imgs.rIdle;
    const run = e.phantom ? imgs.pRun : imgs.rRun;
    const atk = e.phantom ? imgs.pAtk : imgs.rAtk1;
    if (e.anim === "run") return [run, 192, 192, 6];
    if (e.anim === "atk") return [atk, 192, 192, 4];
    return [idle, 192, 192, 8];
  }

  function drawActor(e) {
    if (!e || (e.dead && e.kind === "player")) return;
    const [sx, sy] = worldToScreen(e.x, e.y);
    if (sx < -200 || sy < -260 || sx > W + 200 || sy > H + 260) return;
    if (e.dead && e.kind !== "player") ctx.globalAlpha = Math.max(0, 1 - (e._fade || 0) / 2.5);
    if (e.phantom) ctx.globalAlpha *= 0.72;
    if (e.hurt > 0) ctx.filter = "brightness(2)";
    drawShadow(e.x, e.y, e.kind === "warlord" || e.kind === "bear" || e.kind === "troll" ? 1.3 : 1);
    const [img, fw, fh] = unitSheet(e);
    let scale = 1;
    if (e.kind === "warlord") scale = 1.12;
    else if (e.kind === "troll") scale = 0.62;
    else if (e.kind === "bat_queen") scale = 1.45;
    else if (e.kind === "bear") scale = 0.92;
    else if (e.kind === "turtle" || e.kind === "minotaur") scale = 0.62;
    else if (e.kind === "panda" || e.kind === "pig_rider") scale = 0.72;
    else if (e.kind === "lancer" || e.kind === "blue_lancer" || e.kind === "yellow_lancer"
        || e.kind === "purple_lancer" || e.kind === "black_lancer") scale = 0.88;
    else if (e.pack && fw >= 256) scale = 0.78;
    else if (e.pack) scale = 0.95;
    else if (fh >= 300) scale = 0.88; // tall Free Pack sheets (320 cells)
    const ox = fw * scale / 2;
    // Foot of sprite near entity ground point (lancers are tall — keep HP above spear tip)
    const oy = e.kind === "sheep" ? fh * scale - 18 : Math.min(fh * scale * 0.88, fh * scale - 12);
    drawFrame(img, fw, fh, e.frame, sx - ox, sy - oy, e.facing < 0, scale);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    if (e.enemy && !e.dead) {
      const bw = e.kind === "warlord" || e.boss ? 56 : 36;
      const barY = sy - oy - 10;
      ctx.fillStyle = "#2a1510";
      ctx.fillRect(sx - bw / 2, barY, bw, 5);
      ctx.fillStyle = "#d4534a";
      ctx.fillRect(sx - bw / 2, barY, bw * clamp(e.hp / e.maxHp, 0, 1), 5);
      if (e.kind === "warlord" || e.kind === "bear" || e.kind === "troll" || e.kind === "bat_queen" || e.boss) {
        ctx.fillStyle = "#f3e2b0";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(e.name, sx, barY - 6);
      }
    }
  }

  function drawProp(p) {
    const [sx, sy] = worldToScreen(p.x, p.y);
    if (sx < -220 || sy < -280 || sx > W + 220 || sy > H + 280) return;
    if (p.kind === "chest") {
      ctx.fillStyle = "#6b3e1f";
      ctx.fillRect(sx - 22, sy - 28, 44, 32);
      ctx.fillStyle = "#c9843a";
      ctx.fillRect(sx - 18, sy - 24, 36, 10);
      ctx.fillStyle = "#e7c64b";
      ctx.fillRect(sx - 4, sy - 14, 8, 8);
      if (chestOpen === p) {
        ctx.strokeStyle = "#ffe56a";
        ctx.strokeRect(sx - 24, sy - 30, 48, 36);
      }
      return;
    }
    if (p.kind === "meatrack") {
      ctx.strokeStyle = "#8a6230";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx - 18, sy);
      ctx.lineTo(sx - 18, sy - 52);
      ctx.lineTo(sx + 18, sy - 52);
      ctx.lineTo(sx + 18, sy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx - 14, sy - 40);
      ctx.lineTo(sx + 14, sy - 40);
      ctx.stroke();
      if (p.drying === "done") {
        ctx.fillStyle = "#c47a3a";
        ctx.fillRect(sx - 8, sy - 48, 16, 20);
        ctx.fillStyle = "#e8c44a";
        ctx.font = "9px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("可取", sx, sy + 12);
      } else if (p.drying) {
        ctx.fillStyle = p.drying === "fish" ? "#70a0e0" : p.drying === "monster" ? "#6a4a6a" : "#e07070";
        ctx.fillRect(sx - 8, sy - 48, 16, 18);
        const pct = clamp((p.dryT || 0) / (p.dryNeed || 55), 0, 1);
        ctx.fillStyle = "#2a1510";
        ctx.fillRect(sx - 12, sy - 58, 24, 4);
        ctx.fillStyle = "#e8c44a";
        ctx.fillRect(sx - 12, sy - 58, 24 * pct, 4);
        ctx.fillStyle = "#c9a06a";
        ctx.font = "9px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(p.drying === "fish" ? "晾鱼" : p.drying === "monster" ? "晾怪" : "晾肉", sx, sy + 12);
      }
      return;
    }
    if (p.kind === "caveSign") {
      ctx.fillStyle = "rgba(20,16,12,0.75)";
      ctx.fillRect(sx - 28, sy - 36, 56, 22);
      ctx.fillStyle = "#e8dcc0";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.label || "洞窟", sx, sy - 20);
      return;
    }
    if (p.kind === "fence" || p.kind === "haywall" || p.kind === "woodwall") {
      if (p.kind === "haywall") {
        ctx.fillStyle = "#c4b46a";
        ctx.fillRect(sx - 22, sy - 36, 44, 40);
        ctx.fillStyle = "#8a7a40";
        ctx.fillRect(sx - 22, sy - 36, 44, 6);
        ctx.fillStyle = "#d8c878";
        ctx.font = "9px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("草墙", sx, sy + 14);
      } else if (imgs.woodFence) {
        const mask = p.fenceMask != null ? p.fenceMask : fenceMaskAt(p.x, p.y);
        const tile = p.fenceTile || fenceTileForMask(mask, p);
        p.fenceTile = tile;
        // Always use official sheet tiles (left/right vertical = r1 c0/c3)
        ctx.drawImage(imgs.woodFence, (tile.c || 0) * 64, (tile.r || 0) * 64, 64, 64, sx - 32, sy - 48, 64, 64);

      } else {
        ctx.fillStyle = "#5a3a22";
        ctx.fillRect(sx - 18, sy - 34, 8, 36);
        ctx.fillRect(sx + 10, sy - 34, 8, 36);
        ctx.fillRect(sx - 20, sy - 28, 40, 8);
        ctx.fillRect(sx - 20, sy - 12, 40, 8);
      }
      return;
    }
    if (p.kind === "wormhole") {
      ctx.fillStyle = "#1a0a28";
      ctx.beginPath();
      ctx.ellipse(sx, sy - 4, 30, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#b57cff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(sx, sy - 4, 22 + Math.sin(time * 4) * 3, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#d4b0ff";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("虫洞", sx, sy + 18);
      return;
    }
    if (p.kind === "spiderden") {
      const tier = p.denTier || 1;
      const sc = 0.75 + tier * 0.12;
      const base = imgs.stump || imgs.stump2 || imgs.rock2 || imgs.rock;
      if (base) {
        const bw = (base.width >= 192 ? 96 : 64) * sc;
        const bh = (base.height >= 192 ? 120 : 72) * sc;
        ctx.drawImage(base, sx - bw / 2, sy - bh + 8, bw, bh);
      }
      if (imgs.bones1) ctx.drawImage(imgs.bones1, sx - 22 * sc, sy - 36 * sc, 36 * sc, 28 * sc);
      if (imgs.bones2) ctx.drawImage(imgs.bones2, sx + 4 * sc, sy - 28 * sc, 32 * sc, 24 * sc);
      const spImg = imgs.en_spider_idle;
      if (spImg) drawFrame(spImg, 192, 192, Math.floor(time * 4) % 8, sx - 36 * sc, sy - 70 * sc, false, 0.38 * sc);
      ctx.fillStyle = "#e8d4a8";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(tier >= 3 ? "蛛巢Ⅲ" : tier >= 2 ? "蛛巢Ⅱ" : "蛛巢", sx, sy + 14);
      return;
    }
    if (p.kind === "grave") {
      ctx.fillStyle = p.dug ? "#3a3a3a" : "#6a6a70";
      ctx.fillRect(sx - 10, sy - 36, 20, 32);
      ctx.fillStyle = "#888";
      ctx.fillRect(sx - 14, sy - 40, 28, 8);
      ctx.fillStyle = "#c9a06a";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.dug ? "空坟" : "坟", sx, sy + 12);
      return;
    }
    if (p.kind === "pondWake") return;
    if (p.kind === "molehole") {
      ctx.fillStyle = p.dug ? "#4a3a28" : "#2a2018";
      ctx.beginPath();
      ctx.ellipse(sx, sy - 6, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c9a06a";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.dug ? "空洞" : "鼹洞", sx, sy + 14);
      return;
    }
    if (p.kind === "barrel" || p.kind === "cannonProp" || p.kind === "dynamiteDeco") {
      if (p.img) {
        const w = p.kind === "cannonProp" ? 72 : 48;
        const h = p.kind === "cannonProp" ? 72 : 48;
        ctx.drawImage(p.img, sx - w / 2, sy - h, w, h);
      }
      return;
    }
    if (p.kind === "beehive") {
      // use gnome hut art as hive stand-in (no freehand shapes)
      const img = imgs.gnomeHut || p.img;
      if (img) ctx.drawImage(img, sx - 48, sy - 120, 96, 144);
      return;
    }
    if (p.kind === "skullDeco") {
      if (p.img) {
        if (p.spike) ctx.drawImage(p.img, sx - 20, sy - 100, 40, 100);
        else ctx.drawImage(p.img, sx - 24, sy - 40, 48, 48);
      }
      return;
    }
    if (p.kind === "stonewall") {
      const img = p.img || imgs.rock2 || imgs.rock;
      if (img) ctx.drawImage(img, sx - 32, sy - 56, 64, 64);
      return;
    }
    if (p.kind === "deadTree") {
      if (p.img) ctx.drawImage(p.img, sx - 64, sy - 200, 128, 220);
      return;
    }
    if (p.kind === "corpse") {
      // pack icons only — backpack pile
      if (imgs.woodIcon) ctx.drawImage(imgs.woodIcon, sx - 28, sy - 40, 36, 36);
      if (imgs.meatIcon) ctx.drawImage(imgs.meatIcon, sx - 4, sy - 36, 32, 32);
      if (imgs.goldIcon) ctx.drawImage(imgs.goldIcon, sx + 8, sy - 20, 28, 28);
      return;
    }
    if (p.kind === "farm") {
      ctx.fillStyle = "#5a4030";
      ctx.fillRect(sx - 28, sy - 18, 56, 28);
      ctx.strokeStyle = "#3a2818";
      ctx.strokeRect(sx - 28, sy - 18, 56, 28);
      if (p.planted) {
        const st = p.stage || 0;
        const img = st >= 3 ? (imgs.bush2 || imgs.bush) : (imgs.bush3 || imgs.bush);
        const sc = 0.35 + st * 0.2;
        if (img) drawFrame(img, 128, 128, Math.floor(time * 5) % 8, sx - 64 * sc, sy - 100 * sc, false, sc);
        ctx.fillStyle = "#e8dcc0";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(st >= 3 ? "可采" : ("生长" + (st + 1)), sx, sy + 22);
        if (st < 3) {
          const pct = Math.min(1, (p.grow || 0) / 35);
          ctx.fillStyle = "#2a2010";
          ctx.fillRect(sx - 22, sy + 26, 44, 5);
          ctx.fillStyle = (p.fert || 0) ? "#8bc34a" : "#c4a050";
          ctx.fillRect(sx - 22, sy + 26, 44 * pct, 5);
        }
      } else {
        ctx.fillStyle = "#c8b890";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("空地", sx, sy + 8);
      }
      return;
    }
    if (p.kind === "deco" && p.img) {
      ctx.drawImage(p.img, sx - 32, sy - 48, 64, 64);
      return;
    }
    if (p.kind === "berry") {
      const img = p.ripe ? (imgs.bush2 || p.img) : (p.img || imgs.bush);
      const f = Math.floor(time * 6 + p.x) % (p.frames || 8);
      // ripe bushes use a different bush sheet — no freehand dots
      if (p.ripe) {
        ctx.save();
        ctx.globalAlpha = 1;
        drawFrame(img, p.fw || 128, p.fh || 128, f, sx - (p.fw || 128) / 2, sy - ((p.fh || 128) - 16), false, 1);
        ctx.restore();
      } else {
        ctx.save();
        ctx.globalAlpha = 0.85;
        drawFrame(img, p.fw || 128, p.fh || 128, f, sx - (p.fw || 128) / 2, sy - ((p.fh || 128) - 16), false, 1);
        ctx.restore();
      }
      return;
    }
    if (p.kind === "trap") {
      const img = p.sprung ? (imgs.rock || p.img) : (p.img || imgs.rock2 || imgs.rock);
      if (img) ctx.drawImage(img, sx - 28, sy - 40, 56, 56);
      if (p.bait > 0 && !p.sprung && imgs.meatIcon) {
        ctx.drawImage(imgs.meatIcon, sx - 12, sy - 28, 24, 24);
      }
      return;
    }
    const sm = sheetInfo(p.img, p.fw || 64, p.fh || 64);
    const frames = Math.max(1, Math.min(p.frames || 1, sm.frames));
    const f = frames > 1 ? Math.floor(time * 6 + p.x) % frames : 0;
    const fw = sm.fw, fh = sm.fh;
    const ox = fw / 2;
    const oy = p.kind === "tree" || p.kind === "stump" ? fh - 36 : p.kind === "gold" ? Math.min(96, fh - 24) : fh - 16;
    // Gold: never swap art on proximity (looked like morphing). Highlight only under cursor, matching variant.
    if (p.kind === "gold") {
      const hi = p.hi || goldHiForImg(p.img);
      if (hi && propUnderCursor() === p) {
        const hs = sheetInfo(hi, 128, 128);
        const hf = hs.frames > 1 ? Math.floor(time * 8) % hs.frames : 0;
        drawFrame(hi, hs.fw, hs.fh, hf, sx - ox, sy - oy, false, 1);
      } else {
        drawFrame(p.img, fw, fh, f, sx - ox, sy - oy, false, 1);
      }
      return;
    }
    drawFrame(p.img, fw, fh, f, sx - ox, sy - oy, false, 1);
  }

  function drawBuilding(b) {
    const [sx, sy] = worldToScreen(b.x, b.y);
    if (!b.img && b.kind !== "cookpot" && b.kind !== "lightning_rod" && b.kind !== "tent" && b.kind !== "siesta") return;
    if (b.kind === "gnomeTower") {
      if (b.img) ctx.drawImage(b.img, sx - 64, sy - 240);
      return;
    }
    if (b.kind === "gnomeHut") {
      if (b.img) ctx.drawImage(b.img, sx - 64, sy - 180);
      return;
    }
    if (b.kind === "minoGuard") {
      const fr = Math.floor(time * 4) % 11;
      drawFrame(imgs.minotaurGuard || b.img, 320, 320, fr, sx - 120, sy - 280, false, 0.75);
      return;
    }
    if (b.kind === "pandaGuard" && (imgs.pandaGuard || b.img)) {
      const fr = Math.floor(time * 5) % 8;
      drawFrame(imgs.pandaGuard || b.img, 256, 256, fr, sx - 90, sy - 200, false, 0.85);
      return;
    }
    if (b.kind === "skullGuard" && (imgs.skullGuard || b.img)) {
      const fr = Math.floor(time * 4) % 8;
      drawFrame(imgs.skullGuard || b.img, 256, 256, fr, sx - 90, sy - 200, false, 0.85);
      return;
    }
    if (b.kind === "turtleGuard" && (imgs.turtleGuard || b.img)) {
      const fr = Math.floor(time * 4) % 3;
      drawFrame(imgs.turtleGuard || b.img, 320, 320, fr, sx - 110, sy - 260, false, 0.7);
      return;
    }
    if (b.kind === "dock") {
      ctx.fillStyle = "#6a4a28";
      ctx.fillRect(sx - 40, sy - 18, 80, 28);
      ctx.fillStyle = "#8a6230";
      for (let i = 0; i < 4; i++) ctx.fillRect(sx - 36 + i * 20, sy - 14, 14, 20);
      ctx.fillStyle = "#c9a06a";
      ctx.font = "10px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("码头", sx, sy + 22);
      return;
    }
    if (b.kind === "firepit") {
      ctx.fillStyle = "#3a3030";
      ctx.beginPath(); ctx.arc(sx, sy - 8, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#6a5a4a";
      ctx.beginPath(); ctx.arc(sx, sy - 8, 12, 0, Math.PI * 2); ctx.fill();
      return;
    }
    if (b.kind === "goldMine" && b.img) {
      ctx.drawImage(b.img, sx - 96, sy - 140, 192, 160);
      if (b.mineMax) {
        const ratio = Math.max(0, (b.mineStock || 0) / b.mineMax);
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(sx - 40, sy + 8, 80, 6);
        ctx.fillStyle = b.depleted ? "#666" : "#e8c44a";
        ctx.fillRect(sx - 40, sy + 8, 80 * ratio, 6);
      }
      return;
    }
    if (b.kind === "knightCastle" && b.img) {
      ctx.drawImage(b.img, sx - 110, sy - 200, 220, 220);
      return;
    }
    if (b.kind === "goblinHut") {
      drawFrame(b.img, 256, 256, Math.floor(time * 5) % 12, sx - 128, sy - 220, false, 1);
      return;
    }
    if (b.kind === "cave") {
      drawFrame(b.img || imgs.caveIdle, 192, 192, Math.floor(time * 6) % 8, sx - 96, sy - 160, false, 1);
      return;
    }
    if (b.kind === "boat") {
      drawFrame(b.img || imgs.boatIdle, 256, 256, Math.floor(time * 5) % 8, sx - 128, sy - 200, false, 0.85);
      return;
    }
    if (b.kind === "boatkit") {
      drawFrame(b.img || imgs.boatIdle, 256, 256, Math.floor(time * 5) % 8, sx - 100, sy - 160, false, 0.7);
      ctx.fillStyle = "#cfe";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("船", sx, sy + 6);
      return;
    }
    if (b.kind === "seakit") {
      if (b.img) ctx.drawImage(b.img, sx - 48, sy - 100, 96, 128);
      ctx.fillStyle = "#9cf";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("思考之海", sx, sy + 8);
      return;
    }
    if (b.kind === "cookpot") {
      if (imgs.rock) ctx.drawImage(imgs.rock, sx - 36, sy - 48, 72, 72);
      if (imgs.fire) drawFrame(imgs.fire, 64, 64, Math.floor(time * 10) % 10, sx - 28, sy - 88, false, 0.85);
      if (imgs.goldIcon) ctx.drawImage(imgs.goldIcon, sx - 14, sy - 56, 28, 28);
      if (cookJob) {
        const pct = Math.min(1, cookJob.t / cookJob.need);
        ctx.fillStyle = "#2a2010";
        ctx.fillRect(sx - 28, sy + 6, 56, 7);
        ctx.fillStyle = "#e8a040";
        ctx.fillRect(sx - 28, sy + 6, 56 * pct, 7);
        ctx.fillStyle = "#ffe56a";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(cookJob.fail ? "糊了…" : (cookJob.name || "炖煮"), sx, sy + 24);
      }
      return;
    }
    if (b.kind === "endofire") {
      if (imgs.rock) ctx.drawImage(imgs.rock, sx - 32, sy - 44, 64, 64);
      ctx.fillStyle = "rgba(120,200,255,0.55)";
      ctx.beginPath();
      ctx.arc(sx, sy - 36, 16 + Math.sin(time * 4) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#cfe";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("吸热火", sx, sy + 10);
      return;
    }
    if (b.kind === "lightning_rod") {
      ctx.fillStyle = (b.charged || 0) > 0 ? "#f6f17a" : "#8a9aaa";
      ctx.fillRect(sx - 4, sy - 72, 8, 64);
      ctx.beginPath();
      ctx.moveTo(sx, sy - 78);
      ctx.lineTo(sx + 10, sy - 60);
      ctx.lineTo(sx - 10, sy - 60);
      ctx.closePath();
      ctx.fill();
      if ((b.charged || 0) > 0) {
        ctx.strokeStyle = "rgba(255,240,120,0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy - 70, 14 + Math.sin(time * 10) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      return;
    }
    if (b.kind === "icebox") {
      ctx.fillStyle = "#6a9bb8";
      ctx.fillRect(sx - 28, sy - 56, 56, 52);
      ctx.fillStyle = "#d8f0ff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("冰箱", sx, sy - 28);
      return;
    }
    if (b.kind === "alchemy") {
      if (b.img) ctx.drawImage(b.img, sx - b.w / 2, sy - b.h + 24);
      ctx.fillStyle = "#ffe56a";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("炼金引擎", sx, sy + 8);
      return;
    }
    if (b.kind === "shadow") {
      if (b.img) ctx.drawImage(b.img, sx - b.w / 2, sy - b.h + 24);
      ctx.fillStyle = "#b57cff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("暗影台", sx, sy + 8);
      return;
    }
    if (b.kind === "tent") {
      ctx.fillStyle = "#6a8a55";
      ctx.beginPath();
      ctx.moveTo(sx, sy - 70);
      ctx.lineTo(sx + 40, sy - 10);
      ctx.lineTo(sx - 40, sy - 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#4a6038";
      ctx.fillRect(sx - 6, sy - 18, 12, 20);
      ctx.fillStyle = "#e8f0d8";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("帐篷", sx, sy + 8);
      return;
    }
    if (b.kind === "siesta") {
      ctx.fillStyle = "#c4a060";
      ctx.fillRect(sx - 36, sy - 8, 72, 10);
      ctx.fillStyle = "#8a6230";
      ctx.fillRect(sx - 32, sy - 48, 8, 40);
      ctx.fillRect(sx + 24, sy - 48, 8, 40);
      ctx.fillStyle = "#e8d080";
      ctx.beginPath();
      ctx.moveTo(sx - 40, sy - 48);
      ctx.lineTo(sx + 40, sy - 48);
      ctx.lineTo(sx + 28, sy - 70);
      ctx.lineTo(sx - 28, sy - 70);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fff8e0";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("遮阳棚", sx, sy + 12);
      return;
    }
    if (b.kind === "lightning_rod") {
      ctx.strokeStyle = "#c0c8d0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx, sy - 70);
      ctx.stroke();
      ctx.fillStyle = "#ffe56a";
      ctx.beginPath();
      ctx.moveTo(sx, sy - 78);
      ctx.lineTo(sx + 8, sy - 64);
      ctx.lineTo(sx - 8, sy - 64);
      ctx.closePath();
      ctx.fill();
      if (rain > 0) {
        ctx.strokeStyle = "rgba(255,230,100,0.6)";
        ctx.beginPath();
        ctx.arc(sx, sy - 40, 18 + Math.sin(time * 8) * 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      return;
    }
    if (b.kind === "pigking") {
      if (b.img) ctx.drawImage(b.img, sx - b.w / 2, sy - b.h + 24);
      ctx.fillStyle = "#e8a060";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("猪王", sx, sy + 10);
      return;
    }
    if (b.kind === "seahorse") {
      const fr = Math.floor(time * 6) % 8;
      drawFrame(imgs.seahorseIdle || b.img, 192, 192, fr, sx - 96, sy - 150, false, 1);
      return;
    }
    if (b.kind === "fishHut") {
      const fr = Math.floor(time * 5) % (b.frames || 8);
      drawFrame(imgs.fishHut || b.img, 192, 192, fr, sx - 96, sy - 160, false, 1);
      return;
    }
    if (b.kind === "pirateTower") {
      if (imgs.pirateTowerW) {
        drawFrame(imgs.pirateTowerW, 128, 192, Math.floor(time * 6) % 8, sx - 64, sy - 170, false, 1);
      } else if (b.img) {
        ctx.drawImage(b.img, sx - b.w / 2, sy - b.h + 24);
      }
      if (b.hp != null) {
        const bw = 50;
        ctx.fillStyle = "#2a1510";
        ctx.fillRect(sx - bw / 2, sy - 180, bw, 5);
        ctx.fillStyle = "#d4534a";
        ctx.fillRect(sx - bw / 2, sy - 180, bw * clamp(b.hp / b.maxHp, 0, 1), 5);
      }
      return;
    }
    ctx.drawImage(b.img, sx - b.w / 2, sy - b.h + 24);
  }

  function actorBehindBuilding(e, b) {
    if (!e || e.dead || !b || b.solid === false) return false;
    const dy = b.y - e.y; // actor north of foot = behind facade
    if (dy < 12 || dy > Math.min(150, (b.h || 160) * 0.7)) return false;
    return Math.abs(e.x - b.x) < (b.footW || 48) + 40;
  }
  function buildingShouldGhost(b) {
    // Disabled: ghost alpha looked like "window film" on roofs/fences.
    return false;
  }

  function drawSorted() {
    const list = [];
    const margin = 220;
    const inView = (x, y) => x > camera.x - margin && x < camera.x + W + margin && y > camera.y - margin && y < camera.y + H + margin;
    for (const b of buildings) {
      if (inView(b.x, b.y)) list.push({
        y: b.y,
        draw: () => {
          // DST-ish: ghost roof when someone stands behind so NPCs aren't lost
          if (buildingShouldGhost(b)) ctx.globalAlpha = 0.4;
          drawBuilding(b);
          ctx.globalAlpha = 1;
        },
      });
    }
    for (const p of props) {
      if (!inView(p.x, p.y)) continue;
      // Never draw rails through a building sprite (extra safety if scrub missed)
      if ((p.kind === "fence" || p.kind === "haywall" || p.kind === "woodwall" || p.kind === "stonewall")
          && buildings.some((b) => hitsBuildingVisual(b, p.x, p.y, 4))) continue;
      const sy = propDepthY(p);
      list.push({ y: sy, draw: () => drawProp(p) });
    }
    for (const fire of fires) {
      if (!inView(fire.x, fire.y)) continue;
      list.push({ y: fire.y, draw: ((f) => () => {
        const [sx, sy] = worldToScreen(f.x, f.y);
        if (f.lit && imgs.fireB) {
          const sc = 1.05 + Math.min(0.45, (f.fuel || 0) / 200);
          if (f.endo) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.filter = "hue-rotate(180deg) saturate(1.4)";
            drawFrame(imgs.fireB, 64, 64, Math.floor(time * 10) % 12, sx - 32 * sc, sy - 48 * sc, false, sc);
            ctx.restore();
          } else {
            drawFrame(imgs.fireB, 64, 64, Math.floor(time * 10) % 12, sx - 32 * sc, sy - 48 * sc, false, sc);
          }
        } else {
          ctx.fillStyle = "#3a2a22";
          ctx.beginPath();
          ctx.arc(sx, sy - 6, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      })(fire) });
    }
    list.push({ y: player.y, draw: () => drawActor(player) });
    for (const e of entities) {
      if (e.dead && e.kind === "warlord") continue;
      if (!inView(e.x, e.y) && e !== warlord) continue;
      list.push({ y: e.y, draw: () => drawActor(e) });
    }
    list.sort((a, b) => a.y - b.y);
    for (const it of list) it.draw();
  }

  function drawDropsAndProj() {
    for (const d of drops) {
      const [sx, sy] = worldToScreen(d.x, d.y);
      const bob = Math.sin(time * 4 + d.x) * 4;
      let img = imgs.woodIcon, sc = 1;
      if (d.kind === "gold") img = imgs.goldIcon;
      if (d.kind === "rocks") img = imgs.rock4 || imgs.rock;
      if (d.kind === "meat") img = imgs.meatIcon;
      if (d.kind === "rune_ice" || d.kind === "rune_lightning") {
        ctx.save();
        ctx.translate(sx, sy + bob - 10);
        ctx.fillStyle = d.kind === "rune_ice" ? "#7ad7ff" : "#f6e36a";
        ctx.beginPath();
        ctx.arc(0, 0, 10 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        continue;
      }
      if (img) ctx.drawImage(img, sx - 16, sy - 16 + bob, 32, 32);
    }
    for (const p of projectiles) {
      const [sx, sy] = worldToScreen(p.x, p.y);
      if (p.kind === "arrow" && imgs.arrow) {
        const ang = Math.atan2(p.vy, p.vx);
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(ang);
        ctx.drawImage(imgs.arrow, -16, -16, 32, 32); ctx.restore();
      } else if (p.kind === "hex" && imgs.hexBolt) {
        drawFrame(imgs.hexBolt, 128, 128, Math.floor(p.frame || 0) % 3, sx - 32, sy - 32, false, 0.5);
      } else if (p.kind === "bone" && imgs.gnollBone) {
        drawFrame(imgs.gnollBone, 64, 64, Math.floor(p.frame || 0) % 4, sx - 20, sy - 20, false, 0.7);
      } else if (p.kind === "harpoon" && imgs.harpoon) {
        const ang = Math.atan2(p.vy, p.vx);
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(ang);
        ctx.drawImage(imgs.harpoon, -16, -16, 32, 32); ctx.restore();
      } else if (p.kind === "acorn" && imgs.acorn) {
        drawFrame(imgs.acorn, 64, 64, Math.floor(p.frame || 0) % 4, sx - 16, sy - 16, false, 0.55);
      } else if (p.kind === "bomb" && imgs.bombSpin) {
        drawFrame(imgs.bombSpin, 128, 128, Math.floor(p.frame || 0) % 4, sx - 24, sy - 24, false, 0.4);
      } else {
        ctx.fillStyle = p.kind === "fire" ? "#ff8a3a" : p.kind === "ice" ? "#9de8ff" : "#ffe56a";
        ctx.beginPath(); ctx.arc(sx, sy, 7, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.35;
        ctx.beginPath(); ctx.arc(sx, sy, 16, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    for (const p of particles) {
      const [sx, sy] = worldToScreen(p.x, p.y);
      const img = p.kind === "boom" ? imgs.boom : p.kind === "dust" ? imgs.dust : p.kind === "splash" ? imgs.splash : imgs.mHealFx;
      if (!img) continue;
      const fw = p.kind === "boom" || p.kind === "splash" || p.kind === "heal" ? 192 : 64;
      const fh = fw === 192 ? 192 : 64;
      const frames = Math.floor(img.width / fw);
      const f = Math.min(frames - 1, Math.floor((p.t / p.life) * frames));
      drawFrame(img, fw, fh, f, sx - fw / 2, sy - fh / 2, false, p.kind === "dust" ? 1.2 : 0.9);
    }
    for (const f of floats) {
      const [sx, sy] = worldToScreen(f.x, f.y);
      ctx.globalAlpha = 1 - f.t / f.life;
      ctx.fillStyle = f.color;
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(f.text, sx, sy);
      ctx.globalAlpha = 1;
    }
  }

  function drawOverlays() {
    const season = currentSeason();
    const nightAt = season.nightAt || 0.62;
    const night = clamp((dayT - (nightAt - 0.1)) / 0.18, 0, 1);
    // season color wash
    if (season.tint) {
      const [tr, tg, tb] = season.tint;
      const a = season.id === "winter" ? 0.12 : season.id === "summer" ? 0.08 : 0.05;
      ctx.fillStyle = "rgba(" + tr + "," + tg + "," + tb + "," + a + ")";
      ctx.fillRect(0, 0, W, H);
    }
    if (inCave) {
      ctx.fillStyle = "rgba(4,6,14,0.35)";
      ctx.fillRect(0, 0, W, H);
    }
    if (season.id === "winter" && !inCave) {
      const storm = winterStormT > 0;
      const n = storm ? 140 : 55;
      const spd = storm ? 160 : 70;
      ctx.fillStyle = storm ? "rgba(230,240,255,0.85)" : "rgba(220,235,255,0.7)";
      for (let i = 0; i < n; i++) {
        const x = ((i * 97 + time * (storm ? 90 : 40)) % (W + 20)) - 10;
        const y = ((i * 53 + time * spd) % (H + 20)) - 10;
        ctx.fillRect(x, y, storm ? 3 : 2, storm ? 3 : 2);
      }
      if (storm) {
        ctx.fillStyle = "rgba(180,200,230,0.18)";
        ctx.fillRect(0, 0, W, H);
        // wind streaks
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 40; i++) {
          const x = ((i * 71 + time * 220) % (W + 60)) - 30;
          const y = ((i * 41 + time * 90) % (H + 40)) - 20;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 18, y + 4); ctx.stroke();
        }
      }
    }
    if (season.id === "summer" && !inCave && !isNight()) {
      ctx.fillStyle = "rgba(255,160,60,0.06)";
      ctx.fillRect(0, 0, W, H);
    }
    if (night > 0.01) {
      if (!drawOverlays._dark) {
        drawOverlays._dark = document.createElement("canvas");
      }
      const dc = drawOverlays._dark;
      if (dc.width !== Math.floor(W * dpr) || dc.height !== Math.floor(H * dpr)) {
        dc.width = Math.floor(W * dpr);
        dc.height = Math.floor(H * dpr);
      }
      const dctx = dc.getContext("2d");
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dctx.clearRect(0, 0, W, H);
      dctx.fillStyle = "rgba(4, 8, 22, " + (0.78 * night) + ")";
      dctx.fillRect(0, 0, W, H);
      dctx.globalCompositeOperation = "destination-out";
      for (const L of getLights()) {
        const [lx, ly] = worldToScreen(L.x, L.y);
        const g = dctx.createRadialGradient(lx, ly, L.r * 0.12, lx, ly, L.r);
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(0.55, "rgba(0,0,0,0.75)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        dctx.fillStyle = g;
        dctx.beginPath();
        dctx.arc(lx, ly, L.r, 0, Math.PI * 2);
        dctx.fill();
      }
      dctx.globalCompositeOperation = "source-over";
      ctx.drawImage(dc, 0, 0, W, H);
      for (const L of getLights()) {
        const [lx, ly] = worldToScreen(L.x, L.y);
        const warm = ctx.createRadialGradient(lx, ly, 8, lx, ly, L.r * 0.85);
        warm.addColorStop(0, "rgba(255,170,70," + (0.22 * night) + ")");
        warm.addColorStop(1, "rgba(255,140,40,0)");
        ctx.fillStyle = warm;
        ctx.beginPath();
        ctx.arc(lx, ly, L.r * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    {
      const _tc = Math.floor(player.x / TILE), _tr = Math.floor(player.y / TILE);
      const _B = window.OpenWorldGen && window.OpenWorldGen.BIOME;
      const _marsh = tileAt(player.x, player.y) === T_MAGIC
        || (biomes && _B && inb(_tc, _tr) && biomes[idx(_tc, _tr)] === _B.MAGIC);
    if (_marsh) {
      ctx.fillStyle = "rgba(90,40,140," + (0.12 + Math.sin(time * 3) * 0.04) + ")";
      ctx.fillRect(0, 0, W, H);
    }
    }
    if (rain > 0) {
      ctx.strokeStyle = "rgba(200,230,230,0.35)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 70; i++) {
        const x = ((i * 97 + time * 280) % (W + 40)) - 20;
        const y = ((i * 53 + time * 520) % (H + 40)) - 20;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 4, y + 16); ctx.stroke();
      }
    }
    for (const c of clouds) {
      if (!c.img) continue;
      const [sx, sy] = worldToScreen(c.x, c.y);
      ctx.globalAlpha = 0.18;
      ctx.drawImage(c.img, sx, sy, 220 * c.s, 90 * c.s);
      ctx.globalAlpha = 1;
    }
    // Cold / heat / wet feedback
    if (player) {
      if ((player.temp || 55) < 28) {
        const a = Math.min(0.4, (28 - player.temp) / 28 * 0.4);
        const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
        g.addColorStop(0, "rgba(180,220,255,0)");
        g.addColorStop(1, "rgba(60,120,200," + a + ")");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      } else if ((player.temp || 55) > 78) {
        const a = Math.min(0.35, (player.temp - 78) / 22 * 0.35);
        const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
        g.addColorStop(0, "rgba(255,200,120,0)");
        g.addColorStop(1, "rgba(220,90,30," + a + ")");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      const wet = (wetness && wetness.wet) || 0;
      if (wet > 50) {
        ctx.fillStyle = "rgba(40,80,110," + Math.min(0.22, (wet - 50) / 50 * 0.22) + ")";
        ctx.fillRect(0, 0, W, H);
      }
    }
    // DST sanity vignette
    if (player && (player.corr || 0) > 35) {
      const a = Math.min(0.55, ((player.corr - 35) / 65) * 0.55);
      const pulse = player.corr > 80 ? (0.04 + Math.sin(time * 5) * 0.03) : 0;
      const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.72);
      g.addColorStop(0, "rgba(40,20,80,0)");
      g.addColorStop(1, "rgba(28,10,55," + (a + pulse) + ")");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      if (player.corr > 75) {
        ctx.fillStyle = "rgba(180,140,255," + (0.08 + Math.sin(time * 3) * 0.04) + ")";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("理智动摇……", W / 2, H - 28);
      }
    }
    // Sailing fade
    if (sailJob) {
      const p = Math.min(1, sailJob.t / sailJob.need);
      ctx.fillStyle = "rgba(20,40,70," + (0.35 + Math.sin(p * Math.PI) * 0.35) + ")";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#d8e8f8";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("航行中……", W / 2, H / 2 - 8);
      ctx.font = "12px sans-serif";
      ctx.fillText(Math.ceil(Math.max(0, sailJob.need - sailJob.t)) + " 秒", W / 2, H / 2 + 16);
    }
  }

  const nineCache = new WeakMap();

  function getNineSlices(img) {
    let cached = nineCache.get(img);
    if (cached) return cached;
    const cw = Math.floor(img.width / 3);
    const ch = Math.floor(img.height / 3);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const c = canvas.getContext("2d");
    c.drawImage(img, 0, 0);
    const data = c.getImageData(0, 0, img.width, img.height).data;
    const cells = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const ox = col * cw, oy = row * ch;
        let minx = cw, miny = ch, maxx = 0, maxy = 0, found = false;
        for (let y = 0; y < ch; y++) {
          for (let x = 0; x < cw; x++) {
            const a = data[((oy + y) * img.width + (ox + x)) * 4 + 3];
            if (a > 12) {
              found = true;
              if (x < minx) minx = x;
              if (y < miny) miny = y;
              if (x > maxx) maxx = x;
              if (y > maxy) maxy = y;
            }
          }
        }
        if (!found) cells.push({ sx: ox, sy: oy, sw: cw, sh: ch });
        else cells.push({ sx: ox + minx, sy: oy + miny, sw: maxx - minx + 1, sh: maxy - miny + 1 });
      }
    }
    const corner = Math.max(
      8,
      Math.min(cells[0].sw, cells[2].sw, cells[6].sw, cells[8].sw, cells[0].sh, cells[2].sh, cells[6].sh, cells[8].sh)
    );
    cached = { cells, corner };
    nineCache.set(img, cached);
    return cached;
  }

  function nineSlice(img, x, y, w, h) {
    if (!img) {
      ctx.fillStyle = "rgba(20,40,42,0.92)";
      ctx.fillRect(x, y, w, h);
      return;
    }
    const { cells, corner } = getNineSlices(img);
    const cl = Math.min(corner, Math.floor(w / 3), Math.floor(h / 3));
    const midW = Math.max(1, w - cl * 2);
    const midH = Math.max(1, h - cl * 2);
    const dx = [x, x + cl, x + cl + midW];
    const dy = [y, y + cl, y + cl + midH];
    const dw = [cl, midW, cl];
    const dh = [cl, midH, cl];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const src = cells[row * 3 + col];
        ctx.drawImage(img, src.sx, src.sy, src.sw, src.sh, dx[col], dy[row], dw[col], dh[row]);
      }
    }
  }

  function drawMinimap() {
    if (!miniCanvas || !player) return;
    if (Math.floor(time) !== Math.floor(time - dt)) buildMinimap();

    const season = currentSeason();
    const clock = isNight() ? "夜晚" : "白昼";
    const weather = winterStormT > 0 ? "暴风雪" : (rain > 0 ? "雨" : "");
    const fireHint = campfire ? ("火" + Math.floor(campfire.fuel || 0)) : "";

    const size = Math.min(160, Math.floor(W * 0.17), Math.floor(H * 0.22));
    const inset = 10;
    const headerH = 34;
    const legendH = 26;
    const tipH = 44;
    const panelW = size + inset * 2;
    const panelH = headerH + size + legendH + tipH + 8;
    const mx = W - panelW - 12;
    const my = 10;

    // Drop shadow + parchment
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(mx + 4, my + 5, panelW, panelH);
    nineSlice(imgs.paper || imgs.banner || imgs.uiCarved, mx, my, panelW, panelH);

    // Header strip
    ctx.fillStyle = "rgba(42,30,18,0.14)";
    ctx.fillRect(mx + 7, my + 7, panelW - 14, headerH - 2);
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "#2e2214";
    ctx.fillText("地图", mx + 16, my + 28);

    // Season / weather chip (leave room for day dial on the right)
    const chip = [season.name, clock, weather, fireHint, inCave ? "洞窟" : ""].filter(Boolean).join(" · ");
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#5a4630";
    ctx.textAlign = "right";
    ctx.fillText(chip, mx + panelW - 44, my + 27);

    // Map well
    const mapX = mx + inset;
    const mapY = my + headerH;
    ctx.fillStyle = "#0a161c";
    ctx.fillRect(mapX, mapY, size, size);
    ctx.strokeStyle = "rgba(58,42,26,0.45)";
    ctx.lineWidth = 2;
    ctx.strokeRect(mapX + 0.5, mapY + 0.5, size - 1, size - 1);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(miniCanvas, 0, 0, COLS, ROWS, mapX, mapY, size, size);

    const sx = (c) => mapX + (c / COLS) * size;
    const sy = (r) => mapY + (r / ROWS) * size;

    // Key landmarks only — less clutter than every biome pin
    const marks = [
      { m: landmarks.camp, color: "#6ecf7a", r: 4.2, ring: "#1a4020" },
      { m: landmarks.ruin, color: "#b57cff", r: 4, ring: "#3a2060" },
      { m: landmarks.red, color: "#e45b4f", r: 5, ring: "#5a1810" },
      { m: landmarks.mines, color: "#d4b44a", r: 3.2, ring: "#4a3a10" },
      { m: landmarks.forest, color: "#3d8f4a", r: 3.2, ring: "#1a3a20" },
      { m: caveEntrance ? { c: caveEntrance.x / TILE, r: caveEntrance.y / TILE } : null, color: "#2a2a2a", r: 3, ring: "#000" },
      { m: boatDock ? { c: boatDock.x / TILE, r: boatDock.y / TILE } : null, color: "#4aa7d8", r: 3, ring: "#103040" },
      { m: pirateTower ? { c: pirateTower.x / TILE, r: pirateTower.y / TILE } : null, color: "#c44", r: 3.5, ring: "#401010" },
    ];
    for (const mark of marks) {
      if (!mark.m) continue;
      const x = sx(mark.m.c), y = sy(mark.m.r);
      ctx.fillStyle = mark.color;
      ctx.beginPath();
      ctx.arc(x, y, mark.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = mark.ring || "rgba(0,0,0,0.55)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Camera frame
    const vx = sx(camera.x / TILE);
    const vy = sy(camera.y / TILE);
    const vw = Math.max(4, (W / TILE / COLS) * size);
    const vh = Math.max(4, (H / TILE / ROWS) * size);
    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.lineWidth = 1.25;
    ctx.strokeRect(vx, vy, vw, vh);

    // Player ping
    const px = sx(player.x / TILE);
    const py = sy(player.y / TILE);
    const pulse = 3.2 + Math.sin(time * 6) * 1.1;
    ctx.fillStyle = "rgba(255,229,106,0.25)";
    ctx.beginPath();
    ctx.arc(px, py, pulse + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffe56a";
    ctx.beginPath();
    ctx.arc(px, py, pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a2a10";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Legend
    const legendY = mapY + size + 17;
    const legend = [
      ["你", "#ffe56a"],
      ["据点", "#6ecf7a"],
      ["废墟", "#b57cff"],
      ["红堡", "#e45b4f"],
    ];
    legend.forEach((L, i) => {
      const lx = mx + inset + i * Math.floor((size) / 4);
      ctx.fillStyle = L[1];
      ctx.beginPath();
      ctx.arc(lx + 4, legendY - 3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3a2a1a";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(L[0], lx + 11, legendY);
    });

    // Compact controls under legend (same card)
    const tipY = legendY + 16;
    ctx.fillStyle = "rgba(42,30,18,0.1)";
    ctx.fillRect(mx + 8, tipY - 2, panelW - 16, tipH - 6);
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#4a3828";
    ctx.textAlign = "left";
    ctx.fillText("WASD 移动 · 左键 行动 · 右键 检查", mx + 14, tipY + 12);
    ctx.fillText("空格 行动 · F 采集 · J 攻击 · C 施法", mx + 14, tipY + 26);

    // Day dial tucked on header
    {
      const cx = mx + panelW - 28, cy = my + 20, R = 9;
      const nightAt = season.nightAt || 0.62;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(8,16,20,0.35)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + nightAt * Math.PI * 2);
      ctx.strokeStyle = "#e8c44a";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, R, -Math.PI / 2 + nightAt * Math.PI * 2, -Math.PI / 2 + Math.PI * 2);
      ctx.strokeStyle = "#4a6ab0";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      const ang = -Math.PI / 2 + dayT * Math.PI * 2;
      ctx.fillStyle = isNight() ? "#9ab0ff" : "#ffe56a";
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * (R - 1), cy + Math.sin(ang) * (R - 1), 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    drawMinimap._bottom = my + panelH + 4;
    drawMinimap._left = mx;
  }

  function drawBar(x, y, w, h, ratio, color) {
    ctx.fillStyle = "rgba(12,18,20,0.75)";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(x + 2, y + 2, Math.max(0, (w - 4) * clamp(ratio, 0, 1)), h - 4);
    ctx.strokeStyle = "rgba(255,240,200,0.25)";
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }

  function drawHudSlotFace(x, y, w, h, opts) {
    opts = opts || {};
    const chrome = opts.red ? (imgs.slotSqRed || imgs.slotSq) : (imgs.slotSq || null);
    if (chrome) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(chrome, x, y, w, h);
    } else {
      nineSlice(imgs.paper || imgs.uiBtnBlue || imgs.btn, x, y, w, h);
    }
    if (opts.fill) {
      ctx.fillStyle = opts.fill;
      ctx.fillRect(x + 5, y + 5, w - 10, h - 10);
    }
  }

  function drawInvItemIcon(it, ix, iy, s) {
    if (!it.img && it.key !== "light") return;
    if (it.bush && it.img) {
      drawFrame(it.img, 128, 128, 0, ix - 2, iy - 4, false, s / 128 * 1.15);
      return;
    }
    if (it.key === "light" && imgs.fire) {
      drawFrame(imgs.fire, 64, 64, Math.floor(time * 10) % 8, ix - 2, iy - 2, false, s / 50);
      return;
    }
    if (it.key === "charcoal" && it.img) {
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.drawImage(it.img, ix, iy, s, s);
      ctx.fillStyle = "rgba(20,16,12,0.55)";
      ctx.fillRect(ix, iy, s, s);
      ctx.restore();
      return;
    }
    if (it.key === "boards" && it.img) {
      ctx.drawImage(it.img, ix - 1, iy + 2, s * 0.9, s * 0.72);
      ctx.drawImage(it.img, ix + 4, iy - 2, s * 0.9, s * 0.72);
      return;
    }
    if (it.key === "cutstone" && it.img) {
      ctx.drawImage(it.img, ix, iy, s, s);
      ctx.strokeStyle = "rgba(90,90,100,0.7)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ix + 4, iy + 4, s - 8, s - 8);
      return;
    }
    if (it.key === "jerky" && it.img) {
      ctx.drawImage(it.img, ix, iy, s, s);
      ctx.fillStyle = "rgba(90,50,20,0.35)";
      ctx.fillRect(ix, iy, s, s);
      return;
    }
    if (it.cooked && it.img) {
      ctx.drawImage(it.img, ix, iy, s, s);
      if (imgs.fire) drawFrame(imgs.fire, 64, 64, Math.floor(time * 8) % 8, ix + s * 0.35, iy - 4, false, 0.38);
      return;
    }
    if (it.img) ctx.drawImage(it.img, ix, iy, s, s);
  }

  function drawBottomDock() {
    const items = [
      { img: imgs.woodIcon || imgs.icoWood, n: inv.wood || 0, name: "木头", key: "wood" },
      { img: imgs.goldIcon || imgs.icoGold, n: inv.gold || 0, name: "金子", key: "gold" },
      { img: imgs.rock4 || imgs.rock, n: inv.rocks || 0, name: "石头", key: "rocks" },
      { img: imgs.meatIcon || imgs.icoMeat, n: inv.meat || 0, name: "生肉", key: "meat" },
      { img: imgs.meatIcon || imgs.icoMeat, n: inv.cooked || 0, name: "熟肉", key: "cooked", cooked: true },
      { img: imgs.fire || imgs.icoGem, n: (inv.lantern || 0) > 0 ? inv.lantern : (inv.torch || 0), name: (inv.lantern || 0) > 0 ? "提灯" : "火把", key: "light", lit: !!player.torchOn },
      { img: imgs.bush2 || imgs.bush, n: inv.berries || 0, name: "浆果", key: "berries", bush: true },
      { img: imgs["en_bee_avatar"] || imgs.icoGold || imgs.goldIcon, n: inv.honey || 0, name: "蜂蜜", key: "honey" },
      { img: imgs.woodIcon || imgs.icoWood, n: inv.boards || 0, name: "木板", key: "boards" },
      { img: imgs.rock || imgs.rock4, n: inv.cutstone || 0, name: "石砖", key: "cutstone" },
      { img: imgs.meatIcon || imgs.icoMeat, n: inv.jerky || 0, name: "肉干", key: "jerky" },
      { img: imgs.woodIcon || imgs.icoWood, n: inv.charcoal || 0, name: "木炭", key: "charcoal" },
    ];

    const acts = [
      { icon: imgs.icoActForm || imgs.icoSword, key: "Q", label: player.form === "warrior" ? "武装" : "形态", fire: false },
      { icon: imgs.icoActUse || imgs.icoGem, key: "空格", label: interactVerbNearby() || "行动", fire: false },
      { icon: imgs.icoActGather || imgs.icoActHammer, key: "F", label: "采集", fire: false },
      { icon: imgs.icoSword || imgs.icoActForm, key: "J", label: "攻击", fire: false },
      { icon: imgs.icoActEat || imgs.icoMeat || imgs.meatIcon, key: "R", label: "进食", fire: false },
      { icon: imgs.icoActTorch || imgs.icoGem, key: "T", label: "照明", fire: true },
    ];

    const spells = [
      { k: "fire", name: "火", col: "#ff7a3a", glow: "rgba(255,120,50,0.35)", on: true },
      { k: "ice", name: "冰", col: "#7ad7ff", glow: "rgba(100,200,255,0.3)", on: !!runes.ice },
      { k: "lightning", name: "雷", col: "#ffe56a", glow: "rgba(255,220,80,0.3)", on: !!runes.lightning },
    ];

    const invSlot = 48;
    const invGap = 4;
    const actSlot = 44;
    const actGap = 3;
    const spellSlot = 52;
    const spellGap = 5;
    const padX = 10;
    const padY = 9;
    const sectionGap = 8;

    const actBand = acts.length * (actSlot + actGap) - actGap;
    const invBand = items.length * (invSlot + invGap) - invGap;
    const spellBand = spells.length * (spellSlot + spellGap) - spellGap;
    let dockW = padX * 2 + actBand + sectionGap + invBand + sectionGap + spellBand;
    const maxW = W - 16;
    const scale = dockW > maxW ? maxW / dockW : 1;
    dockW = Math.floor(dockW * scale);
    const dockH = Math.floor(92 * Math.max(0.92, Math.min(1, scale + 0.08)));
    const dockX = Math.floor((W - dockW) / 2);
    const dockY = H - dockH - 8;

    const sInv = Math.floor(invSlot * scale);
    const sInvG = Math.max(2, Math.floor(invGap * scale));
    const sAct = Math.floor(actSlot * scale);
    const sActG = Math.max(2, Math.floor(actGap * scale));
    const sSpell = Math.floor(spellSlot * scale);
    const sSpellG = Math.max(3, Math.floor(spellGap * scale));
    const sPadX = Math.floor(padX * scale);
    const sPadY = Math.floor(padY * scale);
    const sGap = Math.floor(sectionGap * scale);
    const actBandS = acts.length * (sAct + sActG) - sActG;
    const invBandS = items.length * (sInv + sInvG) - sInvG;

    // Tray
    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.fillRect(dockX + 3, dockY + 5, dockW, dockH);
    nineSlice(imgs.uiCarved || imgs.paper || imgs.banner, dockX, dockY, dockW, dockH);
    ctx.fillStyle = "rgba(18,28,26,0.22)";
    ctx.fillRect(dockX + 7, dockY + 7, dockW - 14, dockH - 14);

    // Divider ticks between sections
    const div1 = dockX + sPadX + actBandS + sGap * 0.5;
    const div2 = div1 + sGap * 0.5 + invBandS + sGap * 0.5;
    ctx.strokeStyle = "rgba(244,234,210,0.18)";
    ctx.lineWidth = 1;
    [div1, div2].forEach((dx) => {
      ctx.beginPath();
      ctx.moveTo(dx, dockY + 14);
      ctx.lineTo(dx, dockY + dockH - 14);
      ctx.stroke();
    });

    // —— Actions ——
    let ax = dockX + sPadX;
    const ay = dockY + sPadY + 2;
    acts.forEach((a) => {
      drawHudSlotFace(ax, ay, sAct, sAct + 16);
      if (a.fire && imgs.fire) {
        drawFrame(imgs.fire, 64, 64, Math.floor(time * 10) % 8, ax + 6, ay + 3, false, 0.48 * scale);
      } else if (a.icon) {
        const isz = Math.floor(30 * scale);
        ctx.drawImage(a.icon, ax + (sAct - isz) / 2, ay + 4, isz, isz);
      }
      ctx.fillStyle = "rgba(12,20,22,0.55)";
      ctx.fillRect(ax + 3, ay + sAct - 2, sAct - 6, 14);
      ctx.fillStyle = "#f4fff8";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(a.key, ax + sAct / 2, ay + sAct + 8);
      ctx.font = "8px sans-serif";
      ctx.fillStyle = "#d8c8a0";
      ctx.fillText(a.label, ax + sAct / 2, ay + sAct + 18);
      ax += sAct + sActG;
    });

    // —— Inventory ——
    let ix = dockX + sPadX + actBandS + sGap;
    const iy = dockY + sPadY;
    items.forEach((it) => {
      const empty = (it.n || 0) <= 0;
      ctx.globalAlpha = empty ? 0.55 : 1;
      drawHudSlotFace(ix, iy, sInv, sInv + 20);
      if (it.lit) {
        ctx.strokeStyle = "#ffb14a";
        ctx.lineWidth = 2;
        ctx.strokeRect(ix + 2, iy + 2, sInv - 4, sInv + 14);
      }
      drawInvItemIcon(it, ix + 7, iy + 5, Math.floor(32 * scale));
      ctx.fillStyle = empty ? "#6a5640" : "#2a1e12";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(String(it.n), ix + sInv - 4, iy + 40);
      ctx.font = "8px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#4a3824";
      ctx.fillText(it.name, ix + sInv / 2, iy + sInv + 14);
      ctx.globalAlpha = 1;
      ix += sInv + sInvG;
    });

    // —— Spells ——
    let sx = dockX + sPadX + actBandS + sGap + invBandS + sGap;
    const sy = dockY + sPadY;
    spells.forEach((s, i) => {
      ctx.globalAlpha = s.on ? 1 : 0.38;
      drawHudSlotFace(sx, sy, sSpell, sSpell + 16, { red: s.k === "fire" });
      if (spell === s.k && s.on) {
        ctx.fillStyle = s.glow;
        ctx.fillRect(sx + 3, sy + 3, sSpell - 6, sSpell + 8);
        ctx.strokeStyle = s.col;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(sx + 2, sy + 2, sSpell - 4, sSpell + 10);
      }
      if (s.k === "fire" && imgs.fire) {
        drawFrame(imgs.fire, 64, 64, Math.floor(time * 10) % 8, sx + 8, sy + 4, false, 0.52 * scale);
      } else if (s.k === "ice") {
        const gem = imgs.icoGem || imgs.icoShield;
        if (gem) {
          const gz = Math.floor(28 * scale);
          ctx.drawImage(gem, sx + (sSpell - gz) / 2, sy + 6, gz, gz);
          ctx.fillStyle = "rgba(80,190,255,0.35)";
          ctx.fillRect(sx + (sSpell - gz) / 2, sy + 6, gz, gz);
        }
      } else {
        const bolt = imgs.icoBuff2 || imgs.icoSword || imgs.icoGem;
        if (bolt) {
          const bz = Math.floor(28 * scale);
          ctx.drawImage(bolt, sx + (sSpell - bz) / 2, sy + 6, bz, bz);
          ctx.fillStyle = "rgba(255,220,80,0.28)";
          ctx.fillRect(sx + (sSpell - bz) / 2, sy + 6, bz, bz);
        }
      }
      ctx.fillStyle = "#f8f4e8";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.name, sx + sSpell / 2, sy + sSpell - 2);
      ctx.font = "bold 10px sans-serif";
      ctx.fillStyle = s.col;
      ctx.fillText(String(i + 1), sx + sSpell / 2, sy + sSpell + 12);
      ctx.globalAlpha = 1;
      sx += sSpell + sSpellG;
    });

    // Hint sits just above the dock
    if (interactHint) {
      ctx.textAlign = "center";
      ctx.font = "bold 15px sans-serif";
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillText(interactHint, W / 2 + 1, dockY - 10);
      ctx.fillStyle = "#fff7d6";
      ctx.fillText(interactHint, W / 2, dockY - 11);
    } else if (cursorHint && state === STATE.PLAY) {
      ctx.textAlign = "center";
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "rgba(220,235,230,0.9)";
      ctx.fillText(cursorHint, W / 2, dockY - 11);
    }

    drawBottomDock._top = dockY;
  }

  function drawHUD() {
    // Single HUD card — avoids night-overlay "vertical strip" beside bare bars
    nineSlice(imgs.paper || imgs.uiCarved, 10, 8, 340, 142);
    const av = (player.form === "warrior" && imgs.avatarWar) ? imgs.avatarWar : imgs.avatar;
    if (av) ctx.drawImage(av, 18, 16, 72, 72);
    ctx.font = "bold 15px sans-serif";
    ctx.fillStyle = "#3a2a1a";
    ctx.textAlign = "left";
    ctx.fillText(player.form === "warrior" ? "战士" : (player.charName || "KC1"), 98, 30);
    drawBar(98, 40, 168, 11, player.hp / player.maxHp, "#d4544c");
    drawBar(98, 56, 168, 9, player.mp / player.maxMp, "#4aa7d8");
    drawBar(98, 70, 168, 8, player.hunger / (player.maxHunger || 150), "#d29a3a");
    const sanity = clamp(100 - (player.corr || 0), 0, 100);
    drawBar(98, 84, 168, 8, sanity / 100, "#8b4cc9");
    const tCol = player.temp < 28 ? "#7ec8ff" : player.temp > 78 ? "#ff8a4a" : "#9fd4a0";
    drawBar(98, 98, 168, 8, player.temp / 100, tCol);
    const wet = (wetness && wetness.wet) || 0;
    drawBar(98, 112, 168, 6, wet / 100, "#5a9fd8");
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#4a3824";
    ctx.fillText("生命", 274, 50);
    ctx.fillText("魔力", 274, 65);
    ctx.fillText("饥饿", 274, 78);
    ctx.fillText("理智", 274, 92);
    ctx.fillText("体温", 274, 106);
    ctx.fillText("潮湿度", 268, 118);
    if (testMode) {
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#2a6b3a";
      ctx.fillText("测试模式 · 无敌", 98, 132);
    }

    drawMinimap();

    // Status line under map card (tool / form) — keeps top-right uncluttered
    {
      let status = "";
      if (player.form === "warrior") {
        status = "形态：武装" + ((player.warRank || 1) >= 2 ? "·精炼" : "") + " · Q 卸甲 · Shift 格挡";
      } else if (player.mighty) {
        const st = player._mighty ? "强壮" : (player._wimpy ? "虚弱" : "常态");
        status = "沃尔夫冈：" + st;
      } else if (player.tool) {
        const toolName = { axe: "斧", pickaxe: "镐", knife: "刀", hammer: "锤" }[player.tool] || player.tool;
        let dur = "";
        if (toolDur && (player.tool === "axe" || player.tool === "pickaxe") && toolDur[player.tool]) {
          dur = " · 耐久" + toolDur[player.tool].uses;
        }
        status = "工具：" + toolName + dur + (inv.warKit ? " · Q 武装" : "");
      }
      if (status) {
        const sy = (drawMinimap._bottom || 280) + 14;
        ctx.textAlign = "right";
        ctx.font = "11px sans-serif";
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillText(status, W - 16, sy + 1);
        ctx.fillStyle = "#e8f0ec";
        ctx.fillText(status, W - 16, sy);
      }
    }

    ctx.textAlign = "left";
    drawBottomDock();

    toasts.forEach((t, i) => {
      ctx.globalAlpha = Math.min(1, t.life * 2);
      ctx.textAlign = "center";
      ctx.font = "15px sans-serif";
      ctx.fillStyle = "#fff";
      ctx.fillText(t.msg, W / 2, 130 + i * 22);
      ctx.globalAlpha = 1;
    });

    if (player.armor > 0) {
      ctx.textAlign = "left";
      ctx.fillStyle = "#3a2a1a";
      ctx.font = "11px sans-serif";
      ctx.fillText("木甲 " + player.armor + "/3", 98, 122);
    }
    const buffIcons = [];
    if (player.buffSpeed > 0) buffIcons.push([imgs.icoBuff1, player.buffSpeed, "#7dffb0"]);
    if (player.buffPower > 0) buffIcons.push([imgs.icoBuff2, player.buffPower, "#ff8a6a"]);
    if (player.buffWarm > 0) buffIcons.push([imgs.icoBuff3, player.buffWarm, "#ffc86a"]);
    if (player.buffCool > 0) buffIcons.push([imgs.icoBuff1 || imgs.icoBuff3, player.buffCool, "#7ec8ff"]);
    buffIcons.forEach((b, i) => {
      const x = 12 + i * 44, y = 144;
      nineSlice(imgs.paper, x, y, 40, 36);
      if (b[0]) ctx.drawImage(b[0], x + 4, y + 2, 24, 24);
      ctx.fillStyle = b[2];
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(String(Math.ceil(b[1])), x + 36, y + 30);
    });

    if (chestOpen) drawChestUI();
    if (bagOpen) drawBagUI();
    if (craftOpen) drawCraftMenu();
    if (cookOpen) drawCookMenu();

    const cur = player.attacking > 0 ? imgs.cursorAtk : imgs.cursor;
    if (cur) ctx.drawImage(cur, mouse.x - 8, mouse.y - 8, 32, 32);
    else {
      ctx.fillStyle = "#fff";
      ctx.fillRect(mouse.x, mouse.y, 8, 8);
    }
  }

  function bagSlotCount() {
    let n = (window.DstSys && window.DstSys.BAG_SIZE) || 15;
    if (player && player.piggyback) n = Math.max(n, 21);
    else if (player && player.backpack) n = Math.max(n, 19);
    return n;
  }

  function bagItems() {
    const order = ["wood","boards","gold","rocks","cutstone","silk","meat","monster","cooked","jerky","fish","berries","carrot","honey","jam","meatpie","feast","torch","lantern","rope","flint","twigs","grass","charcoal","trinket","dung","seeds","carrot_seed","warmstone","mapscroll","spicy","trail","spear","shovel","hammer","umbrella","raincoat","oar","winterhat","beehat","mast","anchor"];
    const maxSlots = bagSlotCount();
    const slots = [];
    for (const k of order) {
      const n = inv[k] || 0;
      if (n <= 0) continue;
      const cap = (window.DstSys && window.DstSys.STACK[k]) || 40;
      let left = n;
      while (left > 0 && slots.length < maxSlots) {
        const take = Math.min(cap, left);
        slots.push({ id: k, n: take, fresh: window.DstSys ? window.DstSys.spoilFreshness(inv, k) : 1 });
        left -= take;
      }
      if (slots.length >= maxSlots) break;
    }
    while (slots.length < maxSlots) slots.push(null);
    return slots;
  }

  function drawBagUI() {
    const slots = bagItems();
    const maxSlots = slots.length;
    const cols = 5;
    const rows = Math.ceil(maxSlots / cols);
    const pw = 420, ph = 70 + rows * 64 + 24;
    const px = W / 2 - pw / 2, py = H / 2 - ph / 2 - 20;
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, W, H);
    nineSlice(imgs.uiCarved || imgs.paper, px, py, pw, ph);
    ctx.textAlign = "center";
    ctx.fillStyle = "#f4ead2";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("背包 · " + maxSlots + " 格（饥荒式堆叠）", W / 2, py + 28);
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#d8c8a8";
    ctx.fillText("I 关闭 · 色条为新鲜度" + ((inv.warmstone || 0) > 0 ? " · 暖石热量 " + Math.round(warmstoneHeat) : ""), W / 2, py + 48);
    bagHover = -1;
    for (let i = 0; i < maxSlots; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const x = px + 30 + col * 74, y = py + 70 + row * 64;
      const hover = mouse.x >= x && mouse.x <= x + 64 && mouse.y >= y && mouse.y <= y + 56;
      if (hover) bagHover = i;
      nineSlice(imgs.paper, x, y, 64, 56);
      const s = slots[i];
      if (!s) continue;
      ctx.fillStyle = "#3a2a1a";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(costLabel(s.id), x + 32, y + 16);
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("×" + s.n, x + 32, y + 36);
      if (s.fresh < 1) {
        ctx.fillStyle = s.fresh > 0.5 ? "#7ecf6a" : (s.fresh > 0.2 ? "#d4b44a" : "#c44");
        ctx.fillRect(x + 8, y + 44, 48 * s.fresh, 6);
      }
    }
  }

  function drawChestUI() {
    if (!chestOpen || !chestOpen.store) return;
    const isFridge = !!chestOpen.icebox;
    const keys = isFridge
      ? ["meat", "cooked", "fish", "berries", "jam", "jerky", "honey", "seeds"]
      : ["wood", "gold", "meat", "cooked", "torch", "berries"];
    const labels = { wood: "木头", gold: "金子", meat: "肉", cooked: "熟食", torch: "火把", berries: "浆果", fish: "鱼", jam: "果酱", jerky: "肉干", honey: "蜂蜜", seeds: "种子" };
    const pw = isFridge ? 620 : 520, ph = 210;
    const px = W / 2 - pw / 2, py = H / 2 - ph / 2 - 40;
    nineSlice(imgs.uiCarved || imgs.paper, px, py, pw, ph);
    ctx.textAlign = "center";
    ctx.fillStyle = "#f4ead2";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText((isFridge ? "冰箱（保鲜）" : "木箱") + " · 点击：存入 · Shift+点击：取出", W / 2, py + 32);
    chestHover = "";
    const gap = keys.length > 6 ? 72 : 82;
    keys.forEach((k, i) => {
      const x = px + 20 + i * gap;
      const y = py + 58;
      const hover = mouse.x >= x && mouse.x <= x + 64 && mouse.y >= y && mouse.y <= y + 70;
      if (hover) chestHover = k;
      nineSlice(imgs.paper, x, y, 64, 70);
      ctx.fillStyle = "#3a2a1a";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(labels[k], x + 32, y + 16);
      ctx.font = "bold 13px sans-serif";
      ctx.fillText((chestOpen.store[k] || 0) + "/" + (inv[k] || 0), x + 32, y + 48);
    });
    nineSlice(imgs.uiBtnBlue || imgs.btn, px + 40, py + ph - 58, 150, 42);
    nineSlice(imgs.uiBtnBlue || imgs.btn, px + pw - 190, py + ph - 58, 150, 42);
    ctx.fillStyle = "#f7fff8";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("全部存入", px + 115, py + ph - 30);
    ctx.fillText("全部取出", px + pw - 115, py + ph - 30);
    if (mouse.x >= px + 40 && mouse.x <= px + 190 && mouse.y >= py + ph - 58 && mouse.y <= py + ph - 16) chestHover = "__deposit";
    if (mouse.x >= px + pw - 190 && mouse.x <= px + pw - 40 && mouse.y >= py + ph - 58 && mouse.y <= py + ph - 16) chestHover = "__withdraw";
  }

  function chestTransfer(kind, toChest) {
    if (!chestOpen || !chestOpen.store) return;
    if (toChest) {
      if ((inv[kind] || 0) <= 0) return;
      inv[kind]--;
      chestOpen.store[kind] = (chestOpen.store[kind] || 0) + 1;
    } else {
      if ((chestOpen.store[kind] || 0) <= 0) return;
      chestOpen.store[kind]--;
      inv[kind] = (inv[kind] || 0) + 1;
    }
  }

  function chestDump(toChest) {
    if (!chestOpen || !chestOpen.store) return;
    for (const k of ["wood", "gold", "meat", "cooked", "torch", "berries", "seeds", "jam"]) {
      if (toChest) {
        const n = inv[k] || 0;
        inv[k] = 0;
        chestOpen.store[k] = (chestOpen.store[k] || 0) + n;
      } else {
        const n = chestOpen.store[k] || 0;
        chestOpen.store[k] = 0;
        inv[k] = (inv[k] || 0) + n;
      }
    }
  }

  function costLabel(k) {
    return ({
      wood: "木头", gold: "金子", meat: "肉", fish: "鱼", honey: "蜂蜜", torch: "火把", cooked: "熟肉",
      berries: "浆果", seeds: "种子", jam: "果酱", lantern: "提灯", boards: "木板", rope: "绳索",
      cutstone: "石砖", rocks: "石头", monster: "怪物肉", trinket: "饰品", flint: "燧石", twigs: "树枝", grass: "草",
      meatpie: "肉饼", spicy: "辛香", trail: "果脯", feast: "大餐", warmstone: "暖石", mapscroll: "舆图",
      spear: "长矛", hammer: "锤子", shovel: "铲子", umbrella: "草伞",
      charcoal: "木炭", jerky: "肉干", oar: "桨", mast: "桅杆", anchor: "船锚",
      silk: "丝绸", winterhat: "冬帽", beehat: "养蜂帽", monster: "怪物肉", raincoat: "雨衣",
    })[k] || k;
  }

  function itemIcon(k) {
    const map = {
      wood: imgs.woodIcon || imgs.icoWood,
      boards: imgs.icoWood || imgs.woodIcon,
      gold: imgs.goldIcon || imgs.icoGold,
      meat: imgs.meatIcon || imgs.icoMeat,
      cooked: imgs.meatIcon || imgs.icoMeat,
      jerky: imgs.meatIcon || imgs.icoMeat,
      fish: imgs.meatIcon,
      berries: imgs.bush2 || imgs.bush,
      honey: imgs["en_bee_avatar"] || imgs.goldIcon,
      torch: imgs.fire,
      lantern: imgs.fire,
      flint: imgs.rock || imgs.icoGold,
      rocks: imgs.rock4 || imgs.rock,
      cutstone: imgs.rock2 || imgs.rock,
      twigs: imgs.icoWood || imgs.woodIcon,
      grass: imgs.bush || imgs.bush2,
      rope: imgs.icoGem || imgs.woodIcon,
      charcoal: imgs.icoWood || imgs.woodIcon,
      monster: imgs.meatIcon,
      seeds: imgs.bush,
    };
    return map[k] || imgs.icoGem || imgs.woodIcon;
  }

  function finishCookJob(job) {
    if (!job) return;
    if (job.fail || !job.out) {
      toast("煮成了一锅湿腻焦物……", 3);
      return;
    }
    gainItem(job.out, job.n || 1);
    inv._cookBoost = inv._cookBoost || {};
    const prev = inv._cookBoost[job.out] || { n: 0 };
    inv._cookBoost[job.out] = {
      n: (prev.n || 0) + (job.n || 1),
      hunger: job.hunger != null ? job.hunger : prev.hunger,
      hp: job.hp != null ? job.hp : prev.hp,
      sanity: job.sanity != null ? job.sanity : prev.sanity,
      name: job.name,
    };
    if (inv._spoil) delete inv._spoil[job.out];
    toast("炖锅：" + (job.name || "菜") + " 好了（新鲜出锅）。", 3);
    if (window.DstAudio) window.DstAudio.cook();
    floatText(player.x, player.y - 40, "出锅!", "#ffe56a");
  }

  function updateCookJob(dt) {
    if (!cookJob) return;
    cookJob.t += dt;
    if (cookJob.t >= cookJob.need) {
      const job = cookJob;
      cookJob = null;
      finishCookJob(job);
    }
  }

  function updateRoastJob(dt) {
    if (!roastJob) return;
    const f = nearestFire(90);
    if (!f || !f.lit || (f.fuel || 0) <= 0) {
      toast("火灭了，烤肉糊了……", 2);
      roastJob = null;
      return;
    }
    roastJob.t += dt;
    f.fuel = Math.max(0, (f.fuel || 0) - dt * 2.5); // roasting eats fuel
    if (roastJob.t >= roastJob.need) {
      const out = roastJob.out || "cooked";
      gainItem(out, 1);
      if (inv._spoil) delete inv._spoil[out];
      inv._cookBoost = inv._cookBoost || {};
      const prev = inv._cookBoost[out] || { n: 0 };
      inv._cookBoost[out] = { n: (prev.n || 0) + 1, hunger: 55, hp: 18, sanity: 8, name: roastJob.name || "烤肉" };
      toast((roastJob.name || "烤肉") + "烤好了。", 2.5);
      floatText(f.x, f.y - 40, "香!", "#ffe56a");
      if (window.DstAudio) window.DstAudio.cook();
      roastJob = null;
    }
  }

  function tryCookSlots() {
    if (!window.DstSys) return;
    const nearPot = buildings.some((b) => b.cook && dist(player.x, player.y, b.x, b.y) < 70);
    if (!nearPot) { toast("靠近炖锅才能烹煮。"); return; }
    if (cookJob) {
      const left = Math.max(0, cookJob.need - cookJob.t);
      toast("锅里还在煮……约 " + Math.ceil(left) + " 秒。", 2);
      return;
    }
    const filled = cookSlots.filter(Boolean);
    if (!filled.length) { toast("先往四格里放原料。"); return; }
    for (let i = 0; i < 4; i++) {
      const id = cookSlots[i];
      if (id && (inv[id] || 0) <= 0) { toast("原料不足。"); return; }
    }
    const recipe = window.DstSys.matchCook(cookSlots);
    for (let i = 0; i < 4; i++) {
      const id = cookSlots[i];
      if (!id) continue;
      inv[id]--;
      cookSlots[i] = null;
    }
    if (!recipe || recipe.fail || !recipe.out) {
      cookJob = { t: 0, need: 2.2, fail: true };
      toast("锅里咕嘟起来……不太妙。", 2);
      return;
    }
    const need = 4.5 + filled.length * 0.8; // DST-ish wait
    cookJob = {
      t: 0, need,
      out: recipe.out, n: recipe.n || 1,
      hunger: recipe.hunger, hp: recipe.hp, sanity: recipe.sanity, name: recipe.name,
    };
    toast("开始炖煮：" + recipe.name + "（约 " + Math.ceil(need) + " 秒）", 2.5);
    cookOpen = false;
  }

  function cycleCookSlot(i) {
    const foods = ["meat", "fish", "berries", "honey", "monster", "seeds", "cooked", null];
    const cur = cookSlots[i];
    let idx = foods.indexOf(cur);
    for (let n = 0; n < foods.length; n++) {
      idx = (idx + 1) % foods.length;
      const id = foods[idx];
      if (id == null) { cookSlots[i] = null; return; }
      if ((inv[id] || 0) > 0) { cookSlots[i] = id; return; }
    }
    cookSlots[i] = null;
  }

  function craftRecipesFiltered() {
    const all = (window.EnemyPack && window.EnemyPack.RECIPES) || [];
    return all.filter((r) => (r.tab || "survive") === craftTab);
  }

  function craftLayout() {
    const tabs = (window.EnemyPack && window.EnemyPack.CRAFT_TABS) || [];
    const recipes = craftRecipesFiltered();
    const pw = Math.min(680, W - 24);
    const rowH = 58;
    const tabH = 40;
    const ph = Math.min(H - 20, 100 + tabH + Math.max(recipes.length, 1) * rowH);
    const px = W / 2 - pw / 2;
    const py = Math.max(8, H / 2 - ph / 2);
    return { recipes, tabs, pw, ph, px, py, rowH, tabH };
  }

  function drawCraftMenu() {
    const { recipes, tabs, pw, ph, px, py, rowH, tabH } = craftLayout();
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, W, H);
    nineSlice(imgs.uiCarved || imgs.paper, px, py, pw, ph);
    ctx.textAlign = "center";
    ctx.fillStyle = "#f4ead2";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("制作", W / 2, py + 26);
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#d8c8a8";
    ctx.fillText("Tab 关闭 · 饥荒式分页 · 图标为材料", W / 2, py + 44);

    craftHover = -1;
    let craftTabHover = null;
    const tw = Math.floor((pw - 24) / Math.max(tabs.length, 1));
    tabs.forEach((t, i) => {
      const tx = px + 12 + i * tw, ty = py + 52;
      const hover = mouse.x >= tx && mouse.x <= tx + tw - 3 && mouse.y >= ty && mouse.y <= ty + tabH - 6;
      if (hover) craftTabHover = t.id;
      const on = craftTab === t.id;
      nineSlice(on || hover ? (imgs.uiBtnBlueP || imgs.btnP) : (imgs.paper), tx, ty, tw - 3, tabH - 6);
      ctx.fillStyle = on ? "#f4fff8" : "#3a2a1a";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(t.name, tx + (tw - 3) / 2, ty + 20);
    });
    drawCraftMenu._tabHover = craftTabHover;

    const listTop = py + 52 + tabH;
    if (!recipes.length) {
      ctx.fillStyle = "#d8c8a8";
      ctx.font = "14px sans-serif";
      ctx.fillText("此页暂无配方", W / 2, listTop + 40);
      return;
    }
    recipes.forEach((r, i) => {
      const bx = px + 16, by = listTop + i * rowH, bw = pw - 32, bh = rowH - 6;
      const hover = mouse.x >= bx && mouse.x <= bx + bw && mouse.y >= by && mouse.y <= by + bh;
      if (hover) craftHover = i;
      const afford = canAfford(r.cost);
      const nearOk = !r.nearFire || !!nearestFire(90);
      const ctxGate = craftCtx();
      const sciOk = !(r.science === 1 && !ctxGate.hasScience(1)) && !(r.science === 2 && !ctxGate.hasScience(2)) && !(r.magic === 2 && !ctxGate.hasMagic(2));
      const charOk = !r.char || (player && player.charId === r.char);
      const ok = afford && nearOk && sciOk && charOk;
      nineSlice(hover && ok ? (imgs.uiBtnBlueP || imgs.btnP) : (imgs.uiBtnBlue || imgs.btn), bx, by, bw, bh);
      ctx.globalAlpha = ok ? 1 : 0.45;
      ctx.textAlign = "left";
      ctx.fillStyle = "#f7fff8";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(r.name, bx + 14, by + 20);
      ctx.font = "10px sans-serif";
      ctx.fillStyle = "#e8f0ea";
      const desc = (r.desc || "").length > 42 ? r.desc.slice(0, 40) + "…" : (r.desc || "");
      ctx.fillText(desc, bx + 14, by + 38);
      // Cost icons (DST-like)
      const entries = Object.entries(r.cost || {});
      let cx = bx + bw - 12;
      for (let ci = entries.length - 1; ci >= 0; ci--) {
        const [k, n] = entries[ci];
        const icon = itemIcon(k);
        cx -= 36;
        if (icon) {
          try {
            if (k === "berries" || k === "grass") drawFrame(icon, 128, 128, 0, cx, by + 8, false, 0.22);
            else if (k === "torch" || k === "lantern") drawFrame(icon, 64, 64, 0, cx + 2, by + 10, false, 0.45);
            else ctx.drawImage(icon, cx, by + 10, 28, 28);
          } catch (e) {}
        }
        ctx.fillStyle = ((inv[k] || 0) >= n) ? "#f4fff8" : "#f88";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("×" + n, cx + 26, by + 44);
      }
      ctx.globalAlpha = 1;
    });
  }


  function drawCookMenu() {
    const recipes = (window.EnemyPack && window.EnemyPack.COOK_RECIPES) || [];
    const rowH = 52;
    const slotH = 78;
    const pw = Math.min(520, W - 40);
    const ph = Math.min(H - 36, 88 + slotH + recipes.length * rowH);
    const px = W / 2 - pw / 2;
    const py = Math.max(12, H / 2 - ph / 2);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, W, H);
    nineSlice(imgs.uiCarved || imgs.paper, px, py, pw, ph);
    ctx.textAlign = "center";
    ctx.fillStyle = "#f4ead2";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("烹饪锅", W / 2, py + 34);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#d8c8a8";
    ctx.fillText(cookJob ? ("炖煮中：" + (cookJob.name || "…") + " " + Math.ceil(Math.max(0, cookJob.need - cookJob.t)) + "s") : "四格投料 · 空格开煮（需等待）· 下方固定食谱", W / 2, py + 54);
    const slotNames = { meat: "肉", fish: "鱼", berries: "浆果", honey: "蜜", monster: "怪物肉", seeds: "种子", cooked: "熟食" };
    cookSlotHover = -1;
    for (let i = 0; i < 4; i++) {
      const sx = px + 40 + i * 100, sy = py + 64;
      const hover = mouse.x >= sx && mouse.x <= sx + 72 && mouse.y >= sy && mouse.y <= sy + 56;
      if (hover) cookSlotHover = i;
      nineSlice(imgs.paper, sx, sy, 72, 56);
      const id = cookSlots[i];
      if (id && itemIcon(id)) {
        const ic = itemIcon(id);
        ctx.drawImage(ic, sx + 20, sy + 6, 32, 32);
      }
      ctx.fillStyle = "#3a2a1a";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(id ? (slotNames[id] || id) : "空", sx + 36, sy + 46);
    }
    const cookBtn = { x: px + pw - 130, y: py + 70, w: 100, h: 44 };
    nineSlice(imgs.uiBtnBlue || imgs.btn, cookBtn.x, cookBtn.y, cookBtn.w, cookBtn.h);
    ctx.fillStyle = "#f7fff8";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(cookJob ? "煮着…" : "开煮", px + pw - 80, py + 98);
    drawCookMenu._cookBtn = cookBtn;
    cookHover = -1;
    if (mouse.x >= cookBtn.x && mouse.x <= cookBtn.x + cookBtn.w && mouse.y >= cookBtn.y && mouse.y <= cookBtn.y + cookBtn.h) {
      cookHover = -2;
    }
    recipes.forEach((r, i) => {
      const bx = px + 24, by = py + 68 + slotH + i * rowH, bw = pw - 48, bh = rowH - 6;
      const hover = mouse.x >= bx && mouse.x <= bx + bw && mouse.y >= by && mouse.y <= by + bh;
      if (hover) cookHover = i;
      const seasonOk = !r.season || r.season === (currentSeason() || {}).id;
      const ok = canAfford(r.cost) && seasonOk;
      nineSlice(hover && ok ? (imgs.uiBtnBlueP || imgs.btnP) : (imgs.uiBtnBlue || imgs.btn), bx, by, bw, bh);
      ctx.globalAlpha = ok ? 1 : 0.45;
      ctx.textAlign = "left";
      ctx.fillStyle = "#f7fff8";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText(r.name, bx + 16, by + 22);
      ctx.font = "11px sans-serif";
      ctx.fillText(r.desc, bx + 16, by + 40);
      ctx.textAlign = "right";
      ctx.fillText(Object.entries(r.cost || {}).map(([k, n]) => k + "×" + n).join(" "), bx + bw - 14, by + 32);
      ctx.globalAlpha = 1;
    });
  }

  function tryCook(recipe) {
    if (!recipe) return;
    if (recipe.season) {
      const sid = (currentSeason() || {}).id;
      if (sid !== recipe.season) {
        toast("这道菜只在" + ({ spring: "春", summer: "夏", autumn: "秋", winter: "冬" }[recipe.season] || recipe.season) + "季可做。");
        return;
      }
    }
    if (!canAfford(recipe.cost)) { toast("材料不足。"); return; }
    payCost(recipe.cost);
    const ok = recipe.craft(craftCtx());
    if (ok === false) {
      for (const [k, n] of Object.entries(recipe.cost || {})) inv[k] = (inv[k] || 0) + n;
    }
  }

  function hitMenuBtn() {
    const bw = Math.min(220, Math.floor(W * 0.22));
    const bh = 46;
    const gap = 10;
    const tipReserve = 48;
    let hasSave = false;
    try { hasSave = !!localStorage.getItem(SAVE_KEY); } catch (e) { hasSave = false; }
    // 新的放逐 / 继续? / 世界图鉴 / 测试模式
    const rows = hasSave ? 4 : 3;
    const stackH = rows * bh + (rows - 1) * gap + tipReserve;
    const bx = Math.max(16, W - bw - 24);
    const logoClear = Math.floor(H * 0.34);
    let by = H - stackH - 18;
    if (by < logoClear) by = logoClear;
    const ys = [by];
    for (let i = 1; i < rows; i++) ys.push(ys[i - 1] + bh + gap);
    let i = 0;
    const yNew = ys[i++];
    const yCont = hasSave ? ys[i++] : -9999;
    const yCodex = ys[i++];
    const yTest = ys[i++];
    const hit = (yy) => mouse.x >= bx && mouse.x <= bx + bw && mouse.y >= yy && mouse.y <= yy + bh;
    return {
      bx, bw, bh, gap, hasSave,
      by: yNew, by2: yCont, codexY: yCodex, testY: yTest,
      hitNew: hit(yNew),
      hitCont: hasSave && hit(yCont),
      hitCodex: hit(yCodex),
      hitTest: hit(yTest),
    };
  }



  function drawCharSelect() {
    ctx.fillStyle = "#07161a";
    ctx.fillRect(0, 0, W, H);
    const cols = 3;
    const gapX = 14, gapY = 12;
    const cardW = Math.min(220, Math.floor((Math.min(W - 80, 720) - (cols - 1) * gapX) / cols));
    const cardH = 92;
    const rows = Math.ceil(CHARACTERS.length / cols);
    const gridW = cols * cardW + (cols - 1) * gapX;
    const gridH = rows * cardH + (rows - 1) * gapY;
    const panelW = Math.min(W - 40, gridW + 48);
    const panelH = Math.min(H - 40, gridH + 120);
    const panelX = (W - panelW) / 2;
    const panelY = Math.max(20, (H - panelH) / 2);
    nineSlice(imgs.uiCarved || imgs.paper, panelX, panelY, panelW, panelH);
    ctx.textAlign = "center";
    ctx.fillStyle = "#f4ead2";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("选择幸存者", W / 2, panelY + 38);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#c8b898";
    ctx.fillText("点击角色，或按 1–6 / Enter 开局", W / 2, panelY + 58);
    drawCharSelect._hits = [];
    const gridX = panelX + (panelW - gridW) / 2;
    const gridY = panelY + 78;
    CHARACTERS.forEach((ch, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = gridX + col * (cardW + gapX);
      const y = gridY + row * (cardH + gapY);
      const w = cardW, h = cardH;
      const hover = mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + h;
      nineSlice(hover || charPick === ch.id ? (imgs.uiBtnBlueP || imgs.btnP) : (imgs.uiBtnBlue || imgs.btn), x, y, w, h);
      ctx.fillStyle = "#f7fff8";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText((i + 1) + ". " + ch.name, x + 14, y + 30);
      ctx.font = "11px sans-serif";
      ctx.fillStyle = "#d8e8e0";
      // Short desc; wrap manually left-aligned (wrapText centers)
      const maxW = w - 28;
      let line = "", ly = y + 50;
      for (const chs of ch.desc) {
        if (ctx.measureText(line + chs).width > maxW) {
          ctx.fillText(line, x + 14, ly);
          line = chs;
          ly += 14;
          if (ly > y + h - 10) break;
        } else line += chs;
      }
      if (line && ly <= y + h - 10) ctx.fillText(line, x + 14, ly);
      drawCharSelect._hits.push({ ch, x, y, w, h });
    });
  }


  function codexEntries() {
    const buildingCatalog = [
      { name: "木屋", img: "house", desc: "蓝旗据点民居。可靠近歇息至黎明并自动存档。" },
      { name: "木屋·二", img: "house2", desc: "据点另一栋民居，功能相同。" },
      { name: "箭场", img: "archeryB", desc: "带靶场的训练棚。据点南侧常见。" },
      { name: "石塔", img: "towerB", desc: "瞭望石塔，据点北侧地标。" },
      { name: "修道院", img: "monastery", desc: "高耸礼拜堂。僧侣常在附近。" },
      { name: "营房", img: "barracksB", desc: "石砌营房，据点南侧防御建筑。" },
      { name: "蓝旗城堡", img: "castleB", desc: "蓝旗大本营式城堡。" },
      { name: "赤旗城堡", img: "castleR", desc: "红旗要塞核心。击败僭主的目标区域。" },
      { name: "赤旗塔楼", img: "towerR", desc: "红旗要塞附属塔楼。" },
      { name: "赤旗营房", img: "barracksR", desc: "红旗驻军营房。" },
      { name: "赤旗民居", img: "houseR", desc: "红旗民居。" },
      { name: "赤旗民居·一", img: "houseR1", desc: "红旗民居变体。" },
      { name: "赤旗民居·三", img: "houseR3", desc: "红旗民居变体。" },
      { name: "赤旗箭场", img: "archeryR", desc: "红旗靶场。" },
      { name: "赤旗修道院", img: "monasteryR", desc: "红旗修道院。" },
      { name: "哥布林小屋", img: "goblinHut", fw: 192, fh: 256, frames: 16, sheet: true, desc: "林中哥布林聚落的木屋。" },
      { name: "哥布林木屋", img: "goblinHouse", desc: "更大的哥布林居所。" },
      { name: "哥布林木塔", img: "woodTowerG", fw: 256, fh: 192, frames: 4, sheet: true, desc: "哥布林木制瞭望塔。" },
      { name: "哥布林蓝塔", img: "woodTowerB", fw: 256, fh: 192, frames: 4, sheet: true, desc: "哥布林木塔·蓝。" },
      { name: "哥布林紫塔", img: "woodTowerP", fw: 256, fh: 192, frames: 4, sheet: true, desc: "哥布林木塔·紫。" },
      { name: "哥布林金塔", img: "woodTowerY", fw: 256, fh: 192, frames: 4, sheet: true, desc: "哥布林木塔·金。" },
      { name: "侏儒塔", img: "gnomeTower", desc: "侏儒派系高塔。" },
      { name: "侏儒小屋", img: "gnomeHut", desc: "侏儒派系小屋。" },
      { name: "金矿", img: "goldMine", desc: "可开采的金矿脉，采空后会缓慢回填。" },
      { name: "洞窟口", img: "caveIdle", fw: 192, fh: 192, frames: 8, sheet: true, desc: "通往地下蝠穴与矿脉厅的入口。" },
      { name: "猪王殿", img: "castleY", desc: "猪王国中心。可献上肉/饰品换金币。" },
      { name: "金旗箭场", img: "archeryY", desc: "金旗靶场。" },
      { name: "金旗营房", img: "barracksY", desc: "金旗营房。" },
      { name: "金旗民居·一", img: "houseY1", desc: "金旗民居。" },
      { name: "金旗民居·三", img: "houseY3", desc: "金旗民居变体。" },
      { name: "紫旗城堡", img: "castleP", desc: "紫旗要塞。" },
      { name: "紫旗塔楼", img: "towerP", desc: "紫旗塔楼。" },
      { name: "紫旗营房", img: "barracksP", desc: "紫旗营房。" },
      { name: "紫旗箭场", img: "archeryP", desc: "紫旗靶场。" },
      { name: "紫修道院", img: "monasteryP", desc: "紫旗修道院。" },
      { name: "紫旗民居", img: "houseP", desc: "紫旗民居。" },
      { name: "紫旗民居·二", img: "houseP2", desc: "紫旗民居变体。" },
      { name: "紫旗民居·三", img: "houseP3", desc: "紫旗民居变体。" },
      { name: "黑旗城堡", img: "castleK", desc: "黑旗悬崖城堡。" },
      { name: "黑旗城堡·自由", img: "castleKFree", desc: "黑旗城堡变体。" },
      { name: "黑旗修道院", img: "monasteryK", desc: "黑旗修道院。" },
      { name: "黑旗箭场", img: "archeryK", desc: "黑旗靶场。" },
      { name: "黑旗营房", img: "barracksK", desc: "黑旗营房。" },
      { name: "黑旗民居", img: "houseK", desc: "黑旗民居。" },
      { name: "黑旗民居·一", img: "houseK1", desc: "黑旗民居变体。" },
      { name: "黑旗民居·二", img: "houseK2", desc: "黑旗民居变体。" },
      { name: "骑士城堡", img: "castleKU010", desc: "骑士派系主堡（Update 010）。" },
      { name: "骑士民居", img: "knightHouseB", desc: "骑士派系小屋。" },
      { name: "骑士民居·红", img: "knightHouseR", desc: "骑士小屋·红。" },
      { name: "骑士民居·紫", img: "knightHouseP", desc: "骑士小屋·紫。" },
      { name: "骑士民居·金", img: "knightHouseY", desc: "骑士小屋·金。" },
      { name: "骑士塔楼", img: "knightTowerB", desc: "骑士派系石塔。" },
      { name: "骑士塔·红", img: "knightTowerR", desc: "骑士塔楼·红。" },
      { name: "骑士塔·紫", img: "knightTowerP", desc: "骑士塔楼·紫。" },
      { name: "骑士塔·金", img: "knightTowerY", desc: "骑士塔楼·金。" },
      { name: "赤骑士堡", img: "castleKR", desc: "红骑士城堡变体。" },
      { name: "紫骑士堡", img: "castleKP", desc: "紫骑士城堡变体。" },
      { name: "金骑士堡", img: "castleKY", desc: "金骑士城堡变体。" },
      { name: "海盗塔", img: "pirateTowerW", fw: 256, fh: 192, frames: 4, sheet: true, desc: "岸边海盗哨塔，可能引发袭击。" },
      { name: "渔棚", img: "fishHut", fw: 192, fh: 192, frames: 8, sheet: true, desc: "岸边渔棚，可垂钓。" },
      { name: "废墟民居", img: "knightHouseDestroyed", desc: "坍塌的骑士小屋。" },
      { name: "废墟塔楼", img: "knightTowerDestroyed", desc: "坍塌的骑士塔。" },
      { name: "废墟城堡", img: "castleKDestroyed", desc: "坍塌的骑士城堡。" },
      { name: "废墟木塔", img: "woodTowerDestroyed", desc: "坍塌的哥布林木塔。" },
      { name: "废墟哥布林屋", img: "goblinHouseDestroyed", desc: "坍塌的哥布林屋。" },
    ];
    const buildings = buildingCatalog.filter((e) => imgs[e.img]);

    const friends = [
      { name: "幸存者（工匠）", img: "pawnIdle", fw: 192, fh: 192, frames: 8, sheet: true, animFps: 7, desc: "你的默认形态：采集、建造、生存。" },
      { name: "僧侣", img: "mIdle", fw: 192, fh: 192, frames: 6, sheet: true, animFps: 7, desc: "据点南院友方。花费金币可净化魔蚀。" },
      { name: "绵羊", img: "sheepI", fw: 128, fh: 128, frames: 6, sheet: true, animFps: 7, desc: "被动畜牲。宰杀得肉；荒原上有更壮的变种。" },
      { name: "猪人", img: "pigIdle", fw: 192, fh: 192, frames: 10, sheet: true, animFps: 7, desc: "可用肉结交。猪王国附近常见。" },
      { name: "蓝旗弓手", img: "bArcherIdle", fw: 192, fh: 192, frames: 6, sheet: true, animFps: 7, desc: "蓝旗弓手（派系单位，不驻守据点）。" },
      { name: "蓝旗枪骑", img: "bLancerIdle", fw: 320, fh: 320, frames: 12, sheet: true, animFps: 7, desc: "蓝旗枪骑（派系单位，不驻守据点）。" },
    ].filter((e) => imgs[e.img]);

    const resources = [
      { name: "树木", img: "tree1", fw: 192, fh: 256, frames: 8, sheet: true, animFps: 6, desc: "靠近后按 F/空格砍伐，得木材与树枝。" },
      { name: "灌木", img: "bush", fw: 128, fh: 128, frames: 8, sheet: true, animFps: 6, desc: "可砍伐，偶尔掉落草或树枝。" },
      { name: "浆果丛", img: "bush2", fw: 128, fh: 128, frames: 8, sheet: true, animFps: 6, desc: "成熟后可采摘浆果，会重新生长。" },
      { name: "石头", img: "rock", desc: "地表石块，可开采燧石等。" },
      { name: "金矿脉", img: "gold", desc: "地上金矿节点，用镐开采。" },
      { name: "木栅栏", img: "woodFence", fw: 64, fh: 64, tile: true, tileX: 64, tileY: 0, desc: "据点围栏。可建造与锤击拆除。" },
      { name: "蜂巢", img: "gnomeHut", desc: "可取蜜，但可能惊动刺蜂。（用侏儒小屋美术占位）" },
      { name: "营火", img: "fireB", fw: 64, fh: 64, frames: 12, sheet: true, animFps: 10, desc: "据点核心。添柴、烤制、夜间照明。" },
      { name: "废弃工具", img: "tool1", desc: "散落在野外的工具残骸。" },
      { name: "资源箱", img: "u010Wood", desc: "木材/金矿/肉类资源箱。" },
      { name: "更新树木", img: "u010Tree", fw: 192, fh: 192, frames: 1, sheet: true, desc: "Update 010 树木变体。" },
      { name: "跳跳羊", img: "u010Sheep", fw: 128, fh: 128, frames: 8, sheet: true, animFps: 8, desc: "快乐跳跳羊。" },
    ].map((e) => {
      if (e.img === "gold" && !imgs.gold) e.img = "rock2";
      if (e.img === "bush2" && !imgs.bush2) e.img = "bush";
      if (e.img === "fireB" && !imgs.fireB) { e.img = "fire"; e.frames = 10; }
      return e;
    }).filter((e) => imgs[e.img]);

    const creatures = [];
    const pack = window.EnemyPack && window.EnemyPack.ENEMIES;
    if (pack) {
      for (const [id, def] of Object.entries(pack)) {
        const role = def.role || "";
        let tip = "野外生物。";
        if (role.indexOf("boss") >= 0) tip = "强敌 / Boss。";
        else if (role.indexOf("night") >= 0) tip = "偏夜间活动。";
        else if (role.indexOf("cave") >= 0) tip = "洞窟相关。";
        else if (role.indexOf("forest") >= 0) tip = "密林中常见。";
        else if (role.indexOf("worker") >= 0) tip = "派系劳工。";
        else if (role.indexOf("ranged") >= 0 || role.indexOf("bomber") >= 0) tip = "远程单位。";
        creatures.push({
          name: def.name || id,
          kind: id,
          img: "en_" + id + "_idle",
          fallback: "en_" + id + "_avatar",
          fw: def.fw || 192,
          fh: def.fh || 192,
          frames: def.idleFrames || 8,
          sheet: true,
          animFps: 7,
          desc: tip + " 生命约 " + (def.hp || "?") + " · 伤害 " + (def.dmg || "?") + (def.nightOnly ? " · 夜行" : ""),
        });
      }
    }
    const freeUnits = [
      { name: "赤旗武士", img: "rIdle", fw: 192, fh: 192, frames: 8, sheet: true, animFps: 7, desc: "红堡近战卫兵。" },
      { name: "赤旗弓手", img: "aIdle", fw: 192, fh: 192, frames: 6, sheet: true, animFps: 7, desc: "红堡远程卫兵。" },
      { name: "赤旗枪骑", img: "lancerIdle", fw: 320, fh: 320, frames: 12, sheet: true, animFps: 7, desc: "红堡枪骑兵。" },
      { name: "红堡僭主", img: "wIdle", fw: 192, fh: 192, frames: 8, sheet: true, animFps: 7, desc: "北方红堡首领。" },
      { name: "暗影骑士", img: "bkIdle", fw: 192, fh: 192, frames: 8, sheet: true, animFps: 7, desc: "黑旗近战精英。" },
      { name: "金鬃卫士", img: "ykIdle", fw: 192, fh: 192, frames: 8, sheet: true, animFps: 7, desc: "金旗近战卫士。" },
      { name: "金旗弓手", img: "yArcherIdle", fw: 192, fh: 192, frames: 6, sheet: true, animFps: 7, desc: "金旗弓手。" },
      { name: "紫旗弓手", img: "pArcherIdle", fw: 192, fh: 192, frames: 6, sheet: true, animFps: 7, desc: "紫旗弓手。" },
      { name: "黑旗弓手", img: "kArcherIdle", fw: 192, fh: 192, frames: 6, sheet: true, animFps: 7, desc: "黑旗弓手。" },
      { name: "金旗枪骑", img: "yLancerIdle", fw: 320, fh: 320, frames: 12, sheet: true, animFps: 7, desc: "金旗枪骑。" },
      { name: "紫旗枪骑", img: "pLancerIdle", fw: 320, fh: 320, frames: 12, sheet: true, animFps: 7, desc: "紫旗枪骑。" },
      { name: "黑旗枪骑", img: "kLancerIdle", fw: 320, fh: 320, frames: 12, sheet: true, animFps: 7, desc: "黑旗枪骑。" },
    ];
    for (const u of freeUnits) if (imgs[u.img]) creatures.push(u);

    return [buildings, creatures, friends, resources];
  }

  const _codexBounds = new WeakMap();
  const _codexFrameBounds = new WeakMap();
  function imageContentBounds(img) {
    if (!img) return null;
    if (_codexBounds.has(img)) return _codexBounds.get(img);
    let b = { sx: 0, sy: 0, sw: img.width || 1, sh: img.height || 1 };
    try {
      const w = img.naturalWidth || img.width || 1;
      const h = img.naturalHeight || img.height || 1;
      const maxSide = 192;
      const scale = Math.min(1, maxSide / Math.max(w, h));
      const cw = Math.max(1, Math.floor(w * scale));
      const ch = Math.max(1, Math.floor(h * scale));
      const c = document.createElement("canvas");
      c.width = cw; c.height = ch;
      const g = c.getContext("2d", { willReadFrequently: true });
      g.clearRect(0, 0, cw, ch);
      g.drawImage(img, 0, 0, cw, ch);
      const data = g.getImageData(0, 0, cw, ch).data;
      let minX = cw, minY = ch, maxX = -1, maxY = -1;
      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          if (data[(y * cw + x) * 4 + 3] > 16) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX >= minX && maxY >= minY) {
        const pad = 2 / scale;
        b = {
          sx: Math.max(0, minX / scale - pad),
          sy: Math.max(0, minY / scale - pad),
          sw: Math.min(w, (maxX - minX + 1) / scale + pad * 2),
          sh: Math.min(h, (maxY - minY + 1) / scale + pad * 2),
        };
      }
    } catch (err) { /* cross-origin / not ready */ }
    _codexBounds.set(img, b);
    return b;
  }

  /** Opaque bbox inside one sheet cell (cached). Prefer frame 0 so icon size stays stable while animating. */
  function sheetFrameContentBounds(img, fw, fh, fr) {
    if (!img || !fw || !fh) return { ox: 0, oy: 0, sw: fw, sh: fh };
    let map = _codexFrameBounds.get(img);
    if (!map) { map = Object.create(null); _codexFrameBounds.set(img, map); }
    const key = fw + "x" + fh + "@" + fr;
    if (map[key]) return map[key];
    let out = { ox: 0, oy: 0, sw: fw, sh: fh };
    try {
      const cols = Math.max(1, Math.floor(img.width / fw));
      const sx0 = (fr % cols) * fw;
      const sy0 = Math.floor(fr / cols) * fh;
      const maxSide = 128;
      const scale = Math.min(1, maxSide / Math.max(fw, fh));
      const cw = Math.max(1, Math.floor(fw * scale));
      const ch = Math.max(1, Math.floor(fh * scale));
      const c = document.createElement("canvas");
      c.width = cw; c.height = ch;
      const g = c.getContext("2d", { willReadFrequently: true });
      g.clearRect(0, 0, cw, ch);
      g.drawImage(img, sx0, sy0, fw, fh, 0, 0, cw, ch);
      const data = g.getImageData(0, 0, cw, ch).data;
      let minX = cw, minY = ch, maxX = -1, maxY = -1;
      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          if (data[(y * cw + x) * 4 + 3] > 16) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX >= minX && maxY >= minY) {
        const pad = 2 / scale;
        out = {
          ox: Math.max(0, minX / scale - pad),
          oy: Math.max(0, minY / scale - pad),
          sw: Math.min(fw, (maxX - minX + 1) / scale + pad * 2),
          sh: Math.min(fh, (maxY - minY + 1) / scale + pad * 2),
        };
      }
    } catch (err) { /* ignore */ }
    map[key] = out;
    return out;
  }

  /** How many leading first-row frames have visible pixels (skip blank trailing cells). */
  function countOpaqueCodexFrames(img, fw, fh, maxFr) {
    maxFr = Math.max(1, Math.min(maxFr || 1, Math.floor(img.width / fw)));
    let last = 0;
    const cols = Math.max(1, Math.floor(img.width / fw));
    for (let fr = 0; fr < maxFr; fr++) {
      const sx0 = (fr % cols) * fw;
      const sy0 = Math.floor(fr / cols) * fh;
      let hit = false;
      try {
        const c = document.createElement("canvas");
        c.width = 8; c.height = 8;
        const g = c.getContext("2d", { willReadFrequently: true });
        g.clearRect(0, 0, 8, 8);
        g.drawImage(img, sx0, sy0, fw, fh, 0, 0, 8, 8);
        const data = g.getImageData(0, 0, 8, 8).data;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] > 16) { hit = true; break; }
        }
      } catch (err) { hit = true; }
      if (hit) last = fr + 1;
      else break;
    }
    return Math.max(1, last);
  }

  function resolveCodexSheet(img, entry) {
    if (!img) return null;
    const iw = img.width || 1, ih = img.height || 1;
    let fw = entry.fw || 0, fh = entry.fh || 0;
    // Explicit sheet / strip (never mis-slice ordinary building stills)
    const wantsSheet = !!(entry.sheet && !entry.tile);
    const looksStrip = !entry.tile && (iw >= ih * 2.2 || ih >= iw * 2.2);
    if (!wantsSheet && !looksStrip) return null;

    if (!fw || !fh) {
      // Common Tiny Swords strips: cell height = image height
      if (iw > ih * 1.8) {
        fh = ih;
        if (iw % 192 === 0 && (ih === 192 || ih === 256 || ih === 320 || ih >= 160)) fw = 192;
        else if (iw % ih === 0) fw = ih;
        else if (iw % 256 === 0 && ih <= 256) fw = 256;
        else if (iw % 128 === 0) fw = 128;
        else {
          for (const n of [2, 3, 4, 5, 6, 8, 10, 12, 16]) {
            if (iw % n) continue;
            const cell = iw / n;
            if (cell >= 48 && cell <= 512) { fw = cell; break; }
          }
        }
      } else if (ih > iw * 1.8) {
        fw = iw;
        fh = (ih % iw === 0) ? iw : Math.floor(ih / Math.max(1, Math.round(ih / iw)));
      }
    }
    if (!fw || !fh) { fw = entry.fw || 192; fh = entry.fh || ih; }
    // Single-row strip with undersized fh (e.g. lancer marked 192 on 320-tall art)
    if (fw && iw >= fw * 1.8 && iw % fw === 0 && fh < ih && Math.floor(ih / fh) === 1) fh = ih;
    const sm = sheetInfo(img, fw, fh);
    return { fw: sm.fw, fh: sm.fh, frames: sm.frames };
  }

  function ensureCodexSelVisible() {
    const cols = drawCodex._cols || 4;
    const rowsVisible = drawCodex._rowsVisible || 1;
    const maxScroll = drawCodex._maxScroll != null ? drawCodex._maxScroll : 0;
    const selRow = Math.floor(Math.max(0, codex.sel) / cols);
    if (selRow < codex.scroll) codex.scroll = selRow;
    if (selRow >= codex.scroll + rowsVisible) codex.scroll = Math.max(0, selRow - rowsVisible + 1);
    if (codex.scroll > maxScroll) codex.scroll = maxScroll;
    if (codex.scroll < 0) codex.scroll = 0;
  }

  function drawCodexIcon(entry, x, y, box, align, well) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 1, y + 1, box - 2, box - 2);
    ctx.clip();
    // No filled "well" box — sprites sit directly on the parchment card
    if (well === "dark") {
      ctx.fillStyle = "rgba(12, 18, 20, 0.72)";
      ctx.fillRect(x, y, box, box);
    }

    let key = (entry.img && imgs[entry.img]) ? entry.img : null;
    if (!key && entry.fallback && imgs[entry.fallback]) key = entry.fallback;
    let img = key ? imgs[key] : null;
    let forceStill = false;

    // Prefer idle sheet; avatar atlases are portraits — never slice them as unit frames
    if (img && entry.fallback && imgs[entry.fallback]) {
      const primary = entry.img ? imgs[entry.img] : null;
      const fb = imgs[entry.fallback];
      if (primary && fb && entry.img && entry.img.indexOf("avatar") >= 0) {
        img = fb; key = entry.fallback;
      }
    }
    if (!img && entry.fallback && imgs[entry.fallback]) {
      img = imgs[entry.fallback];
      key = entry.fallback;
    }
    if (key && key.indexOf("avatar") >= 0) forceStill = true;

    if (!img) {
      ctx.fillStyle = "#8a7a60";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("?", x + box / 2, y + box / 2 + 4);
      ctx.restore();
      return;
    }

    const pad = 6;
    const inner = Math.max(8, box - pad * 2);
    ctx.imageSmoothingEnabled = false;
    const foot = align === "foot";

    if (entry.tile) {
      const tw = entry.fw || 64, th = entry.fh || 64;
      const tx = entry.tileX || 0, ty = entry.tileY || 0;
      const sc = Math.min(inner / tw, inner / th) * 0.92;
      const dw = tw * sc, dh = th * sc;
      const dx = x + (box - dw) / 2;
      const dy = foot ? (y + box - pad - dh) : (y + (box - dh) / 2);
      ctx.drawImage(img, tx, ty, tw, th, dx, dy, dw, dh);
      ctx.restore();
      return;
    }

    const sheetMeta = forceStill ? null : resolveCodexSheet(img, entry);
    if (sheetMeta && (entry.sheet || sheetMeta.frames > 1 || (img.width >= (entry.fw || sheetMeta.fw) * 1.8))) {
      const { fw, fh, frames } = sheetMeta;
      // Multi-row atlases: only walk the first row for idle previews (avoids attack/death poses)
      const cols = Math.max(1, Math.floor(img.width / fw));
      const rows = Math.max(1, Math.floor(img.height / fh));
      let frMax = entry.frames != null ? Math.min(Math.max(1, entry.frames), frames) : Math.min(frames, 12);
      if (rows > 1 && frMax > cols) frMax = cols;
      // Skip empty trailing cells (e.g. knight archer row0 frames 6–7 are blank → black icons)
      frMax = Math.max(1, countOpaqueCodexFrames(img, fw, fh, frMax));
      const fps = entry.animFps || (fh <= 64 ? 10 : 7);
      const fr = frMax <= 1 ? 0 : Math.floor(time * fps) % frMax;
      const sx = (fr % cols) * fw;
      const sy = Math.floor(fr / cols) * fh; // stays on row 0 when frMax <= cols
      // Fit FULL cell; optional modest content crop for tiny sprites in large padding
      let srcX = sx, srcY = sy, srcW = fw, srcH = fh;
      const cb = sheetFrameContentBounds(img, fw, fh, fr);
      if (cb && cb.sw > 8 && cb.sh > 8 && (cb.sw * cb.sh) < fw * fh * 0.55) {
        srcX = sx + cb.ox; srcY = sy + cb.oy; srcW = cb.sw; srcH = cb.sh;
      }
      const sc = Math.min(inner / srcW, inner / srcH) * 0.9;
      const dw = srcW * sc, dh = srcH * sc;
      const dx = x + (box - dw) / 2;
      const dy = foot ? (y + box - pad - dh) : (y + (box - dh) / 2);
      ctx.drawImage(img, srcX, srcY, srcW, srcH, dx, dy, dw, dh);
      ctx.restore();
      return;
    }

    // Static art: trim empty margins, then contain (+ optional foot align)
    const iw = img.width || 64, ih = img.height || 64;
    const b = imageContentBounds(img) || { sx: 0, sy: 0, sw: iw, sh: ih };
    const sc = Math.min(inner / Math.max(1, b.sw), inner / Math.max(1, b.sh)) * 0.92;
    const dw = b.sw * sc, dh = b.sh * sc;
    const dx = x + (box - dw) / 2;
    const dy = foot ? (y + box - pad - dh) : (y + (box - dh) / 2);
    ctx.drawImage(img, b.sx, b.sy, b.sw, b.sh, dx, dy, dw, dh);
    ctx.restore();
  }

  function drawCodex() {
    const groups = codexEntries();
    const list = groups[codex.tab] || [];
    if (codex.sel >= list.length) codex.sel = Math.max(0, list.length - 1);
    const entry = list[codex.sel] || null;

    // Soft ink wash — no grass-tile "floor" behind the book
    ctx.fillStyle = "#1a1410";
    ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W * 0.5, H * 0.35, 40, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
    g.addColorStop(0, "rgba(58, 44, 28, 0.55)");
    g.addColorStop(1, "rgba(12, 10, 8, 0.95)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const px = 20, py = 16, pw = W - 40, ph = H - 32;
    nineSlice(imgs.uiCarved || imgs.paper, px, py, pw, ph);

    ctx.textAlign = "center";
    ctx.fillStyle = "#3a2a18";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(codex.proceedToChar ? "启程前 · 世界图鉴" : "世界图鉴", W / 2, py + 34);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#6a5638";
    ctx.fillText("建筑 / 生物 / 友方 / 资源 · 滚轮翻页 · 点击查看", W / 2, py + 54);

    drawCodex._hits = { tabs: [], cards: [], btn: null, back: null };
    const tabY = py + 66;
    const tabH = 36;
    const tabGap = 10;
    const tabAreaW = pw - 48;
    const tabW = Math.max(78, Math.min(118, Math.floor((tabAreaW - (codex.tabs.length - 1) * tabGap) / codex.tabs.length)));
    const tab0x = px + 24;
    codex.tabs.forEach((name, i) => {
      const tx = tab0x + i * (tabW + tabGap);
      const on = codex.tab === i;
      const hover = mouse.x >= tx && mouse.x <= tx + tabW && mouse.y >= tabY && mouse.y <= tabY + tabH;
      if (on || hover) nineSlice(imgs.uiBtnBlueP || imgs.btnP || imgs.paper, tx, tabY, tabW, tabH);
      else nineSlice(imgs.paper || imgs.uiCarved, tx, tabY, tabW, tabH);
      ctx.fillStyle = on ? "#f7fff8" : "#4a3824";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(name + "·" + (groups[i] ? groups[i].length : 0), tx + tabW / 2, tabY + 23);
      drawCodex._hits.tabs.push({ i, x: tx, y: tabY, w: tabW, h: tabH });
    });

    const gridX = px + 24, gridY = tabY + 48;
    const detailW = Math.min(268, Math.floor(pw * 0.3));
    const scrollReserve = 14;
    const gridW = pw - 48 - detailW - 18 - scrollReserve;
    const gridH = ph - (gridY - py) - 74;
    // Fixed page: 3 columns × 5 rows = 15 entries
    const cols = 3;
    const rowsVisible = 5;
    const gap = 8;
    const cardW = Math.floor((gridW - (cols - 1) * gap) / cols);
    let cardH = Math.floor((gridH - (rowsVisible - 1) * gap) / rowsVisible);
    if (cardH < 48) cardH = 48;
    const iconBox = Math.max(32, Math.min(cardW - 14, cardH - 26));
    drawCodex._cols = cols;
    drawCodex._rowsVisible = rowsVisible;
    drawCodex._gap = gap;
    const maxScroll = Math.max(0, Math.ceil(list.length / cols) - rowsVisible);
    if (codex.scroll > maxScroll) codex.scroll = maxScroll;
    if (codex.scroll < 0) codex.scroll = 0;
    drawCodex._maxScroll = maxScroll;

    // Subtle inset for the grid — same parchment family, not a dark pit
    ctx.fillStyle = "rgba(40, 28, 16, 0.12)";
    ctx.fillRect(gridX - 8, gridY - 8, gridW + 16, gridH + 16);
    ctx.strokeStyle = "rgba(90, 70, 48, 0.22)";
    ctx.lineWidth = 1;
    ctx.strokeRect(gridX - 8.5, gridY - 8.5, gridW + 17, gridH + 17);

    if (maxScroll > 0) {
      const page = codex.scroll + 1;
      const pages = maxScroll + 1;
      ctx.fillStyle = "#6a5638";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("第 " + page + " / " + pages + " 页", gridX + gridW - 2, gridY - 12);
      const trackH = gridH;
      const thumbH = Math.max(24, trackH * (rowsVisible / Math.max(1, Math.ceil(list.length / cols))));
      const thumbY = gridY + (trackH - thumbH) * (codex.scroll / maxScroll);
      ctx.fillStyle = "rgba(90, 70, 48, 0.2)";
      ctx.fillRect(gridX + gridW + 4, gridY, 5, trackH);
      ctx.fillStyle = "rgba(90, 70, 48, 0.55)";
      ctx.fillRect(gridX + gridW + 4, thumbY, 5, thumbH);
    }

    const iconAlign = (codex.tab === 1 || codex.tab === 2) ? "center" : "foot";
    const start = codex.scroll * cols;
    ctx.save();
    ctx.beginPath();
    ctx.rect(gridX - 4, gridY - 4, gridW + 8, gridH + 8);
    ctx.clip();
    for (let i = 0; i < rowsVisible * cols; i++) {
      const idxE = start + i;
      if (idxE >= list.length) break;
      const e = list[idxE];
      const c = i % cols, r = Math.floor(i / cols);
      const cx = gridX + c * (cardW + gap);
      const cy = gridY + r * (cardH + gap);
      const sel = idxE === codex.sel;
      const hover = mouse.x >= cx && mouse.x <= cx + cardW && mouse.y >= cy && mouse.y <= cy + cardH;
      // Paper cards on the carved board
      if (imgs.paper) nineSlice(imgs.paper, cx, cy, cardW, cardH);
      else {
        ctx.fillStyle = "rgba(232, 214, 176, 0.92)";
        ctx.fillRect(cx, cy, cardW, cardH);
      }
      if (sel) {
        ctx.strokeStyle = "#3d6b52";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(cx + 1.5, cy + 1.5, cardW - 3, cardH - 3);
      } else if (hover) {
        ctx.strokeStyle = "rgba(90, 120, 90, 0.55)";
        ctx.lineWidth = 2;
        ctx.strokeRect(cx + 1, cy + 1, cardW - 2, cardH - 2);
      }
      const eAlign = (e.img === "fireB" || e.img === "fire" || e.img === "u010Sheep" || e.img === "sheepI")
        ? "center" : iconAlign;
      drawCodexIcon(e, cx + (cardW - iconBox) / 2, cy + 6, iconBox, eAlign);
      ctx.fillStyle = "#3a2a18";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      const label = e.name.length > 8 ? e.name.slice(0, 7) + "…" : e.name;
      ctx.fillText(label, cx + cardW / 2, cy + cardH - 8);
      drawCodex._hits.cards.push({ i: idxE, x: cx, y: cy, w: cardW, h: cardH });
    }
    ctx.restore();

    const dx = gridX + gridW + 18, dy = gridY, dw = detailW, dh = gridH;
    nineSlice(imgs.paper || imgs.uiCarved, dx, dy, dw, dh);
    if (entry) {
      const prev = Math.min(Math.max(iconBox + 12, 140), dw - 36, Math.max(88, Math.floor(dh * 0.42)));
      const dAlign = (entry.img === "fireB" || entry.img === "fire" || entry.img === "u010Sheep" || entry.img === "sheepI")
        ? "center" : iconAlign;
      drawCodexIcon(entry, dx + (dw - prev) / 2, dy + 22, prev, dAlign);
      ctx.fillStyle = "#3a2a18";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      const titleY = dy + 28 + prev + 28;
      ctx.fillText(entry.name, dx + dw / 2, titleY);
      ctx.font = "13px sans-serif";
      ctx.fillStyle = "#5a4630";
      wrapText(entry.desc || "", dx + dw / 2, titleY + 24, dw - 40, 18);
      ctx.font = "11px sans-serif";
      ctx.fillStyle = "#8a7355";
      ctx.fillText((codex.sel + 1) + " / " + list.length, dx + dw / 2, dy + dh - 16);
    } else {
      ctx.fillStyle = "#5a4630";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("此分类暂无条目", dx + dw / 2, dy + dh / 2);
    }

    const btnW = 190, btnH = 44;
    const contX = W / 2 - btnW - 12, backX = W / 2 + 12, btnY = py + ph - 56;
    const contLabel = codex.proceedToChar ? "继续选角" : "返回菜单";
    nineSlice(imgs.uiBtnBlue || imgs.btn, contX, btnY, btnW, btnH);
    ctx.fillStyle = "#f4fff8";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(contLabel, contX + btnW / 2, btnY + btnH / 2 + 5);
    drawCodex._hits.btn = { x: contX, y: btnY, w: btnW, h: btnH };

    if (codex.proceedToChar) {
      nineSlice(imgs.paper || imgs.uiBtnBlue || imgs.btn, backX, btnY, btnW, btnH);
      ctx.fillStyle = "#3a2a18";
      ctx.fillText("返回菜单", backX + btnW / 2, btnY + btnH / 2 + 5);
      drawCodex._hits.back = { x: backX, y: btnY, w: btnW, h: btnH };
    }

    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#6a5638";
    ctx.fillText("← → 分类 · ↑ ↓ 选择 · 滚轮翻页 · Enter 继续 · Esc 返回", W / 2, py + ph - 12);
  }

  function handleCodexClick() {
    const h = drawCodex._hits;
    if (!h) return;
    for (const t of h.tabs || []) {
      if (mouse.x >= t.x && mouse.x <= t.x + t.w && mouse.y >= t.y && mouse.y <= t.y + t.h) {
        codex.tab = t.i; codex.scroll = 0; codex.sel = 0; codexWheelAcc = 0; return;
      }
    }
    for (const c of h.cards || []) {
      if (mouse.x >= c.x && mouse.x <= c.x + c.w && mouse.y >= c.y && mouse.y <= c.y + c.h) {
        codex.sel = c.i; return;
      }
    }
    if (h.btn && mouse.x >= h.btn.x && mouse.x <= h.btn.x + h.btn.w && mouse.y >= h.btn.y && mouse.y <= h.btn.y + h.btn.h) {
      leaveCodex(); return;
    }
    if (h.back && mouse.x >= h.back.x && mouse.x <= h.back.x + h.back.w && mouse.y >= h.back.y && mouse.y <= h.back.y + h.back.h) {
      codex.proceedToChar = false; leaveCodex();
    }
  }

  function drawKCLogo(cx, cy, scale) {
    const s = scale || 1;
    const sw = 118 * s;
    const sh = 138 * s;
    const sx = cx - sw / 2;
    const sy = cy - sh / 2;

    // Drop shadow
    ctx.save();
    ctx.translate(4 * s, 6 * s);
    ctx.beginPath();
    ctx.moveTo(sx + sw * 0.12, sy + sh * 0.08);
    ctx.lineTo(sx + sw * 0.88, sy + sh * 0.08);
    ctx.lineTo(sx + sw * 0.92, sy + sh * 0.42);
    ctx.quadraticCurveTo(sx + sw * 0.5, sy + sh * 1.05, sx + sw * 0.08, sy + sh * 0.42);
    ctx.closePath();
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fill();
    ctx.restore();

    // Heater shield
    ctx.beginPath();
    ctx.moveTo(sx + sw * 0.12, sy + sh * 0.08);
    ctx.lineTo(sx + sw * 0.88, sy + sh * 0.08);
    ctx.lineTo(sx + sw * 0.92, sy + sh * 0.42);
    ctx.quadraticCurveTo(sx + sw * 0.5, sy + sh * 1.05, sx + sw * 0.08, sy + sh * 0.42);
    ctx.closePath();
    const metal = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh);
    metal.addColorStop(0, "#d8dde4");
    metal.addColorStop(0.45, "#9aa3b0");
    metal.addColorStop(1, "#6a7380");
    ctx.fillStyle = metal;
    ctx.fill();
    ctx.strokeStyle = "#3a4250";
    ctx.lineWidth = 3 * s;
    ctx.stroke();

    // Blue / ivory split
    ctx.save();
    ctx.clip();
    ctx.fillStyle = "#4a7fd4";
    ctx.fillRect(sx, sy, sw * 0.5, sh);
    ctx.fillStyle = "#f2efe6";
    ctx.fillRect(sx + sw * 0.5, sy, sw * 0.5, sh);
    // soft heart indent
    ctx.fillStyle = "rgba(40,50,70,0.12)";
    ctx.beginPath();
    ctx.ellipse(cx, cy - 6 * s, 18 * s, 22 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Rivets
    const rivets = [
      [0.22, 0.16], [0.78, 0.16], [0.18, 0.38], [0.82, 0.38], [0.5, 0.78],
    ];
    rivets.forEach((r) => {
      const rx = sx + sw * r[0], ry = sy + sh * r[1];
      ctx.beginPath();
      ctx.arc(rx, ry, 3.2 * s, 0, Math.PI * 2);
      ctx.fillStyle = "#c8ced8";
      ctx.fill();
      ctx.strokeStyle = "#4a5568";
      ctx.lineWidth = 1.2 * s;
      ctx.stroke();
    });

    // Banner plaque (Tiny Swords style)
    const bw = 168 * s, bh = 54 * s;
    const bx = cx - bw * 0.42, by = cy - bh * 0.35;
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.moveTo(bx + 4, by + 4);
    ctx.lineTo(bx + bw * 0.82 + 4, by + 4);
    ctx.lineTo(bx + bw + 4, by + bh * 0.5 + 4);
    ctx.lineTo(bx + bw * 0.82 + 4, by + bh + 4);
    ctx.lineTo(bx + 4, by + bh + 4);
    ctx.closePath();
    ctx.fill();

    if (imgs.banner || imgs.paper) {
      nineSlice(imgs.banner || imgs.paper, bx, by, bw * 0.86, bh);
      // arrow tip
      ctx.fillStyle = "#e8dcc0";
      ctx.beginPath();
      ctx.moveTo(bx + bw * 0.82, by);
      ctx.lineTo(bx + bw, by + bh * 0.5);
      ctx.lineTo(bx + bw * 0.82, by + bh);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#8a7048";
      ctx.lineWidth = 1.5 * s;
      ctx.stroke();
    } else {
      ctx.fillStyle = "#e8dcc0";
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + bw * 0.82, by);
      ctx.lineTo(bx + bw, by + bh * 0.5);
      ctx.lineTo(bx + bw * 0.82, by + bh);
      ctx.lineTo(bx, by + bh);
      ctx.closePath();
      ctx.fill();
    }

    // Title typography — KC KEEP
    ctx.textAlign = "center";
    ctx.fillStyle = "#8b1e1e";
    ctx.font = "bold " + Math.floor(18 * s) + "px Georgia, 'Times New Roman', serif";
    ctx.fillText("KC", bx + bw * 0.4, by + bh * 0.38);
    ctx.font = "bold " + Math.floor(26 * s) + "px Georgia, 'Times New Roman', serif";
    ctx.fillStyle = "#6e1212";
    ctx.fillText("KEEP", bx + bw * 0.4, by + bh * 0.78);

    // Chinese brand under shield
    ctx.font = "bold " + Math.floor(15 * s) + "px 'Songti SC', 'STSong', serif";
    ctx.fillStyle = "#f4efe4";
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 4;
    ctx.fillText("KC据点", cx, sy + sh + 22 * s);
    ctx.shadowBlur = 0;
    ctx.font = Math.floor(11 * s) + "px sans-serif";
    ctx.fillStyle = "rgba(230,245,242,0.85)";
    ctx.fillText("魔蚀生存 · Tiny Swords", cx, sy + sh + 38 * s);
  }

  function drawMenuIslandFoot(cx, cy, rw, rh, cliff) {
    // Soft elliptical grass pad + stone cliff rim
    ctx.beginPath();
    ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#3d8f4a";
    ctx.fill();
    if (imgs.tilesGrass) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalAlpha = 0.92;
      const tile = 64;
      for (let y = cy - rh; y < cy + rh; y += tile) {
        for (let x = cx - rw; x < cx + rw; x += tile) {
          ctx.drawImage(imgs.tilesGrass, 64, 64, 64, 64, x, y, tile, tile);
        }
      }
      ctx.restore();
    }
    if (cliff) {
      ctx.beginPath();
      ctx.ellipse(cx, cy + rh * 0.55, rw * 0.98, rh * 0.55, 0, 0, Math.PI);
      const cliffGrad = ctx.createLinearGradient(cx, cy, cx, cy + rh * 1.1);
      cliffGrad.addColorStop(0, "#9aa3a8");
      cliffGrad.addColorStop(0.55, "#7a848c");
      cliffGrad.addColorStop(1, "#5a636c");
      ctx.fillStyle = cliffGrad;
      ctx.fill();
      // strata lines
      ctx.strokeStyle = "rgba(40,48,54,0.25)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const yy = cy + rh * 0.35 + i * (rh * 0.18);
        ctx.beginPath();
        ctx.ellipse(cx, yy, rw * (0.95 - i * 0.04), rh * 0.22, 0, 0.15, Math.PI - 0.15);
        ctx.stroke();
      }
    }
  }

  function drawMenuDiorama() {
    // Teal sea — Tiny Swords promo look
    const sea = ctx.createLinearGradient(0, 0, 0, H);
    sea.addColorStop(0, "#4ec4c2");
    sea.addColorStop(0.55, "#2fa9a8");
    sea.addColorStop(1, "#1e8e90");
    ctx.fillStyle = sea;
    ctx.fillRect(0, 0, W, H);
    if (imgs.water) {
      ctx.globalAlpha = 0.35;
      for (let y = 0; y < H; y += 64) {
        for (let x = 0; x < W; x += 64) {
          ctx.drawImage(imgs.water, x, y, 64, 64);
        }
      }
      ctx.globalAlpha = 1;
    }
    // Gentle shimmer
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let i = 0; i < 18; i++) {
      const wx = ((i * 97 + time * 18) % (W + 80)) - 40;
      const wy = (i * 73) % H;
      ctx.beginPath();
      ctx.ellipse(wx, wy, 40 + (i % 5) * 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const sc = Math.min(W / 1280, H / 720, 1.15) * 0.92;
    const baseX = W * 0.36;
    const baseY = H * 0.58;

    // Multi-tier floating islands
    drawMenuIslandFoot(baseX - 40 * sc, baseY + 20 * sc, 280 * sc, 90 * sc, true);
    drawMenuIslandFoot(baseX - 180 * sc, baseY - 70 * sc, 150 * sc, 55 * sc, true);
    drawMenuIslandFoot(baseX + 160 * sc, baseY - 10 * sc, 170 * sc, 60 * sc, true);
    drawMenuIslandFoot(baseX + 40 * sc, baseY - 120 * sc, 120 * sc, 48 * sc, true);
    // Tiny satellite islets
    drawMenuIslandFoot(baseX - 320 * sc, baseY + 80 * sc, 48 * sc, 18 * sc, true);
    drawMenuIslandFoot(baseX + 300 * sc, baseY + 100 * sc, 40 * sc, 14 * sc, true);

    if (imgs.waterRock1) {
      ctx.drawImage(imgs.waterRock1, baseX - 360 * sc, baseY + 60 * sc, 64 * sc, 48 * sc);
      ctx.drawImage(imgs.waterRock2 || imgs.waterRock1, baseX + 310 * sc, baseY + 70 * sc, 56 * sc, 42 * sc);
    }

    const frame = Math.floor(time * 7) % 8;
    const props = [];

    const pushBld = (img, x, y, w, h) => {
      if (!img) return;
      props.push({ kind: "bld", img, x, y, w: w * sc, h: h * sc, sort: y + h * sc * 0.85 });
    };
    const pushUnit = (img, x, y, fw, fh, fr, scale) => {
      if (!img) return;
      props.push({ kind: "unit", img, x, y, fw, fh, fr: fr != null ? fr : frame, scale: (scale || 0.55) * sc, sort: y + fh * (scale || 0.55) * sc * 0.7 });
    };
    const pushTree = (img, x, y, scale) => {
      if (!img) return;
      const sm = treeSheetFor(img);
      const s = (scale || 0.7) * sc;
      props.push({ kind: "tree", img, x, y, fw: sm.fw, fh: sm.fh, s, sort: y + sm.fh * s * 0.85 });
    };

    // Upper plateau — castle
    pushBld(imgs.castleB, baseX - 90 * sc, baseY - 280 * sc, 220, 180);
    pushUnit(imgs.wIdle, baseX - 40 * sc, baseY - 210 * sc, 192, 192, frame, 0.42);
    pushUnit(imgs.wIdle, baseX + 30 * sc, baseY - 205 * sc, 192, 192, (frame + 3) % 8, 0.42);

    // Mid-left tower
    pushBld(imgs.towerB, baseX - 260 * sc, baseY - 200 * sc, 100, 200);
    pushUnit(imgs.wIdle, baseX - 230 * sc, baseY - 120 * sc, 192, 192, (frame + 2) % 8, 0.4);

    // Village houses
    pushBld(imgs.house, baseX + 90 * sc, baseY - 160 * sc, 110, 150);
    pushBld(imgs.house2, baseX + 170 * sc, baseY - 140 * sc, 110, 150);
    pushBld(imgs.house3 || imgs.house, baseX + 130 * sc, baseY - 90 * sc, 100, 140);
    pushBld(imgs.towerB, baseX + 240 * sc, baseY - 200 * sc, 90, 180);

    // Trees
    pushTree(imgs.tree1, baseX - 200 * sc, baseY - 40 * sc, 0.55);
    pushTree(imgs.tree2, baseX + 40 * sc, baseY - 30 * sc, 0.5);
    pushTree(imgs.tree3, baseX + 220 * sc, baseY - 50 * sc, 0.55);
    pushTree(imgs.tree4, baseX - 80 * sc, baseY + 10 * sc, 0.48);
    pushTree(imgs.tree1, baseX + 280 * sc, baseY + 20 * sc, 0.42);

    // Bushes / rocks
    if (imgs.bush) props.push({ kind: "bush", img: imgs.bush, x: baseX - 120 * sc, y: baseY + 10 * sc, sort: baseY + 40 * sc });
    if (imgs.bush2) props.push({ kind: "bush", img: imgs.bush2, x: baseX + 60 * sc, y: baseY + 30 * sc, sort: baseY + 55 * sc });
    if (imgs.rock) props.push({ kind: "spr", img: imgs.rock, x: baseX + 200 * sc, y: baseY + 40 * sc, w: 40 * sc, h: 40 * sc, sort: baseY + 60 * sc });

    // Sheep flock
    const sheepImg = imgs.happySheep || imgs.sheepI;
    if (sheepImg) {
      pushUnit(sheepImg, baseX - 60 * sc, baseY + 30 * sc, 128, 128, Math.floor(time * 5) % 8, 0.55);
      pushUnit(sheepImg, baseX - 10 * sc, baseY + 45 * sc, 128, 128, Math.floor(time * 5 + 2) % 8, 0.5);
      pushUnit(sheepImg, baseX + 35 * sc, baseY + 25 * sc, 128, 128, Math.floor(time * 5 + 4) % 8, 0.52);
    }

    // Patrol / sparring knights
    pushUnit(imgs.wIdle, baseX - 30 * sc, baseY - 20 * sc, 192, 192, frame, 0.55);
    pushUnit(imgs.wIdle, baseX + 20 * sc, baseY - 15 * sc, 192, 192, (frame + 4) % 8, 0.55);
    if (imgs.pawnIdle) pushUnit(imgs.pawnIdle, baseX + 100 * sc, baseY + 5 * sc, 192, 192, frame, 0.5);
    if (imgs.pawnIdleAxe) pushUnit(imgs.pawnIdleAxe, baseX + 150 * sc, baseY + 15 * sc, 192, 192, (frame + 2) % 8, 0.5);

    props.sort((a, b) => a.sort - b.sort);
    for (const p of props) {
      if (p.kind === "bld" || p.kind === "spr") {
        ctx.drawImage(p.img, p.x, p.y, p.w, p.h);
      } else if (p.kind === "bush") {
        drawFrame(p.img, 128, 128, 0, p.x, p.y, false, 0.45 * sc);
      } else if (p.kind === "tree") {
        drawFrame(p.img, p.fw, p.fh, 0, p.x, p.y, false, p.s);
      } else if (p.kind === "unit") {
        drawFrame(p.img, p.fw, p.fh, p.fr, p.x, p.y, false, p.scale);
      }
    }

    // Soft vignette so UI reads clearly on the right
    const vig = ctx.createRadialGradient(W * 0.38, H * 0.5, Math.min(W, H) * 0.25, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(0.65, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(8,30,32,0.35)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  function drawCoverImage(img, dx, dy, dw, dh) {
    if (!img || !img.width) return false;
    const ir = img.width / img.height;
    const br = dw / dh;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (ir > br) {
      sw = img.height * br;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / br;
      sy = (img.height - sh) / 2;
    }
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    ctx.restore();
    ctx.imageSmoothingEnabled = false;
    return true;
  }

  function drawStarveMenuBtn(x, y, w, h, label, hot, pressed) {
    // Bright Tiny Swords chrome — blue plate buttons
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(x + 3, y + 4, w, h);
    const face = pressed
      ? (imgs.btnP || imgs.uiBtnBlueP || imgs.btn)
      : (hot ? (imgs.uiBtnBlueP || imgs.btnP || imgs.btn) : (imgs.uiBtnBlue || imgs.btn));
    nineSlice(face, x, y, w, h);
    ctx.textAlign = "center";
    ctx.font = "bold 17px sans-serif";
    ctx.fillStyle = "rgba(10,30,28,0.35)";
    ctx.fillText(label, x + w / 2 + 1, y + h / 2 + 7);
    ctx.fillStyle = "#f4fff8";
    ctx.fillText(label, x + w / 2, y + h / 2 + 6);
  }

  function drawMenu() {
    // Full AI splash only — no sprite overlays
    ctx.fillStyle = "#2aa8a8";
    ctx.fillRect(0, 0, W, H);
    if (!drawCoverImage(imgs.titleSplash, 0, 0, W, H)) {
      if (typeof drawMenuDiorama === "function") drawMenuDiorama();
      const logoS = Math.min(1.15, Math.max(0.8, W / 1280));
      drawKCLogo(W - 118 * logoS - 28, 108 * logoS + 6, logoS);
    } else {
      const shade = ctx.createLinearGradient(W * 0.72, 0, W, 0);
      shade.addColorStop(0, "rgba(10,50,52,0)");
      shade.addColorStop(1, "rgba(8,40,42,0.18)");
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, W, H);
    }

    const m = hitMenuBtn();
    menuBtn.hover = m.hitNew || m.hitCont || m.hitCodex || m.hitTest;

    drawStarveMenuBtn(m.bx, m.by, m.bw, m.bh, "新的放逐", m.hitNew, m.hitNew && mouse.left);
    if (m.hasSave) {
      drawStarveMenuBtn(m.bx, m.by2, m.bw, m.bh, "继续旅程", m.hitCont, m.hitCont && mouse.left);
    }
    drawStarveMenuBtn(m.bx, m.codexY, m.bw, m.bh, "世界图鉴", m.hitCodex, m.hitCodex && mouse.left);
    drawStarveMenuBtn(m.bx, m.testY, m.bw, m.bh, "测试模式", m.hitTest, m.hitTest && mouse.left);

    const tipW = Math.min(m.bw, W - 32);
    const tipH = 40;
    const tipX = m.bx + (m.bw - tipW) / 2;
    const tipY = Math.min(m.testY + m.bh + (m.gap || 10), H - tipH - 12);
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(tipX + 2, tipY + 3, tipW, tipH);
    nineSlice(imgs.paper || imgs.banner || imgs.uiCarved, tipX, tipY, tipW, tipH);
    ctx.fillStyle = "#3a2a18";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    wrapText("测试模式：不扣血/饿/理智", tipX + tipW / 2, tipY + 25, tipW - 20, 14);
  }

  function drawPauseLike(title, sub, btn) {
    ctx.fillStyle = "rgba(5,10,14,0.62)";
    ctx.fillRect(0, 0, W, H);
    const pw = Math.min(480, W - 40);
    const ph = 280;
    const px = W / 2 - pw / 2;
    const py = H / 2 - ph / 2;
    nineSlice(imgs.paper, px, py, pw, ph);
    ctx.textAlign = "center";
    ctx.fillStyle = "#3a2a1a";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText(title, W / 2, py + 70);
    ctx.font = "15px sans-serif";
    wrapText(sub, W / 2, py + 110, pw - 64, 22);
    nineSlice(imgs.btn, W / 2 - 110, py + ph - 86, 220, 56);
    ctx.fillStyle = "#f4fff8";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(btn, W / 2, py + ph - 50);
  }

  function wrapText(text, x, y, max, lh) {
    const chars = text.split("");
    let line = "", yy = y;
    ctx.textAlign = "center";
    for (const ch of chars) {
      const test = line + ch;
      if (ctx.measureText(test).width > max) { ctx.fillText(line, x, yy); line = ch; yy += lh; }
      else line = test;
    }
    ctx.fillText(line, x, yy);
  }

  function resetRunState() {
    inv.wood = 0; inv.gold = 0; inv.meat = 2; inv.fish = 0; inv.honey = 0; inv.torch = 0; inv.lantern = 0; inv.cooked = 0; inv.warKit = 0; inv.warmstone = 0; inv.berries = 0; inv.seeds = 0; inv.jam = 0; inv.meatpie = 0; inv.spicy = 0; inv.trail = 0; inv.feast = 0; inv.mapscroll = 0;
    inv.boards = 0; inv.rope = 0; inv.cutstone = 0; inv.rocks = 0; inv.monster = 0; inv.trinket = 0; inv.dung = 0; inv.flint = 0; inv.twigs = 0; inv.grass = 0; inv.carrot = 0; inv.carrot_seed = 0;
    inv.spear = 0; inv.hammer = 0; inv.shovel = 0; inv.umbrella = 0;
    inv.charcoal = 0; inv.jerky = 0; inv.oar = 0; inv.mast = 0; inv.anchor = 0;
    inv.silk = 0; inv.winterhat = 0; inv.beehat = 0; inv.monster = 0; inv.raincoat = 0;
    birdCd = 40;
    delete inv._spoil;
    runes.fire = true; runes.ice = false; runes.lightning = false;
    spell = "fire";
    craftOpen = false;
    cookOpen = false;
    bagOpen = false;
    cookSlots = [null, null, null, null];
    chestOpen = null;
    pigKing = null;
    houndClock = null;
    wetness = { wet: 0 };
    toolDur = null;
    seasonBossFlags = {};
    raidCd = 12;
    wasNight = false;
    autoSaveAcc = 0;
    quests.forEach((q) => { q.done = false; });
    dayT = 0.18; rain = 0; rainTimer = 35;
    seasonT = 0; seasonId = "spring"; wasSeasonId = "spring";
    inCave = false; overworldReturn = null; onIsland = false; wildfireCd = 80; winterStormCd = 100; summerThunderCd = 55; winterStormT = 0; corpse = null; pirateTower = null; fishHut = null; seaDock = null; seaIsland = null; onSeaIsland = false; trollBoss = null; gnomeTower = null; minotaurBoss = null; mooseBoss = null; warmstoneHeat = 0; cookJob = null; roastJob = null; sailJob = null; wormholeCd = 0; smolderJob = null; springFrogCd = 40; pirateRaidCd = 40;
  }

  function beginGame() {
    testMode = false;
    openCodex(true);
  }

  function beginTestGame() {
    testMode = true;
    openCodex(true);
    toast("测试模式：生命/饥饿/理智/体温不会扣除", 4);
  }

  function openCodex(proceedToChar) {
    codex.proceedToChar = !!proceedToChar;
    codex.tab = 0;
    codex.scroll = 0;
    codex.sel = 0;
    state = STATE.CODEX;
  }

  function leaveCodex() {
    if (codex.proceedToChar) {
      state = STATE.CHAR;
      charPick = "wilson";
    } else {
      state = STATE.MENU;
    }
  }


  function startWithCharacter(id) {
    try {
      charPick = id || "wilson";
      toast("正在生成大陆……", 2);
      seed = (Date.now() % 99991) + 17;
      resetRunState();
      clearMoveTarget();
      generate();
      const ch = CHARACTERS.find((c) => c.id === charPick) || CHARACTERS[0];
      if (!player) {
        toast("生成失败：没有玩家。请刷新重试。", 4);
        state = STATE.MENU;
        return;
      }
      player.maxHp = ch.hp; player.hp = ch.hp;
      player.maxHunger = ch.hunger || 150;
      player.hunger = player.maxHunger;
      player.corr = ch.corr;
      player.speed = ch.speed;
      player.charId = ch.id;
      player.charName = ch.name;
      player.fireSanity = !!ch.fireSanity;
      player.robot = !!ch.robot;
      player.mighty = !!ch.mighty;
      player.nightSanity = !!ch.nightSanity;
      player.lumberjack = !!ch.lumberjack;
      player.invul = 3;
      player.dead = false;
      if (ch.id === "willow") {
        inv.torch = Math.max(inv.torch || 0, 2);
        player.torchOn = true;
      }
      if (ch.id === "wendy") player.corr = Math.min(100, (player.corr || 0) + 5);
      if (ch.id === "woodie") {
        if (window.DstSys) {
          toolDur = window.DstSys.createTools();
          if (toolDur.axe) { toolDur.axe.max = 160; toolDur.axe.uses = 160; }
        }
        player.tool = "axe";
      }
      state = STATE.PLAY;
      toast("大陆 425×425。左键行动/点地走 · 右键检查 · F 采集 · J 攻击 · 空格互动", 5);
      if (testMode) toast("测试模式已开启：生命/饥饿/理智/体温不会扣除", 4);
      if (window.DstSys) {
        houndClock = window.DstSys.createHoundClock();
        wetness = window.DstSys.createWetness();
        toolDur = window.DstSys.createTools();
        seasonBossFlags = {};
        cookSlots = [null, null, null, null];
        window.DstSys.ensureSpoil(inv);
      }
    } catch (err) {
      console.error(err);
      toast("开局失败：" + (err && err.message ? err.message : String(err)), 5);
      state = STATE.MENU;
    }
  }

  function saveGame(verbose) {
    if (state !== STATE.PLAY || !player) return;
    try {
      const data = {
        v: 1,
        worldSeed,
        dayT, seasonT, rain, rainTimer, spell, inCave,
        inv: { ...inv },
        runes: { ...runes },
        quests: quests.map((q) => ({ id: q.id, done: q.done })),
        player: {
          x: player.x, y: player.y, hp: player.hp, mp: player.mp,
          hunger: player.hunger, corr: player.corr, armor: player.armor || 0,
          torchOn: !!player.torchOn,
          form: player.form || "pawn",
          warRank: player.warRank || 0,
          temp: player.temp || 55,
          tech: player.tech ? { ...player.tech } : {},
        },
        fog: fog ? Array.from(fog) : null,
        overworldReturn,
        cavePlayer: inCave ? { x: player.x, y: player.y } : null,
        fires: fires.map((f) => ({ x: f.x, y: f.y, lit: f.lit, fuel: f.fuel })),
        chests: props.filter((p) => p.kind === "chest").map((p) => ({
          x: p.x, y: p.y, store: { ...p.store },
        })),
        fences: props.filter((p) => p.kind === "fence").map((p) => ({ x: p.x, y: p.y })),
        walls: props.filter((p) => p.kind === "stonewall").map((p) => ({ x: p.x, y: p.y })),
        farms: props.filter((p) => p.kind === "farm").map((p) => ({
          x: p.x, y: p.y, planted: !!p.planted, stage: p.stage || 0, grow: p.grow || 0,
        })),
        hives: props.filter((p) => p.kind === "beehive").map((p) => ({
          x: p.x, y: p.y, honeyLeft: p.honeyLeft || 0,
        })),
        traps: props.filter((p) => p.kind === "trap").map((p) => ({
          x: p.x, y: p.y, bait: p.bait || 0, sprung: !!p.sprung,
        })),
        towers: buildings.filter((b) => b.owned).map((b) => ({ x: b.x, y: b.y })),
        onIsland: !!onIsland,
        onSeaIsland: !!onSeaIsland,
        pirateHp: pirateTower ? pirateTower.hp : null,
        corpse: corpse ? { x: corpse.x, y: corpse.y, bag: { ...corpse.bag } } : null,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      if (verbose) toast("据点已铭刻（存档）。", 2);
    } catch (err) {
      if (verbose) toast("存档失败。");
      console.warn(err);
    }
  }

  function loadGame() {
    testMode = false;
    let raw;
    try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
    if (!raw) { toast("没有存档。"); return false; }
    let data;
    try { data = JSON.parse(raw); } catch (e) { toast("存档损坏。"); return false; }
    resetRunState();
    seed = data.worldSeed || ((Date.now() % 99991) + 17);
    worldSeed = seed;
    Object.assign(inv, data.inv || {});
    Object.assign(runes, data.runes || {});
    spell = data.spell || "fire";
    dayT = data.dayT != null ? data.dayT : 0.18;
    seasonT = data.seasonT || 0;
    wasSeasonId = (window.SeasonSys && window.SeasonSys.seasonAt(seasonT).id) || "spring";
    seasonId = wasSeasonId;
    rain = data.rain || 0;
    rainTimer = data.rainTimer != null ? data.rainTimer : 35;
    if (data.quests) {
      for (const q of quests) {
        const s = data.quests.find((x) => x.id === q.id);
        if (s) q.done = !!s.done;
      }
    }
    generate();
    // restore fires beyond the starter
    fires.length = 0;
    if (data.fires && data.fires.length) {
      for (const f of data.fires) fires.push({ x: f.x, y: f.y, lit: !!f.lit, fuel: f.fuel || 0 });
    } else if (campfire) {
      fires.push(campfire);
    }
    syncPrimaryFire();
    // strip generated player-owned towers then restore
    for (let i = buildings.length - 1; i >= 0; i--) {
      if (buildings[i].owned) buildings.splice(i, 1);
    }
    for (const t of data.towers || []) spawnWatchtower(t.x, t.y);
    // remove generated chests/fences near restore points? just add saved ones
    for (const c of data.chests || []) spawnChest(c.x, c.y, c.store);
    for (const f of data.fences || []) spawnFence(f.x, f.y, false);
    for (const w of data.walls || []) spawnFence(w.x, w.y, true);
    refreshFenceLinks();
    if (data.fog && data.fog.length === fog.length) {
      for (let i = 0; i < fog.length; i++) fog[i] = data.fog[i] ? 1 : 0;
      buildMinimap();
    }
    for (const f of data.farms || []) {
      spawnFarm(f.x, f.y);
      const farm = props[props.length - 1];
      if (farm && farm.kind === "farm") {
        farm.planted = !!f.planted; farm.stage = f.stage || 0; farm.grow = f.grow || 0;
      }
    }
    if (data.hives) {
      // strip generated hives then restore
      for (let i = props.length - 1; i >= 0; i--) if (props[i].kind === "beehive") props.splice(i, 1);
      for (const h of data.hives) {
        props.push({
          kind: "beehive", x: h.x, y: h.y,
          fw: 48, fh: 56, frames: 1, hp: 40, max: 40, solid: false, z: 0,
          honeyLeft: h.honeyLeft != null ? h.honeyLeft : 3, anger: 0,
        });
      }
    }
    for (const t of data.traps || []) {
      spawnTrap(t.x, t.y);
      const trap = props[props.length - 1];
      if (trap && trap.kind === "trap") {
        trap.bait = t.bait || 0; trap.sprung = !!t.sprung;
      }
    }
    if (player && data.player) {
      player.x = data.player.x; player.y = data.player.y;
      player.hp = data.player.hp; player.mp = data.player.mp;
      player.hunger = data.player.hunger; player.corr = data.player.corr;
      player.armor = data.player.armor || 0;
      player.torchOn = !!data.player.torchOn;
      player.warRank = data.player.warRank || (inv.warKit ? 1 : 0);
      player.form = (inv.warKit && data.player.form === "warrior") ? "warrior" : "pawn";
      player.temp = data.player.temp != null ? data.player.temp : 55;
      player.tech = Object.assign({ stonewall: false, lantern: false }, data.player.tech || {});
      if (data.inCave && caveInterior) {
        inCave = true;
        overworldReturn = data.overworldReturn || (caveEntrance ? { x: caveEntrance.x, y: caveEntrance.y + 50 } : null);
        if (data.cavePlayer) { player.x = data.cavePlayer.x; player.y = data.cavePlayer.y; }
      } else {
        inCave = false;
        overworldReturn = null;
      }
      camera.x = player.x - W / 2;
      camera.y = player.y - H / 2;
    }

    if (data.pirateHp != null && pirateTower) {
      pirateTower.hp = data.pirateHp;
      if (pirateTower.hp <= 0) {
        const ix = buildings.indexOf(pirateTower);
        if (ix >= 0) buildings.splice(ix, 1);
        pirateTower = null;
      }
    }
    if (data.corpse && data.corpse.bag) {
      corpse = {
        kind: "corpse", x: data.corpse.x, y: data.corpse.y,
        fw: 48, fh: 32, frames: 1, hp: 999, solid: false,
        bag: { ...data.corpse.bag }, t: 0,
      };
      props.push(corpse);
    }
    if (data.onIsland && islandHub) onIsland = true;
    if (data.onSeaIsland && seaIsland) onSeaIsland = true;
    chestOpen = null;
    craftOpen = false;
    if (window.DstSys) {
      if (!houndClock) houndClock = window.DstSys.createHoundClock();
      if (!toolDur) toolDur = window.DstSys.createTools();
      if (!wetness) wetness = window.DstSys.createWetness();
      window.DstSys.ensureSpoil(inv);
    }
    state = STATE.PLAY;
    toast("你从记忆中醒来，据点仍在。", 3.5);
    return true;
  }

  function update(dt) {
    time += dt;
    if (state === STATE.MENU) {
      if (mouse.leftClick) {
        if (window.DstAudio) window.DstAudio.unlock();
        const m = hitMenuBtn();
        if (m.hitCont) loadGame();
        else if (m.hitNew) beginGame();
        else if (m.hitTest) beginTestGame();
        else if (m.hitCodex) openCodex(false);
      }
      return;
    }
    if (state === STATE.CODEX) {
      if (mouse.leftClick) handleCodexClick();
      return;
    }
    if (state === STATE.CHAR) {
      if (mouse.leftClick && drawCharSelect._hits) {
        for (const h of drawCharSelect._hits) {
          if (mouse.x >= h.x && mouse.x <= h.x + h.w && mouse.y >= h.y && mouse.y <= h.y + h.h) {
            startWithCharacter(h.ch.id);
            break;
          }
        }
      }
      return;
    }
    if (state === STATE.PAUSE) {
      if (mouse.leftClick) state = STATE.PLAY;
      return;
    }
    if (state === STATE.DEAD) {
      if (mouse.leftClick) respawnAtCamp();
      return;
    }
    if (state === STATE.WIN) {
      if (mouse.leftClick) { state = STATE.MENU; }
      return;
    }
    if (state !== STATE.PLAY) return;
    updateCookJob(dt);
    updateRoastJob(dt);
    updateSailJob(dt);
    for (const b of buildings) {
      if (b.lightningRod && (b.charged || 0) > 0) b.charged = Math.max(0, b.charged - dt);
    }
    if (sailJob) {
      updateFx(dt);
      return; // locked during voyage
    }
    if (chestOpen) {
      if (mouse.leftClick) {
        if (chestHover === "__deposit") chestDump(true);
        else if (chestHover === "__withdraw") chestDump(false);
        else if (chestHover) chestTransfer(chestHover, !keys.has("ShiftLeft") && !keys.has("ShiftRight"));
      }
      if (dist(player.x, player.y, chestOpen.x, chestOpen.y) > 100) chestOpen = null;
      updateFx(dt);
      return;
    }
    if (cookOpen) {
      if (mouse.leftClick) {
        if (cookSlotHover >= 0) cycleCookSlot(cookSlotHover);
        else if (cookHover === -2) tryCookSlots();
        else if (cookHover >= 0) {
          const recipes = (window.EnemyPack && window.EnemyPack.COOK_RECIPES) || [];
          tryCook(recipes[cookHover]);
        }
      }
      updateFx(dt);
      return;
    }
    if (craftOpen) {
      if (mouse.leftClick) {
        if (drawCraftMenu._tabHover) craftTab = drawCraftMenu._tabHover;
        else if (craftHover >= 0) {
          const recipes = craftRecipesFiltered();
          tryCraft(recipes[craftHover]);
        }
      }
      updateFx(dt);
      return;
    }
    updateWeather(dt);
    updateTiles(dt);
    updatePlayer(dt);
    updateEntities(dt);
    separateEntities(dt);
    updateProjectiles(dt);
    updateFx(dt);
  }

  function render() {
    ctx.imageSmoothingEnabled = false;
    if (state === STATE.MENU) { drawMenu(); drawCursor(); return; }
    if (state === STATE.CODEX) { drawCodex(); drawCursor(); return; }
    if (state === STATE.CHAR) { drawCharSelect(); drawCursor(); return; }
    if (!player) return;
    drawWorld();
    drawSorted();
    drawDropsAndProj();
    drawOverlays();
    drawHUD();
    if (state === STATE.PAUSE) drawPauseLike("暂停", "元素仍在岛上燃烧与冻结。点击画面继续。", "点击继续");
    if (state === STATE.DEAD) drawPauseLike("陨落", "物资落在倒下之处。点击后在营火旁重生，去取回遗物。", "营火重生");
    if (state === STATE.WIN) drawPauseLike("僭主已死", "红旗倒下。你在魔蚀与饥饿之间活了下来，这座岛暂时承认了你的据点。", "再玩一局");
  }

  function drawCursor() {
    if (imgs.cursor) ctx.drawImage(imgs.cursor, mouse.x - 8, mouse.y - 8, 32, 32);
  }

  function loop(ts) {
    if (!last) last = ts;
    dt = Math.min(0.033, (ts - last) / 1000);
    last = ts;
    mouse.wx = mouse.x + camera.x;
    mouse.wy = mouse.y + camera.y;
    try {
      update(dt);
      render();
    } catch (err) {
      console.error("frame", err);
      if (!loop._errToast || time - loop._errToast > 3) {
        loop._errToast = time;
        try { toast("内部错误（已捕获）：" + (err && err.message ? err.message : "见控制台"), 3); } catch (e2) {}
      }
    }
    mouse.leftClick = false;
    mouse.rightClick = false;
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("keydown", (e) => {
    keys.add(e.code);
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
    if (state === STATE.CODEX) {
      const groups = codexEntries();
      const list = groups[codex.tab] || [];
      const cols = drawCodex._cols || 4;
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        codex.tab = (codex.tab + codex.tabs.length - 1) % codex.tabs.length;
        codex.scroll = 0; codex.sel = 0; codexWheelAcc = 0;
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        codex.tab = (codex.tab + 1) % codex.tabs.length;
        codex.scroll = 0; codex.sel = 0; codexWheelAcc = 0;
      }
      if (e.code === "ArrowUp" || e.code === "KeyW") {
        codex.sel = Math.max(0, codex.sel - cols);
        ensureCodexSelVisible();
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        codex.sel = Math.min(list.length - 1, codex.sel + cols);
        ensureCodexSelVisible();
      }
      if (e.code === "Enter" || e.code === "Space") leaveCodex();
      if (e.code === "Escape") { codex.proceedToChar = false; leaveCodex(); }
    }
    if (state === STATE.PLAY) {
      if (e.code === "Digit1") spell = "fire";
      if (e.code === "Digit2") spell = "ice";
      if (e.code === "Digit3") spell = "lightning";
      if (e.code === "KeyE" && !craftOpen) doExamine(resolveCursorSecondary()); // DST Inspect
      if (e.code === "Space") {
        e.preventDefault();
        doActionNearby(); // DST CONTROL_ACTION: chop/mine/pick/interact
      }
      if (e.code === "KeyF" && !craftOpen && !cookOpen) {
        e.preventDefault();
        doActionNearby({ harvestOnly: true }); // gather (was Z — F is easier)
      }
      if (e.code === "KeyJ" && !craftOpen && !cookOpen) startAttack(true); // attack
      if (e.code === "KeyR" && !craftOpen && !cookOpen) eat();
      if (e.code === "KeyC" && !craftOpen && !cookOpen) castSpell();
      if (e.code === "KeyK" && !craftOpen) castSpell(); // legacy alias
      if (e.code === "Tab") {
        e.preventDefault();
        craftOpen = !craftOpen;
        if (craftOpen) cookOpen = false;
      }
      if (e.code === "KeyM" && !craftOpen && !cookOpen && !chestOpen && !bagOpen) useMapScroll();
      if (e.code === "KeyI") {
        bagOpen = !bagOpen;
        if (bagOpen) { craftOpen = false; cookOpen = false; chestOpen = null; }
      }
      if (e.code === "KeyT") {
        if ((inv.lantern || 0) <= 0 && inv.torch <= 0) toast("没有提灯或火把。");
        else {
          player.torchOn = !player.torchOn;
          if ((inv.lantern || 0) > 0) toast(player.torchOn ? "提灯点亮。" : "提灯熄灭。");
          else toast(player.torchOn ? "点燃火把。" : "熄灭火把。");
        }
      }
      if (e.code === "KeyQ" && !craftOpen && !chestOpen) toggleForm();
      if (e.code === "KeyX" && !craftOpen && !chestOpen) tryDemolish();
      if (e.code === "F5") { e.preventDefault(); saveGame(true); }
      if (e.code === "F9") { e.preventDefault(); loadGame(); }
      if (e.code === "Escape") {
        if (craftOpen) craftOpen = false;
        else if (bagOpen) bagOpen = false;
        else if (cookOpen) cookOpen = false;
        else if (chestOpen) chestOpen = null;
        else state = STATE.PAUSE;
      }
    } else if (state === STATE.PAUSE && e.code === "Escape") state = STATE.PLAY;
    if (state === STATE.MENU && (e.code === "Enter" || e.code === "Space")) beginGame();
    if (state === STATE.CHAR && (e.code === "Enter" || e.code === "Space")) startWithCharacter(charPick || "wilson");
    if (state === STATE.CHAR && e.code === "Digit1") startWithCharacter("wilson");
    if (state === STATE.CHAR && e.code === "Digit2") startWithCharacter("willow");
    if (state === STATE.CHAR && e.code === "Digit3") startWithCharacter("wx");
    if (state === STATE.CHAR && e.code === "Digit4") startWithCharacter("wolfgang");
    if (state === STATE.CHAR && e.code === "Digit5") startWithCharacter("wendy");
    if (state === STATE.CHAR && e.code === "Digit6") startWithCharacter("woodie");
  });
  window.addEventListener("keyup", (e) => keys.delete(e.code));
  let codexWheelAcc = 0;
  window.addEventListener("wheel", (e) => {
    if (state !== STATE.CODEX) return;
    e.preventDefault();
    let dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16;
    else if (e.deltaMode === 2) dy *= 280;
    codexWheelAcc += dy;
    const step = 48; // mid sensitivity: responsive but not twitchy
    const maxScroll = drawCodex._maxScroll != null ? drawCodex._maxScroll : 999;
    while (codexWheelAcc >= step) {
      codex.scroll = Math.min(maxScroll, codex.scroll + 1);
      codexWheelAcc -= step;
    }
    while (codexWheelAcc <= -step) {
      codex.scroll = Math.max(0, codex.scroll - 1);
      codexWheelAcc += step;
    }
    if (Math.abs(codexWheelAcc) < 4) codexWheelAcc = 0;
  }, { passive: false });
  function setMouseFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = rect.width > 0 ? (W / rect.width) : 1;
    const sy = rect.height > 0 ? (H / rect.height) : 1;
    mouse.x = (e.clientX - rect.left) * sx;
    mouse.y = (e.clientY - rect.top) * sy;
  }
  function charHitList() {
    // Prefer live hitboxes from last draw; fallback mirrors 3-column layout
    if (drawCharSelect._hits && drawCharSelect._hits.length) return drawCharSelect._hits.slice();
    const cols = 3, gapX = 14, gapY = 12;
    const cardW = Math.min(220, Math.floor((Math.min(W - 80, 720) - (cols - 1) * gapX) / cols));
    const cardH = 92;
    const rows = Math.ceil(CHARACTERS.length / cols);
    const gridW = cols * cardW + (cols - 1) * gapX;
    const gridH = rows * cardH + (rows - 1) * gapY;
    const panelW = Math.min(W - 40, gridW + 48);
    const panelH = Math.min(H - 40, gridH + 120);
    const panelX = (W - panelW) / 2;
    const panelY = Math.max(20, (H - panelH) / 2);
    const gridX = panelX + (panelW - gridW) / 2;
    const gridY = panelY + 78;
    const hits = [];
    CHARACTERS.forEach((ch, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      hits.push({
        ch,
        x: gridX + col * (cardW + gapX),
        y: gridY + row * (cardH + gapY),
        w: cardW,
        h: cardH,
      });
    });
    return hits;
  }

  function handleMenuClick() {
    if (window.DstAudio) window.DstAudio.unlock();
    if (state === STATE.MENU) {
      const m = hitMenuBtn();
      if (m.hitCont) { loadGame(); return true; }
      if (m.hitNew) { beginGame(); return true; }
      if (m.hitTest) { beginTestGame(); return true; }
      if (m.hitCodex) { openCodex(false); return true; }
      return false;
    }
    if (state === STATE.CHAR) {
      const hits = drawCharSelect._hits && drawCharSelect._hits.length ? drawCharSelect._hits : charHitList();
      for (const h of hits) {
        if (mouse.x >= h.x && mouse.x <= h.x + h.w && mouse.y >= h.y && mouse.y <= h.y + h.h) {
          startWithCharacter(h.ch.id);
          return true;
        }
      }
      return false;
    }
    if (state === STATE.DEAD) {
      respawnAtCamp();
      return true;
    }
    if (state === STATE.PAUSE) {
      state = STATE.PLAY;
      return true;
    }
    if (state === STATE.WIN) {
      state = STATE.MENU;
      return true;
    }
    return false;
  }
  window.addEventListener("mousemove", (e) => { setMouseFromEvent(e); });
  window.addEventListener("mousedown", (e) => {
    setMouseFromEvent(e);
    if (e.button === 0) {
      mouse.left = true;
      if (state === STATE.MENU || state === STATE.CHAR || state === STATE.DEAD
        || state === STATE.PAUSE || state === STATE.WIN) {
        handleMenuClick();
      } else if (state === STATE.PLAY) {
        onPrimaryDown();
      }
    }
    if (e.button === 2) {
      mouse.right = true;
      if (state === STATE.PLAY) onSecondaryDown();
    }
  });
  window.addEventListener("mouseup", (e) => {
    setMouseFromEvent(e);
    if (e.button === 0) {
      mouse.left = false;
      mouse.leftClick = true;
      lmbDrag = false;
    }
    if (e.button === 2) { mouse.right = false; mouse.rightClick = true; }
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  // Touch support
  canvas.addEventListener("touchstart", (e) => {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    const t = e.changedTouches[0];
    setMouseFromEvent(t);
    mouse.left = true;
    if (state === STATE.MENU || state === STATE.CHAR) handleMenuClick();
    else if (state === STATE.PLAY) onPrimaryDown();
    e.preventDefault();
  }, { passive: false });
  canvas.addEventListener("touchend", (e) => {
    mouse.left = false;
    mouse.leftClick = true;
    lmbDrag = false;
    e.preventDefault();
  }, { passive: false });

  resize();
  window.__game = {
    get state() { return state; },
    get player() { return player; },
    get camera() { return camera; },
    get imgs() { return imgs; },
    get inv() { return inv; },
    get props() { return props; },
    get projectiles() { return projectiles; },
    get miniCanvas() { return miniCanvas; },
    get landmarks() { return landmarks; },
    tileAt,
    world,
    beginGame,
    startWithCharacter,
    castSpell,
    startAttack,
    applyFire,
    drawMinimap,
    PATHS,
  };
  loadAll().then(() => {
    boot.classList.add("hide");
    state = STATE.MENU;
    requestAnimationFrame(loop);
  }).catch((err) => {
    loadtext.textContent = "资源加载失败：" + err.message;
  });
})();
