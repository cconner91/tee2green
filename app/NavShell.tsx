"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Tab bar icons ────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function GamesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="9" height="9" rx="1.5" />
      <rect x="13" y="2" width="9" height="9" rx="1.5" />
      <rect x="2" y="13" width="9" height="9" rx="1.5" />
      <rect x="13" y="13" width="9" height="9" rx="1.5" />
    </svg>
  );
}

function WinningsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ─── Tab item ─────────────────────────────────────────────────────────────────

function TabItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
        active ? "text-emerald-400" : "text-slate-600"
      }`}
    >
      {icon}
      <span className="text-[9px] font-semibold tracking-wide leading-none uppercase">
        {label}
      </span>
    </Link>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export default function NavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide bottom nav on the active round screen — it's immersive and has its own tab bar
  const showBottomNav = !pathname.startsWith("/round");

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.06] bg-[#060d1a]/90 backdrop-blur-xl sticky top-0 z-40">
        {/* Left spacer / back context handled per-page */}
        <div className="w-10" />

        <Link
          href="/"
          className="font-black tracking-tight text-sm text-white hover:text-emerald-400 transition-colors"
        >
          TEE2GREEN
        </Link>

        <Link
          href="/profile"
          className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/[0.06]"
          aria-label="My Profile"
        >
          <ProfileIcon />
        </Link>
      </div>

      {/* Main content — extra bottom padding when tab bar is showing */}
      <main className={showBottomNav ? "pb-24" : ""}>{children}</main>

      {/* Bottom tab bar */}
      {showBottomNav && (
        <div className="fixed bottom-0 inset-x-0 z-50">
          <div className="max-w-md mx-auto relative">

            {/* FAB — Start New Match */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1">
              <Link href="/setup" aria-label="Start New Match">
                <div
                  className="w-[54px] h-[54px] rounded-full flex items-center justify-center border-[3px] border-[#060d1a] active:scale-95 transition-transform"
                  style={{
                    background: "linear-gradient(180deg, #4ade80 0%, #059669 100%)",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.18) inset, 0 8px 24px rgba(16,185,129,0.55)",
                  }}
                >
                  {/* Plus icon */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.8" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
              </Link>
              <span className="text-[9px] font-bold tracking-wide text-emerald-400 uppercase leading-none">
                New Match
              </span>
            </div>

            {/* Tab bar background */}
            <div
              className="grid grid-cols-5 items-stretch bg-[#060d1a]/95 backdrop-blur-2xl border-t border-white/[0.07]"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
              <TabItem href="/"        icon={<HomeIcon />}     label="Home"    active={isActive("/")} />
              <TabItem href="/history" icon={<HistoryIcon />}  label="My Rounds"  active={isActive("/history")} />
              <div className="py-5" /> {/* spacer for FAB */}
              <TabItem href="/games"   icon={<GamesIcon />}    label="Game Library"   active={isActive("/games")} />
              <TabItem href="/history" icon={<WinningsIcon />} label="Winnings"      active={false} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
