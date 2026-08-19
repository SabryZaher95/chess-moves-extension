import { Injectable, signal, OnDestroy, inject } from '@angular/core';
import { LozzaEngineService, SinglePvResult, MultiPvResult } from './lozza-engine.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Chess } from 'chess.js';
import { lookupOpening, selectBookMove } from './opening-book';

export type EloTier = 'max' | '2300' | '2000' | '1700' | '1400' | '1100' | '800' | '1200' | '1500' | '1800' | '2100';

export type PacingCategory = 'reflex' | 'intuitive' | 'calculation' | 'scramble';

export interface EloProfileConfig {
  tier: string;
  label: string;
  targetAccuracyStr: string;
  targetAccuracyMin: number;
  targetAccuracyMax: number;
  targetT1Rate: number;        // Target T1 top-engine move match percentage
  maxT1Streak: number;         // Maximum consecutive T1 top-moves permitted before forcing candidate
  maxOnlyMovesPerGame: number; // Max allowed high-delta computer-only moves (delta >= 150cp) per game
  baseTopMoveWeight: number;   // Base probability to pick top move
  inaccuracyWeight: number;    // Probability to pick slight inaccuracy (25-130cp)
  mistakeWeight: number;       // Probability to pick mistake (130-280cp)
  blunderWeight: number;       // Probability to pick blunder (280cp+)
  maxDepth: number;
  baseThinkMedianMs: number;
  engineSearchMs: number;      // Actual engine think-time budget (ms) for this tier
}

