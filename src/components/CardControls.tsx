import React, { useState } from "react";
import { PosterPreset, PriceItem, TextStyleOverrides, TextStyle, Shop } from "@/lib/shop";
import { CardTheme, FONT_OPTIONS } from "@/lib/themes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Trash2,
  RotateCcw,
  Bold,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Palette,
  Save,
  Sparkles,
  LayoutTemplate,
  WandSparkles,
  ImageOff,
  Loader2,
} from "lucide-react";

interface ColorOverrides {
  accent?: string;
  shopName?: string;
  itemText?: string;
  tamilText?: string;
  priceBadge?: string;
  dayBanner?: string;
}

interface SavedAiBackgroundOption {
  id: string;
  dayNumber: number;
  dayLabel: string;
  createdAt: string;
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
  usePremiumBackground: boolean;
  setUsePremiumBackground: (b: boolean) => void;
  showGrain: boolean;
  setShowGrain: (b: boolean) => void;
  showOrbs: boolean;
  setShowOrbs: (b: boolean) => void;
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
  presets: PosterPreset[];
  activePresetId: string;
  onApplyPreset: (presetId: string) => void;
  onSavePreset: (name: string) => void;
  onDeletePreset: (presetId: string) => void;
  aiBackgroundPrompt: string;
  setAiBackgroundPrompt: (value: string) => void;
  hasCustomBackground: boolean;
  isGeneratingAiBackground: boolean;
  onGenerateAiBackground: (isVariation?: boolean, forceAutoPrompt?: boolean) => void;
  onClearAiBackground: () => void;
  savedAiBackgrounds?: SavedAiBackgroundOption[];
  activeAiBackgroundId?: string;
  onApplySavedAiBackground?: (backgroundId: string) => void;
  onDeleteSavedAiBackground?: (backgroundId: string) => void;
  onRunBatchGeneration?: (days: 7 | 30) => void;
  isBatchGenerating?: boolean;
  batchProgressLabel?: string;
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
  { key: "shopNameTamil", label: "Shop Tamil", defaultSize: 14, defaultBold: false },
  { key: "tagline", label: "Tagline", defaultSize: 11, defaultBold: false },
  { key: "dayBanner", label: "Day Banner", defaultSize: 16, defaultBold: true },
  { key: "deliveryNote", label: "Delivery Note", defaultSize: 11, defaultBold: false },
  { key: "itemName", label: "Item Name", defaultSize: 14, defaultBold: true },
  { key: "itemNameTamil", label: "Item Tamil", defaultSize: 12, defaultBold: false },
  { key: "priceBadge", label: "Price Badge", defaultSize: 13, defaultBold: true },
  { key: "specialNote", label: "Special Note", defaultSize: 12, defaultBold: false },
];

