import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../shared/bottom-nav.component';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, BottomNavComponent, ErrorNotificationComponent],
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html'
})
export class VerifyOtpComponent {
  otp = '';
  email = '';
  emailInput = '';
  showNotification = false;
  notificationMessage = '';

  constructor(private auth: AuthService, private router: Router) {
    // Try to get email from router state
    this.email = history.state?.email || '';
    console.log('Email from navigation state:', this.email);
  }

  verify() {
    const emailToUse = this.email || this.emailInput;
    if (!emailToUse) {
      this.showError('Email is required');
      return;
    }
    this.auth.verifyOtp(emailToUse, this.otp).subscribe({
      next: (response: any) => {
        if (response && response.errorMessage) {
          this.showError(response.errorMessage);
          return;
        }
        this.router.navigate(['/register'], {
          state: {
            email: emailToUse
          }
        });
      },
      error: (e: any) => {
        if (e?.error?.errorMessage) {
          this.showError(e.error.errorMessage);
        } else {
          this.showError('Invalid OTP');
        }
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
  // Bottom nav logic
  bottomNavItems = [
    { label: 'Home', route: '/' },
    { label: 'Cards', route: '/cards' },
    { label: 'Star', route: '/leaderboard' },
    { label: 'Person', route: '/friends' },
    { label: 'Profile', route: '/profile' }
  ];
  getIconForRoute(route: string): string {
    const icons: { [key: string]: string } = {
      '/': '🏠',
      '/cards': '🃏',
      '/leaderboard': '⭐',
      '/friends': '👥',
      '/profile': '👤'
    };
    return icons[route] || '📄';
  }
  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
  navigate(route: string) {
    this.router.navigate([route]);
  }
}
