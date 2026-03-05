const CAPTURE_WIDTH = 500;
const CAPTURE_HEIGHT = 720;

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
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      } catch {
        // ignore per-image failures
      }
    }),
  );
}

function stageElementForCapture(el: HTMLElement) {
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.top = "0";
  wrapper.style.left = "0";
  wrapper.style.width = `${CAPTURE_WIDTH}px`;
  wrapper.style.height = `${CAPTURE_HEIGHT}px`;
  wrapper.style.overflow = "hidden";
  wrapper.style.pointerEvents = "none";
  wrapper.style.zIndex = "-1";

  const clone = el.cloneNode(true) as HTMLElement;
  clone.style.margin = "0";
  clone.style.position = "relative";
  clone.style.left = "0";
  clone.style.top = "0";
  clone.style.transform = "none";
  clone.style.opacity = "1";
  clone.style.visibility = "visible";

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  return {
    target: clone,
    cleanup: () => wrapper.remove(),
  };
}

async function renderCardCanvas(el: HTMLElement) {
  await ensureFontsReady();
  const staged = stageElementForCapture(el);

  try {
    await ensureImagesReady(staged.target);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const html2canvas = (await import("html2canvas")).default;
    return await html2canvas(staged.target, {
      scale: 4,
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
    });
  } finally {
    staged.cleanup();
  }
}

export async function downloadCard(canvas: HTMLElement, fileName: string) {
  const rendered = await renderCardCanvas(canvas);

  const link = document.createElement("a");
  link.download = fileName;
  link.href = rendered.toDataURL("image/png");
  link.click();
  return rendered;
}

export async function getCardBlob(canvas: HTMLElement): Promise<Blob> {
  const rendered = await renderCardCanvas(canvas);

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

export async function downloadMultipleCards(canvases: HTMLElement[], baseFileName: string) {
  for (let i = 0; i < canvases.length; i++) {
    const suffix = canvases.length > 1 ? `-page${i + 1}` : "";
    await downloadCard(canvases[i], `${baseFileName}${suffix}.png`);
    if (i < canvases.length - 1) {
      await new Promise((r) => setTimeout(r, 220));
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
