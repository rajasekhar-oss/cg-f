import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  username = '';
  password = '';
  email = '';
  msg = '';
  isError = true;
  
  constructor(private auth: AuthService, private router: Router) {
    // Get email from navigation state
    this.email = history.state?.email || '';
    console.log('Register component - Email:', this.email);
  }
  register(){
    if (!this.email) {
      this.msg = 'Email is required';
      this.isError = true;
      return;
    }
    
    if (!this.username.trim()) {
      this.msg = 'Username is required';
      this.isError = true;
      return;
    }
    
    if (!this.password.trim()) {
      this.msg = 'Password is required';
      this.isError = true;
      return;
    }
    
    this.auth.register({
      username: this.username, 
      email: this.email, 
      password: this.password
    }).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        this.msg = 'Registration successful! Redirecting to login...';
        this.isError = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (e: any) => {
        console.error('Registration failed', e);
        this.msg = e?.error?.message || e?.message || 'Register failed';
        this.isError = true;
      }
    });
  }
}
