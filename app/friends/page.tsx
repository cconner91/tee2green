export default function FriendsPage() {
  return (
    <div className="max-w-md mx-auto px-5 py-16 flex flex-col items-center text-center gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        🍺
      </div>
      <div>
        <h1 className="text-xl font-black">19th Hole</h1>
        <p className="text-slate-500 text-sm mt-1 leading-relaxed">
          Friend groups, head-to-head records,<br />and social features — coming soon.
        </p>
      </div>
    </div>
  );
}
