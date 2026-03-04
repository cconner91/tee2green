"use client";

import { Suspense } from "react";
import PlayMatch from "./playMatch";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading match...</div>}>
      <PlayMatch />
    </Suspense>
  );
}