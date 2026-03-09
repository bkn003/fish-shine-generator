export interface Shop {
  shop_name: string;
  shop_name_tamil: string;
  tagline: string;
  logo_url: string;
  phone: string;
  whatsapp?: string;
  address: string;
  delivery_note: string;
  owner_email: string;
}

export interface PriceItemStyle {
  rowBackground?: string;
  badgeBackground?: string;
  nameColor?: string;
  tamilColor?: string;
  priceColor?: string;
}

export interface PriceItem {
  id: string;
  name: string;
  name_tamil: string;
  price: string;
  style?: PriceItemStyle;
}

export interface TextStyle {
  fontSize?: number;
  bold?: boolean;
  color?: string;
}

export interface TextStyleOverrides {
  shopName?: TextStyle;
  shopNameTamil?: TextStyle;
  tagline?: TextStyle;
  dayBanner?: TextStyle;
  deliveryNote?: TextStyle;
  itemName?: TextStyle;
  itemNameTamil?: TextStyle;
  priceBadge?: TextStyle;
  specialNote?: TextStyle;
  footer?: TextStyle;
}

export interface PriceCard {
  id: string;
  shop_id: string;
  day_number: number;
  card_date: string;
  day_label: string;
  background_color: string;
  accent_color: string;
  items: PriceItem[];
  special_note: string;
  is_published: boolean;
  image_data?: string;
}

export interface PosterPresetData {
  dayNumber: number;
  dayLabel: string;
  items: PriceItem[];
  specialNote: string;
  showGradient: boolean;
  usePremiumBackground: boolean;
  font: string;
  itemsHeaderLabel: string;
  priceHeaderLabel: string;
  shop: Shop;
  colorOverrides: {
    accent?: string;
    shopName?: string;
    itemText?: string;
    tamilText?: string;
    priceBadge?: string;
    dayBanner?: string;
  };
  textStyles: TextStyleOverrides;
  aiBackgroundPrompt?: string;
  aiBackgroundId?: string;
  aiBackgroundImage?: string;
}

export interface PosterPreset {
  id: string;
  name: string;
  created_at: string;
  data: PosterPresetData;
}

const SHOP_KEY = "fish_price_shop";
const CARDS_KEY = "fish_price_cards";
const PRESETS_KEY = "fish_price_presets";

function parseJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getShop(): Shop {
  const data = parseJSON<Shop | null>(localStorage.getItem(SHOP_KEY), null);
  if (data) return data;
  return {
    shop_name: "Fresh Fish Market",
    shop_name_tamil: "புதிய மீன் சந்தை",
    tagline: "Daily Fresh Catch",
    logo_url: "",
    phone: "",
    address: "",
    delivery_note: "Free delivery above ₹500",
    owner_email: "",
  };
}

export function saveShop(shop: Shop) {
  localStorage.setItem(SHOP_KEY, JSON.stringify(shop));
}

export function getSavedCards(): PriceCard[] {
  return parseJSON<PriceCard[]>(localStorage.getItem(CARDS_KEY), []);
}

export function saveCard(card: PriceCard) {
  const cards = getSavedCards();
  const idx = cards.findIndex((c) => c.id === card.id);
  if (idx >= 0) cards[idx] = card;
  else cards.unshift(card);
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

export function deleteCard(id: string) {
  const cards = getSavedCards().filter((c) => c.id !== id);
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

export function getPosterPresets(): PosterPreset[] {
  const presets = parseJSON<PosterPreset[]>(localStorage.getItem(PRESETS_KEY), []);
  return presets.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function savePosterPreset(preset: PosterPreset) {
  const presets = getPosterPresets();
  const idx = presets.findIndex((p) => p.id === preset.id);
  if (idx >= 0) presets[idx] = preset;
  else presets.unshift(preset);
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

export function deletePosterPreset(id: string) {
  const presets = getPosterPresets().filter((preset) => preset.id !== id);
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}
