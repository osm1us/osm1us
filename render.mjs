// Рисует картинки README тем же механизмом, что OG-карточки сайта ergial.ru
// (next/og из ../ergial/site). Запуск: node render.mjs
// Шрифты лежат в .fonts/, значки simple-icons 16.33.0 — в .icons/ (обе папки не в git).
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRequire = createRequire(path.join(here, "../ergial/site/package.json"));
const { ImageResponse } = siteRequire("next/og");
const { createElement: h } = siteRequire("react");

const C = {
  ink: "#0E1420",
  surface: "#161F2D",
  cream: "#DDD6C8",
  soft: "rgba(221, 214, 200, 0.72)",
  mute: "rgba(221, 214, 200, 0.55)",
  line: "rgba(221, 214, 200, 0.10)",
  frost: "#6E89A8",
  bronze: "#B87E4D",
};

const font = (file, name, weight) => ({
  name,
  weight,
  style: "normal",
  data: fs.readFileSync(path.join(here, ".fonts", file)),
});
const FONTS = [
  font("Unbounded-800.ttf", "Unbounded", 800),
  font("Unbounded-500.ttf", "Unbounded", 500),
  font("Manrope-500.ttf", "Manrope", 500),
  font("Manrope-700.ttf", "Manrope", 700),
  font("JetBrainsMono-500.ttf", "JetBrains Mono", 500),
];

// Геометрия знака и логотипа — берём прямо из ergial/site/src/lib/og.tsx.
const og = fs.readFileSync(path.join(here, "../ergial/site/src/lib/og.tsx"), "utf8");
const MARK_PATHS = [...og.match(/MARK_PATHS = \[([\s\S]*?)\];/)[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const WORDMARK_PATH = og.match(/WORDMARK_PATH =\s*"([^"]+)"/)[1];

const mark = (size, fill, extra = {}) =>
  h("svg", { width: size, height: Math.round(size * 1097 / 1079), viewBox: "0 0 1079 1097", fill, ...extra },
    ...MARK_PATHS.map((d) => h("path", { d })));
const wordmark = (width, fill) =>
  h("svg", { width, height: Math.round(width * 248 / 1266.6), viewBox: "0 0 1266.6 248", fill },
    h("path", { d: WORDMARK_PATH }));

const icon = (name, size, fill = C.cream) => {
  const svg = fs.readFileSync(path.join(here, ".icons", `${name}.svg`), "utf8").replace("<svg ", `<svg fill="${fill}" `);
  return h("img", { src: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`, width: size, height: size });
};

// Фон карточек сайта: чернила, холодное пятно слева сверху, сетка. Тёплое пятно
// справа снизу с сайта убрано: в сетке из шести оно повторялось и смотрелось грязью.
const brandBg = (grid) => ({
  background: C.ink,
  backgroundImage: [
    "radial-gradient(ellipse 75% 65% at 15% 18%, rgba(110, 137, 168, 0.16), transparent 65%)",
    "linear-gradient(to right, rgba(110, 137, 168, 0.04) 2px, transparent 2px)",
    "linear-gradient(to bottom, rgba(110, 137, 168, 0.04) 2px, transparent 2px)",
  ].join(", "),
  backgroundSize: `auto, ${grid}px ${grid}px, ${grid}px ${grid}px`,
});

const label = (text, size, color = C.frost) =>
  h("div", { style: { display: "flex", fontFamily: "Unbounded", fontWeight: 500, fontSize: size, letterSpacing: "0.18em", textTransform: "uppercase", color } }, text);

async function save(file, el, width, height) {
  const res = new ImageResponse(el, { width, height, fonts: FONTS });
  const out = path.join(here, "assets", file);
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log(file, width, "x", height);
}

// Все картинки README идут на всю ширину колонки или на половину. Половинки
// несут прозрачные поля со стороны соседа (GAP) и снизу (GAP_Y), чтобы сетка
// 2×N вставала ровно в край баннера: у GitHub нет style, только width.
const GAP = 14; // поле со стороны соседа, в пикселях картинки
const GAP_Y = 16; // поле снизу; к нему GitHub добавит выносной элемент строки
const W = 1680; // полная ширина, 2× от колонки README
const CARD_W = 1000 + GAP; // половинка
// Полноширинная картинка ужимается на экране сильнее половинки — поле снизу
// пересчитано, чтобы зазор между рядами везде выходил одинаковым.
const FULL_GAP_Y = Math.round((GAP_Y * W) / (2 * CARD_W));
const box = (inner, { left = 0, right = 0, bottom }) =>
  h("div", {
    style: { display: "flex", width: "100%", height: "100%", paddingLeft: left, paddingRight: right, paddingBottom: bottom },
  }, inner);
const half = (side, inner) =>
  box(inner, { left: side === "right" ? GAP : 0, right: side === "left" ? GAP : 0, bottom: GAP_Y });
const full = (inner) => box(inner, { bottom: FULL_GAP_Y });

const RADIUS = 22;

const HEAD = {
  name: "Матвеев Дмитрий",
  role: "Основатель и ведущий разработчик студии Эргиаль",
  tagline: "Промышленное и B2B-ПО под ключ",
};

async function banner() {
  const H = 520 + FULL_GAP_Y;
  await save("banner.png", full(h("div", {
    style: {
      ...brandBg(80), flex: 1, display: "flex", position: "relative",
      borderRadius: RADIUS * 1.2, border: `2px solid ${C.line}`, overflow: "hidden",
      padding: "64px 80px", flexDirection: "column", justifyContent: "space-between", color: C.cream,
    },
  },
  h("div", { style: { display: "flex", position: "absolute", right: -70, top: -30, opacity: 0.07 } }, mark(560, C.bronze)),
  h("div", { style: { display: "flex", alignItems: "center", gap: 18 } }, mark(52, C.bronze), wordmark(214, C.cream)),
  h("div", { style: { display: "flex", flexDirection: "column" } },
    h("div", { style: { display: "flex", fontFamily: "Unbounded", fontWeight: 800, fontSize: 104, lineHeight: 1.02, letterSpacing: "-0.02em" } }, HEAD.name),
    h("div", { style: { display: "flex", fontFamily: "Manrope", fontWeight: 500, fontSize: 40, color: C.soft, marginTop: 26 } }, HEAD.role),
    h("div", { style: { display: "flex", marginTop: 34 } }, label(HEAD.tagline, 26)),
  ))), W, H);
}

// Карточки берут заголовок, контур, заказчика и теги прямо из кейсов сайта,
// чтобы профиль не расходился с ergial.ru. Теги — первые три, как в OG сайта.
const casesSrc = fs.readFileSync(path.join(here, "../ergial/site/src/lib/cases.ts"), "utf8");
const caseBySlug = (slug) => {
  const start = casesSrc.indexOf(`slug: "${slug}"`);
  if (start < 0) throw new Error(`нет кейса ${slug} в cases.ts`);
  const blk = casesSrc.slice(start).split(/\n  \},/)[0];
  const field = (name) => blk.match(new RegExp(`\\n\\s+${name}: "([^"]*)"`))[1];
  const tags = JSON.parse(blk.match(/\n\s+tags: (\[[^\]]*\])/)[1]).slice(0, 3);
  return { slug, title: field("title"), status: field("status"), client: field("client"), tags };
};
const CASES = [
  "defect-radar", "transport-aggregator",
  "telegram-1c-gateway", "invoice-parser",
  "telegram-business-recovery", "chat-assistant",
].map(caseBySlug);
const CARD_H = 620 + GAP_Y;

