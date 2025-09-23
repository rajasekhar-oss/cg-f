import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../shared/bottom-nav.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, BottomNavComponent],
  selector: 'app-signin',
  templateUrl: './signin.component.html'
})
export class SignInComponent {
  email = '';
  error = '';
  loading = false;
  constructor(private auth: AuthService, private router: Router) {}
  send() {
    if (!/.+@.+\..+/.test(this.email)) { 
      this.error = 'Please enter a valid email address.'; 
      return; 
    }
    
    this.error = ''; // Clear previous errors
    this.loading = true; // Start loading
    
    this.auth.sendOtp(this.email).subscribe({
      next: (response) => {
        console.log('OTP sent successfully', response);
        this.loading = false;
        this.router.navigate(['/verify-otp'], { 
          state: { email: this.email } 
        });
      },
      error: (e: any) => {
        console.error('Failed to send OTP', e);
        this.loading = false;
        this.error = e?.error?.message || e?.message || 'Failed to send OTP';
      }
    });
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
