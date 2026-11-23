"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

type ConsentData = {
  cmpStatus?: string;
  eventStatus?: string;
  gdprApplies?: boolean;
  listenerId?: number;
  purpose?: { consents?: Record<number, boolean> };
  vendor?: { consents?: Record<number, boolean> };
};
declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
    __tcfapi?: (
      command: string,
      version: number,
      callback: (data: ConsentData, success: boolean) => void,
      parameter?: number,
    ) => void;
  }
}

/** Consent-gated integration point. Configure a certified external CMP before enabling. */
export function AdSlot({
  slotId,
  format = "auto",
}: {
  slotId: string;
  format?: "auto" | "horizontal" | "rectangle";
}) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";
  const configured =
    process.env.NODE_ENV === "production" &&
    /^ca-pub-\d{16}$/.test(client) &&
    /^\d{10}$/.test(slotId) &&
    process.env.NEXT_PUBLIC_ADSENSE_CMP_READY === "true";
  const [consent, setConsent] = useState(false);
  const [ready, setReady] = useState(false);
  const ad = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  useEffect(() => {
    if (!configured) return;
    let listenerId: number | undefined;
    let disposed = false;
    let registered = false;
    const register = () => {
      if (registered || !window.__tcfapi) return;
      registered = true;
      window.__tcfapi("addEventListener", 2, (data, success) => {
        if (disposed) return;
        listenerId = data?.listenerId;
        const settled =
          data?.eventStatus === "tcloaded" ||
          data?.eventStatus === "useractioncomplete";
        const allowed =
          data?.gdprApplies === false ||
          (data?.gdprApplies === true &&
            data.purpose?.consents?.[1] &&
            data.purpose?.consents?.[3] &&
            data.purpose?.consents?.[4] &&
            data.vendor?.consents?.[755]);
        setConsent(
          Boolean(
            success && settled && data?.cmpStatus === "loaded" && allowed,
          ),
        );
      });
    };
    register();
    const timer = window.setInterval(register, 1000);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      if (listenerId !== undefined)
        window.__tcfapi?.("removeEventListener", 2, () => {}, listenerId);
    };
  }, [configured]);
  useEffect(() => {
    if (!consent) {
      pushed.current = false;
      return;
    }
    if (!ready || pushed.current || !ad.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* Ad blockers leave the reserved slot intact. */
    }
  }, [consent, ready]);
  if (!configured && process.env.NODE_ENV === "production") return null;
  return (
    <aside
      aria-label="Advertisement"
      className={`my-10 flex flex-col items-center justify-center overflow-hidden rounded border border-dashed border-[var(--border)] ${format === "horizontal" ? "min-h-[90px]" : "min-h-[250px]"}`}
    >
      <span className="eyebrow muted py-3" style={{ fontSize: 9 }}>
        Advertisement
      </span>
      <div
        className="flex w-full items-center justify-center"
        style={{ minHeight: format === "horizontal" ? 90 : 250 }}
      >
        {configured && consent ? (
          <>
            <Script
              id="margin-adsense"
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
              strategy="afterInteractive"
              crossOrigin="anonymous"
              onReady={() => setReady(true)}
            />
            <ins
              ref={ad}
              className="adsbygoogle block w-full"
              style={{ minHeight: format === "horizontal" ? 90 : 250 }}
              data-ad-client={client}
              data-ad-slot={slotId}
              data-ad-format={format}
              data-full-width-responsive="true"
            />
          </>
        ) : process.env.NODE_ENV !== "production" ? (
          <p className="muted px-4 pb-3 text-center text-xs">
            Ad space · reserved for a future partner
          </p>
        ) : null}
      </div>
    </aside>
  );
}