export const ELO_PROFILES: Record<string, EloProfileConfig> = {
  'max': {
    tier: 'max',
    label: 'Max - Pure Engine 3000+ (Maximum Strength)',
    targetAccuracyStr: '99%+',
    targetAccuracyMin: 98,
    targetAccuracyMax: 100,
    targetT1Rate: 1.00,
    maxT1Streak: 999,
    maxOnlyMovesPerGame: 999,
    baseTopMoveWeight: 1.0,
    inaccuracyWeight: 0.0,
    mistakeWeight: 0.0,
    blunderWeight: 0.0,
    maxDepth: 24,
    baseThinkMedianMs: 1500,
    engineSearchMs: 2500
  },
  '2300': {
    tier: '2300',
    label: '2300 - Master (~95% CAPS)',
    targetAccuracyStr: '~94-96%',
    targetAccuracyMin: 93,
    targetAccuracyMax: 97,
    targetT1Rate: 0.88,
    maxT1Streak: 6,
    maxOnlyMovesPerGame: 8,
    baseTopMoveWeight: 0.88,
    inaccuracyWeight: 0.08,
    mistakeWeight: 0.04,
    blunderWeight: 0.00,
    maxDepth: 20,
    baseThinkMedianMs: 3200,
    engineSearchMs: 2200
  },
  '2000': {
    tier: '2000',
    label: '2000 - Expert (~92% CAPS)',
    targetAccuracyStr: '~90-94%',
    targetAccuracyMin: 89,
    targetAccuracyMax: 95,
    targetT1Rate: 0.80,
    maxT1Streak: 4,
    maxOnlyMovesPerGame: 6,
    baseTopMoveWeight: 0.80,
    inaccuracyWeight: 0.14,
    mistakeWeight: 0.06,
    blunderWeight: 0.00,
    maxDepth: 18,
    baseThinkMedianMs: 3400,
    engineSearchMs: 2000
  },
  '1700': {
    tier: '1700',
    label: '1700 - Advanced (~87% CAPS)',
    targetAccuracyStr: '~84-90%',
    targetAccuracyMin: 83,
    targetAccuracyMax: 91,
    targetT1Rate: 0.70,
    maxT1Streak: 3,
    maxOnlyMovesPerGame: 4,
    baseTopMoveWeight: 0.70,
    inaccuracyWeight: 0.20,
    mistakeWeight: 0.09,
    blunderWeight: 0.01,
    maxDepth: 16,
    baseThinkMedianMs: 3200,
    engineSearchMs: 1600
  },
  '1400': {
    tier: '1400',
    label: '1400 - Intermediate (~80% CAPS)',
    targetAccuracyStr: '~76-83%',
    targetAccuracyMin: 75,
    targetAccuracyMax: 84,
    targetT1Rate: 0.56,
    maxT1Streak: 2,
    maxOnlyMovesPerGame: 3,
    baseTopMoveWeight: 0.56,
    inaccuracyWeight: 0.28,
    mistakeWeight: 0.12,
    blunderWeight: 0.04,
    maxDepth: 14,
    baseThinkMedianMs: 3000,
    engineSearchMs: 1200
  },
  '1100': {
    tier: '1100',
    label: '1100 - Casual (~72% CAPS)',
    targetAccuracyStr: '~68-75%',
    targetAccuracyMin: 67,
    targetAccuracyMax: 76,
    targetT1Rate: 0.44,
    maxT1Streak: 2,
    maxOnlyMovesPerGame: 2,
    baseTopMoveWeight: 0.44,
    inaccuracyWeight: 0.34,
    mistakeWeight: 0.16,
    blunderWeight: 0.06,
    maxDepth: 12,
    baseThinkMedianMs: 2800,
    engineSearchMs: 900
  },
  '800': {
    tier: '800',
    label: '800 - Beginner (~62% CAPS)',
    targetAccuracyStr: '~58-66%',
    targetAccuracyMin: 55,
    targetAccuracyMax: 68,
    targetT1Rate: 0.34,
    maxT1Streak: 2,
    maxOnlyMovesPerGame: 1,
    baseTopMoveWeight: 0.34,
    inaccuracyWeight: 0.38,
    mistakeWeight: 0.20,
    blunderWeight: 0.08,
    maxDepth: 10,
    baseThinkMedianMs: 2400,
    engineSearchMs: 600
  },
  // Backwards compatibility aliases
  '1200': {
    tier: '1200',
    label: '1200 - Club Player',
    targetAccuracyStr: '~70-76%',
    targetAccuracyMin: 68,
    targetAccuracyMax: 77,
    targetT1Rate: 0.46,
    maxT1Streak: 2,
    maxOnlyMovesPerGame: 2,
    baseTopMoveWeight: 0.46,
    inaccuracyWeight: 0.32,
    mistakeWeight: 0.16,
    blunderWeight: 0.06,
    maxDepth: 12,
    baseThinkMedianMs: 2800,
    engineSearchMs: 900
  },
  '1500': {
    tier: '1500',
    label: '1500 - Intermediate',
    targetAccuracyStr: '~78-85%',
    targetAccuracyMin: 78,
    targetAccuracyMax: 85,
    targetT1Rate: 0.60,
    maxT1Streak: 2,
    maxOnlyMovesPerGame: 3,
    baseTopMoveWeight: 0.60,
    inaccuracyWeight: 0.26,
    mistakeWeight: 0.11,
    blunderWeight: 0.03,
    maxDepth: 14,
    baseThinkMedianMs: 3200,
    engineSearchMs: 1400
  },
  '1800': {
    tier: '1800',
    label: '1800 - Advanced',
    targetAccuracyStr: '~86-92%',
    targetAccuracyMin: 86,
    targetAccuracyMax: 92,
    targetT1Rate: 0.76,
    maxT1Streak: 3,
    maxOnlyMovesPerGame: 5,
    baseTopMoveWeight: 0.76,
    inaccuracyWeight: 0.16,
    mistakeWeight: 0.07,
    blunderWeight: 0.01,
    maxDepth: 16,
    baseThinkMedianMs: 3400,
    engineSearchMs: 1800
  },
  '2100': {
    tier: '2100',
    label: '2100 - Expert',
    targetAccuracyStr: '~92-96%',
    targetAccuracyMin: 92,
    targetAccuracyMax: 96,
    targetT1Rate: 0.86,
    maxT1Streak: 4,
    maxOnlyMovesPerGame: 7,
    baseTopMoveWeight: 0.86,
    inaccuracyWeight: 0.10,
    mistakeWeight: 0.04,
    blunderWeight: 0.00,
    maxDepth: 18,
    baseThinkMedianMs: 3600,
    engineSearchMs: 2200
  }
};

export interface EvaluatedMove extends SinglePvResult {
  humanScore?: string;
  fromSquare?: string;
  toSquare?: string;
  pieceType?: string;
  isSelected?: boolean;
  selectionReason?: 'top' | 'book' | 'recapture' | 'natural' | 'inaccuracy' | 'mistake' | 'blunder';
  reasonDescription?: string;
}

