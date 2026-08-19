import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { ChipModule } from 'primeng/chip';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { GameStateService, ELO_PROFILES, PacingCategory } from './services/game-state.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, 
    FormsModule,
    CardModule, 
    TagModule, 
    SelectModule, 
    SkeletonModule, 
    ChipModule, 
    PanelModule,
    ButtonModule,
    CheckboxModule,
    TooltipModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  gameState = inject(GameStateService);

  eloProfiles = [
    { label: 'Max - Pure Engine 3000+ (Maximum Strength)', value: 'max' },
    { label: '2300 - Master (~95% CAPS)', value: '2300' },
    { label: '2000 - Expert (~92% CAPS)', value: '2000' },
    { label: '1700 - Advanced (~87% CAPS)', value: '1700' },
    { label: '1400 - Intermediate (~80% CAPS)', value: '1400' },
    { label: '1100 - Casual (~72% CAPS)', value: '1100' },
    { label: '800 - Beginner (~62% CAPS)', value: '800' }
  ];

  searchTimeOptions = [
    { label: '1s (Fast Search)', value: 1000 },
    { label: '2s (Strong Search)', value: 2000 },
    { label: '3s (Deep Calculation)', value: 3000 },
    { label: '5s (Grandmaster Deep Search)', value: 5000 }
  ];

  get currentProfile() {
    return ELO_PROFILES[this.gameState.selectedElo()] || ELO_PROFILES['max'];
  }

  getPacingLabel(category: PacingCategory): string {
    switch (category) {
      case 'reflex': return 'Reflex (Instant)';
      case 'intuitive': return 'Intuitive Flow';
      case 'calculation': return 'Deep Calculation';
      case 'scramble': return 'Time Scramble';
      default: return 'Standard';
    }
  }

  getPacingSeverity(category: PacingCategory): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (category) {
      case 'reflex': return 'info';
      case 'intuitive': return 'success';
      case 'calculation': return 'warn';
      case 'scramble': return 'danger';
      default: return 'secondary';
    }
  }

  toggleCompactHud() {
    this.gameState.compactHudMode.update(v => !v);
  }

  toggleAudioCue() {
    this.gameState.audioCueEnabled.update(v => !v);
  }

  toggleConcealment() {
    this.gameState.autoConcealMove.update(v => !v);
  }

  revealMoveNow() {
    this.gameState.revealMoveEarly();
  }

  formatClock(sec: number | null): string {
    if (sec === null || sec === undefined) return '--:--';
    const totalSecs = Math.max(0, Math.floor(sec));
    const mins = Math.floor(totalSecs / 60);
    const remainingSecs = totalSecs % 60;
    const secStr = remainingSecs < 10 ? `0${remainingSecs}` : `${remainingSecs}`;
    
    if (totalSecs < 10) {
      const frac = Math.floor((sec - totalSecs) * 10);
      return `${mins}:${secStr}.${frac}`;
    }
    return `${mins}:${secStr}`;
  }

  refreshPosition() {
    this.gameState.requestActivePosition();
  }
}
