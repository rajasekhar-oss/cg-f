import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorNotificationComponent],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  showNotification = false;
  notificationMessage = '';

  constructor(private auth: AuthService, private router: Router, private api: ApiService) {}

  login() {
    this.showNotification = false;
    this.notificationMessage = '';
    this.auth.login({ usernameOrEmail: this.username, password: this.password }).subscribe({
      next: (res: any) => {
        if (res && res.errorMessage) {
          this.showError(res.errorMessage);
          return;
        }
        this.router.navigate(['/']);
      },
      error: (e: any) => {
        if (e?.error?.errorMessage) {
          this.showError(e.error.errorMessage);
        } else if (e?.error && typeof e.error === 'object' && e.error.message) {
          this.showError(e.error.message);
        } else if (typeof e?.error === 'string') {
          this.showError(e.error);
        } else {
          this.showError('Invalid credentials');
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
}
