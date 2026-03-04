export interface CardTheme {
  name: string;
  gradient: string;
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

// Non-linear hue jumping for maximum visual difference between adjacent days
function getDayHue(day: number): number {
  // Golden angle approach ensures no two adjacent days are close in hue
  const goldenAngle = 137.508;
  return (day * goldenAngle + (day * day * 31) % 360) % 360;
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function getThemeForDay(dayNumber: number): CardTheme {
  const idx = ((dayNumber - 1) % 365);
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
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

export const FONT_OPTIONS = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Monospace", value: "'Courier New', monospace" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Rounded", value: "'Trebuchet MS', sans-serif" },
  { label: "Impact", value: "Impact, 'Arial Black', sans-serif" },
];
