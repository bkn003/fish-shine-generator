import React, { useState } from "react";
import { PriceItem, TextStyleOverrides, TextStyle, Shop } from "@/lib/shop";
import { CardTheme, FONT_OPTIONS } from "@/lib/themes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, RotateCcw, Bold, ChevronDown, ChevronUp } from "lucide-react";

interface ColorOverrides {
  accent?: string;
  shopName?: string;
  itemText?: string;
  tamilText?: string;
  priceBadge?: string;
  dayBanner?: string;
}

interface CardControlsProps {
  dayNumber: number;
  setDayNumber: (n: number) => void;
  dayLabel: string;
  setDayLabel: (s: string) => void;
  items: PriceItem[];
  setItems: (items: PriceItem[]) => void;
  specialNote: string;
  setSpecialNote: (s: string) => void;
  showGradient: boolean;
  setShowGradient: (b: boolean) => void;
  font: string;
  setFont: (s: string) => void;
  shop: Shop;
  setShop: React.Dispatch<React.SetStateAction<Shop>>;
  itemsHeaderLabel: string;
  setItemsHeaderLabel: (s: string) => void;
  priceHeaderLabel: string;
  setPriceHeaderLabel: (s: string) => void;
  colorOverrides: ColorOverrides;
  setColorOverrides: (o: ColorOverrides) => void;
  textStyles: TextStyleOverrides;
  setTextStyles: (s: TextStyleOverrides) => void;
  theme: CardTheme;
}

const COLOR_FIELDS: { key: keyof ColorOverrides; label: string; themeKey: keyof CardTheme }[] = [
  { key: "accent", label: "Accent", themeKey: "accentColor" },
  { key: "shopName", label: "Shop Name", themeKey: "shopNameColor" },
  { key: "itemText", label: "Item Text", themeKey: "textColor" },
  { key: "tamilText", label: "Tamil Text", themeKey: "tamilColor" },
  { key: "priceBadge", label: "Price Badge", themeKey: "badgeColor" },
  { key: "dayBanner", label: "Day Banner", themeKey: "bannerColor" },
];

interface TextStyleField {
  key: keyof TextStyleOverrides;
  label: string;
  defaultSize: number;
  defaultBold: boolean;
}

const TEXT_STYLE_FIELDS: TextStyleField[] = [
  { key: "shopName", label: "Shop Name", defaultSize: 20, defaultBold: true },
  { key: "shopNameTamil", label: "Shop Tamil", defaultSize: 13, defaultBold: false },
  { key: "tagline", label: "Tagline", defaultSize: 11, defaultBold: false },
  { key: "dayBanner", label: "Day Banner", defaultSize: 16, defaultBold: true },
  { key: "deliveryNote", label: "Delivery Note", defaultSize: 11, defaultBold: false },
  { key: "itemName", label: "Item Name", defaultSize: 14, defaultBold: true },
  { key: "itemNameTamil", label: "Item Tamil", defaultSize: 11, defaultBold: false },
  { key: "priceBadge", label: "Price Badge", defaultSize: 13, defaultBold: true },
  { key: "specialNote", label: "Special Note", defaultSize: 12, defaultBold: false },
];

