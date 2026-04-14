// ─── Game Library ─────────────────────────────────────────────────────────────
// Single source of truth for all display content in the Game Library.
//
// EDITING GUIDE:
//   • Edit names, overviews, howItWorks bullets, typicalPlayers, formats freely.
//   • To add a new game: copy any entry below, give it a unique id, fill in fields.
//   • To make a game playable, also add it to domain/gameConfig/definitions.ts and
//     set engineStatus: "ready" here.
//   • Set engineStatus: "stub" to show the game as "Coming Soon" (no Play button).
//
// Fields:
//   id              – must match GolfGameDefinition.id for playable games
//   name            – display name
//   overview        – 1–2 sentence summary (shown on collapsed card)
//   howItWorks      – ordered bullet points (shown when card is expanded)
//   minPlayers      – minimum player count
//   maxPlayers      – maximum player count
//   typicalPlayers  – human-readable "usually played as" string
//   scoringFormats  – ["Stroke Play", "Match Play", "Points-Based"]
//   gameplayFormats – ["Individual", "Best Ball", "Scramble", "Shamble", "Alt Shot", ...]
//   matchupFormats  – ["Solo", "H2H", "Team Play", "Group"]
//   bettingFormats  – ["Flat Bet", "Nassau", "Skins", "Hole-by-Hole", "Custom"]
//   handicapsAllowed – true / false
//   engineStatus    – "ready" | "stub"
//   tags            – short chips shown on the card

export interface GameLibraryEntry {
  id: string;
  name: string;
  overview: string;
  howItWorks: string[];
  minPlayers: number;
  maxPlayers: number;
  typicalPlayers: string;
  scoringFormats: string[];
  gameplayFormats: string[];
  matchupFormats: string[];
  bettingFormats: string[];
  handicapsAllowed: boolean;
  engineStatus: "ready" | "stub";
  tags: string[];
}

// ─────────────────────────────────────────────────────────────────────────────

