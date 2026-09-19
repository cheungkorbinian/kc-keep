#!/bin/bash
# Build a playable zip for itch.io (includes local art). Does not commit art to git.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/dist"
NAME="kc-keep-itch"
STAGE="$OUT/$NAME"
rm -rf "$STAGE"
mkdir -p "$STAGE"

# Code + custom UI images
rsync -a --exclude '_fence_preview.png' --exclude 'stack_*.png' "$ROOT/game" "$STAGE/"
cp "$ROOT/index.html" "$STAGE/index.html"
cp "$ROOT/LICENSE" "$STAGE/LICENSE" 2>/dev/null || true
cp "$ROOT/THIRD_PARTY.md" "$STAGE/THIRD_PARTY.md" 2>/dev/null || true

# Art packs (required to play)
for d in Buildings Units Terrain "UI Elements" "Particle FX" "Tiny Swords (Enemy Pack)" "Tiny Swords (Update 010)"; do
  if [[ -d "$ROOT/$d" ]]; then
    rsync -a "$ROOT/$d" "$STAGE/"
  else
    echo "warn: missing art folder: $d" >&2
  fi
done

mkdir -p "$OUT"
ZIP="$OUT/${NAME}.zip"
rm -f "$ZIP"
( cd "$OUT" && zip -qr "${NAME}.zip" "$NAME" )
echo "Wrote $ZIP"
du -sh "$ZIP"
