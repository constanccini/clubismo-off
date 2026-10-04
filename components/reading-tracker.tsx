"use client";
import { useEffect } from "react";
import { readershipApiUrl } from "@/lib/readership-config";

/** Browser storage only deduplicates this tab; shared counts live on the server. */
export function ReadingTracker({ id }: { id: string }) {
  useEffect(() => {
    if (!readershipApiUrl || navigator.webdriver) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let completed = false;
    const count = async () => {
      if (completed) return;
      const bucket = Math.floor(Date.now() / 1_800_000);
      const key = `clubismo:read:${bucket}:${id}`;
      let session: string;
      try {
        if (sessionStorage.getItem(key)) return;
        session = sessionStorage.getItem("clubismo:session") || crypto.randomUUID();
        sessionStorage.setItem("clubismo:session", session);
      } catch { return; }
      try {
        const response = await fetch(`${readershipApiUrl}/v1/view`, { method: "POST", credentials: "omit", signal: controller.signal,
          headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, session }), keepalive: true });
        if (response.ok) { completed = true; try { sessionStorage.setItem(key, "1"); } catch {} }
      } catch { /* Reading never depends on analytics availability. */ }
    };
    const visible = () => {
      if (timer) clearTimeout(timer);
      if (!completed && document.visibilityState === "visible") timer = setTimeout(count, 2000);
    };
    document.addEventListener("visibilitychange", visible);
    visible();
    return () => { if (timer) clearTimeout(timer); document.removeEventListener("visibilitychange", visible); controller.abort(); };
  }, [id]);
  return null;
}
