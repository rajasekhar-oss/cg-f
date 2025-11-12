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
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  username = '';
  password = '';
  email = '';
  showNotification = false;
  notificationMessage = '';

  constructor(private auth: AuthService, private router: Router) {
    // Get email from navigation state
    this.email = history.state?.email || '';
    console.log('Register component - Email:', this.email);
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
    if (!this.password.trim()) {
      this.showError('Password is required');
      return;
    }
    this.auth.register({
      username: this.username,
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
