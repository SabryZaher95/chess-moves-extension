# Tab Notes - Stealth Chess Assistant Extension

Tab Notes is a high-security, privacy-focused Chrome Extension that integrates a calibrated UCI chess engine (Lozza) into a modern Angular side panel.

## Architecture & Anti-Detection Highlights

- **100% Pure Isolated-World Execution**: Runs strictly inside Chrome's isolated world with zero main-world script injection, zero prototype tampering, and zero DOM pollution.
- **Trimodal Human Move Pacing**: Models realistic human decision times with reflex, intuitive, and deep calculation distributions, eliminating flat timing signatures.
- **Multi-Game SPA Session Isolation**: Automatically detects rematches and new games in single-page apps to reset move metrics, streak counters, and error budgets.
- **Ken Regan "Only-Move" Budgeting**: Restricts super-human "only move" execution to calibrated rating envelopes, replacing obscure engine prophylaxis with natural human candidate moves.
- **Hands-Free Ambient Glance HUD & Audio Chime**: High-contrast peripheral display and subtle audio chime enable zero-touch play without triggering window blur telemetry.
- **Master Grandmaster Opening Book**: Deep opening repertoire across hundreds of ECO lines (A00–E99) to ensure 0% computer novelty in the early game.
- **No External Data Transmission**: Runs 100% locally with a strict `self` Content Security Policy.

## Build the Extension

To build the extension from scratch, use the unified pipeline script:

```bash
npm run build:extension
```

This will automatically:
1. Build the Angular side panel application (`npm run build:ng`)
2. Bundle the background and content scripts using `esbuild` (`npm run build:scripts`)
3. Copy the secure `manifest.json` and static assets into the `dist/` folder

The complete production-ready extension will be output to the `dist/` directory.

## Load the Extension in Chrome

1. Open Google Chrome and navigate to `chrome://extensions`.
2. Toggle the **Developer mode** switch in the top right corner.
3. Click the **Load unpacked** button.
4. Select the `dist/` directory generated in the previous step.
5. The extension will appear. Pin it to your toolbar for easy access to the side panel.

## Operational Security Guidelines

1. **Keep Move Concealment ON**: Never play moves instantly on complex turns. Wait for the green "Safe to Play" indicator or audio chime.
2. **Match Your Real Account Rating**: Select an Elo tier that matches your current account rating (800–2300).
3. **Never Switch Tabs During Active Turns**: Keep the Chrome Side Panel open alongside your chessboard.
4. **Natural Mouse Movement**: Move your mouse with natural curvature before clicking pieces.
