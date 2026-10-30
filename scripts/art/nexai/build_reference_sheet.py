"""Compose documentation from the accepted pixels; never generate/repaint Nexai."""
import base64
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = ROOT / 'docs/design/references/nexai'
SOURCE = BASE / 'layered-v1'
OUT = BASE / 'master-v1'
EXPECTED = {
    'nexai-atlas.png': 'de2b01e04c0119f8202c97e39289b42cd8f5b0b16c5d9017905517e9b19030e4',
    'nexai-blink.png': 'ae487bb5e9c15244c3e7547f6a37f0e82ff8548fe18ec33b6e4423644a6de1a3',
}
for name, expected in EXPECTED.items():
    if hashlib.sha256((SOURCE / name).read_bytes()).hexdigest() != expected:
        raise SystemExit(f'Approved source changed: {name}; do not rebuild from an unreviewed replacement.')
html = (SOURCE / 'review.html').read_text()
inner = re.search(r'<svg\b[^>]*>(.*?)</svg>', html, re.S).group(1)
defs = re.search(r'<defs>(.*?)</defs>', inner, re.S).group(1)
scene = re.sub(r'<defs>.*?</defs>', '', inner, flags=re.S)
scene = re.sub(r'\s+id="(?:character|arm|blink)"', '', scene)
for name, id_ in [('nexai-atlas.png','atlas'),('nexai-blink.png','lids')]:
    encoded = base64.b64encode((SOURCE / name).read_bytes()).decode()
    defs += f'<image id="{id_}" href="data:image/png;base64,{encoded}" width="1536" height="1024"/>'
    scene = re.sub(r'<image\s+([^>]*?)href="'+name+r'"([^>]*?)/>', lambda m: '<use '+m.group(1)+'href="#'+id_+'"'+m.group(2)+'/>', scene, flags=re.S)
# Color values are an archival snapshot of approved UI primitives, not new tokens.
font = base64.b64encode((ROOT/'src/styles/fonts/outfit-variable.ttf').read_bytes()).decode()
style = f'''<style>@font-face{{font-family:Outfit;src:url(data:font/ttf;base64,{font})}}text{{font-family:Outfit,Arial,sans-serif;fill:#302633}}.label{{font-size:20px;font-weight:600}}.note{{font-size:17px}}.kicker{{font-size:16px;font-weight:600;fill:#704989}}.rule{{stroke:#d7cbdc;stroke-width:1}}.card{{fill:#ffffff;stroke:#d7cbdc;stroke-width:1}}</style>'''
common = '<defs>'+defs+'<g id="master-open">'+scene+'</g><g id="master-closed">'+scene.replace('opacity="0"','opacity="1"')+'</g></defs>'
OUT.mkdir(exist_ok=True)
(OUT/'nexai-master.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="1030" height="1024" viewBox="40 0 1030 1024" role="img" aria-label="Approved Nexai master v1"><title>Nexai · approved master v1</title>'+common+'<use href="#master-open"/></svg>')
def crop(x,y,w,h,vb,closed=False):
    return f'<svg x="{x}" y="{y}" width="{w}" height="{h}" viewBox="{vb}" preserveAspectRatio="xMidYMid meet"><use href="#master-{"closed" if closed else "open"}"/></svg>'
