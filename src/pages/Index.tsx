import React, { useRef, useState, useMemo, createRef, useEffect } from "react";
import AppNav from "@/components/AppNav";
import CardCanvas from "@/components/CardCanvas";
import CardControls from "@/components/CardControls";
import { getThemeForDay, FONT_OPTIONS } from "@/lib/themes";
import { PriceItem, TextStyleOverrides, Shop } from "@/lib/shop";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { downloadMultipleCards, shareToWhatsApp, shareToInstagram, shareToFacebook, shareToTwitter, shareToTelegram, shareGeneric } from "@/lib/share";
import { Download, Share2, MessageCircle, Send, Twitter } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MAX_ITEMS_PER_PAGE = 10;

const DEFAULT_ITEMS: PriceItem[] = [
  { name: "Seer Fish", name_tamil: "வஞ்சிரம்", price: "850" },
  { name: "Prawns", name_tamil: "இறால்", price: "450" },
  { name: "Pomfret", name_tamil: "வாவல்", price: "600" },
  { name: "Sardine", name_tamil: "மத்தி", price: "150" },
  { name: "Red Snapper", name_tamil: "சங்கரா", price: "500" },
  { name: "Mackerel", name_tamil: "காணாங்கெளுத்தி", price: "200" },
  { name: "Crab", name_tamil: "நண்டு", price: "350" },
  { name: "Squid", name_tamil: "கணவாய்", price: "400" },
  { name: "Tuna", name_tamil: "சூரை", price: "550" },
  { name: "Anchovy", name_tamil: "நெத்திலி", price: "120" },
  { name: "Catfish", name_tamil: "கெளுத்தி", price: "280" },
  { name: "Lobster", name_tamil: "கடல் இறால்", price: "1200" },
  { name: "Barramundi", name_tamil: "கொடுவாய்", price: "650" },
  { name: "Tilapia", name_tamil: "திலாப்பியா", price: "180" },
  { name: "King Fish", name_tamil: "வஞ்சிரம் பெரியது", price: "950" },
  { name: "Silver Fish", name_tamil: "வெள்ளி மீன்", price: "160" },
];

