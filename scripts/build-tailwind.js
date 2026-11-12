/**
 * scripts/build-tailwind.js
 * FASE 2 (P1): mengganti Tailwind Play CDN pada WebApp.html dengan CSS hasil
 * kompilasi (inline) agar aplikasi berhenti bergantung pada CDN saat produksi
 * (GAS HtmlService tidak bisa menyajikan berkas lokal, sehingga CSS dikompilasi
 * lalu ditanam langsung ke <head>).
 *
 * Pemakaian: npm run css:build
 * - Sumber konfigurasi Tailwind dibaca dari blok `tailwind.config = {...}`
 *   yang ada di WebApp.html, sehingga tidak ada konfigurasi kembar.
 * - Setiap penambahan class Tailwind baru di WebApp.html WAJIB diikuti
 *   `npm run css:build` (dicek QC-CDN-01).
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const APP_FILE = path.join(ROOT, "WebApp.html");
const TW_VERSION = require("tailwindcss/package.json").version;

async function main() {
  let html = fs.readFileSync(APP_FILE, "utf8");

  // 1. Sumber konfigurasi Tailwind: scripts/tailwind.config.js (kanonik).
  //    Bila WebApp.html masih memuat blok CDN + `tailwind.config = {...}`
  //    (kondisi pertama kali), blok tersebut diekstrak & menimpa file config
  //    agar tidak ada dua sumber kebenaran.
  const CONFIG_FILE = path.join(__dirname, "tailwind.config.js");
  const cfgStart = html.indexOf("tailwind.config = {");
  if (cfgStart !== -1) {
    const cfgEnd = html.indexOf("};", cfgStart);
    if (cfgEnd === -1) throw new Error("Blok tailwind.config tidak tertutup");
    const configJs = html.slice(cfgStart, cfgEnd + 2)
      .replace("tailwind.config", "").replace("=", "").trim().replace(/;$/, "");
    fs.writeFileSync(CONFIG_FILE, "module.exports = " + configJs + ";\n", "utf8");
  }
  const configObj = require(CONFIG_FILE);

  // 2. Kompilasi (via API Tailwind v3; tanpa spawn .cmd) lalu minify ringan.
  const tailwindcss = require("tailwindcss");
  const postcss = require("postcss");
  configObj.content = [path.join(ROOT, "WebApp.html")];
  const result = await postcss([tailwindcss(configObj)]).process(
    "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n",
    { from: undefined }
  );
  const css = result.css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*\n\s*/g, "")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .trim();

  // 3. Tanam/segarkan blok <style> hasil kompilasi.
  const styleMarker = "<!-- Tailwind v";
  const styleIdx = html.indexOf(styleMarker);
  const styleBlock =
    styleMarker + TW_VERSION + " dikompilasi inline (tanpa CDN). Regenerasi: npm run css:build -->\n" +
    "  <style>\n" + css + "\n  </style>";

  if (styleIdx !== -1) {
    const styleOpen = html.indexOf("<style>", styleIdx);
    const styleClose = html.indexOf("</style>", styleOpen);
    if (styleOpen === -1 || styleClose === -1) throw new Error("Blok <style> Tailwind rusak");
    html = html.slice(0, styleIdx) + styleBlock + html.slice(styleClose + "</style>".length);
  } else {
    const cdnTag = '<script src="https://cdn.tailwindcss.com"></script>';
    const cdnIdx = html.indexOf(cdnTag);
    if (cdnIdx === -1) throw new Error("Tag CDN Tailwind tidak ditemukan (sudah dikompilasi?)");
    const cfgScriptStart = html.indexOf("<script>", cdnIdx);
    const scriptEnd = html.indexOf("</script>", cfgScriptStart);
    if (cfgScriptStart === -1 || scriptEnd === -1) throw new Error("Blok <script> tailwind.config tidak ditemukan");
    html = html.slice(0, cdnIdx) + styleBlock + html.slice(scriptEnd + "</script>".length);
  }

  fs.writeFileSync(APP_FILE, html, "utf8");

  const kb = Math.round(Buffer.byteLength(css, "utf8") / 1024);
  console.log("Tailwind dikompilasi (" + kb + " KB) dan ditanam ke WebApp.html. CDN dihapus.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
