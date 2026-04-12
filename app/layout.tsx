import type { Viewport } from "next";
import "./globals.css";
import NavShell from "./NavShell";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-dvh">
        <NavShell>
          {children}
        </NavShell>
      </body>
    </html>
  );
}