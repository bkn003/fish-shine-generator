// Temporarily make an element visible for capture (handles hidden/display:none)
function prepareForCapture(el: HTMLElement): (() => void) {
  const hiddenParent = el.closest('.hidden') as HTMLElement | null;
  if (hiddenParent && hiddenParent !== el) {
    const prev = hiddenParent.style.cssText;
    hiddenParent.style.display = 'block';
    hiddenParent.style.position = 'absolute';
    hiddenParent.style.left = '-9999px';
    hiddenParent.style.top = '0';
    return () => { hiddenParent.style.cssText = prev; };
  }
  return () => {};
}

async function ensureFontsReady() {
  if ('fonts' in document) {
    try {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    } catch {
      // ignore
    }
  }
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

export async function downloadCard(canvas: HTMLElement, fileName: string) {
  const restore = prepareForCapture(canvas);
  await ensureFontsReady();
  const html2canvas = (await import("html2canvas")).default;
  const c = await html2canvas(canvas, {
    scale: 4,
    useCORS: true,
    backgroundColor: null,
    width: 500,
    height: 720,
    foreignObjectRendering: true,
    logging: false,
  });
  restore();

  const link = document.createElement("a");
  link.download = fileName;
  link.href = c.toDataURL("image/png");
  link.click();
  return c;
}

export async function getCardBlob(canvas: HTMLElement): Promise<Blob> {
  const restore = prepareForCapture(canvas);
  await ensureFontsReady();
  const html2canvas = (await import("html2canvas")).default;
  const c = await html2canvas(canvas, {
    scale: 4,
    useCORS: true,
    backgroundColor: null,
    width: 500,
    height: 720,
    foreignObjectRendering: true,
    logging: false,
  });
  restore();

  return new Promise((resolve) => {
    c.toBlob((blob) => resolve(blob!), "image/png");
  });
}

export async function downloadMultipleCards(canvases: HTMLElement[], baseFileName: string) {
  for (let i = 0; i < canvases.length; i++) {
    const suffix = canvases.length > 1 ? `-page${i + 1}` : "";
    await downloadCard(canvases[i], `${baseFileName}${suffix}.png`);
    if (i < canvases.length - 1) {
      await new Promise((r) => setTimeout(r, 450));
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
