// The measurement ID is public. Never store a Google credential or API secret here.
export function googleAnalyticsTag(value: unknown) {
  const measurementId = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return null;

  return {
    src: `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
    bootstrap: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(measurementId)}, {
  allow_google_signals: false,
  allow_ad_personalization_signals: false
});`,
  };
}
