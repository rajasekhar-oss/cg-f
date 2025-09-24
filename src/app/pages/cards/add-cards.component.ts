import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { BottomNavComponent } from '../../shared/bottom-nav.component';

@Component({
  selector: 'app-add-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, BottomNavComponent],
  template: `
    <div class="add-cards-page">
      <div class="add-cards-header">
        <div class="add-cards-total">Total Cards: {{ totalCards }}</div>
        <div class="add-cards-points">Total Points: {{ totalPoints }}</div>
      </div>
      <div class="add-cards-section">
        <div class="add-cards-label">Add Cards with Points</div>
        <input type="number" min="1" [(ngModel)]="pointsToSpend" class="add-cards-input" placeholder="Enter points to spend" />
        <div *ngIf="pointsToSpend > totalPoints" class="add-cards-error">You don't have enough points to add cards.</div>
        <button class="add-cards-btn" [disabled]="!canAdd()" (click)="addCards()">Add</button>
        <div *ngIf="addMsg" class="add-cards-success">{{ addMsg }}</div>
      </div>
      <div class="buy-points-section">
        <div class="buy-points-label">Buy Points</div>
        <div class="buy-points-info">Each point = 1 Rupee</div>
        <input type="number" min="1" [(ngModel)]="rupeesToBuy" class="buy-points-input" placeholder="Enter amount (₹)" />
        <button class="buy-points-btn" [disabled]="!rupeesToBuy || rupeesToBuy < 1" (click)="buyPoints()">Buy Points</button>
      </div>
    </div>
    <app-bottom-nav
      [bottomNavItems]="bottomNavItems"
      [getIconForRoute]="getIconForRoute.bind(this)"
      [isActiveRoute]="isActiveRoute.bind(this)"
      [navigate]="navigate.bind(this)">
    </app-bottom-nav>
  `,
  styles: [`
    .add-cards-page {
      width: 100vw;
      max-width: 100vw;
      padding: 4vw 0 12vw 0;
      box-sizing: border-box;
    }
    .add-cards-header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      margin: 0 4vw 4vw 4vw;
      font-size: 2.5vw;
      font-weight: 600;
    }
    .add-cards-section, .buy-points-section {
      background: #f3f4f6;
      border-radius: 1.5vw;
      margin: 0 4vw 4vw 4vw;
      padding: 3vw 4vw;
      display: flex;
      flex-direction: column;
      gap: 2vw;
    }
    .add-cards-label, .buy-points-label {
      font-size: 2vw;
      font-weight: 600;
      color: #1f2937;
    }
    .add-cards-input, .buy-points-input {
      font-size: 2vw;
      padding: 1vw 2vw;
      border-radius: 1vw;
      border: 1px solid #d1d5db;
      width: 100%;
    }
    .add-cards-btn, .buy-points-btn {
      font-size: 2vw;
      padding: 1.5vw 0;
      border-radius: 1vw;
      font-weight: 700;
      border: none;
      background: #4ade80;
      color: #065f46;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 1vw;
    }
    .add-cards-btn[disabled], .buy-points-btn[disabled] {
      background: #d1d5db;
      color: #6b7280;
      cursor: not-allowed;
    }
    .add-cards-error {
      color: #dc2626;
      font-size: 1.5vw;
      font-weight: 500;
    }
    .add-cards-success {
      color: #059669;
      font-size: 1.5vw;
      font-weight: 500;
    }
    .buy-points-info {
      color: #6b7280;
      font-size: 1.5vw;
    }
  `]
})
export class AddCardsComponent implements OnInit {
  totalCards = 0;
  totalPoints = 0;
  pointsToSpend = 0;
  rupeesToBuy = 0;
  addMsg = '';
  isLoading = true;

  bottomNavItems = [
    { label: 'Home', route: '/' },
    { label: 'Cards', route: '/cards' },
    { label: 'Star', route: '/leaderboard' },
    { label: 'Person', route: '/friends' },
    { label: 'Profile', route: '/profile' }
  ];


  constructor(private router: Router, private api: ApiService) {}

  ngOnInit() {
    this.isLoading = true;
    // Fetch cards
    this.api.get('/cards/my').subscribe((cards: any) => {
      this.totalCards = Array.isArray(cards) ? cards.length : 0;
      this.isLoading = false;
    }, () => {
      this.totalCards = 0;
      this.isLoading = false;
    });
    // Fetch user points
    this.api.get('/users/me').subscribe((user: any) => {
      this.totalPoints = user.points || 0;
    }, () => {
      this.totalPoints = 0;
    });
  }

  canAdd() {
    return this.pointsToSpend > 0 && this.pointsToSpend <= this.totalPoints;
  }

  addCards() {
    if (!this.canAdd()) return;
  const payload = { pointsToSpend: Number(this.pointsToSpend) };
  console.log('Sending payload to /cards/add:', payload);
    this.api.post('/cards/add', payload).subscribe({
      next: (res: any) => {
        this.addMsg = 'Cards Added';
        // Refresh points and cards count
        this.api.get('/users/me').subscribe((user: any) => {
          this.totalPoints = user.points || 0;
        });
        this.api.get('/cards/my').subscribe((cards: any) => {
          this.totalCards = Array.isArray(cards) ? cards.length : 0;
        });
        this.pointsToSpend = 0;
        setTimeout(() => this.addMsg = '', 2000);
      },
      error: (err) => {
        this.addMsg = err?.error?.message || 'Failed to add cards';
        setTimeout(() => this.addMsg = '', 2000);
      }
    });
  }

  buyPoints() {
    if (!this.rupeesToBuy || this.rupeesToBuy < 1) return;
    // Redirect to payment page (to be implemented)
    this.router.navigate(['/payment'], { queryParams: { amount: this.rupeesToBuy } });
  }

  getIconForRoute(route: string): string {
    const icons: { [key: string]: string } = {
      '/': '\ud83c\udfe0',
      '/cards': '\ud83c\udccf',
      '/leaderboard': '\u2b50',
      '/friends': '\ud83d\udc65',
      '/profile': '\ud83d\udc64'
    };
    return icons[route] || '\ud83d\udcc4';
  }
  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
  navigate(route: string) {
    this.router.navigate([route]);
  }
}
