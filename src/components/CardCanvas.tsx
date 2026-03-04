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
  itemsHeaderLabel: string;
  priceHeaderLabel: string;
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

const clampSize = (size: number, min = 8, max = 32) => Math.max(min, Math.min(max, size));

const CardCanvas = forwardRef<HTMLDivElement, CardCanvasProps>(({
  shop, dayNumber, dayLabel, theme, items, specialNote,
  showGradient, font, colorOverrides, textStyles,
  itemsHeaderLabel, priceHeaderLabel,
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
    fontSize: clampSize(textStyles[key]?.fontSize || defaults.size),
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

      {/* Header */}
      <div style={{ height: 112, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        {shop.logo_url && (
          <img src={shop.logo_url} alt="logo" style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <div style={{
            ...ts("shopName", { size: 20, bold: true }),
            color: shopNameC,
            lineHeight: 1.35,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            paddingTop: 1,
          }}>
            {shop.shop_name}
          </div>
          {shop.shop_name_tamil && (
            <div style={{
              ...ts("shopNameTamil", { size: 13, bold: false }),
              color: textStyles.shopNameTamil?.color || tamilTextC,
              lineHeight: 1.35,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginTop: 2,
              paddingTop: 1,
            }}>
              {shop.shop_name_tamil}
            </div>
          )}
          <div style={{
            ...ts("tagline", { size: 11, bold: false }),
            color: textStyles.tagline?.color || accent,
            lineHeight: 1.35,
            marginTop: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>{shop.tagline}</div>
        </div>
        {shop.phone && (
          <div style={{ fontSize: 10, color: itemTextC, textAlign: "right", opacity: 0.85, flexShrink: 0, lineHeight: 1.35 }}>
            📞 {shop.phone}
          </div>
        )}
      </div>

      {/* Day Banner */}
      <div style={{
        height: 40,
        background: bannerC,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flexShrink: 0,
      }}>
        <span style={{
          ...ts("dayBanner", { size: 16, bold: true }),
          color: bannerTextC,
          letterSpacing: 0.5,
          lineHeight: 1.25,
        }}>
          📅 {dayLabel} — Day {dayNumber}{totalPages > 1 ? ` (${pageNumber}/${totalPages})` : ""}
        </span>
      </div>

      {/* Delivery note */}
      {shop.delivery_note && (
        <div style={{
          height: 28,
          background: `${accent}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          ...ts("deliveryNote", { size: 11, bold: false }),
          color: textStyles.deliveryNote?.color || accent,
          lineHeight: 1.3,
          paddingTop: 1,
        }}>
          🚚 {shop.delivery_note}
        </div>
      )}

      {/* Items list */}
      <div style={{
        flex: 1,
        padding: "8px 12px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          padding: "4px 8px",
          borderBottom: `1px solid ${accent}44`,
          marginBottom: 2,
          flexShrink: 0,
        }}>
          <span style={{
            flex: 1,
            fontSize: 11,
            fontWeight: 700,
            color: accent,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}>
            {itemsHeaderLabel}
          </span>
          <span style={{
            width: 110,
            fontSize: 11,
            fontWeight: 700,
            color: accent,
            textTransform: "uppercase",
            letterSpacing: 1,
            textAlign: "center",
          }}>
            {priceHeaderLabel}
          </span>
        </div>

        {items.map((item, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            padding: "5px 8px",
            background: i % 2 === 0 ? "rgba(255,255,255,0.04)" : "transparent",
            borderRadius: 4,
            minHeight: 42,
            flexShrink: 0,
          }}>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
              <div style={{
                ...ts("itemName", { size: 14, bold: true }),
                color: itemTextC,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                lineHeight: 1.35,
                paddingTop: 1,
              }}>
                {item.name}
              </div>
              {item.name_tamil && (
                <div style={{
                  ...ts("itemNameTamil", { size: 11, bold: false }),
                  color: tamilTextC,
                  opacity: 0.9,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.35,
                  marginTop: 1,
                  paddingTop: 1,
                }}>
                  {item.name_tamil}
                </div>
              )}
            </div>

            <div style={{ width: 110, display: "flex", justifyContent: "center", flexShrink: 0 }}>
              <div style={{
                background: badgeC,
                color: badgeTextC,
                padding: "4px 10px",
                borderRadius: 20,
                ...ts("priceBadge", { size: 13, bold: true }),
                minWidth: 72,
                textAlign: "center",
                whiteSpace: "nowrap",
                lineHeight: 1.2,
              }}>
                ₹{item.price}
              </div>
            </div>
          </div>
        ))}
      </div>

      {specialNote && (
        <div style={{
          height: 34,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.25)",
          flexShrink: 0,
          ...ts("specialNote", { size: 12, bold: false }),
          color: textStyles.specialNote?.color || accent,
          fontStyle: "italic",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1.35,
        }}>
          ⭐ {specialNote}
        </div>
      )}
    </div>
  );
});

CardCanvas.displayName = "CardCanvas";

export default CardCanvas;
