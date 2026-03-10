import { toPng, toBlob } from "html-to-image";

const CAPTURE_WIDTH = 500;
const CAPTURE_HEIGHT = 720;
const SOCIAL_EXPORT_WIDTH = 1080;
const EXPORT_BOTTOM_PADDING = 64;

function getCaptureScale() {
  if (typeof window === "undefined") return 2;
  const socialScale = SOCIAL_EXPORT_WIDTH / CAPTURE_WIDTH;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  return Math.max(2, Math.min(2.6, Math.max(socialScale, dpr * 1.25)));
}

async function ensureFontsReady() {
  if ("fonts" in document) {
    try {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    } catch {
      // ignore font readiness failures
    }
  }
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

async function ensureImagesReady(el: HTMLElement) {
  const images = Array.from(el.querySelectorAll("img"));
  await Promise.all(
    images.map(async (img) => {
      try {
        if (img.complete && img.naturalWidth > 0) return;
        if (typeof img.decode === "function") {
          await img.decode();
          return;
        }
        await new Promise<void>((resolve) => {
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        });
      } catch {
        // ignore per-image failures
      }
    }),
  );
}

function resolveCaptureTarget(el: HTMLElement) {
  if (el.matches("[data-card-capture='true']")) return el;
  const nested = el.querySelector<HTMLElement>("[data-card-capture='true']");
  return nested ?? el;
}

/** html-to-image render options shared by all capture methods */
function getRenderOptions(pixelRatio: number) {
  return {
    width: CAPTURE_WIDTH,
    height: CAPTURE_HEIGHT + EXPORT_BOTTOM_PADDING,
    pixelRatio,
    cacheBust: true,
    skipFonts: true,
    useCORS: true,
    // Ensure the background is captured (not transparent)
    backgroundColor: "#060a12",
    style: {
      // Reset any transforms that might affect rendering
      transform: "none",
      transformOrigin: "top left",
    },
  };
}

async function withActionButtonsHidden<T>(fn: () => Promise<T>): Promise<T> {
  const targets = Array.from(document.querySelectorAll<HTMLElement>(".action-buttons"));
  const prev = targets.map((node) => ({
    node,
    display: node.style.display,
    visibility: node.style.visibility,
  }));

  targets.forEach((node) => {
    node.style.visibility = "hidden";
    node.style.display = "none";
  });

  try {
    return await fn();
  } finally {
    prev.forEach(({ node, display, visibility }) => {
      node.style.display = display;
      node.style.visibility = visibility;
    });
  }
}

/** Render a card element to a PNG data URL using html-to-image */
async function renderCardToDataUrl(el: HTMLElement): Promise<string> {
  await ensureFontsReady();
  const target = resolveCaptureTarget(el);
  await ensureImagesReady(target);
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

  const scale = getCaptureScale();
  const dataUrl = await toPng(target, getRenderOptions(scale));
  return dataUrl;
}

/** Render a card element to a Blob using html-to-image */
async function renderCardToBlob(el: HTMLElement): Promise<Blob> {
  await ensureFontsReady();
  const target = resolveCaptureTarget(el);
  await ensureImagesReady(target);
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

  const scale = getCaptureScale();
  const blob = await toBlob(target, getRenderOptions(scale));
  if (!blob) throw new Error("Could not create image blob");
  return blob;
}

export async function downloadCard(canvas: HTMLElement, fileName: string) {
  return await withActionButtonsHidden(async () => {
    const dataUrl = await renderCardToDataUrl(canvas);

    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  });
}

export async function getCardBlob(canvas: HTMLElement): Promise<Blob> {
  return await renderCardToBlob(canvas);
}

export async function getMultipleCardBlobs(canvases: HTMLElement[]): Promise<File[]> {
  const files: File[] = [];
  for (let i = 0; i < canvases.length; i++) {
    const blob = await renderCardToBlob(canvases[i]);
    const suffix = canvases.length > 1 ? `-page${i + 1}` : "";
    files.push(new File([blob], `fish-prices${suffix}.png`, { type: "image/png" }));
  }
  return files;
}

export async function downloadMultipleCards(canvases: HTMLElement[], baseFileName: string) {
  await withActionButtonsHidden(async () => {
    for (let i = 0; i < canvases.length; i++) {
      const suffix = canvases.length > 1 ? `-page${i + 1}` : "";
      const dataUrl = await renderCardToDataUrl(canvases[i]);
      const link = document.createElement("a");
      link.download = `${baseFileName}${suffix}.png`;
      link.href = dataUrl;
      link.click();

      if (i < canvases.length - 1) {
        await new Promise((r) => setTimeout(r, 350));
      }
    }
  });
}

/**
 * Attempt to share files via the Web Share API.
 * Returns true if sharing succeeded, false otherwise.
 */
async function tryNativeShare(
  canvases: HTMLElement[],
  opts: { text?: string; title?: string } = {},
): Promise<boolean> {
  if (!navigator.share) return false;

  try {
    const files = await getMultipleCardBlobs(canvases);

    // Check if the browser can actually share files
    const shareData: ShareData = {
      files,
      ...(opts.title && { title: opts.title }),
      ...(opts.text && { text: opts.text }),
    };

    if (navigator.canShare && !navigator.canShare(shareData)) {
      return false;
    }

    await navigator.share(shareData);
    return true;
  } catch (err: any) {
    // AbortError means user cancelled the share sheet — that's still "handled"
    if (err?.name === "AbortError") return true;
    return false;
  }
}

/**
 * Open a native app via deep link, with web fallback.
 * Uses window.open to avoid navigating away from the current page.
 */
function tryDeepLink(deepLink: string, webFallback: string, timeoutMs = 1500) {
  const start = Date.now();
  const hidden = () =>
    typeof document !== "undefined" && (document.hidden || (document as any).webkitHidden);

  // Try deep link via an invisible iframe first (doesn't navigate away)
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = deepLink;
  document.body.appendChild(iframe);

  setTimeout(() => {
    iframe.remove();
    // If the page is hidden, the deep link opened the app
    if (hidden()) return;
    // If more time passed than expected (user was prompted by OS), skip
    if (Date.now() - start > timeoutMs + 500) return;
    window.open(webFallback, "_blank");
  }, timeoutMs);
}

export async function shareToWhatsApp(canvases: HTMLElement[], text: string) {
  await withActionButtonsHidden(async () => {
    // Strategy 1: Native share with actual image files (best on mobile)
    const shared = await tryNativeShare(canvases, {
      title: "Today Fish Prices",
      text: text || "Fresh Fish Market Today Price List",
    });
    if (shared) return;

    // Strategy 2: Download images + open WhatsApp app with text
    await downloadMultipleCards(canvases, "fish-prices");
    tryDeepLink(
      `whatsapp://send?text=${encodeURIComponent(text)}`,
      `https://wa.me/?text=${encodeURIComponent(text)}`,
    );
  });
}

export async function shareToFacebook(canvases: HTMLElement[]) {
  await withActionButtonsHidden(async () => {
    const shared = await tryNativeShare(canvases, { title: "Today Fish Prices" });
    if (shared) return;

    await downloadMultipleCards(canvases, "fish-prices");
    tryDeepLink("fb://publish", "https://www.facebook.com/");
  });
}

export async function shareToInstagram(canvases: HTMLElement[]) {
  await withActionButtonsHidden(async () => {
    const shared = await tryNativeShare(canvases, { title: "Today Fish Prices" });
    if (shared) return;

    await downloadMultipleCards(canvases, "fish-prices");
    tryDeepLink("instagram://camera", "https://www.instagram.com/");
  });
}

export async function shareToTwitter(canvases: HTMLElement[], text: string) {
  await withActionButtonsHidden(async () => {
    const shared = await tryNativeShare(canvases, { text });
    if (shared) return;

    await downloadMultipleCards(canvases, "fish-prices");
    tryDeepLink(
      `twitter://post?message=${encodeURIComponent(text)}`,
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    );
  });
}

export async function shareToTelegram(canvases: HTMLElement[], text: string) {
  await withActionButtonsHidden(async () => {
    const shared = await tryNativeShare(canvases, { text });
    if (shared) return;

    await downloadMultipleCards(canvases, "fish-prices");
    tryDeepLink(
      `tg://msg?text=${encodeURIComponent(text)}`,
      `https://t.me/share/url?text=${encodeURIComponent(text)}`,
    );
  });
}

export async function shareGeneric(canvases: HTMLElement[], text: string) {
  await withActionButtonsHidden(async () => {
    const shared = await tryNativeShare(canvases, {
      title: "Today Fish Prices",
      text,
    });
    if (shared) return;

    await downloadMultipleCards(canvases, "fish-prices");
  });
}
