# KC KEEP · 本地说明

基于 Tiny Swords 素材的 **2D 俯视生存 RPG** 可玩原型。

美术资源不随 GitHub 仓库分发，请放在 `game/` 的上一级目录。详见仓库根目录 `README.md` 与 `THIRD_PARTY.md`。

## 怎么运行

```bash
# 在含 Buildings/ Units/ … 与 game/ 的根目录
python3 -m http.server 8765 --bind 127.0.0.1
```

打开 [http://127.0.0.1:8765/game/](http://127.0.0.1:8765/game/)

## 操作

| 按键 | 作用 |
| --- | --- |
| WASD | 移动 |
| Shift | 冲刺 |
| 鼠标左键 / J | 行动 |
| 鼠标右键 / K | 施放当前符文 |
| 1 / 2 / 3 | 火 / 冰 / 雷 |
| E | 交互（添柴 / 开箱 / 祈祷 / 休息） |
| F | 进食 |
| X | 拆除 |
| Q | 工匠 ↔ 武装 |
| Tab | 合成台 |
| T | 火把 |
| Esc | 暂停 |

详见根目录 `README.md`。

## v89 stability update

- Saves retain character identity/traits, tool durability, constructible props, owned buildings, crops, and firepit types.
- Returning to the main menu saves first; a storage failure keeps the current run open.
- Harvesting respects the selected resource and required tool. Full campfires no longer consume fuel items.
- Legacy v1 saves remain loadable, but missing character identity defaults to KC1. Data never recorded by older saves cannot be recovered.
- World generation still recreates wild trees, rocks, and enemies on load; this update does not provide a complete world snapshot.

Regression checks: `node scripts/test-stability.cjs` from the repository root.
