"""Build MELVO logo SVGs: folded-M mark, Archivo-based wordmark, lockups, vertical shapes."""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

PAPER, INK, GREEN, FIROZI, HALDI = "#EEF0EA", "#0B1A16", "#0B4A44", "#22C4CF", "#E9AE36"
FONT, TRACK = sys.argv[1], -0.045
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)

f = TTFont(FONT); gs = f.getGlyphSet(); cmap = f.getBestCmap(); hmtx = f["hmtx"]; UPM = 1000
def bounds(ch):
    b = BoundsPen(gs); gs[cmap[ord(ch)]].draw(b); return b.bounds
XH = bounds("x")[3]; ASC = bounds("l")[3]
SLOPE = 9 / 22   # fold slope shared with the mark's outer panels

def word(text, x0=0, slant_l=True):
    """Return (path, ink_right) for text; the 'l' gets a folded top cut."""
    x = x0; parts = []; right = x0
    for i, ch in enumerate(text):
        g = cmap[ord(ch)]; bx = bounds(ch)
        if ch == "l" and slant_l:
            l, r, top = x + bx[0], x + bx[2], bx[3]
            drop = (r - l) * SLOPE
            parts.append(f"M{l:.0f} 0V{-(top - drop):.0f}L{r:.0f} {-top:.0f}V0Z")
        else:
            pen = SVGPathPen(gs); gs[g].draw(TransformPen(pen, (1, 0, 0, -1, x, 0))); parts.append(pen.getCommands())
        right = x + bx[2]
        x += hmtx[g][0] + (TRACK * UPM if i < len(text) - 1 else 0)
    return " ".join(parts), right, x

DOT = round(XH * 0.34); GAP = round(UPM * 0.045)

def square(x):  # firozi dot sitting on the baseline
    return f"M{x:.0f} 0H{x+DOT:.0f}V{-DOT:.0f}H{x:.0f}Z"

# ---------- mark (100 x 80), firozi = panel 2 ----------
MARK = [
    [(0, 9), (22, 0), (22, 80), (0, 73)],
    [(25, 30), (48, 40), (48, 72), (25, 80)],
    [(52, 40), (75, 30), (75, 80), (52, 72)],
    [(78, 0), (100, 9), (100, 73), (78, 80)],
]
def polys(ps, colors, tx=0, ty=0, s=1):
    out = []
    for p, c in zip(ps, colors):
        pts = " ".join(f"{tx + x * s:.1f},{ty + y * s:.1f}" for x, y in p)
        out.append(f'<polygon fill="{c}" points="{pts}"/>')
    return "".join(out)

def mark_colors(on="light", mono=None):
    base = GREEN if on == "light" else PAPER
    if mono: return [mono] * 4
    return [base, FIROZI, base, base]

# ---------- vertical shapes (100 x 80 box) ----------
def shrink(points, k=0.9):
    cx = sum(x for x, _ in points) / len(points); cy = sum(y for _, y in points) / len(points)
    return [(cx + (x - cx) * k, cy + (y - cy) * k) for x, y in points]
def iso_cube():
    top = [(50, 18), (78, 32), (50, 46), (22, 32)]
    left = [(22, 32), (50, 46), (50, 80), (22, 66)]
    right = [(50, 46), (78, 32), (78, 66), (50, 80)]
    flap = [(50, 18), (78, 32), (90, 16), (62, 2)]
    return [shrink(left), shrink(top), shrink(right), shrink(flap, 0.88)]
def skew(points, k=-0.14, cx=50):
    return [(x, y + k * (x - cx)) for x, y in points]
SHAPES = {
    "m": MARK,
    "learn": [[(0, 62), (22, 56), (22, 80), (0, 80)], [(26, 42), (48, 36), (48, 80), (26, 80)],
              [(52, 24), (74, 18), (74, 80), (52, 80)], [(78, 6), (100, 0), (100, 80), (78, 80)]],
    "brand": [skew([(14, 10), (48, 10), (48, 40), (14, 40)]), skew([(52, 10), (86, 10), (86, 40), (52, 40)]),
              skew([(14, 44), (48, 44), (48, 74), (14, 74)]), skew([(52, 44), (86, 44), (86, 74), (52, 74)])],
    "sell": iso_cube(),
    "scale": [[(50, 4 + d), (90, 18 + d), (50, 32 + d), (10, 18 + d)] for d in (0, 15, 30, 45)],
}
SHAPE_FIROZI = {"m": 1, "learn": 1, "brand": 1, "sell": 1, "scale": 1}

