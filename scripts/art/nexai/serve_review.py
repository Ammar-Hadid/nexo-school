"""Loopback-only Nexai asset review, with an explicit shared-source allowlist."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[3]
ASSETS = ROOT / 'docs/design/references/nexai'
SHARED = {
    '/shared/tokens.css': ROOT / 'src/styles/tokens.css',
    '/shared/fonts.css': ROOT / 'src/styles/fonts.css',
    '/shared/fonts/outfit-variable.ttf': ROOT / 'src/styles/fonts/outfit-variable.ttf',
    '/shared/fonts/lexend-variable.ttf': ROOT / 'src/styles/fonts/lexend-variable.ttf',
}

class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        clean = urlsplit(path).path
        if clean in SHARED:
            return str(SHARED[clean])
        return super().translate_path(path)

if __name__ == '__main__':
    ThreadingHTTPServer(('127.0.0.1', 6010), partial(Handler, directory=str(ASSETS))).serve_forever()