const Index: React.FC = () => {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);

  const [dayNumber, setDayNumber] = useState(dayOfYear);
  const [dayLabel, setDayLabel] = useState(DAYS[now.getDay()]);
  const [items, setItems] = useState<PriceItem[]>(DEFAULT_ITEMS);
  const [specialNote, setSpecialNote] = useState("Order before 8 AM for same-day delivery!");
  const [showGradient, setShowGradient] = useState(true);
  const [font, setFont] = useState(FONT_OPTIONS[0].value);
  const [colorOverrides, setColorOverrides] = useState<{
    accent?: string; shopName?: string; itemText?: string;
    tamilText?: string; priceBadge?: string; dayBanner?: string;
  }>({});
  const [textStyles, setTextStyles] = useState<TextStyleOverrides>({});
  const [activePage, setActivePage] = useState(0);

  const shop = getShop();
  const theme = getThemeForDay(dayNumber);

  // Split items into pages
  const pages = useMemo(() => {
    const result: PriceItem[][] = [];
    for (let i = 0; i < items.length; i += MAX_ITEMS_PER_PAGE) {
      result.push(items.slice(i, i + MAX_ITEMS_PER_PAGE));
    }
    return result.length > 0 ? result : [[]];
  }, [items]);

  const totalPages = pages.length;

  // Create refs for each page canvas
  const canvasRefs = useMemo(() => {
    return pages.map(() => createRef<HTMLDivElement>());
  }, [pages.length]);

  const getCanvasElements = (): HTMLElement[] => {
    return canvasRefs
      .map(r => r.current)
      .filter((el): el is HTMLDivElement => el !== null);
  };

  const handleDownload = async () => {
    const elements = getCanvasElements();
    if (elements.length === 0) return;
    await downloadMultipleCards(elements, `fish-prices-day${dayNumber}`);
    toast.success(`${elements.length} card${elements.length > 1 ? "s" : ""} downloaded!`);
    saveCard({
      id: `card-${dayNumber}-${Date.now()}`,
      shop_id: "local",
      day_number: dayNumber,
      card_date: new Date().toISOString(),
      day_label: dayLabel,
      background_color: theme.gradient,
      accent_color: theme.accentColor,
      items,
      special_note: specialNote,
      is_published: true,
    });
  };

  const shareText = `🐟 Today's Fish Prices from ${shop.shop_name}! Day ${dayNumber}`;

  const handleWhatsApp = async () => {
    const el = getCanvasElements();
    if (!el.length) return;
    await shareToWhatsApp(el, shareText);
    toast.success("Shared to WhatsApp!");
  };

  const handleInstagram = async () => {
    const el = getCanvasElements();
    if (!el.length) return;
    await shareToInstagram(el);
    toast.success("Image ready for Instagram!");
  };

  const handleFacebook = async () => {
    const el = getCanvasElements();
    if (!el.length) return;
    await shareToFacebook(el);
    toast.success("Image ready for Facebook!");
  };

  const handleTwitter = async () => {
    const el = getCanvasElements();
    if (!el.length) return;
    await shareToTwitter(el, shareText);
    toast.success("Image ready for Twitter/X!");
  };

  const handleTelegram = async () => {
    const el = getCanvasElements();
    if (!el.length) return;
    await shareToTelegram(el, shareText);
    toast.success("Shared to Telegram!");
  };

  const handleGenericShare = async () => {
    const el = getCanvasElements();
    if (!el.length) return;
    await shareGeneric(el, shareText);
    toast.success("Shared!");
  };

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      <AppNav />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-6">
        {/* Controls */}
        <div className="order-2 lg:order-1">
          <CardControls
            dayNumber={dayNumber} setDayNumber={setDayNumber}
            dayLabel={dayLabel} setDayLabel={setDayLabel}
            items={items} setItems={setItems}
            specialNote={specialNote} setSpecialNote={setSpecialNote}
            showGradient={showGradient} setShowGradient={setShowGradient}
            font={font} setFont={setFont}
            colorOverrides={colorOverrides} setColorOverrides={setColorOverrides}
            textStyles={textStyles} setTextStyles={setTextStyles}
            theme={theme}
          />
        </div>

        {/* Card preview + actions */}
        <div className="order-1 lg:order-2 flex flex-col items-center gap-4">
          {/* Page tabs when multi-page */}
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

          {/* Render all pages but only show active */}
          {pages.map((pageItems, pageIdx) => (
            <div
              key={pageIdx}
              className={`glass-panel p-3 glow-border ${pageIdx !== activePage ? "hidden" : ""}`}
            >
              <CardCanvas
                shop={shop} dayNumber={dayNumber} dayLabel={dayLabel}
                theme={theme} items={pageItems} specialNote={pageIdx === pages.length - 1 ? specialNote : ""}
                showGradient={showGradient} font={font}
                colorOverrides={colorOverrides} textStyles={textStyles}
                ref={canvasRefs[pageIdx]}
                pageNumber={pageIdx + 1} totalPages={totalPages}
              />
            </div>
          ))}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button onClick={handleDownload}
              className="glass-panel px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
              <Download size={16} /> Download {totalPages > 1 ? `All (${totalPages})` : "HD"}
            </button>
            <button onClick={handleWhatsApp}
              className="glass-panel px-3 py-2.5 flex items-center gap-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
              style={{ color: "#25D366" }}>
              <MessageCircle size={16} /> WhatsApp
            </button>
            <button onClick={handleInstagram}
              className="glass-panel px-3 py-2.5 flex items-center gap-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
              style={{ color: "#E1306C" }}>
              <Share2 size={16} /> Instagram
            </button>
            <button onClick={handleFacebook}
              className="glass-panel px-3 py-2.5 flex items-center gap-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
              style={{ color: "#1877F2" }}>
              <Share2 size={16} /> Facebook
            </button>
            <button onClick={handleTwitter}
              className="glass-panel px-3 py-2.5 flex items-center gap-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
              style={{ color: "#1DA1F2" }}>
              <Twitter size={16} /> X
            </button>
            <button onClick={handleTelegram}
              className="glass-panel px-3 py-2.5 flex items-center gap-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
              style={{ color: "#0088cc" }}>
              <Send size={16} /> Telegram
            </button>
            <button onClick={handleGenericShare}
              className="glass-panel px-3 py-2.5 flex items-center gap-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">
              <Share2 size={16} /> More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
