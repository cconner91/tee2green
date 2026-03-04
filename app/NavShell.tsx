"use client";

import { useState } from "react";
import Link from "next/link";

export default function NavShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top Nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <button
          onClick={() => setOpen(true)}
          className="text-2xl text-slate-300 hover:text-sky-400 transition"
        >
          ☰
        </button>

        <div className="font-semibold tracking-wide text-lg">
          Tee2Green
        </div>

        <div className="w-6" />
      </div>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/50"
            onClick={() => setOpen(false)}
          />

          <div className="w-72 bg-slate-900 p-8 space-y-6 shadow-2xl">
            <div className="text-lg font-semibold">
              Menu
            </div>

            <nav className="space-y-4 text-slate-300">
              <Link href="/">
                <div
                  onClick={() => setOpen(false)}
                  className="hover:text-sky-400 cursor-pointer transition"
                >
                  Home
                </div>
              </Link>

              <Link href="/match/new">
                <div
                  onClick={() => setOpen(false)}
                  className="hover:text-sky-400 cursor-pointer transition"
                >
                  Start Match
                </div>
              </Link>

              <Link href="/profile">
                <div
                  onClick={() => setOpen(false)}
                  className="hover:text-sky-400 cursor-pointer transition"
                >
                  My Profile
                </div>
              </Link>

              <Link href="/history">
                <div
                  onClick={() => setOpen(false)}
                  className="hover:text-sky-400 cursor-pointer transition"
                >
                  Match History
                </div>
              </Link>
            </nav>
          </div>
        </div>
      )}

      <main>{children}</main>
    </>
  );
}