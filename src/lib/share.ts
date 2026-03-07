const CAPTURE_WIDTH = 500;
const CAPTURE_HEIGHT = 720;

function getCaptureScale() {
  if (typeof window === "undefined") return 2;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  return Math.max(2, Math.min(3, dpr * 1.5));
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

function stageElementForCapture(el: HTMLElement) {
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.top = "0";
  wrapper.style.left = "-10000px";
  wrapper.style.width = `${CAPTURE_WIDTH}px`;
  wrapper.style.height = `${CAPTURE_HEIGHT}px`;
  wrapper.style.overflow = "hidden";
  wrapper.style.pointerEvents = "none";
  wrapper.style.opacity = "1";
  wrapper.style.zIndex = "-1";
  wrapper.style.isolation = "isolate";

  const clone = el.cloneNode(true) as HTMLElement;
  clone.style.margin = "0";
  clone.style.position = "relative";
  clone.style.left = "0";
  clone.style.top = "0";
  clone.style.width = `${CAPTURE_WIDTH}px`;
  clone.style.height = `${CAPTURE_HEIGHT}px`;
  clone.style.transform = "none";
  clone.style.opacity = "1";
  clone.style.visibility = "visible";
  clone.style.contain = "layout paint style";

  freezeAnimations(clone);

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  return {
    target: clone,
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

async function renderCardCanvas(el: HTMLElement) {
  await ensureFontsReady();
  const staged = stageElementForCapture(el);

  try {
    await ensureImagesReady(staged.target);
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

    const html2canvas = (await import("html2canvas")).default;
    const scale = getCaptureScale();

    const render = async (renderScale: number) => {
      return await html2canvas(staged.target, {
        scale: renderScale,
        useCORS: true,
        backgroundColor: null,
        width: CAPTURE_WIDTH,
        height: CAPTURE_HEIGHT,
        windowWidth: CAPTURE_WIDTH,
        windowHeight: CAPTURE_HEIGHT,
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
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
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
  const rendered = await renderCardCanvas(canvas);
  const blob = await canvasToBlob(rendered);

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = fileName;
  link.href = url;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1200);
  return rendered;
}

export async function getCardBlob(canvas: HTMLElement): Promise<Blob> {
  const rendered = await renderCardCanvas(canvas);
  return await canvasToBlob(rendered);
}

export async function downloadMultipleCards(canvases: HTMLElement[], baseFileName: string) {
  for (let i = 0; i < canvases.length; i++) {
    const suffix = canvases.length > 1 ? `-page${i + 1}` : "";
    await downloadCard(canvases[i], `${baseFileName}${suffix}.png`);
    if (i < canvases.length - 1) {
      await new Promise((r) => setTimeout(r, 350));
    }
  }
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

export async function shareToWhatsApp(canvases: HTMLElement[], text: string) {
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
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}

export async function shareToFacebook(canvases: HTMLElement[]) {
  await downloadMultipleCards(canvases, "fish-prices");
  window.open("https://www.facebook.com/", "_blank");
}

export async function shareToInstagram(canvases: HTMLElement[]) {
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
  window.open("https://www.instagram.com/", "_blank");
}

export async function shareToTwitter(canvases: HTMLElement[], text: string) {
  await downloadMultipleCards(canvases, "fish-prices");
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
}

export async function shareToTelegram(canvases: HTMLElement[], text: string) {
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
  window.open(`https://t.me/share/url?text=${encodeURIComponent(text)}`, "_blank");
}

export async function shareGeneric(canvases: HTMLElement[], text: string) {
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
}
