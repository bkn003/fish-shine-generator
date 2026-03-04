import React from "react";
import { PriceItem } from "@/lib/shop";
import { CardTheme, FONT_OPTIONS } from "@/lib/themes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, RotateCcw } from "lucide-react";

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
  colorOverrides: ColorOverrides;
  setColorOverrides: (o: ColorOverrides) => void;
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

const CardControls: React.FC<CardControlsProps> = ({
  dayNumber, setDayNumber, dayLabel, setDayLabel,
  items, setItems, specialNote, setSpecialNote,
  showGradient, setShowGradient, font, setFont,
  colorOverrides, setColorOverrides, theme,
}) => {
  const addItem = () => setItems([...items, { name: "", name_tamil: "", price: "" }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof PriceItem, val: string) => {
    const newItems = [...items];
    newItems[i] = { ...newItems[i], [field]: val };
    setItems(newItems);
  };

  return (
    <div className="space-y-4">
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
          <Label className="text-xs text-muted-foreground">Font</Label>
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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

      {/* Items */}
      <div className="glass-panel p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary">Price Items</h3>
          <button onClick={addItem} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
            <Plus size={14} /> Add
          </button>
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
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
                className="bg-secondary border-border h-8 text-xs w-20" />
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
