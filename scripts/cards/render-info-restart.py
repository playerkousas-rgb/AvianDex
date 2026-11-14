#!/usr/bin/env python3
"""Render one restarted info card from an explicit reviewed species spec.

Usage: python3 scripts/cards/render-info-restart.py 0002
Input: scripts/cards/info-restart-NNNN.json and ignored cards/art/info-restart-NNNN/.
Reuse the approved compositor unchanged. Output and generated assets stay outside Git.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('id', help='bird ID with an explicit info-restart-NNNN.json spec')
args = parser.parse_args()
if not args.id.isascii() or not args.id.isdigit() or len(args.id) > 4:
    parser.error('id must be 1–4 ASCII digits')
ID = args.id.zfill(4)
ART = ROOT / f'cards/art/info-restart-{ID}'
OUT = ROOT / f'deliver/cards/info-restart-{ID}'
SPEC = json.loads((ROOT / f'scripts/cards/info-restart-{ID}.json').read_text())
assert SPEC['id'] == ID and SPEC['layout'] == 'slim' and SPEC['size'] == [1024,1536]
assert len(SPEC['featureCrops']) == 4 and len(SPEC['similarSpecies']) == 2
loader = importlib.util.spec_from_file_location('composer', ROOT / 'scripts/cards/compose-card.py')
composer = importlib.util.module_from_spec(loader)
loader.loader.exec_module(composer)
# Keep the approved layout, but label each species-specific crop correctly.
labels = SPEC.get('featureLabels')
if labels:
    assert len(labels) == 4 and all(isinstance(label, str) and label for label in labels)
    composer.ZOOM_LABELS = labels


def range_map():
    """Explicitly labelled country overview, never presented as a precise species polygon."""
    width, height = 976, 596
    image = Image.new('RGB', (width, height), '#d9e9ed')
    draw = ImageDraw.Draw(image)
    # New production specs explicitly select a full-world viewport. Country
    # highlighting remains a qualified overview, not an occurrence polygon.
    bounds = SPEC['rangeMap']['bounds']
    if SPEC['rangeMap'].get('viewport') == 'world':
        assert bounds == [-180, -90, 180, 90], 'World maps must not use regional bounds'
    west, south, east, north = bounds
    assert -180 <= west < east <= 180 and -90 <= south < north <= 90
    plot_bottom = height - 110
    def project(pt):
        lon, lat = pt[:2]
        return ((lon-west)/(east-west)*width, (north-lat)/(north-south)*plot_bottom)
    countries = json.loads((ART / 'countries.geojson').read_text())['features']
    selected = set(SPEC['rangeMap']['countryIso3'])
    for feature in countries:
        prop = feature['properties']
        iso = prop.get('ADM0_A3')
        geom = feature['geometry']
        polygons = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
        for polygon in polygons:
            draw.polygon([project(p) for p in polygon[0]], fill='#7da688' if iso in selected else '#e6e4d9', outline='#9baca7', width=2)
    # Optional explicitly sourced point locations preserve small islands that
    # are absent from the low-resolution country geometry. They are not a
    # substitute for occurrence polygons or an indication of marine range.
    for marker in SPEC['rangeMap'].get('pointMarkers', []):
        lon, lat = marker['lon'], marker['lat']
        assert west <= lon <= east and south <= lat <= north
        assert marker.get('label') and marker.get('source')
        x, y = project((lon, lat))
        draw.ellipse((x-8, y-8, x+8, y+8), fill='#b6372d', outline='#fff8e8', width=2)
    draw.rectangle((0, plot_bottom, width, height), fill='#173446')
    ff = lambda size: ImageFont.truetype(str(Path(composer.FONT_DIR) / 'NotoSansTC_400Regular.ttf'), size)
    draw.text((22, plot_bottom+10), SPEC['rangeMap']['caption'], font=ff(34), fill='#f4eede')
    draw.text((22, plot_bottom+59), SPEC['rangeMap']['disclaimer'], font=ff(28), fill='#c9d5d4')
    return image


def render():
    OUT.mkdir(parents=True, exist_ok=True)
    # Read authoritative runtime data directly, avoiding stale exporter caches.
    birds = json.loads((ROOT / 'src/data/birds.json').read_text())
    bird = next(b for b in birds if b['id'] == SPEC['id'])
    tax = json.loads((ROOT / 'src/data/birdTaxonomy.json').read_text())[SPEC['id']]
    # Some species have no score record at all: all axes/overall remain 待查.
    scores = json.loads((ROOT / 'src/data/dexScores.json').read_text())['scores'].get(SPEC['id'], {})
    # An explicitly reviewed bad input may invalidate a derived runtime score.
    # Never silently change its value: hide only the named affected fields and
    # document the reason in the spec. Runtime data remains untouched.
    withheld = SPEC.get('withheldScores', {})
    assert isinstance(withheld, dict) and all(k in ('i', 'a', 'r', 'c', 'v', 'o') and isinstance(v, str) and v.strip() for k, v in withheld.items())
    assert bird['name'] == SPEC['name'] and tax['sciName'] == SPEC['scientificName']
    genus, epithet = tax['sciName'].split(' ', 1)
    f = {'id': SPEC['id'], 'z': bird['name'], 'e': tax['comName'], 's': tax['sciName'],
         'order': [tax['orderZh'], tax['order']], 'family': [tax['familyZh'], tax['family']],
         'genus': genus, 'epithet': epithet, 'iucn': SPEC['iucn'],
         'sim': [s['zh'] for s in SPEC['similarSpecies']],
         'score': {k: f'{scores[k]:.1f}' if scores.get(k) is not None and k not in withheld else ''
                   for k in ['i', 'a', 'r', 'c', 'v', 'o']}}
    # A deterministic working canvas holds separate assets at the exact existing slot coordinates.
    canvas = composer.compose_slim(f, None, 1)
    with Image.open(ART/'pixel.png') as image:
        pixel = image.convert('RGB')
        side = max(pixel.size)
        # Models may return portrait assets despite a square prompt: preserve the whole bird.
        pixel = ImageOps.pad(pixel, (side, side), color=pixel.getpixel((0, 0)), method=Image.Resampling.LANCZOS)
    pictures = {'pixel': pixel, 'map': range_map()}
    feature_sources = SPEC.get('featureSources', ['features.png'] * 4)
    assert len(feature_sources) == 4
    for i, (crop, source) in enumerate(zip(SPEC['featureCrops'], feature_sources)):
        assert len(crop) == 4 and 0 <= crop[0] < crop[2] <= 1 and 0 <= crop[1] < crop[3] <= 1
        # A separately identified female/juvenile source may occupy one feature circle.
        with Image.open(ART/source) as image:
            pictures[f'zoom{i}'] = image.crop(tuple(round(v*(image.width if j%2 == 0 else image.height)) for j,v in enumerate(crop))).convert('RGB')
    for i, species in enumerate(SPEC['similarSpecies']):
        portrait = Image.open(ART/species['asset']).convert('RGB')
        if species.get('framing') == 'whole-bird':
            # Inset whole birds so the final circular mask cannot clip head/tail/wingtips.
            backdrop = Image.new('RGB', portrait.size, portrait.getpixel((0, 0)))
            inset = ImageOps.contain(portrait, tuple(round(v * 0.78) for v in portrait.size), method=Image.Resampling.LANCZOS)
            backdrop.paste(inset, ((portrait.width-inset.width)//2, (portrait.height-inset.height)//2))
            portrait = backdrop
        pictures[f'sim{i}'] = portrait
    for name, kind, geo, _ in composer.slim_slots(f):
        if kind == 'rect':
            x0,y0,x1,y1 = map(round, geo)
        else:
            cx,cy,r = geo
            x0,y0,x1,y1 = map(round, (cx-r,cy-r,cx+r,cy+r))
        picture = ImageOps.fit(pictures[name], (x1-x0,y1-y0), method=Image.Resampling.LANCZOS)
        canvas.paste(picture, (x0,y0))
    result = composer.compose_slim(f, canvas, 1)
    # Explain the existing app score rather than implying an academic/scientific rating.
    draw = ImageDraw.Draw(result)
    font = ImageFont.truetype(str(Path(composer.FONT_DIR)/'NotoSansTC_400Regular.ttf'), 17)
    missing_scores = [k for k, value in f['score'].items() if not value]
    caption = '應用程式趣味指標・非學術評分'
    if missing_scores:
        caption += '；待查非零分'
    draw.text((64,1132), caption, font=font, fill='#d1c7a9')
    if not f['score']['o']:
        pending_font = ImageFont.truetype(str(Path(composer.FONT_DIR)/'NotoSansTC_400Regular.ttf'), 23)
        draw.text((84,1040), '綜合評分待查', font=pending_font, fill='#d1c7a9')
    score_notes = []
    if withheld:
        score_notes.append('部分評分待核')
    if scores.get('vEst') and f['score']['v']:
        score_notes.append('觀賞值含體長估算')
    if score_notes:
        draw.text((64,1104), '；'.join(score_notes), font=font, fill='#d1c7a9')
    if SPEC['iucn'].get('assessmentNote'):
        draw.text((64,1076), SPEC['iucn']['assessmentNote'], font=font, fill='#d1c7a9')
    result.save(OUT/f'preview-{ID}.webp', quality=95, method=6)
    target = OUT/f'aviandex/{ID}.avif'
    target.parent.mkdir(exist_ok=True)
    result.save(target, format='AVIF', quality=78, speed=6, subsampling='4:4:4')
    with Image.open(target) as decoded:
        decoded.load()
        assert decoded.format == 'AVIF' and decoded.size == (1024,1536)
    payload = target.read_bytes()
    record = {'id':ID,'zh':bird['name'],'scientificName':tax['sciName'],
              'objectKey':f'aviandex/{ID}.avif','layout':'slim','width':1024,'height':1536,
              'bytes':len(payload),'sha256':hashlib.sha256(payload).hexdigest(),
              'r2UploadPerformed':False,'status':'review_before_upload','score':f['score'],
              'missingScores':[k for k in missing_scores if scores.get(k) is None],
              'withheldScores':withheld,'spec':SPEC}
    (OUT/'manifest.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
    (OUT/'SHA256SUMS').write_text(f"{record['sha256']}  aviandex/{ID}.avif\n")
    (OUT/'README-先核對再上載.txt').write_text(f'''AvianDex 資訊卡重新製作 — {ID} {bird['name']}

這是資訊卡，不是正方形插圖。1024×1536 原尺寸長卡；沿用 0058 深色金框版式。
先看 preview-{ID}.webp 並核對；確認後才備份及覆蓋現有 aviandex/{ID}.avif。
只上載 aviandex/ 內的 {ID}.avif，Content-Type 為 image/avif。
不要放進 birdcards/，不要加 aviandex- 檔名前綴，不要重複 aviandex/aviandex/。

分佈圖說明：{SPEC["rangeMap"]["caption"]}；{SPEC["rangeMap"]["disclaimer"]}。
不是精確分佈多邊形或繁殖／越冬分區；詳見 manifest。
底圖 Natural Earth（public domain），物種分佈文字參考 HKBWS／BoW；詳細來源見 manifest。
評分與現有 app 的 dexScores 一致，是應用程式趣味指標，不是學術評分。
稀有度只看 IUCN：{f["iucn"]["code"]} {f["iucn"]["zh"]}，不是香港常見程度。
所有文字與數字由程式排版；圖片為 AI 插圖，只做基本目視檢查，未經獨立鳥類專家驗證。

沒有上載 R2，沒有更改 app 資訊卡註冊或覆蓋現有 {ID}；上載完成後才更新版式註冊。
manifest.json 是交付核對紀錄，不可直接覆蓋 app 的 card-manifest.json。
''')
    # User requested direct AVIF delivery: previews/manifests stay local, no ZIP.
    print(json.dumps({'avifBytes':len(payload),'avif':str(target.relative_to(ROOT)),
                      'missingScores':missing_scores}))


if __name__ == '__main__':
    render()
