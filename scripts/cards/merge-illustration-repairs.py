#!/usr/bin/env python3
"""Combine the 43 HK repair AVIFs without re-encoding; reject incomplete/duplicate sets.

Usage: python3 scripts/cards/merge-illustration-repairs.py
Inputs and output are ignored local assets under deliver/cards/.
"""
import csv
import hashlib
import io
import json
import shutil
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / 'deliver/cards'
OUTPUT = BASE / 'hk-repair-complete-43'
ARCHIVE_NAME = 'AvianDex-HK-43-illustrations-AVIF.zip'


def merge():
    assigned = json.loads((ROOT / 'scripts/cards/hk-master.json').read_text())['assigned']
    records = {}
    files = {}
    template = None
    # Validate the complete set before writing any delivery files.
    for n in range(1, 6):
        batch = BASE / f'hk-repair-{n:02d}'
        manifest = json.loads((batch / 'manifest.json').read_text())
        template = manifest
        if manifest['count'] != len(manifest['cards']):
            raise ValueError(f'Invalid count in {batch}')
        for record in manifest['cards']:
            bird_id = record['id']
            if bird_id in records or bird_id not in assigned:
                raise ValueError(f'Duplicate/unexpected ID: {bird_id}')
            expected_file = f'birdcards/{bird_id}.avif'
            if record['file'] != expected_file or record['objectKey'] != expected_file:
                raise ValueError(f'Unexpected object path for {bird_id}')
            species = assigned[bird_id]
            if (record['zh'], record['en'], record['scientificName']) != (species['zh'], species['en'], species['sci']):
                raise ValueError(f'Species mapping mismatch: {bird_id}')
            path = batch / expected_file
            payload = path.read_bytes()
            if len(payload) != record['bytes'] or hashlib.sha256(payload).hexdigest() != record['sha256']:
                raise ValueError(f'Checksum/size mismatch: {path}')
            with Image.open(path) as image:
                image.load()
                if image.format != 'AVIF' or image.size != (1024, 1024):
                    raise ValueError(f'Invalid image: {path}')
            records[bird_id] = dict(record, sourceBatch=batch.name)
            files[bird_id] = path
    if set(records) != set(assigned) or len(records) != 43:
        raise ValueError(f'Incomplete set; missing {sorted(set(assigned) - set(records))}')
    if OUTPUT.exists() and {p.name for p in (OUTPUT / 'birdcards').glob('*.avif')} - {f'{i}.avif' for i in records}:
        raise ValueError('Unexpected AVIF files in output; refusing stale delivery')
    (OUTPUT / 'birdcards').mkdir(parents=True, exist_ok=True)
    ordered = [records[i] for i in sorted(records)]
    for record in ordered:
        shutil.copyfile(files[record['id']], OUTPUT / record['file'])
    manifest = {k: v for k, v in template.items() if k not in {'generatedAt', 'cards'}}
    manifest.update(
        batch='hk-repair-complete-43', count=43,
        totalBytes=sum(r['bytes'] for r in ordered), replacementCount=29, newCount=14,
        scope='All 43 assigned IDs in scripts/cards/hk-master.json; not a live R2 inventory audit',
        r2UploadPerformed=False, cards=ordered,
        note='Handoff record only, NOT app card-manifest.json. AI illustrations with basic visual review, not independent ornithologist verification. User handles R2 upload.',
    )
    (OUTPUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    stream = io.StringIO(newline='')
    writer = csv.DictWriter(stream, fieldnames=['id', 'zh', 'en', 'scientificName', 'action', 'objectKey', 'width', 'height', 'bytes', 'sha256'], extrasaction='ignore')
    writer.writeheader()
    writer.writerows(ordered)
    (OUTPUT / 'upload-list.csv').write_text(stream.getvalue(), encoding='utf-8-sig')
    (OUTPUT / 'SHA256SUMS').write_text(''.join(f"{r['sha256']}  {r['file']}\n" for r in ordered), encoding='utf8')
    readme = (BASE / 'hk-repair-01/README-上載說明.txt').read_text()
    readme = readme.replace('hk-repair-01', '完整 43 張優先插圖').replace('共 6 張', '共 43 張')
    readme += '\n本次優先清單全部完成：29 個舊編號替換、14 個新編號（0570–0583）。\n這不表示其餘 540 個編號已逐一核實；本次沒有進行即時 R2 bucket 全面審計。\n只需使用此完整包，毋須再混合先前分批 ZIP。\n\n核對：在解壓目錄可執行 sha256sum -c SHA256SUMS。\n'
    (OUTPUT / 'README-上載說明.txt').write_text(readme, encoding='utf8')
    archive = OUTPUT / ARCHIVE_NAME
    with ZipFile(archive, 'w', ZIP_DEFLATED) as package:
        for record in ordered:
            package.write(OUTPUT / record['file'], record['file'])
        for name in ['manifest.json', 'upload-list.csv', 'SHA256SUMS', 'README-上載說明.txt']:
            package.write(OUTPUT / name, name)
    with ZipFile(archive) as package:
        if package.testzip() is not None or len(package.namelist()) != 47:
            raise ValueError('ZIP integrity/count check failed')
        for record in ordered:
            if hashlib.sha256(package.read(record['file'])).hexdigest() != record['sha256']:
                raise ValueError(f'ZIP payload mismatch: {record["id"]}')
    result = {'archive': str(archive.relative_to(ROOT)), 'count': 43, 'bytes': archive.stat().st_size,
              'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
              'md5': hashlib.md5(archive.read_bytes()).hexdigest()}
    (OUTPUT / 'package-checksums.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result))
    return result


if __name__ == '__main__':
    merge()
