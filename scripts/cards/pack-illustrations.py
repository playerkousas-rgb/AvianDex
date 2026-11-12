#!/usr/bin/env python3
"""Pack square, text-free bird illustrations for R2 birdcards/ (NOT information cards).

Requires Pillow with AVIF support: python3 -m pip install pillow
Example:
  python3 scripts/cards/pack-illustrations.py --input cards/art/hk-repair-01 \
    --output deliver/cards/hk-repair-01 --batch hk-repair-01
Generated image assets belong in ignored cards/art/ and deliver/cards/, not Git.
"""
import argparse
import csv
import hashlib
import io
import json
from datetime import datetime, timezone
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

from PIL import Image, ImageOps, features

ROOT = Path(__file__).resolve().parents[2]


def build_package(source, output, batch, size=1024, quality=60):
    if not features.check('avif'):
        raise RuntimeError('Pillow does not have AVIF support')
    birds = {b['id']: b for b in json.loads((ROOT / 'src/data/birds.json').read_text())}
    taxonomy = json.loads((ROOT / 'src/data/birdTaxonomy.json').read_text())
    assigned = json.loads((ROOT / 'scripts/cards/hk-master.json').read_text())['assigned']
    sources = sorted(p for p in source.iterdir() if p.suffix.lower() in {'.png', '.jpg', '.jpeg', '.webp'})
    if not sources:
        raise ValueError('No source images found')
    seen = set()
    # Validate the complete input before encoding anything; never crop a portrait information card.
    for path in sources:
        bird_id = path.stem
        if len(bird_id) != 4 or not bird_id.isdigit() or bird_id not in birds or bird_id in seen:
            raise ValueError(f'Invalid, duplicate or unmapped bird ID: {path.name}')
        seen.add(bird_id)
        with Image.open(path) as image:
            if image.width != image.height:
                raise ValueError(f'Illustration must be square; refusing to crop: {path.name} {image.size}')
            if image.width < size:
                raise ValueError(f'Source too small; refusing to upscale: {path.name}')
    target = output / 'birdcards'
    target.mkdir(parents=True, exist_ok=True)
    records = []
    for path in sources:
        bird_id = path.stem
        species = assigned.get(bird_id, {})
        tax = taxonomy.get(bird_id, {})
        with Image.open(path) as image:
            image = ImageOps.exif_transpose(image).convert('RGB')
            image = image.resize((size, size), Image.Resampling.LANCZOS)
            destination = target / f'{bird_id}.avif'
            image.save(destination, format='AVIF', quality=quality, speed=6, subsampling='4:4:4')
        with Image.open(destination) as decoded:
            decoded.load()
            if decoded.format != 'AVIF' or decoded.size != (size, size):
                raise RuntimeError(f'Failed AVIF roundtrip: {destination}')
        payload = destination.read_bytes()
        records.append({
            'id': bird_id,
            'zh': birds[bird_id]['name'],
            'en': species.get('en') or tax.get('comName') or birds[bird_id].get('en', ''),
            'scientificName': species.get('sci') or tax.get('sciName', ''),
            'file': f'birdcards/{bird_id}.avif',
            'objectKey': f'birdcards/{bird_id}.avif',
            'action': 'replace' if int(bird_id) <= 569 else 'add',
            'actionBasis': 'HK-master reassigned ID' if bird_id in assigned and int(bird_id) <= 569 else 'new ID' if int(bird_id) > 569 else 'manual illustration batch',
            'width': size, 'height': size, 'bytes': len(payload),
            'sha256': hashlib.sha256(payload).hexdigest(),
            'sourceSha256': hashlib.sha256(path.read_bytes()).hexdigest(),
            'artworkType': 'AI-generated illustration, not a documentary photograph',
            'review': 'Basic visual review only; not independently verified by an ornithologist',
        })
    manifest = {
        'batch': batch,
        'generatedAt': datetime.now(timezone.utc).isoformat(),
        'assetType': 'illustration', 'r2Folder': 'birdcards', 'contentType': 'image/avif',
        'quality': quality, 'chromaSubsampling': '4:4:4', 'count': len(records),
        'totalBytes': sum(r['bytes'] for r in records),
        'liveR2InventoryVerified': False,
        'note': 'Replacement/add suggestions follow repository mapping, not a live audit of R2. This manifest is a handoff record, not the app card-manifest.json format. No upload has been performed.',
        'cards': records,
    }
    (output / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    stream = io.StringIO(newline='')
    columns = ['id', 'zh', 'en', 'scientificName', 'action', 'objectKey', 'width', 'height', 'bytes', 'sha256']
    writer = csv.DictWriter(stream, fieldnames=columns, extrasaction='ignore')
    writer.writeheader()
    writer.writerows(records)
    (output / 'upload-list.csv').write_text(stream.getvalue(), encoding='utf-8-sig')
    (output / 'SHA256SUMS').write_text(''.join(f"{r['sha256']}  {r['file']}\n" for r in records))
    (output / 'README-上載說明.txt').write_text(f'''AvianDex 插圖更新包 — {batch}

共 {len(records)} 張，{size} × {size}，真正 AVIF，無文字插圖；不是資訊圖卡，也不是實拍照片。

上載至你現有 R2 bucket 的 birdcards/ 資料夾：
- 在 bucket 根目錄：上載本包的 birdcards 資料夾。
- 已開啟 R2 的 birdcards/ 目錄：只上載該資料夾裡的 .avif 檔。
- 正確物件路徑例如 birdcards/{records[0]['id']}.avif。
- 不要加 aviandex- 前綴，不要放進 aviandex/，也不要變成 birdcards/birdcards/。
- Content-Type 應為 image/avif。

本包的 replace 是依香港名錄重編紀錄建議替換；未即時核實你 R2 現有檔案。
請先預覽，並備份你要保留的同名舊檔，才確認覆蓋。
圖片已做基本目視檢查，但未經獨立鳥類專家驗證。

upload-list.csv、manifest.json、SHA256SUMS 是核對文件，不需要上載至公開圖片資料夾。
此 manifest 並不是 app 的 /data/card-manifest.json，不要用它覆蓋 app 清單。
沒有更改任何資訊卡名單，也沒有自動上載到 R2。

同名圖片替換後若網站仍顯示舊圖，可能需要清除瀏覽器／網站／CDN 圖片快取；
若經 /api/card 代理，亦需留意代理的長效快取。單純上載不保證所有已快取裝置即時換圖。
''', encoding='utf8')
    archive = output / f'birdcards-{batch}.zip'
    with ZipFile(archive, 'w', ZIP_DEFLATED) as package:
        for record in records:
            package.write(output / record['file'], record['file'])
        for name in ['manifest.json', 'upload-list.csv', 'SHA256SUMS', 'README-上載說明.txt']:
            package.write(output / name, name)
    with ZipFile(archive) as package:
        if package.testzip() is not None:
            raise RuntimeError('ZIP integrity check failed')
        for record in records:
            assert hashlib.sha256(package.read(record['file'])).hexdigest() == record['sha256']
    print(json.dumps({'count': len(records), 'avifBytes': manifest['totalBytes'], 'zipBytes': archive.stat().st_size, 'archive': str(archive)}, ensure_ascii=False))
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--batch', required=True)
    parser.add_argument('--size', type=int, default=1024)
    parser.add_argument('--quality', type=int, default=60)
    args = parser.parse_args()
    build_package(args.input, args.output, args.batch, args.size, args.quality)
