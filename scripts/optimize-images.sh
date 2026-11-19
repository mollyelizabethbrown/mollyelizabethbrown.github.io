#!/usr/bin/env bash
# Pre-size local images for static hosting (GitHub Pages has no image optimizer).
# Resizes to at most 2000 px wide, re-encodes as progressive-quality JPEG in sRGB, and
# prints the new dimensions so content/data/media.json can be updated.
#   bash scripts/optimize-images.sh public/images/earth/*.jpg public/images/books/*.jpg
set -euo pipefail
for f in "$@"; do
  tmp="${f%.*}.tmp.jpg"
  ffmpeg -loglevel error -y -i "$f" -vf "scale='min(2000,iw)':-2:flags=lanczos,format=yuvj420p" -q:v 4 "$tmp"
  mv "$tmp" "$f"
  dims=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$f")
  printf '%s\t%s\t%s bytes\n' "$f" "$dims" "$(wc -c < "$f" | tr -d ' ')"
done
