/**
 * Pure 100% Class-Only Isolated-World Chess Board Reader
 *
 * Technical Stealth & Zero-Injection Architecture:
 * - ZERO Main-World Script Injection: No <script> tags, eval, or window object modifications
 * - ZERO DOM Mutation / Pollution: Never creates elements, overlays, styles, or attributes in the page DOM
 * - Purely passive class reader: Reads strictly standard CSS class names (.piece, .square-XY, .flipped, .highlight)
 * - Zero Layout Reflows: Never calls getBoundingClientRect() or computed styles
 * - Zero Global Observers: MutationObserver is attached strictly to the board element with attributeFilter: ['class']
 * - Deterministic FEN generation: Constructs full FEN with piece positions, side to move, castling rights, and en-passant
 *
 * Anti-Detection Hardening:
 * - Re-injection guard: prevents duplicate instances via isolated-world marker
 * - Randomized startup delay (1.5–4.5s) to break timing correlation with extension click
 * - Jittered debounce (35–80ms) to prevent timing fingerprinting
 * - Randomized board polling interval (350–600ms) to avoid pattern detection
 * - Idle-aware observer attachment via requestIdleCallback
 * - Obfuscated message keys to prevent interception analysis
 */

(() => {
  // ── Re-injection guard (isolated world only) ───────────────────────────
  const GUARD_KEY = '__qn_session';
  if ((window as any)[GUARD_KEY]) return;
  (window as any)[GUARD_KEY] = true;

  // ── Randomized startup delay ───────────────────────────────────────────
  const startupDelay = 1500 + Math.random() * 3000; // 1.5–4.5 seconds

  const scheduleStart = () => {
    setTimeout(() => initPureClassBoardReader(), startupDelay);
  };

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => scheduleStart(), { timeout: 5000 });
  } else {
    scheduleStart();
  }
})();

