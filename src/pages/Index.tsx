import React, { useState, useMemo, createRef, useEffect } from "react";
import AppNav from "@/components/AppNav";
import CardCanvas from "@/components/CardCanvas";
import CardControls from "@/components/CardControls";
import { getThemeForDay, FONT_OPTIONS } from "@/lib/themes";
import { PriceItem, TextStyleOverrides, Shop } from "@/lib/shop";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { downloadMultipleCards, shareToWhatsApp, shareToInstagram, shareToFacebook, shareToTwitter, shareToTelegram, shareGeneric } from "@/lib/share";
import { Download, Share2, MessageCircle, Send, Twitter, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

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
  const [searchParams] = useSearchParams();
  const dayFromGallery = searchParams.get("day");
  const selectedDay = Number(dayFromGallery);
  const initialDay = Number.isFinite(selectedDay) && selectedDay >= 1 && selectedDay <= 365 ? selectedDay : dayOfYear;

  const [dayNumber, setDayNumber] = useState(initialDay);
  const [dayLabel, setDayLabel] = useState(DAYS[now.getDay()]);
  const [items, setItems] = useState<PriceItem[]>(DEFAULT_ITEMS);
  const [specialNote, setSpecialNote] = useState("Order before 8 AM for same-day delivery!");
  const [showGradient, setShowGradient] = useState(true);
  const [font, setFont] = useState(FONT_OPTIONS[0].value);
  const [itemsHeaderLabel, setItemsHeaderLabel] = useState("Fish / மீன்");
  const [priceHeaderLabel, setPriceHeaderLabel] = useState("Price");
  const [colorOverrides, setColorOverrides] = useState<{
    accent?: string; shopName?: string; itemText?: string;
    tamilText?: string; priceBadge?: string; dayBanner?: string;
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
    if (Number.isFinite(n) && n >= 1 && n <= 365) {
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

  const totalPages = pages.length;

  const canvasRefs = useMemo(() => {
    return pages.map(() => createRef<HTMLDivElement>());
  }, [pages.length]);

  const getCanvasElements = (): HTMLElement[] => {
    return canvasRefs.map((r) => r.current).filter((el): el is HTMLDivElement => el !== null);
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
    } finally {
      setIsProcessing(false);
    }
  };

  const shareText = `🐟 Today's Fish Prices from ${shop.shop_name}! Day ${dayNumber}`;

  const runShare = async (fn: () => Promise<void>, msg: string) => {
    const el = getCanvasElements();
    if (!el.length) return;
    setIsProcessing(true);
    try {
      await fn();
      toast.success(msg);
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
            dayNumber={dayNumber} setDayNumber={setDayNumber}
            dayLabel={dayLabel} setDayLabel={setDayLabel}
            items={items} setItems={setItems}
            specialNote={specialNote} setSpecialNote={setSpecialNote}
            showGradient={showGradient} setShowGradient={setShowGradient}
            font={font} setFont={setFont}
            shop={shop} setShop={setShop}
            itemsHeaderLabel={itemsHeaderLabel} setItemsHeaderLabel={setItemsHeaderLabel}
            priceHeaderLabel={priceHeaderLabel} setPriceHeaderLabel={setPriceHeaderLabel}
            colorOverrides={colorOverrides} setColorOverrides={setColorOverrides}
            textStyles={textStyles} setTextStyles={setTextStyles}
            theme={theme}
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

          <div className="glass-panel p-3 glow-border">
            <CardCanvas
              shop={shop}
              dayNumber={dayNumber}
              dayLabel={dayLabel}
              theme={theme}
              items={pages[activePage] || []}
              specialNote={activePage === pages.length - 1 ? specialNote : ""}
              showGradient={showGradient}
              font={font}
              itemsHeaderLabel={itemsHeaderLabel}
              priceHeaderLabel={priceHeaderLabel}
              colorOverrides={colorOverrides}
              textStyles={textStyles}
              ref={canvasRefs[activePage]}
              pageNumber={activePage + 1}
              totalPages={totalPages}
            />
          </div>

          <div style={{ position: "absolute", left: "-9999px", top: 0 }} aria-hidden>
            {pages.map((pageItems, pageIdx) =>
              pageIdx !== activePage ? (
                <CardCanvas
                  key={pageIdx}
                  shop={shop}
                  dayNumber={dayNumber}
                  dayLabel={dayLabel}
                  theme={theme}
                  items={pageItems}
                  specialNote={pageIdx === pages.length - 1 ? specialNote : ""}
                  showGradient={showGradient}
                  font={font}
                  itemsHeaderLabel={itemsHeaderLabel}
                  priceHeaderLabel={priceHeaderLabel}
                  colorOverrides={colorOverrides}
                  textStyles={textStyles}
                  ref={canvasRefs[pageIdx]}
                  pageNumber={pageIdx + 1}
                  totalPages={totalPages}
                />
              ) : null
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
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
              className="glass-panel px-3 py-2.5 flex items-center gap-2 text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
              style={{ color: "#25D366" }}
            >
              <MessageCircle size={16} /> WhatsApp
            </button>

            <button
              disabled={isProcessing}
              onClick={() => runShare(() => shareToInstagram(getCanvasElements()), "Image ready for Instagram!")}
              className="glass-panel px-3 py-2.5 flex items-center gap-2 text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
              style={{ color: "#E1306C" }}
            >
              <Share2 size={16} /> Instagram
            </button>

            <button
              disabled={isProcessing}
              onClick={() => runShare(() => shareToFacebook(getCanvasElements()), "Image ready for Facebook!")}
              className="glass-panel px-3 py-2.5 flex items-center gap-2 text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
              style={{ color: "#1877F2" }}
            >
              <Share2 size={16} /> Facebook
            </button>

            <button
              disabled={isProcessing}
              onClick={() => runShare(() => shareToTwitter(getCanvasElements(), shareText), "Image ready for Twitter/X!")}
              className="glass-panel px-3 py-2.5 flex items-center gap-2 text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
              style={{ color: "#1DA1F2" }}
            >
              <Twitter size={16} /> X
            </button>

            <button
              disabled={isProcessing}
              onClick={() => runShare(() => shareToTelegram(getCanvasElements(), shareText), "Shared to Telegram!")}
              className="glass-panel px-3 py-2.5 flex items-center gap-2 text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
              style={{ color: "#0088cc" }}
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

export default Index;
