import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)] px-6 py-16">
      <div className="w-full max-w-lg mx-auto space-y-16">

        {/* Hero */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">
            Tee2Green
          </h1>

          <p className="text-slate-400">
            Golf Match & Betting Engine
          </p>

          <div className="h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />
        </div>

        {/* Primary Match Actions */}
        <div className="space-y-6">

          <Link href="/match/new">
            <div className="bg-gradient-to-r from-sky-500 to-sky-400 text-slate-900 font-semibold py-8 rounded-3xl text-center shadow-xl hover:scale-[1.02] transition cursor-pointer text-lg">
              Start New Match
            </div>
          </Link>

          <Link href="/match/play">
            <div className="bg-slate-800 hover:bg-slate-700 transition py-8 rounded-3xl text-center font-semibold cursor-pointer shadow text-lg">
              Resume Match
            </div>
          </Link>

        </div>

        {/* Golf Game Management */}
        <div className="space-y-6">

          <div className="text-slate-400 text-sm uppercase tracking-wider">
            Golf Games
          </div>

          <div className="grid grid-cols-1 gap-5">

            <Link href="/MyGolfGames">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-sky-500 transition cursor-pointer">
                My Golf Games
              </div>
            </Link>

            <Link href="/GameLibrary">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-sky-500 transition cursor-pointer">
                Golf Game Library
              </div>
            </Link>

          </div>

        </div>

        {/* Betting Section */}
        <div className="space-y-6">

          <div className="text-slate-400 text-sm uppercase tracking-wider">
            Betting
          </div>

          <Link href="/BettingHistory">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-sky-500 transition cursor-pointer">
              Betting History
            </div>
          </Link>

          {/* Betting Summary Widget */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">
                Current Balance
              </span>
              <span className="text-sky-400 font-semibold">
                $$$
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">
                Active Bets
              </span>
              <span className="text-white font-semibold">
                2
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}