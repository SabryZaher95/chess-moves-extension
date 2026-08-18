import { App } from './app';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameStateService } from './services/game-state.service';
import { LozzaEngineService } from './services/lozza-engine.service';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

describe('App Component', () => {
  let app: App;

  beforeEach(() => {
    (window as any).chrome = {
      runtime: {
        getURL: (path: string) => path,
        onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
        connect: vi.fn()
      },
      storage: {
        local: { get: vi.fn(), set: vi.fn() },
        onChanged: { addListener: vi.fn() }
      },
      tabs: {
        query: vi.fn(),
        sendMessage: vi.fn()
      }
    };

    const mockEngine = {
      getBestMoves: vi.fn(),
      stopSearch: vi.fn(),
      newGame: vi.fn(),
      isSearching: signal(false),
      searchTimeMs: signal(1000)
    };

    TestBed.configureTestingModule({
      providers: [
        GameStateService,
        { provide: LozzaEngineService, useValue: mockEngine }
      ]
    });

    app = TestBed.runInInjectionContext(() => new App());
  });

  it('should instantiate the component and configure Elo profiles', () => {
    expect(app).toBeTruthy();
    expect(app.eloProfiles.length).toBeGreaterThan(0);
    expect(app.eloProfiles.some(p => p.value === '1400')).toBe(true);
    expect(app.currentProfile.tier).toBe('1400');
  });

  it('should format clock seconds correctly', () => {
    expect(app.formatClock(185)).toBe('3:05');
    expect(app.formatClock(60)).toBe('1:00');
    expect(app.formatClock(null)).toBe('--:--');
    expect(app.formatClock(7.4)).toBe('0:07.4');
  });

  it('should return appropriate pacing category labels and severities', () => {
    expect(app.getPacingLabel('reflex')).toBe('Reflex (Instant)');
    expect(app.getPacingLabel('intuitive')).toBe('Intuitive Flow');
    expect(app.getPacingLabel('calculation')).toBe('Deep Calculation');
    expect(app.getPacingLabel('scramble')).toBe('Time Scramble');

    expect(app.getPacingSeverity('reflex')).toBe('info');
    expect(app.getPacingSeverity('intuitive')).toBe('success');
    expect(app.getPacingSeverity('calculation')).toBe('warn');
    expect(app.getPacingSeverity('scramble')).toBe('danger');
  });

  it('should toggle audio cue, compact HUD mode, and move concealment', () => {
    expect(app.gameState.audioCueEnabled()).toBe(false);
    app.toggleAudioCue();
    expect(app.gameState.audioCueEnabled()).toBe(true);

    expect(app.gameState.compactHudMode()).toBe(false);
    app.toggleCompactHud();
    expect(app.gameState.compactHudMode()).toBe(true);

    expect(app.gameState.autoConcealMove()).toBe(true);
    app.toggleConcealment();
    expect(app.gameState.autoConcealMove()).toBe(false);
  });

  it('should reveal move now on revealMoveNow call', () => {
    app.gameState.isMoveRevealed.set(false);
    app.revealMoveNow();
    expect(app.gameState.isMoveRevealed()).toBe(true);
    expect(app.gameState.isPacingSafe()).toBe(true);
  });

  it('should send refresh position message on refreshPosition call', () => {
    (window as any).chrome.tabs.query.mockImplementation((_query: any, callback: Function) => {
      callback([{ id: 123 }]);
    });

    app.refreshPosition();
    expect((window as any).chrome.tabs.sendMessage).toHaveBeenCalledWith(123, { type: 'REQUEST_POSITION' });
  });
});
