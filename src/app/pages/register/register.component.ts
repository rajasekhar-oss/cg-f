import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorNotificationComponent],
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  mobile = '';
  password = '';
  email = '';
  showNotification = false;
  notificationMessage = '';

  constructor(private auth: AuthService, private router: Router) {
    // Get email from navigation state
    this.email = history.state?.email || '';
  }

  register() {
    if (!this.email) {
      this.showError('Email is required');
      return;
    }
    if (!this.username.trim()) {
      this.showError('Username is required');
      return;
    }
    if (!this.mobile.trim()) {
      this.showError('Mobile number is required');
      return;
    }
    if (!this.password.trim()) {
      this.showError('Password is required');
      return;
    }
    this.auth.register({
      username: this.username,
      mobileNumber: this.mobile,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response: any) => {
        if (response && response.errorMessage) {
          this.showError(response.errorMessage);
          return;
        }
        this.notificationMessage = 'Registration successful! Redirecting to login...';
        this.showNotification = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (e: any) => {
        if (e?.error?.errorMessage) {
          this.showError(e.error.errorMessage);
        } else {
          this.showError(e?.error?.message || e?.message || 'Register failed');
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
