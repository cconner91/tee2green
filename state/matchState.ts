import { Player, PlayerId } from "../domain/models/Player";
import { Course } from "../domain/models/Course";
import { HoleResult } from "../domain/core/HoleResult";
import { BettingConfiguration } from "@/domain/betting/types";

export interface MatchState {
  players: Player[];
  course: Course;
  betting: BettingConfiguration;

  playingHandicaps: Record<PlayerId, number>;

  holeResults: HoleResult[];

  currentHole: number;

  gameType: "MATCH_PLAY" | "STROKE_PLAY";

  enableHandicaps: boolean;   // NEW
}