// import { useState, useEffect, useRef, useCallback } from "react";

// // ─── data ────────────────────────────────────────────────────────────────────
// const DATA  = ["A1","A2","A3","A4","A5"];
// const WGHT  = ["W1","W2","W3","W4","W5"];
// const MSGS  = [
//   "Cycle 1 — A1 loads into R1, W1 loads into R2. W2·A2 waiting in memory.",
//   "Cycle 2 — W1·A1 reaches Multiplier & XOR. A2→R1, W2→R2.",
//   "Cycle 3 — W1·A1 result enters R3. W2·A2 in Mul+XOR. A3→R1, W3→R2. All 3 stages active!",
//   "Cycle 4 — W1·A1 accumulates in R4. W2·A2→R3. W3·A3 in Mul+XOR. A4→R1, W4→R2.",
//   "Cycle 5 — W2·A2 in R4. W3·A3→R3. W4·A4 in Mul+XOR. A5→R1, W5→R2.",
//   "Cycle 6 — W3·A3 in R4. W4·A4→R3. W5·A5 in Mul+XOR. New result every cycle!",
//   "Cycle 7 — W4·A4 in R4. W5·A5→R3. Pipeline draining.",
//   "Pipeline complete — n+2 total cycles for n data sets.",
// ];

// const SPEED_MAP = { 1: 4000, 2: 2600, 3: 1600, 4: 900, 5: 450 };
// const SPEED_LBL = { 1: "very slow", 2: "slow", 3: "medium", 4: "fast", 5: "faster" };

// // ─── stage state ─────────────────────────────────────────────────────────────
// function getStageState(step) {
//   if (step < 0) return {};
//   const stages = {};
//   for (let di = 0; di < DATA.length; di++) {
//     const si = step - di;
//     if (si >= 0 && si <= 3) stages[si] = di;
//   }
//   const c1di  = stages[0];
//   const c2di  = stages[1];
//   const c3di  = stages[2];
//   const c3adi = stages[3];

//   let accStr = "";
//   if (c3adi !== undefined)
//     for (let k = 0; k <= c3adi; k++)
//       accStr += (k > 0 ? "+" : "") + DATA[k] + "·" + WGHT[k];

//   return {
//     r1:  c1di  !== undefined ? DATA[c1di]                       : null,
//     r2:  c1di  !== undefined ? WGHT[c1di]                       : null,
//     mul: c2di  !== undefined ? `${DATA[c2di]}×${WGHT[c2di]}`   : null,
//     xor: c2di  !== undefined ? "sign XOR"                       : null,
//     r3:  c3di  !== undefined ? `${DATA[c3di]}·${WGHT[c3di]}`   : null,
//     add: c3adi !== undefined ? `${DATA[c3adi]}·${WGHT[c3adi]}` : null,
//     r4:  c3adi !== undefined ? accStr                            : null,
//     hlR1:  c1di  !== undefined,
//     hlR2:  c1di  !== undefined,
//     hlMul: c2di  !== undefined,
//     hlXor: c2di  !== undefined,
//     hlR3:  c3di  !== undefined,
//     hlAdd: c3adi !== undefined,
//     hlR4:  c3adi !== undefined,
//   };
// }

// // ─── helpers ─────────────────────────────────────────────────────────────────
// function Highlight({ x, y, w, h, r, active, color }) {
//   const style = { opacity: active ? 0.8 : 0, transition: "opacity 0.4s" };
//   if (r) return <circle cx={r.cx} cy={r.cy} r={r.r} fill="none" stroke={color} strokeWidth={2.5} style={style} />;
//   return <rect x={x} y={y} width={w} height={h} rx={10} fill="none" stroke={color} strokeWidth={2.5} style={style} />;
// }

// function ValBadge({ cx, cy, value, bgColor }) {
//   const show = !!value;
//   const w = Math.max((value || "").length * 7 + 16, 80);
//   const style = { opacity: show ? 1 : 0, transition: "opacity 0.4s" };
//   return (
//     <>
//       <rect x={cx - w / 2} y={cy - 11} width={w} height={22} rx={4} fill={bgColor} style={style} />
//       <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
//         fontSize={11} fontWeight={600} fontFamily="monospace" fill="white" style={style}>
//         {value || ""}
//       </text>
//     </>
//   );
// }

// function ArrowDef() {
//   return (
//     <defs>
//       <marker id="ah" viewBox="0 0 10 10" refX={8} refY={5}
//         markerWidth={5} markerHeight={5} orient="auto-start-reverse">
//         <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke"
//           strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
//       </marker>
//     </defs>
//   );
// }

// // ─── main ─────────────────────────────────────────────────────────────────────
// export default function FMAPipeline() {
//   const [step, setStep]       = useState(-1);
//   const [playing, setPlaying] = useState(false);
//   const [speed, setSpeed]     = useState(2);
//   const rafRef      = useRef(null);
//   const lastTickRef = useRef(null);
//   const playingRef  = useRef(false);
//   const MAX_STEP = 7;

//   const st   = getStageState(step);
//   const info = step >= 0 ? MSGS[Math.min(step, MSGS.length - 1)] : "Starting pipeline…";

//   useEffect(() => { playingRef.current = playing; }, [playing]);

//   const tick = useCallback((ts) => {
//     if (!playingRef.current) return;
//     if (!lastTickRef.current) lastTickRef.current = ts;
//     if (ts - lastTickRef.current >= SPEED_MAP[speed]) {
//       lastTickRef.current = ts;
//       setStep(prev => {
//         const next = prev + 1;
//         if (next >= MAX_STEP) return MAX_STEP;
//         return next;
//       });
//     }
//     rafRef.current = requestAnimationFrame(tick);
//   }, [speed]);

//   useEffect(() => {
//     if (playing) { lastTickRef.current = null; rafRef.current = requestAnimationFrame(tick); }
//     else cancelAnimationFrame(rafRef.current);
//     return () => cancelAnimationFrame(rafRef.current);
//   }, [playing, tick]);

//   // ── auto-run on mount ───────────────────────────────────────────────────────
//   useEffect(() => {
//     setStep(0);
//     setPlaying(true);
//   }, []);

//   // ── auto-loop: when finished, pause briefly then restart from cycle 1 ──────
//   useEffect(() => {
//     if (step === MAX_STEP && playingRef.current) {
//       const t = setTimeout(() => {
//         lastTickRef.current = null;
//         setStep(0);
//       }, 1800);
//       return () => clearTimeout(t);
//     }
//   }, [step]);

