import type { Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import NavShell from "./NavShell";

const sans = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="text-slate-100 min-h-dvh antialiased">
        <NavShell>{children}</NavShell>
      </body>
    </html>
  );
}