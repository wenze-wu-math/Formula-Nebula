"""
Generate the Open Graph / Twitter preview image (1200x630).

index.html declares og:image and twitter:image pointing at /og-image.jpg, but
that file never existed — every share of the project showed a blank preview.

The glow is computed per-pixel rather than by stacking translucent circles
(the first attempt: concentric filled circles do not alpha-composite the way
this needs, so it rendered as a hard-edged disc instead of a soft nebula).
"""

import math
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "og-image.jpg")

W, H = 1200, 630
BG = (11, 17, 33)            # deep navy
ACCENT_A = (124, 58, 237)    # violet
ACCENT_B = (37, 99, 235)     # blue
TEXT = (233, 238, 246)
DIM = (150, 166, 190)
MUTED = (100, 116, 139)


def find_font(size, bold=False):
    candidates = [
        r"C:\Windows\Fonts\msyhbd.ttc" if bold else r"C:\Windows\Fonts\msyh.ttc",
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                continue
    return ImageFont.load_default()


def build_background():
    """Per-pixel radial gradients, composited additively. Slow but correct."""
    px = []
    glows = [
        # cx, cy, radius, colour, strength
        (W * 0.74, H * 0.40, 520, ACCENT_A, 0.95),
        (W * 0.20, H * 0.82, 420, ACCENT_B, 0.55),
        (W * 0.52, H * 0.10, 300, (56, 189, 248), 0.22),
    ]
    for y in range(H):
        row = []
        for x in range(W):
            r, g, b = BG
            for cx, cy, rad, col, strength in glows:
                d2 = (x - cx) ** 2 + (y - cy) ** 2
                # smooth falloff, zero beyond the radius
                t = max(0.0, 1.0 - math.sqrt(d2) / rad)
                if t <= 0:
                    continue
                k = (t ** 2.2) * strength
                r += (col[0] - r) * k
                g += (col[1] - g) * k
                b += (col[2] - b) * k
            row.append((min(255, int(r)), min(255, int(g)), min(255, int(b))))
        px.append(row)

    img = Image.new("RGB", (W, H))
    img.putdata([c for row in px for c in row])
    return img


def main():
    img = build_background()
    d = ImageDraw.Draw(img, "RGBA")

    # Deterministic star field on the right, golden-angle spiral.
    for i in range(180):
        ang = i * 2.399963
        rad = (i ** 0.5) * 25
        x = W * 0.73 + math.cos(ang) * rad
        y = H * 0.40 + math.sin(ang) * rad * 0.60
        if 0 <= x < W and 0 <= y < H:
            s = 1 if i % 3 else 2
            a = 90 if i % 5 else 170
            d.ellipse([x - s, y - s, x + s, y + s], fill=(255, 255, 255, a))

    title_font = find_font(76, bold=True)
    sub_font = find_font(32)
    stat_font = find_font(30, bold=True)
    label_font = find_font(22)

    x0 = 88
    d.text((x0, 148), "公式诗云", font=title_font, fill=TEXT)
    d.text((x0, 246), "Formula Nebula", font=sub_font, fill=(167, 139, 250))
    d.text((x0, 300), "代数几何知识图谱的三维星云可视化", font=sub_font, fill=DIM)

    # These must match what the app actually renders (graph.stats), not the
    # curated 405/59/1620 core — see scripts/verify-readme-claims.mjs.
    stats = [("3630", "定理"), ("607", "猜想"), ("8747", "关联")]
    sx = x0
    for num, label in stats:
        d.text((sx, 428), num, font=stat_font, fill=(165, 180, 252))
        w = d.textlength(num, font=stat_font)
        d.text((sx + w + 8, 433), label, font=label_font, fill=DIM)
        sx += w + 8 + d.textlength(label, font=label_font) + 44

    d.text((x0, 540), "wenze-wu-math / Formula-Nebula", font=label_font, fill=MUTED)

    img.save(OUT, "JPEG", quality=90, optimize=True)
    print(f"  wrote {os.path.relpath(OUT, ROOT)}  ({os.path.getsize(OUT)} bytes)")

    with Image.open(OUT) as im:
        assert im.size == (W, H), im.size
    print(f"  verified: {W}x{H} JPEG")


if __name__ == "__main__":
    main()
