import React, { forwardRef } from "react";
import { CardTheme, getContrastColor } from "@/lib/themes";
import { Shop, PriceItem, TextStyleOverrides } from "@/lib/shop";

interface CardCanvasProps {
  shop: Shop;
  dayNumber?: number;
  dayLabel: string;
  theme: CardTheme;
  items: PriceItem[];
  specialNote: string;
  showGradient: boolean;
  usePremiumBackground?: boolean;
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
}

const clampSize = (size: number, min = 8, max = 32) => Math.max(min, Math.min(max, size));

const CardCanvas = forwardRef<HTMLDivElement, CardCanvasProps>(({
  shop,
  dayLabel,
  theme,
  items,
  specialNote,
  showGradient,
  usePremiumBackground = true,
  font,
  colorOverrides,
  textStyles,
  itemsHeaderLabel,
  priceHeaderLabel,
}, ref) => {
  const accent = colorOverrides.accent || theme.accentColor;
  const shopNameC = textStyles.shopName?.color || colorOverrides.shopName || theme.shopNameColor;
  const itemTextC = textStyles.itemName?.color || colorOverrides.itemText || theme.textColor;
  const tamilTextC = textStyles.itemNameTamil?.color || colorOverrides.tamilText || theme.tamilColor;
  const badgeC = textStyles.priceBadge?.color || colorOverrides.priceBadge || theme.badgeColor;
  const bannerC = textStyles.dayBanner?.color || colorOverrides.dayBanner || theme.bannerColor;
  const badgeTextC = getContrastColor(badgeC);
  const bannerTextC = getContrastColor(bannerC);

  const backgroundImage = showGradient
    ? usePremiumBackground
      ? `${theme.premiumPattern}, ${theme.gradient}`
      : theme.gradient
    : "none";

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
        fontFamily: font,
        overflow: "hidden",
        position: "relative",
        backgroundColor: showGradient ? "transparent" : "hsl(var(--card))",
        backgroundImage,
        backgroundSize: usePremiumBackground && showGradient ? "cover, cover" : "cover",
        backgroundRepeat: "no-repeat, no-repeat",
        backgroundBlendMode: usePremiumBackground && showGradient ? "screen, normal" : "normal",
      }}
      className="flex flex-col"
      data-card-capture="true"
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

      <div style={{ height: 124, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        {shop.logo_url && (
          <img src={shop.logo_url} alt="shop logo" style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
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
              ...ts("shopNameTamil", { size: 14, bold: false }),
              color: textStyles.shopNameTamil?.color || tamilTextC,
              lineHeight: 1.4,
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
          }}>
            {shop.tagline}
          </div>
        </div>

        {(shop.phone || shop.address) && (
          <div style={{
            fontSize: 10,
            color: itemTextC,
            textAlign: "right",
            opacity: 0.9,
            flexShrink: 0,
            lineHeight: 1.35,
            maxWidth: 160,
          }}>
            {shop.phone && <div>📞 {shop.phone}</div>}
            {shop.address && (
              <div style={{ marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                📍 {shop.address}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{
        height: 42,
        background: bannerC,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flexShrink: 0,
        padding: "0 12px",
      }}>
        <span style={{
          ...ts("dayBanner", { size: 16, bold: true }),
          color: bannerTextC,
          letterSpacing: 0.25,
          lineHeight: 1.25,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {dayLabel}
        </span>
      </div>

      {shop.delivery_note && (
        <div style={{
          minHeight: 28,
          background: `${accent}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          ...ts("deliveryNote", { size: 11, bold: false }),
          color: textStyles.deliveryNote?.color || accent,
          lineHeight: 1.3,
          padding: "2px 8px",
          textAlign: "center",
        }}>
          🚚 {shop.delivery_note}
        </div>
      )}

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
          borderBottom: `1px solid ${accent}55`,
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

        {items.map((item, i) => {
          const itemRowBg = item.style?.rowBackground || (i % 2 === 0 ? "rgba(255,255,255,0.05)" : "transparent");
          const itemBadgeBg = item.style?.badgeBackground || badgeC;
          const itemBadgeText = item.style?.priceColor || getContrastColor(itemBadgeBg);

          return (
            <div
              key={item.id || i}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 8px",
                background: itemRowBg,
                borderRadius: 6,
                minHeight: 46,
                flexShrink: 0,
              }}
            >
              <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                <div style={{
                  ...ts("itemName", { size: 14, bold: true }),
                  color: item.style?.nameColor || itemTextC,
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
                    ...ts("itemNameTamil", { size: 12, bold: false }),
                    color: item.style?.tamilColor || tamilTextC,
                    opacity: 0.95,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: 1.4,
                    marginTop: 1,
                    paddingTop: 1,
                  }}>
                    {item.name_tamil}
                  </div>
                )}
              </div>

              <div style={{ width: 110, display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  background: itemBadgeBg,
                  color: itemBadgeText,
                  padding: "4px 10px",
                  borderRadius: 20,
                  ...ts("priceBadge", { size: 13, bold: true }),
                  minWidth: 80,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                }}>
                  ₹{item.price}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {specialNote && (
        <div style={{
          minHeight: 34,
          padding: "4px 16px",
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