//   function togglePlay() {
//     if (!playing && step < 0) setStep(0);
//     setPlaying(p => !p);
//   }
//   function doReset() {
//     setPlaying(false);
//     cancelAnimationFrame(rafRef.current);
//     setStep(-1);
//     lastTickRef.current = null;
//   }

//   // ── layout ─────────────────────────────────────────────────────────────────
//   //
//   // SVG: 800 × 560
//   //
//   // R1, MUL (×), and R2 sit on the same vertical line (cx = 230):
//   //   R1  — top
//   //   MUL — middle   (arrows: R1 ↓ MUL, R2 ↑ MUL  — "15 bits mantissa")
//   //   R2  — bottom
//   //
//   // XOR sits above-right of R1, feeding sign bit into R3.
//   // R3 sits to the right of MUL (same row), R4 below R3.
//   // ADD (+) sits to the right of R3 / R4.
//   //
//   const R1  = { x: 120, y: 30,  w: 180, h: 70 };   // blue
//   const R2  = { x: 120, y: 430, w: 180, h: 70 };   // orange-red
//   const MUL = { cx: 210, cy: 245, r: 30 };          // yellow ×
//   const XOR = { cx: 390, cy: 110, r: 26 };          // gray XOR
//   const R3  = { x: 440, y: 210, w: 170, h: 70 };   // purple
//   const ADD = { cx: 730, cy: 300, r: 28 };          // yellow +
//   const R4  = { x: 440, y: 380, w: 170, h: 70 };   // green

//   // derived centres
//   const R1cx = R1.x + R1.w / 2;   // 230
//   const R1cy = R1.y + R1.h / 2;   // 65
//   const R2cx = R2.x + R2.w / 2;   // 230
//   const R2cy = R2.y + R2.h / 2;   // 465
//   const R3cx = R3.x + R3.w / 2;   // 610
//   const R3cy = R3.y + R3.h / 2;   // 245
//   const R4cx = R4.x + R4.w / 2;   // 610
//   const R4cy = R4.y + R4.h / 2;   // 415

//   return (
//     <div style={{ fontFamily: "sans-serif", maxWidth: 820, margin: "0 auto", padding: "12px 0" }}>
//       {/* Controls */}
//       <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
//         <button onClick={togglePlay} style={btnStyle}>{playing ? "⏸ Pause" : "▶ Play"}</button>
//         <button onClick={doReset}    style={btnStyle}>↺ Reset</button>
//         <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", fontSize: 13, color: "#666" }}>
//           Speed
//           <input type="range" min={1} max={5} step={1} value={speed}
//             onChange={e => { setSpeed(+e.target.value); lastTickRef.current = null; }}
//             style={{ width: 80 }} />
//           <span style={{ minWidth: 70 }}>{SPEED_LBL[speed]}</span>
//         </div>
//       </div>

//       {/* Info bar */}
//       <div style={{ fontSize: 13, color: "#555", minHeight: 20, marginBottom: 8, lineHeight: 1.5 }}>
//         {step >= 0 ? `● ${info}` : info}
//       </div>

//       {/* ── SVG ─────────────────────────────────────────────────────────────── */}
//       <svg viewBox="0 0 800 560" width="100%" role="img"
//         aria-label="FMA pipeline diagram" style={{ display: "block" }}>
//         <ArrowDef />

//         {/* FMA border */}
//         <rect x={4} y={4} width={792} height={552} rx={10}
//           fill="none" stroke="#ccc" strokeWidth={1} />
//         <text x={14} y={22} fontSize={11} fill="#aaa">Fused Multiply Add (FMA) Unit</text>

//         {/* ════════════════════════════════════════════════════════════════
//             INPUTS
//         ════════════════════════════════════════════════════════════════ */}

//         {/* — i label + arrow → R1 — */}
//         <rect x={16} y={R1cy - 18} width={30} height={36} rx={6} fill="#185FA5" />
//         <text x={31} y={R1cy} textAnchor="middle" dominantBaseline="central"
//           fontSize={14} fontWeight={700} fill="white">i</text>
//         <line x1={46} y1={R1cy} x2={R1.x} y2={R1cy}
//           stroke="#185FA5" strokeWidth={1.3} markerEnd="url(#ah)" />

//         {/* — j label + arrow → R2 — */}
//         <rect x={16} y={R2cy - 18} width={30} height={36} rx={6} fill="#993C1D" />
//         <text x={31} y={R2cy} textAnchor="middle" dominantBaseline="central"
//           fontSize={14} fontWeight={700} fill="white">j</text>
//         <line x1={46} y1={R2cy} x2={R2.x} y2={R2cy}
//           stroke="#993C1D" strokeWidth={1.3} markerEnd="url(#ah)" />

//         {/* ════════════════════════════════════════════════════════════════
//             R1 / MUL / R2 — SAME VERTICAL LINE
//         ════════════════════════════════════════════════════════════════ */}

//         {/* — R1 box — */}
//         <rect x={R1.x} y={R1.y} width={R1.w} height={R1.h} rx={8} fill="#185FA5" />
//         <text x={R1cx} y={R1.y + 22} textAnchor="middle" dominantBaseline="central"
//           fontSize={14} fontWeight={500} fill="white">R1 (16 bit)</text>
//         <text x={R1cx} y={R1.y + 42} textAnchor="middle" dominantBaseline="central"
//           fontSize={11} fill="#B5D4F4">Input / Activation (i)</text>

//         {/* — R2 box — */}
//         <rect x={R2.x} y={R2.y} width={R2.w} height={R2.h} rx={8} fill="#993C1D" />
//         <text x={R2cx} y={R2.y + 22} textAnchor="middle" dominantBaseline="central"
//           fontSize={14} fontWeight={500} fill="white">R2 (16 bit)</text>
//         <text x={R2cx} y={R2.y + 42} textAnchor="middle" dominantBaseline="central"
//           fontSize={11} fill="#F5C4B3">Weight (j)</text>

//         {/* — R1 bottom ↓ MUL top (15 bits mantissa) — */}
//         <line x1={R1cx} y1={R1.y + R1.h} x2={R1cx} y2={MUL.cy - MUL.r}
//           stroke="#888" strokeWidth={0.9} markerEnd="url(#ah)" />
//         <text x={R1cx + 12} y={(R1.y + R1.h + MUL.cy - MUL.r) / 2}
//           fontSize={10} fill="#888" textAnchor="start" dominantBaseline="central">15 bits mantissa</text>

