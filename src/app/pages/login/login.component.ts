import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username=''; password=''; err='';
  constructor(private auth: AuthService, private router: Router, private api: ApiService){}
  login(){
    this.err = '';
    this.auth.login({ usernameOrEmail: this.username, password: this.password }).subscribe({
      next: () => { this.router.navigate(['/']); },
      error: (e: any) => {
        if (e?.error && typeof e.error === 'object' && e.error.message) {
          this.err = e.error.message;
        } else if (typeof e?.error === 'string') {
          this.err = e.error;
        } else {
          this.err = 'Invalid credentials';
        }
      }
    });
  }
}
