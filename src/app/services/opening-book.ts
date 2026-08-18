/**
 * Master Human Opening Book (Grandmaster Repertoire)
 * 
 * Provides standard, high-frequency human opening lines with ECO codes,
 * opening names, and weighted candidate moves.
 * 
 * Prevents non-human, obscure engine early-game deviations and produces
 * 100% natural master opening play that matches standard human opening theory.
 */

export interface OpeningBookEntry {
  eco: string;
  name: string;
  moves: Array<{
    san: string;
    uci: string;
    weight: number; // Probability weight (1-100)
  }>;
}

export const OPENING_BOOK: Record<string, OpeningBookEntry> = {
  // ==========================================
  // === 0. START POSITION ===
  // ==========================================
  '': {
    eco: 'A00',
    name: 'Standard Start Position',
    moves: [
      { san: 'e4', uci: 'e2e4', weight: 48 },
      { san: 'd4', uci: 'd2d4', weight: 36 },
      { san: 'Nf3', uci: 'g1f3', weight: 9 },
      { san: 'c4', uci: 'c2c4', weight: 7 }
    ]
  },

  // ==========================================
  // === 1. e4 OPENINGS ===
  // ==========================================
  'e4': {
    eco: 'B00',
    name: "King's Pawn Game",
    moves: [
      { san: 'e5', uci: 'e7e5', weight: 40 },
      { san: 'c5', uci: 'c7c5', weight: 38 }, // Sicilian
      { san: 'e6', uci: 'e7e6', weight: 11 }, // French
      { san: 'c6', uci: 'c7c6', weight: 8 },  // Caro-Kann
      { san: 'd5', uci: 'd7d5', weight: 3 }   // Scandinavian
    ]
  },

  // --- 1. e4 e5 Open Games ---
  'e4 e5': {
    eco: 'C20',
    name: "King's Pawn Game",
    moves: [
      { san: 'Nf3', uci: 'g1f3', weight: 82 },
      { san: 'Nc3', uci: 'b1c3', weight: 10 }, // Vienna
      { san: 'Bc4', uci: 'f1c4', weight: 5 },  // Bishop's Opening
      { san: 'd4', uci: 'd2d4', weight: 3 }    // Center Game
    ]
  },
  'e4 e5 Nf3': {
    eco: 'C40',
    name: "King's Knight Opening",
    moves: [
      { san: 'Nc6', uci: 'b8c6', weight: 84 },
      { san: 'Nf6', uci: 'g8f6', weight: 13 }, // Petrov's Defense
      { san: 'd6', uci: 'd7d6', weight: 3 }    // Philidor Defense
    ]
  },
  'e4 e5 Nf3 Nc6': {
    eco: 'C44',
    name: "King's Knight Opening: Normal",
    moves: [
      { san: 'Bb5', uci: 'f1b5', weight: 46 }, // Ruy Lopez
      { san: 'Bc4', uci: 'f1c4', weight: 38 }, // Italian Game
      { san: 'd4', uci: 'd2d4', weight: 12 },  // Scotch Game
      { san: 'Nc3', uci: 'b1c3', weight: 4 }   // Four Knights
    ]
  },

  // --- Italian Game (1. e4 e5 2. Nf3 Nc6 3. Bc4) ---
  'e4 e5 Nf3 Nc6 Bc4': {
    eco: 'C50',
    name: 'Italian Game',
    moves: [
      { san: 'Bc5', uci: 'f8c5', weight: 55 }, // Giuoco Piano
      { san: 'Nf6', uci: 'g8f6', weight: 40 }, // Two Knights Defense
      { san: 'Be7', uci: 'f8e7', weight: 5 }   // Hungarian Defense
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Bc5': {
    eco: 'C50',
    name: 'Italian Game: Giuoco Piano',
    moves: [
      { san: 'c3', uci: 'c2c3', weight: 52 },
      { san: 'd3', uci: 'd2d3', weight: 40 }, // Giuoco Pianissimo
      { san: 'O-O', uci: 'e1g1', weight: 5 },
      { san: 'b4', uci: 'b2b4', weight: 3 }   // Evans Gambit
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3': {
    eco: 'C53',
    name: 'Italian Game: Main Line',
    moves: [
      { san: 'Nf6', uci: 'g8f6', weight: 88 },
      { san: 'Qe7', uci: 'd8e7', weight: 12 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6': {
    eco: 'C54',
    name: 'Italian Game: Classical Variation',
    moves: [
      { san: 'd3', uci: 'd2d3', weight: 62 },
      { san: 'd4', uci: 'd2d4', weight: 38 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3': {
    eco: 'C54',
    name: 'Italian Game: Giuoco Pianissimo',
    moves: [
      { san: 'd6', uci: 'd7d6', weight: 50 },
      { san: 'a6', uci: 'a7a6', weight: 30 },
      { san: 'O-O', uci: 'e8g8', weight: 20 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6': {
    eco: 'C54',
    name: 'Italian Game: Giuoco Pianissimo Main',
    moves: [
      { san: 'O-O', uci: 'e1g1', weight: 65 },
      { san: 'Bb3', uci: 'c4b3', weight: 25 },
      { san: 'Nbd2', uci: 'b1d2', weight: 10 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O': {
    eco: 'C54',
    name: 'Italian Game: Giuoco Pianissimo Castled',
    moves: [
      { san: 'O-O', uci: 'e8g8', weight: 60 },
      { san: 'a6', uci: 'a7a6', weight: 30 },
      { san: 'Bb6', uci: 'c5b6', weight: 10 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4': {
    eco: 'C54',
    name: 'Italian Game: Center Attack',
    moves: [
      { san: 'exd4', uci: 'e5d4', weight: 96 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4': {
    eco: 'C54',
    name: 'Italian Game: Center Attack Line',
    moves: [
      { san: 'cxd4', uci: 'c3d4', weight: 90 },
      { san: 'e5', uci: 'e4e5', weight: 10 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4': {
    eco: 'C54',
    name: 'Italian Game: Classical Main',
    moves: [
      { san: 'Bb4+', uci: 'c5b4', weight: 95 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+': {
    eco: 'C54',
    name: 'Italian Game: Greco Line',
    moves: [
      { san: 'Bd2', uci: 'c1d2', weight: 65 },
      { san: 'Nc3', uci: 'b1c3', weight: 35 }
    ]
  },
  // Two Knights Defense
  'e4 e5 Nf3 Nc6 Bc4 Nf6': {
    eco: 'C55',
    name: 'Two Knights Defense',
    moves: [
      { san: 'd3', uci: 'd2d3', weight: 60 },
      { san: 'Ng5', uci: 'f3g5', weight: 32 }, // Fried Liver / Knight Attack
      { san: 'd4', uci: 'd2d4', weight: 8 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5': {
    eco: 'C57',
    name: 'Two Knights: Knight Attack',
    moves: [
      { san: 'd5', uci: 'd7d5', weight: 95 },
      { san: 'Bc5', uci: 'f8c5', weight: 5 } // Traxler Counterattack
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5': {
    eco: 'C57',
    name: 'Two Knights: Modern Line',
    moves: [
      { san: 'exd5', uci: 'e4d5', weight: 98 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5': {
    eco: 'C57',
    name: 'Two Knights: Main Continuation',
    moves: [
      { san: 'Na5', uci: 'c6a5', weight: 80 },
      { san: 'Nxd5', uci: 'f6d5', weight: 12 }, // Fried Liver setup
      { san: 'b5', uci: 'b7b5', weight: 8 }    // Ulvestad Variation
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5': {
    eco: 'C58',
    name: 'Two Knights: Polerio Defense',
    moves: [
      { san: 'Bb5+', uci: 'c4b5', weight: 95 },
      { san: 'd3', uci: 'd2d3', weight: 5 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+': {
    eco: 'C58',
    name: 'Two Knights: Polerio Main Line',
    moves: [
      { san: 'c6', uci: 'c7c6', weight: 98 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6': {
    eco: 'C58',
    name: 'Two Knights: Main Line',
    moves: [
      { san: 'dxc6', uci: 'd5c6', weight: 98 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6 dxc6': {
    eco: 'C58',
    name: 'Two Knights: Main Line Exchange',
    moves: [
      { san: 'bxc6', uci: 'b7c6', weight: 98 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6 dxc6 bxc6': {
    eco: 'C58',
    name: 'Two Knights: Tabia',
    moves: [
      { san: 'Be2', uci: 'b5e2', weight: 80 },
      { san: 'Qf3', uci: 'd1f3', weight: 15 },
      { san: 'Bd3', uci: 'b5d3', weight: 5 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6 dxc6 bxc6 Be2': {
    eco: 'C58',
    name: 'Two Knights: Be2 Main',
    moves: [
      { san: 'h6', uci: 'h7h6', weight: 95 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6 dxc6 bxc6 Be2 h6': {
    eco: 'C58',
    name: 'Two Knights: Classical Retreat',
    moves: [
      { san: 'Nf3', uci: 'g5f3', weight: 90 },
      { san: 'Nh3', uci: 'g5h3', weight: 10 }
    ]
  },

  // --- Ruy Lopez (1. e4 e5 2. Nf3 Nc6 3. Bb5) ---
  'e4 e5 Nf3 Nc6 Bb5': {
    eco: 'C60',
    name: 'Ruy Lopez (Spanish Opening)',
    moves: [
      { san: 'a6', uci: 'a7a6', weight: 75 }, // Morphy Defense
      { san: 'Nf6', uci: 'g8f6', weight: 18 }, // Berlin Defense
      { san: 'd6', uci: 'd7d6', weight: 4 },  // Steinitz Defense
      { san: 'Bc5', uci: 'f8c5', weight: 3 }   // Classical Defense
    ]
  },
  // Berlin Defense
  'e4 e5 Nf3 Nc6 Bb5 Nf6': {
    eco: 'C65',
    name: 'Ruy Lopez: Berlin Defense',
    moves: [
      { san: 'O-O', uci: 'e1g1', weight: 75 },
      { san: 'd3', uci: 'd2d3', weight: 20 }, // Anti-Berlin
      { san: 'Nc3', uci: 'b1c3', weight: 5 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bb5 Nf6 O-O': {
    eco: 'C67',
    name: 'Ruy Lopez: Berlin Main Line',
    moves: [
      { san: 'Nxe4', uci: 'f6e4', weight: 80 }, // Berlin Wall setup
      { san: 'Bc5', uci: 'f8c5', weight: 15 },
      { san: 'd6', uci: 'd7d6', weight: 5 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4': {
    eco: 'C67',
    name: 'Ruy Lopez: Berlin Wall',
    moves: [
      { san: 'd4', uci: 'd2d4', weight: 85 },
      { san: 'Re1', uci: 'f1e1', weight: 15 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4': {
    eco: 'C67',
    name: 'Ruy Lopez: Berlin Endgame Path',
    moves: [
      { san: 'Nd6', uci: 'e4d6', weight: 88 },
      { san: 'Be7', uci: 'f8e7', weight: 10 },
      { san: 'a6', uci: 'a7a6', weight: 2 }
    ]
  },
  // Morphy Defense (3... a6)
  'e4 e5 Nf3 Nc6 Bb5 a6': {
    eco: 'C68',
    name: 'Ruy Lopez: Morphy Defense',
    moves: [
      { san: 'Ba4', uci: 'b5a4', weight: 88 },
      { san: 'Bxc6', uci: 'b5c6', weight: 12 } // Exchange Variation
    ]
  },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4': {
    eco: 'C70',
    name: 'Ruy Lopez: Columbus Variation',
    moves: [
      { san: 'Nf6', uci: 'g8f6', weight: 86 },
      { san: 'd6', uci: 'd7d6', weight: 8 },
      { san: 'Bc5', uci: 'f8c5', weight: 6 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6': {
    eco: 'C78',
    name: 'Ruy Lopez: Closed / Open Preparations',
    moves: [
      { san: 'O-O', uci: 'e1g1', weight: 88 },
      { san: 'd3', uci: 'd2d3', weight: 10 },
      { san: 'Qe2', uci: 'd1e2', weight: 2 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O': {
    eco: 'C80',
    name: 'Ruy Lopez: Main Line',
    moves: [
      { san: 'Be7', uci: 'f8e7', weight: 78 }, // Closed Defense
      { san: 'Nxe4', uci: 'f6e4', weight: 14 }, // Open Defense
      { san: 'b5', uci: 'b7b5', weight: 8 }     // Archangelsk
    ]
  },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7': {
    eco: 'C84',
    name: 'Ruy Lopez: Closed Defense',
    moves: [
      { san: 'Re1', uci: 'f1e1', weight: 90 },
      { san: 'd3', uci: 'd2d3', weight: 8 },
      { san: 'Qe2', uci: 'd1e2', weight: 2 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1': {
    eco: 'C88',
    name: 'Ruy Lopez: Closed Line',
    moves: [
      { san: 'b5', uci: 'b7b5', weight: 92 },
      { san: 'd6', uci: 'd7d6', weight: 8 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5': {
    eco: 'C88',
    name: 'Ruy Lopez: Closed Main',
    moves: [
      { san: 'Bb3', uci: 'a4b3', weight: 99 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3': {
    eco: 'C88',
    name: 'Ruy Lopez: Closed System',
    moves: [
      { san: 'd6', uci: 'd7d6', weight: 80 },
      { san: 'O-O', uci: 'e8g8', weight: 15 },
      { san: 'Bb7', uci: 'c8b7', weight: 5 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6': {
    eco: 'C88',
    name: 'Ruy Lopez: Closed Main Tabia',
    moves: [
      { san: 'c3', uci: 'c2c3', weight: 92 },
      { san: 'a4', uci: 'a2a4', weight: 6 },
      { san: 'h3', uci: 'h2h3', weight: 2 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3': {
    eco: 'C88',
    name: 'Ruy Lopez: Closed Main Line 8.c3',
    moves: [
      { san: 'O-O', uci: 'e8g8', weight: 95 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O': {
    eco: 'C90',
    name: 'Ruy Lopez: Closed Main Line',
    moves: [
      { san: 'h3', uci: 'h2h3', weight: 90 },
      { san: 'd4', uci: 'd2d4', weight: 6 },
      { san: 'd3', uci: 'd2d3', weight: 4 }
    ]
  },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3': {
    eco: 'C92',
    name: 'Ruy Lopez: Main Line Tabia',
    moves: [
      { san: 'Nb8', uci: 'c6b8', weight: 40 }, // Breyer Defense
      { san: 'Na5', uci: 'c6a5', weight: 35 }, // Chigorin Defense
      { san: 'Bb7', uci: 'c8b7', weight: 15 }, // Zaitsev Defense
      { san: 'h6', uci: 'h7h6', weight: 10 }   // Smyslov Defense
    ]
  },

  // --- Scotch Game (1. e4 e5 2. Nf3 Nc6 3. d4) ---
  'e4 e5 Nf3 Nc6 d4': {
    eco: 'C45',
    name: 'Scotch Game',
    moves: [
      { san: 'exd4', uci: 'e5d4', weight: 98 }
    ]
  },
  'e4 e5 Nf3 Nc6 d4 exd4': {
    eco: 'C45',
    name: 'Scotch Game: Accepted',
    moves: [
      { san: 'Nxd4', uci: 'f3d4', weight: 90 },
      { san: 'Bc4', uci: 'f1c4', weight: 10 } // Scotch Gambit
    ]
  },
  'e4 e5 Nf3 Nc6 d4 exd4 Nxd4': {
    eco: 'C45',
    name: 'Scotch Game: Main Lines',
    moves: [
      { san: 'Nf6', uci: 'g8f6', weight: 55 }, // Mieses Variation
      { san: 'Bc5', uci: 'f8c5', weight: 40 }, // Classical Variation
      { san: 'Qh4', uci: 'd8h4', weight: 5 }   // Steinitz
    ]
  },
  'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6': {
    eco: 'C45',
    name: 'Scotch Game: Mieses Variation',
    moves: [
      { san: 'Nxc6', uci: 'd4c6', weight: 75 },
      { san: 'Nc3', uci: 'b1c3', weight: 25 }
    ]
  },
  'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6': {
    eco: 'C45',
    name: 'Scotch Game: Mieses Exchange',
    moves: [
      { san: 'bxc6', uci: 'b7c6', weight: 98 }
    ]
  },
  'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6': {
    eco: 'C45',
    name: 'Scotch Game: Mieses Main',
    moves: [
      { san: 'e5', uci: 'e4e5', weight: 85 },
      { san: 'Bd3', uci: 'f1d3', weight: 15 }
    ]
  },
  'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5': {
    eco: 'C45',
    name: 'Scotch Game: Mieses 5.e5',
    moves: [
      { san: 'Qe7', uci: 'd8e7', weight: 95 }
    ]
  },

  // --- Petrov's Defense (1. e4 e5 2. Nf3 Nf6) ---
  'e4 e5 Nf3 Nf6': {
    eco: 'C42',
    name: "Petrov's Defense",
    moves: [
      { san: 'Nxe5', uci: 'f3e5', weight: 70 }, // Classical
      { san: 'd4', uci: 'd2d4', weight: 25 },   // Steinitz
      { san: 'Nc3', uci: 'b1c3', weight: 5 }    // Three Knights
    ]
  },
  'e4 e5 Nf3 Nf6 Nxe5': {
    eco: 'C42',
    name: "Petrov's Defense: Classical Attack",
    moves: [
      { san: 'd6', uci: 'd7d6', weight: 95 },
      { san: 'Nxe4', uci: 'f6e4', weight: 5 }
    ]
  },
  'e4 e5 Nf3 Nf6 Nxe5 d6': {
    eco: 'C42',
    name: "Petrov's Defense: Classical Line",
    moves: [
      { san: 'Nf3', uci: 'e5f3', weight: 95 }
    ]
  },
  'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3': {
    eco: 'C42',
    name: "Petrov's Defense: Main Line",
    moves: [
      { san: 'Nxe4', uci: 'f6e4', weight: 98 }
    ]
  },
  'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4': {
    eco: 'C42',
    name: "Petrov's Defense: Tabia",
    moves: [
      { san: 'd4', uci: 'd2d4', weight: 65 },
      { san: 'Nc3', uci: 'b1c3', weight: 25 },
      { san: 'Bd3', uci: 'f1d3', weight: 10 }
    ]
  },

  // ==========================================
  // === 2. SICILIAN DEFENSE (1. e4 c5) ===
  // ==========================================
  'e4 c5': {
    eco: 'B20',
    name: 'Sicilian Defense',
    moves: [
      { san: 'Nf3', uci: 'g1f3', weight: 75 }, // Open Sicilian
      { san: 'Nc3', uci: 'b1c3', weight: 13 }, // Closed Sicilian
      { san: 'c3', uci: 'c2c3', weight: 9 },   // Alapin
      { san: 'd4', uci: 'd2d4', weight: 3 }    // Smith-Morra Gambit
    ]
  },
  // Alapin Sicilian
  'e4 c5 c3': {
    eco: 'B22',
    name: 'Sicilian Defense: Alapin Variation',
    moves: [
      { san: 'd5', uci: 'd7d5', weight: 55 },
      { san: 'Nf6', uci: 'g8f6', weight: 38 },
      { san: 'e6', uci: 'e7e6', weight: 7 }
    ]
  },
  'e4 c5 c3 d5': {
    eco: 'B22',
    name: 'Sicilian Defense: Alapin 2... d5',
    moves: [
      { san: 'exd5', uci: 'e4d5', weight: 96 }
    ]
  },
  'e4 c5 c3 d5 exd5': {
    eco: 'B22',
    name: 'Sicilian Defense: Alapin 3. exd5',
    moves: [
      { san: 'Qxd5', uci: 'd8d5', weight: 96 }
    ]
  },
  'e4 c5 c3 d5 exd5 Qxd5': {
    eco: 'B22',
    name: 'Sicilian Defense: Alapin Main',
    moves: [
      { san: 'd4', uci: 'd2d4', weight: 92 },
      { san: 'Nf3', uci: 'g1f3', weight: 8 }
    ]
  },
  // Open Sicilian (2. Nf3)
  'e4 c5 Nf3': {
    eco: 'B27',
    name: 'Sicilian Defense: Open Preparations',
    moves: [
      { san: 'd6', uci: 'd7d6', weight: 42 },
      { san: 'Nc6', uci: 'b8c6', weight: 32 },
      { san: 'e6', uci: 'e7e6', weight: 22 },
      { san: 'g6', uci: 'g7g6', weight: 4 }
    ]
  },
  // 2... e6 (French Sicilian / Taimanov / Kan / Scheveningen)
  'e4 c5 Nf3 e6': {
    eco: 'B40',
    name: 'Sicilian Defense: French Variation',
    moves: [
      { san: 'd4', uci: 'd2d4', weight: 80 },
      { san: 'c3', uci: 'c2c3', weight: 10 },
      { san: 'Nc3', uci: 'b1c3', weight: 10 }
    ]
  },
  'e4 c5 Nf3 e6 d4': {
    eco: 'B40',
    name: 'Sicilian Defense: Open 2... e6',
    moves: [
      { san: 'cxd4', uci: 'c5d4', weight: 99 }
    ]
  },
  'e4 c5 Nf3 e6 d4 cxd4': {
    eco: 'B40',
    name: 'Sicilian Defense: 2... e6 Main',
    moves: [
      { san: 'Nxd4', uci: 'f3d4', weight: 98 }
    ]
  },
  'e4 c5 Nf3 e6 d4 cxd4 Nxd4': {
    eco: 'B40',
    name: 'Sicilian Defense: 4. Nxd4 (2... e6)',
    moves: [
      { san: 'Nc6', uci: 'b8c6', weight: 45 }, // Taimanov
      { san: 'a6', uci: 'a7a6', weight: 35 },  // Kan
      { san: 'Nf6', uci: 'g8f6', weight: 20 }  // Four Knights / Pin
    ]
  },
  // 2... Nc6 (Classical / Sveshnikov / Accelerated Dragon)
  'e4 c5 Nf3 Nc6': {
    eco: 'B30',
    name: 'Sicilian Defense: Old Sicilian',
    moves: [
      { san: 'd4', uci: 'd2d4', weight: 70 },
      { san: 'Bb5', uci: 'f1b5', weight: 22 }, // Rossolimo
      { san: 'Nc3', uci: 'b1c3', weight: 8 }
    ]
  },
  'e4 c5 Nf3 Nc6 Bb5': {
    eco: 'B51',
    name: 'Sicilian Defense: Rossolimo Variation',
    moves: [
      { san: 'g6', uci: 'g7g6', weight: 60 },
      { san: 'e6', uci: 'e7e6', weight: 25 },
      { san: 'd6', uci: 'd7d6', weight: 15 }
    ]
  },
  'e4 c5 Nf3 Nc6 d4': {
    eco: 'B32',
    name: 'Sicilian Defense: Open 2... Nc6',
    moves: [
      { san: 'cxd4', uci: 'c5d4', weight: 99 }
    ]
  },
  'e4 c5 Nf3 Nc6 d4 cxd4': {
    eco: 'B32',
    name: 'Sicilian Defense: 2... Nc6 Exchange',
    moves: [
      { san: 'Nxd4', uci: 'f3d4', weight: 98 }
    ]
  },
  'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4': {
    eco: 'B32',
    name: 'Sicilian Defense: Open 4. Nxd4 Nc6',
    moves: [
      { san: 'Nf6', uci: 'g8f6', weight: 60 },
      { san: 'g6', uci: 'g7g6', weight: 22 }, // Accelerated Dragon
      { san: 'e5', uci: 'e7e5', weight: 18 }  // Kalashnikov
    ]
  },
  'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6': {
    eco: 'B33',
    name: 'Sicilian Defense: Open 4... Nf6',
    moves: [
      { san: 'Nc3', uci: 'b1c3', weight: 98 }
    ]
  },
  'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3': {
    eco: 'B33',
    name: 'Sicilian Defense: Four Knights / Sveshnikov',
    moves: [
      { san: 'e5', uci: 'e7e5', weight: 55 }, // Sveshnikov
      { san: 'd6', uci: 'd7d6', weight: 35 }, // Classical
      { san: 'e6', uci: 'e7e6', weight: 10 }  // Four Knights
    ]
  },
  // Sveshnikov Variation
  'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5': {
    eco: 'B33',
    name: 'Sicilian Defense: Sveshnikov Variation',
    moves: [
      { san: 'Ndb5', uci: 'd4b5', weight: 95 }
    ]
  },
  'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5 Ndb5': {
    eco: 'B33',
    name: 'Sicilian Defense: Sveshnikov 6. Ndb5',
    moves: [
      { san: 'd6', uci: 'd7d6', weight: 98 }
    ]
  },
  'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5 Ndb5 d6': {
    eco: 'B33',
    name: 'Sicilian Defense: Sveshnikov Main Line',
    moves: [
      { san: 'Bg5', uci: 'c1g5', weight: 80 },
      { san: 'Nd5', uci: 'c3d5', weight: 20 }
    ]
  },
  'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5 Ndb5 d6 Bg5': {
    eco: 'B33',
    name: 'Sicilian Defense: Sveshnikov 7. Bg5',
    moves: [
      { san: 'a6', uci: 'a7a6', weight: 98 }
    ]
  },
  'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5 Ndb5 d6 Bg5 a6': {
    eco: 'B33',
    name: 'Sicilian Defense: Sveshnikov 7... a6',
    moves: [
      { san: 'Na3', uci: 'b5a3', weight: 99 }
    ]
  },
  'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5 Ndb5 d6 Bg5 a6 Na3': {
    eco: 'B33',
    name: 'Sicilian Defense: Sveshnikov Tabia',
    moves: [
      { san: 'b5', uci: 'b7b5', weight: 95 }
    ]
  },
  // 2... d6 Lines (Najdorf / Dragon / Classical / Scheveningen)
  'e4 c5 Nf3 d6': {
    eco: 'B50',
    name: 'Sicilian Defense: Modern Variation',
    moves: [
      { san: 'd4', uci: 'd2d4', weight: 84 },
      { san: 'Bb5+', uci: 'f1b5', weight: 14 }, // Moscow Variation
      { san: 'c3', uci: 'c2c3', weight: 2 }
    ]
  },
  'e4 c5 Nf3 d6 d4': {
    eco: 'B53',
    name: 'Sicilian Defense: Open Line',
    moves: [
      { san: 'cxd4', uci: 'c5d4', weight: 99 }
    ]
  },
  'e4 c5 Nf3 d6 d4 cxd4': {
    eco: 'B53',
    name: 'Sicilian Defense: Open Main',
    moves: [
      { san: 'Nxd4', uci: 'f3d4', weight: 96 },
      { san: 'Qxd4', uci: 'd1d4', weight: 4 } // Chekhover
    ]
  },
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4': {
    eco: 'B54',
    name: 'Sicilian Defense: Open Systems',
    moves: [
      { san: 'Nf6', uci: 'g8f6', weight: 94 },
      { san: 'a6', uci: 'a7a6', weight: 6 }
    ]
  },
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6': {
    eco: 'B54',
    name: 'Sicilian Defense: Open 4...Nf6',
    moves: [
      { san: 'Nc3', uci: 'b1c3', weight: 98 }
    ]
  },
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3': {
    eco: 'B54',
    name: 'Sicilian Defense: Open Main Tabia',
    moves: [
      { san: 'a6', uci: 'a7a6', weight: 48 }, // Najdorf
      { san: 'g6', uci: 'g7g6', weight: 24 }, // Dragon
      { san: 'Nc6', uci: 'b8c6', weight: 16 }, // Classical
      { san: 'e6', uci: 'e7e6', weight: 12 }  // Scheveningen
    ]
  },
  // Najdorf Variation (1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6)
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6': {
    eco: 'B90',
    name: 'Sicilian Defense: Najdorf Variation',
    moves: [
      { san: 'Be3', uci: 'c1e3', weight: 42 }, // English Attack
      { san: 'Bg5', uci: 'c1g5', weight: 26 }, // Classical Main
      { san: 'Be2', uci: 'f1e2', weight: 18 }, // Karpov Variation
      { san: 'h3', uci: 'h2h3', weight: 8 },   // Adams Attack
      { san: 'f4', uci: 'f2f4', weight: 6 }
    ]
  },
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3': {
    eco: 'B90',
    name: 'Sicilian Defense: Najdorf, English Attack',
    moves: [
      { san: 'e5', uci: 'e7e5', weight: 62 },
      { san: 'Ng4', uci: 'f6g4', weight: 20 },
      { san: 'e6', uci: 'e7e6', weight: 18 }
    ]
  },
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3 e5': {
    eco: 'B90',
    name: 'Sicilian Defense: Najdorf 6... e5',
    moves: [
      { san: 'Nb3', uci: 'd4b3', weight: 95 }
    ]
  },
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3 e5 Nb3': {
    eco: 'B90',
    name: 'Sicilian Defense: Najdorf 7. Nb3',
    moves: [
      { san: 'Be6', uci: 'c8e6', weight: 70 },
      { san: 'Be7', uci: 'f8e7', weight: 30 }
    ]
  },
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3 e5 Nb3 Be6': {
    eco: 'B90',
    name: 'Sicilian Defense: English Attack Tabia',
    moves: [
      { san: 'f3', uci: 'f2f3', weight: 85 },
      { san: 'Qd2', uci: 'd1d2', weight: 15 }
    ]
  },
  // Dragon Variation (1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6)
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6': {
    eco: 'B70',
    name: 'Sicilian Defense: Dragon Variation',
    moves: [
      { san: 'Be3', uci: 'c1e3', weight: 70 }, // Yugoslav Attack setup
      { san: 'Be2', uci: 'f1e2', weight: 20 }, // Classical
      { san: 'f4', uci: 'f2f4', weight: 10 }   // Levenfish
    ]
  },
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3': {
    eco: 'B72',
    name: 'Sicilian Defense: Dragon 6. Be3',
    moves: [
      { san: 'Bg7', uci: 'f8g7', weight: 98 }
    ]
  },
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7': {
    eco: 'B72',
    name: 'Sicilian Defense: Yugoslav Attack Setup',
    moves: [
      { san: 'f3', uci: 'f2f3', weight: 80 },
      { san: 'Be2', uci: 'f1e2', weight: 20 }
    ]
  },
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3': {
    eco: 'B75',
    name: 'Sicilian Defense: Yugoslav Attack Line',
    moves: [
      { san: 'O-O', uci: 'e8g8', weight: 65 },
      { san: 'Nc6', uci: 'b8c6', weight: 35 }
    ]
  },
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O': {
    eco: 'B75',
    name: 'Sicilian Defense: Yugoslav Attack Tabia',
    moves: [
      { san: 'Qd2', uci: 'd1d2', weight: 88 },
      { san: 'Bc4', uci: 'f1c4', weight: 12 }
    ]
  },

  // ==========================================
  // === 3. FRENCH DEFENSE (1. e4 e6) ===
  // ==========================================
  'e4 e6': {
    eco: 'C00',
    name: 'French Defense',
    moves: [
      { san: 'd4', uci: 'd2d4', weight: 88 },
      { san: 'd3', uci: 'd2d3', weight: 8 },  // King's Indian Attack
      { san: 'c4', uci: 'c2c4', weight: 4 }
    ]
  },
  'e4 e6 d4': {
    eco: 'C00',
    name: 'French Defense: Normal',
    moves: [
      { san: 'd5', uci: 'd7d5', weight: 98 }
    ]
  },
  'e4 e6 d4 d5': {
    eco: 'C01',
    name: 'French Defense: Main Branch',
    moves: [
      { san: 'Nc3', uci: 'b1c3', weight: 44 }, // Paulsen / Winawer / Classical
      { san: 'Nd2', uci: 'b1d2', weight: 28 }, // Tarrasch
      { san: 'e5', uci: 'e4e5', weight: 20 },  // Advance Variation
      { san: 'exd5', uci: 'e4d5', weight: 8 }  // Exchange Variation
    ]
  },
  // Advance Variation
  'e4 e6 d4 d5 e5': {
    eco: 'C02',
    name: 'French Defense: Advance Variation',
    moves: [
      { san: 'c5', uci: 'c7c5', weight: 94 }
    ]
  },
  'e4 e6 d4 d5 e5 c5': {
    eco: 'C02',
    name: 'French Defense: Advance Main',
    moves: [
      { san: 'c3', uci: 'c2c3', weight: 92 },
      { san: 'Nf3', uci: 'g1f3', weight: 8 }
    ]
  },
  'e4 e6 d4 d5 e5 c5 c3': {
    eco: 'C02',
    name: 'French Defense: Advance 4. c3',
    moves: [
      { san: 'Nc6', uci: 'b8c6', weight: 85 },
      { san: 'Qb6', uci: 'd8b6', weight: 15 }
    ]
  },
  'e4 e6 d4 d5 e5 c5 c3 Nc6': {
    eco: 'C02',
    name: 'French Defense: Advance 4... Nc6',
    moves: [
      { san: 'Nf3', uci: 'g1f3', weight: 95 }
    ]
  },
  'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3': {
    eco: 'C02',
    name: 'French Defense: Advance Tabia',
    moves: [
      { san: 'Qb6', uci: 'd8b6', weight: 75 },
      { san: 'Bd7', uci: 'c8d7', weight: 20 },
      { san: 'Nh6', uci: 'g8h6', weight: 5 }
    ]
  },
  // 3. Nc3 (Winawer / Classical)
  'e4 e6 d4 d5 Nc3': {
    eco: 'C10',
    name: 'French Defense: Paulsen Variation',
    moves: [
      { san: 'Nf6', uci: 'g8f6', weight: 50 }, // Classical
      { san: 'Bb4', uci: 'f8b4', weight: 35 }, // Winawer
      { san: 'dxe4', uci: 'd5e4', weight: 15 }  // Rubinstein
    ]
  },
  'e4 e6 d4 d5 Nc3 Bb4': {
    eco: 'C15',
    name: 'French Defense: Winawer Variation',
    moves: [
      { san: 'e5', uci: 'e4e5', weight: 90 },
      { san: 'exd5', uci: 'e4d5', weight: 10 }
    ]
  },
  'e4 e6 d4 d5 Nc3 Bb4 e5': {
    eco: 'C16',
    name: 'French Defense: Winawer Advance',
    moves: [
      { san: 'c5', uci: 'c7c5', weight: 92 },
      { san: 'Ne7', uci: 'g8e7', weight: 8 }
    ]
  },
  'e4 e6 d4 d5 Nc3 Bb4 e5 c5': {
    eco: 'C17',
    name: 'French Defense: Winawer 5... c5',
    moves: [
      { san: 'a3', uci: 'a2a3', weight: 90 },
      { san: 'Bd2', uci: 'c1d2', weight: 10 }
    ]
  },
  'e4 e6 d4 d5 Nc3 Bb4 e5 c5 a3': {
    eco: 'C18',
    name: 'French Defense: Winawer Main Line',
    moves: [
      { san: 'Bxc3+', uci: 'b4c3', weight: 96 }
    ]
  },
  'e4 e6 d4 d5 Nc3 Bb4 e5 c5 a3 Bxc3+': {
    eco: 'C18',
    name: 'French Defense: Winawer Exchange',
    moves: [
      { san: 'bxc3', uci: 'b2c3', weight: 99 }
    ]
  },
  'e4 e6 d4 d5 Nc3 Bb4 e5 c5 a3 Bxc3+ bxc3': {
    eco: 'C18',
    name: 'French Defense: Winawer Tabia',
    moves: [
      { san: 'Ne7', uci: 'g8e7', weight: 85 },
      { san: 'Qc7', uci: 'd8c7', weight: 15 }
    ]
  },

  // ==========================================
  // === 4. CARO-KANN DEFENSE (1. e4 c6) ===
  // ==========================================
  'e4 c6': {
    eco: 'B10',
    name: 'Caro-Kann Defense',
    moves: [
      { san: 'd4', uci: 'd2d4', weight: 85 },
      { san: 'Nc3', uci: 'b1c3', weight: 8 }, // Two Knights
      { san: 'c4', uci: 'c2c4', weight: 4 },  // Panov prep
      { san: 'd3', uci: 'd2d3', weight: 3 }
    ]
  },
  'e4 c6 d4': {
    eco: 'B12',
    name: 'Caro-Kann: Main Line',
    moves: [
      { san: 'd5', uci: 'd7d5', weight: 98 }
    ]
  },
  'e4 c6 d4 d5': {
    eco: 'B12',
    name: 'Caro-Kann: Branching',
    moves: [
      { san: 'e5', uci: 'e4e5', weight: 46 },  // Advance Variation
      { san: 'Nc3', uci: 'b1c3', weight: 34 }, // Classical / Tartakower
      { san: 'exd5', uci: 'e4d5', weight: 16 }, // Exchange / Panov-Botvinnik
      { san: 'Nd2', uci: 'b1d2', weight: 4 }
    ]
  },
  // Advance Variation
  'e4 c6 d4 d5 e5': {
    eco: 'B12',
    name: 'Caro-Kann: Advance Variation',
    moves: [
      { san: 'Bf5', uci: 'c8f5', weight: 78 }, // Main Line
      { san: 'c5', uci: 'c7c5', weight: 22 }   // Botvinnik-Carls
    ]
  },
  'e4 c6 d4 d5 e5 Bf5': {
    eco: 'B12',
    name: 'Caro-Kann: Advance Main Line',
    moves: [
      { san: 'Nf3', uci: 'g1f3', weight: 45 }, // Short System
      { san: 'h4', uci: 'h2h4', weight: 30 },  // Tal Variation
      { san: 'Nc3', uci: 'b1c3', weight: 15 },
      { san: 'Be3', uci: 'c1e3', weight: 10 }
    ]
  },
  'e4 c6 d4 d5 e5 Bf5 Nf3': {
    eco: 'B12',
    name: 'Caro-Kann: Advance Short System',
    moves: [
      { san: 'e6', uci: 'e7e6', weight: 95 }
    ]
  },
  'e4 c6 d4 d5 e5 Bf5 Nf3 e6': {
    eco: 'B12',
    name: 'Caro-Kann: Advance Short 4... e6',
    moves: [
      { san: 'Be2', uci: 'f1e2', weight: 90 },
      { san: 'c3', uci: 'c2c3', weight: 10 }
    ]
  },
  'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2': {
    eco: 'B12',
    name: 'Caro-Kann: Advance Short Tabia',
    moves: [
      { san: 'c5', uci: 'c7c5', weight: 60 },
      { san: 'Nd7', uci: 'b8d7', weight: 30 },
      { san: 'Ne7', uci: 'g8e7', weight: 10 }
    ]
  },
  // Classical Caro-Kann (3. Nc3)
  'e4 c6 d4 d5 Nc3': {
    eco: 'B15',
    name: 'Caro-Kann: Classical Variation',
    moves: [
      { san: 'dxe4', uci: 'd5e4', weight: 98 }
    ]
  },
  'e4 c6 d4 d5 Nc3 dxe4': {
    eco: 'B15',
    name: 'Caro-Kann: Classical Exchange',
    moves: [
      { san: 'Nxe4', uci: 'c3e4', weight: 99 }
    ]
  },
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4': {
    eco: 'B16',
    name: 'Caro-Kann: Classical Main Tabia',
    moves: [
      { san: 'Bf5', uci: 'c8f5', weight: 50 }, // Capablanca
      { san: 'Nd7', uci: 'b8d7', weight: 30 }, // Karpov
      { san: 'Nf6', uci: 'g8f6', weight: 20 }  // Tartakower / Korchnoi
    ]
  },
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5': {
    eco: 'B18',
    name: 'Caro-Kann: Classical Capablanca Line',
    moves: [
      { san: 'Ng3', uci: 'e4g3', weight: 98 }
    ]
  },
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3': {
    eco: 'B18',
    name: 'Caro-Kann: Classical 5. Ng3',
    moves: [
      { san: 'Bg6', uci: 'f5g6', weight: 99 }
    ]
  },
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6': {
    eco: 'B18',
    name: 'Caro-Kann: Classical Main Line',
    moves: [
      { san: 'h4', uci: 'h2h4', weight: 80 },
      { san: 'Nf3', uci: 'g1f3', weight: 15 },
      { san: 'Bc4', uci: 'f1c4', weight: 5 }
    ]
  },
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4': {
    eco: 'B19',
    name: 'Caro-Kann: Classical 6. h4',
    moves: [
      { san: 'h6', uci: 'h7h6', weight: 96 }
    ]
  },
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6': {
    eco: 'B19',
    name: 'Caro-Kann: Classical 7. Nf3',
    moves: [
      { san: 'Nf3', uci: 'g1f3', weight: 95 }
    ]
  },
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3': {
    eco: 'B19',
    name: 'Caro-Kann: Classical 7... Nd7',
    moves: [
      { san: 'Nd7', uci: 'b8d7', weight: 90 },
      { san: 'e6', uci: 'e7e6', weight: 10 }
    ]
  },

  // ==========================================
  // === 5. 1. d4 CLOSED GAMES ===
  // ==========================================
  'd4': {
    eco: 'A40',
    name: "Queen's Pawn Game",
    moves: [
      { san: 'Nf6', uci: 'g8f6', weight: 52 }, // Indian Defenses
      { san: 'd5', uci: 'd7d5', weight: 36 },  // Closed Game
      { san: 'e6', uci: 'e7e6', weight: 6 },
      { san: 'f5', uci: 'f7f5', weight: 4 },   // Dutch Defense
      { san: 'g6', uci: 'g7g6', weight: 2 }
    ]
  },
  // 1. d4 d5
  'd4 d5': {
    eco: 'D00',
    name: "Queen's Pawn Game: Closed",
    moves: [
      { san: 'c4', uci: 'c2c4', weight: 68 }, // Queen's Gambit
      { san: 'Nf3', uci: 'g1f3', weight: 20 },
      { san: 'Bf4', uci: 'c1f4', weight: 10 }, // London System
      { san: 'Nc3', uci: 'b1c3', weight: 2 }
    ]
  },
  // London System
  'd4 d5 Bf4': {
    eco: 'D00',
    name: 'London System',
    moves: [
      { san: 'Nf6', uci: 'g8f6', weight: 65 },
      { san: 'c5', uci: 'c7c5', weight: 25 },
      { san: 'e6', uci: 'e7e6', weight: 10 }
    ]
  },
  'd4 d5 Nf3': {
    eco: 'D02',
    name: "Queen's Pawn: 2. Nf3",
    moves: [
      { san: 'Nf6', uci: 'g8f6', weight: 75 },
      { san: 'e6', uci: 'e7e6', weight: 15 },
      { san: 'c5', uci: 'c7c5', weight: 10 }
    ]
  },
  'd4 d5 Nf3 Nf6': {
    eco: 'D02',
    name: "Queen's Pawn: Classical 2... Nf6",
    moves: [
      { san: 'Bf4', uci: 'c1f4', weight: 50 }, // London System
      { san: 'c4', uci: 'c2c4', weight: 35 },  // QG via 2.Nf3
      { san: 'e3', uci: 'e2e3', weight: 10 },  // Colle System
      { san: 'Bg5', uci: 'c1g5', weight: 5 }   // Torre Attack
    ]
  },
  'd4 d5 Nf3 Nf6 Bf4': {
    eco: 'D02',
    name: 'London System: Classical Line',
    moves: [
      { san: 'e6', uci: 'e7e6', weight: 45 },
      { san: 'c5', uci: 'c7c5', weight: 40 },
      { san: 'Bf5', uci: 'c8f5', weight: 15 }
    ]
  },
  'd4 d5 Nf3 Nf6 Bf4 e6': {
    eco: 'D02',
    name: 'London System: 3... e6',
    moves: [
      { san: 'e3', uci: 'e2e3', weight: 90 },
      { san: 'Nbd2', uci: 'b1d2', weight: 10 }
    ]
  },
  'd4 d5 Nf3 Nf6 Bf4 e6 e3': {
    eco: 'D02',
    name: 'London System: 4. e3',
    moves: [
      { san: 'c5', uci: 'c7c5', weight: 55 },
      { san: 'Bd6', uci: 'f8d6', weight: 30 },
      { san: 'Be7', uci: 'f8e7', weight: 15 }
    ]
  },
  'd4 d5 Nf3 Nf6 Bf4 e6 e3 c5': {
    eco: 'D02',
    name: 'London System: 4... c5',
    moves: [
      { san: 'c3', uci: 'c2c3', weight: 85 },
      { san: 'Nbd2', uci: 'b1d2', weight: 15 }
    ]
  },

  // Queen's Gambit (1. d4 d5 2. c4)
  'd4 d5 c4': {
    eco: 'D06',
    name: "Queen's Gambit",
    moves: [
      { san: 'e6', uci: 'e7e6', weight: 52 }, // QGD (Declined)
      { san: 'c6', uci: 'c7c6', weight: 32 }, // Slav Defense
      { san: 'dxc4', uci: 'd5c4', weight: 12 }, // QGA (Accepted)
      { san: 'Nc6', uci: 'b8c6', weight: 4 }   // Chigorin
    ]
  },
  // QGD (2... e6)
  'd4 d5 c4 e6': {
    eco: 'D30',
    name: "Queen's Gambit Declined (QGD)",
    moves: [
      { san: 'Nc3', uci: 'b1c3', weight: 65 },
      { san: 'Nf3', uci: 'g1f3', weight: 30 },
      { san: 'cxd5', uci: 'c4d5', weight: 5 } // Exchange Variation
    ]
  },
  'd4 d5 c4 e6 Nc3': {
    eco: 'D31',
    name: "QGD: 3. Nc3",
    moves: [
      { san: 'Nf6', uci: 'g8f6', weight: 70 },
      { san: 'Be7', uci: 'f8e7', weight: 16 },
      { san: 'c6', uci: 'c7c6', weight: 14 } // Semi-Slav
    ]
  },
  'd4 d5 c4 e6 Nc3 Nf6': {
    eco: 'D35',
    name: 'QGD: Classical Variation',
    moves: [
      { san: 'Bg5', uci: 'c1g5', weight: 48 },
      { san: 'cxd5', uci: 'c4d5', weight: 32 }, // Exchange
      { san: 'Nf3', uci: 'g1f3', weight: 20 }
    ]
  },
  'd4 d5 c4 e6 Nc3 Nf6 Bg5': {
    eco: 'D50',
    name: 'QGD: 4. Bg5',
    moves: [
      { san: 'Be7', uci: 'f8e7', weight: 75 },
      { san: 'Nbd7', uci: 'b8d7', weight: 20 },
      { san: 'c6', uci: 'c7c6', weight: 5 }
    ]
  },
  'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7': {
    eco: 'D53',
    name: 'QGD: Classical Main Line',
    moves: [
      { san: 'e3', uci: 'e2e3', weight: 90 },
      { san: 'Nf3', uci: 'g1f3', weight: 10 }
    ]
  },
  'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3': {
    eco: 'D55',
    name: 'QGD: Classical 5. e3',
    moves: [
      { san: 'O-O', uci: 'e8g8', weight: 85 },
      { san: 'h6', uci: 'h7h6', weight: 15 }
    ]
  },
  'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O': {
    eco: 'D55',
    name: 'QGD: Classical 6. Nf3',
    moves: [
      { san: 'Nf3', uci: 'g1f3', weight: 92 },
      { san: 'Rc1', uci: 'a1c1', weight: 8 }
    ]
  },
  'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3': {
    eco: 'D55',
    name: 'QGD: Classical Main Tabia',
    moves: [
      { san: 'h6', uci: 'h7h6', weight: 55 }, // Tartakower / Lasker
      { san: 'Nbd7', uci: 'b8d7', weight: 30 }, // Orthodox
      { san: 'c6', uci: 'c7c6', weight: 15 }
    ]
  },
  // Slav Defense (1. d4 d5 2. c4 c6)
  'd4 d5 c4 c6': {
    eco: 'D10',
    name: 'Slav Defense',
    moves: [
      { san: 'Nf3', uci: 'g1f3', weight: 60 },
      { san: 'Nc3', uci: 'b1c3', weight: 30 },
      { san: 'cxd5', uci: 'c4d5', weight: 10 } // Exchange Slav
    ]
  },
  'd4 d5 c4 c6 Nf3': {
    eco: 'D11',
    name: 'Slav Defense: Modern Line',
    moves: [
      { san: 'Nf6', uci: 'g8f6', weight: 92 },
      { san: 'e6', uci: 'e7e6', weight: 8 }
    ]
  },
  'd4 d5 c4 c6 Nf3 Nf6': {
    eco: 'D11',
    name: 'Slav Defense: Main Branch',
    moves: [
      { san: 'Nc3', uci: 'b1c3', weight: 72 },
      { san: 'e3', uci: 'e2e3', weight: 22 },
      { san: 'cxd5', uci: 'c4d5', weight: 6 }
    ]
  },
  'd4 d5 c4 c6 Nf3 Nf6 Nc3': {
    eco: 'D15',
    name: 'Slav Defense: Three Knights',
    moves: [
      { san: 'dxc4', uci: 'd5c4', weight: 45 }, // Main Line Slav
      { san: 'e6', uci: 'e7e6', weight: 45 },   // Semi-Slav
      { san: 'a6', uci: 'a7a6', weight: 10 }    // Chebanenko Slav
    ]
  },
  'd4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4': {
    eco: 'D16',
    name: 'Slav Defense: Main Line Accepted',
    moves: [
      { san: 'a4', uci: 'a2a4', weight: 95 }
    ]
  },
  'd4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4': {
    eco: 'D17',
    name: 'Slav Defense: Alapin Variation',
    moves: [
      { san: 'Bf5', uci: 'c8f5', weight: 80 },
      { san: 'e6', uci: 'e7e6', weight: 15 },
      { san: 'Bg4', uci: 'c8g4', weight: 5 }
    ]
  },
  'd4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5': {
    eco: 'D18',
    name: 'Slav Defense: Classical Main Line',
    moves: [
      { san: 'e3', uci: 'e2e3', weight: 65 },
      { san: 'Ne5', uci: 'f3e5', weight: 35 }
    ]
  },
  // Semi-Slav (4... e6)
  'd4 d5 c4 c6 Nf3 Nf6 Nc3 e6': {
    eco: 'D43',
    name: 'Semi-Slav Defense',
    moves: [
      { san: 'e3', uci: 'e2e3', weight: 55 },
      { san: 'Bg5', uci: 'c1g5', weight: 40 }, // Botvinnik / Moscow
      { san: 'Qc2', uci: 'd1c2', weight: 5 }
    ]
  },
  'd4 d5 c4 c6 Nf3 Nf6 Nc3 e6 e3': {
    eco: 'D45',
    name: 'Semi-Slav: Meran Setup',
    moves: [
      { san: 'Nbd7', uci: 'b8d7', weight: 85 },
      { san: 'a6', uci: 'a7a6', weight: 15 }
    ]
  },
  'd4 d5 c4 c6 Nf3 Nf6 Nc3 e6 e3 Nbd7': {
    eco: 'D46',
    name: 'Semi-Slav: Main Tabia',
    moves: [
      { san: 'Bd3', uci: 'f1d3', weight: 60 },
      { san: 'Qc2', uci: 'd1c2', weight: 40 }
    ]
  },
  'd4 d5 c4 c6 Nf3 Nf6 Nc3 e6 e3 Nbd7 Bd3': {
    eco: 'D47',
    name: 'Semi-Slav: Meran Variation',
    moves: [
      { san: 'dxc4', uci: 'd5c4', weight: 85 },
      { san: 'Bd6', uci: 'f8d6', weight: 15 }
    ]
  },

  // ==========================================
  // === 6. INDIAN DEFENSES (1. d4 Nf6) ===
  // ==========================================
  'd4 Nf6': {
    eco: 'A45',
    name: 'Indian Defense',
    moves: [
      { san: 'c4', uci: 'c2c4', weight: 65 },
      { san: 'Nf3', uci: 'g1f3', weight: 22 },
      { san: 'Bf4', uci: 'c1f4', weight: 10 }, // London vs Indian
      { san: 'Bg5', uci: 'c1g5', weight: 3 }   // Trompowsky Attack
    ]
  },
  // Trompowsky Attack
  'd4 Nf6 Bg5': {
    eco: 'A45',
    name: 'Trompowsky Attack',
    moves: [
      { san: 'e6', uci: 'e7e6', weight: 45 },
      { san: 'd5', uci: 'd7d5', weight: 30 },
      { san: 'Ne4', uci: 'f6e4', weight: 25 }
    ]
  },
  'd4 Nf6 c4': {
    eco: 'E00',
    name: 'Indian Defense: Main Branch',
    moves: [
      { san: 'e6', uci: 'e7e6', weight: 48 }, // Nimzo / Queen's Indian / Catalan
      { san: 'g6', uci: 'g7g6', weight: 38 }, // King's Indian / Grunfeld
      { san: 'c5', uci: 'c7c5', weight: 10 }, // Benoni
      { san: 'd6', uci: 'd7d6', weight: 4 }
    ]
  },
  // 1. d4 Nf6 2. c4 e6
  'd4 Nf6 c4 e6': {
    eco: 'E00',
    name: 'Indian Defense: 2... e6',
    moves: [
      { san: 'Nc3', uci: 'b1c3', weight: 50 }, // Nimzo-Indian path
      { san: 'Nf3', uci: 'g1f3', weight: 42 }, // Catalan / QID
      { san: 'g3', uci: 'g2g3', weight: 8 }
    ]
  },
  // Nimzo-Indian (3. Nc3 Bb4)
  'd4 Nf6 c4 e6 Nc3': {
    eco: 'E20',
    name: 'Nimzo-Indian Complex',
    moves: [
      { san: 'Bb4', uci: 'f8b4', weight: 82 }, // Nimzo-Indian
      { san: 'd5', uci: 'd7d5', weight: 14 },  // Transposes to QGD
      { san: 'c5', uci: 'c7c5', weight: 4 }
    ]
  },
  'd4 Nf6 c4 e6 Nc3 Bb4': {
    eco: 'E20',
    name: 'Nimzo-Indian Defense',
    moves: [
      { san: 'e3', uci: 'e2e3', weight: 45 },  // Rubinstein System
      { san: 'Qc2', uci: 'd1c2', weight: 35 }, // Classical / Capablanca
      { san: 'Nf3', uci: 'g1f3', weight: 12 },
      { san: 'a3', uci: 'a2a3', weight: 8 }    // Saemisch Variation
    ]
  },
  'd4 Nf6 c4 e6 Nc3 Bb4 e3': {
    eco: 'E40',
    name: 'Nimzo-Indian: Rubinstein System',
    moves: [
      { san: 'O-O', uci: 'e8g8', weight: 65 },
      { san: 'c5', uci: 'c7c5', weight: 25 },
      { san: 'b6', uci: 'b7b6', weight: 10 }
    ]
  },
  'd4 Nf6 c4 e6 Nc3 Bb4 e3 O-O': {
    eco: 'E46',
    name: 'Nimzo-Indian: Rubinstein Main Line',
    moves: [
      { san: 'Bd3', uci: 'f1d3', weight: 70 },
      { san: 'Ne2', uci: 'g1e2', weight: 20 },
      { san: 'Nf3', uci: 'g1f3', weight: 10 }
    ]
  },
  'd4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3': {
    eco: 'E47',
    name: 'Nimzo-Indian: Rubinstein 4... O-O 5. Bd3',
    moves: [
      { san: 'd5', uci: 'd7d5', weight: 55 },
      { san: 'c5', uci: 'c7c5', weight: 35 },
      { san: 'b6', uci: 'b7b6', weight: 10 }
    ]
  },
  // 3. Nf3 Lines (Catalan / Queen's Indian / Bogo-Indian)
  'd4 Nf6 c4 e6 Nf3': {
    eco: 'E10',
    name: 'Indian Defense: 3. Nf3',
    moves: [
      { san: 'd5', uci: 'd7d5', weight: 45 },
      { san: 'b6', uci: 'b7b6', weight: 35 }, // Queen's Indian
      { san: 'Bb4+', uci: 'f8b4', weight: 20 } // Bogo-Indian
    ]
  },
  'd4 Nf6 c4 e6 Nf3 d5': {
    eco: 'D30',
    name: "QGD / Catalan Systems",
    moves: [
      { san: 'g3', uci: 'g2g3', weight: 55 }, // Catalan Opening
      { san: 'Nc3', uci: 'b1c3', weight: 40 },
      { san: 'Bf4', uci: 'c1f4', weight: 5 }
    ]
  },
  'd4 Nf6 c4 e6 Nf3 d5 g3': {
    eco: 'E00',
    name: 'Catalan Opening',
    moves: [
      { san: 'Be7', uci: 'f8e7', weight: 55 }, // Closed Catalan
      { san: 'dxc4', uci: 'd5c4', weight: 35 }, // Open Catalan
      { san: 'Bb4+', uci: 'f8b4', weight: 10 }
    ]
  },
  'd4 Nf6 c4 e6 Nf3 d5 g3 Be7': {
    eco: 'E06',
    name: 'Closed Catalan',
    moves: [
      { san: 'Bg2', uci: 'f1g2', weight: 98 }
    ]
  },
  'd4 Nf6 c4 e6 Nf3 d5 g3 Be7 Bg2': {
    eco: 'E06',
    name: 'Closed Catalan: Main Line',
    moves: [
      { san: 'O-O', uci: 'e8g8', weight: 98 }
    ]
  },
  'd4 Nf6 c4 e6 Nf3 d5 g3 Be7 Bg2 O-O': {
    eco: 'E06',
    name: 'Closed Catalan Tabia',
    moves: [
      { san: 'O-O', uci: 'e1g1', weight: 90 },
      { san: 'Qc2', uci: 'd1c2', weight: 10 }
    ]
  },

  // King's Indian & Grunfeld (1. d4 Nf6 2. c4 g6)
  'd4 Nf6 c4 g6': {
    eco: 'E60',
    name: "King's Indian / Grunfeld Complex",
    moves: [
      { san: 'Nc3', uci: 'b1c3', weight: 75 },
      { san: 'Nf3', uci: 'g1f3', weight: 15 },
      { san: 'g3', uci: 'g2g3', weight: 10 }
    ]
  },
  'd4 Nf6 c4 g6 Nc3': {
    eco: 'E60',
    name: "King's Indian / Grunfeld Setup",
    moves: [
      { san: 'Bg7', uci: 'f8g7', weight: 58 }, // King's Indian
      { san: 'd5', uci: 'd7d5', weight: 42 }   // Grunfeld Defense
    ]
  },
  // King's Indian Defense
  'd4 Nf6 c4 g6 Nc3 Bg7': {
    eco: 'E61',
    name: "King's Indian Defense",
    moves: [
      { san: 'e4', uci: 'e2e4', weight: 88 },
      { san: 'Nf3', uci: 'g1f3', weight: 12 }
    ]
  },
  'd4 Nf6 c4 g6 Nc3 Bg7 e4': {
    eco: 'E70',
    name: "King's Indian: Main Line",
    moves: [
      { san: 'd6', uci: 'd7d6', weight: 95 }
    ]
  },
  'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6': {
    eco: 'E70',
    name: "King's Indian Tabia",
    moves: [
      { san: 'Nf3', uci: 'g1f3', weight: 70 }, // Classical Variation
      { san: 'f3', uci: 'f2f3', weight: 18 },  // Samisch Variation
      { san: 'Be2', uci: 'f1e2', weight: 8 },  // Averbakh setup
      { san: 'f4', uci: 'f2f4', weight: 4 }   // Four Pawns Attack
    ]
  },
  'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3': {
    eco: 'E90',
    name: "King's Indian: Classical Setup",
    moves: [
      { san: 'O-O', uci: 'e8g8', weight: 98 }
    ]
  },
  'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O': {
    eco: 'E91',
    name: "King's Indian: Classical 6. Be2",
    moves: [
      { san: 'Be2', uci: 'f1e2', weight: 90 },
      { san: 'h3', uci: 'h2h3', weight: 10 }
    ]
  },
  'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2': {
    eco: 'E92',
    name: "King's Indian: Classical Main",
    moves: [
      { san: 'e5', uci: 'e7e5', weight: 85 },
      { san: 'c5', uci: 'c7c5', weight: 10 },
      { san: 'Bg4', uci: 'c8g4', weight: 5 }
    ]
  },
  'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5': {
    eco: 'E94',
    name: "King's Indian: Mar del Plata Setup",
    moves: [
      { san: 'O-O', uci: 'e1g1', weight: 85 },
      { san: 'd5', uci: 'd4d5', weight: 10 },
      { san: 'Be3', uci: 'c1e3', weight: 5 }
    ]
  },
  'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O': {
    eco: 'E97',
    name: "King's Indian: Classical Mar del Plata Tabia",
    moves: [
      { san: 'Nc6', uci: 'b8c6', weight: 75 },
      { san: 'Nbd7', uci: 'b8d7', weight: 15 },
      { san: 'exd4', uci: 'e5d4', weight: 10 }
    ]
  },
  // Grünfeld Defense (3... d5)
  'd4 Nf6 c4 g6 Nc3 d5': {
    eco: 'D80',
    name: 'Grunfeld Defense',
    moves: [
      { san: 'cxd5', uci: 'c4d5', weight: 55 }, // Exchange Grunfeld
      { san: 'Nf3', uci: 'g1f3', weight: 30 },  // Russian / Classical
      { san: 'Bf4', uci: 'c1f4', weight: 10 },
      { san: 'Bg5', uci: 'c1g5', weight: 5 }
    ]
  },
  'd4 Nf6 c4 g6 Nc3 d5 cxd5': {
    eco: 'D85',
    name: 'Grunfeld: Exchange Variation',
    moves: [
      { san: 'Nxd5', uci: 'f6d5', weight: 98 }
    ]
  },
  'd4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5': {
    eco: 'D85',
    name: 'Grunfeld: Exchange 4. e4',
    moves: [
      { san: 'e4', uci: 'e2e4', weight: 85 },
      { san: 'Bd2', uci: 'c1d2', weight: 10 },
      { san: 'Nf3', uci: 'g1f3', weight: 5 }
    ]
  },
  'd4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4': {
    eco: 'D85',
    name: 'Grunfeld: Exchange 4... Nxc3',
    moves: [
      { san: 'Nxc3', uci: 'd5c3', weight: 98 }
    ]
  },
  'd4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4 Nxc3': {
    eco: 'D85',
    name: 'Grunfeld: Exchange 5. bxc3',
    moves: [
      { san: 'bxc3', uci: 'b2c3', weight: 99 }
    ]
  },
  'd4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4 Nxc3 bxc3': {
    eco: 'D85',
    name: 'Grunfeld: Exchange Tabia',
    moves: [
      { san: 'Bg7', uci: 'f8g7', weight: 98 }
    ]
  },
  'd4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4 Nxc3 bxc3 Bg7': {
    eco: 'D85',
    name: 'Grunfeld: Classical Exchange 6. Bc4',
    moves: [
      { san: 'Bc4', uci: 'f1c4', weight: 65 },
      { san: 'Nf3', uci: 'g1f3', weight: 35 }
    ]
  },

  // ==========================================
  // === 7. FLANK OPENINGS (1. c4 / 1. Nf3) ===
  // ==========================================
  'c4': {
    eco: 'A10',
    name: 'English Opening',
    moves: [
      { san: 'e5', uci: 'e7e5', weight: 40 }, // King's English
      { san: 'Nf6', uci: 'g8f6', weight: 32 }, // Anglo-Indian
      { san: 'c5', uci: 'c7c5', weight: 18 }, // Symmetrical English
      { san: 'e6', uci: 'e7e6', weight: 10 }
    ]
  },
  'c4 e5': {
    eco: 'A20',
    name: "English Opening: King's English",
    moves: [
      { san: 'Nc3', uci: 'b1c3', weight: 70 },
      { san: 'g3', uci: 'g2g3', weight: 20 },
      { san: 'Nf3', uci: 'g1f3', weight: 10 }
    ]
  },
  'c4 e5 Nc3': {
    eco: 'A21',
    name: "English Opening: 2. Nc3",
    moves: [
      { san: 'Nf6', uci: 'g8f6', weight: 60 },
      { san: 'Nc6', uci: 'b8c6', weight: 30 },
      { san: 'Bb4', uci: 'f8b4', weight: 10 }
    ]
  },
  'c4 e5 Nc3 Nf6': {
    eco: 'A22',
    name: "English Opening: Two Knights",
    moves: [
      { san: 'Nf3', uci: 'g1f3', weight: 60 },
      { san: 'g3', uci: 'g2g3', weight: 40 }
    ]
  },
  'c4 e5 Nc3 Nf6 Nf3': {
    eco: 'A22',
    name: "English Opening: 3. Nf3",
    moves: [
      { san: 'Nc6', uci: 'b8c6', weight: 85 },
      { san: 'e4', uci: 'e5e4', weight: 15 }
    ]
  },
  'c4 e5 Nc3 Nf6 Nf3 Nc6': {
    eco: 'A28',
    name: 'English Opening: Four Knights System',
    moves: [
      { san: 'g3', uci: 'g2g3', weight: 65 },
      { san: 'e3', uci: 'e2e3', weight: 25 },
      { san: 'd4', uci: 'd2d4', weight: 10 }
    ]
  },
  'c4 Nf6': {
    eco: 'A15',
    name: 'English Opening: Anglo-Indian',
    moves: [
      { san: 'Nc3', uci: 'b1c3', weight: 52 },
      { san: 'Nf3', uci: 'g1f3', weight: 36 },
      { san: 'g3', uci: 'g2g3', weight: 12 }
    ]
  },
  'c4 c5': {
    eco: 'A30',
    name: 'English Opening: Symmetrical Variation',
    moves: [
      { san: 'Nc3', uci: 'b1c3', weight: 55 },
      { san: 'Nf3', uci: 'g1f3', weight: 35 },
      { san: 'g3', uci: 'g2g3', weight: 10 }
    ]
  },

  // 1. Nf3 (Reti Opening)
  'Nf3': {
    eco: 'A04',
    name: 'Reti Opening / King’s Indian Attack',
    moves: [
      { san: 'd5', uci: 'd7d5', weight: 45 },
      { san: 'Nf6', uci: 'g8f6', weight: 40 },
      { san: 'c5', uci: 'c7c5', weight: 10 },
      { san: 'g6', uci: 'g7g6', weight: 5 }
    ]
  },
  'Nf3 d5': {
    eco: 'A06',
    name: 'Reti Opening: Modern Line',
    moves: [
      { san: 'g3', uci: 'g2g3', weight: 50 },
      { san: 'c4', uci: 'c2c4', weight: 30 },
      { san: 'd4', uci: 'd2d4', weight: 20 }
    ]
  },
  'Nf3 d5 g3': {
    eco: 'A07',
    name: "King's Indian Attack",
    moves: [
      { san: 'Nf6', uci: 'g8f6', weight: 55 },
      { san: 'c6', uci: 'c7c6', weight: 25 },
      { san: 'Bg4', uci: 'c8g4', weight: 20 }
    ]
  },
  'Nf3 d5 g3 Nf6': {
    eco: 'A07',
    name: "King's Indian Attack: Classical",
    moves: [
      { san: 'Bg2', uci: 'f1g2', weight: 98 }
    ]
  },
  'Nf3 d5 g3 Nf6 Bg2': {
    eco: 'A07',
    name: "King's Indian Attack: Setup",
    moves: [
      { san: 'c6', uci: 'c7c6', weight: 40 },
      { san: 'e6', uci: 'e7e6', weight: 35 },
      { san: 'Bf5', uci: 'c8f5', weight: 25 }
    ]
  }
};

/**
 * Normalizes a list of SAN moves (e.g. ["e4", "e5", "Nf3"]) into a clean lookup key.
 */
export function getOpeningKeyFromMoves(sanMoves: string[]): string {
  return sanMoves.map(m => m.trim()).filter(m => m.length > 0).join(' ');
}

/**
 * Looks up the current opening position in the book.
 * Returns the matching opening entry or undefined if out of book.
 */
export function lookupOpening(sanMoves: string[]): OpeningBookEntry | undefined {
  const key = getOpeningKeyFromMoves(sanMoves);
  return OPENING_BOOK[key];
}

/**
 * Selects a book move weighted by natural human play frequencies.
 */
export function selectBookMove(entry: OpeningBookEntry): { san: string; uci: string } | null {
  if (!entry || !entry.moves || entry.moves.length === 0) return null;
  if (entry.moves.length === 1) return entry.moves[0];

  const totalWeight = entry.moves.reduce((sum, m) => sum + m.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const candidate of entry.moves) {
    if (roll < candidate.weight) {
      return candidate;
    }
    roll -= candidate.weight;
  }

  return entry.moves[0];
}
