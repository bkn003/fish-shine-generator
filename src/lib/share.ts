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

function freezeAnimations(el: HTMLElement) {
  const animatedNodes = Array.from(el.querySelectorAll<HTMLElement>("*"));
  animatedNodes.forEach((node) => {
    node.style.animation = "none";
    node.style.transition = "none";
    node.style.caretColor = "transparent";
  });
}

function resolveCaptureTarget(el: HTMLElement) {
  if (el.matches("[data-card-capture='true']")) return el;
  const nested = el.querySelector<HTMLElement>("[data-card-capture='true']");
  return nested ?? el;
}

/** Copy key computed styles inline so html2canvas doesn't lose CSS-variable-dependent values */
function inlineComputedStyles(source: HTMLElement, target: HTMLElement) {
  const sourceChildren = Array.from(source.querySelectorAll<HTMLElement>("*"));
  const targetChildren = Array.from(target.querySelectorAll<HTMLElement>("*"));

  const PROPS_TO_COPY: (keyof CSSStyleDeclaration)[] = [
    "color", "backgroundColor", "backgroundImage", "background",
    "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor",
    "boxShadow", "textShadow", "opacity",
    "display", "flexDirection", "justifyContent", "alignItems", "flexWrap", "flexGrow", "flexShrink",
    "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight",
    "padding", "margin",
    "fontSize", "fontWeight", "fontFamily", "lineHeight", "letterSpacing", "textAlign", "textTransform",
    "position", "top", "left", "right", "bottom",
    "overflow", "borderRadius",
  ] as (keyof CSSStyleDeclaration)[];

  const copyProps = (src: HTMLElement, tgt: HTMLElement) => {
    const computed = window.getComputedStyle(src);
    for (const prop of PROPS_TO_COPY) {
      const val = computed[prop];
      if (val && typeof val === "string") {
        (tgt.style as any)[prop] = val;
      }
    }
  };

  copyProps(source, target);

  const len = Math.min(sourceChildren.length, targetChildren.length);
  for (let i = 0; i < len; i++) {
    copyProps(sourceChildren[i], targetChildren[i]);
  }
}

function stageElementForCapture(el: HTMLElement) {
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.top = "0";
  wrapper.style.left = "-10000px";
  wrapper.style.width = `${CAPTURE_WIDTH}px`;
  wrapper.style.height = `${CAPTURE_HEIGHT + EXPORT_BOTTOM_PADDING}px`;
  wrapper.style.overflow = "hidden";
  wrapper.style.pointerEvents = "none";
  wrapper.style.opacity = "1";
  wrapper.style.zIndex = "-1";
  wrapper.style.isolation = "isolate";

  // Propagate CSS custom properties from :root to the off-screen wrapper
  const rootStyles = window.getComputedStyle(document.documentElement);
  const cssVarsToCopy = [
    "--background", "--foreground", "--card", "--card-foreground",
    "--primary", "--primary-foreground", "--secondary", "--secondary-foreground",
    "--muted", "--muted-foreground", "--accent", "--accent-foreground",
    "--border", "--ring", "--radius",
  ];
  for (const v of cssVarsToCopy) {
    const val = rootStyles.getPropertyValue(v).trim();
    if (val) wrapper.style.setProperty(v, val);
  }

  const frame = document.createElement("div");
  frame.style.position = "relative";
  frame.style.width = `${CAPTURE_WIDTH}px`;
  frame.style.height = `${CAPTURE_HEIGHT}px`;
  frame.style.overflow = "hidden";

  const sourceEl = resolveCaptureTarget(el);
  const clone = sourceEl.cloneNode(true) as HTMLElement;
  clone.style.margin = "0";
  clone.style.position = "relative";
  clone.style.left = "0";
  clone.style.top = "0";
  clone.style.width = `${CAPTURE_WIDTH}px`;
  clone.style.height = `${CAPTURE_HEIGHT}px`;
  clone.style.transform = "none";
  clone.style.opacity = "1";
  clone.style.visibility = "visible";

  freezeAnimations(clone);

  // Inline computed styles to ensure html2canvas captures everything correctly
  frame.appendChild(clone);
  wrapper.appendChild(frame);
  document.body.appendChild(wrapper);

  // Force a repaint before inlining styles so computed values are resolved
  void wrapper.offsetHeight;
  inlineComputedStyles(sourceEl, clone);

  return {
    target: wrapper,
    clone,
    cleanup: () => wrapper.remove(),
  };
}