function initPureClassBoardReader() {
  let lastEmittedFen = '';
  let observerAttached = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  /** Returns a jittered debounce interval (35–80ms) */
  function jitteredDebounce(): number {
    return 35 + Math.random() * 45;
  }

  function isLichess(): boolean {
    return window.location.hostname.includes('lichess.org');
  }

  /**
   * Locates the chessboard container element purely by tag or selector without mutating the DOM.
   */
  function findBoardElement(): Element | null {
    if (isLichess()) {
      const cgb = document.getElementsByTagName('cg-board');
      if (cgb.length > 0) return cgb[0];
      const wrap = document.getElementsByClassName('cg-wrap');
      if (wrap.length > 0) {
        const b = wrap[0].getElementsByTagName('cg-board');
        if (b.length > 0) return b[0];
      }
      return null;
    }

    // Chess.com board selectors
    const boardSelectors = [
      'wc-chess-board',
      'chess-board',
      '#board-single',
      '#board-layout-main .board',
      '.board-container .board',
      'div.board'
    ];

    for (let i = 0; i < boardSelectors.length; i++) {
      const found = document.querySelectorAll(boardSelectors[i]);
      for (let j = 0; j < found.length; j++) {
        const el = found[j];
        if (el.getElementsByClassName('piece').length > 0) {
          return el;
        }
      }
    }

    // Fallback: locate container via piece class
    const pieces = document.getElementsByClassName('piece');
    if (pieces.length > 0) {
      const p = pieces[0];
      return p.closest('wc-chess-board, chess-board, div.board, #board-layout-main, .board-container') || p.parentElement;
    }

    return null;
  }

  /**
   * Detects board orientation (White vs Black perspective) purely from CSS class names.
   */
  function detectOrientation(boardEl: Element): 'w' | 'b' {
    if (isLichess()) {
      const container = boardEl.closest('cg-container') || boardEl.parentElement;
      if (container && container.classList.contains('orientation-black')) {
        return 'b';
      }
      return 'w';
    }

    // Chess.com flipped class check
    const isFlipped = (
      boardEl.classList.contains('flipped') ||
      boardEl.closest('.flipped') !== null ||
      document.querySelector('.flipped, wc-chess-board.flipped, chess-board.flipped, #board-layout-main.flipped') !== null
    );

    return isFlipped ? 'b' : 'w';
  }

  /**
   * Converts file (0..7) and rank (0..7) indices into algebraic square notation (e.g. e4, g8).
   * Note: rankIndex 0 is rank 8, rankIndex 7 is rank 1.
   */
  function indicesToAlgebraic(fileIdx: number, rankIdx: number): string {
    const fileChar = String.fromCharCode('a'.charCodeAt(0) + fileIdx);
    const rankNum = 8 - rankIdx;
    return `${fileChar}${rankNum}`;
  }

  /**
   * Reads board state and constructs accurate FEN purely from piece CSS classes and highlight classes.
   * NO move-list DOM queries, NO getBoundingClientRect reflows, NO main-world script injection.
   */
  function readBoardState(): { fen: string; myColor: 'w' | 'b'; sideToMove: 'w' | 'b' } | null {
    const boardEl = findBoardElement();
    if (!boardEl) return null;

    const myColor = detectOrientation(boardEl);
    const flipped = (myColor === 'b');
    const grid: (string | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

    // Track highlighted squares (source and destination of the last move)
    const highlightSquares: { file: number; rank: number; algebraic: string }[] = [];

    if (isLichess()) {
      // Lichess piece parsing via class names
      const pieces = boardEl.getElementsByTagName('piece');
      for (let i = 0; i < pieces.length; i++) {
        const el = pieces[i] as HTMLElement;
        const cn = el.className;
        const color = cn.includes('white') ? 'w' : cn.includes('black') ? 'b' : null;
        let type: string | null = null;
        if (cn.includes('pawn')) type = 'p';
        else if (cn.includes('knight')) type = 'n';
        else if (cn.includes('bishop')) type = 'b';
        else if (cn.includes('rook')) type = 'r';
        else if (cn.includes('queen')) type = 'q';
        else if (cn.includes('king')) type = 'k';

        if (!color || !type) continue;
        const pieceChar = color === 'w' ? type.toUpperCase() : type;

        // Parse transform percentage or px without getBoundingClientRect
        const tf = el.style.transform || '';
        const tm = tf.match(/translate\((\d+(?:\.\d+)?)px,\s*(\d+(?:\.\d+)?)px\)/) ||
          tf.match(/translate\((\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/);

        if (tm) {
          const val1 = parseFloat(tm[1]);
          const val2 = parseFloat(tm[2]);
          // Standard 100% or 8-unit relative translation
          let x = tf.includes('%') ? Math.round(val1 / 100) : -1;
          let y = tf.includes('%') ? Math.round(val2 / 100) : -1;

          if (x >= 0 && x < 8 && y >= 0 && y < 8) {
            if (flipped) { x = 7 - x; y = 7 - y; }
            grid[y][x] = pieceChar;
          }
        }
      }

      // Lichess last-move highlight squares
      const lastMoveEls = boardEl.getElementsByClassName('last-move');
      for (let i = 0; i < lastMoveEls.length; i++) {
        const el = lastMoveEls[i] as HTMLElement;
        const tf = el.style.transform || '';
        const tm = tf.match(/translate\((\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/);
        if (tm) {
          let x = Math.round(parseFloat(tm[1]) / 100);
          let y = Math.round(parseFloat(tm[2]) / 100);
          if (flipped) { x = 7 - x; y = 7 - y; }
          if (x >= 0 && x < 8 && y >= 0 && y < 8) {
            highlightSquares.push({ file: x, rank: y, algebraic: indicesToAlgebraic(x, y) });
          }
        }
      }
    } else {
      // Chess.com piece parsing strictly from class names:
      // Piece class: .piece.wp, .piece.bn, etc.
      // Coordinate class: .square-12, .square-58, etc. (1st digit: file 1..8, 2nd digit: rank 1..8)
      const pieces = boardEl.getElementsByClassName('piece');

      for (let i = 0; i < pieces.length; i++) {
        const el = pieces[i] as HTMLElement;
        const cn = el.className;

        // Skip dragging duplicates if present
        if (cn.includes('dragging') && pieces.length > 32) continue;

        const pieceMatch = cn.match(/\b([wb])([pnbrqk])\b/);
        if (!pieceMatch) continue;

        const color = pieceMatch[1];
        const type = pieceMatch[2];
        const pieceChar = color === 'w' ? type.toUpperCase() : type;

        const squareMatch = cn.match(/\bsquare-(\d)(\d)\b/);
        if (squareMatch) {
          const fileIdx = parseInt(squareMatch[1], 10) - 1; // 0..7 (a..h)
          const rankIdx = 8 - parseInt(squareMatch[2], 10); // 0..7 (8..1)

          if (fileIdx >= 0 && fileIdx < 8 && rankIdx >= 0 && rankIdx < 8) {
            grid[rankIdx][fileIdx] = pieceChar;
          }
        }
      }

      // Read highlight classes to detect the last moved square (.highlight.square-XY)
      const highlightEls = boardEl.querySelectorAll('.highlight[class*="square-"]');
      for (let i = 0; i < highlightEls.length; i++) {
        const hMatch = highlightEls[i].className.match(/\bsquare-(\d)(\d)\b/);
        if (hMatch) {
          const fileIdx = parseInt(hMatch[1], 10) - 1;
          const rankIdx = 8 - parseInt(hMatch[2], 10);
          if (fileIdx >= 0 && fileIdx < 8 && rankIdx >= 0 && rankIdx < 8) {
            highlightSquares.push({
              file: fileIdx,
              rank: rankIdx,
              algebraic: indicesToAlgebraic(fileIdx, rankIdx)
            });
          }
        }
      }
    }

    // Build FEN piece placement string (ranks 8 down to 1)
    let placement = '';
    let totalPieces = 0;
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const p = grid[r][c];
        if (p) {
          if (empty > 0) { placement += empty; empty = 0; }
          placement += p;
          totalPieces++;
        } else {
          empty++;
        }
      }
      if (empty > 0) placement += empty;
      if (r < 7) placement += '/';
    }

    // Empty or invalid board check
    if (placement === '8/8/8/8/8/8/8/8' || totalPieces === 0) return null;

    // Detect side to move from highlight squares:
    // One highlight square is the source (empty) and one is the destination (contains the moved piece)
    let sideToMove: 'w' | 'b' = 'w';
    let enPassantSquare = '-';

    if (highlightSquares.length >= 2) {
      let lastMovedPiece: string | null = null;
      let destSq: { file: number; rank: number; algebraic: string } | null = null;
      let srcSq: { file: number; rank: number; algebraic: string } | null = null;

      for (const sq of highlightSquares) {
        const pieceOnSq = grid[sq.rank][sq.file];
        if (pieceOnSq) {
          lastMovedPiece = pieceOnSq;
          destSq = sq;
        } else {
          srcSq = sq;
        }
      }

      if (lastMovedPiece && destSq) {
        const isWhite = (lastMovedPiece === lastMovedPiece.toUpperCase());
        // If White moved last, it is Black's turn to move. If Black moved last, it is White's turn.
        sideToMove = isWhite ? 'b' : 'w';

        // Detect 2-square pawn push for en-passant square calculation
        if (srcSq && (lastMovedPiece === 'P' || lastMovedPiece === 'p')) {
          const rankDiff = Math.abs(destSq.rank - srcSq.rank);
          if (rankDiff === 2 && destSq.file === srcSq.file) {
            const epRank = (destSq.rank + srcSq.rank) / 2;
            enPassantSquare = indicesToAlgebraic(destSq.file, epRank);
          }
        }
      }
    } else {
      // If no highlight squares exist (start of a new game), it is White's turn
      sideToMove = 'w';
    }

    // Determine castling rights based on King & Rook placement
    let castling = '';
    if (grid[7][4] === 'K') {
      if (grid[7][7] === 'R') castling += 'K';
      if (grid[7][0] === 'R') castling += 'Q';
    }
    if (grid[0][4] === 'k') {
      if (grid[0][7] === 'r') castling += 'k';
      if (grid[0][0] === 'r') castling += 'q';
    }
    if (castling === '') castling = '-';

    const finalFen = `${placement} ${sideToMove} ${castling} ${enPassantSquare} 0 1`;

    return { fen: finalFen, myColor, sideToMove };
  }

  /**
   * Emits position update to the side panel if the FEN has changed.
   * Uses obfuscated message keys.
   */
  function emitUpdate() {
    const state = readBoardState();
    if (!state) return;

    if (state.fen === lastEmittedFen) return;
    lastEmittedFen = state.fen;

    try {
      chrome.runtime.sendMessage({
        type: 'pu',
        f: state.fen,
        s: state.sideToMove,
        c: state.myColor
      });
    } catch (_) { }
  }

  function debouncedEmit() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(emitUpdate, jitteredDebounce());
  }

  /**
   * Attaches MutationObserver strictly to the chessboard element.
   * Only listens to class changes and childList mutations (zero document.body / style observation).
   * Uses requestIdleCallback for idle-aware attachment.
   */
  function attachBoardObserver() {
    const boardEl = findBoardElement();
    if (!boardEl || observerAttached) return;

    const doAttach = () => {
      if (observerAttached) return;

      const observer = new MutationObserver(() => {
        debouncedEmit();
      });

      observer.observe(boardEl, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      });

      observerAttached = true;
      emitUpdate();
    };

    // Attach during idle time to avoid synchronous timing correlation
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => doAttach(), { timeout: 2000 });
    } else {
      setTimeout(doAttach, 100 + Math.random() * 200);
    }
  }

  /**
   * Lightweight startup listener waiting for chessboard element.
   * Uses randomized polling interval to avoid pattern detection.
   */
  function waitForBoard() {
    const board = findBoardElement();
    if (board) {
      attachBoardObserver();
      return;
    }

    let checkAttempts = 0;
    const maxAttempts = 25 + Math.floor(Math.random() * 15); // 25–40 attempts

    const scheduleNext = () => {
      checkAttempts++;
      const jitteredInterval = 350 + Math.random() * 250; // 350–600ms
      setTimeout(() => {
        const b = findBoardElement();
        if (b) {
          attachBoardObserver();
        } else if (checkAttempts < maxAttempts) {
          scheduleNext();
        }
      }, jitteredInterval);
    };

    scheduleNext();
  }

  // Handle explicit refresh requests from the extension side panel (obfuscated key)
  try {
    chrome.runtime.onMessage.addListener((message, sender) => {
      if (sender.id !== chrome.runtime.id) return;
      if (message && message.type === 'rp') {
        emitUpdate();
      }
    });
  } catch (_) { }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForBoard);
  } else {
    waitForBoard();
  }
}

