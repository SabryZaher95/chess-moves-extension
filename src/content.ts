import { Chess } from 'chess.js';

/**
 * Pure 100% Class-Only Isolated-World Chess Board Reader
 *
 * Technical Stealth & Anti-Cheat Invisibility:
 * - ZERO Main-World Script Injection: Absolutely NO <script> tags, eval, or window modifications
 * - ZERO DOM Mutation / Pollution: Never creates elements, overlays, styles, or attributes in the page DOM
 * - Purely passive class reader: Only reads standard CSS class names (.piece, .square-XY, .flipped, .highlight)
 * - Move list synchronization: Extracts SAN move history if available, validated via chess.js
 * - Zero Global Observers: MutationObserver is attached strictly to the board element only (no document.body observation)
 * - High-Precision Turn Detection: Uses highlight classes and piece placement to guarantee accurate side-to-move detection
 */

(() => {
  initClassOnlyBoardReader();
})();

function initClassOnlyBoardReader() {
  let lastEmittedStateKey = '';
  let observerAttached = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function isLichess(): boolean {
    return window.location.hostname.includes('lichess.org');
  }

  /**
   * Locates the chessboard container element strictly without mutating the DOM.
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
        if (el.getElementsByClassName('piece').length > 0 || el.querySelector('.piece')) {
          return el;
        }
      }
    }

    // Fallback: locate element via piece class
    const pieces = document.getElementsByClassName('piece');
    if (pieces.length > 0) {
      const p = pieces[0];
      return p.closest('wc-chess-board, chess-board, div.board, #board-layout-main, .board-container') || p.parentElement;
    }

    return null;
  }

  /**
   * Detects board orientation (White vs Black player perspective) purely from CSS classes.
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
      document.querySelector('.flipped, wc-chess-board.flipped, chess-board.flipped, #board-layout-main.flipped, .board-layout-main.flipped') !== null
    );

    return isFlipped ? 'b' : 'w';
  }

  /**
   * Extracts SAN moves from the game's move list in the DOM if present.
   */
  function extractMoveList(): string[] {
    const moves: string[] = [];

    if (isLichess()) {
      const moveElements = document.querySelectorAll('l4x u8t, .rmoves u8t, kwdb u8t');
      for (let i = 0; i < moveElements.length; i++) {
        const txt = moveElements[i].textContent?.trim() || '';
        if (txt && !txt.includes('...') && !/^\d+\.?$/.test(txt)) {
          moves.push(txt);
        }
      }
      return moves;
    }

    // Chess.com move list nodes
    const moveNodes = document.querySelectorAll(
      'wc-move-list .node:not(.node-highlight-gray), .vertical-move-list-component .node, .move-list-move span.node, div.node[data-node], .move-node-component, .move-list-row .move-item, div.move-text, .move-list-rail .node'
    );

    if (moveNodes.length > 0) {
      for (let i = 0; i < moveNodes.length; i++) {
        const el = moveNodes[i];

        // Extract figurine letter if present
        let figurine = '';
        const figEl = el.querySelector('[data-figurine], [class*="chess-"], .icon-font-chess');
        if (figEl) {
          const dataFig = figEl.getAttribute('data-figurine');
          if (dataFig) {
            figurine = dataFig;
          } else {
            const cls = figEl.className || '';
            if (cls.includes('knight')) figurine = 'N';
            else if (cls.includes('bishop')) figurine = 'B';
            else if (cls.includes('rook')) figurine = 'R';
            else if (cls.includes('queen')) figurine = 'Q';
            else if (cls.includes('king')) figurine = 'K';
          }
        }

        let txt = (el.textContent || '').trim();
        if (figurine && !txt.startsWith(figurine) && !txt.startsWith('O-O') && !txt.startsWith('0-0')) {
          txt = figurine + txt;
        }

        txt = txt.replace(/^\d+\.+/, '').trim();
        if (txt && !/^\d+\.?$/.test(txt) && !txt.includes('\u00BD') && !txt.includes('1-0') && !txt.includes('0-1') && txt !== '*') {
          moves.push(txt);
        }
      }
      return moves;
    }

    // Fallback: standard move-list rows
    const moveRows = document.querySelectorAll('.move-list-move');
    for (let i = 0; i < moveRows.length; i++) {
      const spans = moveRows[i].querySelectorAll('span');
      spans.forEach(s => {
        const txt = (s.textContent || '').trim().replace(/^\d+\.+/, '').trim();
        if (txt && !/^\d+\.?$/.test(txt) && !txt.includes('1-0') && !txt.includes('0-1')) {
          moves.push(txt);
        }
      });
    }

    return moves;
  }

  /**
   * Reads board state and constructs accurate FEN purely from piece CSS classes and highlight classes.
   */
  function readBoardState(): { fen: string; myColor: 'w' | 'b'; sideToMove: 'w' | 'b'; sanMoves: string[] } | null {
    const boardEl = findBoardElement();
    if (!boardEl) return null;

    const myColor = detectOrientation(boardEl);
    const flipped = (myColor === 'b');
    const grid: (string | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

    // Track highlight squares to determine the last move and side to move
    const highlightSquares: { file: number; rank: number }[] = [];

    if (isLichess()) {
      // Lichess piece parsing via class name & translate styles
      const boardRect = boardEl.getBoundingClientRect();
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
        const ch = color === 'w' ? type.toUpperCase() : type;

        const tf = el.style.transform;
        const tm = tf.match(/translate\((\d+(?:\.\d+)?)px,\s*(\d+(?:\.\d+)?)px\)/);
        if (tm && boardRect.width > 0) {
          const sqW = boardRect.width / 8;
          const sqH = boardRect.height / 8;
          let x = Math.round(parseFloat(tm[1]) / sqW);
          let y = Math.round(parseFloat(tm[2]) / sqH);
          if (flipped) { x = 7 - x; y = 7 - y; }
          if (x >= 0 && x < 8 && y >= 0 && y < 8) {
            grid[y][x] = ch;
          }
        }
      }
    } else {
      // Chess.com piece parsing purely from class names:
      // Piece type/color: .piece.wp, .piece.bn, etc.
      // Square coordinates: .square-12, .square-58, etc.
      const pieces = boardEl.getElementsByClassName('piece').length > 0
        ? boardEl.getElementsByClassName('piece')
        : document.getElementsByClassName('piece');

      for (let i = 0; i < pieces.length; i++) {
        const el = pieces[i] as HTMLElement;
        const cn = el.className;

        // Skip ghost/dragging artifacts
        if (cn.includes('dragging') && pieces.length > 32) continue;

        const pieceMatch = cn.match(/\b([wb])([pnbrqk])\b/);
        if (!pieceMatch) continue;

        const color = pieceMatch[1];
        const type = pieceMatch[2];
        const pieceChar = color === 'w' ? type.toUpperCase() : type;

        let fileIdx = -1; // 0..7 (a..h)
        let rankIdx = -1; // 0..7 (8..1)

        const squareMatch = cn.match(/\bsquare-(\d)(\d)\b/);
        if (squareMatch) {
          fileIdx = parseInt(squareMatch[1], 10) - 1;
          rankIdx = 8 - parseInt(squareMatch[2], 10);
        } else {
          // Fallback to CSS transform percentages if class square is missing
          const tf = el.style.transform;
          const tm = tf.match(/translate\((\d+(?:\.\d+)?)%?,\s*(\d+(?:\.\d+)?)%?\)/);
          if (tm) {
            let x = Math.round(parseFloat(tm[1]) / 100);
            let y = Math.round(parseFloat(tm[2]) / 100);
            if (flipped) { x = 7 - x; y = 7 - y; }
            fileIdx = x;
            rankIdx = y;
          }
        }

        if (fileIdx >= 0 && fileIdx < 8 && rankIdx >= 0 && rankIdx < 8) {
          grid[rankIdx][fileIdx] = pieceChar;
        }
      }

      // Read highlight classes to detect the last moved square
      const highlightEls = boardEl.querySelectorAll('.highlight[class*="square-"]');
      for (let i = 0; i < highlightEls.length; i++) {
        const hMatch = highlightEls[i].className.match(/\bsquare-(\d)(\d)\b/);
        if (hMatch) {
          highlightSquares.push({
            file: parseInt(hMatch[1], 10) - 1,
            rank: 8 - parseInt(hMatch[2], 10)
          });
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

    // Empty board check
    if (placement === '8/8/8/8/8/8/8/8' || totalPieces === 0) return null;

    const sanMoves = extractMoveList();

    // Detect side to move:
    let sideToMove: 'w' | 'b' = 'w';
    let turnDetected = false;

    if (sanMoves.length > 0) {
      sideToMove = (sanMoves.length % 2 === 0) ? 'w' : 'b';
      turnDetected = true;
    } else if (highlightSquares.length >= 2) {
      for (const sq of highlightSquares) {
        const pieceOnSq = grid[sq.rank][sq.file];
        if (pieceOnSq) {
          const isWhitePiece = (pieceOnSq === pieceOnSq.toUpperCase());
          sideToMove = isWhitePiece ? 'b' : 'w';
          turnDetected = true;
          break;
        }
      }
    }

    if (!turnDetected) {
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

    let finalFen = `${placement} ${sideToMove} ${castling} - 0 1`;

    // If move list is clean, replay with chess.js for exact FEN (with en passant and exact clocks)
    if (sanMoves.length > 0) {
      try {
        const replay = new Chess();
        for (const m of sanMoves) {
          replay.move(m);
        }
        finalFen = replay.fen();
        sideToMove = replay.turn();
      } catch (_) {
        // Fallback to visual FEN
      }
    }

    return { fen: finalFen, myColor, sideToMove, sanMoves };
  }

  /**
   * Emits position update to the side panel if the state has changed.
   */
  function emitUpdate() {
    const state = readBoardState();
    if (!state) return;

    const stateKey = `${state.fen}|${state.myColor}|${state.sideToMove}|${state.sanMoves.length}`;
    if (stateKey === lastEmittedStateKey) return;
    lastEmittedStateKey = stateKey;

    try {
      chrome.runtime.sendMessage({
        type: 'POSITION_UPDATE',
        fen: state.fen,
        sanMoves: state.sanMoves,
        sideToMove: state.sideToMove,
        myColor: state.myColor
      });
    } catch (_) {}
  }

  function debouncedEmit() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(emitUpdate, 80);
  }

  /**
   * Attaches MutationObserver ONLY to the chessboard element.
   */
  function attachBoardObserver() {
    const boardEl = findBoardElement();
    if (!boardEl || observerAttached) return;

    const observer = new MutationObserver(() => {
      debouncedEmit();
    });

    observer.observe(boardEl, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'transform']
    });

    const moveList = document.querySelector(
      'wc-move-list, .vertical-move-list-component, l4x, .rmoves, .move-list-container'
    );
    if (moveList) {
      observer.observe(moveList, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    observerAttached = true;
    emitUpdate();
  }

  /**
   * Lightweight startup listener waiting for chessboard element.
   */
  function waitForBoard() {
    const board = findBoardElement();
    if (board) {
      attachBoardObserver();
      return;
    }

    let checkAttempts = 0;
    const interval = setInterval(() => {
      checkAttempts++;
      const b = findBoardElement();
      if (b) {
        clearInterval(interval);
        attachBoardObserver();
      } else if (checkAttempts > 30) {
        clearInterval(interval);
      }
    }, 500);
  }

  // Handle explicit refresh requests from side panel
  try {
    chrome.runtime.onMessage.addListener((message, sender) => {
      if (sender.id !== chrome.runtime.id) return;
      if (message && message.type === 'REQUEST_POSITION') {
        emitUpdate();
      }
    });
  } catch (_) {}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForBoard);
  } else {
    waitForBoard();
  }
}