export const gameLibrary: GameLibraryEntry[] = [

  // ── Playable now ─────────────────────────────────────────────────────────────

  {
    id: "stroke-play-game",
    name: "Medal Play (Stroke Play)",
    overview:
      "Players compete for the lowest total strokes. Count cumulative net or gross strokes across all holes — lowest number wins.",
    howItWorks: [
      "Each player takes cumulative net or gross strokes hole by hole.",
      "Lowest total number of strokes at the end of the round = winner.",
    ],
    minPlayers: 1,
    maxPlayers: 8,
    typicalPlayers: "1v1, 1v1v1, 2v2, 2v1",
    scoringFormats: ["Stroke Play"],
    gameplayFormats: ["Individual", "Best Ball", "Alt Shot", "Scramble", "Shamble"],
    matchupFormats: ["H2H", "Team Play"],
    bettingFormats: ["Flat Bet", "Nassau", "Hole-by-Hole", "Skins"],
    handicapsAllowed: true,
    engineStatus: "ready",
    tags: ["Classic", "Individual"],
  },

  {
    id: "match-play-game",
    name: "Match Play",
    overview:
      "Players compete to win individual holes rather than total strokes. Most holes won takes the match.",
    howItWorks: [
      "Goal: win more cumulative holes than your opponent — regardless of total strokes.",
      "Each hole won = +1 Up. Ties on a hole = All Square (AS).",
      "If Player A is 1 Up through 4 holes and Player B wins hole 5, the match is All Square.",
      "Dormie: when a player can no longer win outright but can only tie — not enough holes remain to overcome the deficit.",
    ],
    minPlayers: 2,
    maxPlayers: 4,
    typicalPlayers: "1v1 or 2v2",
    scoringFormats: ["Match Play"],
    gameplayFormats: ["Individual", "Best Ball", "Alt Shot", "Scramble", "Shamble"],
    matchupFormats: ["H2H", "Team Play"],
    bettingFormats: ["Flat Bet", "Nassau", "Hole-by-Hole", "Skins"],
    handicapsAllowed: true,
    engineStatus: "ready",
    tags: ["Classic", "H2H"],
  },

  {
    id: "team-best-ball",
    name: "Fourball (Best Ball) Match",
    overview:
      "Teams of 2 each play their own ball — the best score on each hole counts for the team.",
    howItWorks: [
      "Each player plays their own ball for the entire hole.",
      "The lower of the two team members' scores counts as the team's score on that hole.",
      "The team with the best aggregate score at the end wins.",
    ],
    minPlayers: 4,
    maxPlayers: 8,
    typicalPlayers: "2v2",
    scoringFormats: ["Stroke Play"],
    gameplayFormats: ["Best Ball"],
    matchupFormats: ["Team Play"],
    bettingFormats: ["Flat Bet", "Nassau", "Hole-by-Hole", "Skins"],
    handicapsAllowed: true,
    engineStatus: "ready",
    tags: ["Team", "2v2"],
  },

  {
    id: "stableford",
    name: "Stableford",
    overview:
      "A points-based system that rewards aggressive play. Score points per hole relative to par — highest total wins.",
    howItWorks: [
      "Points per hole: Bogey = 1, Par = 2, Birdie = 3, Eagle = 4, Albatross = 5.",
      "Double bogey or worse = 0 points.",
      "Highest total points at the end of the round wins.",
    ],
    minPlayers: 1,
    maxPlayers: 8,
    typicalPlayers: "2–4 players",
    scoringFormats: ["Points-Based"],
    gameplayFormats: ["Individual"],
    matchupFormats: ["Solo", "H2H"],
    bettingFormats: ["Flat Bet"],
    handicapsAllowed: false,
    engineStatus: "ready",
    tags: ["Points", "Individual"],
  },

  {
    id: "scramble-game",
    name: "Scramble Match",
    overview:
      "A team-based format where all players hit each shot and the team always plays from the best one.",
    howItWorks: [
      "All players tee off.",
      "The team selects the best shot.",
      "Everyone plays their next shot from that spot.",
      "Repeat until the hole is finished.",
    ],
    minPlayers: 2,
    maxPlayers: 8,
    typicalPlayers: "2v2 or larger teams",
    scoringFormats: ["Stroke Play", "Match Play"],
    gameplayFormats: ["Scramble"],
    matchupFormats: ["Team Play"],
    bettingFormats: ["Flat Bet", "Nassau", "Hole-by-Hole", "Skins"],
    handicapsAllowed: true,
    engineStatus: "ready",
    tags: ["Team", "Fun"],
  },

  // ── Coming soon ───────────────────────────────────────────────────────────────

  {
    id: "shamble-game",
    name: "Shamble Match",
    overview:
      "A hybrid of scramble and individual play — everyone shares the best drive, then each player finishes their own ball.",
    howItWorks: [
      "All players hit their tee shots.",
      "The best tee shot from the team is selected.",
      "Each player plays their own ball from that spot until holed.",
      "The best score counts for the team (or match play scoring applies).",
    ],
    minPlayers: 2,
    maxPlayers: 8,
    typicalPlayers: "2v2",
    scoringFormats: ["Stroke Play", "Match Play"],
    gameplayFormats: ["Shamble"],
    matchupFormats: ["Team Play"],
    bettingFormats: ["Flat Bet", "Nassau", "Hole-by-Hole", "Skins"],
    handicapsAllowed: true,
    engineStatus: "stub",
    tags: ["Team", "Hybrid"],
  },

  {
    id: "wolf",
    name: "Wolf",
    overview:
      "A rotating game where one player (the Wolf) decides each hole whether to team up or go solo after seeing all tee shots.",
    howItWorks: [
      "Players rotate as the Wolf in a fixed order each hole.",
      "After all tee shots, the Wolf chooses: pick a partner (2v2) or go solo (1v3 for higher stakes).",
      "If the Wolf's side wins the hole, they collect. If they lose, they pay out.",
      "Points and bets vary based on the outcome of each hole.",
    ],
    minPlayers: 4,
    maxPlayers: 4,
    typicalPlayers: "4 players",
    scoringFormats: ["Points-Based", "Match Play"],
    gameplayFormats: ["Individual", "Best Ball", "Alt Shot", "Scramble", "Shamble"],
    matchupFormats: ["H2H", "Team Play"],
    bettingFormats: ["Hole-by-Hole", "Custom"],
    handicapsAllowed: false,
    engineStatus: "stub",
    tags: ["Strategy", "Per Hole", "4 Players"],
  },

  {
    id: "bingo-bango-bongo",
    name: "Bingo Bango Bongo",
    overview:
      "A fun points game that rewards three different on-hole achievements — no single player can sweep all three easily.",
    howItWorks: [
      "3 points are up for grabs each hole.",
      "Bingo: awarded to the first player to get their ball on the green.",
      "Bango: awarded to the player closest to the pin once all balls are on the green.",
      "Bongo: awarded to the first player to hole out.",
      "Player with the most cumulative points wins.",
    ],
    minPlayers: 2,
    maxPlayers: 4,
    typicalPlayers: "3–4 players",
    scoringFormats: ["Points-Based"],
    gameplayFormats: ["Individual"],
    matchupFormats: ["H2H"],
    bettingFormats: ["Flat Bet", "Custom"],
    handicapsAllowed: false,
    engineStatus: "stub",
    tags: ["Points", "Per Hole", "Fun"],
  },

  {
    id: "vegas",
    name: "Vegas",
    overview:
      "A high-stakes team game where both players' scores are combined into a two-digit number each hole — lower combined number wins.",
    howItWorks: [
      "Teams of 2.",
      "Each hole, combine the team's scores into a two-digit number — lower score goes first (e.g., a 4 and a 5 = 45).",
      "The team with the lower combined number wins the hole.",
      "Birdies can flip the number — a 3+5 becomes 35 while opponents' 4+4 = 44.",
      "Massive swings are possible and expected.",
    ],
    minPlayers: 4,
    maxPlayers: 4,
    typicalPlayers: "2v2",
    scoringFormats: ["Points-Based"],
    gameplayFormats: ["Individual"],
    matchupFormats: ["Team Play"],
    bettingFormats: ["Hole-by-Hole", "Custom"],
    handicapsAllowed: false,
    engineStatus: "stub",
    tags: ["Team", "Betting", "2v2"],
  },

  {
    id: "snake",
    name: "Snake",
    overview:
      "A putting-based side game — the last player to 3-putt holds the Snake, and the holder at the end pays the group.",
    howItWorks: [
      "The Snake is held by the last player to 3-putt.",
      "Every new 3-putt passes the Snake to the new holder.",
      "At the end of the round, the player holding the Snake pays the group.",
      "A powerful incentive to two-putt under pressure.",
    ],
    minPlayers: 2,
    maxPlayers: 4,
    typicalPlayers: "3–4 players",
    scoringFormats: ["Points-Based"],
    gameplayFormats: ["Individual"],
    matchupFormats: ["Group"],
    bettingFormats: ["Custom"],
    handicapsAllowed: false,
    engineStatus: "stub",
    tags: ["Putting", "Side Game", "Fun"],
  },

  {
    id: "hollywood",
    name: "Hollywood",
    overview:
      "A 4-player rotating partners game where alliances shift every 6 holes — loyalty is temporary.",
    howItWorks: [
      "Players rotate partners every 6 holes (3 different pairings across 18 holes).",
      "Each 6-hole stretch is played as Best Ball within the pairing.",
      "Total performance across all three rotations determines the overall winner.",
      "Nassau-style betting is recommended.",
    ],
    minPlayers: 4,
    maxPlayers: 4,
    typicalPlayers: "4 players",
    scoringFormats: ["Match Play", "Stroke Play"],
    gameplayFormats: ["Best Ball"],
    matchupFormats: ["Team Play"],
    bettingFormats: ["Nassau", "Custom"],
    handicapsAllowed: true,
    engineStatus: "stub",
    tags: ["Team", "Rotating Partners", "4 Players"],
  },

  {
    id: "9-ball",
    name: "9-Ball",
    overview: "A competitive points game played across 9-hole segments. Full rules coming soon.",
    howItWorks: [
      "Details coming soon.",
    ],
    minPlayers: 2,
    maxPlayers: 4,
    typicalPlayers: "3–4 players",
    scoringFormats: ["Points-Based"],
    gameplayFormats: ["Individual"],
    matchupFormats: ["H2H"],
    bettingFormats: ["Custom"],
    handicapsAllowed: false,
    engineStatus: "stub",
    tags: ["Points", "Per Hole"],
  },

  {
    id: "dots",
    name: "Dots",
    overview:
      "Players earn dots (points or money) for on-course achievements agreed before the round — birdies, long drives, closest to pin, and more.",
    howItWorks: [
      "Before the round, agree on which achievements earn dots (e.g., birdie, long drive, closest to pin, sand save).",
      "Each dot has a pre-agreed value.",
      "Player with the most dots at the end wins the pot.",
    ],
    minPlayers: 2,
    maxPlayers: 4,
    typicalPlayers: "3–4 players",
    scoringFormats: ["Points-Based"],
    gameplayFormats: ["Individual"],
    matchupFormats: ["H2H", "Group"],
    bettingFormats: ["Custom"],
    handicapsAllowed: false,
    engineStatus: "stub",
    tags: ["Points", "Achievements", "Custom"],
  },

  {
    id: "rabbit",
    name: "Rabbit",
    overview:
      "A hole-winning streak game — hold the Rabbit by winning holes consecutively, or lose it to the next winner.",
    howItWorks: [
      "The first player to win a hole takes the Rabbit.",
      "You keep the Rabbit only by winning the very next hole.",
      "If any other player wins a hole, they steal the Rabbit.",
      "The player holding the Rabbit at the end of the round wins.",
    ],
    minPlayers: 2,
    maxPlayers: 4,
    typicalPlayers: "2–4 players",
    scoringFormats: ["Match Play"],
    gameplayFormats: ["Individual"],
    matchupFormats: ["H2H"],
    bettingFormats: ["Custom"],
    handicapsAllowed: false,
    engineStatus: "stub",
    tags: ["Match Play", "Per Hole", "Streak"],
  },

  {
    id: "hammer",
    name: "Hammer",
    overview:
      "An aggressive betting game where any player can double the stakes mid-hole — accept or concede.",
    howItWorks: [
      "Teams play each hole with a set bet.",
      "At any point during the hole, any player can call 'Hammer' to double the current bet.",
      "The opposing team must accept (play on at double stakes) or concede the hole.",
      "Results in high-pressure, high-reward moments on every hole.",
    ],
    minPlayers: 2,
    maxPlayers: 4,
    typicalPlayers: "1v1 or 2v2",
    scoringFormats: ["Match Play"],
    gameplayFormats: ["Individual", "Best Ball"],
    matchupFormats: ["H2H", "Team Play"],
    bettingFormats: ["Custom"],
    handicapsAllowed: false,
    engineStatus: "stub",
    tags: ["Betting", "Match Play", "Aggressive"],
  },

  {
    id: "alt-shot",
    name: "Alternate Shot",
    overview:
      "Teams of 2 alternate hitting the same ball — one player tees off, the other plays the next shot.",
    howItWorks: [
      "Teams of 2 share one ball, alternating every shot.",
      "One player tees off; the other plays the second shot; alternate until holed.",
      "Partners must coordinate strategy on every shot.",
      "Requires chemistry, trust, and course management.",
    ],
    minPlayers: 4,
    maxPlayers: 8,
    typicalPlayers: "2v2",
    scoringFormats: ["Stroke Play", "Match Play"],
    gameplayFormats: ["Alt Shot"],
    matchupFormats: ["Team Play"],
    bettingFormats: ["Flat Bet", "Nassau", "Hole-by-Hole", "Skins"],
    handicapsAllowed: false,
    engineStatus: "stub",
    tags: ["Team", "Alternate Shot", "Classic"],
  },

  {
    id: "modified-alt-shot",
    name: "Modified Alternate Shot",
    overview:
      "Everyone tees off, the best drive is chosen, then partners alternate shots from that spot until holed.",
    howItWorks: [
      "All players tee off.",
      "The best drive is selected and everyone plays from that spot.",
      "Partners then alternate shots from the chosen spot until the ball is holed.",
      "Combines the forgiving scramble start with the strategic depth of alternate shot.",
    ],
    minPlayers: 4,
    maxPlayers: 8,
    typicalPlayers: "2v2",
    scoringFormats: ["Stroke Play"],
    gameplayFormats: ["Modified Alt Shot"],
    matchupFormats: ["Team Play"],
    bettingFormats: ["Flat Bet", "Nassau", "Hole-by-Hole", "Skins"],
    handicapsAllowed: false,
    engineStatus: "stub",
    tags: ["Team", "Alternate Shot", "Scramble"],
  },

  {
    id: "chicago",
    name: "Chicago",
    overview:
      "A points-based game where each player has a quota based on their handicap — exceed your quota by the most to win.",
    howItWorks: [
      "Each player's quota is set before the round based on their handicap.",
      "Points earned per hole: Birdie = 3, Par = 2, Bogey = 1, Double+ = 0.",
      "The player who exceeds their quota by the greatest margin wins.",
    ],
    minPlayers: 2,
    maxPlayers: 8,
    typicalPlayers: "3–4 players",
    scoringFormats: ["Points-Based"],
    gameplayFormats: ["Individual"],
    matchupFormats: ["H2H"],
    bettingFormats: ["Flat Bet"],
    handicapsAllowed: true,
    engineStatus: "stub",
    tags: ["Points", "Handicap", "Individual"],
  },

  {
    id: "ryder-cup",
    name: "Ryder Cup",
    overview:
      "The ultimate team competition — matches rotate between foursomes, fourball, and singles across a full event.",
    howItWorks: [
      "Two teams compete over multiple sessions.",
      "Formats rotate: Foursomes (alternate shot), Fourball (best ball), Singles (match play).",
      "Points accumulate across all matches.",
      "Team with the most points at the end of the event wins.",
    ],
    minPlayers: 4,
    maxPlayers: 24,
    typicalPlayers: "Group event",
    scoringFormats: ["Match Play", "Points-Based"],
    gameplayFormats: ["Best Ball", "Alt Shot", "Individual"],
    matchupFormats: ["Team Play"],
    bettingFormats: [],
    handicapsAllowed: true,
    engineStatus: "stub",
    tags: ["Team", "Tournament", "Prestige"],
  },

];
