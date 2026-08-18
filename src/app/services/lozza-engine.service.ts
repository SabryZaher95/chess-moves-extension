import { Injectable, signal } from '@angular/core';
import { Chess } from 'chess.js';

export interface SearchParams {
  depth?: number;
  movetimeMs?: number;
  multipv?: number;
}

export interface SinglePvResult {
  bestMove: string;
  san?: string;
  ponderMove?: string;
  scoreCp?: number;
  scoreMate?: number;
  depthReached?: number;
  pvIndex: number; // 1-based: 1 = best line, 2 = second best, etc.
}

export interface MultiPvResult {
  lines: SinglePvResult[];
}

@Injectable({
  providedIn: 'root'
})
export class LozzaEngineService {
  private worker!: Worker;
  private workerReady = false;
  private currentResolver: ((result: MultiPvResult) => void) | null = null;
  private currentRejector: ((reason: any) => void) | null = null;
  private pvResults: Map<number, Partial<SinglePvResult>> = new Map();
  private requestedMultiPv = 1;
  private searchTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private readyPromise: Promise<void> | null = null;
  private readyResolver: (() => void) | null = null;
  private readyRejector: ((reason: any) => void) | null = null;

  readonly isSearching = signal<boolean>(false);
  readonly searchTimeMs = signal<number>(1000);
  readonly searchDepth = signal<number>(10);

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    this.readyPromise = new Promise((resolve, reject) => {
      this.readyResolver = resolve;
      this.readyRejector = reject;
    });

