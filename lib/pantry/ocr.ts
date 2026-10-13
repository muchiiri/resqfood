// Browser-only. The photo stays in memory and is never uploaded: only the OCR engine and its
// English language data are fetched, from tesseract.js's default CDN locations.

export const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_SIDE = 1600;
const LSTM_ONLY = 1;

async function downscale(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not prepare the image"))), "image/png"),
  );
}

export async function readText(file: File, onProgress: (fraction: number) => void, signal: AbortSignal): Promise<string> {
  const image = await downscale(file);
  if (signal.aborted) throw new DOMException("Scan cancelled", "AbortError");

  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", LSTM_ONLY, {
    logger: (message) => {
      if (message.status === "recognizing text") onProgress(message.progress);
    },
  });
  const cancel = () => void worker.terminate();
  signal.addEventListener("abort", cancel);

  try {
    const { data } = await worker.recognize(image);
    return data.text;
  } finally {
    signal.removeEventListener("abort", cancel);
    await worker.terminate();
  }
}
