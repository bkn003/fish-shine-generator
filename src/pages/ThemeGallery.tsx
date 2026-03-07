import React, { useState, useMemo } from "react";
import AppNav from "@/components/AppNav";
import { getThemeForDay } from "@/lib/themes";
import { Input } from "@/components/ui/input";
import { Search, Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ThemeGallery: React.FC = () => {
  const [search, setSearch] = useState("");
  const [startDay, setStartDay] = useState(1);
  const [previewCount, setPreviewCount] = useState(120);
  const navigate = useNavigate();

  const safeStartDay = Math.max(1, Number.isFinite(startDay) ? Math.floor(startDay) : 1);
  const safePreviewCount = Math.max(20, Math.min(300, Number.isFinite(previewCount) ? Math.floor(previewCount) : 120));

  const allThemes = useMemo(() => {
    return Array.from({ length: safePreviewCount }, (_, i) => {
      const day = safeStartDay + i;
      return {
        day,
        theme: getThemeForDay(day),
      };
    });
  }, [safePreviewCount, safeStartDay]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allThemes;
    const q = search.toLowerCase();
    return allThemes.filter((t) => t.theme.name.toLowerCase().includes(q) || String(t.day).includes(q));
  }, [allThemes, search]);

  const handleThemeClick = (day: number, themeName: string) => {
    toast.success(`Theme "${themeName}" (Day ${day}) applied!`);
    navigate(`/?day=${day}`);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      <AppNav />

      <div className="glass-panel p-4 mb-4 space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-primary glow-text">Unlimited Theme Gallery</h2>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Sparkles size={12} /> Explore and apply premium themes for any day number
            </p>
          </div>
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search theme or day..."
              className="bg-secondary border-border pl-8 h-8 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <p className="text-[11px] text-muted-foreground mb-1">Start Day</p>
            <Input
              type="number"
              min={1}
              value={safeStartDay}
              onChange={(e) => setStartDay(Math.max(1, parseInt(e.target.value || "1", 10)))}
              className="bg-secondary border-border h-8 text-xs"
            />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground mb-1">Preview Count (20-300)</p>
            <Input
              type="number"
              min={20}
              max={300}
              value={safePreviewCount}
              onChange={(e) => setPreviewCount(Math.max(20, Math.min(300, parseInt(e.target.value || "120", 10))))}
              className="bg-secondary border-border h-8 text-xs"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setStartDay((prev) => Math.max(1, prev + safePreviewCount))}
              className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-xs text-foreground hover:bg-secondary/80"
            >
              Next Range
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {filtered.map(({ day, theme }) => (
          <div
            key={day}
            onClick={() => handleThemeClick(day, theme.name)}
            className="glass-panel overflow-hidden cursor-pointer hover:scale-105 transition-transform group relative"
            title={`Click to apply "${theme.name}" theme`}
          >
            <div
              style={{
                backgroundImage: `${theme.premiumPattern}, ${theme.gradient}`,
                backgroundSize: "cover, cover",
                backgroundBlendMode: "screen, normal",
                height: 80,
              }}
              className="relative flex flex-col items-center justify-center"
            >
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  right: -10,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${theme.glowColor}44, transparent)`,
                }}
              />

              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-colors flex items-center justify-center">
                <Check size={20} className="text-foreground opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
              </div>
              <span style={{ color: theme.shopNameColor, fontSize: 10, fontWeight: 700 }}>Day {day}</span>
              <div style={{ background: theme.badgeColor, color: theme.accentColor, fontSize: 8, padding: "1px 6px", borderRadius: 8, marginTop: 2 }}>
                ₹250
              </div>
            </div>
            <div className="p-1.5 text-center">
              <div className="text-[10px] font-medium text-foreground truncate">{theme.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeGallery;
