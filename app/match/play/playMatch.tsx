"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { HoleScore } from "@/domain/types/holeResult";

export default function PlayMatch() {

  const params = useSearchParams();

  const playerA = params.get("playerA") || "Player 1";
  const playerB = params.get("playerB") || "Player 2";

  const enableBetting = params.get("enableBetting") === "true";
  const betAmount = Number(params.get("betAmount") || 0);

  const [gameType, setGameType] =
    useState<"STROKE_PLAY" | "MATCH_PLAY">(
      (params.get("gameType") as any) || "STROKE_PLAY"
    );

  const [hole, setHole] = useState(1);
  const [par, setPar] = useState(4);

  const [scoreA, setScoreA] = useState<number | null>(null);
  const [scoreB, setScoreB] = useState<number | null>(null);

  const [history, setHistory] = useState<HoleScore[]>([]);

  function formatScore(n:number){
    if(n===0) return "E";
    if(n>0) return `+${n}`;
    return n.toString();
  }

  const grossA = history.reduce((t,h)=>t+h.a,0);
  const grossB = history.reduce((t,h)=>t+h.b,0);

  const toParA = history.reduce((t,h)=>t+(h.a-h.par),0);
  const toParB = history.reduce((t,h)=>t+(h.b-h.par),0);

  const holeWinsA = history.filter(h=>h.a<h.b).length;
  const holeWinsB = history.filter(h=>h.b<h.a).length;

  const matchStatus =
    holeWinsA===holeWinsB
      ? "All Square"
      : holeWinsA>holeWinsB
      ? `${holeWinsA-holeWinsB} UP`
      : `${holeWinsB-holeWinsA} UP`;

  const betBalance = (holeWinsA-holeWinsB)*betAmount;

  function submitHole(){

    if(scoreA===null || scoreB===null) return;

    const updated = [
      ...history,
      { hole, a:scoreA, b:scoreB, par }
    ];

    setHistory(updated);

    setScoreA(null);
    setScoreB(null);

    setHole(hole+1);
  }

  function autoSubmit(player:"A"|"B",score:number){

    if(player==="A"){

      setScoreA(score);

      if(scoreB!==null){
        submitHole();
      }

    }

    if(player==="B"){

      setScoreB(score);

      if(scoreA!==null){
        submitHole();
      }

    }
  }

  function getShape(score:number){

    const diff = score-par;

    if(diff<=-2)
      return "border border-sky-400 rounded-full ring-2 ring-sky-400";

    if(diff===-1)
      return "border border-sky-400 rounded-full";

    if(diff===0)
      return "";

    if(diff===1)
      return "border border-orange-400";

    return "border border-red-500 ring-2 ring-red-500";
  }

  function ScoreButtons({
    selected,
    player
  }:{
    selected:number|null
    player:"A"|"B"
  }){

    return(

      <div className="grid grid-cols-5 gap-2 mt-3">

        {[1,2,3,4,5,6,7,8,9,10].map(n=>(

          <button
            key={n}
            onClick={()=>autoSubmit(player,n)}
            className={`w-14 h-14 flex items-center justify-center text-lg font-semibold bg-slate-800 transition
            ${getShape(n)}
            ${selected===n ? "bg-sky-500 text-black scale-110":""}`}
          >
            {n}
          </button>

        ))}

      </div>

    )

  }

  function ScorecardStrip(){

    return(

      <div className="bg-slate-800 rounded-xl p-3 text-xs space-y-1 overflow-x-auto">

        <div className="grid grid-cols-10 text-center">

          <div></div>

          {[...Array(9)].map((_,i)=>{

            const h=i+1;

            return(
              <div
                key={h}
                className={`${hole===h?"text-sky-400 font-bold":""}`}
              >
                {h}
              </div>
            )

          })}

        </div>

        <div className="grid grid-cols-10 text-center">

          <div className="text-slate-400">Par</div>

          {[...Array(9)].map((_,i)=>(
            <div key={i}>{par}</div>
          ))}

        </div>

        <div className="grid grid-cols-10 text-center">

          <div className="text-slate-400">A</div>

          {[...Array(9)].map((_,i)=>{

            const holeScore=history.find(h=>h.hole===i+1);

            return(
              <div key={i}>
                {holeScore ? holeScore.a : "-"}
              </div>
            )

          })}

        </div>

        <div className="grid grid-cols-10 text-center">

          <div className="text-slate-400">B</div>

          {[...Array(9)].map((_,i)=>{

            const holeScore=history.find(h=>h.hole===i+1);

            return(
              <div key={i}>
                {holeScore ? holeScore.b : "-"}
              </div>
            )

          })}

        </div>

      </div>

    )

  }

  return(

    <div className="min-h-screen bg-slate-900 text-slate-100 flex justify-center px-4">

      <div className="w-full max-w-md py-8 space-y-6">

        {/* GAME TYPE */}

        <div className="flex gap-3 justify-center">

          <button
            onClick={()=>setGameType("STROKE_PLAY")}
            className={`px-4 py-2 rounded-lg ${
              gameType==="STROKE_PLAY"
                ?"bg-sky-400 text-black"
                :"bg-slate-800"
            }`}
          >
            Stroke Play
          </button>

          <button
            onClick={()=>setGameType("MATCH_PLAY")}
            className={`px-4 py-2 rounded-lg ${
              gameType==="MATCH_PLAY"
                ?"bg-sky-400 text-black"
                :"bg-slate-800"
            }`}
          >
            Match Play
          </button>

        </div>

        <ScorecardStrip/>

        <div className="text-center">

          <h1 className="text-2xl font-bold">
            Hole {hole}
          </h1>

          {gameType==="MATCH_PLAY" && (
            <div className="text-sky-400">
              {matchStatus}
            </div>
          )}

        </div>

        {/* PAR SELECT */}

        <div className="flex justify-center gap-3">

          {[3,4,5].map(p=>(

            <button
              key={p}
              onClick={()=>setPar(p)}
              className={`px-4 py-2 rounded-lg ${
                par===p
                  ?"bg-sky-400 text-black"
                  :"bg-slate-800"
              }`}
            >
              Par {p}
            </button>

          ))}

        </div>

        {/* PLAYER A */}

        <div
          className={`bg-slate-800 p-5 rounded-xl ${
            gameType==="STROKE_PLAY" && toParA<toParB
              ?"border border-sky-400"
              :""
          }`}
        >

          <div className="flex justify-between">

            <div className="font-semibold">
              {playerA}
            </div>

            {gameType==="STROKE_PLAY" && (
              <div>{formatScore(toParA)}</div>
            )}

          </div>

          <ScoreButtons
            selected={scoreA}
            player="A"
          />

        </div>

        {/* PLAYER B */}

        <div
          className={`bg-slate-800 p-5 rounded-xl ${
            gameType==="STROKE_PLAY" && toParB<toParA
              ?"border border-sky-400"
              :""
          }`}
        >

          <div className="flex justify-between">

            <div className="font-semibold">
              {playerB}
            </div>

            {gameType==="STROKE_PLAY" && (
              <div>{formatScore(toParB)}</div>
            )}

          </div>

          <ScoreButtons
            selected={scoreB}
            player="B"
          />

        </div>

        {/* LIVE BETTING PANEL */}

        {enableBetting && (

          <div className="bg-slate-800 rounded-xl p-4 space-y-2 text-sm">

            <div className="font-semibold">
              Live Betting
            </div>

            <div>
              Base Bet: ${betAmount}
            </div>

            <div>
              Balance: ${betBalance}
            </div>

            {gameType==="MATCH_PLAY" && (
              <div>
                Match: {matchStatus}
              </div>
            )}

          </div>

        )}

      </div>

    </div>

  )

}