//         {/* — R2 top ↑ MUL bottom (15 bits mantissa) — */}
//         <line x1={R2cx} y1={R2.y} x2={R2cx} y2={MUL.cy + MUL.r}
//           stroke="#888" strokeWidth={0.9} markerEnd="url(#ah)" />
//         <text x={R2cx + 12} y={(R2.y + MUL.cy + MUL.r) / 2}
//           fontSize={10} fill="#888" textAnchor="start" dominantBaseline="central">15 bits mantissa</text>

//         {/* — MUL circle — */}
//         <circle cx={MUL.cx} cy={MUL.cy} r={MUL.r} fill="#BA7517" />
//         <text x={MUL.cx} y={MUL.cy} textAnchor="middle" dominantBaseline="central"
//           fontSize={22} fontWeight={500} fill="white">×</text>

//         {/* ════════════════════════════════════════════════════════════════
//             SIGN BITS → XOR → R3
//         ════════════════════════════════════════════════════════════════ */}

//         {/* — R1 right → right → down → XOR top (sign bit) — */}
//         <line x1={R1.x + R1.w} y1={R1.y + 20} x2={XOR.cx} y2={R1.y + 20}
//           stroke="#888" strokeWidth={0.8} />
//         <line x1={XOR.cx} y1={R1.y + 20} x2={XOR.cx} y2={XOR.cy - XOR.r}
//           stroke="#888" strokeWidth={0.8} markerEnd="url(#ah)" />
//         <text x={(R1.x + R1.w + XOR.cx) / 2} y={R1.y + 12}
//           fontSize={10} fill="#888" textAnchor="middle">sign bit</text>

//         {/* — R2 right → right → up → XOR bottom (sign bit) — */}
//         <line x1={R2.x + R2.w} y1={R2.y + 20} x2={390} y2={R2.y + 20}
//           stroke="#888" strokeWidth={0.8} />
//         <line x1={390} y1={R2.y + 20} x2={390} y2={XOR.cy + XOR.r}
//           stroke="#888" strokeWidth={0.8} markerEnd="url(#ah)"/>
//         <text x={395} y={(R2.y + 30 + XOR.cy + XOR.r) / 2}
//           fontSize={10} fill="#888" textAnchor="start" dominantBaseline="central">sign bit</text>

//         {/* — XOR circle — */}
//         <circle cx={XOR.cx} cy={XOR.cy} r={XOR.r} fill="#5F5E5A" />
//         <text x={XOR.cx} y={XOR.cy} textAnchor="middle" dominantBaseline="central"
//           fontSize={12} fontWeight={500} fill="white">XOR</text>

//         {/* — XOR right → right → down → R3 top (sign bit) — */}
//         <line x1={XOR.cx + XOR.r} y1={XOR.cy} x2={R3cx} y2={XOR.cy}
//           stroke="#888" strokeWidth={0.8} />
//         <line x1={R3cx} y1={XOR.cy} x2={R3cx} y2={R3.y}
//           stroke="#888" strokeWidth={0.8} markerEnd="url(#ah)" />
//         <text x={(XOR.cx + XOR.r + R3cx) / 2} y={XOR.cy - 8}
//           fontSize={10} fill="#888" textAnchor="middle">sign bit</text>

//         {/* ════════════════════════════════════════════════════════════════
//             MUL → R3 (weighted input)
//         ════════════════════════════════════════════════════════════════ */}

//         {/* — MUL right → right → R3 left (weighted input 15b) — */}
//         <line x1={MUL.cx + MUL.r} y1={MUL.cy} x2={R3.x} y2={R3cy}
//           stroke="#BA7517" strokeWidth={0.9} markerEnd="url(#ah)" />
//         <text x={(MUL.cx + MUL.r + R3.x - 40 ) / 2} y={MUL.cy - 10}
//           fontSize={10} fill="#BA7517" textAnchor="middle">weighted input (15 bits)</text>

//         {/* — R3 box — */}
//         <rect x={R3.x} y={R3.y} width={R3.w} height={R3.h} rx={8} fill="#534AB7" />
//         <text x={R3cx} y={R3.y + 22} textAnchor="middle" dominantBaseline="central"
//           fontSize={14} fontWeight={500} fill="white">R3 (16 bit)</text>
//         <text x={R3cx} y={R3.y + 42} textAnchor="middle" dominantBaseline="central"
//           fontSize={11} fill="#CECBF6">Mul + XOR result</text>

//         {/* — R4 box — */}
//         <rect x={R4.x} y={R4.y} width={R4.w} height={R4.h} rx={8} fill="#3B6D11" />
//         <text x={R4cx} y={R4.y + 22} textAnchor="middle" dominantBaseline="central"
//           fontSize={14} fontWeight={500} fill="white">R4 (16 bit)</text>
//         <text x={R4cx} y={R4.y + 42} textAnchor="middle" dominantBaseline="central"
//           fontSize={11} fill="#C0DD97">Accumulated sum</text>

//         {/* ════════════════════════════════════════════════════════════════
//             ACCUMULATION — R3 + R4 → ADD → R4
//         ════════════════════════════════════════════════════════════════ */}

//         {/* — R3 right → right → down → ADD top (Product) — */}
//         <line x1={R3.x + R3.w} y1={R3cy} x2={ADD.cx} y2={R3cy}
//           stroke="#534AB7" strokeWidth={0.9} />
//         <line x1={ADD.cx} y1={R3cy} x2={ADD.cx} y2={ADD.cy - ADD.r}
//           stroke="#534AB7" strokeWidth={0.9} markerEnd="url(#ah)" />
//         <text x={(R3.x + R3.w + ADD.cx) / 2} y={R3cy - 8}
//           fontSize={10} fill="#534AB7" textAnchor="middle">Product</text>

//         {/* — R4 right → right → up → ADD right (Accumulated sum) — */}
//         <line x1={R4.x + R4.w} y1={R4cy + 10} x2={775} y2={R4cy + 10}
//           stroke="#3B6D11" strokeWidth={0.9} />
//         <line x1={775} y1={R4cy + 10} x2={775} y2={ADD.cy}
//           stroke="#3B6D11" strokeWidth={0.9} />
//         <line x1={775} y1={ADD.cy} x2={ADD.cx + ADD.r} y2={ADD.cy}
//           stroke="#3B6D11" strokeWidth={0.9} markerEnd="url(#ah)" />
//         <text x={R4.x + R4.w + 24} y={R4cy + 24}
//           fontSize={10} fill="#3B6D11" textAnchor="start">Accumulated sum</text>

