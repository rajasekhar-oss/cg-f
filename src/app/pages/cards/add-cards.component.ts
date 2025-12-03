import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { BottomNavComponent } from '../../shared/bottom-nav.component';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';

@Component({
  selector: 'app-add-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, BottomNavComponent, ErrorNotificationComponent],
  template: `
  <app-error-notification *ngIf="showNotification" [message]="notificationMessage" (closed)="onNotificationClosed()"></app-error-notification>
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
    <div style="padding-bottom: var(--bottom-nav-height);">
      <button class="terms-btn" (click)="goToTerms()" style="margin: 2vw auto; display: block; padding: 1vw 2vw; font-size: 1.5vw; border-radius: 1vw; border: 1.5px solid var(--input-border); background: var(--bg-2); color: var(--text-1); cursor: pointer;">Terms &amp; Conditions</button>
      <app-bottom-nav
        [bottomNavItems]="bottomNavItems"
        [getIconForRoute]="getIconForRoute.bind(this)"
        [isActiveRoute]="isActiveRoute.bind(this)"
        [navigate]="navigate.bind(this)">
      </app-bottom-nav>
    </div>
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
      background: var(--bg-3);
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
      color: var(--text-1);
    }
    .add-cards-input, .buy-points-input {
      font-size: 2vw;
      padding: 1vw 2vw;
      border-radius: 1vw;
      border: 1.5px solid var(--input-border);
      background: var(--bg-2);
      color: var(--text-1);
      width: 100%;
      box-shadow: var(--shadow-sm);
      transition: border 0.2s, box-shadow 0.2s;
    }
    .add-cards-input:focus, .buy-points-input:focus {
      border-color: var(--input-focus-border);
      box-shadow: var(--shadow-md);
    }
    .add-cards-btn, .buy-points-btn {
      font-size: 2vw;
      padding: 1.5vw 0;
      border-radius: 1vw;
      font-weight: 700;
      border: 2px solid var(--btn-outline-border);
      background: var(--btn-primary-bg);
      color: var(--btn-primary-text);
      cursor: pointer;
      transition: background 0.2s, color 0.2s, box-shadow 0.2s;
      margin-top: 1vw;
      box-shadow: var(--shadow-md);
      min-width: 110px;
      white-space: normal;
      word-break: break-word;
      text-align: center;
    }
    .add-cards-btn[disabled], .buy-points-btn[disabled] {
      background: var(--btn-primary-bg-disabled);
      color: var(--btn-primary-text-disabled);
      border: 2px solid var(--btn-outline-border-disabled);
      cursor: not-allowed;
      opacity: 0.7;
    }
    .add-cards-btn:hover:not([disabled]), .buy-points-btn:hover:not([disabled]) {
      background: var(--btn-primary-bg-hover);
      box-shadow: var(--shadow-lg-hover);
    }
    .add-cards-error {
      color: var(--error);
      font-size: 1.5vw;
      font-weight: 500;
    }
    .add-cards-success {
      color: var(--success);
      font-size: 1.5vw;
      font-weight: 500;
    }
    .buy-points-info {
      color: var(--text-3);
      font-size: 1.5vw;
    }
  `]
})
export class AddCardsComponent implements OnInit {
  showNotification = false;
  notificationMessage = '';
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

  goToTerms() {
    this.router.navigate(['/terms-and-conditons']);
  }

  ngOnInit() {
    this.isLoading = true;
    // Fetch cards
    this.api.get('/cards/my').subscribe((cards: any) => {
      if (cards && cards.errorMessage) {
        this.showError(cards.errorMessage);
        this.totalCards = 0;
        this.isLoading = false;
        return;
      }
      this.totalCards = Array.isArray(cards) ? cards.length : 0;
      this.isLoading = false;
    }, (err) => {
      if (err?.error?.errorMessage) {
        this.showError(err.error.errorMessage);
      }
      this.totalCards = 0;
      this.isLoading = false;
    });
    // Fetch user points
    this.api.get('/users/me').subscribe((user: any) => {
      if (user && user.errorMessage) {
        this.showError(user.errorMessage);
        this.totalPoints = 0;
        return;
      }
      this.totalPoints = user.points || 0;
    }, (err) => {
      if (err?.error?.errorMessage) {
        this.showError(err.error.errorMessage);
      }
      this.totalPoints = 0;
    });
  }

  canAdd() {
    return this.pointsToSpend > 0 && this.pointsToSpend <= this.totalPoints;
  }

  addCards() {
    if (!this.canAdd()) return;
    const payload = { pointsToSpend: Number(this.pointsToSpend) };
    this.api.post('/cards/add', payload).subscribe({
      next: (res: any) => {
        if (res && res.errorMessage) {
          this.showError(res.errorMessage);
          return;
        }
        this.addMsg = 'Cards Added';
        // Refresh points and cards count
        this.api.get('/users/me').subscribe((user: any) => {
          if (user && user.errorMessage) {
            this.showError(user.errorMessage);
            this.totalPoints = 0;
            return;
          }
          this.totalPoints = user.points || 0;
        });
        this.api.get('/cards/my').subscribe((cards: any) => {
          if (cards && cards.errorMessage) {
            this.showError(cards.errorMessage);
            this.totalCards = 0;
            return;
          }
          this.totalCards = Array.isArray(cards) ? cards.length : 0;
        });
        this.pointsToSpend = 0;
        setTimeout(() => this.addMsg = '', 2000);
      },
      error: (err) => {
        if (err?.error?.errorMessage) {
          this.showError(err.error.errorMessage);
        } else {
          this.showError('Failed to add cards');
        }
        setTimeout(() => this.addMsg = '', 2000);
      }
    });
  }
  showError(msg: string) {
    this.notificationMessage = msg;
    this.showNotification = true;
  }

  onNotificationClosed() {
    this.showNotification = false;
    this.notificationMessage = '';
  }

  buyPoints() {
    if (!this.rupeesToBuy || this.rupeesToBuy < 1) return;
    // Start payment flow
    // 1. Create order from backend
    this.api.post('/cards/create-order', { amount: this.rupeesToBuy }).subscribe({
      next: (order: any) => {
        if (!order || !order.id) {
          this.showError('Failed to create payment order');
          return;
        }
        const options = {
          key: 'rzp_test_RmeSFTitE0PwjA', // Razorpay TEST Key
          amount: order.amount,
          currency: 'INR',
          order_id: order.id,
          handler: (res: any) => {
            // 2. Verify payment
            this.api.post('/cards/verify-payment', res).subscribe({
              next: (msg: any) => {
                // 3. Refresh points after payment success
                this.api.get('/users/me').subscribe((user: any) => {
                  if (user && user.errorMessage) {
                    this.showError(user.errorMessage);
                    this.totalPoints = 0;
                    return;
                  }
                  this.totalPoints = user.points || 0;
                  this.showError(msg); // Show success message
                });
              },
              error: () => {
                this.showError('Payment verification failed');
              }
            });
          }
        };
        new (window as any).Razorpay(options).open();
      },
      error: () => {
        this.showError('Failed to create payment order');
      }
    });
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
