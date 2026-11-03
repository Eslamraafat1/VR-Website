import type { Metadata, Viewport } from "next";
import { Outfit, JetBrains_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";
import SearchOverlay from "@/components/search-overlay";
import FavoritesDrawer from "@/components/favorites-drawer";
import Cursor from "@/components/cursor";
import { PortalHost } from "@/components/portal";

const sans = Outfit({ variable: "--font-sans-latin", subsets: ["latin"], weight: ["200", "300", "400", "500", "600", "700"] });
const mono = JetBrains_Mono({ variable: "--font-mono-latin", subsets: ["latin"], weight: ["400", "500"] });
const arabic = IBM_Plex_Sans_Arabic({ variable: "--font-sans-arabic", subsets: ["arabic"], weight: ["200", "300", "400", "500", "600", "700"] });

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "VISTRA® — Enter the experience", template: "%s · VISTRA®" },
  description: "THE WORLD OF SHOPPING, REIMAGINED. Explore a virtual mall in 360°, discover stores, products and offers.",
  openGraph: { type: "website", siteName: "VISTRA®", title: "VISTRA® — Enter the experience", description: "Explore a virtual mall in 360°, discover stores, products and offers.", images: [{ url: "/images/mall/hero.jpg", width: 1920, height: 1080, alt: "VISTRA virtual mall" }] },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = { themeColor: "#090b10", width: "device-width", initialScale: 1 };

// Runs before paint: applies the saved theme / language to <html> to prevent flashing.
const bootScript = `try{var d=document.documentElement,t=localStorage.getItem('vistra.theme'),l=localStorage.getItem('vistra.locale');if(t==='light'||t==='dark')d.dataset.theme=t;if(l==='ar'){d.lang='ar';d.dir='rtl'}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" data-theme="dark" suppressHydrationWarning className={`${sans.variable} ${mono.variable} ${arabic.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <AppProviders>
          {children}
          <SearchOverlay />
          <FavoritesDrawer />
          <Cursor />
          <PortalHost />
        </AppProviders>
      </body>
    </html>
  );
}
