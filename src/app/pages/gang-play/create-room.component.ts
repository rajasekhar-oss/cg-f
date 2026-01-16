import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorNotificationComponent],
  template: `
  <app-error-notification *ngIf="showNotification" [message]="notificationMessage" (closed)="onNotificationClosed()"></app-error-notification>
  <div class="create-room-container">
      <h2>Create Gang Play Room</h2>
      
      <!-- Category Selection Boxes -->
      <div class="category-section">
        <label>Select Category</label>
        <div class="category-boxes">
          <div 
            class="category-box" 
            [class.selected]="selectedCategory === 'FILM'"
            (click)="selectCategory('FILM', null)">
            <span class="category-icon">🎬</span>
            <span class="category-name">Film</span>
          </div>
          <div 
            class="category-box" 
            [class.selected]="selectedCategory === 'CRICKET' && selectedCricketType === 'BAT'"
            (click)="selectCategory('CRICKET', 'BAT')">
            <span class="category-icon">🏏</span>
            <span class="category-name">Cricket Bat</span>
          </div>
          <div 
            class="category-box" 
            [class.selected]="selectedCategory === 'CRICKET' && selectedCricketType === 'BOWL'"
            (click)="selectCategory('CRICKET', 'BOWL')">
            <span class="category-icon">🎯</span>
            <span class="category-name">Cricket Bowl</span>
          </div>
          <div 
            class="category-box" 
            [class.selected]="selectedCategory === 'CRICKET' && selectedCricketType === 'ALL'"
            (click)="selectCategory('CRICKET', 'ALL')">
            <span class="category-icon">⭐</span>
            <span class="category-name">Cricket All</span>
          </div>
        </div>
      </div>

      <div class="input-section">
        <label for="numPlayers">Number of People</label>
        <input id="numPlayers" type="number" min="2" [(ngModel)]="numPlayers" placeholder="Enter number of players" />
      </div>

      <button class="generate-btn" [disabled]="!numPlayers || numPlayers < 2 || !selectedCategory || isLoading" (click)="createGame()">
        {{ isLoading ? 'Creating...' : 'Create Game' }}
      </button>

      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .create-room-container { max-width: 420px; margin: 40px auto; background: var(--bg-1, #fff); border-radius: 16px; box-shadow: none; padding: 32px; text-align: center; border: 1px solid var(--border-1, #e5e7eb); }
    .create-room-container:hover { box-shadow: 0 4px 24px var(--shadow-1, rgba(0,0,0,0.08)); }
    .category-section { margin-bottom: 20px; }
    .category-boxes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 12px; }
    .category-box { 
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 16px 12px; border-radius: 12px; border: 2px solid var(--border-1, #e5e7eb);
      background: var(--bg-2, #f9fafb); cursor: pointer; transition: all 0.2s ease;
    }
    .category-box:hover { border-color: var(--blue-2, #3b82f6); background: var(--bg-3, #f3f4f6); }
    .category-box.selected { 
      border-color: var(--blue-3, #8b5cf6); background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
      box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
    }
    .category-icon { font-size: 1.8rem; margin-bottom: 6px; }
    .category-name { font-size: 0.9rem; font-weight: 600; color: var(--text-1, #111827); }
    .input-section { margin-bottom: 18px; }
    label { font-weight: 600; color: var(--text-2, #374151); margin-bottom: 8px; display: block; }
    input[type=number] { padding: 10px; border-radius: 8px; border: 1px solid var(--border-1, #d1d5db); font-size: 1.1rem; width: 100%; margin-top: 4px; background: var(--bg-2, #fff); color: var(--text-1, #111827); box-sizing: border-box; }
    .generate-btn { margin-top: 12px; padding: 12px 0; font-size: 1.1rem; border-radius: 10px; background: linear-gradient(90deg, var(--blue-3, #8b5cf6) 60%, var(--blue-2, #3b82f6) 100%); color: var(--text-on-primary, #fff); border: none; cursor: pointer; font-weight: 600; letter-spacing: 0.5px; width: 100%; box-shadow: none; transition: box-shadow 0.2s; }
    .generate-btn:hover:not(:disabled) { box-shadow: 0 2px 8px var(--shadow-1, rgba(0,0,0,0.08)); }
    .generate-btn:disabled { background: var(--bg-3, #ccc); color: var(--text-3, #666); cursor: not-allowed; opacity: 0.6; box-shadow: none; }
    .error { color: var(--error, #dc2626); font-weight: 500; margin-top: 12px; }
    @media (max-width: 768px) {
      .create-room-container { margin: 24px 16px; max-width: calc(100% - 32px); padding: 24px 20px; }
      .category-boxes { gap: 10px; }
      .category-box { padding: 14px 10px; }
      .category-icon { font-size: 1.5rem; }
      .category-name { font-size: 0.85rem; }
    }
    @media (max-width: 480px) {
      .create-room-container { margin: 16px 12px; max-width: calc(100% - 24px); padding: 20px 16px; }
      .category-boxes { gap: 8px; }
      .category-box { padding: 12px 8px; border-radius: 10px; }
      .category-icon { font-size: 1.3rem; }
      .category-name { font-size: 0.8rem; }
    }
  `]
})
export class CreateRoomComponent implements OnDestroy {
  showNotification = false;
  notificationMessage = '';
  numPlayers: number = 2;
  isLoading = false;
  error = '';
  roomInfo: any = null;
  private subscriptions: any[] = [];

  // Category selection
  selectedCategory: 'FILM' | 'CRICKET' | null = null;
  selectedCricketType: 'BAT' | 'BOWL' | 'ALL' | null = null;

  constructor(private api: ApiService, private router: Router) {}

  selectCategory(category: 'FILM' | 'CRICKET', cricketType: 'BAT' | 'BOWL' | 'ALL' | null) {
    this.selectedCategory = category;
    this.selectedCricketType = cricketType;
  }

  createGame() {
    this.isLoading = true;
    this.error = '';
    // Send requiredPlayers in the POST body, send category/cricketType as query params
    const body: any = { requiredPlayers: this.numPlayers };
    let params = '';
    if (this.selectedCategory) {
      params = `?category=${this.selectedCategory}`;
      if (this.selectedCategory === 'CRICKET' && this.selectedCricketType) {
        params += `&cricketType=${this.selectedCricketType}`;
      }
    }
    const url = `/api/rooms/create${params}`;
    const sub = this.api.post(url, body).subscribe({
      next: (res: any) => {
        if (res && res.errorMessage) {
          this.showError(res.errorMessage);
          this.isLoading = false;
          return;
        }
        this.roomInfo = res;
        this.isLoading = false;
        const code = res?.roomCode || '';
        // Navigate directly to waiting room, passing roomInfo in state
        this.router.navigate(['/gang-play/waiting', code], { state: { roomInfo: res } });
      },
      error: (e) => {
        if (e?.error?.errorMessage) {
          this.showError(e.error.errorMessage);
        } else {
          this.showError(e?.error?.error || e?.message || 'Error creating game');
        }
        this.isLoading = false;
      }
    });
    this.subscriptions.push(sub);
  }
  showError(msg: string) {
    this.notificationMessage = msg;
    this.showNotification = true;
  }

  onNotificationClosed() {
    this.showNotification = false;
    this.notificationMessage = '';
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe && sub.unsubscribe());
  }
}