// Заголовок у всех карточек одного кегля и с одной верхней линии: соседи в ряду
// читаются как пара, а не как две разные вёрстки.
async function card({ slug, status, title, client, tags }, i) {
  await save(`case-${slug}.png`, half(i % 2 ? "right" : "left", h("div", {
    style: {
      ...brandBg(64), flex: 1, display: "flex", flexDirection: "column",
      borderRadius: RADIUS, border: `2px solid ${C.line}`, padding: "52px 56px", color: C.cream,
    },
  },
  h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, label(status, 28), mark(40, C.bronze)),
  h("div", { style: { display: "flex", fontFamily: "Unbounded", fontWeight: 800, fontSize: 56, lineHeight: 1.1, letterSpacing: "-0.02em", marginTop: 64 } }, title),
  h("div", { style: { display: "flex", flexDirection: "column", gap: 12, marginTop: "auto" } },
    h("div", { style: { display: "flex", fontFamily: "Manrope", fontWeight: 500, fontSize: 34, color: C.mute } }, client),
    h("div", { style: { display: "flex", fontFamily: "JetBrains Mono", fontWeight: 500, fontSize: 31, color: C.frost } }, tags.join(" · ")),
  ))), CARD_W, CARD_H);
}

const BTN_H = 150 + GAP_Y;
async function button(file, side, iconEl, text, sub) {
  await save(file, half(side, h("div", {
    style: {
      flex: 1, display: "flex", alignItems: "center", gap: 28, padding: "0 56px",
      background: C.surface, borderRadius: RADIUS, border: `2px solid ${C.line}`, color: C.cream,
    },
  },
  iconEl,
  h("div", { style: { display: "flex", flexDirection: "column", gap: 6, flex: 1 } },
    h("div", { style: { display: "flex", fontFamily: "Unbounded", fontWeight: 800, fontSize: 38 } }, text),
    h("div", { style: { display: "flex", fontFamily: "JetBrains Mono", fontWeight: 500, fontSize: 28, color: C.frost } }, sub)),
  h("div", { style: { display: "flex", fontFamily: "Unbounded", fontWeight: 500, fontSize: 44, color: C.bronze } }, "→"),
  )), CARD_W, BTN_H);
}