function isLikelyBlank(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;

  const samplePoints = [
    [0.1, 0.1],
    [0.5, 0.1],
    [0.9, 0.1],
    [0.1, 0.5],
    [0.5, 0.5],
    [0.9, 0.5],
    [0.1, 0.9],
    [0.5, 0.9],
    [0.9, 0.9],
  ] as const;

  let nonBlankSamples = 0;

  for (const [rx, ry] of samplePoints) {
    const x = Math.max(0, Math.min(canvas.width - 1, Math.floor(canvas.width * rx)));
    const y = Math.max(0, Math.min(canvas.height - 1, Math.floor(canvas.height * ry)));
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const [r, g, b, a] = pixel;

    const isTransparent = a < 8;
    const isWhite = r > 245 && g > 245 && b > 245;
    if (!isTransparent && !isWhite) {
      nonBlankSamples += 1;
    }
  }

  return nonBlankSamples === 0;
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

async function renderCardCanvas(el: HTMLElement) {
  await ensureFontsReady();
  const staged = stageElementForCapture(el);

  try {
    await ensureImagesReady(staged.clone);
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

    const html2canvas = (await import("html2canvas")).default;
    const scale = getCaptureScale();

    const render = async (renderScale: number) => {
      return await html2canvas(staged.target, {
        scale: renderScale,
        useCORS: true,
        backgroundColor: null,
        width: CAPTURE_WIDTH,
        height: CAPTURE_HEIGHT + EXPORT_BOTTOM_PADDING,
        windowWidth: CAPTURE_WIDTH,
        windowHeight: CAPTURE_HEIGHT + EXPORT_BOTTOM_PADDING,
        foreignObjectRendering: false,
        logging: false,
        removeContainer: true,
        imageTimeout: 0,
        scrollX: 0,
        scrollY: 0,
      });
    };

    let rendered = await render(scale);
    if (isLikelyBlank(rendered)) {
      await new Promise<void>((resolve) => setTimeout(resolve, 120));
      rendered = await render(2);
    }

    return rendered;
  } finally {
    staged.cleanup();
  }
}

async function canvasToBlob(rendered: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    rendered.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not create image blob"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export async function downloadCard(canvas: HTMLElement, fileName: string) {
  return await withActionButtonsHidden(async () => {
    const rendered = await renderCardCanvas(canvas);
    const blob = await canvasToBlob(rendered);

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1200);
    return rendered;
  });
}

export async function getCardBlob(canvas: HTMLElement): Promise<Blob> {
  const rendered = await renderCardCanvas(canvas);
  return await canvasToBlob(rendered);
}

export async function downloadMultipleCards(canvases: HTMLElement[], baseFileName: string) {
  await withActionButtonsHidden(async () => {
    for (let i = 0; i < canvases.length; i++) {
      const suffix = canvases.length > 1 ? `-page${i + 1}` : "";
      const rendered = await renderCardCanvas(canvases[i]);
      const blob = await canvasToBlob(rendered);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${baseFileName}${suffix}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1200);

      if (i < canvases.length - 1) {
        await new Promise((r) => setTimeout(r, 350));
      }
    }
  });
}

export async function getMultipleCardBlobs(canvases: HTMLElement[]): Promise<File[]> {
  const files: File[] = [];
  for (let i = 0; i < canvases.length; i++) {
    const blob = await getCardBlob(canvases[i]);
    const suffix = canvases.length > 1 ? `-page${i + 1}` : "";
    files.push(new File([blob], `fish-prices${suffix}.png`, { type: "image/png" }));
  }
  return files;
}

