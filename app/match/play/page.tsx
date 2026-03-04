"use client";

import { Suspense } from "react";
import PlayMatch from "./PlayMatch";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10">Loading match...</div>}>
      <PlayMatch />
    </Suspense>
  );
}