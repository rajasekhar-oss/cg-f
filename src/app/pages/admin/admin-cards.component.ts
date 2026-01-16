import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Card, CardRequestDto } from '../../models/card.model';
import { ResponseDto } from '../../models/response-dto.model';
import { BottomNavComponent } from '../../shared/bottom-nav.component';

@Component({
  standalone: true,
  selector: 'app-admin-cards',
  imports: [CommonModule, FormsModule, BottomNavComponent],
  template: `
    <div style="display: flex; flex-direction: column; align-items: center; min-height: 80vh; background: #f3f4f6; padding: 32px 0;">
      <div style="background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 40px 32px; min-width: 340px; max-width: 480px; width: 100%; text-align: center; margin-bottom: 32px;">
        <h2 style="font-size: 2rem; font-weight: 700; color: #1f2937; margin-bottom: 28px; letter-spacing: -1px;">Admin: Cards</h2>
        <form (ngSubmit)="createCard()" style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 18px;">
          <label style="text-align: left; font-weight: 500; color: #374151;">Category
            <select [(ngModel)]="dto.category" name="category" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; width: 100%;">
              <option value="FILM">Film</option>
              <option value="CRICKET">Cricket</option>
            </select>
          </label>
          <label *ngIf="dto.category === 'CRICKET'" style="text-align: left; font-weight: 500; color: #374151;">Cricket Type
            <select [(ngModel)]="dto.cricketType" name="cricketType" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; width: 100%;">
              <option value="BAT">Bat</option>
              <option value="BOWL">Bowl</option>
              <option value="ALL">All</option>
            </select>
          </label>
          <label style="text-align: left; font-weight: 500; color: #374151;">Name
            <input [(ngModel)]="dto.name" name="name" required style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
          </label>
          <label style="text-align: left; font-weight: 500; color: #374151;">Image
            <input type="file" accept="image/*" name="image" (change)="onFileSelected($event)" style="margin-top: 4px; padding: 8px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
          </label>
          <div *ngIf="!dto.category || dto.category === 'FILM'">
            <label style="text-align: left; font-weight: 500; color: #374151;">Total Films
              <input [(ngModel)]="dto.totalFilms" name="totalFilms" type="number" required style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Years Active
              <input [(ngModel)]="dto.yearsActive" name="yearsActive" type="number" required style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Highest Grossing
              <input [(ngModel)]="dto.highestGrossing" name="highestGrossing" required style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Awards Won
              <input [(ngModel)]="dto.awardsWon" name="awardsWon" type="number" required style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Followers
              <input [(ngModel)]="dto.followers" name="followers" required style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Languages (as integer)
              <input [(ngModel)]="dto.languagesStr" name="languages" required style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Professions (as integer)
              <input [(ngModel)]="dto.professionsStr" name="professions" required style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
          </div>
          <!-- Cricket-specific fields -->
          <div *ngIf="dto.category === 'CRICKET'">
            <h3 style="text-align:left; margin:8px 0 4px; color:#111827; font-size:1.1rem;">Cricket Details</h3>
            <div *ngIf="dto.cricketType === 'BAT'">
            <label style="text-align: left; font-weight: 500; color: #374151;">Matches Played
              <input [(ngModel)]="dto.matchesPlayed" name="matchesPlayed" type="number" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Total Runs
              <input [(ngModel)]="dto.totalRuns" name="totalRuns" type="number" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Highest Score
              <input [(ngModel)]="dto.highestScore" name="highestScore" type="number" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Fours Hit
              <input [(ngModel)]="dto.foursHit" name="foursHit" type="number" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Sixes Hit
              <input [(ngModel)]="dto.sixesHit" name="sixesHit" type="number" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Batting Average
              <input [(ngModel)]="dto.battingAverageBetter" name="battingAverageBetter" type="number" step="0.01" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Strike Rate
              <input [(ngModel)]="dto.strikeRateBetter" name="strikeRateBetter" type="number" step="0.01" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            </div>
            <div *ngIf="dto.cricketType === 'BOWL'">
            <label style="text-align: left; font-weight: 500; color: #374151;">Matches Played
              <input [(ngModel)]="dto.matchesPlayed" name="matchesPlayedBow" type="number" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Wickets Taken
              <input [(ngModel)]="dto.wicketsTaken" name="wicketsTaken" type="number" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Balls Bowled
              <input [(ngModel)]="dto.ballsBowled" name="ballsBowled" type="number" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Runs Conceded
              <input [(ngModel)]="dto.runsConceded" name="runsConceded" type="number" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Economy Rate
              <input [(ngModel)]="dto.economyRateBetter" name="economyRateBetter" type="number" step="0.01" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Best Bowling Match
              <input [(ngModel)]="dto.bestBowlingMatch" name="bestBowlingMatch" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Bowling Average
              <input [(ngModel)]="dto.bowlingAverage" name="bowlingAverage" type="number" step="0.01" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            </div>
            <div *ngIf="dto.cricketType === 'ALL'">
            <!-- Reuse many fields from both bat and bowl -->
            <label style="text-align: left; font-weight: 500; color: #374151;">Matches Played
              <input [(ngModel)]="dto.matchesPlayed" name="matchesPlayedAll" type="number" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Wickets Taken
              <input [(ngModel)]="dto.wicketsTaken" name="wicketsTakenAll" type="number" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Total Runs
              <input [(ngModel)]="dto.totalRuns" name="totalRunsAll" type="number" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Highest Score
              <input [(ngModel)]="dto.highestScore" name="highestScoreAll" type="number" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Economy Rate
              <input [(ngModel)]="dto.economyRateBetter" name="economyRateBetterAll" type="number" step="0.01" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Batting Average
              <input [(ngModel)]="dto.battingAverageBetter" name="battingAverageBetterAll" type="number" step="0.01" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            <label style="text-align: left; font-weight: 500; color: #374151;">Strike Rate
              <input [(ngModel)]="dto.strikeRateBetter" name="strikeRateBetter" type="number" step="0.01" style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
            </label>
            
            </div>
          </div>
          <button type="submit" style="padding: 14px 0; font-size: 1.1rem; border-radius: 10px; background: linear-gradient(90deg, #8b5cf6 60%, #3b82f6 100%); color: white; border: none; cursor: pointer; font-weight: 600; letter-spacing: 0.5px; margin-top: 8px;">Create Card</button>
        </form>
        <div *ngIf="msg" style="color: #059669; font-weight: 500; margin-bottom: 8px;">{{msg}}</div>
        <div *ngIf="error" style="color: #dc2626; font-weight: 500; margin-bottom: 8px;">{{error}}</div>

        <!-- Filter buttons -->
        <div style="display:flex; gap:8px; justify-content:center; margin-top:12px;">
          <button (click)="fetchCards()" style="padding:8px 12px; border-radius:8px;">All</button>
          <button (click)="fetchCards('FILM')" style="padding:8px 12px; border-radius:8px;">Films</button>
          <button (click)="fetchCards('CRICKET','BAT')" style="padding:8px 12px; border-radius:8px;">Cricket — Bat</button>
          <button (click)="fetchCards('CRICKET','BOWL')" style="padding:8px 12px; border-radius:8px;">Cricket — Bowl</button>
          <button (click)="fetchCards('CRICKET','ALL')" style="padding:8px 12px; border-radius:8px;">Cricket — All</button>
        </div>

        <!-- Cards grid -->
        <div *ngIf="cards?.length" style="margin-top:18px;">
          <ul style="list-style:none; padding:0; display:grid; grid-template-columns:repeat(3,1fr); gap:12px;">
            <li *ngFor="let card of cards" style="background:#fff; border-radius:10px; box-shadow:0 2px 8px #e5e7eb; padding:8px; display:flex; flex-direction:column; align-items:center;">
              <img *ngIf="card.imageUrl" [src]="card.imageUrl" alt="{{card.name}}" style="width:100%; height:120px; object-fit:cover; border-radius:6px;" />
              <div style="font-weight:600; margin-top:8px;">{{card.name}}</div>
              <div style="font-size:0.85rem; color:#6b7280; margin-top:4px;">ID: {{card.id}}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div style="padding-bottom: var(--bottom-nav-height);">
    <app-bottom-nav
      [bottomNavItems]="bottomNavItems"
      [isActiveRoute]="isActiveRoute.bind(this)"
      [navigate]="navigate.bind(this)">
    </app-bottom-nav>
    </div>
  `
})
export class AdminCardsComponent {
  cards: Card[] = [];
  dto: any = { category: 'FILM', cricketType: 'BAT', name: '', imageUrl: '', totalFilms: '', yearsActive: '', highestGrossing: '', awardsWon: '', followers: '', languagesStr: '', professionsStr: '' };
  selectedFile: File | null = null;
  onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  this.selectedFile = input.files[0];
  this.dto.image = this.selectedFile; // Update dto.image with the selected file
}
  msg = '';
  error = '';

  bottomNavItems = [
    { label: 'Home', route: '/' },
    { label: 'Cards', route: '/cards' },
    { label: 'Leaderboard', route: '/leaderboard' },
    { label: 'Profile', route: '/profile' }
  ];

  constructor(private admin: AdminService) {
    // Optionally fetch existing cards
    // fetch all on load
    this.fetchCards();
  }

  fetchCards(category?: string, cricketType?: string) {
    this.msg = '';
    this.error = '';
    if (!category) {
      this.admin.getCards().subscribe({ next: c => this.cards = c, error: e => this.error = e?.error?.error || e?.message || 'Error fetching cards' });
      return;
    }
    this.admin.getCardsByCategory(category, cricketType).subscribe({ next: c => this.cards = c, error: e => this.error = e?.error?.error || e?.message || 'Error fetching filtered cards' });
  }