/** Try a deep link first; fall back to web URL if the app doesn't open within timeout. */
function tryDeepLink(deepLink: string, webFallback: string, timeoutMs = 1500) {
  const start = Date.now();
  const hidden = () =>
    typeof document !== "undefined" && (document.hidden || (document as any).webkitHidden);

  // On mobile, setting location.href to a deep link opens the app if installed.
  // If nothing happens within timeoutMs, fall back to the web URL.
  window.location.href = deepLink;

  setTimeout(() => {
    // If the page is hidden, the deep link opened the app – nothing to do.
    if (hidden()) return;
    // If more time passed than expected (user was prompted by OS), skip fallback.
    if (Date.now() - start > timeoutMs + 500) return;
    window.open(webFallback, "_blank");
  }, timeoutMs);
}

export async function shareToWhatsApp(canvases: HTMLElement[], text: string) {
  await withActionButtonsHidden(async () => {
    // Use Web Share API if available (best mobile experience)
    if (navigator.share) {
      try {
        const files = await getMultipleCardBlobs(canvases);
        await navigator.share({
          files,
          title: "Today Fish Prices",
          text: text || "Fresh Fish Market Today Price List",
        });
        return;
      } catch {
        // continue fallback
      }
    }

    // Download the images, then try deep link → web fallback
    await downloadMultipleCards(canvases, "fish-prices");
    tryDeepLink(
      `whatsapp://send?text=${encodeURIComponent(text)}`,
      `https://wa.me/?text=${encodeURIComponent(text)}`
    );
  });
}

export async function shareToFacebook(canvases: HTMLElement[]) {
  await withActionButtonsHidden(async () => {
    if (navigator.share) {
      try {
        const files = await getMultipleCardBlobs(canvases);
        await navigator.share({ files });
        return;
      } catch {
        // continue fallback
      }
    }

    await downloadMultipleCards(canvases, "fish-prices");
    tryDeepLink(
      "fb://publish",
      "https://www.facebook.com/"
    );
  });
}

export async function shareToInstagram(canvases: HTMLElement[]) {
  await withActionButtonsHidden(async () => {
    if (navigator.share) {
      try {
        const files = await getMultipleCardBlobs(canvases);
        await navigator.share({ files });
        return;
      } catch {
        // continue fallback
      }
    }

    await downloadMultipleCards(canvases, "fish-prices");
    tryDeepLink(
      "instagram://camera",
      "https://www.instagram.com/"
    );
  });
}

export async function shareToTwitter(canvases: HTMLElement[], text: string) {
  await withActionButtonsHidden(async () => {
    if (navigator.share) {
      try {
        const files = await getMultipleCardBlobs(canvases);
        await navigator.share({ text, files });
        return;
      } catch {
        // continue fallback
      }
    }

    await downloadMultipleCards(canvases, "fish-prices");
    tryDeepLink(
      `twitter://post?message=${encodeURIComponent(text)}`,
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    );
  });
}

export async function shareToTelegram(canvases: HTMLElement[], text: string) {
  await withActionButtonsHidden(async () => {
    if (navigator.share) {
      try {
        const files = await getMultipleCardBlobs(canvases);
        await navigator.share({ text, files });
        return;
      } catch {
        // continue fallback
      }
    }

    await downloadMultipleCards(canvases, "fish-prices");
    tryDeepLink(
      `tg://msg?text=${encodeURIComponent(text)}`,
      `https://t.me/share/url?text=${encodeURIComponent(text)}`
    );
  });
}

export async function shareGeneric(canvases: HTMLElement[], text: string) {
  await withActionButtonsHidden(async () => {
    if (navigator.share) {
      try {
        const files = await getMultipleCardBlobs(canvases);
        await navigator.share({ text, files });
        return;
      } catch {
        // continue fallback
      }
    }
    await downloadMultipleCards(canvases, "fish-prices");
  });
}
