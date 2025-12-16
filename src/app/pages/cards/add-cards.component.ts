import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupStateService } from '../../services/popup-state.service';
import { ApiService } from '../../services/api.service';
import { BottomNavComponent } from '../../shared/bottom-nav.component';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';
// import { ContactSupportComponent } from './contact-support.component';

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
        <button class="buy-points-btn" (click)="openPaymentConfirm(5, 20)">Pay ₹5 for 20 points</button>
        <button class="buy-points-btn" (click)="openPaymentConfirm(10, 50)">Pay ₹10 for 50 points</button>
      </div>
      <!-- Contact Support Button below payment section -->
      <button class="contact-support-btn" (click)="navigateToContactSupport()">Contact Support</button>
  </div>
  <div style="padding-bottom: var(--bottom-nav-height);">
    <button class="terms-btn" (click)="goToTerms()" style="margin: 2vw auto; display: block; padding: 1vw 2vw; font-size: 1.5vw; border-radius: 1vw; border: 1.5px solid var(--input-border); background: var(--bg-2); color: var(--text-1); cursor: pointer;">Terms &amp; Conditions</button>
    <app-bottom-nav
      [bottomNavItems]="bottomNavItems"
      [getIconForRoute]="getIconForRoute.bind(this)"
      [isActiveRoute]="isActiveRoute.bind(this)"
      [navigate]="navigate.bind(this)"></app-bottom-nav>
  </div>
  <!-- Payment Confirmation Popup -->
  <div *ngIf="showPaymentConfirm" class="payment-confirm-modal">
      <div class="payment-confirm-content">
        <h2>Confirm Payment</h2>
        <p>Please review the following before proceeding:</p>
        <ul>
          <li><a (click)="navigate('/refund-policy')" class="policy-link">Refund & Cancellation Policy</a></li>
          <li><a (click)="navigate('/terms-and-conditions')" class="policy-link">Terms & Conditions</a></li>
          <li><a (click)="navigate('/privacy-policy')" class="policy-link">Privacy Policy</a></li>
        </ul>
        <div class="payment-confirm-actions">
          <button class="confirm-btn" (click)="confirmPayment()">Confirm</button>
          <button class="cancel-btn" (click)="cancelPayment()">Cancel</button>
        </div>
      </div>
      <div class="payment-confirm-backdrop" (click)="cancelPayment()"></div>
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
    /* Payment Confirmation Popup Styles */
    .payment-confirm-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .payment-confirm-content {
      background: var(--modal-bg);
      border-radius: 1vw;
      box-shadow: var(--modal-shadow);
      padding: 3vw 4vw;
      min-width: 320px;
      max-width: 90vw;
      text-align: center;
      position: relative;
      z-index: 1001;
    }
    .payment-confirm-content h2 {
      margin-bottom: 1vw;
      font-size: 2vw;
    }
    .payment-confirm-content ul {
      list-style: none;
      padding: 0;
      margin: 1vw 0 2vw 0;
    }
    .payment-confirm-content li {
      margin: 0.5vw 0;
    }
    .policy-link {
      color: var(--link-text);
      text-decoration: underline;
      cursor: pointer;
      font-size: clamp(14px, 3vw, 18px);
      transition: color 0.2s;
    }
    .policy-link:hover {
      color: var(--link-text-hover);
    }
    .payment-confirm-actions {
      display: flex;
      gap: 2vw;
      justify-content: center;
      margin-top: 2vw;
    }
    .confirm-btn, .cancel-btn {
      padding: 1vw 2vw;
      border-radius: 1vw;
      border: none;
      font-size: 1.5vw;
      cursor: pointer;
    }
    .confirm-btn {
      background: var(--btn-primary-bg);
      color: var(--btn-primary-text);
    }
    .cancel-btn {
      background: var(--btn-subtle-bg);
      color: var(--btn-subtle-text);
    }
    .payment-confirm-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: var(--modal-overlay-bg);
      z-index: 1000;
    }
    .contact-support-btn {
      display: block;
      margin: 2vw auto 0 auto;
      background: var(--btn-primary-bg);
      color: var(--btn-primary-text);
      border: 2px solid var(--btn-outline-border);
      border-radius: 1vw;
      padding: 1vw 2vw;
      font-size: 1.5vw;
      cursor: pointer;
      box-shadow: var(--shadow-md);
    }
    .contact-support-btn:hover {
      background: var(--btn-primary-bg-hover);
      box-shadow: var(--shadow-lg-hover);
    }
    .contact-support-modal {
      position: fixed;
      left: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      background: transparent;
      z-index: 1000;
      display: flex;
      align-items: flex-end;
      justify-content: flex-start;
    }
    .contact-support-content {
      background: var(--modal-bg);
      border-radius: 1vw 1vw 0 0;
      box-shadow: var(--modal-shadow);
      padding: 3vw 4vw;
      min-width: 320px;
      max-width: 90vw;
      text-align: left;
      position: relative;
      z-index: 1001;
      margin-left: 2vw;
      margin-bottom: 2vw;
    }
    .close-contact-support {
      margin-top: 2vw;
      background: var(--btn-subtle-bg);
      color: var(--btn-subtle-text);
      border: none;
      border-radius: 1vw;
      padding: 1vw 2vw;
      font-size: 1.2vw;
      cursor: pointer;
    }
    .contact-support-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: var(--modal-overlay-bg);
      z-index: 1000;
    }
  `]
})

export class AddCardsComponent implements OnInit {
  showNotification = false;
  notificationMessage = '';
  totalCards = 0;
  totalPoints = 0;
  pointsToSpend = 0;
  // rupeesToBuy removed, not needed for fixed buttons
  addMsg = '';
  isLoading = true;

  showPaymentConfirm = false;
  paymentAmount: number = 0;
  paymentPoints: number = 0;

  showContactSupport = false;

  bottomNavItems = [
    { label: 'Home', route: '/' },
    { label: 'Cards', route: '/cards' },
    { label: 'Star', route: '/leaderboard' },
    { label: 'Person', route: '/friends' },
    { label: 'Profile', route: '/profile' }
  ];

  constructor(private router: Router, private api: ApiService, private popupState: PopupStateService) {}

  goToTerms() {
    this.router.navigate(['/terms-and-conditons']);
  }

  ngOnInit() {
    this.isLoading = true;
    // Restore popup state if returning from policy page
    const popupState = this.popupState.getState();
    this.showPaymentConfirm = popupState.showPaymentConfirm;
    this.paymentAmount = popupState.paymentAmount;
    this.paymentPoints = popupState.paymentPoints;
    this.popupState.clearState();

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

  openPaymentConfirm(amount: number, points: number) {
    this.paymentAmount = amount;
    this.paymentPoints = points;
    this.showPaymentConfirm = true;
  }

  confirmPayment() {
    this.showPaymentConfirm = false;
    this.buyPoints(this.paymentAmount, this.paymentPoints);
  }

  cancelPayment() {
    this.showPaymentConfirm = false;
    this.paymentAmount = 0;
    this.paymentPoints = 0;
  }

  buyPoints(amount: number, points: number) {
    // Start payment flow for fixed amount and points
    this.api.post('/cards/create-order', { amount, points }).subscribe({
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
            this.api.post('/cards/verify-payment', { ...res, points }).subscribe({
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
    // Save popup state before navigating to policy page
    if (this.showPaymentConfirm && (route === '/refund-policy' || route === '/terms-and-conditions' || route === '/privacy-policy')) {
      this.popupState.saveState(this.showPaymentConfirm, this.paymentAmount, this.paymentPoints);
    }
    this.router.navigate([route]);
  }

  navigateToContactSupport() {
    this.router.navigate(['/contact-support']);
  }
}
