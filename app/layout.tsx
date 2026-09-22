import type { Metadata } from "next";
import "./globals.css";
import { assetPath } from "@/lib/site";
import { settings } from "@/lib/settings";

export const metadata: Metadata = {
  title: { default: "Clubismo Off — Futebol além do placar", template: "%s | Clubismo Off" },
  description: "Futebol brasileiro, opinião, análises e resenha. A paixão fica. O clubismo sai.",
  robots: { index: settings.allowIndexing, follow: true },
  icons: {
    icon: assetPath("/favicon.svg"),
    shortcut: assetPath("/favicon.svg"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