//         {/* — ADD circle — */}
//         <circle cx={ADD.cx} cy={ADD.cy} r={ADD.r} fill="#BA7517" />
//         <text x={ADD.cx} y={ADD.cy} textAnchor="middle" dominantBaseline="central"
//           fontSize={20} fontWeight={500} fill="white">+</text>

//         {/* — ADD bottom → down → left → R4 right (Result) — */}
//         <line x1={ADD.cx} y1={ADD.cy + ADD.r} x2={ADD.cx} y2={R4cy - 10}
//           stroke="#BA7517" strokeWidth={0.9} />
//         <line x1={ADD.cx} y1={R4cy - 10} x2={R4.x + R4.w} y2={R4cy - 10}
//           stroke="#BA7517" strokeWidth={0.9} markerEnd="url(#ah)" />
//         <text x={(ADD.cx - 14 + R4.x + R4.w) / 2} y={R4cy - 18}
//           fontSize={10} fill="#BA7517" textAnchor="middle">Result</text>

//         {/* — output from R4 bottom — */}
//         <line x1={R4cx} y1={R4.y + R4.h} x2={R4cx} y2={540}
//           stroke="#3B6D11" strokeWidth={1.3} markerEnd="url(#ah)" />
//         <text x={R4cx} y={553} textAnchor="middle" fontSize={12} fill="#3B6D11">output</text>

//         {/* ════════════════════════════════════════════════════════════════
//             HIGHLIGHT RINGS
//         ════════════════════════════════════════════════════════════════ */}
//         <Highlight x={R1.x-3} y={R1.y-3} w={R1.w+6} h={R1.h+6} active={st.hlR1} color="#60B0FF" />
//         <Highlight x={R2.x-3} y={R2.y-3} w={R2.w+6} h={R2.h+6} active={st.hlR2} color="#FF7755" />
//         <Highlight r={{ cx: MUL.cx, cy: MUL.cy, r: MUL.r + 5 }} active={st.hlMul} color="#EFC040" />
//         <Highlight r={{ cx: XOR.cx, cy: XOR.cy, r: XOR.r + 5 }} active={st.hlXor} color="#C0C0BB" />
//         <Highlight x={R3.x-3} y={R3.y-3} w={R3.w+6} h={R3.h+6} active={st.hlR3} color="#9F99EE" />
//         <Highlight r={{ cx: ADD.cx, cy: ADD.cy, r: ADD.r + 5 }} active={st.hlAdd} color="#EFC040" />
//         <Highlight x={R4.x-3} y={R4.y-3} w={R4.w+6} h={R4.h+6} active={st.hlR4} color="#7EC840" />

//         {/* ════════════════════════════════════════════════════════════════
//             VALUE BADGES
//         ════════════════════════════════════════════════════════════════ */}
//         {/* R1 badge — below box */}
//         <ValBadge cx={R1cx} cy={R1.y + R1.h + 14} value={st.r1} bgColor="#185FA5" />
//         {/* R2 badge — above box */}
//         <ValBadge cx={R2cx} cy={R2.y - 14} value={st.r2} bgColor="#993C1D" />
//         {/* MUL badge — below circle */}
//         <ValBadge cx={MUL.cx} cy={MUL.cy + MUL.r + 14} value={st.mul} bgColor="#BA7517" />
//         {/* XOR badge — above circle */}
//         <ValBadge cx={XOR.cx} cy={XOR.cy - XOR.r - 14} value={st.xor} bgColor="#5F5E5A" />
//         {/* R3 badge — below box */}
//         <ValBadge cx={R3cx} cy={R3.y + R3.h + 14} value={st.r3} bgColor="#534AB7" />
//         {/* ADD badge — left of circle */}
//         <ValBadge cx={ADD.cx - ADD.r - 44} cy={ADD.cy} value={st.add} bgColor="#BA7517" />
//         {/* R4 badge — above box */}
//         <ValBadge cx={R4cx} cy={R4.y - 14} value={st.r4} bgColor="#3B6D11" />
//       </svg>
//     </div>
//   );
// }

// const btnStyle = {
//   fontSize: 13,
//   padding: "5px 16px",
//   cursor: "pointer",
//   border: "1px solid #ccc",
//   borderRadius: 6,
//   background: "white",
// };

import { useState, useEffect, useRef, useCallback } from "react";

// ─── data ────────────────────────────────────────────────────────────────────
const DATA  = ["A1","A2","A3","A4","A5"];
const WGHT  = ["W1","W2","W3","W4","W5"];
const MSGS  = [
  "Cycle 1 — A1 loads into R1, W1 loads into R2. W2·A2 waiting in memory.",
  "Cycle 2 — W1·A1 reaches Multiplier & XOR. A2→R1, W2→R2.",
  "Cycle 3 — W1·A1 result enters R3. W2·A2 in Mul+XOR. A3→R1, W3→R2. All 3 stages active!",
  "Cycle 4 — W1·A1 accumulates in R4. W2·A2→R3. W3·A3 in Mul+XOR. A4→R1, W4→R2.",
  "Cycle 5 — W2·A2 in R4. W3·A3→R3. W4·A4 in Mul+XOR. A5→R1, W5→R2.",
  "Cycle 6 — W3·A3 in R4. W4·A4→R3. W5·A5 in Mul+XOR. New result every cycle!",
  "Cycle 7 — W4·A4 in R4. W5·A5→R3. Pipeline draining.",
  "Pipeline complete — n+2 total cycles for n data sets.",
];

const SPEED_MAP = { 1: 4000, 2: 2600, 3: 1600, 4: 900, 5: 450 };
const SPEED_LBL = { 1: "very slow", 2: "slow", 3: "medium", 4: "fast", 5: "faster" };

