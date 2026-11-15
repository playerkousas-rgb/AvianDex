#!/usr/bin/env bash
# Rebuild the local (never committed) toolchain for info-card rendering.
#
# The sandbox only persists files inside the repository, so the venv, the CJK
# fonts and the Natural Earth base map have to be recreated after a reset:
#   bash scripts/cards/setup-info-card-env.sh [NNNN ...]
# The optional IDs only control which cards/art/info-restart-NNNN/countries.geojson
# files are (re)written; with no IDs the geojson is only cached in /tmp.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VENV=/home/user/card-venv
FONTS="$HOME/.fonts"
SRC="$HOME/.cache/card-env-src"

if [ ! -x "$VENV/bin/python" ]; then
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install -q --upgrade pip
  "$VENV/bin/pip" install -q pillow numpy fonttools
fi
"$VENV/bin/python" -c "from PIL import features; assert features.check('avif'), 'Pillow lacks AVIF support'"

mkdir -p "$FONTS" "$SRC"
if [ ! -f "$FONTS/NotoSansTC_700Bold.ttf" ]; then
  [ -d "$SRC/gfonts" ] || git clone -q --filter=blob:none --depth 1 --sparse \
    https://github.com/google/fonts "$SRC/gfonts"
  git -C "$SRC/gfonts" sparse-checkout set ofl/notosanstc
  "$VENV/bin/python" - <<'PY'
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
import os
src = os.path.expanduser('~/.cache/card-env-src/gfonts/ofl/notosanstc/NotoSansTC[wght].ttf')
out = os.path.expanduser('~/.fonts')
for weight, name in ((400, 'NotoSansTC_400Regular.ttf'), (700, 'NotoSansTC_700Bold.ttf')):
    font = instantiateVariableFont(TTFont(src), {'wght': weight}, updateFontNames=True)
    font.save(os.path.join(out, name))
    print('wrote', name)
PY
fi

if [ ! -f "$SRC/ne_110m_admin_0_countries.geojson" ]; then
  [ -d "$SRC/nev" ] || git clone -q --filter=blob:none --depth 1 --sparse \
    https://github.com/nvkelso/natural-earth-vector "$SRC/nev"
  git -C "$SRC/nev" sparse-checkout set --no-cone /geojson/ne_110m_admin_0_countries.geojson
  cp "$SRC/nev/geojson/ne_110m_admin_0_countries.geojson" "$SRC/ne_110m_admin_0_countries.geojson"
fi
echo "base map: $(md5sum "$SRC/ne_110m_admin_0_countries.geojson" | cut -d' ' -f1) $(stat -c%s "$SRC/ne_110m_admin_0_countries.geojson") bytes"

for id in "$@"; do
  art="$ROOT/cards/art/info-restart-$(printf '%04d' "$((10#$id))")"
  mkdir -p "$art"
  cp "$SRC/ne_110m_admin_0_countries.geojson" "$art/countries.geojson" 2>/dev/null || true
  echo "geojson -> ${art#$ROOT/}/countries.geojson"
done