const CardControls: React.FC<CardControlsProps> = ({
  dayNumber, setDayNumber, dayLabel, setDayLabel,
  items, setItems, specialNote, setSpecialNote,
  showGradient, setShowGradient, font, setFont,
  shop, setShop, itemsHeaderLabel, setItemsHeaderLabel, priceHeaderLabel, setPriceHeaderLabel,
  colorOverrides, setColorOverrides, textStyles, setTextStyles, theme,
}) => {
  const [showTextStyles, setShowTextStyles] = useState(false);

  const addItem = () => setItems([...items, { name: "", name_tamil: "", price: "" }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof PriceItem, val: string) => {
    const newItems = [...items];
    newItems[i] = { ...newItems[i], [field]: val };
    setItems(newItems);
  };

  const updateShop = (field: keyof Shop, value: string) => {
    setShop((prev) => ({ ...prev, [field]: value }));
  };

  const updateTextStyle = (key: keyof TextStyleOverrides, prop: keyof TextStyle, value: any) => {
    setTextStyles({
      ...textStyles,
      [key]: { ...textStyles[key], [prop]: value },
    });
  };

  const resetTextStyle = (key: keyof TextStyleOverrides) => {
    const newStyles = { ...textStyles };
    delete newStyles[key];
    setTextStyles(newStyles);
  };

  return (
    <div className="space-y-4">
      {/* Quick content editor */}
      <div className="glass-panel p-4 space-y-3">
        <h3 className="text-sm font-semibold text-primary">Edit All Card Content</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input value={shop.shop_name} onChange={(e) => updateShop("shop_name", e.target.value)} placeholder="Shop Name" className="bg-secondary border-border h-8 text-xs" />
          <Input value={shop.shop_name_tamil} onChange={(e) => updateShop("shop_name_tamil", e.target.value)} placeholder="Shop Name Tamil" className="bg-secondary border-border h-8 text-xs" />
          <Input value={shop.tagline} onChange={(e) => updateShop("tagline", e.target.value)} placeholder="Tagline" className="bg-secondary border-border h-8 text-xs" />
          <Input value={shop.phone} onChange={(e) => updateShop("phone", e.target.value)} placeholder="Phone" className="bg-secondary border-border h-8 text-xs" />
          <Input value={shop.delivery_note} onChange={(e) => updateShop("delivery_note", e.target.value)} placeholder="Free delivery note" className="bg-secondary border-border h-8 text-xs" />
          <Input value={shop.address} onChange={(e) => updateShop("address", e.target.value)} placeholder="Address" className="bg-secondary border-border h-8 text-xs" />
          <Input value={itemsHeaderLabel} onChange={(e) => setItemsHeaderLabel(e.target.value)} placeholder="Items Column Header" className="bg-secondary border-border h-8 text-xs" />
          <Input value={priceHeaderLabel} onChange={(e) => setPriceHeaderLabel(e.target.value)} placeholder="Price Column Header" className="bg-secondary border-border h-8 text-xs" />
        </div>
      </div>

      {/* Day config */}
      <div className="glass-panel p-4 space-y-3">
        <h3 className="text-sm font-semibold text-primary">Day Settings</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Day Number (1-365)</Label>
            <Input
              type="number" min={1} max={365} value={dayNumber}
              onChange={e => setDayNumber(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))}
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Day Label</Label>
            <Input value={dayLabel} onChange={e => setDayLabel(e.target.value)}
              className="bg-secondary border-border" placeholder="Monday" />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Theme: <span className="text-primary font-medium">{theme.name}</span>
        </div>
      </div>

      {/* Font & Gradient */}
      <div className="glass-panel p-4 space-y-3">
        <h3 className="text-sm font-semibold text-primary">Style</h3>
        <div>
          <Label className="text-xs text-muted-foreground">Font (50+ options)</Label>
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {FONT_OPTIONS.map(f => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Gradient Background</Label>
          <Switch checked={showGradient} onCheckedChange={setShowGradient} />
        </div>
      </div>

      {/* Colors */}
      <div className="glass-panel p-4 space-y-3">
        <h3 className="text-sm font-semibold text-primary">Colors</h3>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_FIELDS.map(({ key, label, themeKey }) => (
            <div key={key} className="flex items-center gap-2">
              <input
                type="color"
                value={colorOverrides[key] || (theme[themeKey] as string)}
                onChange={e => setColorOverrides({ ...colorOverrides, [key]: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs text-muted-foreground flex-1">{label}</span>
              {colorOverrides[key] && (
                <button onClick={() => {
                  const o = { ...colorOverrides };
                  delete o[key];
                  setColorOverrides(o);
                }} className="text-muted-foreground hover:text-foreground">
                  <RotateCcw size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Text Style Controls */}
      <div className="glass-panel p-4 space-y-3">
        <button
          onClick={() => setShowTextStyles(!showTextStyles)}
          className="flex items-center justify-between w-full"
        >
          <h3 className="text-sm font-semibold text-primary">Text Size & Style</h3>
          {showTextStyles ? <ChevronUp size={16} className="text-primary" /> : <ChevronDown size={16} className="text-primary" />}
        </button>
        {showTextStyles && (
          <div className="space-y-3">
            {TEXT_STYLE_FIELDS.map(({ key, label, defaultSize, defaultBold }) => {
              const style = textStyles[key];
              const currentSize = style?.fontSize || defaultSize;
              const currentBold = style?.bold !== undefined ? style.bold : defaultBold;
              const currentColor = style?.color || "";

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground flex-1">{label}</span>
                    {currentColor ? (
                      <input
                        type="color"
                        value={currentColor}
                        onChange={e => updateTextStyle(key, "color", e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                      />
                    ) : (
                      <button
                        onClick={() => updateTextStyle(key, "color", "#ffffff")}
                        className="text-[10px] text-muted-foreground hover:text-foreground border border-border rounded px-1"
                      >
                        Color
                      </button>
                    )}
                    <button
                      onClick={() => updateTextStyle(key, "bold", !currentBold)}
                      className={`p-0.5 rounded ${currentBold ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <Bold size={12} />
                    </button>
                    <span className="text-[10px] text-muted-foreground w-6 text-right">{currentSize}</span>
                    {style && (
                      <button onClick={() => resetTextStyle(key)} className="text-muted-foreground hover:text-foreground">
                        <RotateCcw size={10} />
                      </button>
                    )}
                  </div>
                  <Slider
                    value={[currentSize]}
                    onValueChange={([v]) => updateTextStyle(key, "fontSize", v)}
                    min={8}
                    max={32}
                    step={1}
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="glass-panel p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary">Edit Each Item ({items.length})</h3>
          <button onClick={addItem} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
            <Plus size={14} /> Add
          </button>
        </div>
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-start bg-secondary/50 rounded-lg p-2">
              <div className="flex-1 space-y-1">
                <Input placeholder="Fish name" value={item.name}
                  onChange={e => updateItem(i, "name", e.target.value)}
                  className="bg-secondary border-border h-8 text-xs" />
                <Input placeholder="தமிழ் பெயர்" value={item.name_tamil}
                  onChange={e => updateItem(i, "name_tamil", e.target.value)}
                  className="bg-secondary border-border h-8 text-xs" />
              </div>
              <Input placeholder="₹" value={item.price}
                onChange={e => updateItem(i, "price", e.target.value)}
                className="bg-secondary border-border h-8 text-xs w-20 text-center" />
              <button onClick={() => removeItem(i)} className="text-destructive hover:text-destructive/80 mt-1">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Special note */}
      <div className="glass-panel p-4 space-y-2">
        <Label className="text-xs text-muted-foreground">Special Note</Label>
        <Input value={specialNote} onChange={e => setSpecialNote(e.target.value)}
          className="bg-secondary border-border" placeholder="Today's special offer..." />
      </div>
    </div>
  );
};

export default CardControls;