createCard() {
  this.msg = '';
  this.error = '';
  const payload = new FormData();

  // Common
  if (this.dto.name) payload.append('name', String(this.dto.name));
  if (this.selectedFile) payload.append('pictureFile', this.selectedFile);
  if (this.dto.imageUrl) payload.append('picture', String(this.dto.imageUrl));

  // If film category -> existing fields
  if (!this.dto.category || this.dto.category === 'FILM') {
    if (this.dto.totalFilms) payload.append('totalFilms', String(this.dto.totalFilms));
    if (this.dto.yearsActive) payload.append('yearsActive', String(this.dto.yearsActive));
    if (this.dto.highestGrossing) payload.append('highestGrossing', String(this.dto.highestGrossing));
    if (this.dto.awardsWon ) payload.append('awardsWon', String(this.dto.awardsWon));
    if (this.dto.followers) payload.append('followers', String(this.dto.followers));
    if (this.dto.languagesStr) payload.append('languages', String(this.dto.languagesStr));
    if (this.dto.professionsStr) payload.append('professions', String(this.dto.professionsStr));
    this.admin.create(payload).subscribe({
      next: (c) => {
        this.msg = 'Card created!';
        this.cards.push(c);
        this.selectedFile = null;
      },
      error: (e) => {
        this.error = e?.error?.error || e?.message || 'Error creating card';
      }
    });
    return;
  }

  // For cricket category, include category & cricketType
  payload.append('category', String('CRICKET'));
  if (this.dto.cricketType) payload.append('cricketType', String(this.dto.cricketType));

  // Append cricket fields depending on type
  if (this.dto.cricketType === 'BAT') {
    if (this.dto.matchesPlayed) payload.append('matchesPlayed', String(this.dto.matchesPlayed));
    if (this.dto.totalRuns) payload.append('totalRuns', String(this.dto.totalRuns));
    if (this.dto.highestScore) payload.append('highestScore', String(this.dto.highestScore));
    if (this.dto.foursHit) payload.append('foursHit', String(this.dto.foursHit));
    if (this.dto.sixesHit) payload.append('sixesHit', String(this.dto.sixesHit));
    if (this.dto.battingAverageBetter) payload.append('battingAverageBetter', String(this.dto.battingAverageBetter));
    if (this.dto.strikeRateBetter) payload.append('strikeRateBetter', String(this.dto.strikeRateBetter));
    this.admin.createCricketBat(payload).subscribe({
      next: (c) => { this.msg = 'Cricket bat card created!'; this.cards.push(c); this.selectedFile = null; },
      error: (e) => { this.error = e?.error?.error || e?.message || 'Error creating cricket bat card'; }
    });
    return;
  }
  if (this.dto.cricketType === 'BOWL') {
    if (this.dto.matchesPlayed) payload.append('matchesPlayed', String(this.dto.matchesPlayed));
    if (this.dto.wicketsTaken) payload.append('wicketsTaken', String(this.dto.wicketsTaken));
    if (this.dto.ballsBowled) payload.append('ballsBowled', String(this.dto.ballsBowled));
    if (this.dto.runsConceded) payload.append('runsConceded', String(this.dto.runsConceded));
    if (this.dto.economyRateBetter) payload.append('economyRateBetter', String(this.dto.economyRateBetter));
    if (this.dto.bestBowlingMatch) payload.append('bestBowlingMatch', String(this.dto.bestBowlingMatch));
    if (this.dto.bowlingAverage) payload.append('bowlingAverage', String(this.dto.bowlingAverage));
    this.admin.createCricketBowl(payload).subscribe({
      next: (c) => { this.msg = 'Cricket bowl card created!'; this.cards.push(c); this.selectedFile = null; },
      error: (e) => { this.error = e?.error?.error || e?.message || 'Error creating cricket bowl card'; }
    });
    return;
  }
  if (this.dto.cricketType === 'ALL') {
    if (this.dto.matchesPlayed) payload.append('matchesPlayed', String(this.dto.matchesPlayed));
    if (this.dto.wicketsTaken) payload.append('wicketsTaken', String(this.dto.wicketsTaken));
    if (this.dto.economyRateBetter) payload.append('economyRateBetter', String(this.dto.economyRateBetter));
    if (this.dto.totalRuns) payload.append('totalRuns', String(this.dto.totalRuns));
    if (this.dto.highestScore) payload.append('highestScore', String(this.dto.highestScore));
    if (this.dto.battingAverageBetter) payload.append('battingAverageBetter', String(this.dto.battingAverageBetter));
    if (this.dto.strikeRateBetter) payload.append('strikeRateBetter', String(this.dto.strikeRateBetter));
    this.admin.createCricketAll(payload).subscribe({
      next: (c) => { this.msg = 'Cricket all-rounder card created!'; this.cards.push(c); this.selectedFile = null; },
      error: (e) => { this.error = e?.error?.error || e?.message || 'Error creating cricket all card'; }
    });
    return;
  }
}


  deleteCard(id: number) {
    this.admin.deleteCard(id).subscribe({
      next: (res: ResponseDto) => {
        this.msg = res.message;
        this.cards = this.cards.filter(c => c.id !== id);
      },
      error: (e) => {
        this.error = e?.error?.error || e?.message || 'Error deleting card';
      }
    });
  }

  navigate(route: string) {
    window.location.href = route;
  }

  isActiveRoute(route: string): boolean {
    return window.location.pathname === route;
  }
}
