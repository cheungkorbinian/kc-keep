/**
 * Enemy catalog + crafting recipes for 魔蚀据点.
 */
(function (global) {
  "use strict";

  const EP = "Tiny Swords (Enemy Pack)/Enemy Pack";
  const U010 = "Tiny Swords (Update 010)/Factions";

  const ENEMIES = {
    torch_goblin: {
      name: "火把哥布林",
      role: "night_raider",
      hp: 38, speed: 95, aggro: 560, dmg: 10, r: 14,
      fw: 192, fh: 192,
      idleFrames: 8, runFrames: 6, atkFrames: 8,
      idle: EP + "/Torch Goblin/Torch Goblin_Idle.png",
      run: EP + "/Torch Goblin/Torch Goblin_Run.png",
      atk: EP + "/Torch Goblin/Torch Goblin_Attack.png",
      avatar: EP + "/Torch Goblin/Torch Goblin_Avatar.png",
      nightOnly: true,
    },
    spear_goblin: {
      name: "长矛哥布林",
      role: "melee",
      hp: 48, speed: 88, aggro: 480, dmg: 14, r: 15,
      fw: 256, fh: 256,
      idleFrames: 8, runFrames: 6, atkFrames: 7,
      idle: EP + "/Spear Goblin/Spear Goblin_Idle.png",
      run: EP + "/Spear Goblin/Spear Goblin_Run.png",
      atk: EP + "/Spear Goblin/Spear Goblin_Attack Fast.png",
      avatar: EP + "/Spear Goblin/Spear Goblin_Avatar.png",
    },
    skull: {
      name: "魔蚀骷髅",
      role: "night_undead",
      hp: 32, speed: 70, aggro: 520, dmg: 9, r: 13,
      fw: 192, fh: 192,
      idleFrames: 8, runFrames: 6, atkFrames: 7,
      idle: EP + "/Skull/Skull_Idle.png",
      run: EP + "/Skull/Skull_Run.png",
      atk: EP + "/Skull/Skull_Attack.png",
      avatar: EP + "/Skull/Skull_Avatar.png",
      nightOnly: true,
    },
    spider: {
      name: "密林蛛",
      role: "forest",
      hp: 28, speed: 110, aggro: 420, dmg: 8, r: 12,
      fw: 192, fh: 192,
      idleFrames: 8, runFrames: 5, atkFrames: 8,
      idle: EP + "/Spider/Spider_Idle.png",
      run: EP + "/Spider/Spider_Run.png",
      atk: EP + "/Spider/Spider_Attack.png",
      avatar: EP + "/Spider/Spider_Avatar.png",
    },
    bat: {
      name: "巨蝠",
      role: "cave_flyer",
      hp: 24, speed: 130, aggro: 600, dmg: 7, r: 12,
      fw: 192, fh: 192,
      idleFrames: 6, runFrames: 4, atkFrames: 7,
      idle: EP + "/Giant Bat/Giant Bat_Idle.png",
      run: EP + "/Giant Bat/Giant Bat_Move.png",
      atk: EP + "/Giant Bat/Giant Bat_Attack.png",
      avatar: EP + "/Giant Bat/Giant Bat_Avatar.png",
      nightOnly: true,
    },
    crow: {
      name: "拾荒鸦",
      role: "rocky_bird",
      hp: 12, speed: 150, aggro: 200, dmg: 3, r: 10,
      fw: 192, fh: 192,
      idleFrames: 6, runFrames: 4, atkFrames: 7,
      // No crow sheet in pack — reuse bat silhouette with dark recolor
      idle: EP + "/Giant Bat/Giant Bat_Idle.png",
      run: EP + "/Giant Bat/Giant Bat_Move.png",
      atk: EP + "/Giant Bat/Giant Bat_Attack.png",
      avatar: EP + "/Giant Bat/Giant Bat_Avatar.png",
      filter: "grayscale(0.9) brightness(0.45) contrast(1.35) saturate(0.2)",
    },
    bat_queen: {
      name: "蝠后",
      role: "cave_boss",
      hp: 280, speed: 95, aggro: 840, dmg: 16, r: 18,
      fw: 192, fh: 192,
      idleFrames: 6, runFrames: 4, atkFrames: 7,
      idle: EP + "/Giant Bat/Giant Bat_Idle.png",
      run: EP + "/Giant Bat/Giant Bat_Move.png",
      atk: EP + "/Giant Bat/Giant Bat_Attack.png",
      avatar: EP + "/Giant Bat/Giant Bat_Avatar.png",
      filter: "hue-rotate(275deg) saturate(1.7) brightness(1.05)",
    },
    bear: {
      name: "荒原熊",
      role: "bosslet",
      hp: 160, speed: 75, aggro: 440, dmg: 22, r: 20,
      fw: 256, fh: 256,
      idleFrames: 8, runFrames: 5, atkFrames: 9,
      idle: EP + "/Bear/Bear_Idle.png",
      run: EP + "/Bear/Bear_Run.png",
      atk: EP + "/Bear/Bear_Attack.png",
      avatar: EP + "/Bear/Bear_Avatar.png",
    },
    troll: {
      name: "山岳巨魔",
      role: "brute",
      hp: 220, speed: 55, aggro: 420, dmg: 28, r: 22,
      fw: 384, fh: 384,
      idleFrames: 12, runFrames: 10, atkFrames: 6,
      idle: EP + "/Troll/Troll_Idle.png",
      run: EP + "/Troll/Troll_Walk.png",
      atk: EP + "/Troll/Troll_Attack.png",
      avatar: EP + "/Troll/Troll_Avatar.png",
    },
    hex_shaman: {
      role: "caster",
      name: "妖术萨满",
      hp: 42, speed: 72, aggro: 680, dmg: 12, r: 14,
      fw: 192, fh: 192,
      idleFrames: 8, runFrames: 4, atkFrames: 10,
      idle: EP + "/Hex Shaman/Hex Shaman_Idle.png",
      run: EP + "/Hex Shaman/Hex Shaman_Run.png",
      atk: EP + "/Hex Shaman/Hex Shaman_Attack.png",
      avatar: EP + "/Hex Shaman/Hex Shaman_Avatar.png",
      ranged: "hex",
    },
    gnoll: {
      name: "掷骨豺狼人",
      role: "thrower",
      hp: 40, speed: 92, aggro: 600, dmg: 9, r: 14,
      fw: 192, fh: 192,
      idleFrames: 6, runFrames: 8, atkFrames: 8,
      idle: EP + "/Gnoll/Gnoll_Idle.png",
      run: EP + "/Gnoll/Gnoll_Walk.png",
      atk: EP + "/Gnoll/Gnoll_Throw.png",
      avatar: EP + "/Gnoll/Gnoll_Avatar.png",
      ranged: "bone",
    },
    harpoon_shark: {
      name: "鱼叉鲨",
      role: "shore_ranged",
      hp: 55, speed: 80, aggro: 640, dmg: 12, r: 16,
      fw: 192, fh: 192,
      idleFrames: 8, runFrames: 6, atkFrames: 8,
      idle: EP + "/Harpoon Shark/Harpoon Shark_Idle.png",
      run: EP + "/Harpoon Shark/Harpoon Shark_Run.png",
      atk: EP + "/Harpoon Shark/Harpoon Shark_Throw.png",
      avatar: EP + "/Harpoon Shark/Harpoon Shark_Avatar.png",
      ranged: "harpoon",
    },
    paddle_shark: {
      name: "桨鳍鲨",
      role: "shore_melee",
      hp: 70, speed: 100, aggro: 520, dmg: 15, r: 17,
      fw: 192, fh: 192,
      idleFrames: 8, runFrames: 6, atkFrames: 6,
      idle: EP + "/Paddle Shark/Paddle Shark_Idle.png",
      run: EP + "/Paddle Shark/Paddle Shark_Run.png",
      atk: EP + "/Paddle Shark/Paddle Shark_Attack.png",
      avatar: EP + "/Paddle Shark/Paddle Shark_Avatar.png",
    },
    imp: {
      name: "小恶魔",
      role: "magic_melee",
      hp: 34, speed: 115, aggro: 480, dmg: 11, r: 12,
      fw: 192, fh: 192,
      idleFrames: 8, runFrames: 6, atkFrames: 4,
      idle: EP + "/Imp/Imp_Idle.png",
      run: EP + "/Imp/Imp_Move.png",
      atk: EP + "/Imp/Imp_Attack_Start.png",
      avatar: EP + "/Imp/Imp_Avatar.png",
    },
    sling_gnome: {
      name: "弹弓侏儒",
      role: "forest_ranged",
      hp: 36, speed: 85, aggro: 600, dmg: 9, r: 13,
      fw: 192, fh: 192,
      idleFrames: 10, runFrames: 6, atkFrames: 9,
      idle: EP + "/Slingshot Gnome/Slingshot Gnome_Idle.png",
      run: EP + "/Slingshot Gnome/Slingshot Gnome_Run.png",
      atk: EP + "/Slingshot Gnome/Slingshot Gnome_Shoot.png",
      avatar: EP + "/Slingshot Gnome/Slingshot Gnome_Avatar.png",
      ranged: "acorn",
    },
    minotaur: {
      name: "废墟牛头人",
      role: "ruin_brute",
      hp: 320, speed: 62, aggro: 560, dmg: 26, r: 24,
      fw: 320, fh: 320,
      idleFrames: 16, runFrames: 8, atkFrames: 12,
      idle: EP + "/Minotaur/Minotaur_Idle.png",
      run: EP + "/Minotaur/Minotaur_Walk.png",
      atk: EP + "/Minotaur/Minotaur_Attack.png",
      avatar: EP + "/Minotaur/Minotaur__Avatar.png",
    },
    bee: {
      name: "刺蜂",
      role: "meadow_swarm",
      hp: 18, speed: 140, aggro: 420, dmg: 6, r: 10,
      fw: 192, fh: 192,
      idleFrames: 8, runFrames: 4, atkFrames: 11,
      idle: EP + "/Bumblebee/Bumblebee_Idle.png",
      run: EP + "/Bumblebee/Bumblebee_Move.png",
      atk: EP + "/Bumblebee/Bumblebee_Attack.png",
      avatar: EP + "/Bumblebee/Bumblebee_Avatar.png",
    },
    snake: {
      name: "草蛇",
      role: "meadow",
      hp: 26, speed: 100, aggro: 420, dmg: 9, r: 12,
      fw: 192, fh: 192,
      idleFrames: 8, runFrames: 8, atkFrames: 6,
      idle: EP + "/Snake/Snake_Idle.png",
      run: EP + "/Snake/Snake_Run.png",
      atk: EP + "/Snake/Snake_Attack.png",
      avatar: EP + "/Snake/Snake_Avatar.png",
    },
    frog: {
      name: "青蛙",
      role: "marsh_frog",
      hp: 22, speed: 110, aggro: 380, dmg: 8, r: 11,
      fw: 192, fh: 192,
      idleFrames: 7, runFrames: 6, atkFrames: 9,
      // No frog sheet — lizard pose with marsh-green recolor vs plain lizard
      idle: EP + "/Lizard/Lizard_Idle.png",
      run: EP + "/Lizard/Lizard_Run.png",
      atk: EP + "/Lizard/Lizard_Attack.png",
      avatar: EP + "/Lizard/Lizard_Avatar.png",
      filter: "hue-rotate(95deg) saturate(1.55) brightness(1.08)",
    },
    // —— Tiny Swords Enemy Pack fauna ——
    turtle: {
      name: "沼龟",
      role: "marsh_tank",
      hp: 95, speed: 48, aggro: 380, dmg: 16, r: 20,
      fw: 320, fh: 320,
      idleFrames: 10, runFrames: 7, atkFrames: 10,
      idle: EP + "/Turtle/Turtle_Idle.png",
      run: EP + "/Turtle/Turtle_Walk.png",
      atk: EP + "/Turtle/Turtle_Attack.png",
      avatar: EP + "/Turtle/Turtle_Avatar.png",
    },
    panda: {
      name: "密林熊猫",
      role: "deciduous_brute",
      hp: 140, speed: 70, aggro: 360, dmg: 20, r: 20,
      fw: 256, fh: 256,
      idleFrames: 10, runFrames: 6, atkFrames: 13,
      idle: EP + "/Panda/Panda_Idle.png",
      run: EP + "/Panda/Panda_Run.png",
      atk: EP + "/Panda/Panda_Attack.png",
      avatar: EP + "/Panda/Panda_Avatar.png",
    },
    lizard: {
      name: "荒原蜥蜴",
      role: "savanna_skirmisher",
      hp: 34, speed: 120, aggro: 500, dmg: 11, r: 13,
      fw: 192, fh: 192,
      idleFrames: 7, runFrames: 6, atkFrames: 9,
      idle: EP + "/Lizard/Lizard_Idle.png",
      run: EP + "/Lizard/Lizard_Run.png",
      atk: EP + "/Lizard/Lizard_Attack.png",
      avatar: EP + "/Lizard/Lizard_Avatar.png",
    },
    thief: {
      name: "盗贼",
      role: "raid_thief",
      hp: 40, speed: 130, aggro: 560, dmg: 10, r: 13,
      fw: 192, fh: 192,
      idleFrames: 6, runFrames: 6, atkFrames: 6,
      idle: EP + "/Thief/Thief_Idle.png",
      run: EP + "/Thief/Thief_Run.png",
      atk: EP + "/Thief/Thief_Attack.png",
      avatar: EP + "/Thief/Thief_Avatar.png",
      nightOnly: true,
    },
    bomb_fish: {
      name: "炸弹鱼",
      role: "ocean_bomber",
      hp: 48, speed: 85, aggro: 620, dmg: 14, r: 15,
      fw: 192, fh: 192,
      idleFrames: 8, runFrames: 6, atkFrames: 7,
      idle: EP + "/Bomb Fish/Bomb Fish_Idle.png",
      run: EP + "/Bomb Fish/Bomb Fish_Run.png",
      atk: EP + "/Bomb Fish/Bomb Fish_Shoot.png",
      avatar: EP + "/Bomb Fish/Bomb Fish_Avatar.png",
      ranged: "bomb",
    },
    gnome: {
      name: "近战侏儒",
      role: "forest_melee",
      hp: 42, speed: 90, aggro: 460, dmg: 12, r: 13,
      fw: 192, fh: 192,
      idleFrames: 8, runFrames: 6, atkFrames: 7,
      idle: EP + "/Gnome/Gnome_Idle.png",
      run: EP + "/Gnome/Gnome_Run.png",
      atk: EP + "/Gnome/Gnome_Attack.png",
      avatar: EP + "/Gnome/Gnome_Avatar.png",
    },
    bomber_goblin: {
      name: "炸药哥布林",
      role: "bomber",
      hp: 42, speed: 88, aggro: 540, dmg: 12, r: 14,
      fw: 192, fh: 192,
      idleFrames: 7, runFrames: 6, atkFrames: 6,
      // Distinct from torch goblin — Update 010 TNT troop sheet
      idle: U010 + "/Goblins/Troops/TNT/Red/TNT_Red.png",
      run: U010 + "/Goblins/Troops/TNT/Red/TNT_Red.png",
      atk: U010 + "/Goblins/Troops/TNT/Red/TNT_Red.png",
      avatar: U010 + "/Goblins/Troops/TNT/Red/TNT_Red.png",
      ranged: "bomb",
    },
    pig_rider: {
      name: "猪骑士",
      role: "pig_cavalry",
      hp: 85, speed: 105, aggro: 520, dmg: 18, r: 17,
      fw: 256, fh: 256,
      idleFrames: 8, runFrames: 4, atkFrames: 7,
      idle: EP + "/Extra/Pig Rider Spear Goblin/Pig Rider_Idle.png",
      run: EP + "/Extra/Pig Rider Spear Goblin/Pig Rider_Run.png",
      atk: EP + "/Extra/Pig Rider Spear Goblin/Pig Rider_Attack.png",
      avatar: EP + "/Extra/Pig Rider Spear Goblin/Pig Rider_Idle.png",
    },

    barrel_goblin: {
      name: "木桶哥布林",
      role: "melee",
      hp: 55, speed: 70, aggro: 460, dmg: 13, r: 15,
      // 768×768 atlas is 6×6 of 128px cells (192 sliced neighbors → ghost barrels)
      fw: 128, fh: 128,
      idleFrames: 6, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Goblins/Troops/Barrel/Red/Barrel_Red.png",
      run: U010 + "/Goblins/Troops/Barrel/Red/Barrel_Red.png",
      atk: U010 + "/Goblins/Troops/Barrel/Red/Barrel_Red.png",
      avatar: U010 + "/Goblins/Troops/Barrel/Red/Barrel_Red.png",
    },
    tnt_goblin: {
      name: "TNT哥布林",
      role: "bomber",
      hp: 45, speed: 85, aggro: 560, dmg: 14, r: 14,
      fw: 192, fh: 192,
      idleFrames: 8, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Goblins/Troops/TNT/Red/TNT_Red.png",
      run: U010 + "/Goblins/Troops/TNT/Red/TNT_Red.png",
      atk: U010 + "/Goblins/Troops/TNT/Red/TNT_Red.png",
      avatar: U010 + "/Goblins/Troops/TNT/Red/TNT_Red.png",
      ranged: "bomb",
    },
    clan_torch: {
      name: "火把族哥布林",
      role: "night_raider",
      hp: 40, speed: 92, aggro: 540, dmg: 11, r: 14,
      fw: 192, fh: 192,
      idleFrames: 8, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Goblins/Troops/Torch/Red/Torch_Red.png",
      run: U010 + "/Goblins/Troops/Torch/Red/Torch_Red.png",
      atk: U010 + "/Goblins/Troops/Torch/Red/Torch_Red.png",
      avatar: U010 + "/Goblins/Troops/Torch/Red/Torch_Red.png",
      nightOnly: true,
    },
    knight_warrior: {
      name: "骑士武士",
      role: "melee",
      hp: 70, speed: 78, aggro: 500, dmg: 15, r: 15,
      fw: 192, fh: 192,
      idleFrames: 8, runFrames: 6, atkFrames: 8,
      idle: U010 + "/Knights/Troops/Warrior/Blue/Warrior_Blue.png",
      run: U010 + "/Knights/Troops/Warrior/Blue/Warrior_Blue.png",
      atk: U010 + "/Knights/Troops/Warrior/Blue/Warrior_Blue.png",
      avatar: U010 + "/Knights/Troops/Warrior/Blue/Warrior_Blue.png",
    },
    knight_archer: {
      name: "骑士弓手",
      role: "ranged",
      hp: 42, speed: 72, aggro: 580, dmg: 10, r: 13,
      fw: 192, fh: 192,
      // First row only has 6 poses; frames 6–7 are empty → black codex icons
      idleFrames: 6, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Knights/Troops/Archer/Blue/Archer_Blue.png",
      run: U010 + "/Knights/Troops/Archer/Blue/Archer_Blue.png",
      atk: U010 + "/Knights/Troops/Archer/Blue/Archer_Blue.png",
      avatar: U010 + "/Knights/Troops/Archer/Blue/Archer_Blue.png",
      ranged: "arrow",
    },
    knight_pawn: {
      name: "骑士劳工",
      role: "worker",
      hp: 35, speed: 65, aggro: 280, dmg: 6, r: 12,
      fw: 192, fh: 192,
      idleFrames: 8, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Knights/Troops/Pawn/Blue/Pawn_Blue.png",
      run: U010 + "/Knights/Troops/Pawn/Blue/Pawn_Blue.png",
      atk: U010 + "/Knights/Troops/Pawn/Blue/Pawn_Blue.png",
      avatar: U010 + "/Knights/Troops/Pawn/Blue/Pawn_Blue.png",
    },

    barrel_goblin_y: {
      name: "木桶哥布林·金",
      role: "melee",
      hp: 55, speed: 70, aggro: 460, dmg: 13, r: 15,
      fw: 128, fh: 128, idleFrames: 6, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Goblins/Troops/Barrel/Yellow/Barrel_Yellow.png",
      run: U010 + "/Goblins/Troops/Barrel/Yellow/Barrel_Yellow.png",
      atk: U010 + "/Goblins/Troops/Barrel/Yellow/Barrel_Yellow.png",
      avatar: U010 + "/Goblins/Troops/Barrel/Yellow/Barrel_Yellow.png",
    },
    barrel_goblin_p: {
      name: "木桶哥布林·紫",
      role: "melee",
      hp: 55, speed: 70, aggro: 460, dmg: 13, r: 15,
      fw: 128, fh: 128, idleFrames: 6, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Goblins/Troops/Barrel/Purple/Barrel_Purple.png",
      run: U010 + "/Goblins/Troops/Barrel/Purple/Barrel_Purple.png",
      atk: U010 + "/Goblins/Troops/Barrel/Purple/Barrel_Purple.png",
      avatar: U010 + "/Goblins/Troops/Barrel/Purple/Barrel_Purple.png",
    },
    tnt_goblin_b: {
      name: "TNT哥布林·蓝",
      role: "bomber",
      hp: 45, speed: 85, aggro: 560, dmg: 14, r: 14,
      fw: 192, fh: 192, idleFrames: 8, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Goblins/Troops/TNT/Blue/TNT_Blue.png",
      run: U010 + "/Goblins/Troops/TNT/Blue/TNT_Blue.png",
      atk: U010 + "/Goblins/Troops/TNT/Blue/TNT_Blue.png",
      avatar: U010 + "/Goblins/Troops/TNT/Blue/TNT_Blue.png",
      ranged: "bomb",
    },
    knight_warrior_r: {
      name: "骑士武士·红",
      role: "melee",
      hp: 70, speed: 78, aggro: 500, dmg: 15, r: 15,
      fw: 192, fh: 192, idleFrames: 8, runFrames: 6, atkFrames: 8,
      idle: U010 + "/Knights/Troops/Warrior/Red/Warrior_Red.png",
      run: U010 + "/Knights/Troops/Warrior/Red/Warrior_Red.png",
      atk: U010 + "/Knights/Troops/Warrior/Red/Warrior_Red.png",
      avatar: U010 + "/Knights/Troops/Warrior/Red/Warrior_Red.png",
    },
    knight_warrior_y: {
      name: "骑士武士·金",
      role: "melee",
      hp: 70, speed: 78, aggro: 500, dmg: 15, r: 15,
      fw: 192, fh: 192, idleFrames: 8, runFrames: 6, atkFrames: 8,
      idle: U010 + "/Knights/Troops/Warrior/Yellow/Warrior_Yellow.png",
      run: U010 + "/Knights/Troops/Warrior/Yellow/Warrior_Yellow.png",
      atk: U010 + "/Knights/Troops/Warrior/Yellow/Warrior_Yellow.png",
      avatar: U010 + "/Knights/Troops/Warrior/Yellow/Warrior_Yellow.png",
    },
    knight_archer_r: {
      name: "骑士弓手·红",
      role: "ranged",
      hp: 42, speed: 72, aggro: 580, dmg: 10, r: 13,
      fw: 192, fh: 192, idleFrames: 6, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Knights/Troops/Archer/Red/Archer_Red.png",
      run: U010 + "/Knights/Troops/Archer/Red/Archer_Red.png",
      atk: U010 + "/Knights/Troops/Archer/Red/Archer_Red.png",
      avatar: U010 + "/Knights/Troops/Archer/Red/Archer_Red.png",
      ranged: "arrow",
    },
    knight_pawn_y: {
      name: "骑士劳工·金",
      role: "worker",
      hp: 35, speed: 65, aggro: 280, dmg: 6, r: 12,
      fw: 192, fh: 192, idleFrames: 8, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Knights/Troops/Pawn/Yellow/Pawn_Yellow.png",
      run: U010 + "/Knights/Troops/Pawn/Yellow/Pawn_Yellow.png",
      atk: U010 + "/Knights/Troops/Pawn/Yellow/Pawn_Yellow.png",
      avatar: U010 + "/Knights/Troops/Pawn/Yellow/Pawn_Yellow.png",
    },
    barrel_goblin_b: {
      name: "木桶哥布林·蓝",
      role: "melee",
      hp: 50, speed: 75, aggro: 500, dmg: 12, r: 14,
      fw: 128, fh: 128, idleFrames: 6, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Goblins/Troops/Barrel/Blue/Barrel_Blue.png",
      run: U010 + "/Goblins/Troops/Barrel/Blue/Barrel_Blue.png",
      atk: U010 + "/Goblins/Troops/Barrel/Blue/Barrel_Blue.png",
      avatar: U010 + "/Goblins/Troops/Barrel/Blue/Barrel_Blue.png",
    },
    tnt_goblin_p: {
      name: "TNT哥布林·紫",
      role: "bomber",
      hp: 50, speed: 75, aggro: 500, dmg: 12, r: 14,
      fw: 192, fh: 192, idleFrames: 8, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Goblins/Troops/TNT/Purple/TNT_Purple.png",
      run: U010 + "/Goblins/Troops/TNT/Purple/TNT_Purple.png",
      atk: U010 + "/Goblins/Troops/TNT/Purple/TNT_Purple.png",
      avatar: U010 + "/Goblins/Troops/TNT/Purple/TNT_Purple.png",
      ranged: "bomb",
    },
    tnt_goblin_y: {
      name: "TNT哥布林·金",
      role: "bomber",
      hp: 50, speed: 75, aggro: 500, dmg: 12, r: 14,
      fw: 192, fh: 192, idleFrames: 8, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Goblins/Troops/TNT/Yellow/TNT_Yellow.png",
      run: U010 + "/Goblins/Troops/TNT/Yellow/TNT_Yellow.png",
      atk: U010 + "/Goblins/Troops/TNT/Yellow/TNT_Yellow.png",
      avatar: U010 + "/Goblins/Troops/TNT/Yellow/TNT_Yellow.png",
      ranged: "bomb",
    },
    clan_torch_b: {
      name: "火把族·蓝",
      role: "night_raider",
      hp: 50, speed: 75, aggro: 500, dmg: 12, r: 14,
      fw: 192, fh: 192, idleFrames: 8, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Goblins/Troops/Torch/Blue/Torch_Blue.png",
      run: U010 + "/Goblins/Troops/Torch/Blue/Torch_Blue.png",
      atk: U010 + "/Goblins/Troops/Torch/Blue/Torch_Blue.png",
      avatar: U010 + "/Goblins/Troops/Torch/Blue/Torch_Blue.png",
      nightOnly: true,
    },
    clan_torch_p: {
      name: "火把族·紫",
      role: "night_raider",
      hp: 50, speed: 75, aggro: 500, dmg: 12, r: 14,
      fw: 192, fh: 192, idleFrames: 8, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Goblins/Troops/Torch/Purple/Torch_Purple.png",
      run: U010 + "/Goblins/Troops/Torch/Purple/Torch_Purple.png",
      atk: U010 + "/Goblins/Troops/Torch/Purple/Torch_Purple.png",
      avatar: U010 + "/Goblins/Troops/Torch/Purple/Torch_Purple.png",
      nightOnly: true,
    },
    clan_torch_y: {
      name: "火把族·金",
      role: "night_raider",
      hp: 50, speed: 75, aggro: 500, dmg: 12, r: 14,
      fw: 192, fh: 192, idleFrames: 8, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Goblins/Troops/Torch/Yellow/Torch_Yellow.png",
      run: U010 + "/Goblins/Troops/Torch/Yellow/Torch_Yellow.png",
      atk: U010 + "/Goblins/Troops/Torch/Yellow/Torch_Yellow.png",
      avatar: U010 + "/Goblins/Troops/Torch/Yellow/Torch_Yellow.png",
      nightOnly: true,
    },
    knight_archer_p: {
      name: "骑士弓手·紫",
      role: "ranged",
      hp: 50, speed: 75, aggro: 500, dmg: 12, r: 14,
      fw: 192, fh: 192, idleFrames: 6, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Knights/Troops/Archer/Purple/Archer_Purlple.png",
      run: U010 + "/Knights/Troops/Archer/Purple/Archer_Purlple.png",
      atk: U010 + "/Knights/Troops/Archer/Purple/Archer_Purlple.png",
      avatar: U010 + "/Knights/Troops/Archer/Purple/Archer_Purlple.png",
      ranged: "arrow",
    },
    knight_archer_y: {
      name: "骑士弓手·金",
      role: "ranged",
      hp: 50, speed: 75, aggro: 500, dmg: 12, r: 14,
      fw: 192, fh: 192, idleFrames: 6, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Knights/Troops/Archer/Yellow/Archer_Yellow.png",
      run: U010 + "/Knights/Troops/Archer/Yellow/Archer_Yellow.png",
      atk: U010 + "/Knights/Troops/Archer/Yellow/Archer_Yellow.png",
      avatar: U010 + "/Knights/Troops/Archer/Yellow/Archer_Yellow.png",
      ranged: "arrow",
    },
    knight_pawn_p: {
      name: "骑士劳工·紫",
      role: "worker",
      hp: 50, speed: 75, aggro: 500, dmg: 12, r: 14,
      fw: 192, fh: 192, idleFrames: 8, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Knights/Troops/Pawn/Purple/Pawn_Purple.png",
      run: U010 + "/Knights/Troops/Pawn/Purple/Pawn_Purple.png",
      atk: U010 + "/Knights/Troops/Pawn/Purple/Pawn_Purple.png",
      avatar: U010 + "/Knights/Troops/Pawn/Purple/Pawn_Purple.png",
    },
    knight_pawn_r: {
      name: "骑士劳工·红",
      role: "worker",
      hp: 50, speed: 75, aggro: 500, dmg: 12, r: 14,
      fw: 192, fh: 192, idleFrames: 8, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Knights/Troops/Pawn/Red/Pawn_Red.png",
      run: U010 + "/Knights/Troops/Pawn/Red/Pawn_Red.png",
      atk: U010 + "/Knights/Troops/Pawn/Red/Pawn_Red.png",
      avatar: U010 + "/Knights/Troops/Pawn/Red/Pawn_Red.png",
    },
    knight_warrior_p: {
      name: "骑士武士·紫",
      role: "melee",
      hp: 50, speed: 75, aggro: 500, dmg: 12, r: 14,
      fw: 192, fh: 192, idleFrames: 8, runFrames: 6, atkFrames: 6,
      idle: U010 + "/Knights/Troops/Warrior/Purple/Warrior_Purple.png",
      run: U010 + "/Knights/Troops/Warrior/Purple/Warrior_Purple.png",
      atk: U010 + "/Knights/Troops/Warrior/Purple/Warrior_Purple.png",
      avatar: U010 + "/Knights/Troops/Warrior/Purple/Warrior_Purple.png",
    },
  };

  const RECIPES = [
    // Costs / tabs / science gates ≈ DST Recipe2 + RECIPETABS (Tiny Swords reskin; no Klei code).
    {
      id: "fuel",
      tab: "light",
      name: "添柴",
      desc: "向最近营火添燃料（优先木炭）",
      cost: {},
      nearFire: true,
      craft(ctx) {
        const f = ctx.nearestFire();
        if (!f) { ctx.toast("附近没有营火。"); return false; }
        if ((ctx.inv.charcoal || 0) > 0) {
          ctx.inv.charcoal--;
          f.fuel = Math.min(160, (f.fuel || 0) + 42);
          f.lit = true;
          ctx.toast("木炭添火，燃得更旺。");
          return;
        }
        if ((ctx.inv.wood || 0) <= 0) { ctx.toast("需要木头或木炭。"); return false; }
        ctx.inv.wood--;
        f.fuel = Math.min(140, (f.fuel || 0) + 28);
        f.lit = true;
        ctx.toast("营火燃得更旺了。");
      },
    },
    {
      id: "torch",
      tab: "light",
      name: "火把",
      desc: "草×2 + 树枝×2 · T 开关（DST torch）",
      cost: { grass: 2, twigs: 2 },
      craft(ctx) {
        ctx.inv.torch = (ctx.inv.torch || 0) + 1;
        ctx.toast("制作了火把。");
      },
    },
    {
      id: "campfire",
      tab: "light",
      name: "营火",
      desc: "草×3 + 木头×2（DST campfire）",
      cost: { grass: 3, wood: 2 },
      craft(ctx) {
        ctx.placeAhead("campfire");
        ctx.toast("新的营火升起。");
      },
    },
    {
      id: "firepit",
      tab: "light",
      name: "火坑",
      desc: "木头×2 + 燧石×8（近似 DST firepit rocks）",
      cost: { wood: 2, flint: 8 },
      craft(ctx) {
        ctx.placeAhead("firepit");
        ctx.toast("砌好了火坑（更耐烧，不易熄灭）。");
      },
    },
    {
      id: "lantern",
      tab: "light",
      name: "提灯",
      desc: "SCIENCE_TWO · 树枝/绳索（近似 lantern）",
      science: 2,
      cost: { twigs: 3, rope: 2, gold: 1 },
      craft(ctx) {
        ctx.inv.lantern = (ctx.inv.lantern || 0) + 1;
        ctx.player.tech = ctx.player.tech || {};
        ctx.player.tech.lantern = true;
        ctx.toast("提灯做好了。T 优先于火把。");
      },
    },
    {
      id: "axe_tool",
      tab: "tools",
      name: "斧头",
      desc: "树枝×1 + 燧石×1（DST axe）",
      cost: { twigs: 1, flint: 1 },
      craft(ctx) {
        if (ctx.repairTool) ctx.repairTool("axe");
        else ctx.toast("斧头备好。");
      },
    },
    {
      id: "pick_tool",
      tab: "tools",
      name: "镐子",
      desc: "树枝×2 + 燧石×2（DST pickaxe）",
      cost: { twigs: 2, flint: 2 },
      craft(ctx) {
        if (ctx.repairTool) ctx.repairTool("pickaxe");
        else ctx.toast("镐子备好。");
      },
    },
    {
      id: "shovel",
      tab: "tools",
      name: "铲子",
      desc: "SCIENCE_ONE · 挖坟/移植（DST shovel）",
      science: 1,
      cost: { twigs: 2, flint: 2 },
      craft(ctx) {
        ctx.inv.shovel = (ctx.inv.shovel || 0) + 1;
        ctx.toast("打好了铲子。靠近坟墓可挖。");
      },
    },
    {
      id: "hammer",
      tab: "tools",
      name: "锤子",
      desc: "树枝×3 + 燧石×3 + 草×6（DST hammer）",
      cost: { twigs: 3, flint: 3, grass: 6 },
      craft(ctx) {
        ctx.inv.hammer = (ctx.inv.hammer || 0) + 1;
        ctx.toast("锤子备好。可拆建筑/砸墙。");
      },
    },
    {
      id: "goldenaxe",
      tab: "tools",
      name: "黄金斧",
      desc: "SCIENCE_TWO · 树枝×4 + 金×2",
      science: 2,
      cost: { twigs: 4, gold: 2 },
      craft(ctx) {
        if (ctx.repairTool) ctx.repairTool("axe");
        ctx.toast("黄金斧：耐久回满。");
      },
    },
    {
      id: "goldenpickaxe",
      tab: "tools",
      name: "黄金镐",
      desc: "SCIENCE_TWO · 树枝×4 + 金×2",
      science: 2,
      cost: { twigs: 4, gold: 2 },
      craft(ctx) {
        if (ctx.repairTool) ctx.repairTool("pickaxe");
        ctx.toast("黄金镐：耐久回满。");
      },
    },
    {
      id: "bandage",
      tab: "survive",
      name: "草药包",
      desc: "应急回 35 生命",
      cost: { meat: 1 },
      craft(ctx) {
        ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + 35);
        ctx.toast("包扎了伤口。");
      },
    },
    {
      id: "trap",
      tab: "survive",
      name: "捕兽陷阱",
      desc: "树枝×2 + 草×6（DST trap）",
      cost: { twigs: 2, grass: 6 },
      craft(ctx) {
        ctx.placeAhead("trap");
        ctx.toast("布置了陷阱。");
      },
    },
    {
      id: "warmstone",
      tab: "survive",
      name: "暖石",
      desc: "SCIENCE_TWO · 燧石×10 + 金×1（近似 heatrock）",
      science: 2,
      cost: { flint: 10, gold: 1 },
      craft(ctx) {
        ctx.inv.warmstone = (ctx.inv.warmstone || 0) + 1;
        ctx.toast("打磨了一块暖石。");
      },
    },
    {
      id: "backpack",
      tab: "survive",
      name: "背包",
      desc: "SCIENCE_ONE · 草×4 + 树枝×4（DST backpack）",
      science: 1,
      cost: { grass: 4, twigs: 4 },
      craft(ctx) {
        ctx.player.backpack = true;
        if (window.DstSys) {
          window.DstSys.STACK.wood = 30;
          window.DstSys.STACK.berries = 50;
          window.DstSys.STACK.twigs = 50;
          window.DstSys.STACK.grass = 50;
        }
        ctx.toast("背上了背包（物品栏扩至 19 格）。");
      },
    },
    {
      id: "umbrella",
      tab: "survive",
      name: "草伞",
      desc: "树枝×4 + 草×3（DST grass_umbrella）",
      cost: { twigs: 4, grass: 3 },
      craft(ctx) {
        ctx.inv.umbrella = (ctx.inv.umbrella || 0) + 1;
        ctx.toast("编好了草伞（减湿）。");
      },
    },
    {
      id: "tent",
      tab: "survive",
      name: "帐篷",
      desc: "丝绸×6 + 树枝×4 + 草×3（DST tent）· 夜间歇息",
      science: 1,
      cost: { silk: 6, twigs: 4, grass: 3 },
      craft(ctx) {
        ctx.placeAhead("tent");
        ctx.toast("支起帐篷。夜里空格可睡到黎明。");
      },
    },
    {
      id: "siesta",
      tab: "survive",
      name: "遮阳棚",
      desc: "丝绸×2 + 树枝×4 + 草×4（DST siesta lean-to）· 白天歇息降温",
      science: 1,
      cost: { silk: 2, twigs: 4, grass: 4 },
      craft(ctx) {
        ctx.placeAhead("siesta");
        ctx.toast("搭起遮阳棚。白天空格可小憩降温。");
      },
    },
    {
      id: "heal_salve",
      tab: "survive",
      name: "治疗药膏",
      desc: "灰烬感 · 木炭×1 + 石砖×1 + 蜂蜜×1（近似 healing salve）",
      cost: { charcoal: 1, cutstone: 1, honey: 1 },
      craft(ctx) {
        ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + 20);
        ctx.player.buffWarm = Math.max(ctx.player.buffWarm || 0, 8);
        ctx.toast("涂上药膏，伤口收敛了。");
      },
    },
    {
      id: "honey_poultice",
      tab: "survive",
      name: "蜜敷料",
      desc: "蜂蜜×2 + 丝绸×1（DST honey poultice）· 大回复",
      science: 1,
      cost: { honey: 2, silk: 1 },
      craft(ctx) {
        ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + 50);
        ctx.toast("蜜敷料贴上，舒适多了。");
      },
    },
    {
      id: "sewing",
      tab: "survive",
      name: "针线包",
      desc: "蜘蛛丝×1 + 树枝×2 + 燧石×1（DST sewing kit）· 修复工具",
      science: 1,
      cost: { silk: 1, twigs: 2, flint: 1 },
      craft(ctx) {
        if (!ctx.repairTools) {
          ctx.toast("工具系统未就绪。");
          return false;
        }
        ctx.repairTools();
        ctx.toast("缝补完毕，斧镐耐久回满。");
      },
    },
    {
      id: "piggyback",
      tab: "survive",
      name: "猪皮背包",
      desc: "SCIENCE_TWO · 猪皮感：肉×4 + 绳索×4（DST piggyback）",
      science: 2,
      cost: { meat: 4, rope: 4 },
      craft(ctx) {
        ctx.player.piggyback = true;
        ctx.player.backpack = true;
        if (window.DstSys) {
          window.DstSys.STACK.wood = 40;
          window.DstSys.STACK.meat = 40;
          window.DstSys.STACK.berries = 60;
          window.DstSys.STACK.twigs = 60;
          window.DstSys.STACK.grass = 60;
          window.DstSys.STACK.flint = 60;
          window.DstSys.STACK.rocks = 60;
        }
        ctx.toast("背上了猪皮背包（21 格 · 堆叠更大）。");
      },
    },
    {
      id: "raincoat",
      tab: "survive",
      name: "雨衣",
      desc: "树枝×2 + 绳索×2 + 草×2（近似 raincoat）· 大幅减湿",
      science: 1,
      cost: { twigs: 2, rope: 2, grass: 2 },
      craft(ctx) {
        ctx.inv.raincoat = (ctx.inv.raincoat || 0) + 1;
        ctx.toast("披上雨衣（防雨更强）。");
      },
    },
    {
      id: "winterhat",
      tab: "survive",
      name: "冬帽",
      desc: "丝绸×4 + 草×4（近似 winterhat）· 抗寒",
      science: 1,
      cost: { silk: 4, grass: 4 },
      craft(ctx) {
        ctx.inv.winterhat = (ctx.inv.winterhat || 0) + 1;
        ctx.toast("织好了冬帽（减寒冷流失）。");
      },
    },
    {
      id: "beehat",
      tab: "survive",
      name: "养蜂帽",
      desc: "丝绸×4 + 绳索×1 · 刺蜂减伤",
      science: 1,
      cost: { silk: 4, rope: 1 },
      craft(ctx) {
        ctx.inv.beehat = (ctx.inv.beehat || 0) + 1;
        ctx.toast("戴上养蜂帽（刺蜂几乎不伤你）。");
      },
    },
    {
      id: "endofire",
      tab: "light",
      name: "吸热营火",
      desc: "木硝感 · 木板×2 + 金×2（DST endothermic fire）· 夏季降温",
      science: 1,
      cost: { boards: 2, gold: 2 },
      craft(ctx) {
        ctx.placeAhead("endofire");
        ctx.toast("点起吸热火。夏天待在旁边可降温。");
      },
    },
    {
      id: "willow_lighter",
      tab: "light",
      name: "打火机",
      desc: "薇洛专属 · 金×1（DST lighter）· 得火把×3",
      char: "willow",
      cost: { gold: 1 },
      craft(ctx) {
        if (ctx.player.charId !== "willow") {
          ctx.toast("只有薇洛会用打火机。");
          return false;
        }
        ctx.inv.torch = (ctx.inv.torch || 0) + 3;
        ctx.toast("打火机咔嗒——火把备好了。");
      },
    },
    {
      id: "abigail_flower",
      tab: "magic",
      name: "阿比盖尔之花",
      desc: "温蒂专属 · 花瓣浆果×4 + 噩梦燃料感（暗影）",
      char: "wendy",
      cost: { berries: 4, gold: 1 },
      craft(ctx) {
        if (ctx.player.charId !== "wendy") {
          ctx.toast("只有温蒂能唤醒这朵花。");
          return false;
        }
        ctx.summonAbigail();
      },
    },
    {
      id: "wx_charge",
      tab: "science",
      name: "电路超载",
      desc: "WX-78 专属 · 金×2 · 雷击回能、短时加速",
      char: "wx",
      cost: { gold: 2 },
      craft(ctx) {
        if (ctx.player.charId !== "wx") {
          ctx.toast("只有 WX-78 能接这条电路。");
          return false;
        }
        ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + 25);
        ctx.player.buffSpeed = Math.max(ctx.player.buffSpeed || 0, 18);
        ctx.player.corr = Math.max(0, (ctx.player.corr || 0) - 15);
        ctx.toast("电路超载：系统升温，理智回稳。");
      },
    },
    {
      id: "farm",
      tab: "farm",
      name: "浆果丛",
      desc: "身前栽下一丛可采灌木",
      cost: { wood: 2, berries: 2 },
      craft(ctx) {
        ctx.placeAhead("berrybush");
        ctx.toast("栽下浆果丛。");
      },
    },
    {
      id: "farmplot",
      tab: "farm",
      name: "农地",
      desc: "草×4 + 粪肥×1（或燧石×2）（DST farm plot）· 空格播种",
      science: 1,
      cost: { grass: 4, flint: 2 },
      craft(ctx) {
        ctx.placeAhead("farmplot");
        ctx.toast("犁好农地。靠近空格播种，成熟后再采。");
      },
    },
    {
      id: "seed",
      tab: "farm",
      name: "浆果苗",
      desc: "用浆果育苗",
      cost: { berries: 2 },
      craft(ctx) {
        ctx.inv.seeds = (ctx.inv.seeds || 0) + 1;
        ctx.toast("育出浆果苗。");
      },
    },
    {
      id: "carrot_seed",
      tab: "farm",
      name: "胡萝卜种",
      desc: "种子 + 粪肥 → 胡萝卜种",
      cost: { seeds: 1, dung: 1 },
      craft(ctx) {
        ctx.inv.carrot_seed = (ctx.inv.carrot_seed || 0) + 2;
        ctx.toast("育出胡萝卜种。农田可种。");
      },
    },
    {
      id: "cook",
      tab: "farm",
      name: "烤羊肉",
      desc: "营火旁把生肉烤熟",
      cost: { meat: 1 },
      nearFire: true,
      craft(ctx) {
        ctx.inv.cooked = (ctx.inv.cooked || 0) + 1;
        ctx.toast("烤好了一份羊肉。");
      },
    },
    {
      id: "jam",
      tab: "farm",
      name: "浆果酱",
      desc: "营火旁把浆果熬成酱",
      cost: { berries: 3 },
      nearFire: true,
      craft(ctx) {
        ctx.inv.jam = (ctx.inv.jam || 0) + 1;
        ctx.toast("熬好了一罐果酱。");
      },
    },
    {
      id: "cookpot",
      tab: "farm",
      name: "烹饪锅",
      desc: "SCIENCE_ONE · 石砖×3 + 木头×3 + 树枝×6（DST cookpot）",
      science: 1,
      cost: { cutstone: 3, wood: 3, twigs: 6 },
      craft(ctx) {
        ctx.placeAhead("cookpot");
        ctx.toast("架起了炖锅。");
      },
    },
    {
      id: "bench",
      tab: "science",
      name: "科学机器",
      desc: "金×1 + 木头×4 + 燧石×4（DST researchlab）",
      cost: { gold: 1, wood: 4, flint: 4 },
      craft(ctx) {
        ctx.placeAhead("bench");
        ctx.toast("支起了科学机器（靠近才能使用一级科技）。");
      },
    },
    {
      id: "alchemy",
      tab: "science",
      name: "炼金引擎",
      desc: "SCIENCE_ONE · 木板×4 + 石砖×2 + 金×6（近似 researchlab2）",
      science: 1,
      cost: { boards: 4, cutstone: 2, gold: 6 },
      craft(ctx) {
        ctx.placeAhead("alchemy");
        ctx.toast("炼金引擎轰鸣（靠近才能使用二级科技）。");
      },
    },
    {
      id: "icebox",
      tab: "science",
      name: "冰箱",
      desc: "SCIENCE_TWO · 金×2 + 石砖×1 + 木板×1（近似 icebox）",
      science: 2,
      cost: { gold: 2, cutstone: 1, boards: 1 },
      craft(ctx) {
        ctx.placeAhead("icebox");
        ctx.player.tech = ctx.player.tech || {};
        ctx.player.tech.icebox = true;
        ctx.toast("放下冰箱。");
      },
    },
    {
      id: "mapscroll",
      tab: "science",
      name: "舆图卷",
      desc: "揭开周围大片迷雾",
      cost: { gold: 4, berries: 1 },
      craft(ctx) {
        ctx.inv.mapscroll = (ctx.inv.mapscroll || 0) + 1;
        ctx.toast("绘好舆图卷。按 M 使用。");
      },
    },
    {
      id: "tech_stone",
      tab: "science",
      name: "研究：石墙工法",
      desc: "科学机器旁 · 解锁石墙（SCIENCE_TWO 墙）",
      science: 1,
      cost: { gold: 4, cutstone: 1 },
      craft(ctx) {
        if (!ctx.nearBench() && !ctx.nearAlchemy()) { ctx.toast("靠近科学机器研究。"); return false; }
        ctx.player.tech = ctx.player.tech || {};
        if (ctx.player.tech.stonewall) { ctx.toast("已掌握石墙工法。"); return false; }
        ctx.player.tech.stonewall = true;
        ctx.toast("图纸展开：可合成石墙。");
      },
    },
    {
      id: "armor",
      tab: "fight",
      name: "木甲",
      desc: "SCIENCE_ONE · 木头×8 + 绳索×2（DST armorwood）",
      science: 1,
      cost: { wood: 8, rope: 2 },
      craft(ctx) {
        if ((ctx.player.armor || 0) >= 3) {
          ctx.toast("木甲已叠满。");
          return false;
        }
        ctx.player.armor = (ctx.player.armor || 0) + 1;
        ctx.toast("穿上了木甲（" + ctx.player.armor + "/3）。");
      },
    },
    {
      id: "spear",
      tab: "fight",
      name: "长矛",
      desc: "SCIENCE_ONE · 树枝×2 + 绳索×1 + 燧石×1",
      science: 1,
      cost: { twigs: 2, rope: 1, flint: 1 },
      craft(ctx) {
        ctx.inv.spear = (ctx.inv.spear || 0) + 1;
        ctx.toast("削好了长矛（武装伤害+）。");
        ctx.player.warRank = Math.max(ctx.player.warRank || 0, 1);
      },
    },
    {
      id: "war_kit",
      tab: "fight",
      name: "成套武装",
      desc: "解锁战士形态 · Q 切换",
      cost: { wood: 10, gold: 8, meat: 2 },
      craft(ctx) {
        if (ctx.inv.warKit) {
          ctx.toast("你已拥有武装。按 Q 切换形态。");
          return false;
        }
        ctx.inv.warKit = 1;
        ctx.player.warRank = 1;
        ctx.setForm("warrior");
        ctx.toast("披上盔甲！Q 可在工匠与武装间切换。");
      },
    },
    {
      id: "war_kit_up",
      tab: "fight",
      name: "精炼武装",
      desc: "武装再提升一档",
      science: 2,
      cost: { boards: 4, gold: 12, cooked: 2 },
      craft(ctx) {
        if (!ctx.inv.warKit) {
          ctx.toast("先合成「成套武装」。");
          return false;
        }
        if ((ctx.player.warRank || 1) >= 2) {
          ctx.toast("武装已精炼至满。");
          return false;
        }
        ctx.inv.warKit = 2;
        ctx.player.warRank = 2;
        ctx.setForm("warrior");
        ctx.toast("锋刃更利，甲胄更厚。");
      },
    },
    {
      id: "fence",
      tab: "struct",
      name: "木栅栏",
      desc: "SCIENCE_ONE · 树枝×3 + 绳索×1（DST fence）",
      science: 1,
      cost: { twigs: 3, rope: 1 },
      craft(ctx) {
        ctx.placeAhead("fence");
        ctx.toast("立起了木栅栏。");
      },
    },
    {
      id: "haywall",
      tab: "struct",
      name: "草墙",
      desc: "SCIENCE_ONE · 草×4 + 树枝×2（DST wall_hay）",
      science: 1,
      cost: { grass: 4, twigs: 2 },
      craft(ctx) {
        ctx.placeAhead("haywall");
        ctx.toast("编起了草墙（脆弱）。");
      },
    },
    {
      id: "woodwall",
      tab: "struct",
      name: "木墙",
      desc: "SCIENCE_ONE · 木板×2 + 绳索×1",
      science: 1,
      cost: { boards: 2, rope: 1 },
      craft(ctx) {
        ctx.placeAhead("woodwall");
        ctx.toast("立起了木墙。");
      },
    },
    {
      id: "stonewall",
      tab: "struct",
      name: "石墙",
      desc: "SCIENCE_TWO · 石砖×2（DST wall_stone）",
      science: 2,
      cost: { cutstone: 2 },
      craft(ctx) {
        ctx.placeAhead("stonewall");
        ctx.player.tech = ctx.player.tech || {};
        ctx.player.tech.stonewall = true;
        ctx.toast("砌起了石墙。");
      },
    },
    {
      id: "turf",
      tab: "struct",
      name: "石砖路",
      desc: "石砖×1（近似 cobblestones）· 身前铺一格路",
      science: 1,
      cost: { cutstone: 1 },
      craft(ctx) {
        ctx.placeAhead("turf");
        ctx.toast("铺好了石砖路。");
      },
    },
    {
      id: "chest",
      tab: "struct",
      name: "木箱",
      desc: "SCIENCE_ONE · 木板×3（DST treasurechest）",
      science: 1,
      cost: { boards: 3 },
      craft(ctx) {
        ctx.placeAhead("chest");
        ctx.toast("放下一只木箱。");
      },
    },
    {
      id: "lightning_rod",
      tab: "struct",
      name: "避雷针",
      desc: "SCIENCE_ONE · 金×3 + 石砖×1（DST lightning_rod）",
      science: 1,
      cost: { gold: 3, cutstone: 1 },
      craft(ctx) {
        ctx.placeAhead("lightning_rod");
        ctx.toast("立起避雷针。附近可挡雷击。");
      },
    },
    {
      id: "watchtower",
      tab: "struct",
      name: "哨塔",
      desc: "自动射击靠近的敌人",
      science: 1,
      cost: { boards: 4, gold: 4, rope: 2 },
      craft(ctx) {
        ctx.placeAhead("watchtower");
        ctx.toast("建起了哨塔。");
      },
    },
    {
      id: "boards",
      tab: "refine",
      name: "木板",
      desc: "SCIENCE_ONE · 木头×4（DST boards）",
      science: 1,
      cost: { wood: 4 },
      craft(ctx) {
        ctx.inv.boards = (ctx.inv.boards || 0) + 1;
        ctx.toast("锯出木板。");
      },
    },
    {
      id: "rope",
      tab: "refine",
      name: "绳索",
      desc: "SCIENCE_ONE · 草×3（DST rope）",
      science: 1,
      cost: { grass: 3 },
      craft(ctx) {
        ctx.inv.rope = (ctx.inv.rope || 0) + 1;
        ctx.toast("搓好绳索。");
      },
    },
    {
      id: "cutstone",
      tab: "refine",
      name: "石砖",
      desc: "SCIENCE_ONE · 石头×3（DST cutstone）",
      science: 1,
      cost: { rocks: 3 },
      craft(ctx) {
        ctx.inv.cutstone = (ctx.inv.cutstone || 0) + 1;
        ctx.toast("凿出石砖。");
      },
    },
    {
      id: "shadow_manip",
      tab: "magic",
      name: "暗影操控器",
      desc: "MAGIC_TWO · 石砖×2 + 金×8 + 木板×2（近似 researchlab3 门）",
      science: 2,
      cost: { cutstone: 2, gold: 8, boards: 2 },
      craft(ctx) {
        ctx.placeAhead("shadow");
        ctx.player.tech = ctx.player.tech || {};
        ctx.player.tech.shadow = true; // researched: spells cost less sanity
        ctx.toast("暗影低语……靠近操控器可做魔法制品，施法理智损耗减半。");
      },
    },
    // —— Farm / science extras ——
    {
      id: "charcoal",
      tab: "refine",
      name: "木炭",
      desc: "营火旁 · 木头×2 → 木炭（DST charcoal）",
      nearFire: true,
      cost: { wood: 2 },
      craft(ctx) {
        ctx.inv.charcoal = (ctx.inv.charcoal || 0) + 1;
        ctx.toast("烧出木炭。");
      },
    },
    {
      id: "meatrack",
      tab: "farm",
      name: "晒肉架",
      desc: "SCIENCE_ONE · 树枝×3 + 木炭×2 + 绳索×3（DST meatrack）",
      science: 1,
      cost: { twigs: 3, charcoal: 2, rope: 3 },
      craft(ctx) {
        ctx.placeAhead("meatrack");
        ctx.toast("立起晒肉架。空格挂肉，晒干得肉干。");
      },
    },
    // —— Seafaring (DST RECIPETABS.SEAFARING) ——
    {
      id: "seakit",
      tab: "sea",
      name: "思考之海",
      desc: "SCIENCE_ONE · 木板×4（DST seafaring_prototyper）",
      science: 1,
      cost: { boards: 4 },
      craft(ctx) {
        ctx.placeAhead("seakit");
        ctx.player.tech = ctx.player.tech || {};
        ctx.player.tech.seafaring = true;
        ctx.toast("航海工坊就位。可造舟桨。");
      },
    },
    {
      id: "dock",
      tab: "sea",
      name: "码头",
      desc: "需思考之海 · 木板×3 + 绳索×2 · 靠岸铺设",
      cost: { boards: 3, rope: 2 },
      craft(ctx) {
        if (!(ctx.player.tech && ctx.player.tech.seafaring) && !(ctx.nearSeaKit && ctx.nearSeaKit())) {
          ctx.toast("先建造并靠近「思考之海」。");
          return false;
        }
        ctx.placeAhead("dock");
        ctx.toast("铺好了码头。船靠近码头启航更稳。");
      },
    },
    {
      id: "boat",
      tab: "sea",
      name: "船套件",
      desc: "需思考之海 · 木板×4（DST boat_item）",
      cost: { boards: 4 },
      craft(ctx) {
        if (!(ctx.player.tech && ctx.player.tech.seafaring) && !(ctx.nearSeaKit && ctx.nearSeaKit())) {
          ctx.toast("先建造并靠近「思考之海」。");
          return false;
        }
        ctx.placeAhead("boatkit");
        ctx.toast("放下船套件。在岸边空格启航。");
      },
    },
    {
      id: "oar",
      tab: "sea",
      name: "桨",
      desc: "木头×1（DST oar）· 加快渡海",
      cost: { wood: 1 },
      craft(ctx) {
        ctx.inv.oar = (ctx.inv.oar || 0) + 1;
        ctx.toast("削好了桨。");
      },
    },
    {
      id: "grass_boat",
      tab: "sea",
      name: "草筏",
      desc: "草×8 + 树枝×2（DST boat_grass）· 无需航海台",
      cost: { grass: 8, twigs: 2 },
      craft(ctx) {
        ctx.placeAhead("boatkit");
        ctx.toast("编好草筏。岸边空格可启航。");
      },
    },
    {
      id: "mast",
      tab: "sea",
      name: "桅杆套件",
      desc: "需思考之海 · 木板×3 + 绳索×3（DST mast）",
      cost: { boards: 3, rope: 3 },
      craft(ctx) {
        if (!(ctx.player.tech && ctx.player.tech.seafaring) && !(ctx.nearSeaKit && ctx.nearSeaKit())) {
          ctx.toast("先建造并靠近「思考之海」。");
          return false;
        }
        ctx.inv.mast = (ctx.inv.mast || 0) + 1;
        ctx.toast("装上桅杆：渡海时理智更稳。");
      },
    },
    {
      id: "anchor",
      tab: "sea",
      name: "船锚",
      desc: "需思考之海 · 石砖×2 + 绳索×2",
      cost: { cutstone: 2, rope: 2 },
      craft(ctx) {
        if (!(ctx.player.tech && ctx.player.tech.seafaring) && !(ctx.nearSeaKit && ctx.nearSeaKit())) {
          ctx.toast("先建造并靠近「思考之海」。");
          return false;
        }
        ctx.inv.anchor = (ctx.inv.anchor || 0) + 1;
        ctx.toast("打好船锚：靠岸时可能捞到鱼。");
      },
    },
  ];

  const COOK_RECIPES = [
    {
      id: "roast",
      name: "烤肉",
      desc: "生肉 → 烤熟",
      cost: { meat: 1 },
      craft(ctx) {
        ctx.inv.cooked = (ctx.inv.cooked || 0) + 1;
        ctx.toast("炖锅：烤肉好了。");
      },
    },
    {
      id: "grill_fish",
      name: "烤鱼",
      desc: "鱼 → 烤熟",
      cost: { fish: 1 },
      craft(ctx) {
        ctx.inv.cooked = (ctx.inv.cooked || 0) + 1;
        ctx.toast("炖锅：烤鱼好了。");
      },
    },
    {
      id: "jam_pot",
      name: "果酱",
      desc: "2 浆果 → 果酱",
      cost: { berries: 2 },
      craft(ctx) {
        ctx.inv.jam = (ctx.inv.jam || 0) + 1;
        ctx.toast("炖锅：果酱咕嘟好了。");
      },
    },
    {
      id: "meatpie",
      name: "肉馅饼",
      desc: "肉+浆果 → 高饱食",
      cost: { meat: 1, berries: 2 },
      craft(ctx) {
        ctx.inv.meatpie = (ctx.inv.meatpie || 0) + 1;
        ctx.toast("炖锅：肉馅饼出炉。");
      },
    },
    {
      id: "spicy",
      name: "辛香炖",
      desc: "肉+金 → 短时保温",
      cost: { meat: 1, gold: 1 },
      craft(ctx) {
        ctx.inv.spicy = (ctx.inv.spicy || 0) + 1;
        ctx.toast("炖锅：辛香炖好了。吃下可暖身。");
      },
    },
    {
      id: "trail",
      name: "行路果脯",
      desc: "3 浆果 → 短时加速",
      cost: { berries: 3 },
      craft(ctx) {
        ctx.inv.trail = (ctx.inv.trail || 0) + 1;
        ctx.toast("炖锅：果脯晾好了。吃下可加速。");
      },
    },
    {
      id: "feast",
      name: "据点大餐",
      desc: "烤肉+果酱 → 全面恢复",
      cost: { cooked: 1, jam: 1 },
      craft(ctx) {
        ctx.inv.feast = (ctx.inv.feast || 0) + 1;
        ctx.toast("炖锅：大餐备好。");
      },
    },
    {
      id: "winter_stew",
      name: "暖冬炖",
      desc: "【冬】鱼+肉 → 强保温",
      season: "winter",
      cost: { fish: 1, meat: 1 },
      craft(ctx) {
        ctx.inv.spicy = (ctx.inv.spicy || 0) + 1;
        ctx.player.buffWarm = Math.max(ctx.player.buffWarm || 0, 55);
        ctx.toast("炖锅：暖冬炖好了，身子立刻热起来。");
      },
    },
    {
      id: "spring_salad",
      name: "春日沙拉",
      desc: "【春】浆果+苗 → 回魔加速",
      season: "spring",
      cost: { berries: 2, seeds: 1 },
      craft(ctx) {
        ctx.inv.trail = (ctx.inv.trail || 0) + 1;
        ctx.toast("炖锅：春日沙拉备好（食用同果脯加速）。");
      },
    },
    {
      id: "summer_cool",
      name: "夏日冰饮",
      desc: "【夏】浆果+鱼 → 降温抗暑",
      season: "summer",
      cost: { berries: 2, fish: 1 },
      craft(ctx) {
        ctx.inv.jam = (ctx.inv.jam || 0) + 1;
        ctx.player.temp = Math.max(20, (ctx.player.temp || 50) - 18);
        ctx.player.buffCool = Math.max(ctx.player.buffCool || 0, 50);
        ctx.inv._cookBoost = ctx.inv._cookBoost || {};
        const prev = ctx.inv._cookBoost.jam || { n: 0 };
        ctx.inv._cookBoost.jam = { n: (prev.n || 0) + 1, hunger: 40, hp: 15, sanity: 12, cool: 40, name: "夏日冰饮" };
        ctx.toast("炖锅：冰饮备好（食用降温护理智）。");
      },
    },
    {
      id: "autumn_roast",
      name: "秋狩烤盘",
      desc: "【秋】肉+果 → 高饱食",
      season: "autumn",
      cost: { meat: 1, berries: 1 },
      craft(ctx) {
        ctx.inv.meatpie = (ctx.inv.meatpie || 0) + 1;
        ctx.toast("炖锅：秋狩烤盘好了。");
      },
    },
    {
      id: "honey_loaf",
      name: "蜜糖面包",
      desc: "蜂蜜+浆果 → 全面小恢复",
      cost: { honey: 1, berries: 2 },
      craft(ctx) {
        ctx.inv.feast = (ctx.inv.feast || 0) + 1;
        ctx.toast("炖锅：蜜糖面包飘香。");
      },
    },
  ];

  const CRAFT_TABS = [
    { id: "tools", name: "工具" },
    { id: "light", name: "照明" },
    { id: "survive", name: "生存" },
    { id: "farm", name: "食物" },
    { id: "science", name: "科学" },
    { id: "fight", name: "战斗" },
    { id: "struct", name: "建筑" },
    { id: "sea", name: "航海" },
    { id: "refine", name: "精炼" },
    { id: "magic", name: "魔法" },
  ];

  global.EnemyPack = { ENEMIES, RECIPES, COOK_RECIPES, CRAFT_TABS, EP };
})(window);
