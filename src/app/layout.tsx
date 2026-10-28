import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const archivo = localFont({ src: "../fonts/archivo-black-latin-400-normal.woff2", variable: "--font-archivo-black", display: "swap", fallback: ["Impact", "Arial Black", "sans-serif"] });
const plex = localFont({
  src: [
    { path: "../fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/ibm-plex-mono-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
  fallback: ["ui-monospace", "Menlo", "monospace"],
});
// Special Elite is decorative (labels, stamps): subset to Latin + punctuation, not preloaded.
const elite = localFont({ src: "../fonts/special-elite-latin-400-normal.woff2", variable: "--font-special-elite", display: "swap", preload: false, fallback: ["Courier New", "monospace"] });

export const metadata: Metadata = {
  title: "Not Buying",
  description: "Every no is a yes to something. Text what you didn't buy. Split it between what you want, your savings and someone who needs it more.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Not Buying",
    description: "Every no is a yes to something.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#efebe1", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plex.variable} ${elite.variable}`}>
      <body className="min-h-dvh">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
