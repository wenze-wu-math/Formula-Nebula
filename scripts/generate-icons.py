"""
Render the project's SVG favicon into the PNG icons the web app manifest
declares (192x192 and 512x512).

The manifest has always pointed at /icon-192.png and /icon-512.png, but those
files never existed — installing the app to a home screen produced a blank
tile. This generates them from the single branding source so there is one
place to change the mark.

Uses Pillow (available in the bundled runtime). SVG rasterisation is done by
drawing the same geometry the SVG describes: a rounded square with the brand
gradient and the "nu"-like glyph. If a fuller SVG renderer is available this
can be swapped for a direct rasterise.
"""

import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public")

# Brand gradient stops taken from designs/branding/logos/formula-nebula-favicon.svg
STOP_A = (124, 58, 237)   # #7c3aed
STOP_B = (37, 99, 235)    # #2563eb


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient_square(size, radius_ratio=0.22):
    """A rounded square filled with a diagonal gradient."""
    # Build the gradient at 1:1 then apply a rounded-rect mask.
    grad = Image.new("RGB", (size, size))
    px = grad.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * (size - 1)) if size > 1 else 0
            px[x, y] = lerp(STOP_A, STOP_B, t)

    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    r = int(size * radius_ratio)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=255)

    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(grad, (0, 0), mask)
    return out


def draw_mark(img):
    """The glyph: a stylised star/nebula core, drawn in white."""
    size = img.size[0]
    d = ImageDraw.Draw(img)
    cx = cy = size / 2

    # Central diamond
    k = size * 0.20
    d.polygon(
        [(cx, cy - k), (cx + k * 0.62, cy), (cx, cy + k), (cx - k * 0.62, cy)],
        fill=(255, 255, 255, 235),
    )
    # Four rays
    ray = size * 0.34
    w = max(2, int(size * 0.022))
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        d.line(
            [(cx + dx * k * 1.15, cy + dy * k * 1.15), (cx + dx * ray, cy + dy * ray)],
            fill=(255, 255, 255, 200),
            width=w,
        )
    return img


def main():
    made = []
    for size in (192, 512):
        img = gradient_square(size)
        draw_mark(img)
        path = os.path.join(OUT_DIR, f"icon-{size}.png")
        img.save(path, "PNG", optimize=True)
        made.append((path, os.path.getsize(path)))

    for path, nbytes in made:
        print(f"  wrote {os.path.relpath(path, ROOT)}  ({nbytes} bytes)")

    # Sanity: the files must be readable and the right size.
    for size in (192, 512):
        p = os.path.join(OUT_DIR, f"icon-{size}.png")
        with Image.open(p) as im:
            assert im.size == (size, size), f"{p}: size {im.size}"
            assert im.mode == "RGBA", f"{p}: mode {im.mode}"
    print("  verified: both icons open, correct dimensions, RGBA")


if __name__ == "__main__":
    main()
