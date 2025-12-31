import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupStateService } from '../../services/popup-state.service';
import { ApiService } from '../../services/api.service';
import { BottomNavComponent } from '../../shared/bottom-nav.component';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';
import { PaymentService } from '../../services/payment.service';
// import { ContactSupportComponent } from './contact-support.component';

@Component({
  selector: 'app-add-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, BottomNavComponent, ErrorNotificationComponent],
  templateUrl: './add-cards.component.html',
  styleUrls: ['./add-cards.component.css']
})

export class AddCardsComponent implements OnInit {
  private cashfree: any;
  // ...existing properties...
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
  loading = false;

  bottomNavItems = [
    { label: 'Home', route: '/' },
    { label: 'Cards', route: '/cards' },
    { label: 'Leaderboard', route: '/leaderboard' },
    { label: 'Profile', route: '/profile' }
  ];

  constructor(private router: Router, private api: ApiService, private popupState: PopupStateService, private paymentService: PaymentService) {}

  goToTerms() {
    this.router.navigate(['/terms-and-conditons']);
  }

  ngOnInit() {
    if ((window as any).Cashfree) {
      this.cashfree = (window as any).Cashfree({ mode: 'production' });
    }
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


  // buyPoints is now handled by PaymentComponent

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
  openPaymentConfirm(amount: number, points: number) {
    this.paymentAmount = amount;
    this.paymentPoints = points;
    this.showPaymentConfirm = true;
  }

  confirmPayment() {
    this.showPaymentConfirm = false;
    this.startPayment(this.paymentAmount, this.paymentPoints);
  }

  cancelPayment() {
    this.showPaymentConfirm = false;
    this.paymentAmount = 0;
    this.paymentPoints = 0;
  }

  startPayment(amount: number, points: number) {
    if (this.loading) return;
    this.loading = true;
    // Determine plan string based on amount
    let plan = '';
    if (amount === 5) {
      plan = 'basic';
    } else if (amount === 10) {
      plan = 'premium';
    } else {
      this.loading = false;
      return;
    }
    this.paymentService.createOrder(plan).subscribe({
      next: (res) => {
        this.loading = false;
        const sessionId = res.payment_session_id;
        if (this.cashfree) {
          this.cashfree.checkout({
            paymentSessionId: sessionId,
            redirectTarget: '_modal',
            onFailure: () => this.showError('Payment cancelled or failed')
          });
          // Refresh points after a short delay for better UX
          setTimeout(() => {
            this.api.get('/users/me').subscribe((u: any) => {
              this.totalPoints = u.points;
            });
          }, 3000);
        } else {
          this.showError('Payment gateway not initialized');
        }
      },
      error: (err) => {
        this.loading = false;
        this.showError('Unable to start payment');
      }
    });
  }
}
