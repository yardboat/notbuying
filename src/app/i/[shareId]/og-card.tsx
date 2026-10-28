import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { usd } from "@/lib/money";
import type { PublicIssue } from "./data";

// Satori can't read CSS vars: these mirror design/tokens in globals.css.
const T = {
  paper: "#efebe1",
  receipt: "#fbf9f3",
  ink: "#15130f",
  ink2: "#4a463e",
  hot: "#f2380f",
  hotDeep: "#c42a0b",
  hotDeepInk: "#fff6ef",
};

let fontsP: Promise<{ name: string; data: Buffer; weight: 400 | 700; style: "normal" }[]> | null = null;
function fonts() {
  const f = (file: string) => readFile(join(process.cwd(), "src/fonts/og", file));
  fontsP ??= Promise.all([f("archivo-black.ttf"), f("special-elite.ttf"), f("plex-mono-400.ttf"), f("plex-mono-700.ttf")]).then(([a, s, p4, p7]) => [
    { name: "Archivo", data: a, weight: 400, style: "normal" },
    { name: "Elite", data: s, weight: 400, style: "normal" },
    { name: "Plex", data: p4, weight: 400, style: "normal" },
    { name: "Plex", data: p7, weight: 700, style: "normal" },
  ]);
  return fontsP;
}

const display = { fontFamily: "Archivo", textTransform: "uppercase" as const, letterSpacing: "-0.02em", lineHeight: 0.85 };
const type = { fontFamily: "Elite" };
// Halftone dots in the paper: the photocopy, in a format Satori can render.
const halftone = { backgroundImage: `radial-gradient(circle at 1px 1px, rgba(21,19,15,0.13) 1px, transparent 0)`, backgroundSize: "6px 6px" };

function Stamp({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", border: `${Math.round(size / 7)}px solid ${T.hotDeep}`, color: T.hotDeep, padding: `${size * 0.25}px ${size * 0.7}px`, ...type, fontSize: size, letterSpacing: "0.08em", textTransform: "uppercase", transform: "rotate(-6deg)", opacity: 0.92 }}>
      every no is a yes
    </div>
  );
}

const HATCH = `repeating-linear-gradient(135deg, ${T.ink} 0px, ${T.ink} 3px, ${T.receipt} 3px, ${T.receipt} 9px)`;

function Ledger({ d, scale }: { d: PublicIssue; scale: number }) {
  const s = (n: number) => Math.round(n * scale);
  const total = d.carrot + d.savings + d.pledged;
  const carrotName = d.goal?.label.slice(0, 18) ?? "carrot";
  const parts = [
    { k: "carrot", cents: d.carrot, bg: { background: T.hot }, label: `${usd(d.carrot)} ${carrotName}` },
    { k: "savings", cents: d.savings, bg: { background: T.ink }, label: `${usd(d.savings)} ${d.savingsLabel.toLowerCase().slice(0, 18)}` },
    { k: "give", cents: d.pledged, bg: { backgroundImage: HATCH }, label: `${usd(d.pledged, { always2: true })} to give` },
  ].filter((p) => p.cents > 0);
  const savingsPct = d.savingsTarget ? Math.min(100, Math.floor((d.savingsTotal / d.savingsTarget) * 100)) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ ...type, fontSize: s(20), color: T.ink2 }}>kept this week</div>
        <div style={{ ...display, fontSize: s(56) }}>{usd(d.kept)}</div>
      </div>
      <div style={{ display: "flex", height: s(30), marginTop: s(10), border: `${s(3)}px solid ${T.ink}`, background: T.receipt, padding: s(2) }}>
        {total === 0 ? (
          <div style={{ display: "flex", flex: 1 }} />
        ) : (
          parts.map((p, i) => <div key={p.k} style={{ display: "flex", width: `${(p.cents / total) * 100}%`, marginLeft: i ? s(3) : 0, ...p.bg }} />)
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", marginTop: s(10), fontFamily: "Plex", fontSize: s(19) }}>
        {parts.map((p) => (
          <span key={p.k} style={{ display: "flex", alignItems: "center", marginRight: s(18), marginTop: s(2) }}>
            <span style={{ display: "flex", width: s(14), height: s(14), border: `${s(2)}px solid ${T.ink}`, marginRight: s(7), ...p.bg }} />
            <span style={{ fontWeight: p.k === "give" ? 700 : 400 }}>{p.label}</span>
          </span>
        ))}
      </div>
      {d.biggest && (
        <div style={{ display: "flex", alignItems: "center", marginTop: s(16), fontFamily: "Plex", fontSize: s(21) }}>
          <span style={{ marginRight: s(10) }}>Biggest no:</span>
          <span style={{ background: T.ink, color: T.paper, padding: `0 ${s(6)}px` }}>{d.biggest.item.slice(0, 28)}</span>
          <span style={{ marginLeft: s(10) }}>{`(${usd(d.biggest.cents)})`}</span>
        </div>
      )}
      {d.charities.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", marginTop: s(14), paddingTop: s(12), borderTop: `${s(3)}px dashed ${T.ink}`, fontFamily: "Plex", fontSize: s(20) }}>
          {d.charities.slice(0, 3).map((c) => (
            <div key={c.name} style={{ display: "flex", justifyContent: "space-between", marginTop: s(3) }}>
              <span style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: s(10), height: s(10), background: T.hot, marginRight: s(10) }} />
                <span>{`${c.name}${c.impact ? ` (${c.impact})` : ""}`}</span>
              </span>
              <span style={{ fontWeight: 700 }}>{usd(c.cents, { always2: true })}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", marginTop: s(16), paddingTop: s(12), borderTop: `${s(3)}px solid ${T.ink}` }}>
        {d.goal && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, marginRight: s(20) }}>
            <div style={{ ...type, fontSize: s(17), color: T.ink2 }}>{d.goal.funded ? "funded" : "saying yes to"}</div>
            <div style={{ ...display, fontSize: s(26), marginTop: s(4) }}>{`${d.goal.label.slice(0, 14)}: ${d.goal.pct}%`}</div>
            <div style={{ display: "flex", height: s(16), marginTop: s(8), border: `${s(3)}px solid ${T.ink}` }}>
              <div style={{ display: "flex", width: `${d.goal.pct}%`, background: T.hot }} />
            </div>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ ...type, fontSize: s(17), color: T.ink2 }}>{d.savingsLabel.toLowerCase().slice(0, 22)}</div>
          <div style={{ ...display, fontSize: s(26), marginTop: s(4) }}>{savingsPct != null ? `${usd(d.savingsTotal)}: ${savingsPct}%` : `${usd(d.savingsTotal)} saved`}</div>
          <div style={{ display: "flex", height: s(16), marginTop: s(8), border: `${s(3)}px solid ${T.ink}` }}>
            <div style={{ display: "flex", width: `${savingsPct ?? 100}%`, background: savingsPct != null ? T.ink : "transparent" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Masthead({ d, scale }: { d: PublicIssue; scale: number }) {
  const s = (n: number) => Math.round(n * scale);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", ...type, fontSize: s(22) }}>
        <span>Not Buying</span>
        <span style={{ color: T.ink2 }}>{d.range}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <span style={{ ...display, fontSize: s(16), letterSpacing: "0.2em" }}>Issue</span>
        <span style={{ ...display, fontSize: s(84) }}>{d.issue}</span>
      </div>
    </div>
  );
}

function Headline({ d, big }: { d: PublicIssue; big: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ ...type, fontSize: big * 0.2, color: T.ink2 }}>{`${d.who} said`}</div>
      <div style={{ display: "flex", alignItems: "flex-end", ...display, fontSize: big }}>
        <span style={{ marginRight: big * 0.22 }}>no</span>
        <span style={{ display: "flex", background: T.hotDeep, color: T.hotDeepInk, padding: `${big * 0.02}px ${big * 0.12}px ${big * 0.06}px`, transform: "rotate(1.5deg)" }}>{String(d.count)}</span>
      </div>
      <div style={{ ...display, fontSize: big * 0.42, marginTop: big * 0.06 }}>{`time${d.count === 1 ? "" : "s"} this week.`}</div>
    </div>
  );
}

