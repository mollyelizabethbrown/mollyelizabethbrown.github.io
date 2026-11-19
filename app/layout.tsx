import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import { SITE_URL } from "@/lib/site";
// globals.css is imported by the (site) layout and the root 404 only, so Tailwind's reset never touches the Studio.

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Molly E. Brown — Earth Observation · Climate · Food Security", template: "%s — Molly E. Brown" },
  description:
    "Molly E. Brown is a Research Professor at the University of Maryland whose research connects satellite Earth observation, climate and socioeconomic data to understand risks to agriculture, food security and human well-being.",
  openGraph: { type: "website", siteName: "Molly E. Brown", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#172D28" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable} no-js`} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <script
          // Remove the no-js class before paint so reveal animations only apply with JS.
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.remove('no-js')" }}
        />
        {children}
      </body>
    </html>
  );
}
