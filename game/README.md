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