export type ConnectionStatus = 'no-game' | 'connected' | 'error';

interface GameHistoryMove {
  moveNumber: number;
  san: string;
  isT1: boolean;
  isBook: boolean;
  isOnlyMove: boolean;
  cpLoss: number;
}

function logNormalRandom(median: number, sigma: number): number {
  const u1 = Math.random() || 0.0001;
  const u2 = Math.random() || 0.0001;
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const mu = Math.log(median);
  return Math.exp(mu + sigma * z);
}

@Injectable({
  providedIn: 'root'
})
export class GameStateService implements OnDestroy {
  private engine = inject(LozzaEngineService);

  readonly currentFen = signal<string | null>(null);
  readonly sideToMove = signal<'w' | 'b' | null>(null);
  readonly myColor = signal<'w' | 'b' | null>(null);
  readonly evaluatedMoves = signal<EvaluatedMove[]>([]);
  readonly selectedMove = signal<EvaluatedMove | null>(null);
  readonly connectionStatus = signal<ConnectionStatus>('no-game');
  readonly selectedElo = signal<string>('max');
  readonly humanMode = signal<boolean>(false);
  readonly audioCueEnabled = signal<boolean>(false);
  readonly compactHudMode = signal<boolean>(false);

  // Stealth & Concealment Mode (Default to false for instant move display)
  readonly autoConcealMove = signal<boolean>(false);
  readonly isMoveRevealed = signal<boolean>(true);

  // Opening Book Signals
  readonly currentOpening = signal<{ eco: string; name: string } | null>(null);
  readonly isBookPosition = signal<boolean>(false);

  // Move Pacing Signals & Clock Times
  readonly myClockSec = signal<number | null>(null);
  readonly oppClockSec = signal<number | null>(null);
  readonly suggestedDelaySec = signal<number>(0);
  readonly remainingDelaySec = signal<number>(0);
  readonly isPacingSafe = signal<boolean>(true);
  readonly pacingCategory = signal<PacingCategory>('intuitive');

  // Live In-Game Accuracy Monitor
  readonly gameMovesCount = signal<number>(0);
  readonly estimatedAccuracy = signal<number>(99);
  readonly runningT1Rate = signal<number>(100);
  readonly runningAcpl = signal<number>(12);
  readonly consecutiveT1Count = signal<number>(0);
  readonly onlyMovesPlayed = signal<number>(0);
  readonly maxOnlyMoves = signal<number>(999);

  // Engine signals
  readonly isSearching = this.engine.isSearching;
  readonly searchTimeMs = this.engine.searchTimeMs;

  private messageListener: (message: any) => void;
  private stateUpdateSubject = new Subject<{ f: string; m?: string[]; t1?: number | null; t2?: number | null }>();
  private subscriptions = new Subscription();
  private pendingSearchPromise: Promise<MultiPvResult> | null = null;
  private latestFen: string | null = null;
  private pacingTimer: ReturnType<typeof setInterval> | null = null;
  private audioCtx: AudioContext | null = null;

  // In-Game Tracking
  private gameHistory: GameHistoryMove[] = [];
  private lastKnownSanMovesCount = 0;

  // Inbound message rate limiting
  private msgWindowStart = 0;
  private msgCountInWindow = 0;
  private readonly MSG_RATE_LIMIT = 40;

  constructor() {
    this.subscriptions.add(
      this.stateUpdateSubject.pipe(debounceTime(50)).subscribe(update => {
        this.processStateUpdate(update.f, update.m || [], update.t1, update.t2);
      })
    );

    this.messageListener = (message: any) => {
      this.handleMessage(message);
    };

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(this.messageListener);
    }

