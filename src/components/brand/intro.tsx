"use client";
import { useEffect, useRef, useState } from "react";
import { LOGO_GEO } from "./logo-paths";
import { LOGO_BOIL } from "./logo-boil";

/**
 * Landing intro: the dot drops, slams, becomes the filled O, NOT/BUYING slap in, then the
 * dot travels into the hero's NO. Strictly stepped at 15fps (frame-indexed, no tweening),
 * outlines boil through 3 wobble seeds.
 *
 * Gating lives in INTRO_BOOT (an inline script that runs before first paint): it sets
 * html[data-intro="play"] only when motion is allowed and the intro hasn't played this
 * session. Without that attribute the overlay is display:none, so no-JS, reduced motion
 * and repeat visits all get the plain SSR hero. States: play -> resolve -> done.
 */

const FPS = 15;
const FRAME_MS = 1000 / FPS;
const { o: O, dot: DOT } = LOGO_GEO;
const INK_PARTS = ["N", "O", "T", "B0", "U1", "Y2", "I3", "N4", "G5"] as const;
type Part = (typeof INK_PARTS)[number] | "dot";
type Pose = { x?: number; y?: number; s?: number; sx?: number; sy?: number; r?: number; show?: boolean };

// ── timeline (frame numbers at 15fps) ─────────────────────────────
const T_POP = 2; // dot appears
const T_FALL = 5; // drop
const T_SLAM = 8; // squash
const T_GROW = 12; // grow to O fill while ring draws on (7 frames)
const T_N = 19; // N slap (T one frame later)
const T_BUY = [24, 26, 28]; // BUYING stamps: BU, YI, NG
const T_END = 38; // hold boils until here (~2.5s)
const T_RESOLVE = 40; // hero lines start cutting in
const T_LAND = 44; // dot lands as the hero NO
const T_GONE = 46;

const SMALL = 0.5; // dot size before it becomes the O fill
const restY = O.cy + DOT.r * SMALL * 0.5; // bottom edge of the small dot after it lands

function dotPose(f: number): Pose {
  if (f < T_POP) return { show: false };
  const pop = [0.2, 0.58, 0.5];
  if (f < T_FALL) return { x: O.cx, y: O.cy - 250, s: pop[f - T_POP] };
  const fall: [number, number, number][] = [
    [-200, 0.42, 0.62],
    [-112, 0.4, 0.72],
    [-28, 0.38, 0.8],
  ];
  if (f < T_SLAM) {
    const [dy, sx, sy] = fall[f - T_FALL];
    return { x: O.cx, y: O.cy + dy, sx, sy };
  }
  // slam: squash flat, rebound tall, settle. Anchored at the bottom edge.
  const slam: [number, number][] = [
    [0.84, 0.22],
    [0.6, 0.42],
    [0.44, 0.6],
    [0.5, 0.5],
  ];
  if (f < T_GROW) {
    const [sx, sy] = slam[f - T_SLAM];
    return { x: O.cx, y: restY - DOT.r * sy, sx, sy };
  }
  // grow into the counter, landing off-register down-right, then snap to the mark's spot
  const grow = [0.6, 0.72, 0.84, 0.95, 1.07, 0.98, 1.0];
  if (f < T_GROW + grow.length) {
    const i = f - T_GROW;
    const k = Math.min(1, (i + 1) / 5);
    return { x: O.cx + 9 * k, y: O.cy + 7 * k, s: grow[i] };
  }
  return { x: DOT.cx, y: DOT.cy, s: 1 };
}

const RING = [0.12, 0.3, 0.48, 0.66, 0.82, 0.95, 1];
function ringProgress(f: number) {
  if (f < T_GROW) return 0;
  return RING[Math.min(RING.length - 1, f - T_GROW)];
}

function slap(f: number, at: number, from: number): Pose {
  if (f < at) return { show: false };
  if (f === at) return { x: from, r: Math.sign(from) * 6 };
  if (f === at + 1) return { x: -Math.sign(from) * 10, r: -Math.sign(from) * 1.5 };
  return {};
}

