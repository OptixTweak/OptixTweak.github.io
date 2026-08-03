#!/usr/bin/env bash
# tools/generate-webp.sh
# Generate responsive WebP images from source PNG/JPEG (or from SVG via rasterization).
# Requirements: cwebp (libwebp), imagemagick (for SVG rasterize) or rsvg-convert.

set -euo pipefail

SRC_DIR="assets/images/src"
OUT_DIR="assets/images"
SIZES=(480 768 1200)
QUALITY=75

mkdir -p "$OUT_DIR"

for src in "$SRC_DIR"/*; do
  filename=$(basename -- "$src")
  name="${filename%.*}"
  ext="${filename##*.}"
  echo "Processing $src -> $name"

  # If SVG, rasterize to PNG first
  if [[ "$ext" == "svg" ]]; then
    tmppng="/tmp/${name}.png"
    echo "Rasterizing SVG to PNG: $src -> $tmppng"
    # Use rsvg-convert if available, otherwise imagemagick
    if command -v rsvg-convert >/dev/null 2>&1; then
      rsvg-convert -w 2000 -h 2000 "$src" -o "$tmppng"
    else
      convert "$src" -background none -resize 2000x2000 "$tmppng"
    fi
    SRC_FOR_WEBP="$tmppng"
  else
    SRC_FOR_WEBP="$src"
  fi

  for s in "${SIZES[@]}"; do
    out="$OUT_DIR/${name}-${s}.webp"
    echo "Generating $out (width=$s)"
    # Use cwebp with resize via imagemagick if necessary
    if [[ "$ext" == "svg" ]]; then
      # resize from rasterized png
      convert "$SRC_FOR_WEBP" -resize ${s}x "$OUT_DIR/${name}-${s}.png"
      cwebp -q $QUALITY "$OUT_DIR/${name}-${s}.png" -o "$out"
      rm "$OUT_DIR/${name}-${s}.png"
    else
      # For PNG/JPEG source, use imagemagick to resize then cwebp
      convert "$SRC_FOR_WEBP" -resize ${s}x "$OUT_DIR/${name}-${s}.png"
      cwebp -q $QUALITY "$OUT_DIR/${name}-${s}.png" -o "$out"
      rm "$OUT_DIR/${name}-${s}.png"
    fi
  done

  # clean tmp if used
  if [[ -n "${tmppng:-}" && -f "$tmppng" ]]; then rm "$tmppng"; fi
done

echo "Done. Generated webp images in $OUT_DIR"
