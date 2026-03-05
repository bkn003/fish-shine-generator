export interface CardTheme {
  name: string;
  gradient: string;
  premiumPattern: string;
  accentColor: string;
  glowColor: string;
  badgeColor: string;
  bannerColor: string;
  textColor: string;
  tamilColor: string;
  shopNameColor: string;
}

const THEME_NAMES = [
  "Cosmic", "Sunset", "Royal", "Matrix", "Ocean", "Magenta", "Emerald", "Crimson",
  "Arctic", "Amber", "Violet", "Midnight", "Neon", "Coral", "Sapphire", "Jade",
  "Blaze", "Frost", "Plum", "Gold", "Teal", "Ruby", "Indigo", "Peach",
  "Onyx", "Lime", "Rose", "Cobalt", "Honey", "Slate", "Turquoise", "Wine",
  "Lapis", "Tangerine", "Mint", "Garnet", "Sky", "Copper", "Orchid", "Steel",
  "Saffron", "Pine", "Fuchsia", "Bronze", "Lagoon", "Cherry", "Denim", "Papaya",
  "Shadow", "Lemon"
];

function getDayHue(day: number): number {
  const goldenAngle = 137.508;
  return (day * goldenAngle + (day * day * 31) % 360) % 360;
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function seededRandom(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t += 0x6d2b79f5;
    let v = Math.imul(t ^ (t >>> 15), 1 | t);
    v ^= v + Math.imul(v ^ (v >>> 7), 61 | v);
    return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
  };
}