/** 1200x630 landscape: headline left, receipt right. */
export async function landscape(d: PublicIssue) {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: T.paper, ...halftone, color: T.ink, padding: 40 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560, paddingRight: 36 }}>
          <div style={{ display: "flex", ...type, fontSize: 24 }}>
            <span style={{ background: T.ink, color: T.paper, padding: "4px 12px", transform: "rotate(-1.2deg)" }}>{`Issue ${d.issue} · ${d.range}`}</span>
          </div>
          <Headline d={d} big={176} />
          <div style={{ display: "flex" }}><Stamp size={26} /></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, background: T.receipt, padding: 32, boxShadow: `0 2px 0 ${T.ink}, 14px 14px 0 ${T.hot}`, transform: "rotate(1deg)" }}>
          <Masthead d={d} scale={0.8} />
          <div style={{ display: "flex", marginTop: 18, paddingTop: 22, borderTop: `3px solid ${T.ink}` }}>
            <Ledger d={{ ...d, charities: d.charities.slice(0, 2) }} scale={0.9} />
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await fonts() },
  );
}

/** 1080x1350 portrait: the whole card, sized for a feed or a story. */
export async function portrait(d: PublicIssue) {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: T.paper, ...halftone, color: T.ink, padding: 64, alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: T.receipt, padding: 56, boxShadow: `0 2px 0 ${T.ink}, 18px 18px 0 ${T.hot}`, transform: "rotate(-0.8deg)", position: "relative" }}>
          <Masthead d={d} scale={1.2} />
          <div style={{ display: "flex", marginTop: 24, paddingTop: 32, borderTop: `4px solid ${T.ink}` }}>
            <Headline d={d} big={230} />
          </div>
          <div style={{ display: "flex", marginTop: 70 }}>
            <Ledger d={d} scale={1.25} />
          </div>
          <div style={{ display: "flex", position: "absolute", right: 70, top: 640 }}><Stamp size={30} /></div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, fonts: await fonts() },
  );
}

export async function notFoundImage(w: number, h: number) {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: T.paper, ...halftone, color: T.ink, alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...display, fontSize: 120 }}>Not</div>
        <div style={{ ...display, fontSize: 120, background: T.hotDeep, color: T.hotDeepInk, padding: "0 24px" }}>Buying</div>
        <div style={{ ...type, fontSize: 34, marginTop: 30 }}>Every no is a yes to something.</div>
      </div>
    ),
    { width: w, height: h, fonts: await fonts() },
  );
}
