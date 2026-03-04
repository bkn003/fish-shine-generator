export async function downloadCard(canvas: HTMLElement, fileName: string) {
  const html2canvas = (await import("html2canvas")).default;
  const c = await html2canvas(canvas, {
    scale: 4,
    useCORS: true,
    backgroundColor: null,
    width: 500,
    height: 720,
  });
  const link = document.createElement("a");
  link.download = fileName;
  link.href = c.toDataURL("image/png");
  link.click();
  return c;
}

export async function getCardBlob(canvas: HTMLElement): Promise<Blob> {
  const html2canvas = (await import("html2canvas")).default;
  const c = await html2canvas(canvas, {
    scale: 4,
    useCORS: true,
    backgroundColor: null,
    width: 500,
    height: 720,
  });
  return new Promise((resolve) => {
    c.toBlob((blob) => resolve(blob!), "image/png");
  });
}

export async function shareToWhatsApp(canvas: HTMLElement, text: string) {
  if (navigator.share) {
    try {
      const blob = await getCardBlob(canvas);
      const file = new File([blob], "fish-prices.png", { type: "image/png" });
      await navigator.share({ text, files: [file] });
      return;
    } catch {}
  }
  await downloadCard(canvas, "fish-prices.png");
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}

export async function shareToFacebook(canvas: HTMLElement) {
  await downloadCard(canvas, "fish-prices.png");
  window.open("https://www.facebook.com/", "_blank");
}

export async function shareToInstagram(canvas: HTMLElement) {
  if (navigator.share) {
    try {
      const blob = await getCardBlob(canvas);
      const file = new File([blob], "fish-prices.png", { type: "image/png" });
      await navigator.share({ files: [file] });
      return;
    } catch {}
  }
  await downloadCard(canvas, "fish-prices.png");
  window.open("https://www.instagram.com/", "_blank");
}