    try {
      const workerUrl = chrome.runtime.getURL('sidepanel/assets/lozza.js');
      this.worker = new Worker(workerUrl);
      this.worker.onerror = (error) => {
        if (this.readyRejector) {
          this.readyRejector(error);
        }
      };
      this.worker.onmessage = this.handleMessage.bind(this);
      this.worker.postMessage('uci');
    } catch (err) {
      if (this.readyRejector) {
        this.readyRejector(err);
      }
    }
  }

  private handleMessage(event: MessageEvent) {
    const line = (event.data as string).trim();

    if (line === 'uciok') {
      this.workerReady = true;
      if (this.readyResolver) {
        this.readyResolver();
      }
      // Larger transposition table -> deeper search in the same time budget.
      this.worker.postMessage('setoption name Hash value 128');
      this.worker.postMessage('ucinewgame');
    } else if (line.startsWith('info ')) {
      this.parseInfoLine(line);
    } else if (line.startsWith('bestmove ')) {
      this.parseBestMoveLine(line);
    }
  }

  private parseInfoLine(line: string) {
    const parts = line.split(' ');

    // Determine which PV line this info belongs to
    let pvIndex = 1;
    const multipvIdx = parts.indexOf('multipv');
    if (multipvIdx !== -1 && multipvIdx < parts.length - 1) {
      pvIndex = parseInt(parts[multipvIdx + 1], 10);
    }

    // Get or create the result for this PV
    if (!this.pvResults.has(pvIndex)) {
      this.pvResults.set(pvIndex, { pvIndex });
    }
    const result = this.pvResults.get(pvIndex)!;

    const depthIndex = parts.indexOf('depth');
    if (depthIndex !== -1 && depthIndex < parts.length - 1) {
      result.depthReached = parseInt(parts[depthIndex + 1], 10);
    }

    const scoreIndex = parts.indexOf('score');
    if (scoreIndex !== -1 && scoreIndex < parts.length - 2) {
      const scoreType = parts[scoreIndex + 1];
      const scoreValue = parseInt(parts[scoreIndex + 2], 10);
      if (scoreType === 'cp') {
        result.scoreCp = scoreValue;
        result.scoreMate = undefined;
      } else if (scoreType === 'mate') {
        result.scoreMate = scoreValue;
        result.scoreCp = undefined;
      }
    }

    // Extract the first move from the PV line for this variation
    const pvLineIdx = parts.indexOf('pv');
    if (pvLineIdx !== -1 && pvLineIdx < parts.length - 1) {
      result.bestMove = parts[pvLineIdx + 1];
    }
  }

  private parseBestMoveLine(line: string) {
    const parts = line.split(' ');
    const bestMove = parts[1];
    let ponderMove: string | undefined;

    if (parts.length > 3 && parts[2] === 'ponder') {
      ponderMove = parts[3];
    }

    // Ensure PV1 has the bestmove
    if (!this.pvResults.has(1)) {
      this.pvResults.set(1, { pvIndex: 1 });
    }
    const pv1 = this.pvResults.get(1)!;
    pv1.bestMove = bestMove;
    pv1.ponderMove = ponderMove;

    if (this.currentResolver) {
      // Collect all PV lines into the result
      const lines: SinglePvResult[] = [];
      for (let i = 1; i <= this.requestedMultiPv; i++) {
        const pv = this.pvResults.get(i);
        if (pv && pv.bestMove) {
          lines.push(pv as SinglePvResult);
        }
      }

      // Sort by pvIndex (should already be in order)
      lines.sort((a, b) => a.pvIndex - b.pvIndex);

      this.currentResolver({ lines });
      this.cleanupSearch();
    }
  }

  private cleanupSearch() {
    if (this.searchTimeoutId !== null) {
      clearTimeout(this.searchTimeoutId);
      this.searchTimeoutId = null;
    }
    this.currentResolver = null;
    this.currentRejector = null;
    this.pvResults = new Map();
    this.isSearching.set(false);
  }

  private recreateWorker() {
    this.workerReady = false;
    if (this.worker) {
      this.worker.terminate();
    }
    this.initWorker();
  }

  async getBestMoves(fen: string, searchParams?: SearchParams): Promise<MultiPvResult> {
    if (!this.workerReady) {
      if (!this.readyPromise) {
        throw new Error('Worker failed to initialize');
      }
      await this.readyPromise;
    }

    if (this.isSearching()) {
      throw new Error('Already searching');
    }

    this.isSearching.set(true);
    this.pvResults = new Map();
    this.requestedMultiPv = searchParams?.multipv || 1;

    return new Promise<MultiPvResult>((resolve, reject) => {
      this.currentRejector = reject;

      // Timeout guard
      const timeoutMs = (searchParams?.movetimeMs || this.searchTimeMs()) + 4000;
      this.searchTimeoutId = setTimeout(() => {
        if (this.currentRejector) {
          this.currentRejector(new Error('Search timed out'));
          this.cleanupSearch();
          this.recreateWorker();
        }
      }, timeoutMs);

      // Wrapper to clear timeout and convert moves to SAN
      this.currentResolver = (result: MultiPvResult) => {
        if (this.searchTimeoutId !== null) {
          clearTimeout(this.searchTimeoutId);
          this.searchTimeoutId = null;
        }

        // Convert all moves to SAN
        for (const line of result.lines) {
          if (line.bestMove && line.bestMove !== '(none)' && line.bestMove.toLowerCase() !== 'null') {
            try {
              const chess = new Chess(fen);
              const from = line.bestMove.substring(0, 2);
              const to = line.bestMove.substring(2, 4);
              const promotion = line.bestMove.length > 4 ? line.bestMove[4] : undefined;
              const moveObj = chess.move({ from, to, promotion });
              if (moveObj) {
                line.san = moveObj.san;
              }
            } catch (_) {
              // Conversion failed — leave SAN undefined
            }
          } else {
            line.san = 'End';
          }
        }

        resolve(result);
      };

      // Set MultiPV
      if (this.requestedMultiPv > 1) {
        this.worker.postMessage(`setoption name MultiPV value ${this.requestedMultiPv}`);
      }

      this.worker.postMessage(`position fen ${fen}`);

      const movetime = searchParams?.movetimeMs || this.searchTimeMs();
      if (searchParams?.depth && searchParams?.movetimeMs) {
        // Depth caps the search; movetime bounds the time. Lozza honors whichever hits first.
        this.worker.postMessage(`go depth ${searchParams.depth} movetime ${movetime}`);
      } else if (searchParams?.depth) {
        this.worker.postMessage(`go depth ${searchParams.depth}`);
      } else {
        this.worker.postMessage(`go movetime ${movetime}`);
      }
    });
  }

  newGame() {
    if (this.workerReady) {
      this.worker.postMessage('ucinewgame');
    }
  }

  stopSearch() {
    if (this.workerReady && this.isSearching()) {
      this.worker.postMessage('stop');
    }
  }
}
