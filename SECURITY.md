# Tab Notes - Security & Anti-Detection Architecture

This extension operates locally without transmitting game or user data to external servers. It incorporates **100% isolated-world technical stealth**, **pure class-only passive DOM reading**, **zero DOM/script injection**, **master opening theory**, **deep multi-PV engine calculation**, **Ken Regan Only-Move budgeting**, and **trimodal human move pacing** to eliminate automated FairPlay detection vectors on Chess.com and Lichess.

---

## 1. Client-Side Technical Invisibility & Pure Class Reader

### 100% Pure Isolated-World Execution (Zero Main-World Injection)
- **Zero Main-World Script Injection**: The extension runs strictly inside Chrome's Isolated World. It does **NOT** inject `<script>` tags, eval statements, or window modifications in the page's main world context.
- **Zero Prototype Monkey-Patching**: Never overrides `EventTarget.prototype.addEventListener`, `fetch`, `WebSocket`, or `document.hasFocus` / `document.hidden`.
- **Zero DOM Pollution**: The content script never injects buttons, visual overlay elements, styles, or custom attributes into the chessboard DOM.
- **Strict Class-Only Reader**:
  - Reads board orientation solely from `flipped` class names.
  - Reads piece type, color, and board coordinates solely from piece element classes (`.piece.wp.square-52`, `.piece.bn.square-21`, etc.).
  - Reads last moves and turn (`'w'` vs `'b'`) from highlight classes (`.highlight.square-XY`).
  - Observer is targeted strictly on the chessboard element with `attributeFilter: ['class', 'style']` — **never observing `document.body`**.

### Multi-Game SPA Session Isolation (Rematch & Next Game Protection)
- **Automatic Game Boundary Detection**: Detects game resets in single-page applications when move counts reset, a rematch begins, or the starting board FEN is detected.
- **Clean State Cleansing**: Resets move histories, streak counters, ACPL trackers, and Only-Move budgets on every new match to prevent statistical cross-game leakage.

---

## 2. Server-Side Statistical Anti-Detection & High-Strength Engine

Online chess platforms detect assistance primarily through **server-side statistical analysis** (CAPS scores, centipawn loss profiles, time-series distributions, and Ken Regan engine correlation models).

### High-Depth Multi-PV Engine Analysis
- **Full Engine Strength**: Calculates the #1 Best Move using Lozza at full tactical depth without artificial depth restrictions.
- **Multi-PV Candidate Lines**: Evaluates and displays the Top 4 candidate engine lines with evaluations, centipawn scores, and mate distances.
- **Master Opening Book**: Features comprehensive opening theory coverage with ECO codes and named variations to guarantee grandmaster opening play.

### Calibrated Rating Profiles

| Elo Tier | Target Accuracy | Target T1 Rate | Max T1 Streak | Max Only Moves | Inaccuracy Rate | Mistake Rate | Blunder Rate | Play Style |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Max - Engine** | 99%+ | 100% | Unlimited | Unlimited | 0% | 0% | 0% | Pure #1 Best Move UCI engine calculation (3000+) |
| **2300 - Master** | ~94–96% | ~86% | 5 | 8 | ~10% | ~4% | 0% | Grandmaster-level consistency |
| **2000 - Expert** | ~90–94% | ~78% | 4 | 6 | ~16% | ~6% | 0% | High precision, master candidate selection |
| **1700 - Advanced** | ~84–90% | ~68% | 3 | 4 | ~22% | ~9% | ~1% | Strong positional play, low blunder rate |
| **1400 - Intermediate**| ~76–83% | ~54% | 2 | 3 | ~30% | ~14% | ~4% | Solid opening/tactics, human positional mistakes |
| **1100 - Casual** | ~68–75% | ~42% | 2 | 2 | ~36% | ~18% | ~6% | Natural play, occasional tactical misses |
| **800 - Beginner** | ~58–66% | ~32% | 2 | 1 | ~40% | ~20% | ~10% | Frequent tactical oversights, simple development |

---

## 3. Trimodal Human Move-Timing Architecture

Real humans do not play with flat, uniform think times:

1. **Reflex Tier (0.3s – 0.8s)**: Single legal moves, forced checks, piece recaptures, and master opening lines.
2. **Intuitive Tier (1.0s – 3.8s)**: Standard piece development, castling, and quiet positional maneuvers.
3. **Time Scramble Emergency Clamping**: Never exceeds 6–8% of the remaining game clock to prevent timeout flags.

---

## 4. Hands-Free Ambient Peripheral HUD & OpSec

### Zero-Touch Hands-Free Operation
- **Ambient Peripheral View**: Extra-large, high-contrast SAN move text (`Nf6`) and coordinate arrows (`g8 → f6`) easily legible in peripheral vision without looking directly or moving the mouse.
- **Audio Pacing Chime**: Subtle Web Audio API chime signals when the natural think time has elapsed, so you never have to click or touch the side panel during live games.
- **Focus Telemetry Protection**: Eliminates `window.blur` and `visibilitychange` flags on Chess.com by keeping interaction zero-touch.

### Essential Operational Security Rules
1. **Never Click or Focus Outside the Chess Tab**: Keep your mouse cursor naturally moving over the chessboard.
2. **Match Your Actual Account Rating**: Choose an Elo tier within ±150 points of your real rating.
3. **Let the Pacing Chime / Countdown Finish**: Avoid playing instant tactical moves on complex turns.
