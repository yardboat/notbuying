"""Generates logo-paths.ts (clean outlines) and logo-boil.ts (3 wobble seeds per glyph)
for the Direction A lockup. Source of truth for geometry: brand-explore/src/build.py.
Run: python3 src/components/brand/gen-logo.py  (needs fontTools + brand-explore/src/build.py)
"""
import math, random, sys, json, os
sys.path.insert(0, '/home/claude/brand-explore/src')
import build as B
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.transformPen import TransformPen

OUT = os.path.dirname(os.path.abspath(__file__))
S1 = 200  # lockup size used by brand-explore A-lockup.svg

def glyph_rec(ch, size, x, y):
    pen = RecordingPen(); s = size / B.UPM
    B._gs[B._cm[ord(ch)]].draw(TransformPen(pen, (s, 0, 0, -s, x, y)))
    return pen.value

def flatten(rec, step=6.0):
    """Recording -> list of closed polylines."""
    polys, cur, p0 = [], [], None
    def lerp(a, b, t): return (a[0] + (b[0]-a[0])*t, a[1] + (b[1]-a[1])*t)
    for op, args in rec:
        if op == 'moveTo':
            cur = [args[0]]; p0 = args[0]
        elif op == 'lineTo':
            a, b = cur[-1], args[0]; n = max(1, int(math.dist(a, b) / step))
            cur += [lerp(a, b, i / n) for i in range(1, n + 1)]
        elif op == 'qCurveTo':
            pts = list(args); a = cur[-1]
            # expand implied on-curve points
            ctrls, end = pts[:-1], pts[-1]
            segs = []
            for i, c in enumerate(ctrls):
                e = end if i == len(ctrls) - 1 else lerp(c, ctrls[i+1], 0.5)
                segs.append((c, e))
            for c, e in segs:
                L = math.dist(a, c) + math.dist(c, e); n = max(2, int(L / step))
                for i in range(1, n + 1):
                    t = i / n
                    cur.append(((1-t)**2*a[0] + 2*(1-t)*t*c[0] + t*t*e[0], (1-t)**2*a[1] + 2*(1-t)*t*c[1] + t*t*e[1]))
                a = e
        elif op == 'curveTo':
            raise SystemExit('cubic not expected')
        elif op in ('closePath', 'endPath'):
            if cur and math.dist(cur[-1], p0) < 0.01: cur.pop()
            polys.append(cur); cur = []
    return polys

def noise_fn(seed, amp, freq):
    r = random.Random(seed * 7919 + 13)
    waves = []
    for _ in range(4):
        th = r.uniform(0, math.tau); f = freq * r.uniform(0.6, 1.7); ph = r.uniform(0, math.tau)
        waves.append((math.cos(th) * f, math.sin(th) * f, ph))
    w2 = [(r.uniform(-1, 1) * freq * 1.3, r.uniform(-1, 1) * freq * 1.3, r.uniform(0, math.tau)) for _ in range(4)]
    def d(x, y):
        dx = sum(math.sin(x*a + y*b + p) for a, b, p in waves) / 4
        dy = sum(math.sin(x*a + y*b + p) for a, b, p in w2) / 4
        # small per-point tooth so edges read as redrawn, not just bent
        j = r2(x, y, seed)
        return dx * amp + j[0], dy * amp + j[1]
    return d

def r2(x, y, seed):
    h = math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453
    h2 = math.sin(x * 39.346 + y * 11.135 + seed * 83.155) * 24634.6345
    return ((h - math.floor(h)) - 0.5) * 0.7, ((h2 - math.floor(h2)) - 0.5) * 0.7

def fmt(v): return f'{v:.1f}'.rstrip('0').rstrip('.') if '.' in f'{v:.1f}' else f'{v:.1f}'

def poly_d(polys, fn=None, dx=0, dy=0):
    out = []
    for p in polys:
        pts = [(x + (fn(x, y)[0] if fn else 0) - dx, y + (fn(x, y)[1] if fn else 0) - dy) for x, y in p]
        out.append('M' + ' '.join(f'{fmt(x)} {fmt(y)}' for x, y in pts) + 'Z')
    return ''.join(out)

