import type { Metadata } from "next";
import { M_PLUS_1, Urbanist } from "next/font/google";
import "./globals.css";

/* Figma reports Urbanist in Light/Medium/SemiBold/Bold/ExtraBold/Black across
   this screen, and M PLUS 1 Bold for the EverCent wordmark alone. */
const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["300", "500", "600", "700", "800", "900"],
  variable: "--font-urbanist",
  display: "swap",
});

const mplus = M_PLUS_1({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-mplus",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EverCent — Budget",
  description: "Zero-based budgeting workspace",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" className={`${urbanist.variable} ${mplus.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
