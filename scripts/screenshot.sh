#!/usr/bin/env bash
# Visual QA helper: screenshot pages of a running site with headless Edge/Chrome.
#   scripts/screenshot.sh <out-dir> <base-url> <path> <width,height> <name> [<path> <w,h> <name> ...]
# Tall window heights give full-page captures (hero height is capped, so layouts stay realistic).
set -euo pipefail
OUT="$1"; BASE="$2"; shift 2
BROWSER="${BROWSER_BIN:-/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe}"
mkdir -p "$OUT"
while [ "$#" -ge 3 ]; do
  "$BROWSER" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$OUT/.profile" \
    --window-size="$2" --virtual-time-budget=5000 --screenshot="$OUT/$3.png" "$BASE$1" >/dev/null 2>&1 || true
  echo "$OUT/$3.png"
  shift 3
done
