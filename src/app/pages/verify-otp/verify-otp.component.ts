import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
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
}