def rec_d(rec):
    from fontTools.pens.svgPathPen import SVGPathPen
    pen = SVGPathPen(None, ntos=lambda v: fmt(v))
    rec_replay(rec, pen); return pen.getCommands()

def rec_replay(rec, pen):
    for op, args in rec: getattr(pen, op)(*args)

# ---- geometry (mirrors build.a_lockup / a_mark at size 200, origin 0,0)
s1 = S1
wN, wO, wT = B.adv('N', s1), B.adv('O', s1), B.adv('T', s1)
w1 = wN + wO + wT - 0.02 * s1
base1 = B.CAP * s1 / B.UPM
ocx = wN + wO / 2 - 0.01 * s1
ocy = base1 - B.CAP * s1 / B.UPM / 2
glyphs = {}
glyphs['N'] = glyph_rec('N', s1, 0, base1)
glyphs['O'] = glyph_rec('O', s1, ocx - 416.5 * s1 / B.UPM, ocy + 344 * s1 / B.UPM)
glyphs['T'] = glyph_rec('T', s1, wN + wO - 0.02 * s1, base1)
raw = B.text_width('BUYING', 100) - (74 + (833 - 770)) * 0.1
s2 = 100 * (w1 - (74 + 45) * s1 / B.UPM) / raw
base2 = base1 + 0.11 * s1 + B.CAP * s2 / B.UPM
x = 74 * s1 / B.UPM - 74 * s2 / B.UPM
for i, ch in enumerate('BUYING'):
    glyphs[f'{ch}{i}'] = glyph_rec(ch, s2, x, base2)
    x += B.adv(ch, s2)
dot = dict(cx=ocx + 0.036 * s1, cy=ocy - 0.03 * s1, r=0.215 * s1)
H = base2

# ring mask radius: mid of O ring (outer ~ 0.37*s, counter ~0.2*s)
ring_r = 0.29 * s1

AMP, FREQ = 1.5, 0.045
boil = {}
for k, rec in glyphs.items():
    polys = flatten(rec, 7.0)
    boil[k] = [poly_d(polys, noise_fn(sd, AMP, FREQ)) for sd in (1, 2, 3)]
# dot: circle polygon centred at 0,0
circ = [[(dot['r'] * math.cos(t / 40 * math.tau), dot['r'] * math.sin(t / 40 * math.tau)) for t in range(40)]]
boil['dot'] = [poly_d(circ, noise_fn(sd + 10, AMP * 1.1, FREQ)) for sd in (1, 2, 3)]

order = ['N', 'O', 'T'] + [f'{c}{i}' for i, c in enumerate('BUYING')]
clean = {k: rec_d(glyphs[k]) for k in order}

head = '// Generated by gen-logo.py from brand-explore Direction A (The Filled O). Do not edit by hand.\n'
geo = dict(w=round(w1, 1), h=round(H, 1), o=dict(cx=round(ocx, 1), cy=round(ocy, 1), ring=round(ring_r, 1)),
           dot={k: round(v, 1) for k, v in dot.items()})
with open(f'{OUT}/logo-paths.ts', 'w') as f:
    f.write(head)
    f.write(f'export const LOGO_GEO = {json.dumps(geo)} as const;\n')
    f.write(f'export const LOGO_ORDER = {json.dumps(order)} as const;\n')
    f.write(f'export const LOGO_CLEAN: Record<string, string> = {json.dumps(clean, indent=0)};\n')
with open(f'{OUT}/logo-boil.ts', 'w') as f:
    f.write(head + '// Three wobble seeds per glyph; the intro cycles them at 15fps (the boil).\n')
    f.write(f'export const LOGO_BOIL: Record<string, [string, string, string]> = {json.dumps(boil, indent=0)};\n')
print('w', w1, 'h', H, 'dot', dot, 'o', ocx, ocy)
print({k: len(''.join(v)) for k, v in boil.items()})
