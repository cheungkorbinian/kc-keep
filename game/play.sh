#!/bin/bash
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT=8765
cd "$ROOT"

if lsof -tiTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "释放端口 $PORT …"
  lsof -tiTCP:"$PORT" -sTCP:LISTEN | xargs kill -9 2>/dev/null
  sleep 0.4
fi

URL="http://127.0.0.1:${PORT}/game/"
echo ""
echo "  游戏地址: $URL"
echo "  工作目录: $ROOT"
echo "  （必须用 http，不要双击 HTML）"
echo ""

# open browser after server is up
(
  for i in 1 2 3 4 5 6 7 8 9 10; do
    if curl -sf -o /dev/null "$URL"; then
      open "$URL"
      exit 0
    fi
    sleep 0.2
  done
) &

exec python3 -m http.server "$PORT" --bind 127.0.0.1
