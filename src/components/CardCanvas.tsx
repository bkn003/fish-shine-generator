import React, { forwardRef } from "react";
import { CardTheme, getContrastColor } from "@/lib/themes";
import { Shop, PriceItem, TextStyleOverrides } from "@/lib/shop";

interface CardCanvasProps {
  shop: Shop;
  dayNumber: number;
  dayLabel: string;
  theme: CardTheme;
  items: PriceItem[];
  specialNote: string;
  showGradient: boolean;
  font: string;
  colorOverrides: {
    accent?: string;
    shopName?: string;
    itemText?: string;
    tamilText?: string;
    priceBadge?: string;
    dayBanner?: string;
  };
  textStyles: TextStyleOverrides;
  pageNumber?: number;
  totalPages?: number;
}

const CardCanvas = forwardRef<HTMLDivElement, CardCanvasProps>(({
  shop, dayNumber, dayLabel, theme, items, specialNote,
  showGradient, font, colorOverrides, textStyles,
  pageNumber = 1, totalPages = 1,
}, ref) => {
  const accent = colorOverrides.accent || theme.accentColor;
  const shopNameC = textStyles.shopName?.color || colorOverrides.shopName || theme.shopNameColor;
  const itemTextC = textStyles.itemName?.color || colorOverrides.itemText || theme.textColor;
  const tamilTextC = textStyles.itemNameTamil?.color || colorOverrides.tamilText || theme.tamilColor;
  const badgeC = textStyles.priceBadge?.color || colorOverrides.priceBadge || theme.badgeColor;
  const bannerC = textStyles.dayBanner?.color || colorOverrides.dayBanner || theme.bannerColor;
  const badgeTextC = getContrastColor(badgeC);
  const bannerTextC = getContrastColor(bannerC);

  const bg = showGradient ? theme.gradient : "#1a1a2e";

  const ts = (key: keyof TextStyleOverrides, defaults: { size: number; bold: boolean }) => ({
    fontSize: textStyles[key]?.fontSize || defaults.size,
    fontWeight: textStyles[key]?.bold !== undefined ? (textStyles[key]!.bold ? 800 : 400) : (defaults.bold ? 800 : 400),
  });

  return (
    <div
      ref={ref}
      style={{
        width: 500,
        height: 720,
        background: bg,
        fontFamily: font,
        overflow: "hidden",
        position: "relative",
      }}
      className="flex flex-col"
    >
      {/* Decorative glow */}
      <div style={{
        position: "absolute", top: -50, right: -50,
        width: 200, height: 200, borderRadius: "50%",
        background: `radial-gradient(circle, ${theme.glowColor}33, transparent)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -30, left: -30,
        width: 150, height: 150, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}22, transparent)`,
        pointerEvents: "none",
      }} />

      {/* Header - 100px */}
      <div style={{ height: 100, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        {shop.logo_url && (
          <img src={shop.logo_url} alt="logo" style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover" }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            ...ts("shopName", { size: 20, bold: true }),
            color: shopNameC, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {shop.shop_name}
          </div>
          {shop.shop_name_tamil && (
            <div style={{
              ...ts("shopNameTamil", { size: 13, bold: false }),
              color: textStyles.shopNameTamil?.color || tamilTextC, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {shop.shop_name_tamil}
            </div>
          )}
          <div style={{
            ...ts("tagline", { size: 11, bold: false }),
            color: textStyles.tagline?.color || accent, lineHeight: 1.3,
          }}>{shop.tagline}</div>
        </div>
        {shop.phone && (
          <div style={{ fontSize: 11, color: itemTextC, textAlign: "right", opacity: 0.8 }}>
            📞 {shop.phone}
          </div>
        )}
      </div>

      {/* Day Banner - 40px */}
      <div style={{
        height: 40, background: bannerC, display: "flex", alignItems: "center",
        justifyContent: "center", gap: 8,
      }}>
        <span style={{
          ...ts("dayBanner", { size: 16, bold: true }),
          color: bannerTextC, letterSpacing: 1,
        }}>
          📅 {dayLabel} — Day {dayNumber}
          {totalPages > 1 && ` (${pageNumber}/${totalPages})`}
        </span>
      </div>

      {/* Delivery note - 28px */}
      {shop.delivery_note && (
        <div style={{
          height: 28, background: `${accent}22`, display: "flex", alignItems: "center",
          justifyContent: "center",
          ...ts("deliveryNote", { size: 11, bold: false }),
          color: textStyles.deliveryNote?.color || accent,
        }}>
          🚚 {shop.delivery_note}
        </div>
      )}

      {/* Items list - flexible */}
      <div style={{
        flex: 1, padding: "8px 12px", overflow: "hidden",
        display: "flex", flexDirection: "column", gap: 2,
      }}>
        {/* Header row */}
        <div style={{
          display: "flex", alignItems: "center", padding: "4px 8px",
          borderBottom: `1px solid ${accent}44`, marginBottom: 2,
        }}>
          <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1 }}>
            Fish / மீன்
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1 }}>
            Price
          </span>
        </div>

        {items.map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", padding: "4px 8px",
            background: i % 2 === 0 ? "rgba(255,255,255,0.04)" : "transparent",
            borderRadius: 4,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                ...ts("itemName", { size: 14, bold: true }),
                color: itemTextC, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {item.name}
              </div>
              {item.name_tamil && (
                <div style={{
                  ...ts("itemNameTamil", { size: 11, bold: false }),
                  color: tamilTextC, opacity: 0.85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {item.name_tamil}
                </div>
              )}
            </div>
            <div style={{
              background: badgeC, color: badgeTextC, padding: "3px 12px",
              borderRadius: 20,
              ...ts("priceBadge", { size: 13, bold: true }),
              minWidth: 60, textAlign: "center", whiteSpace: "nowrap",
            }}>
              ₹{item.price}
            </div>
          </div>
        ))}
      </div>

      {/* Special note - 36px */}
      {specialNote && (
        <div style={{
          height: 36, padding: "0 16px", display: "flex", alignItems: "center",
          justifyContent: "center", background: "rgba(0,0,0,0.25)",
          ...ts("specialNote", { size: 12, bold: false }),
          color: textStyles.specialNote?.color || accent,
          fontStyle: "italic",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          ⭐ {specialNote}
        </div>
      )}

      {/* Footer - 46px */}
      <div style={{
        height: 46, padding: "0 16px", display: "flex", alignItems: "center",
        justifyContent: "space-between", background: "rgba(0,0,0,0.3)",
        borderTop: `1px solid ${accent}33`,
      }}>
        <div style={{
          ...ts("footer", { size: 10, bold: false }),
          color: textStyles.footer?.color || itemTextC, opacity: 0.6,
        }}>
          {shop.address || "Fresh daily catch"}
        </div>
        <div style={{
          fontSize: 9, color: accent, opacity: 0.7,
          padding: "2px 8px", border: `1px solid ${accent}44`, borderRadius: 10,
        }}>
          Theme: {theme.name}
        </div>
      </div>
    </div>
  );
});

CardCanvas.displayName = "CardCanvas";

export default CardCanvas;
