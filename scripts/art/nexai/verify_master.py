"""Read-only integrity check for Nexai's approved sources and derived exports."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
MANIFEST = ROOT / 'docs/design/references/nexai/master-v1/manifest.json'
manifest = json.loads(MANIFEST.read_text())
failures = []
for asset in manifest['files']:
    path = ROOT / asset['path']
    if not path.is_file():
        failures.append(f"Missing: {asset['path']}")
    elif hashlib.sha256(path.read_bytes()).hexdigest() != asset['sha256']:
        failures.append(f"Changed: {asset['path']}")
if failures:
    raise SystemExit('\n'.join(failures) + '\nDo not refresh fingerprints to hide an unreviewed change.')
print(f"PASS: {len(manifest['files'])} Nexai master-v1 source/export fingerprints match.")
print('Integrity is not a visual-quality, accessibility or new-pose approval check.')
