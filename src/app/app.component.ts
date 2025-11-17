import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from './services/notification.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'app';
  notificationMessage: string | null = null;
  isDarkMode = false;

  constructor(private notification: NotificationService) {
    this.notification.message$.subscribe(msg => {
      this.notificationMessage = msg;
    });
  }

  ngOnInit() {
    // On app load, read theme from localStorage and apply
    const theme = localStorage.getItem('theme');
    this.isDarkMode = theme === 'dark';
    this.applyTheme(this.isDarkMode);
  }

  applyTheme(isDark: boolean) {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  // This can be called from anywhere (e.g., via a service or event)
  setDarkMode(isDark: boolean) {
    this.isDarkMode = isDark;
    this.applyTheme(isDark);
  }
}