    this.initTabSync();
  }

  handleMessage(message: any) {
    if (!message || typeof message !== 'object') return;

    if (message.type === 'pu') {
      if (this.isRateLimited()) return;
      if (!this.isValidPositionMessage(message)) return;
      this.handlePositionUpdate(message);
    } else if (message.type === 'cs') {
      this.clearState();
    }
  }

  private isValidPositionMessage(message: any): boolean {
    if (typeof message.f !== 'string' || message.f.length === 0 || message.f.length > 128) {
      return false;
    }
    try {
      new Chess(message.f);
    } catch (_) {
      return false;
    }
    if (message.c !== undefined && message.c !== 'w' && message.c !== 'b') {
      return false;
    }
    if (!this.isValidClock(message.t1) || !this.isValidClock(message.t2)) {
      return false;
    }
    if (message.m !== undefined) {
      if (!Array.isArray(message.m)) return false;
      if (message.m.some((mv: any) => typeof mv !== 'string')) return false;
    }
    return true;
  }

  private isValidClock(v: any): boolean {
    if (v === undefined || v === null) return true;
    return typeof v === 'number' && Number.isFinite(v) && v >= 0;
  }

  private isRateLimited(): boolean {
    const now = Date.now();
    if (now - this.msgWindowStart > 1000) {
      this.msgWindowStart = now;
      this.msgCountInWindow = 0;
    }
    this.msgCountInWindow++;
    return this.msgCountInWindow > this.MSG_RATE_LIMIT;
  }

  private initTabSync() {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      this.requestActivePosition();

      chrome.tabs.onActivated?.addListener(() => {
        this.requestActivePosition();
      });

      chrome.tabs.onUpdated?.addListener((_tabId, changeInfo) => {
        if (changeInfo.status === 'complete') {
          this.requestActivePosition();
        }
      });
    }
  }

  requestActivePosition() {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        let tab = tabs[0];
        if (tab?.id) {
          try {
            const res = chrome.tabs.sendMessage(tab.id, { type: 'rp' });
            if (res && typeof res.catch === 'function') res.catch(() => { });
          } catch (_) { }
        } else {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs2) => {
            if (tabs2[0]?.id) {
              try {
                const res = chrome.tabs.sendMessage(tabs2[0].id, { type: 'rp' });
                if (res && typeof res.catch === 'function') res.catch(() => { });
              } catch (_) { }
            }
          });
        }
      });
    }
  }

  private handlePositionUpdate(message: any) {
    this.connectionStatus.set('connected');

    const parts = message.f.split(' ');
    let sideToMove: 'w' | 'b' = 'w';
    if (parts.length > 1) {
      sideToMove = parts[1] as 'w' | 'b';
      this.sideToMove.set(sideToMove);
    }

    if (message.c) {
      this.myColor.set(message.c);
    }

    if (message.t1 !== undefined) {
      this.myClockSec.set(message.t1);
    }
    if (message.t2 !== undefined) {
      this.oppClockSec.set(message.t2);
    }

    const sanMoves = message.m || [];
    this.detectAndHandleNewGame(sanMoves, message.f);

    if (message.c && sideToMove !== message.c) {
      this.latestFen = message.f;
      this.currentFen.set(message.f);
      this.evaluatedMoves.set([]);
      this.selectedMove.set(null);
      this.isMoveRevealed.set(true);
      this.clearPacingTimer();
      if (this.engine.isSearching()) {
        this.engine.stopSearch();
      }
      return;
    }

    this.stateUpdateSubject.next({
      f: message.f,
      m: sanMoves,
      t1: message.t1,
      t2: message.t2
    });
  }

  private detectAndHandleNewGame(sanMoves: string[], fen: string) {
    const isStartFen = fen.startsWith('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
    const movesCount = sanMoves.length;

    if (movesCount < this.lastKnownSanMovesCount || (isStartFen && movesCount <= 1) || (movesCount === 0 && this.gameHistory.length > 0)) {
      this.resetGameSession();
    }
    this.lastKnownSanMovesCount = movesCount;
  }

  private resetGameSession() {
    this.engine.newGame();
    this.gameHistory = [];
    this.gameMovesCount.set(0);
    this.consecutiveT1Count.set(0);
    this.onlyMovesPlayed.set(0);

    const profile = ELO_PROFILES[this.selectedElo()] || ELO_PROFILES['max'];
    this.maxOnlyMoves.set(profile.maxOnlyMovesPerGame);
    this.estimatedAccuracy.set(Math.round((profile.targetAccuracyMin + profile.targetAccuracyMax) / 2));
    this.runningT1Rate.set(Math.round(profile.targetT1Rate * 100));
    this.runningAcpl.set(15);
  }

  private clearState() {
    this.latestFen = null;
    this.currentFen.set(null);
    this.evaluatedMoves.set([]);
    this.selectedMove.set(null);
    this.isMoveRevealed.set(true);
    this.sideToMove.set(null);
    this.myColor.set(null);
    this.myClockSec.set(null);
    this.oppClockSec.set(null);
    this.currentOpening.set(null);
    this.isBookPosition.set(false);
    this.connectionStatus.set('no-game');
    this.lastKnownSanMovesCount = 0;
    this.resetGameSession();
    this.clearPacingTimer();

    if (this.engine.isSearching()) {
      this.engine.stopSearch();
    }
  }

  revealMoveEarly() {
    this.isMoveRevealed.set(true);
    this.isPacingSafe.set(true);
  }

  private startPacingCountdown(delayMs: number, category: PacingCategory = 'intuitive') {
    this.clearPacingTimer();
    const delaySec = Math.max(0.3, Number((delayMs / 1000).toFixed(1)));
    this.suggestedDelaySec.set(delaySec);
    this.remainingDelaySec.set(delaySec);
    this.pacingCategory.set(category);

    if (!this.autoConcealMove() || delaySec <= 0.4) {
      this.isMoveRevealed.set(true);
      this.isPacingSafe.set(true);
    } else {
      this.isMoveRevealed.set(false);
      this.isPacingSafe.set(false);
    }

    const startTime = Date.now();
    this.pacingTimer = setInterval(() => {
      const elapsedMs = Date.now() - startTime;
      const remainingMs = Math.max(0, delayMs - elapsedMs);
      const remainingSec = Number((remainingMs / 1000).toFixed(1));
      this.remainingDelaySec.set(remainingSec);

      if (remainingSec <= 0) {
        this.isPacingSafe.set(true);
        this.isMoveRevealed.set(true);
        this.clearPacingTimer();
        this.playAudioCue();
      }
    }, 100);
  }

  private clearPacingTimer() {
    if (this.pacingTimer) {
      clearInterval(this.pacingTimer);
      this.pacingTimer = null;
    }
  }

  private playAudioCue() {
    if (!this.audioCueEnabled()) return;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (_) { }
  }

  private async processStateUpdate(fen: string, sanMoves: string[], myClockSec?: number | null, _oppClockSec?: number | null) {
    if (fen === this.latestFen) return;
    this.latestFen = fen;
    this.currentFen.set(fen);
    this.evaluatedMoves.set([]);
    this.selectedMove.set(null);
    if (this.autoConcealMove()) {
      this.isMoveRevealed.set(false);
    } else {
      this.isMoveRevealed.set(true);
    }

    if (this.engine.isSearching()) {
      this.engine.stopSearch();
      if (this.pendingSearchPromise) {
        try { await this.pendingSearchPromise; } catch (_) { }
      }
    }

    if (this.latestFen !== fen) return;

    const profile = ELO_PROFILES[this.selectedElo()] || ELO_PROFILES['max'];
    this.maxOnlyMoves.set(profile.maxOnlyMovesPerGame);

    // 1. Check Master Opening Book first — must be a legal move on current FEN
    const isInitialStartFen = fen.startsWith('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w');
    let validBookMove: EvaluatedMove | null = null;

    if (sanMoves.length > 0 || isInitialStartFen) {
      const bookEntry = lookupOpening(sanMoves);
      if (bookEntry) {
        const bookMove = selectBookMove(bookEntry);
        if (bookMove) {
          try {
            const testGame = new Chess(fen);
            let moveObj = null;
            if (bookMove.uci && bookMove.uci.length >= 4) {
              const from = bookMove.uci.substring(0, 2);
              const to = bookMove.uci.substring(2, 4);
              const promotion = bookMove.uci.length > 4 ? bookMove.uci[4] : undefined;
              moveObj = testGame.move({ from, to, promotion });
            } else if (bookMove.san) {
              moveObj = testGame.move(bookMove.san);
            }

            if (moveObj) {
              this.currentOpening.set({ eco: bookEntry.eco, name: bookEntry.name });
              this.isBookPosition.set(true);

              validBookMove = {
                bestMove: bookMove.uci,
                san: moveObj.san,
                pvIndex: 1,
                humanScore: '0.00',
                depthReached: 99,
                isSelected: true,
                selectionReason: 'book',
                reasonDescription: `${bookEntry.eco}: ${bookEntry.name}`
              };
            }
          } catch (_) {
            // Book candidate not legal on this FEN -> proceed to engine search
          }
        }
      }
    }

    if (validBookMove) {
      this.enrichMoveCoordinates(validBookMove, fen);

      let bookDelay = Math.round(400 + Math.random() * 500);
      let category: PacingCategory = 'reflex';

      if (myClockSec !== undefined && myClockSec !== null && myClockSec > 0) {
        if (myClockSec <= 15) {
          bookDelay = Math.round(150 + Math.random() * 250);
          category = 'scramble';
        } else if (myClockSec <= 35) {
          bookDelay = Math.round(300 + Math.random() * 300);
          category = 'scramble';
        }
      }
      this.startPacingCountdown(bookDelay, category);

      this.evaluatedMoves.set([validBookMove]);
      this.selectedMove.set(validBookMove);
      this.recordMoveOutcome(validBookMove, true, 0, false);
      return;
    } else {
      this.currentOpening.set(null);
      this.isBookPosition.set(false);
    }

    // 2. High-Strength Deep Engine Search (MultiPV Top Lines)
    try {
      const baseTime = this.engine.searchTimeMs();
      const pacing = this.calculateTrimodalPacingDelay(fen, profile, baseTime, myClockSec);
      this.startPacingCountdown(pacing.suggestedDelayMs, pacing.category);

      const multipv = 4; // Evaluate top 4 candidate lines
      const engineMs = this.computeEngineSearchMs(profile, pacing, myClockSec);

      this.pendingSearchPromise = this.engine.getBestMoves(fen, {
        movetimeMs: engineMs,
        depth: profile.maxDepth,
        multipv: multipv
      });

      const result = await this.pendingSearchPromise;

      if (this.latestFen !== fen) return;

      const formatted = result.lines.map(line => {
        const em = this.formatMoveResult(line);
        this.enrichMoveCoordinates(em, fen);
        return em;
      });

      const selected = this.selectCalibratedMove(formatted, fen, profile);

      for (const m of formatted) {
        m.isSelected = (m === selected);
      }

      this.evaluatedMoves.set(formatted);
      this.selectedMove.set(selected);

      const topCp = formatted[0]?.scoreCp ?? 0;
      const chosenCp = selected?.scoreCp ?? topCp;
      const cpLoss = Math.max(0, Math.abs(topCp - chosenCp));
      const isT1 = (selected === formatted[0]);

      let isOnlyMove = false;
      if (formatted.length >= 2) {
        const deltaCp = Math.abs((formatted[0]?.scoreCp ?? 0) - (formatted[1]?.scoreCp ?? 0));
        isOnlyMove = deltaCp >= 150;
      }

      this.recordMoveOutcome(selected, false, cpLoss, isOnlyMove, isT1);

    } catch (_) {
    } finally {
      if (this.latestFen === fen) {
        this.pendingSearchPromise = null;
      }
    }
  }

  private enrichMoveCoordinates(move: EvaluatedMove, fen: string) {
    if (!move.bestMove || move.bestMove.length < 4) return;
    move.fromSquare = move.bestMove.substring(0, 2);
    move.toSquare = move.bestMove.substring(2, 4);

    try {
      const chess = new Chess(fen);
      const piece = chess.get(move.fromSquare as any);
      if (piece) {
        move.pieceType = piece.type.toUpperCase();
      }
    } catch (_) { }
  }

  private recordMoveOutcome(
    move: EvaluatedMove | null,
    isBook: boolean,
    cpLoss: number,
    isOnlyMove: boolean,
    isT1: boolean = true
  ) {
    if (!move || !move.san) return;

    this.gameHistory.push({
      moveNumber: this.gameHistory.length + 1,
      san: move.san,
      isT1,
      isBook,
      isOnlyMove,
      cpLoss
    });

    this.gameMovesCount.set(this.gameHistory.length);

    if (isT1 && !isBook) {
      this.consecutiveT1Count.update(c => c + 1);
    } else {
      this.consecutiveT1Count.set(0);
    }

    if (isOnlyMove && isT1 && !isBook) {
      this.onlyMovesPlayed.update(c => c + 1);
    }

    const t1Count = this.gameHistory.filter(h => h.isT1 || h.isBook).length;
    const t1Pct = Math.round((t1Count / Math.max(1, this.gameHistory.length)) * 100);
    this.runningT1Rate.set(t1Pct);

    const totalCpLoss = this.gameHistory.reduce((sum, h) => sum + (h.isBook ? 0 : h.cpLoss), 0);
    const acpl = totalCpLoss / Math.max(1, this.gameHistory.length);
    this.runningAcpl.set(Math.round(acpl));

    const estCaps = Math.min(99, Math.max(50, Math.round(100 / (1 + Math.pow(acpl / 35, 0.85)))));
    this.estimatedAccuracy.set(estCaps);
  }

  /** Real engine think-time for the tier, clamped safely under time pressure. */
  private computeEngineSearchMs(
    profile: EloProfileConfig,
    pacing: { searchTimeMs: number },
    clockSec?: number | null
  ): number {
    const userFloor = this.engine.searchTimeMs();
    let ms = Math.max(userFloor, profile.engineSearchMs);

    if (clockSec !== undefined && clockSec !== null && clockSec > 0) {
      // Under 60s, never think longer than the safe pacing window.
      if (clockSec <= 60) {
        ms = Math.min(ms, pacing.searchTimeMs);
      }
      // Never spend more than ~7% of the remaining clock on a single move.
      ms = Math.min(ms, Math.max(200, Math.round(clockSec * 1000 * 0.07)));
    }

    return Math.max(300, Math.min(6000, Math.round(ms)));
  }

  private calculateTrimodalPacingDelay(
    fen: string,
    profile: EloProfileConfig,
    baseEngineTime: number,
    clockSec?: number | null
  ): { suggestedDelayMs: number; searchTimeMs: number; category: PacingCategory } {
    // 1. Clock-aware emergency scaling (Anti-Timeout Defense)
    if (clockSec !== undefined && clockSec !== null && clockSec > 0) {
      if (clockSec <= 15) {
        const delay = Math.round(200 + Math.random() * 300);
        return { suggestedDelayMs: delay, searchTimeMs: Math.max(150, Math.round(delay * 0.7)), category: 'scramble' };
      }
      if (clockSec <= 35) {
        const delay = Math.round(400 + Math.random() * 500);
        return { suggestedDelayMs: delay, searchTimeMs: Math.max(250, Math.round(delay * 0.7)), category: 'scramble' };
      }
      if (clockSec <= 60) {
        const delay = Math.round(800 + Math.random() * 800);
        return { suggestedDelayMs: delay, searchTimeMs: Math.max(350, Math.round(delay * 0.7)), category: 'scramble' };
      }
    }

    if (profile.tier === 'max' && !this.autoConcealMove() && !this.humanMode()) {
      return { suggestedDelayMs: 300, searchTimeMs: baseEngineTime, category: 'reflex' };
    }

    // Fast Reflex Detection: single legal move or check
    let legalMovesCount = 20;
    let inCheck = false;
    let isRecapture = false;

    try {
      const chess = new Chess(fen);
      const legalMoves = chess.moves();
      legalMovesCount = legalMoves.length;
      inCheck = chess.inCheck();

      const history = chess.history({ verbose: true });
      if (history.length > 0) {
        const last = history[history.length - 1];
        if (last.captured) {
          isRecapture = true;
        }
      }
    } catch (_) { }

    if (legalMovesCount <= 1) {
      const delay = Math.round(300 + Math.random() * 300);
      return { suggestedDelayMs: delay, searchTimeMs: Math.max(200, Math.round(delay * 0.7)), category: 'reflex' };
    }

    if (inCheck && legalMovesCount <= 3) {
      const delay = Math.round(400 + Math.random() * 500);
      return { suggestedDelayMs: delay, searchTimeMs: Math.max(250, Math.round(delay * 0.7)), category: 'reflex' };
    }

    if (isRecapture) {
      const delay = Math.round(500 + Math.random() * 500);
      return { suggestedDelayMs: delay, searchTimeMs: Math.max(300, Math.round(delay * 0.7)), category: 'reflex' };
    }

    // Standard Intuitive Pacing
    const medianDelay = profile.baseThinkMedianMs;
    const rawDelay = logNormalRandom(medianDelay, 0.3);
    let suggestedDelayMs = Math.max(800, Math.min(4500, Math.round(rawDelay)));

    if (clockSec !== undefined && clockSec !== null && clockSec > 0) {
      suggestedDelayMs = Math.min(suggestedDelayMs, Math.round(clockSec * 1000 * 0.07));
    }

    const searchTimeMs = Math.max(300, Math.min(baseEngineTime, Math.round(suggestedDelayMs * 0.7)));
    return { suggestedDelayMs, searchTimeMs, category: 'intuitive' };
  }

  private selectCalibratedMove(
    moves: EvaluatedMove[],
    fen: string,
    profile: EloProfileConfig
  ): EvaluatedMove {
    if (moves.length === 0) return moves[0];
    if (moves.length === 1 || profile.tier === 'max' || !this.humanMode()) {
      moves[0].selectionReason = 'top';
      moves[0].reasonDescription = 'Best Tactical Move (#1 Engine Line)';
      return moves[0];
    }

    const top = moves[0];
    const topCp = top.scoreCp ?? 0;

    // Checkmate in 1-2 moves
    if (top.scoreMate !== undefined && top.scoreMate > 0 && top.scoreMate <= 2) {
      top.selectionReason = 'top';
      top.reasonDescription = `Forced Mate in ${top.scoreMate}`;
      return top;
    }

    // Recapture
    try {
      const chess = new Chess(fen);
      const history = chess.history({ verbose: true });
      if (history.length > 0) {
        const lastMove = history[history.length - 1];
        if (lastMove.captured && top.san && top.san.includes('x')) {
          if (Math.random() < 0.95) {
            top.selectionReason = 'recapture';
            top.reasonDescription = 'Natural piece recapture';
            return top;
          }
        }
      }
    } catch (_) { }

    const candidates = moves.slice(1);
    const consecutiveT1 = this.consecutiveT1Count();

    let isOnlyMove = false;
    if (candidates.length > 0) {
      const secondCp = candidates[0].scoreCp ?? (topCp - 200);
      const deltaCp = Math.abs(topCp - secondCp);
      isOnlyMove = (deltaCp >= 160);
    }

    let mustForceAlternative = false;

    if (isOnlyMove && this.onlyMovesPlayed() >= profile.maxOnlyMovesPerGame && candidates.length > 0) {
      mustForceAlternative = true;
    }

    if (consecutiveT1 >= profile.maxT1Streak && candidates.length > 0) {
      mustForceAlternative = true;
    }

    const roll = Math.random();
    if ((mustForceAlternative || roll >= profile.baseTopMoveWeight) && candidates.length > 0) {
      const pInacc = profile.baseTopMoveWeight + profile.inaccuracyWeight;

      if (mustForceAlternative || roll < pInacc) {
        for (const cand of candidates) {
          const diff = Math.abs(topCp - (cand.scoreCp ?? 0));
          if (diff >= 20 && diff <= 130) {
            cand.selectionReason = 'inaccuracy';
            cand.reasonDescription = `Candidate alternative (-${(diff / 100).toFixed(2)})`;
            return cand;
          }
        }
        const second = candidates[0];
        second.selectionReason = 'inaccuracy';
        second.reasonDescription = 'Candidate alternative';
        return second;
      }
    }

    top.selectionReason = 'top';
    top.reasonDescription = isOnlyMove ? 'Tactical Only Move' : 'Best Tactical Move (#1 Engine Line)';
    return top;
  }

  private formatMoveResult(result: SinglePvResult): EvaluatedMove {
    let humanScore = '';
    const isBlack = this.sideToMove() === 'b';

    if (result.scoreMate !== undefined) {
      let m = result.scoreMate;
      if (isBlack) m = -m;
      humanScore = m > 0 ? `+M${Math.abs(m)}` : (m < 0 ? `-M${Math.abs(m)}` : '0.00');
    } else if (result.scoreCp !== undefined) {
      let cp = result.scoreCp;
      if (isBlack) cp = -cp;
      const val = cp / 100;
      humanScore = val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2);
    } else {
      humanScore = '0.00';
    }

    return {
      ...result,
      humanScore,
      isSelected: false,
      selectionReason: undefined
    };
  }

  ngOnDestroy() {
    this.clearPacingTimer();
    this.subscriptions.unsubscribe();
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.removeListener(this.messageListener);
    }
  }
}
