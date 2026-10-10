import Script from "next/script";
import analytics from "@/content/analytics.json";
import { googleAnalyticsTag } from "@/lib/google-analytics";

export function GoogleAnalytics() {
  const tag = googleAnalyticsTag(analytics.measurementId);
  if (!tag) return null;

  // GA4 enhanced measurement handles page loads and client-side navigation.
  // Do not also send manual page_view events: that would duplicate visits.
  return <>
    <Script id="clubismo-google-analytics-init" strategy="afterInteractive">
      {tag.bootstrap}
    </Script>
    <Script id="clubismo-google-analytics" src={tag.src} strategy="afterInteractive" />
  </>;
}
