import React, { useState } from "react";
import AppNav from "@/components/AppNav";
import { getSavedCards, deleteCard, PriceCard } from "@/lib/shop";
import { getThemeForDay } from "@/lib/themes";
import { Trash2, Calendar, Fish } from "lucide-react";
import { toast } from "sonner";

const MyCards: React.FC = () => {
  const [cards, setCards] = useState<PriceCard[]>(getSavedCards());

  const handleDelete = (id: string) => {
    deleteCard(id);
    setCards(getSavedCards());
    toast.success("Card deleted");
  };

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-5xl mx-auto">
      <AppNav />

      <div className="glass-panel-strong glow-border p-6 mb-6">
        <h1 className="text-xl font-bold text-primary glow-text">My Cards</h1>
        <p className="text-sm text-muted-foreground mt-1">All your generated price cards</p>
      </div>

      {cards.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <Fish className="mx-auto text-muted-foreground mb-3" size={40} />
          <p className="text-muted-foreground">No cards yet. Generate your first card!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(card => {
            const theme = getThemeForDay(card.day_number);
            return (
              <div key={card.id} className="glass-panel overflow-hidden group">
                <div className="h-32 flex items-center justify-center text-2xl font-bold"
                  style={{ background: theme.gradient, color: theme.shopNameColor }}>
                  Day {card.day_number}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-primary" />
                    <span className="text-muted-foreground">
                      {card.day_label} — {new Date(card.card_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {card.items.length} items • Theme: {theme.name}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {card.items.slice(0, 3).map((item, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {item.name} ₹{item.price}
                      </span>
                    ))}
                    {card.items.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{card.items.length - 3} more</span>
                    )}
                  </div>
                  <button onClick={() => handleDelete(card.id)}
                    className="mt-2 flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCards;
