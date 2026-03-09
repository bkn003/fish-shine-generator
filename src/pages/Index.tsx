import React, { useState, useMemo, createRef, useEffect, useCallback } from "react";
import AppNav from "@/components/AppNav";
import CardCanvas from "@/components/CardCanvas";
import CardControls from "@/components/CardControls";
import { getThemeForDay, FONT_OPTIONS, getDefaultFishBackgroundPrompt } from "@/lib/themes";
import {
  PriceItem,
  TextStyleOverrides,
  Shop,
  PosterPreset,
  PosterPresetData,
  getPosterPresets,
  savePosterPreset,
  deletePosterPreset,
} from "@/lib/shop";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { downloadMultipleCards, shareToWhatsApp, shareToInstagram, shareToFacebook, shareToTwitter, shareToTelegram, shareGeneric } from "@/lib/share";
import { Download, Share2, MessageCircle, Send, Twitter, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MAX_ITEMS_PER_PAGE = 9;

const createItemId = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

const DEFAULT_ITEMS: PriceItem[] = [
  { id: "seer-fish", name: "Seer Fish", name_tamil: "வஞ்சிரம்", price: "850" },
  { id: "prawns", name: "Prawns", name_tamil: "இறால்", price: "450" },
  { id: "pomfret", name: "Pomfret", name_tamil: "வாவல்", price: "600" },
  { id: "sardine", name: "Sardine", name_tamil: "மத்தி", price: "150" },
  { id: "red-snapper", name: "Red Snapper", name_tamil: "சங்கரா", price: "500" },
  { id: "mackerel", name: "Mackerel", name_tamil: "காணாங்கெளுத்தி", price: "200" },
  { id: "crab", name: "Crab", name_tamil: "நண்டு", price: "350" },
  { id: "squid", name: "Squid", name_tamil: "கணவாய்", price: "400" },
  { id: "tuna", name: "Tuna", name_tamil: "சூரை", price: "550" },
  { id: "anchovy", name: "Anchovy", name_tamil: "நெத்திலி", price: "120" },
  { id: "catfish", name: "Catfish", name_tamil: "கெளுத்தி", price: "280" },
  { id: "lobster", name: "Lobster", name_tamil: "கடல் இறால்", price: "1200" },
  { id: "barramundi", name: "Barramundi", name_tamil: "கொடுவாய்", price: "650" },
  { id: "tilapia", name: "Tilapia", name_tamil: "திலாப்பியா", price: "180" },
  { id: "king-fish", name: "King Fish", name_tamil: "வஞ்சிரம் பெரியது", price: "950" },
  { id: "silver-fish", name: "Silver Fish", name_tamil: "வெள்ளி மீன்", price: "160" },
];

const normalizeItems = (list: PriceItem[]): PriceItem[] =>
  list.map((item) => ({
    id: item.id || createItemId(),
    name: item.name || "",
    name_tamil: item.name_tamil || "",
    price: item.price || "",
    style: item.style,
  }));

const Index: React.FC = () => {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const [searchParams] = useSearchParams();
  const dayFromGallery = searchParams.get("day");
  const selectedDay = Number(dayFromGallery);
  const initialDay = Number.isFinite(selectedDay) && selectedDay >= 1 ? selectedDay : dayOfYear;

  const [dayNumber, setDayNumber] = useState(initialDay);
  const [dayLabel, setDayLabel] = useState(DAYS[now.getDay()]);
  const [items, setItems] = useState<PriceItem[]>(normalizeItems(DEFAULT_ITEMS));
  const [specialNote, setSpecialNote] = useState("Order before 8 AM for same-day delivery!");
  const [showGradient, setShowGradient] = useState(true);
  const [usePremiumBackground, setUsePremiumBackground] = useState(true);
  const [font, setFont] = useState(FONT_OPTIONS[0].value);
  const [itemsHeaderLabel, setItemsHeaderLabel] = useState("Fish / மீன்");
  const [priceHeaderLabel, setPriceHeaderLabel] = useState("Price");
  const [colorOverrides, setColorOverrides] = useState<{
    accent?: string;
    shopName?: string;
    itemText?: string;
    tamilText?: string;
    priceBadge?: string;
    dayBanner?: string;
  }>({});
  const [textStyles, setTextStyles] = useState<TextStyleOverrides>({});
  const [activePage, setActivePage] = useState(0);
  const [shop, setShop] = useState<Shop>({
    shop_name: "Fresh Fish Market",
    shop_name_tamil: "புதிய மீன் சந்தை",
    tagline: "Daily Fresh Catch",
    logo_url: "",
    phone: "",
    address: "",
    delivery_note: "Free delivery above ₹500",
    owner_email: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [presets, setPresets] = useState<PosterPreset[]>(() => getPosterPresets());
  const [activePresetId, setActivePresetId] = useState("");
  const [aiBackgroundPrompt, setAiBackgroundPrompt] = useState("");
  const [customBackgroundImage, setCustomBackgroundImage] = useState("");
  const [isGeneratingAiBackground, setIsGeneratingAiBackground] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    supabase.from("shops").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setShop({
          shop_name: data.shop_name,
          shop_name_tamil: data.shop_name_tamil || "",
          tagline: data.tagline || "",
          logo_url: data.logo_url || "",
          phone: data.phone || "",
          address: data.address || "",
          delivery_note: data.delivery_note || "",
          owner_email: user.email || "",
        });
      }
    });
  }, [user]);

  useEffect(() => {
    const n = Number(dayFromGallery);
    if (Number.isFinite(n) && n >= 1) {
      setDayNumber(n);
    }
  }, [dayFromGallery]);

  const theme = getThemeForDay(dayNumber);

  const pages = useMemo(() => {
    const result: PriceItem[][] = [];
    for (let i = 0; i < items.length; i += MAX_ITEMS_PER_PAGE) {
      result.push(items.slice(i, i + MAX_ITEMS_PER_PAGE));
    }
    return result.length > 0 ? result : [[]];
  }, [items]);

  useEffect(() => {
    if (activePage >= pages.length) {
      setActivePage(Math.max(0, pages.length - 1));
    }
  }, [activePage, pages.length]);

  const totalPages = pages.length;

  const captureRefs = useMemo(() => {
    return pages.map(() => createRef<HTMLDivElement>());
  }, [pages.length]);

  const getCanvasElements = () => {
    return captureRefs.map((r) => r.current).filter((el): el is HTMLDivElement => el !== null);
  };

  const buildPresetData = useCallback(
    (): PosterPresetData => ({
      dayNumber,
      dayLabel,
      items: normalizeItems(items),
      specialNote,
      showGradient,
      usePremiumBackground,
      font,
      itemsHeaderLabel,
      priceHeaderLabel,
      shop,
      colorOverrides,
      textStyles,
      aiBackgroundPrompt,
    }),
    [
      dayNumber,
      dayLabel,
      items,
      specialNote,
      showGradient,
      usePremiumBackground,
      font,
      itemsHeaderLabel,
      priceHeaderLabel,
      shop,
      colorOverrides,
      textStyles,
      aiBackgroundPrompt,
    ],
  );

  const applyPresetData = useCallback((data: PosterPresetData) => {
    setDayNumber(data.dayNumber || 1);
    setDayLabel(data.dayLabel || "");
    setItems(normalizeItems(data.items || []));
    setSpecialNote(data.specialNote || "");
    setShowGradient(Boolean(data.showGradient));
    setUsePremiumBackground(data.usePremiumBackground !== false);
    setFont(data.font || FONT_OPTIONS[0].value);
    setItemsHeaderLabel(data.itemsHeaderLabel || "Fish / மீன்");
    setPriceHeaderLabel(data.priceHeaderLabel || "Price");
    setShop(data.shop || shop);
    setColorOverrides(data.colorOverrides || {});
    setTextStyles(data.textStyles || {});
    setAiBackgroundPrompt(data.aiBackgroundPrompt || "");
    setCustomBackgroundImage("");
    setActivePage(0);
  }, [shop]);

  const handleApplyPreset = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;
    applyPresetData(preset.data);
    setActivePresetId(presetId);
    toast.success(`Preset "${preset.name}" applied`);
  };

  const handleSavePreset = (name: string) => {
    const preset: PosterPreset = {
      id: createItemId(),
      name,
      created_at: new Date().toISOString(),
      data: buildPresetData(),
    };
    savePosterPreset(preset);
    setPresets(getPosterPresets());
    setActivePresetId(preset.id);
    toast.success(`Preset "${name}" saved`);
  };

  const handleDeletePreset = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    deletePosterPreset(presetId);
    setPresets(getPosterPresets());
    if (activePresetId === presetId) setActivePresetId("");
    toast.success(`Preset "${preset?.name || "selected"}" deleted`);
  };

  const resolveAiPrompt = (isVariation = false) => {
    const basePrompt = aiBackgroundPrompt.trim() || getDefaultFishBackgroundPrompt(dayNumber, dayLabel);
    if (!isVariation) return basePrompt;

    return `${basePrompt}\nCreate a different visual composition from the last one with new fish placement, new lighting, and new texture balance while keeping readability-safe center space.`;
  };

  const handleGenerateAiBackground = async (isVariation = false) => {
    setIsGeneratingAiBackground(true);
    const promptToUse = resolveAiPrompt(isVariation);

    try {
      const { data, error } = await supabase.functions.invoke("generate-fish-background", {
        body: {
          mode: "generate",
          dayNumber,
          dayLabel,
          prompt: promptToUse,
          variation: isVariation,
          save: Boolean(user),
        },
      });

      if (error) {
        throw new Error(error.message || "Unable to generate background right now.");
      }

      if (!data?.imageUrl) {
        throw new Error(data?.error || "No image returned from AI.");
      }

      setCustomBackgroundImage(data.imageUrl);
      if (!aiBackgroundPrompt.trim()) {
        setAiBackgroundPrompt(data.promptUsed || promptToUse);
      }
      toast.success("AI fish background generated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI background generation failed. Please retry.";
      toast.error(message);
    } finally {
      setIsGeneratingAiBackground(false);
    }
  };

  const handleClearAiBackground = () => {
    setCustomBackgroundImage("");
    toast.success("AI background cleared.");
  };

  const handleDownload = async () => {
    const elements = getCanvasElements();
    if (elements.length === 0) return;

    setIsProcessing(true);
    try {
      await downloadMultipleCards(elements, `fish-prices-day${dayNumber}`);
      toast.success(`${elements.length} card${elements.length > 1 ? "s" : ""} downloaded!`);

      if (user) {
        await supabase.from("price_cards").insert({
          user_id: user.id,
          day_number: dayNumber,
          day_label: dayLabel,
          background_color: theme.gradient,
          accent_color: theme.accentColor,
          items: items as any,
          special_note: specialNote,
          is_published: true,
        });
      }
    } catch {
      toast.error("Download failed. Please try once more.");
    } finally {
      setIsProcessing(false);
    }
  };

  const shareText = `🐟 Today's Fish Prices from ${shop.shop_name} - ${dayLabel}`;

  const runShare = async (fn: () => Promise<void>, msg: string) => {
    const el = getCanvasElements();
    if (!el.length) return;

    setIsProcessing(true);
    try {
      await fn();
      toast.success(msg);
    } catch {
      toast.error("Share failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      <AppNav />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-6">
        <div className="order-2 lg:order-1">
          <CardControls
            dayNumber={dayNumber}
            setDayNumber={setDayNumber}
            dayLabel={dayLabel}
            setDayLabel={setDayLabel}
            items={items}
            setItems={setItems}
            specialNote={specialNote}
            setSpecialNote={setSpecialNote}
            showGradient={showGradient}
            setShowGradient={setShowGradient}
            usePremiumBackground={usePremiumBackground}
            setUsePremiumBackground={setUsePremiumBackground}
            font={font}
            setFont={setFont}
            shop={shop}
            setShop={setShop}
            itemsHeaderLabel={itemsHeaderLabel}
            setItemsHeaderLabel={setItemsHeaderLabel}
            priceHeaderLabel={priceHeaderLabel}
            setPriceHeaderLabel={setPriceHeaderLabel}
            colorOverrides={colorOverrides}
            setColorOverrides={setColorOverrides}
            textStyles={textStyles}
            setTextStyles={setTextStyles}
            theme={theme}
            presets={presets}
            activePresetId={activePresetId}
            onApplyPreset={handleApplyPreset}
            onSavePreset={handleSavePreset}
            onDeletePreset={handleDeletePreset}
            aiBackgroundPrompt={aiBackgroundPrompt}
            setAiBackgroundPrompt={setAiBackgroundPrompt}
            hasCustomBackground={Boolean(customBackgroundImage)}
            isGeneratingAiBackground={isGeneratingAiBackground}
            onGenerateAiBackground={handleGenerateAiBackground}
            onClearAiBackground={handleClearAiBackground}
          />
        </div>

        <div className="order-1 lg:order-2 flex flex-col items-center gap-4 relative">
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActivePage(i)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    activePage === i ? "bg-primary text-primary-foreground" : "glass-panel text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Page {i + 1}
                </button>
              ))}
              <span className="text-xs text-muted-foreground ml-2">
                {items.length} items → {totalPages} pages
              </span>
            </div>
          )}

          <div id="price-card" className="glass-panel p-3 glow-border">
            <CardCanvas
              shop={shop}
              dayLabel={dayLabel}
              dayNumber={dayNumber}
              theme={theme}
              items={pages[activePage] || []}
              specialNote={activePage === pages.length - 1 ? specialNote : ""}
              showGradient={showGradient}
              usePremiumBackground={usePremiumBackground}
              customBackgroundImage={customBackgroundImage}
              font={font}
              itemsHeaderLabel={itemsHeaderLabel}
              priceHeaderLabel={priceHeaderLabel}
              colorOverrides={colorOverrides}
              textStyles={textStyles}
            />
          </div>

          <div
            style={{
              position: "fixed",
              top: 0,
              left: "-10000px",
              width: CAPTURE_WIDTH,
              pointerEvents: "none",
              opacity: 1,
              zIndex: -1,
            }}
            aria-hidden
          >
            {pages.map((pageItems, pageIdx) => (
              <div key={`capture-wrapper-${pageIdx}`} style={{ marginBottom: 8 }}>
                <CardCanvas
                  key={`capture-${pageIdx}`}
                  shop={shop}
                  dayLabel={dayLabel}
                  dayNumber={dayNumber}
                  theme={theme}
                  items={pageItems}
                  specialNote={pageIdx === pages.length - 1 ? specialNote : ""}
                  showGradient={showGradient}
                  usePremiumBackground={usePremiumBackground}
                  customBackgroundImage={customBackgroundImage}
                  font={font}
                  itemsHeaderLabel={itemsHeaderLabel}
                  priceHeaderLabel={priceHeaderLabel}
                  colorOverrides={colorOverrides}
                  textStyles={textStyles}
                  ref={captureRefs[pageIdx]}
                />
              </div>
            ))}
          </div>

          <div className="action-buttons flex flex-wrap gap-2 justify-center">
            <button
              onClick={handleDownload}
              disabled={isProcessing}
              className="glass-panel px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {isProcessing ? "Processing..." : totalPages > 1 ? `Download All (${totalPages})` : "Download HD"}
            </button>

            <button
              disabled={isProcessing}
              onClick={() => runShare(() => shareToWhatsApp(getCanvasElements(), shareText), "Shared to WhatsApp!")}
              className="glass-panel px-3 py-2.5 flex items-center gap-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <MessageCircle size={16} /> WhatsApp
            </button>

            <button
              disabled={isProcessing}
              onClick={() => runShare(() => shareToInstagram(getCanvasElements()), "Image ready for Instagram!")}
              className="glass-panel px-3 py-2.5 flex items-center gap-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <Share2 size={16} /> Instagram
            </button>

            <button
              disabled={isProcessing}
              onClick={() => runShare(() => shareToFacebook(getCanvasElements()), "Image ready for Facebook!")}
              className="glass-panel px-3 py-2.5 flex items-center gap-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <Share2 size={16} /> Facebook
            </button>

            <button
              disabled={isProcessing}
              onClick={() => runShare(() => shareToTwitter(getCanvasElements(), shareText), "Image ready for Twitter/X!")}
              className="glass-panel px-3 py-2.5 flex items-center gap-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <Twitter size={16} /> X
            </button>

            <button
              disabled={isProcessing}
              onClick={() => runShare(() => shareToTelegram(getCanvasElements(), shareText), "Shared to Telegram!")}
              className="glass-panel px-3 py-2.5 flex items-center gap-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <Send size={16} /> Telegram
            </button>

            <button
              disabled={isProcessing}
              onClick={() => runShare(() => shareGeneric(getCanvasElements(), shareText), "Shared!")}
              className="glass-panel px-3 py-2.5 flex items-center gap-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <Share2 size={16} /> More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CAPTURE_WIDTH = 500;

export default Index;
