import React, { useState, useMemo } from "react";
import AppNav from "@/components/AppNav";
import { getThemeForDay } from "@/lib/themes";
import { Input } from "@/components/ui/input";
import { Search, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TOTAL = 365;
const PER_PAGE = 60;

const ThemeGallery: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const allThemes = useMemo(() => {
    return Array.from({ length: TOTAL }, (_, i) => ({
      day: i + 1,
      theme: getThemeForDay(i + 1),
    }));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return allThemes;
    const q = search.toLowerCase();
    return allThemes.filter(t =>
      t.theme.name.toLowerCase().includes(q) || String(t.day).includes(q)
    );
  }, [allThemes, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const handleThemeClick = (day: number, themeName: string) => {
    toast.success(`Theme "${themeName}" (Day ${day}) applied!`);
    navigate(`/?day=${day}`);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      <AppNav />

      <div className="glass-panel p-4 mb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-primary glow-text">365 Theme Gallery</h2>
            <p className="text-xs text-muted-foreground mt-1">Click any theme to apply it to the card generator</p>
          </div>
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search theme or day..."
              className="bg-secondary border-border pl-8 h-8 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {pageItems.map(({ day, theme }) => (
          <div
            key={day}
            onClick={() => handleThemeClick(day, theme.name)}
            className="glass-panel overflow-hidden cursor-pointer hover:scale-105 transition-transform group relative"
            title={`Click to apply "${theme.name}" theme`}
          >
            <div
              style={{ background: theme.gradient, height: 80 }}
              className="relative flex flex-col items-center justify-center"
            >
              <div
                style={{
                  position: "absolute", top: -10, right: -10,
                  width: 40, height: 40, borderRadius: "50%",
                  background: `radial-gradient(circle, ${theme.glowColor}44, transparent)`,
                }}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Check size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
              </div>
              <span style={{ color: theme.shopNameColor, fontSize: 10, fontWeight: 700 }}>
                Day {day}
              </span>
              <div
                style={{ background: theme.badgeColor, color: theme.accentColor, fontSize: 8, padding: "1px 6px", borderRadius: 8, marginTop: 2 }}
              >
                ₹250
              </div>
            </div>
            <div className="p-1.5 text-center">
              <div className="text-[10px] font-medium text-foreground truncate">{theme.name}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                page === i ? "bg-primary text-primary-foreground" : "glass-panel text-muted-foreground hover:text-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeGallery;