sheet = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1460" viewBox="0 0 1600 1460" role="img" aria-label="Nexai master v1 reference sheet: approved greeting silhouette, face, blink, arm, tail and small-size previews"><title>Nexai · karakterreferentie · master v1</title>{style}{common}
<rect width="1600" height="1460" fill="#fcfaf7"/>
<text x="64" y="60" class="kicker">NEXO SCHOOL / KARAKTERBIBLIOTHEEK</text>
<text x="64" y="122" font-size="52" font-weight="700">Nexai. Eén herkenbaar maatje.</text>
<text x="64" y="160" font-size="21">Master v1 · Goedgekeurd op 18 oktober 2026 · Exacte illustratielagen, geen nieuwe generatie.</text>
<line x1="64" y1="192" x2="1536" y2="192" class="rule"/>
<rect x="64" y="220" width="650" height="794" rx="18" class="card"/>
<text x="92" y="260" class="kicker">01 / GOEDGEKEURDE BEGROETING</text>
{crop(78,285,620,620,'40 0 1030 1024')}
<text x="96" y="942" class="label">Zachte vacht. Grote oren. Gekrulde staart.</text>
<text x="96" y="975" class="note">Deze houding is de master; geen neutrale rusthouding.</text>
<rect x="738" y="220" width="388" height="382" rx="18" class="card"/>
<text x="762" y="260" class="kicker">02 / GEZICHT</text>
{crop(760,276,344,245,'265 145 550 370')}
<text x="762" y="552" class="note">Oogafstand, snuit en wenkbrauwen behouden.</text>
<text x="762" y="579" class="note">Geen jonger of ronder gezicht maken.</text>
<rect x="1150" y="220" width="386" height="382" rx="18" class="card"/>
<text x="1174" y="260" class="kicker">03 / KNIPPERING</text>
{crop(1172,276,342,245,'265 145 550 370',True)}
<text x="1174" y="552" class="note">Alleen de oogleden wisselen.</text>
<text x="1174" y="579" class="note">De goedgekeurde wenkbrauwen blijven staan.</text>
<rect x="738" y="626" width="388" height="388" rx="18" class="card"/>
<text x="762" y="666" class="kicker">04 / POOT EN AANSLUITING</text>
<svg x="785" y="690" width="260" height="235" viewBox="1040 280 420 470"><use href="#atlas" clip-path="url(#arm-clip)"/></svg>
<text x="762" y="952" class="note">Losse laag, achter het lichaam geplaatst.</text>
<text x="762" y="979" class="note">Draaipunt in bronatlas: (1320, 650).</text>
<rect x="1150" y="626" width="386" height="388" rx="18" class="card"/>
<text x="1174" y="666" class="kicker">05 / STAART EN MARKERING</text>
<svg x="1230" y="690" width="230" height="235" viewBox="770 490 260 440"><use href="#atlas"/></svg>
<text x="1174" y="952" class="note">Dikke krul; blauwe punt met zachte rand.</text>
<text x="1174" y="979" class="note">Geen dunne staart of andere kleurverdeling.</text>
<rect x="64" y="1038" width="650" height="300" rx="18" class="card"/>
<text x="92" y="1080" class="kicker">06 / HERKENBAAR OP KLEIN FORMAAT</text>
{crop(108,1100,180,180,'40 0 1030 1024')}{crop(360,1140,120,120,'40 0 1030 1024')}{crop(574,1180,80,80,'40 0 1030 1024')}
<text x="143" y="1308" class="note">180 px</text><text x="388" y="1308" class="note">120 px</text><text x="587" y="1308" class="note">80 px</text>
<rect x="738" y="1038" width="798" height="300" rx="18" class="card"/>
<text x="762" y="1080" class="kicker">07 / VASTE IDENTITEIT, VRIJE EXPRESSIE</text>
<text x="762" y="1124" class="label">Altijd: paarse vacht, crème snuit, blauwe accenten.</text>
<text x="762" y="1161" class="note">Kleuren en licht zitten in de illustratie. Niet met CSS herkleuren.</text>
<text x="762" y="1196" class="note">Gebruik bestaande lagen eerst. Nieuwe poses krijgen een eigen review.</text>
<text x="762" y="1231" class="note">Warm, slim en soms grappig. Nooit bestraffend bij een fout.</text>
<text x="762" y="1266" class="note">Geen accessoires, extra ledematen, plastic glans of lange echte vacht.</text>
<text x="762" y="1301" class="note">Zij- en achteraanzichten zijn nog niet ontworpen of goedgekeurd.</text>
<text x="64" y="1391" class="kicker">BRON: LAYERED-V1 / NEXAI-ATLAS.PNG + NEXAI-BLINK.PNG</text>
<text x="64" y="1425" class="note">Afgeleide referentie, geen nieuwe poses. Vergelijk toekomstige varianten met deze master, niet alleen met een prompt.</text>
</svg>'''
(OUT/'reference-sheet.svg').write_text(sheet)
print('Composed portable master and reference sheet from approved source pixels.')
