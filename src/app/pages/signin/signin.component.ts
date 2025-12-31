import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorNotificationComponent],
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SignInComponent {
  email = '';
  loading = false;
  showNotification = false;
  notificationMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  send() {
    if (!/.+@.+\..+/.test(this.email)) {
      this.showError('Please enter a valid email address.');
      return;
    }
    this.showNotification = false;
    this.notificationMessage = '';
    this.loading = true;
    this.auth.sendOtp(this.email).subscribe({
      next: (response: any) => {
        if (response && response.errorMessage) {
          this.showError(response.errorMessage);
          this.loading = false;
          return;
        }
        this.loading = false;
        this.router.navigate(['/verify-otp'], {
          state: { email: this.email }
        });
      },
      error: (e: any) => {
        this.loading = false;
        if (e?.error?.errorMessage) {
          this.showError(e.error.errorMessage);
        } else {
          this.showError(e?.error?.message || e?.message || 'Failed to send OTP');
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
    { label: 'Leaderboard', route: '/leaderboard' },
    { label: 'Profile', route: '/profile' }
  ];
  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
  navigate(route: string) {
    this.router.navigate([route]);
  }
}
