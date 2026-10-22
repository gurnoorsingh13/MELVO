import type { Metadata, Viewport } from "next";
import { Archivo, Martian_Mono, Newsreader } from "next/font/google";
import { Curtain, Cursor, Footer, Header, Menu, Preloader } from "@/components/chrome";
import { SiteProvider } from "@/components/providers";
import { SITE } from "@/lib/content";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const mono = Martian_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Newsreader({ subsets: ["latin"], style: ["italic"], axes: ["opsz"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "MELVO · Thought of it? Let's build it.", template: "%s · MELVO" },
  description: SITE.description,
  openGraph: { title: "MELVO", description: SITE.description, url: SITE.url, siteName: "MELVO", type: "website" },
};

export const viewport: Viewport = { themeColor: "#EEF0EA", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${mono.variable} ${serif.variable}`}>
      <body>
        <noscript>
          <style>{`.preloader{display:none!important}`}</style>
        </noscript>
        <SiteProvider>
          <Preloader />
          <Curtain />
          <Cursor />
          <Header />
          <Menu />
          <main id="main">{children}</main>
          <Footer />
        </SiteProvider>
      </body>
    </html>
  );
}
