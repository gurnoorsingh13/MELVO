import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { Curtain, EdgeBlur, FloatCard, Footer, Header, Menu } from "@/components/chrome";
import { SiteProvider } from "@/components/providers";
import { SITE } from "@/lib/content";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "MELVO · Thought of it? Let's build it.", template: "%s · MELVO" },
  description: SITE.description,
  openGraph: { title: "MELVO", description: SITE.description, url: SITE.url, siteName: "MELVO", type: "website" },
};

export const viewport: Viewport = { themeColor: "#0B1A16", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <SiteProvider>
          <Curtain />
          <EdgeBlur />
          <Header />
          <Menu />
          <main id="main">{children}</main>
          <FloatCard />
          <Footer />
        </SiteProvider>
      </body>
    </html>
  );
}