const CardControls: React.FC<CardControlsProps> = ({
  dayNumber,
  setDayNumber,
  dayLabel,
  setDayLabel,
  items,
  setItems,
  specialNote,
  setSpecialNote,
  showGradient,
  setShowGradient,
  usePremiumBackground,
  setUsePremiumBackground,
  showGrain,
  setShowGrain,
  showOrbs,
  setShowOrbs,
  font,
  setFont,
  shop,
  setShop,
  itemsHeaderLabel,
  setItemsHeaderLabel,
  priceHeaderLabel,
  setPriceHeaderLabel,
  colorOverrides,
  setColorOverrides,
  textStyles,
  setTextStyles,
  theme,
  presets,
  activePresetId,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
  aiBackgroundPrompt,
  setAiBackgroundPrompt,
  hasCustomBackground,
  isGeneratingAiBackground,
  onGenerateAiBackground,
  onClearAiBackground,
  savedAiBackgrounds = [],
  activeAiBackgroundId = "",
  onApplySavedAiBackground,
  onDeleteSavedAiBackground,
  onRunBatchGeneration,
  isBatchGenerating = false,
  batchProgressLabel = "",
}) => {
  const [showTextStyles, setShowTextStyles] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const addItem = () =>
    setItems([
      ...items,
      {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        name: "",
        name_tamil: "",
        price: "",
      },
    ]);

  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof PriceItem, val: string) => {
    const newItems = [...items];
    newItems[i] = { ...newItems[i], [field]: val };
    setItems(newItems);
  };

  const updateItemStyle = (i: number, key: keyof NonNullable<PriceItem["style"]>, value: string) => {
    const newItems = [...items];
    newItems[i] = {
      ...newItems[i],
      style: {
        ...newItems[i].style,
        [key]: value,
      },
    };
    setItems(newItems);
  };

  const clearItemStyle = (i: number) => {
    const newItems = [...items];
    delete newItems[i].style;
    setItems(newItems);
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const reordered = [...items];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setItems(reordered);
  };

  const updateShop = (field: keyof Shop, value: string) => {
    setShop((prev) => ({ ...prev, [field]: value }));
  };

  const updateTextStyle = (key: keyof TextStyleOverrides, prop: keyof TextStyle, value: string | number | boolean) => {
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

  const openSavePreset = () => {
    const name = window.prompt("Preset name");
    if (!name || !name.trim()) return;
    onSavePreset(name.trim());
  };

  return (
    <div className="space-y-4">
      <div className="glass-panel p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
            <LayoutTemplate size={14} /> Business Presets
          </h3>
          <button
            onClick={openSavePreset}
            className="flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-1 text-xs text-foreground hover:bg-secondary/80"
          >
            <Save size={12} /> Save Current
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
          <Select
            value={activePresetId || "__none"}
            onValueChange={(value) => {
              if (value !== "__none") onApplyPreset(value);
            }}
          >
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Select saved preset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">Select saved preset</SelectItem>
              {presets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            onClick={() => activePresetId && onDeletePreset(activePresetId)}
            disabled={!activePresetId}
            className="rounded-md border border-border bg-secondary px-3 py-2 text-xs text-destructive disabled:opacity-40"
          >
            Delete
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">Save full poster styles and switch instantly for different customers/brands.</p>
      </div>

      <div className="glass-panel p-4 space-y-3">
        <h3 className="text-sm font-semibold text-primary">Edit All Card Content</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input value={shop.shop_name} onChange={(e) => updateShop("shop_name", e.target.value)} placeholder="Shop Name" className="bg-secondary border-border h-8 text-xs" />
          <Input value={shop.shop_name_tamil} onChange={(e) => updateShop("shop_name_tamil", e.target.value)} placeholder="Shop Name Tamil" className="bg-secondary border-border h-8 text-xs" />
          <Input value={shop.tagline} onChange={(e) => updateShop("tagline", e.target.value)} placeholder="Tagline" className="bg-secondary border-border h-8 text-xs" />
          <Input value={shop.phone} onChange={(e) => updateShop("phone", e.target.value)} placeholder="Phone" className="bg-secondary border-border h-8 text-xs" />
          <Input value={shop.address} onChange={(e) => updateShop("address", e.target.value)} placeholder="Address" className="bg-secondary border-border h-8 text-xs" />
          <Input value={shop.delivery_note} onChange={(e) => updateShop("delivery_note", e.target.value)} placeholder="Free delivery note" className="bg-secondary border-border h-8 text-xs" />
          <Input value={itemsHeaderLabel} onChange={(e) => setItemsHeaderLabel(e.target.value)} placeholder="Items Column Header" className="bg-secondary border-border h-8 text-xs" />
          <Input value={priceHeaderLabel} onChange={(e) => setPriceHeaderLabel(e.target.value)} placeholder="Price Column Header" className="bg-secondary border-border h-8 text-xs" />
        </div>
      </div>

      <div className="glass-panel p-4 space-y-3">
        <h3 className="text-sm font-semibold text-primary">Day Settings</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Theme Day (unlimited)</Label>
            <Input
              type="number"
              min={1}
              value={dayNumber}
              onChange={(e) => setDayNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Day Label (exact text)</Label>
            <Input value={dayLabel} onChange={(e) => setDayLabel(e.target.value)} className="bg-secondary border-border" placeholder="Thursday (07/03/2026)" />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Theme: <span className="text-primary font-medium">{theme.name}</span>
        </div>
      </div>

      <div className="glass-panel p-4 space-y-3">
        <h3 className="text-sm font-semibold text-primary">Style</h3>
        <div>
          <Label className="text-xs text-muted-foreground">Font (50+ options)</Label>
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {FONT_OPTIONS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Gradient Background</Label>
          <Switch checked={showGradient} onCheckedChange={setShowGradient} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles size={12} /> Premium fish-art pattern background (unlimited variants)
          </Label>
          <Switch checked={usePremiumBackground} onCheckedChange={setUsePremiumBackground} disabled={!showGradient} />
        </div>
      </div>

      <div className="glass-panel p-4 space-y-3 border-primary/20 bg-primary/5">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <Palette size={14} /> Professional Backgrounds
        </h3>
        <p className="text-[11px] text-muted-foreground">
          Premium gradient & texture system. Leave fields blank to use the day's default theme colors.
        </p>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Gradient Top</Label>
            <input
              type="color"
              value={colorOverrides.bgFrom || theme.gradient.split(" ")[1] || "#0A0D14"}
              onChange={(e) => setColorOverrides({ ...colorOverrides, bgFrom: e.target.value })}
              className="block w-full h-8 cursor-pointer rounded border-0 bg-transparent mt-1"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Gradient Mid</Label>
            <input
              type="color"
              value={colorOverrides.bgVia || theme.gradient.split(" ")[2] || "#0A0D14"}
              onChange={(e) => setColorOverrides({ ...colorOverrides, bgVia: e.target.value })}
              className="block w-full h-8 cursor-pointer rounded border-0 bg-transparent mt-1"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Gradient Bot</Label>
            <input
              type="color"
              value={colorOverrides.bgTo || theme.gradient.split(" ")[3] || "#0A0D14"}
              onChange={(e) => setColorOverrides({ ...colorOverrides, bgTo: e.target.value })}
              className="block w-full h-8 cursor-pointer rounded border-0 bg-transparent mt-1"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-primary/10">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              Cinematic Poster Grain (Texture)
            </Label>
            <Switch checked={showGrain} onCheckedChange={setShowGrain} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              Abstract Glowing Orbs (Mesh effect)
            </Label>
            <Switch checked={showOrbs} onCheckedChange={setShowOrbs} />
          </div>
        </div>
      </div>

      <div className="glass-panel p-4 space-y-3">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-1">
          <WandSparkles size={14} /> AI Background Generator (Unlimited)
        </h3>
        <Textarea
          value={aiBackgroundPrompt}
          onChange={(e) => setAiBackgroundPrompt(e.target.value)}
          className="bg-secondary border-border min-h-[84px] text-xs"
          placeholder="Optional custom prompt. Keep empty to auto-generate a premium fish background from day + label."
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onGenerateAiBackground(false)}
            disabled={isGeneratingAiBackground}
            className="rounded-md border border-border bg-secondary px-3 py-2 text-xs text-foreground hover:bg-secondary/80 disabled:opacity-50 flex items-center gap-1"
          >
            {isGeneratingAiBackground ? <Loader2 size={12} className="animate-spin" /> : <WandSparkles size={12} />}
            Generate
          </button>
          <button
            type="button"
            onClick={() => onGenerateAiBackground(true)}
            disabled={isGeneratingAiBackground}
            className="rounded-md border border-border bg-secondary px-3 py-2 text-xs text-foreground hover:bg-secondary/80 disabled:opacity-50"
          >
            Generate New Variation
          </button>
          <button
            type="button"
            onClick={onClearAiBackground}
            disabled={!hasCustomBackground || isGeneratingAiBackground}
            className="rounded-md border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 flex items-center gap-1"
          >
            <ImageOff size={12} /> Clear AI Background
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          AI background keeps text area readable with premium fish visuals for any day number.
        </p>
      </div>

      {/* Saved AI Backgrounds Library */}
      {savedAiBackgrounds.length > 0 && (
        <div className="glass-panel p-4 space-y-3">
          <h3 className="text-sm font-semibold text-primary flex items-center gap-1">
            <Sparkles size={14} /> Saved Backgrounds ({savedAiBackgrounds.length})
          </h3>
          <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto pr-1">
            {savedAiBackgrounds.map((bg) => (
              <div
                key={bg.id}
                className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                  activeAiBackgroundId === bg.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => onApplySavedAiBackground?.(bg.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onApplySavedAiBackground?.(bg.id);
                }}
              >
                <div
                  className="w-full aspect-[500/720] bg-secondary"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(6,10,18,0.3), rgba(6,10,18,0.5))`,
                    backgroundSize: "cover",
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                    <span className="text-[9px] text-white/90 font-medium text-center truncate w-full">
                      Day {bg.dayNumber}
                    </span>
                    {bg.dayLabel && (
                      <span className="text-[8px] text-white/60 truncate w-full text-center">{bg.dayLabel}</span>
                    )}
                  </div>
                </div>
                {activeAiBackgroundId === bg.id && (
                  <div className="absolute top-0.5 right-0.5 bg-primary text-primary-foreground rounded-full px-1 py-0.5 text-[7px] font-bold">
                    ✓
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSavedAiBackground?.(bg.id);
                  }}
                  className="absolute bottom-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground rounded-full p-0.5"
                  title="Delete"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">Click a background to apply it. Hover to delete.</p>
        </div>
      )}

      {/* Batch Generation */}
      {onRunBatchGeneration && (
        <div className="glass-panel p-4 space-y-3">
          <h3 className="text-sm font-semibold text-primary flex items-center gap-1">
            <LayoutTemplate size={14} /> Batch Generation
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Download cards for multiple days at once. Uses current items/prices with different themes per day.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onRunBatchGeneration(7)}
              disabled={isBatchGenerating}
              className="rounded-md border border-border bg-secondary px-3 py-2 text-xs text-foreground hover:bg-secondary/80 disabled:opacity-50 flex items-center gap-1"
            >
              {isBatchGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Generate 7 Days
            </button>
            <button
              type="button"
              onClick={() => onRunBatchGeneration(30)}
              disabled={isBatchGenerating}
              className="rounded-md border border-border bg-secondary px-3 py-2 text-xs text-foreground hover:bg-secondary/80 disabled:opacity-50 flex items-center gap-1"
            >
              {isBatchGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Generate 30 Days
            </button>
          </div>
          {batchProgressLabel && (
            <div className="flex items-center gap-2 text-xs text-primary">
              <Loader2 size={14} className="animate-spin" />
              {batchProgressLabel}
            </div>
          )}
        </div>
      )}

      <div className="glass-panel p-4 space-y-3">
        <h3 className="text-sm font-semibold text-primary">Colors</h3>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_FIELDS.map(({ key, label, themeKey }) => (
            <div key={key} className="flex items-center gap-2">
              <input
                type="color"
                value={colorOverrides[key] || (theme[themeKey] as string)}
                onChange={(e) => setColorOverrides({ ...colorOverrides, [key]: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs text-muted-foreground flex-1">{label}</span>
              {colorOverrides[key] && (
                <button
                  onClick={() => {
                    const o = { ...colorOverrides };
                    delete o[key];
                    setColorOverrides(o);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-4 space-y-3">
        <button onClick={() => setShowTextStyles(!showTextStyles)} className="flex items-center justify-between w-full">
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
                        onChange={(e) => updateTextStyle(key, "color", e.target.value)}
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
                  <Slider value={[currentSize]} onValueChange={([v]) => updateTextStyle(key, "fontSize", v)} min={8} max={32} step={1} className="w-full" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="glass-panel p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary">Edit & Rearrange Items ({items.length})</h3>
          <button onClick={addItem} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
            <Plus size={14} /> Add
          </button>
        </div>

        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {items.map((item, i) => {
            const isExpanded = expandedItemId === item.id;
            return (
              <div
                key={item.id || i}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(i);
                }}
                onDrop={() => {
                  if (dragIndex !== null) moveItem(dragIndex, i);
                  setDragIndex(null);
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setDragOverIndex(null);
                }}
                className={`rounded-lg p-2 border ${dragOverIndex === i ? "border-primary" : "border-border"} bg-secondary/50 space-y-2`}
              >
                <div className="flex items-start gap-2">
                  <button className="text-muted-foreground mt-1 cursor-grab active:cursor-grabbing" title="Drag to move">
                    <GripVertical size={14} />
                  </button>

                  <div className="flex-1 space-y-1">
                    <Input placeholder="Fish name" value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} className="bg-secondary border-border h-8 text-xs" />
                    <Input placeholder="தமிழ் பெயர்" value={item.name_tamil} onChange={(e) => updateItem(i, "name_tamil", e.target.value)} className="bg-secondary border-border h-8 text-xs" />
                  </div>

                  <Input
                    placeholder="₹"
                    value={item.price}
                    onChange={(e) => updateItem(i, "price", e.target.value)}
                    className="bg-secondary border-border h-8 text-xs w-20 text-center"
                  />

                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveItem(i, i - 1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ArrowUp size={14} />
                    </button>
                    <button onClick={() => moveItem(i, i + 1)} disabled={i === items.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    className={`mt-1 ${isExpanded ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    title="Row style"
                  >
                    <Palette size={14} />
                  </button>

                  <button onClick={() => removeItem(i)} className="text-destructive hover:text-destructive/80 mt-1" title="Delete item">
                    <Trash2 size={14} />
                  </button>
                </div>

                {isExpanded && (
                  <div className="grid grid-cols-2 gap-2 border-t border-border pt-2">
                    <label className="text-[10px] text-muted-foreground space-y-1">
                      Row BG
                      <input
                        type="color"
                        value={item.style?.rowBackground || "#1f2336"}
                        onChange={(e) => updateItemStyle(i, "rowBackground", e.target.value)}
                        className="block w-full h-8 rounded bg-transparent"
                      />
                    </label>
                    <label className="text-[10px] text-muted-foreground space-y-1">
                      Badge BG
                      <input
                        type="color"
                        value={item.style?.badgeBackground || "#16c0f5"}
                        onChange={(e) => updateItemStyle(i, "badgeBackground", e.target.value)}
                        className="block w-full h-8 rounded bg-transparent"
                      />
                    </label>
                    <label className="text-[10px] text-muted-foreground space-y-1">
                      Name Color
                      <input
                        type="color"
                        value={item.style?.nameColor || "#ffffff"}
                        onChange={(e) => updateItemStyle(i, "nameColor", e.target.value)}
                        className="block w-full h-8 rounded bg-transparent"
                      />
                    </label>
                    <label className="text-[10px] text-muted-foreground space-y-1">
                      Tamil Color
                      <input
                        type="color"
                        value={item.style?.tamilColor || "#e0e0e0"}
                        onChange={(e) => updateItemStyle(i, "tamilColor", e.target.value)}
                        className="block w-full h-8 rounded bg-transparent"
                      />
                    </label>
                    <label className="text-[10px] text-muted-foreground space-y-1 col-span-2">
                      Price Text Color
                      <input
                        type="color"
                        value={item.style?.priceColor || "#000000"}
                        onChange={(e) => updateItemStyle(i, "priceColor", e.target.value)}
                        className="block w-full h-8 rounded bg-transparent"
                      />
                    </label>
                    <button
                      onClick={() => clearItemStyle(i)}
                      className="col-span-2 rounded-md border border-border bg-secondary px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      Reset row style
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel p-4 space-y-2">
        <Label className="text-xs text-muted-foreground">Special Note</Label>
        <Input value={specialNote} onChange={(e) => setSpecialNote(e.target.value)} className="bg-secondary border-border" placeholder="Today's special offer..." />
      </div>
    </div>
  );
};

export default CardControls;