const BUY_GROUPS: Record<string, number> = { B0: 0, U1: 0, Y2: 1, I3: 1, N4: 2, G5: 2 };
const STAMP = [
  { s: 1.22, r: -3 },
  { s: 0.96, r: 1 },
];

function inkPose(part: (typeof INK_PARTS)[number], f: number): Pose {
  if (part === "O") {
    if (f < T_GROW) return { show: false };
    // the ring takes the hit when N and T land
    if (f === T_N + 1) return { x: 5 };
    if (f === T_N + 2) return { x: -5 };
    return {};
  }
  if (part === "N") return slap(f, T_N, -190);
  if (part === "T") return slap(f, T_N + 1, 190);
  const g = BUY_GROUPS[part];
  const at = T_BUY[g];
  if (f < at) return { show: false };
  const st = STAMP[f - at];
  return st ? { s: st.s, r: st.r * (g % 2 ? -1 : 1) } : {};
}

function transform(p: Pose, cx: number, cy: number) {
  const sx = p.sx ?? p.s ?? 1;
  const sy = p.sy ?? p.s ?? 1;
  return `translate(${(p.x ?? 0) + cx} ${(p.y ?? 0) + cy}) rotate(${p.r ?? 0}) scale(${sx} ${sy}) translate(${-cx} ${-cy})`;
}

// group pivots for stamp/slap scaling
const PIVOT: Record<string, [number, number]> = {
  N: [70, 69],
  O: [O.cx, O.cy],
  T: [400, 69],
  B0: [80, 196],
  U1: [80, 196],
  Y2: [237, 196],
  I3: [237, 196],
  N4: [395, 196],
  G5: [395, 196],
};

const MORPH_P = [0, 0.18, 0.42, 0.68, 0.9, 1.04, 1];
const MORPH_R = [50, 48, 40, 26, 10, 0, 0];

