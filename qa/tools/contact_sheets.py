"""Build small JPEG contact sheets from ordered frame folders (evidence for qa/reports).
Usage: python3 qa/tools/contact_sheets.py qa/artifacts/frames qa/reports/<date>/evidence [project ...]"""
import json, os, sys
from PIL import Image, ImageDraw

src, dst = sys.argv[1], sys.argv[2]
only = set(sys.argv[3:])
os.makedirs(dst, exist_ok=True)
for project in sorted(os.listdir(src)):
    if only and project not in only:
        continue
    for scene in sorted(os.listdir(os.path.join(src, project))):
        d = os.path.join(src, project, scene)
        man = os.path.join(d, 'manifest.json')
        if not os.path.exists(man):
            continue
        frames = json.load(open(man))
        if not frames:
            continue
        first = Image.open(os.path.join(src, '..', frames[0]['file']))
        w = 300; h = int(first.height * w / first.width)
        cols = 6 if h < w else 8
        rows = (len(frames) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * w, rows * (h + 18)), 'white')
        draw = ImageDraw.Draw(sheet)
        for i, f in enumerate(frames):
            im = Image.open(os.path.join(src, '..', f['file'])).convert('RGB').resize((w, h))
            x, y = (i % cols) * w, (i // cols) * (h + 18)
            sheet.paste(im, (x, y + 18))
            draw.text((x + 4, y + 3), f"{f['i']:02d} {f['label']} y={f['scrollY']}"[:48], fill='black')
        out = os.path.join(dst, f'{project}__{scene}.jpg')
        sheet.save(out, quality=70)
        print(out)
