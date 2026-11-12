#!/usr/bin/env python3
"""Render the first restarted info card with the existing approved dark/gold template.

Install Pillow, numpy and scipy; provide Noto Sans TC in ~/.fonts or AVX_FONT_DIR.
Inputs: ignored cards/art/info-restart-0001/{pixel,features,oriental-turtle-dove,
red-collared-dove}.png and countries.geojson (Natural Earth 1:110m, public domain).
No generated text or AI-generated geography is used. Output stays out of Git.
"""
import hashlib
import importlib.util
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'cards/art/info-restart-0001'
OUT = ROOT / 'deliver/cards/info-restart-0001'
SPEC = json.loads((ROOT / 'scripts/cards/info-restart-0001.json').read_text())
loader = importlib.util.spec_from_file_location('composer', ROOT / 'scripts/cards/compose-card.py')
composer = importlib.util.module_from_spec(loader)
loader.loader.exec_module(composer)


def range_map():
    """Explicitly labelled country overview, never presented as a precise species polygon."""
    width, height = 976, 596
    image = Image.new('RGB', (width, height), '#d9e9ed')
    draw = ImageDraw.Draw(image)
    bounds = SPEC['rangeMap']['bounds']
    west, south, east, north = bounds
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
    scores = json.loads((ROOT / 'src/data/dexScores.json').read_text())['scores'][SPEC['id']]
    assert bird['name'] == SPEC['name'] and tax['sciName'] == SPEC['scientificName']
    genus, epithet = tax['sciName'].split(' ', 1)
    f = {'id': SPEC['id'], 'z': bird['name'], 'e': tax['comName'], 's': tax['sciName'],
         'order': [tax['orderZh'], tax['order']], 'family': [tax['familyZh'], tax['family']],
         'genus': genus, 'epithet': epithet, 'iucn': {'code': 'LC', 'zh': '無危'},
         'sim': [s['zh'] for s in SPEC['similarSpecies']],
         'score': {k: f'{scores[k]:.1f}' for k in ['i', 'a', 'r', 'c', 'v', 'o']}}
    # A deterministic working canvas holds separate assets at the exact existing slot coordinates.
    canvas = composer.compose_slim(f, None, 1)
    pictures = {'pixel': Image.open(ART/'pixel.png').convert('RGB'), 'map': range_map()}
    with Image.open(ART/'features.png') as image:
        for i, crop in enumerate(SPEC['featureCrops']):
            pictures[f'zoom{i}'] = image.crop(tuple(round(v*(image.width if j%2 == 0 else image.height)) for j,v in enumerate(crop))).convert('RGB')
    for i, species in enumerate(SPEC['similarSpecies']):
        pictures[f'sim{i}'] = Image.open(ART/species['asset']).convert('RGB')
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
    draw.text((64,1132), '應用程式趣味指標・非學術評分', font=font, fill='#d1c7a9')
    result.save(OUT/'preview-0001.webp', quality=95, method=6)
    target = OUT/'aviandex/0001.avif'
    target.parent.mkdir(exist_ok=True)
    result.save(target, format='AVIF', quality=78, speed=6, subsampling='4:4:4')
    with Image.open(target) as decoded:
        decoded.load()
        assert decoded.format == 'AVIF' and decoded.size == (1024,1536)
    payload = target.read_bytes()
    record = {'id':'0001','zh':bird['name'],'scientificName':tax['sciName'],
              'objectKey':'aviandex/0001.avif','layout':'slim','width':1024,'height':1536,
              'bytes':len(payload),'sha256':hashlib.sha256(payload).hexdigest(),
              'r2UploadPerformed':False,'status':'review_before_upload','score':f['score'],
              'spec':SPEC}
    (OUT/'manifest.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
    (OUT/'SHA256SUMS').write_text(f"{record['sha256']}  aviandex/0001.avif\n")
    (OUT/'README-先核對再上載.txt').write_text('''AvianDex 資訊卡重新製作 — 0001 珠頸斑鳩

這是資訊卡，不是正方形插圖。1024×1536 原尺寸長卡；沿用 0058 深色金框版式。
先看 preview-0001.webp 並核對；確認後才備份及覆蓋現有 aviandex/0001.avif。
只上載 aviandex/ 內的 0001.avif，Content-Type 為 image/avif。
不要放進 birdcards/，不要加 aviandex- 檔名前綴，不要重複 aviandex/aviandex/。

分佈圖為原生分佈涉及國家／地區的概覽，不代表全國全境分佈，也不含引入地。
底圖 Natural Earth（public domain），物種分佈文字參考 HKBWS／BoW；詳細來源見 manifest。
評分與現有 app 的 dexScores 一致，是應用程式趣味指標，不是學術評分。
稀有度只看 IUCN：LC 無危 = 1／7 星，不是香港常見程度。
所有文字與數字由程式排版；圖片為 AI 插圖，只做基本目視檢查，未經獨立鳥類專家驗證。

沒有上載 R2，沒有更改 app 資訊卡註冊或覆蓋現有 0001；上載完成後才更新版式註冊。
manifest.json 是交付核對紀錄，不可直接覆蓋 app 的 card-manifest.json。
''')
    archive = OUT/'AvianDex-info-restart-0001.zip'
    with ZipFile(archive,'w',ZIP_DEFLATED) as z:
        for name in ['aviandex/0001.avif','preview-0001.webp','manifest.json','SHA256SUMS','README-先核對再上載.txt']:
            z.write(OUT/name,name)
    with ZipFile(archive) as z:
        assert z.testzip() is None
        assert hashlib.sha256(z.read('aviandex/0001.avif')).hexdigest() == record['sha256']
    print(json.dumps({'avifBytes':len(payload),'zipBytes':archive.stat().st_size,'archive':str(archive.relative_to(ROOT))}))


if __name__ == '__main__':
    render()
