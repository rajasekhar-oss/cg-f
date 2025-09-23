import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../shared/bottom-nav.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, BottomNavComponent],
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html'
})
export class VerifyOtpComponent {
  otp = '';
  email = '';
  emailInput = '';
  err = '';
  
  constructor(private auth: AuthService, private router: Router) {
    // Try to get email from router state
    this.email = history.state?.email || '';
    console.log('Email from navigation state:', this.email);
  }
  
  verify(){
    const emailToUse = this.email || this.emailInput;
    if (!emailToUse) {
      this.err = 'Email is required';
      return;
    }
    
    this.auth.verifyOtp(emailToUse, this.otp).subscribe({
      next: (response) => {
        console.log('OTP verified successfully', response);
        this.router.navigate(['/register'], { 
          state: { 
            email: emailToUse
          } 
        });
      },
      error: (e: any) => {
        console.error('OTP verification failed', e);
        this.err = 'Invalid OTP';
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
