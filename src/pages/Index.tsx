import React, { useRef, useState } from "react";
import AppNav from "@/components/AppNav";
import CardCanvas from "@/components/CardCanvas";
import CardControls from "@/components/CardControls";
import { getThemeForDay, FONT_OPTIONS } from "@/lib/themes";
import { getShop, saveCard, PriceItem } from "@/lib/shop";
import { downloadCard, shareToWhatsApp, shareToInstagram, shareToFacebook } from "@/lib/share";
import { Download, Share2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DEFAULT_ITEMS: PriceItem[] = [
  { name: "Seer Fish", name_tamil: "வஞ்சிரம்", price: "850" },
  { name: "Prawns", name_tamil: "இறால்", price: "450" },
  { name: "Pomfret", name_tamil: "வாவல்", price: "600" },
  { name: "Sardine", name_tamil: "மத்தி", price: "150" },
  { name: "Red Snapper", name_tamil: "சங்கரா", price: "500" },
  { name: "Mackerel", name_tamil: "காணாங்கெளுத்தி", price: "200" },
  { name: "Crab", name_tamil: "நண்டு", price: "350" },
  { name: "Squid", name_tamil: "கணவாய்", price: "400" },
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
  const canvasRef = useRef<HTMLDivElement>(null);

  const shop = getShop();
  const theme = getThemeForDay(dayNumber);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    await downloadCard(canvasRef.current, `fish-prices-day${dayNumber}.png`);
    toast.success("Card downloaded!");
    // Save card
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

  const handleWhatsApp = async () => {
    if (!canvasRef.current) return;
    await shareToWhatsApp(canvasRef.current, `🐟 Today's Fish Prices from ${shop.shop_name}! Day ${dayNumber}`);
    toast.success("Shared to WhatsApp!");
  };

  const handleInstagram = async () => {
    if (!canvasRef.current) return;
    await shareToInstagram(canvasRef.current);
    toast.success("Image ready for Instagram!");
  };

  const handleFacebook = async () => {
    if (!canvasRef.current) return;
    await shareToFacebook(canvasRef.current);
    toast.success("Image ready for Facebook!");
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
            theme={theme}
          />
        </div>

        {/* Card preview + actions */}
        <div className="order-1 lg:order-2 flex flex-col items-center gap-4">
          <div className="glass-panel p-3 glow-border">
            <CardCanvas
              shop={shop} dayNumber={dayNumber} dayLabel={dayLabel}
              theme={theme} items={items} specialNote={specialNote}
              showGradient={showGradient} font={font}
              colorOverrides={colorOverrides} canvasRef={canvasRef}
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button onClick={handleDownload}
              className="glass-panel px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
              <Download size={16} /> Download HD
            </button>
            <button onClick={handleWhatsApp}
              className="glass-panel px-4 py-2.5 flex items-center gap-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
              style={{ color: "#25D366" }}>
              <MessageCircle size={16} /> WhatsApp
            </button>
            <button onClick={handleInstagram}
              className="glass-panel px-4 py-2.5 flex items-center gap-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
              style={{ color: "#E1306C" }}>
              <Share2 size={16} /> Instagram
            </button>
            <button onClick={handleFacebook}
              className="glass-panel px-4 py-2.5 flex items-center gap-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
              style={{ color: "#1877F2" }}>
              <Share2 size={16} /> Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
