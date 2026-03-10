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
  customBackgroundImage?: string;
  showGrain?: boolean;
  showOrbs?: boolean;
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
    bgFrom?: string;
    bgVia?: string;
    bgTo?: string;
  };
  textStyles: TextStyleOverrides;
}

const clampSize = (size: number, min = 8, max = 32) => Math.max(min, Math.min(max, size));

const subtleFishSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220" fill="none">
  <g opacity="1">
    <ellipse cx="62" cy="60" rx="22" ry="11" fill="white"/>
    <polygon points="40,60 24,70 24,50" fill="white"/>
    <ellipse cx="155" cy="125" rx="24" ry="12" fill="white"/>
    <polygon points="130,125 112,136 112,114" fill="white"/>
    <ellipse cx="92" cy="182" rx="18" ry="9" fill="white"/>
    <polygon points="73,182 60,190 60,174" fill="white"/>
  </g>
</svg>`);

const CardCanvas = forwardRef<HTMLDivElement, CardCanvasProps>(({
  shop,
  dayLabel,
  theme,
  items,
  specialNote,
  showGradient,
  usePremiumBackground = true,
  customBackgroundImage,
  font,
  colorOverrides,
  textStyles,
  itemsHeaderLabel,
  priceHeaderLabel,
  showGrain = true,
  showOrbs = true,
}, ref) => {
  const accent = colorOverrides.accent || theme.accentColor;
  const shopNameC = textStyles.shopName?.color || colorOverrides.shopName || theme.shopNameColor;
  const itemTextC = textStyles.itemName?.color || colorOverrides.itemText || theme.textColor;
  const tamilTextC = textStyles.itemNameTamil?.color || colorOverrides.tamilText || theme.tamilColor;
  const badgeC = textStyles.priceBadge?.color || colorOverrides.priceBadge || theme.badgeColor;
  const bannerC = textStyles.dayBanner?.color || colorOverrides.dayBanner || theme.bannerColor;
  const badgeTextC = getContrastColor(badgeC);
  const bannerTextC = getContrastColor(bannerC);

  const safeCustomBackground = customBackgroundImage?.replace(/"/g, "%22");

  const [tTop, tMid, tBot] = theme.gradient.replace("linear-gradient(180deg, ", "").replace(")", "").split(", ");
  const customBg = `linear-gradient(180deg, ${colorOverrides.bgFrom || tTop}, ${colorOverrides.bgVia || tMid}, ${colorOverrides.bgTo || tBot})`;

  const backgroundImage = showGradient
    ? safeCustomBackground
      ? `linear-gradient(180deg, rgba(6, 10, 18, 0.36), rgba(6, 10, 18, 0.58)), url("${safeCustomBackground}")`
      : usePremiumBackground
        ? `${theme.premiumPattern}, ${customBg}`
        : customBg
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
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(6, 10, 18, 0.45)",
        backgroundColor: showGradient ? "transparent" : "#12141c",
        backgroundImage,
        backgroundSize: safeCustomBackground ? "cover, cover" : usePremiumBackground && showGradient ? "cover, cover" : "cover",
        backgroundPosition: safeCustomBackground ? "center center, center center" : "center center, center center",
        backgroundRepeat: safeCustomBackground ? "no-repeat, no-repeat" : "no-repeat, no-repeat",
        backgroundBlendMode: safeCustomBackground ? "normal, normal" : usePremiumBackground && showGradient ? "screen, normal" : "normal",
      }}
      className="flex flex-col"
      data-card-capture="true"
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,${subtleFishSvg}")`,
          backgroundSize: "220px 220px",
          backgroundRepeat: "repeat",
          opacity: 0.08,
          pointerEvents: "none",
        }}
      />

      {showGrain && (
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            mixBlendMode: "overlay",
            opacity: 0.15,
            zIndex: 1,
          }}
        >
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.3 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      )}

      {!safeCustomBackground && showOrbs && (
        <>
          <div style={{
            position: "absolute", top: -80, right: -80,
            width: 300, height: 300, borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.glowColor}44, transparent 70%)`,
            pointerEvents: "none",
            filter: "blur(40px)",
          }} />
          <div style={{
            position: "absolute", bottom: -50, left: -50,
            width: 250, height: 250, borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}33, transparent 70%)`,
            pointerEvents: "none",
            filter: "blur(40px)",
          }} />
        </>
      )}

      <div style={{ height: 138, padding: "10px 16px", display: "flex", alignItems: "flex-start", gap: 12, position: "relative" }}>
        {shop.logo_url && (
          <img src={shop.logo_url} crossOrigin="anonymous" alt="shop logo" style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden", textAlign: "center" }}>
          <div style={{
            ...ts("shopName", { size: 20, bold: true }),
            color: shopNameC,
            lineHeight: 1.35,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            paddingTop: 1,
            position: "relative",
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
              position: "relative",
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
            position: "relative",
          }}>
            {shop.tagline}
          </div>
        </div>

        {(shop.phone || shop.whatsapp || shop.address) && (
          <div style={{
            fontSize: 10,
            color: itemTextC,
            textAlign: "right",
            opacity: 0.95,
            flexShrink: 0,
            lineHeight: 1.3,
            maxWidth: 174,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 2,
            paddingTop: 2,
            position: "relative",
          }}>
            {shop.phone && <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>📞 {shop.phone}</div>}
            {shop.whatsapp && <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>💬 {shop.whatsapp}</div>}
            {shop.address && (
              <div
                style={{
                  whiteSpace: "normal",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  wordBreak: "break-word",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  maxWidth: "100%",
                }}
              >
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
        position: "relative",
      }}>
        <span style={{
          ...ts("dayBanner", { size: 16, bold: true }),
          color: bannerTextC,
          letterSpacing: 0.25,
          lineHeight: 1.25,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          position: "relative",
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
          position: "relative",
        }}>
          🚚 {shop.delivery_note}
        </div>
      )}

      <div style={{
        flex: 1,
        padding: "10px 12px 12px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        position: "relative",
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
            position: "relative",
          }}>
            {itemsHeaderLabel}
          </span>
          <span style={{
            width: 112,
            fontSize: 11,
            fontWeight: 700,
            color: accent,
            textTransform: "uppercase",
            letterSpacing: 1,
            textAlign: "center",
            position: "relative",
          }}>
            {priceHeaderLabel}
          </span>
        </div>

        {items.map((item, i) => {
          const itemRowBg = item.style?.rowBackground || (i % 2 === 0 ? "rgba(255,255,255,0.06)" : "transparent");
          const itemBadgeBg = item.style?.badgeBackground || badgeC;
          const itemBadgeText = item.style?.priceColor || badgeTextC;

          return (
            <div
              key={item.id || i}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 10px",
                background: itemRowBg,
                borderRadius: 10,
                minHeight: 48,
                flexShrink: 0,
                position: "relative",
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
                  position: "relative",
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
                    position: "relative",
                  }}>
                    {item.name_tamil}
                  </div>
                )}
              </div>

              <div style={{ width: 112, display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  background: `linear-gradient(135deg, ${itemBadgeBg}, ${accent})`,
                  color: itemBadgeText,
                  padding: "8px 18px",
                  borderRadius: 30,
                  ...ts("priceBadge", { size: 14, bold: true }),
                  minWidth: 88,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                  boxShadow: "0 8px 18px rgba(6, 10, 18, 0.28)",
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
          minHeight: 38,
          padding: "7px 16px",
          textAlign: "center",
          background: "rgba(0,0,0,0.26)",
          flexShrink: 0,
          ...ts("specialNote", { size: 12, bold: false }),
          color: textStyles.specialNote?.color || accent,
          fontStyle: "italic",
          overflow: "hidden",
          lineHeight: 1.3,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          position: "relative",
        }}>
          ⭐ {specialNote}
        </div>
      )}
    </div>
  );
});

CardCanvas.displayName = "CardCanvas";

export default CardCanvas;