// ─── stage state ─────────────────────────────────────────────────────────────
function getStageState(step) {
  if (step < 0) return {};
  const stages = {};
  for (let di = 0; di < DATA.length; di++) {
    const si = step - di;
    if (si >= 0 && si <= 3) stages[si] = di;
  }
  const c1di  = stages[0];
  const c2di  = stages[1];
  const c3di  = stages[2];
  const c3adi = stages[3];

  let accStr = "";
  if (c3adi !== undefined)
    for (let k = 0; k <= c3adi; k++)
      accStr += (k > 0 ? "+" : "") + DATA[k] + "·" + WGHT[k];

  return {
    r1:  c1di  !== undefined ? DATA[c1di]                       : null,
    r2:  c1di  !== undefined ? WGHT[c1di]                       : null,
    mul: c2di  !== undefined ? `${DATA[c2di]}×${WGHT[c2di]}`   : null,
    xor: c2di  !== undefined ? "sign XOR"                       : null,
    r3:  c3di  !== undefined ? `${DATA[c3di]}·${WGHT[c3di]}`   : null,
    add: c3adi !== undefined ? `${DATA[c3adi]}·${WGHT[c3adi]}` : null,
    r4:  c3adi !== undefined ? accStr                            : null,
    hlR1:  c1di  !== undefined,
    hlR2:  c1di  !== undefined,
    hlMul: c2di  !== undefined,
    hlXor: c2di  !== undefined,
    hlR3:  c3di  !== undefined,
    hlAdd: c3adi !== undefined,
    hlR4:  c3adi !== undefined,
  };
}

// ─── helper: accumulated string up to index k ─────────────────────────────────
function accStrUpTo(k) {
  let s = "";
  for (let i = 0; i <= k; i++) s += (i > 0 ? "+" : "") + DATA[i] + "·" + WGHT[i];
  return s;
}

// ─── helper: point along a multi-segment polyline at fraction t ───────────────
function pointAt(path, t) {
  if (path.length === 1) return path[0];
  const segLens = [];
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const dx = path[i + 1][0] - path[i][0];
    const dy = path[i + 1][1] - path[i][1];
    const l = Math.sqrt(dx * dx + dy * dy);
    segLens.push(l);
    total += l;
  }
  let target = Math.min(Math.max(t, 0), 1) * total;
  for (let i = 0; i < segLens.length; i++) {
    if (target <= segLens[i] || i === segLens.length - 1) {
      const frac = segLens[i] === 0 ? 0 : target / segLens[i];
      const cf = Math.min(Math.max(frac, 0), 1);
      const [x1, y1] = path[i];
      const [x2, y2] = path[i + 1];
      return [x1 + (x2 - x1) * cf, y1 + (y2 - y1) * cf];
    }
    target -= segLens[i];
  }
  return path[path.length - 1];
}

