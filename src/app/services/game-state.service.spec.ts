import { TestBed } from '@angular/core/testing';
import { GameStateService } from './game-state.service';
import { LozzaEngineService, MultiPvResult } from './lozza-engine.service';
import { signal, WritableSignal } from '@angular/core';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('GameStateService', () => {
  let service: GameStateService;
  let mockEngine: {
    getBestMoves: ReturnType<typeof vi.fn>;
    stopSearch: ReturnType<typeof vi.fn>;
    newGame: ReturnType<typeof vi.fn>;
    isSearching: WritableSignal<boolean>;
    searchTimeMs: WritableSignal<number>;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    const isSearchingSignal = signal(false);
    mockEngine = {
      getBestMoves: vi.fn(),
      stopSearch: vi.fn(),
      newGame: vi.fn(),
      isSearching: isSearchingSignal,
      searchTimeMs: signal(1000)
    };

    (window as any).chrome = {
      runtime: {
        onMessage: {
          addListener: vi.fn(),
          removeListener: vi.fn()
        },
        connect: vi.fn()
      }
    };

    TestBed.configureTestingModule({
      providers: [
        GameStateService,
        { provide: LozzaEngineService, useValue: mockEngine }
      ]
    });
    service = TestBed.inject(GameStateService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should immediately select opening book move for known opening positions', async () => {
    const handleMessage = (service as any).handleMessage.bind(service);

    // Initial position in book
    handleMessage({
      type: 'pu',
      f: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      m: []
    });

    await vi.advanceTimersByTimeAsync(200); // debounce

    expect(service.isBookPosition()).toBe(true);
    expect(service.currentOpening()).toBeTruthy();
    expect(service.selectedMove()).toBeTruthy();
    expect(service.selectedMove()?.selectionReason).toBe('book');
    expect(mockEngine.getBestMoves).not.toHaveBeenCalled();
  });

  it('should handle deep master opening book lines (e.g. Sicilian Najdorf English Attack)', async () => {
    const handleMessage = (service as any).handleMessage.bind(service);

    handleMessage({
      type: 'pu',
      f: 'r1bqkb1r/1p2pppp/p1np1n2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 1 6',
      m: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be3']
    });

    await vi.advanceTimersByTimeAsync(200);

    expect(service.isBookPosition()).toBe(true);
    expect(service.currentOpening()?.name).toContain('Najdorf');
    expect(service.selectedMove()).toBeTruthy();
    expect(service.selectedMove()?.selectionReason).toBe('book');
  });

  it('should trigger engine search with multi-PV and calculate top tactical move when out of book', async () => {
    mockEngine.getBestMoves.mockReturnValue(
      Promise.resolve({
        lines: [
          { bestMove: 'd4d5', san: 'd5', pvIndex: 1, scoreCp: 50 },
          { bestMove: 'c4c5', san: 'c5', pvIndex: 2, scoreCp: 30 }
        ]
      } as MultiPvResult)
    );

    const handleMessage = (service as any).handleMessage.bind(service);

    // Deep non-book position
    const nonBookFen = '8/5pk1/4p1p1/3pP2p/3P3P/5KP1/5P2/8 w - - 0 45';
    handleMessage({
      type: 'pu',
      f: nonBookFen,
      m: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'a6', 'Nxc6']
    });

    await vi.advanceTimersByTimeAsync(200);

    expect(mockEngine.getBestMoves).toHaveBeenCalledTimes(1);
    expect(mockEngine.getBestMoves).toHaveBeenCalledWith(
      nonBookFen,
      expect.objectContaining({ multipv: 4 })
    );

    expect(service.selectedMove()).toBeTruthy();
    expect(service.selectedMove()?.bestMove).toBe('d4d5');
    expect(service.selectedMove()?.selectionReason).toBe('top');
  });

  it('should handle Move Concealment (Delayed Reveal) when enabled and reveal after pacing countdown', async () => {
    mockEngine.getBestMoves.mockReturnValue(
      Promise.resolve({
        lines: [{ bestMove: 'd4d5', san: 'd5', pvIndex: 1, scoreCp: 20 }]
      } as MultiPvResult)
    );

    service.selectedElo.set('1400');
    service.autoConcealMove.set(true);

    const handleMessage = (service as any).handleMessage.bind(service);
    handleMessage({
      type: 'pu',
      f: '8/5pk1/4p1p1/3pP2p/3P3P/5KP1/5P2/8 w - - 0 45',
      m: ['e4', 'e5', 'Nf3', 'Nc6', 'd4']
    });

    await vi.advanceTimersByTimeAsync(200); // debounce & search resolution

    // Move is initially concealed while pacing timer runs
    expect(service.selectedMove()).toBeTruthy();
    expect(service.autoConcealMove()).toBe(true);

    // Advance through the pacing countdown
    await vi.advanceTimersByTimeAsync(15000);

    // Move is revealed when timer finishes
    expect(service.isMoveRevealed()).toBe(true);
    expect(service.isPacingSafe()).toBe(true);
  });

  it('should allow revealing move early on manual override', async () => {
    mockEngine.getBestMoves.mockReturnValue(
      Promise.resolve({
        lines: [{ bestMove: 'd4d5', san: 'd5', pvIndex: 1, scoreCp: 20 }]
      } as MultiPvResult)
    );

    service.selectedElo.set('1400');
    service.autoConcealMove.set(true);

    const handleMessage = (service as any).handleMessage.bind(service);
    handleMessage({
      type: 'pu',
      f: '8/5pk1/4p1p1/3pP2p/3P3P/5KP1/5P2/8 w - - 0 45',
      m: ['e4', 'e5', 'Nf3']
    });

    await vi.advanceTimersByTimeAsync(200);

    expect(service.isMoveRevealed()).toBe(false);

    service.revealMoveEarly();
    expect(service.isMoveRevealed()).toBe(true);
    expect(service.isPacingSafe()).toBe(true);
  });

  it('should enforce T1 streak limiter when human mode is active and streak limit is reached', async () => {
    mockEngine.getBestMoves.mockReturnValue(
      Promise.resolve({
        lines: [
          { bestMove: 'd4d5', san: 'd5', pvIndex: 1, scoreCp: 50 },
          { bestMove: 'c4c5', san: 'c5', pvIndex: 2, scoreCp: 20 }
        ]
      } as MultiPvResult)
    );

    service.selectedElo.set('1400'); // maxT1Streak = 2
    service.humanMode.set(true);
    service.consecutiveT1Count.set(2); // Streak limit reached

    const handleMessage = (service as any).handleMessage.bind(service);
    handleMessage({
      type: 'pu',
      f: '8/5pk1/4p1p1/3pP2p/3P3P/5KP1/5P2/8 w - - 0 45',
      m: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'a6', 'Nxc6']
    });

    await vi.advanceTimersByTimeAsync(200);

    const selected = service.selectedMove();
    expect(selected).toBeTruthy();
    // In human mode, streak limit forces a candidate alternative
    expect(selected?.selectionReason).toBe('inaccuracy');
  });

  it('should scale down think delay under low clock time (anti-timeout defense)', async () => {
    mockEngine.getBestMoves.mockReturnValue(
      Promise.resolve({
        lines: [{ bestMove: 'd4d5', san: 'd5', pvIndex: 1, scoreCp: 20 }]
      } as MultiPvResult)
    );

    const handleMessage = (service as any).handleMessage.bind(service);

    // Severe time pressure (10s remaining)
    handleMessage({
      type: 'pu',
      f: '8/5pk1/4p1p1/3pP2p/3P3P/5KP1/5P2/8 w - - 0 45',
      m: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'],
      t1: 10
    });

    await vi.advanceTimersByTimeAsync(200);

    // Pacing delay under extreme time trouble should be <= 1.5s and category 'scramble'
    expect(service.suggestedDelaySec()).toBeLessThanOrEqual(1.5);
    expect(service.pacingCategory()).toBe('scramble');
  });

  it('should automatically isolate and reset state on new SPA game session', async () => {
    mockEngine.getBestMoves.mockReturnValue(
      Promise.resolve({
        lines: [{ bestMove: 'e2e4', san: 'e4', pvIndex: 1, scoreCp: 20 }]
      } as MultiPvResult)
    );

    const handleMessage = (service as any).handleMessage.bind(service);

    // End of game 1 (40 moves played)
    handleMessage({
      type: 'pu',
      f: '8/5pk1/4p1p1/3pP2p/3P3P/5KP1/5P2/8 w - - 0 45',
      m: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'a6', 'Nxc6']
    });
    await vi.advanceTimersByTimeAsync(200);
    expect(service.gameMovesCount()).toBeGreaterThan(0);

    // New Game 2 starts in SPA (moves count drops back to 0)
    handleMessage({
      type: 'pu',
      f: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      m: []
    });
    await vi.advanceTimersByTimeAsync(200);

    // Session state should be cleanly isolated and reset
    expect(service.gameMovesCount()).toBe(1); // Book move 1
    expect(service.consecutiveT1Count()).toBe(0);
    expect(service.onlyMovesPlayed()).toBe(0);
  });

  it('should enforce Only-Move budget when human mode is active and computer moves exceed limit', async () => {
    mockEngine.getBestMoves.mockReturnValue(
      Promise.resolve({
        lines: [
          { bestMove: 'd4d5', san: 'd5', pvIndex: 1, scoreCp: 450 }, // Super-human only move
          { bestMove: 'c4c5', san: 'c5', pvIndex: 2, scoreCp: 50 }   // Delta = 400cp
        ]
      } as MultiPvResult)
    );

    service.selectedElo.set('800'); // maxOnlyMovesPerGame = 1
    service.humanMode.set(true);
    service.onlyMovesPlayed.set(1); // Budget already exhausted

    const handleMessage = (service as any).handleMessage.bind(service);
    handleMessage({
      type: 'pu',
      f: '8/5pk1/4p1p1/3pP2p/3P3P/5KP1/5P2/8 w - - 0 45',
      m: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'a6', 'Nxc6']
    });

    await vi.advanceTimersByTimeAsync(200);

    const selected = service.selectedMove();
    expect(selected).toBeTruthy();
    // Exceeded only-move budget in human mode forces an alternative
    expect(selected?.selectionReason).not.toBe('top');
  });

  it('should clear state on CLEAR_STATE message', async () => {
    mockEngine.isSearching.set(true);

    const handleMessage = (service as any).handleMessage.bind(service);
    handleMessage({ type: 'pu', f: '8/5pk1/4p1p1/3pP2p/3P3P/5KP1/5P2/8 w - - 0 45' });
    await vi.advanceTimersByTimeAsync(200);

    expect(service.connectionStatus()).toBe('connected');

    handleMessage({ type: 'cs' });

    expect(service.connectionStatus()).toBe('no-game');
    expect(service.currentFen()).toBeNull();
    expect(service.sideToMove()).toBeNull();
    expect(service.selectedMove()).toBeNull();
    expect(service.gameMovesCount()).toBe(0);
    expect(mockEngine.stopSearch).toHaveBeenCalled();
  });

  it('should validate FEN, clock, color, and sanMoves on inbound messages', () => {
    const valid = (service as any).isValidPositionMessage.bind(service);
    const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    expect(valid({ f: startFen })).toBe(true);
    expect(valid({ f: startFen, c: 'b', t1: 30, m: ['e4'] })).toBe(true);

    expect(valid({ f: 'not-a-fen' })).toBe(false);
    expect(valid({ f: 42 })).toBe(false);
    expect(valid({})).toBe(false);
    expect(valid({ f: startFen, t1: -5 })).toBe(false);
    expect(valid({ f: startFen, t2: Infinity })).toBe(false);
    expect(valid({ f: startFen, c: 'z' })).toBe(false);
    expect(valid({ f: startFen, m: 'e4' })).toBe(false);
    expect(valid({ f: startFen, m: ['e4', 5] })).toBe(false);
  });

  it('should ignore POSITION_UPDATE messages with an invalid FEN', async () => {
    const handleMessage = (service as any).handleMessage.bind(service);
    handleMessage({ type: 'pu', f: 'totally-invalid', m: [] });
    await vi.advanceTimersByTimeAsync(200);

    expect(mockEngine.getBestMoves).not.toHaveBeenCalled();
    expect(service.connectionStatus()).toBe('no-game');
  });

  it('should rate-limit a flood of inbound messages', () => {
    const isRateLimited = (service as any).isRateLimited.bind(service);
    let blockedAt = -1;
    for (let i = 0; i < 60; i++) {
      if (isRateLimited()) { blockedAt = i; break; }
    }
    expect(blockedAt).toBeGreaterThanOrEqual(40);
  });
});
