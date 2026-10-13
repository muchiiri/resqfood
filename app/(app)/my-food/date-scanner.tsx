"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/pantry/format";
import { MAX_FILE_BYTES, readText } from "@/lib/pantry/ocr";
import { extractDates } from "@/lib/pantry/scan-dates";

type Message = { kind: "ok" | "error"; text: string } | null;

function fillField(id: string, value: string) {
  const input = document.getElementById(id);
  if (input instanceof HTMLInputElement) input.value = value;
}

export function DateScanner() {
  const fileInput = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  const [reading, setReading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<Message>(null);

  useEffect(() => () => controller.current?.abort(), []);

  async function onChoose(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > MAX_FILE_BYTES) {
      setMessage({ kind: "error", text: "Choose an image under 15 MB." });
      return;
    }

    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setMessage(null);
    setProgress(0);
    setReading(true);

    try {
      const text = await readText(file, setProgress, abort.signal);
      if (abort.signal.aborted) return;
      const { purchasedAt, expiresAt } = extractDates(text);

      if (!purchasedAt && !expiresAt) {
        setMessage({ kind: "ok", text: "No date found. Try a clearer photo, or type the date." });
        return;
      }
      const filled: string[] = [];
      if (purchasedAt) {
        fillField("purchasedAt", purchasedAt);
        filled.push(`bought or saved date ${formatDate(purchasedAt)}`);
      }
      if (expiresAt) {
        fillField("expiresAt", expiresAt);
        filled.push(`expiry date ${formatDate(expiresAt)}`);
      }
      setMessage({ kind: "ok", text: `Filled ${filled.join(" and ")}. Check the dates before saving.` });
    } catch {
      if (!abort.signal.aborted) {
        setMessage({ kind: "error", text: "Could not read the photo. Check your connection and try again." });
      }
    } finally {
      if (!abort.signal.aborted) setReading(false);
    }
  }

  return (
    <section id="scan" aria-labelledby="scan-title" className="flex scroll-mt-20 flex-col gap-3 rounded-2xl border border-dashed bg-card p-4">
      <h2 id="scan-title" className="font-bold">
        Scan the dates
      </h2>
      <p className="text-sm text-muted-foreground">
        Take a photo of the package or receipt and we will suggest the dates. Photos are read on your device and are not
        saved.
      </p>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onChoose}
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        disabled={reading}
        onClick={() => fileInput.current?.click()}
        className="h-11 w-fit rounded-full px-5"
      >
        <Camera className="size-4" aria-hidden="true" />
        {reading ? `Reading photo... ${Math.round(progress * 100)}%` : "Scan dates"}
      </Button>
      <p role="status" className={message?.kind === "ok" ? "text-sm font-medium text-fresh" : "sr-only"}>
        {message?.kind === "ok" ? message.text : ""}
      </p>
      <p role="alert" className="text-sm font-medium text-destructive">
        {message?.kind === "error" ? message.text : ""}
      </p>
    </section>
  );
}
