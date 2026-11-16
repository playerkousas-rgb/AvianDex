#!/usr/bin/env python3
"""Verify one rendered info card against its spec, manifest, artwork and runtime data.

Usage: python scripts/cards/verify-info-card.py NNNN
Prints one JSON line; exit code 1 if any check fails.
"""
import hashlib
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
BID = sys.argv[1].zfill(4)
ART = ROOT / f'cards/art/info-restart-{BID}'
OUT = ROOT / f'deliver/cards/info-restart-{BID}'
AXES = ['i', 'a', 'r', 'c', 'v', 'o']

errors = []
spec = json.loads((ROOT / f'scripts/cards/info-restart-{BID}.json').read_text())
manifest = json.loads((OUT / 'manifest.json').read_text())
target = OUT / f'aviandex/{BID}.avif'
if not target.exists():
    print(json.dumps({'id': BID, 'errors': ['avif missing']}, ensure_ascii=False))
    sys.exit(1)
payload = target.read_bytes()
md5 = hashlib.md5(payload).hexdigest()
sha256 = hashlib.sha256(payload).hexdigest()

if spec['id'] != BID or manifest['id'] != BID:
    errors.append('id mismatch')
if spec.get('layout') != 'slim' or manifest.get('layout') != 'slim':
    errors.append('layout not slim')
if spec.get('size') != [1024, 1536] or (manifest.get('width'), manifest.get('height')) != (1024, 1536):
    errors.append('size mismatch')
if manifest.get('objectKey') != f'aviandex/{BID}.avif':
    errors.append('objectKey mismatch')
if manifest.get('bytes') != len(payload) or manifest.get('sha256') != sha256:
    errors.append('manifest hash/size mismatch with file')
if manifest.get('spec') != spec:
    errors.append('manifest.spec != spec file')
sums = (OUT / 'SHA256SUMS').read_text().strip()
if sums != f'{sha256}  aviandex/{BID}.avif':
    errors.append('SHA256SUMS mismatch')
with Image.open(target) as im:
    if im.format != 'AVIF' or im.size != (1024, 1536):
        errors.append(f'avif not 1024x1536 AVIF: {im.format} {im.size}')

runtime = json.loads((ROOT / 'src/data/dexScores.json').read_text())
runtime = runtime.get('scores', runtime).get(BID) or {}
withheld_spec = spec.get('withheldScores', {})
withheld = sorted(withheld_spec)
missing = [a for a in AXES if a not in runtime]
if sorted(manifest.get('missingScores', [])) != sorted(missing):
    errors.append(f'missingScores {manifest.get("missingScores")} != runtime-derived {missing}')
if sorted(manifest.get('withheldScores', {})) != withheld:
    errors.append(f'manifest withheld {manifest.get("withheldScores")} != spec {withheld}')
for axis, reason in withheld_spec.items():
    if not str(reason).strip():
        errors.append(f'withheld {axis} has no reason')

if len(spec.get('featureCrops', [])) != 4 or len(spec.get('featureLabels', [])) != 4:
    errors.append('need 4 feature crops/labels')
if len(spec.get('featureNotes', [])) != 4:
    errors.append('need 4 feature notes')
for src in spec.get('featureSources', []):
    if src != 'pixel.png' and not (ART / src).exists():
        errors.append(f'missing feature source {src}')
if len(spec.get('similarSpecies', [])) != 2:
    errors.append('need 2 similar species')
for sim in spec.get('similarSpecies', []):
    if not (ART / sim['asset']).exists():
        errors.append(f'missing sim asset {sim["asset"]}')
if not any(s.get('url', '').startswith('https://avifauna.hkbws.org.hk/') for s in spec.get('sources', [])):
    errors.append('no HKBWS source')
if not any('birdlife.org' in s.get('url', '') for s in spec.get('sources', [])):
    errors.append('no BirdLife source')
if spec['iucn'].get('code') not in ('LC', 'NT', 'VU', 'EN', 'CR', 'DD'):
    errors.append('bad iucn code')
if len(spec['iucn'].get('assessmentNote', '')) > 26:
    errors.append('assessmentNote longer than 26 chars')

rm = spec['rangeMap']
if rm.get('bounds') != [-180, -90, 180, 90] or rm.get('viewport') != 'world':
    errors.append('range map not world-view -180..180')
geo = json.loads((ART / 'countries.geojson').read_text())
known = {f['properties'].get('ADM0_A3') for f in geo['features']}
unknown = [c for c in rm.get('countryIso3', []) if c not in known]
if unknown:
    errors.append(f'ISO3 not on base map: {unknown}')
if not rm.get('countryIso3'):
    errors.append('no highlighted countries')

if not manifest.get('uploaded_drive_verified'):
    errors.append('drive upload not verified')
if not str(manifest.get('driveFileId', '')).strip():
    errors.append('driveFileId missing')
if manifest.get('driveMd5') != md5 or manifest.get('driveBytesVerified') != len(payload):
    errors.append('drive md5/bytes do not match local render')

print(json.dumps({'id': BID, 'bytes': len(payload), 'md5': md5, 'sha256': sha256,
                  'missingScores': missing, 'withheld': withheld, 'errors': errors},
                 ensure_ascii=False))
sys.exit(1 if errors else 0)
