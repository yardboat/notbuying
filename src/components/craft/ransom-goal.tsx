/**
 * Ransom-note goal: the goal itself, spelled in letters cut from receipts.
 * Each letter is pasted down once progress passes its share of the target;
 * unearned letters sit as pencil traces. Pure markup + CSS (see globals.css,
 * "craft: ransom goal"), so it renders fully on the server and without JS.
 */

const BGS = ["receipt", "receipt", "ink", "paper2", "receipt", "news"] as const;
const FONTS = ["display", "type", "mono", "display", "type"] as const;
const FINE = ["SUBTOTAL", "THANK YOU", "QTY 1", "TOTAL", "CHANGE", "ITEM 004", "VOID", "TAX 0.00"];

// Small deterministic hash so every render (server + client) cuts the same scraps.
function h(i: number, c: string) {
  let x = (i + 1) * 2654435761 + c.charCodeAt(0) * 40503;
  x = (x ^ (x >>> 13)) >>> 0;
  return x;
}

function jag(seed: number) {
  // Scissor-cut quad: each corner nudged inward 0–9%.
  const r = (k: number) => ((seed >>> (k * 3)) & 7) * 1.2;
  return `polygon(${r(0)}% ${r(1)}%, ${100 - r(2)}% ${r(3)}%, ${100 - r(4)}% ${100 - r(5)}%, ${r(6)}% ${100 - r(7)}%)`;
}

export type Scrap = { ch: string; index: number };

export function splitWords(label: string): Scrap[][] {
  let n = 0;
  return label
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => Array.from(w).map((ch) => ({ ch, index: n++ })));
}

export default function RansomGoal({
  label,
  pasted,
  animate,
  stepMs,
}: {
  label: string;
  /** how many letters are earned */
  pasted: number;
  /** play the paste-in sequence (client, motion allowed) */
  animate: boolean;
  stepMs: number;
}) {
  const words = splitWords(label);
  const total = words.reduce((a, w) => a + w.length, 0);
  // Size letters so the longest word fits one line of the container.
  const longest = Math.max(1, ...words.map((w) => w.length));
  const size = `clamp(1.5rem, calc(100cqw / ${(longest * 0.95 + 0.6).toFixed(2)}), ${total <= 6 ? "6.5rem" : "4.75rem"})`;

  return (
    <div className="rn" aria-hidden="true" style={{ ["--rn-size" as string]: size }}>
      {words.map((w, wi) => (
        <span key={wi} className="rn-word">
          {w.map(({ ch, index }) => {
            const s = h(index, ch);
            const on = index < pasted;
            const latest = on && index === pasted - 1;
            const bg = latest ? "hot" : BGS[s % BGS.length];
            const font = FONTS[(s >>> 5) % FONTS.length];
            const rot = ((s >>> 9) % 13) - 6;
            const dy = ((s >>> 13) % 9) - 4;
            const lower = font !== "display" && ((s >>> 17) & 1) === 1;
            return (
              <span
                key={index}
                className={`rn-scrap rn-${bg} rn-f-${font} ${on ? "is-on" : "is-off"} ${on && animate ? "rn-paste" : ""} ${latest ? "is-latest" : ""}`}
                style={{
                  ["--rn-rot" as string]: `${rot}deg`,
                  ["--rn-dy" as string]: `${dy}px`,
                  ["--rn-delay" as string]: `${index * stepMs}ms`,
                  clipPath: on ? jag(s) : undefined,
                }}
              >
                {on && <span className="rn-fine">{FINE[s % FINE.length]} ${((s % 4000) / 100).toFixed(2)}</span>}
                <span className="rn-ch">{lower ? ch.toLowerCase() : ch.toUpperCase()}</span>
                {latest && <span className="rn-tape" />}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
}