function buildPremiumFishPattern(day: number): string {
  const rand = seededRandom(day * 7919 + 97);

  const fish = Array.from({ length: 10 }, () => {
    const x = Math.round(rand() * 500);
    const y = Math.round(rand() * 720);
    const size = 10 + rand() * 18;
    const rot = Math.round(rand() * 360);
    const hue = Math.round(rand() * 360);
    const alpha = 0.08 + rand() * 0.14;

    return `
      <g transform="translate(${x} ${y}) rotate(${rot})">
        <ellipse cx="0" cy="0" rx="${size}" ry="${(size * 0.56).toFixed(2)}" fill="hsla(${hue},85%,70%,${alpha.toFixed(3)})" />
        <polygon points="${(-size).toFixed(2)},0 ${(-size - size * 0.58).toFixed(2)},${(size * 0.34).toFixed(2)} ${(-size - size * 0.58).toFixed(2)},${(-size * 0.34).toFixed(2)}" fill="hsla(${hue},85%,74%,${(alpha * 0.95).toFixed(3)})" />
        <circle cx="${(size * 0.38).toFixed(2)}" cy="${(-size * 0.1).toFixed(2)}" r="${(size * 0.08).toFixed(2)}" fill="rgba(255,255,255,0.75)" />
      </g>
    `;
  }).join("");

  const bubbles = Array.from({ length: 18 }, () => {
    const x = Math.round(rand() * 500);
    const y = Math.round(rand() * 720);
    const r = (1 + rand() * 4).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(255,255,255,0.12)" />`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="720" viewBox="0 0 500 720" preserveAspectRatio="none">
    <defs>
      <linearGradient id="wave${day}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0.20)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0.02)" />
      </linearGradient>
    </defs>
    <path d="M0 160 C120 110, 260 210, 500 150 L500 240 C300 280, 140 190, 0 250 Z" fill="url(#wave${day})" opacity="0.26" />
    <path d="M0 470 C180 420, 320 520, 500 450 L500 540 C320 580, 170 510, 0 570 Z" fill="url(#wave${day})" opacity="0.2" />
    ${fish}
    ${bubbles}
  </svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function getThemeForDay(dayNumber: number): CardTheme {
  const idx = (dayNumber - 1) % 365;
  const nameIdx = idx % THEME_NAMES.length;
  const name = THEME_NAMES[nameIdx] + (idx >= THEME_NAMES.length ? ` ${Math.floor(idx / THEME_NAMES.length) + 1}` : "");

  const hue1 = getDayHue(idx);
  const hue2 = (hue1 + 40 + (idx * 17) % 80) % 360;
  const hue3 = (hue1 + 160 + (idx * 23) % 60) % 360;

  const sat1 = 60 + (idx * 7) % 30;
  const sat2 = 50 + (idx * 11) % 40;
  const light1 = 15 + (idx * 3) % 20;
  const light2 = 25 + (idx * 5) % 20;
  const light3 = 10 + (idx * 7) % 15;

  const accentHue = (hue1 + 180 + (idx * 13) % 60) % 360;

  const gradient = `linear-gradient(${135 + (idx * 7) % 90}deg, hsl(${hue1}, ${sat1}%, ${light1}%), hsl(${hue2}, ${sat2}%, ${light2}%), hsl(${hue3}, ${sat1}%, ${light3}%))`;

  return {
    name,
    gradient,
    premiumPattern: buildPremiumFishPattern(dayNumber),
    accentColor: hslToHex(accentHue, 80, 60),
    glowColor: hslToHex(hue1, 70, 50),
    badgeColor: hslToHex(accentHue, 85, 55),
    bannerColor: hslToHex(hue2, 75, 45),
    textColor: "#FFFFFF",
    tamilColor: "#E0E0E0",
    shopNameColor: hslToHex(hue1, 60, 85),
  };
}

export function getContrastColor(hex: string): string {
  if (!/^#[\da-fA-F]{6}$/.test(hex)) return "#FFFFFF";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

export const FONT_OPTIONS = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Trebuchet", value: "'Trebuchet MS', sans-serif" },
  { label: "Segoe UI", value: "'Segoe UI', sans-serif" },
  { label: "Gill Sans", value: "'Gill Sans', sans-serif" },
  { label: "Century Gothic", value: "'Century Gothic', sans-serif" },
  { label: "Candara", value: "Candara, sans-serif" },
  { label: "Lucida Sans", value: "'Lucida Sans Unicode', 'Lucida Grande', sans-serif" },
  { label: "Geneva", value: "Geneva, sans-serif" },
  { label: "Futura", value: "Futura, 'Trebuchet MS', sans-serif" },
  { label: "Optima", value: "Optima, sans-serif" },
  { label: "Franklin Gothic", value: "'Franklin Gothic Medium', Arial, sans-serif" },
  { label: "Bahnschrift", value: "Bahnschrift, 'Segoe UI', sans-serif" },
  { label: "Calibri", value: "Calibri, 'Segoe UI', sans-serif" },
  { label: "Cambria", value: "Cambria, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Garamond", value: "Garamond, serif" },
  { label: "Palatino", value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
  { label: "Book Antiqua", value: "'Book Antiqua', Palatino, serif" },
  { label: "Baskerville", value: "Baskerville, 'Times New Roman', serif" },
  { label: "Didot", value: "Didot, serif" },
  { label: "Bodoni", value: "'Bodoni MT', Didot, serif" },
  { label: "Rockwell", value: "Rockwell, 'Courier Bold', serif" },
  { label: "Copperplate", value: "Copperplate, 'Copperplate Gothic Light', serif" },
  { label: "Constantia", value: "Constantia, serif" },
  { label: "Monaco", value: "Monaco, monospace" },
  { label: "Consolas", value: "Consolas, monospace" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Lucida Console", value: "'Lucida Console', Monaco, monospace" },
  { label: "Menlo", value: "Menlo, Monaco, monospace" },
  { label: "Andale Mono", value: "'Andale Mono', monospace" },
  { label: "Source Code", value: "'Source Code Pro', Consolas, monospace" },
  { label: "Impact", value: "Impact, 'Arial Black', sans-serif" },
  { label: "Arial Black", value: "'Arial Black', Gadget, sans-serif" },
  { label: "Haettenschweiler", value: "Haettenschweiler, 'Arial Narrow Bold', sans-serif" },
  { label: "Comic Sans", value: "'Comic Sans MS', cursive, sans-serif" },
  { label: "Chalkboard", value: "'Chalkboard SE', 'Comic Sans MS', cursive" },
  { label: "Brush Script", value: "'Brush Script MT', cursive" },
  { label: "Snell Roundhand", value: "'Snell Roundhand', cursive" },
  { label: "Papyrus", value: "Papyrus, fantasy" },
  { label: "Fantasy", value: "fantasy" },
  { label: "System UI", value: "system-ui, sans-serif" },
  { label: "UI Sans", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "UI Serif", value: "ui-serif, Georgia, serif" },
  { label: "UI Mono", value: "ui-monospace, SFMono-Regular, monospace" },
  { label: "Tamil Noto", value: "'Noto Sans Tamil', sans-serif" },
  { label: "Tamil Latha", value: "Latha, 'Nirmala UI', sans-serif" },
  { label: "Tamil Nirmala", value: "'Nirmala UI', sans-serif" },
  { label: "Tamil Vijaya", value: "Vijaya, serif" },
  { label: "Tamil InaiMathi", value: "InaiMathi, serif" },
  { label: "Rounded UI", value: "'Arial Rounded MT Bold', 'Trebuchet MS', sans-serif" },
  { label: "Narrow", value: "'Arial Narrow', Arial, sans-serif" },
  { label: "Terminal", value: "Terminal, 'Courier New', monospace" }
];