export default function LandingIntro() {
  const [mounted, setMounted] = useState(true);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.getAttribute("data-intro") !== "play") {
      setMounted(false);
      return;
    }
    (window as unknown as { __nbIntro?: boolean }).__nbIntro = true;
    const el = root.current!;
    const q = <E extends Element>(s: string) => el.querySelector<E>(s)!;
    const paper = q<HTMLDivElement>(".nb-intro-paper");
    const ink = q<SVGGElement>(".nb-intro-ink");
    const ringMask = q<SVGCircleElement>(".nb-intro-ringmask");
    const morph = q<HTMLDivElement>(".nb-intro-morph");
    const parts = new Map<Part, { g: SVGGElement; path: SVGPathElement }>();
    for (const k of [...INK_PARTS, "dot"] as Part[]) {
      const g = q<SVGGElement>(`[data-part="${k}"]`);
      parts.set(k, { g, path: g.querySelector("path")! });
    }
    const target = () => document.querySelector<HTMLElement>(".hero-no");

    let raf = 0;
    let start = 0;
    let last = -1;
    let from: DOMRect | null = null;
    let to: DOMRect | null = null;
    let finished = false;

    const setState = (s: "resolve" | "done") => html.setAttribute("data-intro", s);
    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      setState("done");
      setMounted(false);
      off();
    };

    const draw = (f: number) => {
      const seed = f % 3;
      for (const [k, { g, path }] of parts) {
        const p = k === "dot" ? dotPose(f) : inkPose(k, f);
        g.style.visibility = p.show === false ? "hidden" : "visible";
        if (p.show === false) continue;
        path.setAttribute("d", LOGO_BOIL[k][seed]);
        if (k === "dot") {
          const sx = p.sx ?? p.s ?? 1;
          const sy = p.sy ?? p.s ?? 1;
          g.setAttribute("transform", `translate(${p.x} ${p.y}) scale(${sx} ${sy})`);
        } else {
          const [cx, cy] = PIVOT[k];
          g.setAttribute("transform", transform(p, cx, cy));
        }
      }
      ringMask.style.strokeDashoffset = String(100 - ringProgress(f) * 100);

      // ── hand-off: the dot leaves the lockup and becomes the hero's NO
      if (f >= T_END) {
        const i = f - T_END;
        if (i === 0) {
          from = parts.get("dot")!.g.getBoundingClientRect();
          const t = target();
          const r = t?.getBoundingClientRect();
          to = r && r.bottom > 0 && r.top < innerHeight ? r : null;
        }
        // ink drops away in two frames
        ink.style.opacity = i === 0 ? "1" : i === 1 ? "0.45" : "0";
        ink.setAttribute("transform", i >= 1 ? "translate(0 14)" : "");
        const fade = [1, 1, 0.72, 0.46, 0.2, 0];
        paper.style.opacity = String(fade[Math.min(i, fade.length - 1)]);
        if (f >= T_RESOLVE && f < T_LAND) setState("resolve");
        if (from && to && i < MORPH_P.length) {
          parts.get("dot")!.g.style.visibility = "hidden";
          const p = MORPH_P[i];
          const lerp = (a: number, b: number) => a + (b - a) * p;
          morph.style.display = "block";
          morph.style.left = `${lerp(from.left, to.left)}px`;
          morph.style.top = `${lerp(from.top, to.top)}px`;
          morph.style.width = `${lerp(from.width, to.width)}px`;
          morph.style.height = `${lerp(from.height, to.height)}px`;
          morph.style.borderRadius = `${MORPH_R[i]}%`;
          morph.style.transform = `rotate(${lerp(0, 1)}deg)`;
        } else if (i >= 1) {
          parts.get("dot")!.g.style.visibility = "hidden";
        }
        if (f >= T_LAND) setState("done");
        if (f >= T_GONE) finish();
      }
    };

    const tick = (now: number) => {
      if (!start) start = now;
      const f = Math.floor((now - start) / FRAME_MS);
      // if the main thread hitched, replay the owed frames (cheap) so hand-off steps never get skipped
      while (last < f && !finished) draw(++last);
      if (!finished) raf = requestAnimationFrame(tick);
    };
    draw(++last);
    raf = requestAnimationFrame(tick);

    const skip = () => finish();
    const opts = { passive: true, capture: true } as const;
    const evs = ["pointerdown", "keydown", "wheel", "touchmove"] as const;
    evs.forEach((e) => window.addEventListener(e, skip, opts));
    const onHide = () => document.visibilityState === "hidden" && finish();
    document.addEventListener("visibilitychange", onHide);
    function off() {
      evs.forEach((e) => window.removeEventListener(e, skip, opts));
      document.removeEventListener("visibilitychange", onHide);
    }
    return () => {
      cancelAnimationFrame(raf);
      off();
    };
  }, []);

  if (!mounted) return null;
  const vb = `-24 -24 ${LOGO_GEO.w + 48} ${LOGO_GEO.h + 48}`;
  return (
    <div ref={root} className="nb-intro" aria-hidden="true">
      <div className="nb-intro-paper" />
      <svg className="nb-intro-svg" viewBox={vb} overflow="visible">
        <defs>
          <mask id="nb-ring-mask" maskUnits="userSpaceOnUse" x={-200} y={-400} width={900} height={900}>
            <circle
              className="nb-intro-ringmask"
              cx={O.cx}
              cy={O.cy}
              r={O.ring}
              fill="none"
              stroke="#fff"
              strokeWidth={O.ring * 1.25}
              pathLength={100}
              strokeDasharray="100 100"
              strokeDashoffset={100}
              transform={`rotate(-110 ${O.cx} ${O.cy})`}
            />
          </mask>
        </defs>
        <g className="nb-intro-ink">
          {INK_PARTS.map((k) => (
            <g key={k} data-part={k} style={{ visibility: "hidden" }} mask={k === "O" ? "url(#nb-ring-mask)" : undefined}>
              <path d={LOGO_BOIL[k][0]} fill="var(--ink)" />
            </g>
          ))}
        </g>
        <g data-part="dot" style={{ visibility: "hidden" }}>
          <path d={LOGO_BOIL.dot[0]} fill="var(--hot)" />
        </g>
      </svg>
      <div className="nb-intro-morph" />
    </div>
  );
}
