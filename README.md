# KC KEEP · KC据点

HTML5 Canvas 俯视生存建造原型。守住营火，活过第一夜，探索开放大陆。

## 在线游玩

直接打开：**[https://cheungkorbinian.github.io/kc-keep/](https://cheungkorbinian.github.io/kc-keep/)**

（GitHub Pages 可玩构建；`main` 仍只含代码。）

> 本仓库 **`main` 只包含游戏代码**。Tiny Swords 等美术资源不会随 `main` 分发；本地开发需自行放置（见下方）。

## 本地运行

1. 准备美术资源（与 `game/` 同级），目录名需匹配：
   - `Buildings/` · `Units/` · `Terrain/` · `UI Elements/` · `Particle FX/`
   - `Tiny Swords (Enemy Pack)/` · `Tiny Swords (Update 010)/`
2. 在仓库根目录启动静态服务：

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

3. 打开 [http://127.0.0.1:8765/game/](http://127.0.0.1:8765/game/)

也可使用 `game/play.sh`。

## 操作（摘要）

| 按键 | 作用 |
| --- | --- |
| 左键 | 行走 |
| WASD | 移动 |
| 空格 | 行动 / 添柴 |
| Tab | 合成 |
| Q | 工匠 ↔ 武装 |
| Esc | 暂停 |

更多说明见 `game/README.md`。

## 技术

- 纯前端：Canvas 2D + 原生 JS
- 无需构建步骤

## 许可与第三方

游戏代码见 [LICENSE](LICENSE)。

美术资源版权归属原作者，**不包含在 `main` 中**。使用与署名要求见 [THIRD_PARTY.md](THIRD_PARTY.md)。

## 最新本地更新

v90.1 加入消防工具、第一夜引导、据点进阶、世界变化存档和设置/备份面板。操作与验证方法见 [本地说明](game/README.md)。部署前线上版本保持原样。
