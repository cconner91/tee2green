import "./globals.css";
import NavShell from "./NavShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <NavShell>
          {children}
        </NavShell>
      </body>
    </html>
  );
}