// ─── flying badge: a value travelling along an arrow path ─────────────────────
function FlyingBadge({ path, t, label, color }) {
  const [x, y] = pointAt(path, t);
  const opacity = Math.sin(Math.PI * Math.min(Math.max(t, 0), 1));
  if (opacity <= 0.01) return null;
  const w = Math.max((label || "").length * 7 + 16, 60);
  return (
    <g style={{ opacity }}>
      <rect x={x - w / 2} y={y - 11} width={w} height={22} rx={4} fill={color} />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={600} fontFamily="monospace" fill="white">
        {label}
      </text>
    </g>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function Highlight({ x, y, w, h, r, active, color }) {
  const style = { opacity: active ? 0.8 : 0, transition: "opacity 0.4s" };
  if (r) return <circle cx={r.cx} cy={r.cy} r={r.r} fill="none" stroke={color} strokeWidth={2.5} style={style} />;
  return <rect x={x} y={y} width={w} height={h} rx={10} fill="none" stroke={color} strokeWidth={2.5} style={style} />;
}

function ValBadge({ cx, cy, value, bgColor }) {
  const show = !!value;
  const w = Math.max((value || "").length * 7 + 16, 80);
  const style = { opacity: show ? 1 : 0, transition: "opacity 0.4s" };
  return (
    <>
      <rect x={cx - w / 2} y={cy - 11} width={w} height={22} rx={4} fill={bgColor} style={style} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={600} fontFamily="monospace" fill="white" style={style}>
        {value || ""}
      </text>
    </>
  );
}

function ArrowDef() {
  return (
    <defs>
      <marker id="ah" viewBox="0 0 10 10" refX={8} refY={5}
        markerWidth={5} markerHeight={5} orient="auto-start-reverse">
        <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke"
          strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </marker>
    </defs>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function FMAPipeline() {
  const [step, setStep]         = useState(-1);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying]   = useState(false);
  const [speed, setSpeed]       = useState(2);
  const rafRef      = useRef(null);
  const lastTickRef = useRef(null);
  const playingRef  = useRef(false);
  const MAX_STEP = 7;

  const st   = getStageState(step);
  const info = step >= 0 ? MSGS[Math.min(step, MSGS.length - 1)] : "Starting pipeline…";

  useEffect(() => { playingRef.current = playing; }, [playing]);

  const tick = useCallback((ts) => {
    if (!playingRef.current) return;
    if (!lastTickRef.current) lastTickRef.current = ts;
    const duration = SPEED_MAP[speed];
    const elapsed  = ts - lastTickRef.current;
    setProgress(Math.min(elapsed / duration, 1));
    if (elapsed >= duration) {
      lastTickRef.current = ts;
      setProgress(0);
      setStep(prev => {
        const next = prev + 1;
        if (next >= MAX_STEP) return MAX_STEP;
        return next;
      });
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [speed]);

  useEffect(() => {
    if (playing) { lastTickRef.current = null; rafRef.current = requestAnimationFrame(tick); }
    else cancelAnimationFrame(rafRef.current);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, tick]);

  // ── auto-run on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    setStep(0);
    setPlaying(true);
  }, []);

  // ── auto-loop: when finished, pause briefly then restart from cycle 1 ──────
  useEffect(() => {
    if (step === MAX_STEP && playingRef.current) {
      const t = setTimeout(() => {
        lastTickRef.current = null;
        setProgress(0);
        setStep(0);
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [step]);

  function togglePlay() {
    if (!playing && step < 0) setStep(0);
    setPlaying(p => !p);
  }
  function doReset() {
    setPlaying(false);
    cancelAnimationFrame(rafRef.current);
    setStep(-1);
    setProgress(0);
    lastTickRef.current = null;
  }

  // ── layout ─────────────────────────────────────────────────────────────────
  //
  // SVG: 800 × 560
  //
  // R1, MUL (×), and R2 sit on the same vertical line (cx = 230):
  //   R1  — top
  //   MUL — middle   (arrows: R1 ↓ MUL, R2 ↑ MUL  — "15 bits mantissa")
  //   R2  — bottom
  //
  // XOR sits above-right of R1, feeding sign bit into R3.
  // R3 sits to the right of MUL (same row), R4 below R3.
  // ADD (+) sits to the right of R3 / R4.
  //
  const R1  = { x: 120, y: 30,  w: 180, h: 70 };   // blue
  const R2  = { x: 120, y: 430, w: 180, h: 70 };   // orange-red
  const MUL = { cx: 210, cy: 245, r: 30 };          // yellow ×
  const XOR = { cx: 390, cy: 110, r: 26 };          // gray XOR
  const R3  = { x: 440, y: 210, w: 170, h: 70 };   // purple
  const ADD = { cx: 730, cy: 300, r: 28 };          // yellow +
  const R4  = { x: 440, y: 380, w: 170, h: 70 };   // green

  // derived centres
  const R1cx = R1.x + R1.w / 2;   // 210
  const R1cy = R1.y + R1.h / 2;   // 65
  const R2cx = R2.x + R2.w / 2;   // 210
  const R2cy = R2.y + R2.h / 2;   // 465
  const R3cx = R3.x + R3.w / 2;   // 525
  const R3cy = R3.y + R3.h / 2;   // 245
  const R4cx = R4.x + R4.w / 2;   // 525
  const R4cy = R4.y + R4.h / 2;   // 415

  // ── flights: values travelling along arrows toward the NEXT step ───────────
  const ns = step + 1; // the step about to be reached
  const flights = [];
  if (ns >= 0) {
    for (let si = 0; si <= 3; si++) {
      const di = ns - si;
      if (di < 0 || di >= DATA.length) continue;

      if (si === 0) {
        // input i → R1 (carries A_di), input j → R2 (carries W_di)
        flights.push({
          path: [[24, R1cy], [R1cx, R1cy], [R1cx, R1.y + R1.h + 14]],
          label: DATA[di], color: "#185FA5",
        });
        flights.push({
          path: [[24, R2cy], [R2cx, R2cy], [R2cx, R2.y - 14]],
          label: WGHT[di], color: "#993C1D",
        });
      } else if (si === 1) {
        // R1/R2 → MUL (mantissas) and R1/R2 → XOR (sign bits)
        flights.push({
          path: [[R1cx, R1.y + R1.h + 14], [R1cx, MUL.cy + MUL.r + 14]],
          label: DATA[di], color: "#185FA5",
        });
        flights.push({
          path: [[R2cx, R2.y - 14], [R2cx, MUL.cy + MUL.r + 14]],
          label: WGHT[di], color: "#993C1D",
        });
        flights.push({
          path: [[R1.x + R1.w, R1.y + 20], [XOR.cx, R1.y + 20], [XOR.cx, XOR.cy - XOR.r - 14]],
          label: "±", color: "#5F5E5A",
        });
        flights.push({
          path: [[R2.x + R2.w, R2.y + 20], [390, R2.y + 20], [390, XOR.cy + XOR.r], [XOR.cx, XOR.cy - XOR.r - 14]],
          label: "±", color: "#5F5E5A",
        });
      } else if (si === 2) {
        // MUL → R3 (product), XOR → R3 (sign)
        flights.push({
          path: [
            [MUL.cx, MUL.cy + MUL.r + 14],
            [MUL.cx + MUL.r + 20, MUL.cy],
            [R3.x, R3cy],
            [R3cx, R3.y + R3.h + 14],
          ],
          label: `${DATA[di]}×${WGHT[di]}`, color: "#BA7517",
        });
        flights.push({
          path: [
            [XOR.cx, XOR.cy - XOR.r - 14],
            [XOR.cx + XOR.r, XOR.cy],
            [R3cx, XOR.cy],
            [R3cx, R3.y],
            [R3cx, R3.y + R3.h + 14],
          ],
          label: "±", color: "#5F5E5A",
        });
      } else if (si === 3) {
        // R3 → ADD → R4 (new product joining the accumulator)
        flights.push({
          path: [
            [R3cx, R3.y + R3.h + 14],
            [R3.x + R3.w, R3cy],
            [ADD.cx, R3cy],
            [ADD.cx, ADD.cy - ADD.r],
            [ADD.cx - ADD.r - 44, ADD.cy],
            [ADD.cx, ADD.cy + ADD.r],
            [ADD.cx, R4cy - 10],
            [R4.x + R4.w, R4cy - 10],
            [R4cx, R4.y - 14],
          ],
          label: `${DATA[di]}·${WGHT[di]}`, color: "#534AB7",
        });
        // R4 → ADD → R4 (running total recycling back into the accumulator)
        if (di >= 1) {
          flights.push({
            path: [
              [R4cx, R4.y - 14],
              [R4.x + R4.w, R4cy + 10],
              [775, R4cy + 10],
              [775, ADD.cy],
              [ADD.cx + ADD.r, ADD.cy],
              [ADD.cx - ADD.r - 44, ADD.cy],
            ],
            label: accStrUpTo(di - 1), color: "#3B6D11",
          });
        }
      }
    }
  }

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 820, margin: "0 auto", padding: "12px 0" }}>
      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
        <button onClick={togglePlay} style={btnStyle}>{playing ? "⏸ Pause" : "▶ Play"}</button>
        <button onClick={doReset}    style={btnStyle}>↺ Reset</button>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", fontSize: 13, color: "#666" }}>
          Speed
          <input type="range" min={1} max={5} step={1} value={speed}
            onChange={e => { setSpeed(+e.target.value); lastTickRef.current = null; }}
            style={{ width: 80 }} />
          <span style={{ minWidth: 70 }}>{SPEED_LBL[speed]}</span>
        </div>
      </div>

      {/* Info bar */}
      <div style={{ fontSize: 13, color: "#555", minHeight: 20, marginBottom: 8, lineHeight: 1.5 }}>
        {step >= 0 ? `● ${info}` : info}
      </div>

      {/* ── SVG ─────────────────────────────────────────────────────────────── */}
      <svg viewBox="0 0 800 560" width="100%" role="img"
        aria-label="FMA pipeline diagram" style={{ display: "block" }}>
        <ArrowDef />

        {/* FMA border */}
        <rect x={4} y={4} width={792} height={552} rx={10}
          fill="none" stroke="#ccc" strokeWidth={1} />
        <text x={14} y={22} fontSize={11} fill="#aaa">Fused Multiply Add (FMA) Unit</text>

        {/* ════════════════════════════════════════════════════════════════
            INPUTS
        ════════════════════════════════════════════════════════════════ */}

        {/* — i label + arrow → R1 — */}
        <rect x={16} y={R1cy - 18} width={30} height={36} rx={6} fill="#185FA5" />
        <text x={31} y={R1cy} textAnchor="middle" dominantBaseline="central"
          fontSize={14} fontWeight={700} fill="white">i</text>
        <line x1={46} y1={R1cy} x2={R1.x} y2={R1cy}
          stroke="#185FA5" strokeWidth={1.3} markerEnd="url(#ah)" />

        {/* — j label + arrow → R2 — */}
        <rect x={16} y={R2cy - 18} width={30} height={36} rx={6} fill="#993C1D" />
        <text x={31} y={R2cy} textAnchor="middle" dominantBaseline="central"
          fontSize={14} fontWeight={700} fill="white">j</text>
        <line x1={46} y1={R2cy} x2={R2.x} y2={R2cy}
          stroke="#993C1D" strokeWidth={1.3} markerEnd="url(#ah)" />

        {/* ════════════════════════════════════════════════════════════════
            R1 / MUL / R2 — SAME VERTICAL LINE
        ════════════════════════════════════════════════════════════════ */}

        {/* — R1 box — */}
        <rect x={R1.x} y={R1.y} width={R1.w} height={R1.h} rx={8} fill="#185FA5" />
        <text x={R1cx} y={R1.y + 22} textAnchor="middle" dominantBaseline="central"
          fontSize={14} fontWeight={500} fill="white">R1 (16 bit)</text>
        <text x={R1cx} y={R1.y + 42} textAnchor="middle" dominantBaseline="central"
          fontSize={11} fill="#B5D4F4">Input / Activation (i)</text>

        {/* — R2 box — */}
        <rect x={R2.x} y={R2.y} width={R2.w} height={R2.h} rx={8} fill="#993C1D" />
        <text x={R2cx} y={R2.y + 22} textAnchor="middle" dominantBaseline="central"
          fontSize={14} fontWeight={500} fill="white">R2 (16 bit)</text>
        <text x={R2cx} y={R2.y + 42} textAnchor="middle" dominantBaseline="central"
          fontSize={11} fill="#F5C4B3">Weight (j)</text>

        {/* — R1 bottom ↓ MUL top (15 bits mantissa) — */}
        <line x1={R1cx} y1={R1.y + R1.h} x2={R1cx} y2={MUL.cy - MUL.r}
          stroke="#888" strokeWidth={0.9} markerEnd="url(#ah)" />
        <text x={R1cx + 12} y={(R1.y + R1.h + MUL.cy - MUL.r) / 2}
          fontSize={10} fill="#888" textAnchor="start" dominantBaseline="central">15 bits mantissa</text>

        {/* — R2 top ↑ MUL bottom (15 bits mantissa) — */}
        <line x1={R2cx} y1={R2.y} x2={R2cx} y2={MUL.cy + MUL.r}
          stroke="#888" strokeWidth={0.9} markerEnd="url(#ah)" />
        <text x={R2cx + 12} y={(R2.y + MUL.cy + MUL.r) / 2}
          fontSize={10} fill="#888" textAnchor="start" dominantBaseline="central">15 bits mantissa</text>

        {/* — MUL circle — */}
        <circle cx={MUL.cx} cy={MUL.cy} r={MUL.r} fill="#BA7517" />
        <text x={MUL.cx} y={MUL.cy} textAnchor="middle" dominantBaseline="central"
          fontSize={22} fontWeight={500} fill="white">×</text>

        {/* ════════════════════════════════════════════════════════════════
            SIGN BITS → XOR → R3
        ════════════════════════════════════════════════════════════════ */}

        {/* — R1 right → right → down → XOR top (sign bit) — */}
        <line x1={R1.x + R1.w} y1={R1.y + 20} x2={XOR.cx} y2={R1.y + 20}
          stroke="#888" strokeWidth={0.8} />
        <line x1={XOR.cx} y1={R1.y + 20} x2={XOR.cx} y2={XOR.cy - XOR.r}
          stroke="#888" strokeWidth={0.8} markerEnd="url(#ah)" />
        <text x={(R1.x + R1.w + XOR.cx) / 2} y={R1.y + 12}
          fontSize={10} fill="#888" textAnchor="middle">sign bit</text>

        {/* — R2 right → right → up → XOR bottom (sign bit) — */}
        <line x1={R2.x + R2.w} y1={R2.y + 20} x2={390} y2={R2.y + 20}
          stroke="#888" strokeWidth={0.8} />
        <line x1={390} y1={R2.y + 20} x2={390} y2={XOR.cy + XOR.r}
          stroke="#888" strokeWidth={0.8} markerEnd="url(#ah)"/>
        <text x={395} y={(R2.y + 30 + XOR.cy + XOR.r) / 2}
          fontSize={10} fill="#888" textAnchor="start" dominantBaseline="central">sign bit</text>

        {/* — XOR circle — */}
        <circle cx={XOR.cx} cy={XOR.cy} r={XOR.r} fill="#5F5E5A" />
        <text x={XOR.cx} y={XOR.cy} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={500} fill="white">XOR</text>

        {/* — XOR right → right → down → R3 top (sign bit) — */}
        <line x1={XOR.cx + XOR.r} y1={XOR.cy} x2={R3cx} y2={XOR.cy}
          stroke="#888" strokeWidth={0.8} />
        <line x1={R3cx} y1={XOR.cy} x2={R3cx} y2={R3.y}
          stroke="#888" strokeWidth={0.8} markerEnd="url(#ah)" />
        <text x={(XOR.cx + XOR.r + R3cx) / 2} y={XOR.cy - 8}
          fontSize={10} fill="#888" textAnchor="middle">sign bit</text>

        {/* ════════════════════════════════════════════════════════════════
            MUL → R3 (weighted input)
        ════════════════════════════════════════════════════════════════ */}

        {/* — MUL right → right → R3 left (weighted input 15b) — */}
        <line x1={MUL.cx + MUL.r} y1={MUL.cy} x2={R3.x} y2={R3cy}
          stroke="#BA7517" strokeWidth={0.9} markerEnd="url(#ah)" />
        <text x={(MUL.cx + MUL.r + R3.x - 40 ) / 2} y={MUL.cy - 10}
          fontSize={10} fill="#BA7517" textAnchor="middle">weighted input (15 bits)</text>

        {/* — R3 box — */}
        <rect x={R3.x} y={R3.y} width={R3.w} height={R3.h} rx={8} fill="#534AB7" />
        <text x={R3cx} y={R3.y + 22} textAnchor="middle" dominantBaseline="central"
          fontSize={14} fontWeight={500} fill="white">R3 (16 bit)</text>
        <text x={R3cx} y={R3.y + 42} textAnchor="middle" dominantBaseline="central"
          fontSize={11} fill="#CECBF6">Mul + XOR result</text>

        {/* — R4 box — */}
        <rect x={R4.x} y={R4.y} width={R4.w} height={R4.h} rx={8} fill="#3B6D11" />
        <text x={R4cx} y={R4.y + 22} textAnchor="middle" dominantBaseline="central"
          fontSize={14} fontWeight={500} fill="white">R4 (16 bit)</text>
        <text x={R4cx} y={R4.y + 42} textAnchor="middle" dominantBaseline="central"
          fontSize={11} fill="#C0DD97">Accumulated sum</text>

        {/* ════════════════════════════════════════════════════════════════
            ACCUMULATION — R3 + R4 → ADD → R4
        ════════════════════════════════════════════════════════════════ */}

        {/* — R3 right → right → down → ADD top (Product) — */}
        <line x1={R3.x + R3.w} y1={R3cy} x2={ADD.cx} y2={R3cy}
          stroke="#534AB7" strokeWidth={0.9} />
        <line x1={ADD.cx} y1={R3cy} x2={ADD.cx} y2={ADD.cy - ADD.r}
          stroke="#534AB7" strokeWidth={0.9} markerEnd="url(#ah)" />
        <text x={(R3.x + R3.w + ADD.cx) / 2} y={R3cy - 8}
          fontSize={10} fill="#534AB7" textAnchor="middle">Product</text>

        {/* — R4 right → right → up → ADD right (Accumulated sum) — */}
        <line x1={R4.x + R4.w} y1={R4cy + 10} x2={775} y2={R4cy + 10}
          stroke="#3B6D11" strokeWidth={0.9} />
        <line x1={775} y1={R4cy + 10} x2={775} y2={ADD.cy}
          stroke="#3B6D11" strokeWidth={0.9} />
        <line x1={775} y1={ADD.cy} x2={ADD.cx + ADD.r} y2={ADD.cy}
          stroke="#3B6D11" strokeWidth={0.9} markerEnd="url(#ah)" />
        <text x={R4.x + R4.w + 24} y={R4cy + 24}
          fontSize={10} fill="#3B6D11" textAnchor="start">Accumulated sum</text>

        {/* — ADD circle — */}
        <circle cx={ADD.cx} cy={ADD.cy} r={ADD.r} fill="#BA7517" />
        <text x={ADD.cx} y={ADD.cy} textAnchor="middle" dominantBaseline="central"
          fontSize={20} fontWeight={500} fill="white">+</text>

        {/* — ADD bottom → down → left → R4 right (Result) — */}
        <line x1={ADD.cx} y1={ADD.cy + ADD.r} x2={ADD.cx} y2={R4cy - 10}
          stroke="#BA7517" strokeWidth={0.9} />
        <line x1={ADD.cx} y1={R4cy - 10} x2={R4.x + R4.w} y2={R4cy - 10}
          stroke="#BA7517" strokeWidth={0.9} markerEnd="url(#ah)" />
        <text x={(ADD.cx - 14 + R4.x + R4.w) / 2} y={R4cy - 18}
          fontSize={10} fill="#BA7517" textAnchor="middle">Result</text>

        {/* — output from R4 bottom — */}
        <line x1={R4cx} y1={R4.y + R4.h} x2={R4cx} y2={540}
          stroke="#3B6D11" strokeWidth={1.3} markerEnd="url(#ah)" />
        <text x={R4cx} y={553} textAnchor="middle" fontSize={12} fill="#3B6D11">output</text>

        {/* ════════════════════════════════════════════════════════════════
            HIGHLIGHT RINGS
        ════════════════════════════════════════════════════════════════ */}
        <Highlight x={R1.x-3} y={R1.y-3} w={R1.w+6} h={R1.h+6} active={st.hlR1} color="#60B0FF" />
        <Highlight x={R2.x-3} y={R2.y-3} w={R2.w+6} h={R2.h+6} active={st.hlR2} color="#FF7755" />
        <Highlight r={{ cx: MUL.cx, cy: MUL.cy, r: MUL.r + 5 }} active={st.hlMul} color="#EFC040" />
        <Highlight r={{ cx: XOR.cx, cy: XOR.cy, r: XOR.r + 5 }} active={st.hlXor} color="#C0C0BB" />
        <Highlight x={R3.x-3} y={R3.y-3} w={R3.w+6} h={R3.h+6} active={st.hlR3} color="#9F99EE" />
        <Highlight r={{ cx: ADD.cx, cy: ADD.cy, r: ADD.r + 5 }} active={st.hlAdd} color="#EFC040" />
        <Highlight x={R4.x-3} y={R4.y-3} w={R4.w+6} h={R4.h+6} active={st.hlR4} color="#7EC840" />

        {/* ════════════════════════════════════════════════════════════════
            VALUE BADGES
        ════════════════════════════════════════════════════════════════ */}
        {/* R1 badge — below box */}
        <ValBadge cx={R1cx} cy={R1.y + R1.h + 14} value={st.r1} bgColor="#185FA5" />
        {/* R2 badge — above box */}
        <ValBadge cx={R2cx} cy={R2.y - 14} value={st.r2} bgColor="#993C1D" />
        {/* MUL badge — below circle */}
        <ValBadge cx={MUL.cx} cy={MUL.cy + MUL.r + 14} value={st.mul} bgColor="#BA7517" />
        {/* XOR badge — above circle */}
        <ValBadge cx={XOR.cx} cy={XOR.cy - XOR.r - 14} value={st.xor} bgColor="#5F5E5A" />
        {/* R3 badge — below box */}
        <ValBadge cx={R3cx} cy={R3.y + R3.h + 14} value={st.r3} bgColor="#534AB7" />
        {/* ADD badge — left of circle */}
        <ValBadge cx={ADD.cx - ADD.r - 44} cy={ADD.cy} value={st.add} bgColor="#BA7517" />
        {/* R4 badge — above box */}
        <ValBadge cx={R4cx} cy={R4.y - 14} value={st.r4} bgColor="#3B6D11" />

        {/* ════════════════════════════════════════════════════════════════
            FLYING BADGES — values travelling along the arrows
        ════════════════════════════════════════════════════════════════ */}
        {flights.map((f, i) => (
          <FlyingBadge key={i} path={f.path} t={progress} label={f.label} color={f.color} />
        ))}
      </svg>
    </div>
  );
}

const btnStyle = {
  fontSize: 13,
  padding: "5px 16px",
  cursor: "pointer",
  border: "1px solid #ccc",
  borderRadius: 6,
  background: "white",
};