# Tab Notes - Security & Anti-Detection Architecture

This extension operates locally without transmitting game or user data to external servers. It incorporates **100% isolated-world technical stealth**, **pure class-only passive DOM reading**, **zero DOM/script injection**, **master opening theory**, **deep multi-PV engine calculation**, and **peripheral hands-free operation** to eliminate automated detection vectors on Chess.com and Lichess.

---

## 1. Client-Side Technical Invisibility & Pure Class Reader

### 100% Pure Isolated-World Execution (Zero Main-World Injection)
- **Zero Main-World Script Injection**: The extension runs strictly inside Chrome's Isolated World. It does **NOT** inject `<script>` tags, eval statements, or window modifications in the page's main world context.
- **Zero Prototype Monkey-Patching**: Never overrides `EventTarget.prototype.addEventListener`, `fetch`, `WebSocket`, or `document.hasFocus` / `document.hidden`.
- **Zero DOM Pollution**: The content script never injects buttons, visual overlay elements, styles, or custom attributes into the chessboard DOM.
- **Zero Layout Reflows**: Never calls `getBoundingClientRect()`, computed styles, or properties that force synchronous browser layout calculation.
- **Strict Class-Only Reader**:
  - Reads board orientation solely from `flipped` or `orientation-black` CSS class names.
  - Reads piece type, color, and board coordinates solely from piece element classes (`.piece.wp.square-52`, `.piece.bn.square-21`, etc.).
  - Reads last moves and turn (`'w'` vs `'b'`) from highlight classes (`.highlight.square-XY`).
  - Observer is targeted strictly on the chessboard element with `attributeFilter: ['class']` and `childList: true` — **never observing `document.body` or move-list nodes**.

### Multi-Game SPA Session Isolation (Rematch & Next Game Protection)
- **Automatic Game Boundary Detection**: Detects game resets in single-page applications when move counts reset, a rematch begins, or the starting board FEN is detected.
- **Clean State Cleansing**: Resets move histories, streak counters, and session trackers on every new match.

---

## 2. Maximum Strength Engine & Multi-PV Analysis

- **Full Engine Strength**: Calculates the #1 Best Move using Lozza at full tactical depth (depth 24+) with a 128MB/256MB transposition hash table.
- **Multi-PV Candidate Lines**: Evaluates and displays the Top 4 candidate engine lines with evaluations, centipawn scores, and mate distances.
- **Master Opening Book**: Features comprehensive opening theory coverage with ECO codes and named variations to guarantee grandmaster opening play.

---

## 3. Peripheral Hands-Free HUD & Operational Security

### Zero-Touch Hands-Free Operation
- **Ambient Peripheral View**: Extra-large, high-contrast SAN move text (`Nf6`) and coordinate arrows (`g8 → f6`) easily legible in peripheral vision without looking directly or moving the mouse.
- **Audio Pacing Chime**: Subtle Web Audio API chime signals when the natural think time has elapsed, so you never have to click or touch the side panel during live games.
- **Focus Telemetry Protection**: Eliminates `window.blur` and `visibilitychange` flags on Chess.com by keeping interaction zero-touch.

### Essential Operational Security Rules
1. **Never Click or Focus Outside the Chess Tab**: Keep your mouse cursor naturally moving over the chessboard.
2. **Use Natural Human Pacing**: Avoid playing instant 0.1s tactical moves on complex turns. Move your mouse across the board naturally before clicking.
