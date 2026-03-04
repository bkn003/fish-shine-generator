export interface Shop {
  shop_name: string;
  shop_name_tamil: string;
  tagline: string;
  logo_url: string;
  phone: string;
  address: string;
  delivery_note: string;
  owner_email: string;
}

export interface PriceItem {
  name: string;
  name_tamil: string;
  price: string;
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

const SHOP_KEY = "fish_price_shop";
const CARDS_KEY = "fish_price_cards";

export function getShop(): Shop {
  const data = localStorage.getItem(SHOP_KEY);
  if (data) return JSON.parse(data);
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
  const data = localStorage.getItem(CARDS_KEY);
  if (data) return JSON.parse(data);
  return [];
}

export function saveCard(card: PriceCard) {
  const cards = getSavedCards();
  const idx = cards.findIndex(c => c.id === card.id);
  if (idx >= 0) cards[idx] = card;
  else cards.unshift(card);
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

export function deleteCard(id: string) {
  const cards = getSavedCards().filter(c => c.id !== id);
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}
