import type { Metadata } from "next";
import "./globals.css";
import { assetPath, brand } from "@/lib/site";
import { settings } from "@/lib/settings";

export const metadata: Metadata = {
  title: { default: "Clubismo Off — Futebol além do placar", template: "%s | Clubismo Off" },
  description: "Futebol brasileiro, opinião, análises e resenha. A paixão fica. O clubismo sai.",
  robots: { index: settings.allowIndexing, follow: true },
  icons: {
    icon: { url: assetPath(brand.logo), type: "image/png" },
    shortcut: assetPath(brand.logo),
    apple: assetPath(brand.logo),
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