// Значок simple-icons или, если у технологии его нет, буквенная плашка.
const STACK = [
  ["Бэкенд и интеграции", [["python", "Python"], ["fastapi", "FastAPI"], ["postgresql", "PostgreSQL"], ["redis", "Redis"], [null, "1С", "1С"], ["telegram", "Telegram API"]]],
  ["Производство и AI", [["opencv", "OpenCV"], ["ultralytics", "YOLO"], [null, "Modbus / ПЛК", "PLC"], [null, "OCR", "OCR"], [null, "Локальные LLM", "LLM"]]],
  ["Интерфейсы", [["typescript", "TypeScript"], ["react", "React"], ["nextdotjs", "Next.js"], ["tailwindcss", "Tailwind"], ["flutter", "Flutter"], ["electron", "Electron"], [null, "C# / .NET", "C#"]]],
  ["Инфраструктура и поставка", [["docker", "Docker"], ["linux", "Linux / systemd"], ["windows", "Службы Windows"], [null, "Установщики", "EXE"]]],
];
const glyph = (text) =>
  h("div", {
    style: {
      display: "flex", alignItems: "center", justifyContent: "center", height: 32, minWidth: 32, padding: "0 4px",
      borderRadius: 6, border: `2px solid ${C.cream}`, fontFamily: "JetBrains Mono", fontWeight: 500,
      fontSize: text.length > 2 ? 13 : 17, color: C.cream,
    },
  }, text);

async function stack() {
  const ROW = 128;
  const H = 64 * 2 + STACK.length * ROW + (STACK.length - 1) * 30 + FULL_GAP_Y;
  await save("stack.png", full(h("div", {
    style: {
      ...brandBg(80), flex: 1, display: "flex", flexDirection: "column", gap: 30,
      borderRadius: RADIUS * 1.2, border: `2px solid ${C.line}`, padding: "64px 72px",
    },
  },
  ...STACK.map(([title, items]) => h("div", { style: { display: "flex", flexDirection: "column", gap: 18, height: ROW } },
    label(title, 24),
    h("div", { style: { display: "flex", gap: 14 } },
      ...items.map(([ic, name, mono]) => h("div", {
        style: {
          display: "flex", alignItems: "center", gap: 14, height: 70, padding: "0 24px",
          background: C.surface, borderRadius: 14, border: `2px solid ${C.line}`,
          fontFamily: "Manrope", fontWeight: 700, fontSize: 28, color: C.cream,
        },
      }, ic ? icon(ic, 32) : glyph(mono), name))),
  )))), W, H);
}

fs.mkdirSync(path.join(here, "assets"), { recursive: true });
await banner();
await Promise.all(CASES.map(card));
await stack();
await button("more-cases.png", "left", mark(48, C.bronze), "Кейсы", "ergial.ru/work");
await button("telegram.png", "right", icon("telegram", 48), "Telegram", "@matveev_dmitriy");

// README собирается отсюда же, чтобы подписи и ссылки не расходились с картинками.
// Половинки ряда идут без пробела между собой, иначе 50 % + 50 % не влезут в строку.
const attr = (t) => t.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const img = (file, width, alt) => `<img src="assets/${file}" width="${width}" alt="${attr(alt)}">`;
const link = (href, inner) => `<a href="${href}">${inner}</a>`;
const caseLink = (c) =>
  link(`https://ergial.ru/work/${c.slug}/`, img(`case-${c.slug}.png`, "50%", `Кейс: ${c.title}. ${c.client}. ${c.tags.join(", ")}.`));
const rows = [];
for (let i = 0; i < CASES.length; i += 2) rows.push(CASES.slice(i, i + 2).map(caseLink).join(""));
const readme = [
  "<!-- Собирается командой node render.mjs, руками не править. -->",
  "<p>",
  link("https://ergial.ru", img("banner.png", "100%", `${HEAD.name} — ${HEAD.role[0].toLowerCase()}${HEAD.role.slice(1)}. ${HEAD.tagline}.`)),
  img("stack.png", "100%", "Стек. " + STACK.map(([t, items]) => `${t}: ${items.map((it) => it[1]).join(", ")}.`).join(" ")),
  ...rows,
  link("https://ergial.ru/work/", img("more-cases.png", "50%", "Кейсы — ergial.ru/work")) +
    link("https://t.me/matveev_dmitriy", img("telegram.png", "50%", "Telegram: @matveev_dmitriy")),
  "</p>",
  "",
].join("\n");
fs.writeFileSync(path.join(here, "README.md"), readme);
console.log("README.md");
