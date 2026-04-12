"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/",        label: "Home"         },
  { href: "/setup",   label: "Start Round"  },
  { href: "/round",   label: "Active Round" },
  { href: "/games",   label: "Game Library" },
  { href: "/history", label: "History"      },
  { href: "/profile", label: "My Profile"   },
];

export default function NavShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.06] bg-[#0a0a0a] sticky top-0 z-40">
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-white transition rounded-lg hover:bg-white/[0.06]"
          aria-label="Open menu"
        >
          <svg viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-4 h-4">
            <line x1="0" y1="1" x2="18" y2="1" />
            <line x1="0" y1="7" x2="18" y2="7" />
            <line x1="0" y1="13" x2="18" y2="13" />
          </svg>
        </button>

        <Link href="/" className="font-black tracking-tight text-sm text-white hover:text-emerald-400 transition">
          TEE2GREEN
        </Link>

        {/* Placeholder for right-side action (profile icon later) */}
        <div className="w-9" />
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 bg-[#0f0f0f] border-r border-white/[0.06] transition-transform duration-250 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.06]">
          <span className="font-black text-sm tracking-tight">TEE2GREEN</span>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-600 hover:text-white transition text-lg leading-none"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav className="px-2 py-4">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}>
              <div
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] transition cursor-pointer"
              >
                {label}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      <main>{children}</main>
    </>
  );
}
