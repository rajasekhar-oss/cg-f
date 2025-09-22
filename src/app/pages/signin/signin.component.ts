import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
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
}
