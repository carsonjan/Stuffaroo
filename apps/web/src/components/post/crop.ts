/** Centre-crops an image file to 4:5 and returns a JPEG object URL (1000×1250 max). */
export async function cropToPortrait(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const target = 4 / 5;
  const ratio = bitmap.width / bitmap.height;
  // The largest 4:5 window inside the image, centred
  const sw = ratio > target ? bitmap.height * target : bitmap.width;
  const sh = ratio > target ? bitmap.height : bitmap.width / target;
  const sx = (bitmap.width - sw) / 2;
  const sy = (bitmap.height - sh) / 2;
  const outW = Math.min(1000, Math.round(sw));
  const outH = Math.round(outW * 1.25);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas isn't available");
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, outW, outH);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );
  if (!blob) throw new Error("Couldn't crop that photo");
  return URL.createObjectURL(blob);
}
