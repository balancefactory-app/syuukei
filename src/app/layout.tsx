import type { Metadata, Viewport } from "next";
import { Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import AppBootstrap from "@/components/AppBootstrap";

const mincho = Shippori_Mincho({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--font-mincho",
  display: "swap",
});

const gothic = Zen_Kaku_Gothic_New({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-gothic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Therapy English Coach | Balance Factory",
  description:
    "神奈川県藤沢市片瀬山の古民家サロン「バランスファクトリー」スタッフのための接客英会話ロールプレイ練習アプリ。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${mincho.variable} ${gothic.variable}`}>
      <body className="font-sans">
        <AppBootstrap />
        {children}
      </body>
    </html>
  );
}
