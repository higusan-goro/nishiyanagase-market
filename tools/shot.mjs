// 見た目確認用のスクリーンショット撮影。
// 使い方: node tools/shot.mjs <index.htmlのあるフォルダ> <保存先> [lightbox]
// Chrome をデバッグ接続で起動し、端末幅を正確に指定してページ全体を撮影する
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const [stage, out, mode] = process.argv.slice(2).map((v, i) => (i < 2 ? resolve(v) : v));
mkdirSync(out, { recursive: true });
const port = 9300 + Math.floor(Math.random() * 500);
const profile = join(out, "profile");
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars",
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page"); }
  catch { await sleep(200); }
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const n = ++id; pending.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const evalJs = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;

await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
const url = pathToFileURL(join(stage, "index.html")).href;
const widths = mode === "lightbox" ? [1280] : [375, 768, 1280];
for (const w of widths) {
  const h = mode === "lightbox" ? 900 : 800;
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 600 });
  await send("Page.navigate", { url });
  // 読み込み完了とWebフォント読み込み完了を待つ
  await evalJs(`new Promise(r=>{const go=()=>document.fonts.ready.then(()=>setTimeout(r,800));document.readyState==='complete'?go():addEventListener('load',go)})`);
  if (mode === "lightbox") {
    await evalJs(`document.querySelector('.zoom').click(); new Promise(r=>setTimeout(r,500))`);
    const state = await evalJs(`JSON.stringify({open:document.getElementById('lightbox').getAttribute('open-state'),src:document.getElementById('lightboxImg').getAttribute('src').slice(0,40),cap:document.getElementById('lightboxCap').textContent})`);
    console.log("lightbox", state);
  }
  const full = mode !== "lightbox";
  const height = full ? await evalJs("document.documentElement.scrollHeight") : h;
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: full, clip: { x: 0, y: 0, width: w, height, scale: 1 } });
  writeFileSync(join(out, `${mode === "lightbox" ? "lb-" : ""}${w}.png`), Buffer.from(shot.result.data, "base64"));
  const sw = await evalJs("document.documentElement.scrollWidth");
  console.log(`saved ${w}px  高さ${height}px  横幅${sw}px${sw > w ? " ←横はみ出し" : ""}`);
}
ws.close(); chrome.kill(); await sleep(500);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
