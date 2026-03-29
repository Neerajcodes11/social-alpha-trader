import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Social Alpha Trader | DeFi Sentiment + StarkZap",
  description:
    "AI-powered DeFi sentiment dashboard. Analyze social signals for ETH, BTC, SOL and execute one-click trades via StarkZap on Starknet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg text-white font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