def shape_svg(name, on="light", size=None):
    base = GREEN if on == "light" else PAPER
    ps = SHAPES[name]; cols = [base] * 4; cols[SHAPE_FIROZI[name]] = FIROZI
    if name == "scale":  # draw bottom layer first so upper layers overlap
        ps = list(reversed(ps)); cols = list(reversed(cols))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 104 84"{f" width=\"{size}\"" if size else ""}>{polys(ps, cols)}</svg>'

# ---------- lockups ----------
def wordmark_svg(text_color=GREEN, dot=FIROZI, suffix=None, suffix_color=None):
    p, right, _ = word("melvo")
    dx = right + GAP
    body = f'<path fill="{text_color}" d="{p}"/><path fill="{dot}" d="{square(dx)}"/>'
    width = dx + DOT
    if suffix:
        sp, sr, _ = word(suffix, x0=dx + DOT + GAP)
        body += f'<path fill="{suffix_color or text_color}" d="{sp}"/>'
        width = sr
    pad = 20
    return body, width, f'0 {-ASC - pad} {width + pad:.0f} {ASC + 2 * pad}'

def horizontal_svg(text=GREEN, mcols=None, bg=None):
    body, width, _ = wordmark_svg(text)
    mh = ASC * 1.04; s = mh / 80; mw = 100 * s; gap = mh * 0.32
    m = polys(MARK, mcols or mark_colors(), tx=0, ty=-mh, s=s)
    w = f'<g transform="translate({mw + gap:.0f} 0)">{body}</g>'
    W = mw + gap + width; pad = mh * 0.12
    rect = f'<rect x="{-pad:.0f}" y="{-mh - pad:.0f}" width="{W + 2 * pad:.0f}" height="{mh + 2 * pad:.0f}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-pad:.0f} {-mh - pad:.0f} {W + 2 * pad:.0f} {mh + 2 * pad:.0f}">{rect}{m}{w}</svg>'

def stacked_svg(text=GREEN, mcols=None):
    body, width, _ = wordmark_svg(text)
    mh = ASC * 2.1; s = mh / 80; mw = 100 * s
    gap = ASC * 0.35
    m = polys(MARK, mcols or mark_colors(), tx=(width - mw) / 2, ty=-ASC - gap - mh, s=s)
    top = -ASC - gap - mh; pad = 30
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-pad} {top - pad:.0f} {width + 2 * pad:.0f} {-top + 2 * pad:.0f}">{m}{body}</svg>'

def icon_svg(bg=PAPER, on="light"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="26" fill="{bg}"/>'
            f'{polys(MARK, mark_colors(on), tx=20, ty=28, s=0.8)}</svg>')

def domain_svg(suffix, text, dot, suffix_color):
    body, width, vb = wordmark_svg(text, dot, suffix, suffix_color)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">{body}</svg>'

files = {
    "melvo-mark.svg": f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 104 84">{polys(MARK, mark_colors())}</svg>',
    "melvo-mark-reversed.svg": f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 104 84">{polys(MARK, mark_colors("dark"))}</svg>',
    "melvo-wordmark.svg": (lambda b: f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{b[2]}">{b[0]}</svg>')(wordmark_svg()),
    "melvo-logo-horizontal.svg": horizontal_svg(),
    "melvo-logo-horizontal-reversed.svg": horizontal_svg(PAPER, mark_colors("dark")),
    "melvo-logo-horizontal-mono.svg": horizontal_svg(INK, mark_colors(mono=INK)).replace(f'fill="{FIROZI}"', f'fill="{INK}"'),
    "melvo-logo-stacked.svg": stacked_svg(),
    "melvo-icon.svg": icon_svg(),
    "melvo-icon-dark.svg": icon_svg(GREEN, "dark"),
    "melvo-in.svg": domain_svg("in", GREEN, FIROZI, GREEN),
    "melvo-fun.svg": domain_svg("fun", INK, FIROZI, GREEN),
    "melvo-fun-reversed.svg": domain_svg("fun", PAPER, FIROZI, HALDI),
}
for n in SHAPES:
    files[f"shape-{n}.svg"] = shape_svg(n)
    files[f"shape-{n}-reversed.svg"] = shape_svg(n, "dark")
for n, s in files.items():
    open(os.path.join(OUT, n), "w").write(s + "\n")
print("\n".join(sorted(files)))
