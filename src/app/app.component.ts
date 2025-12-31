import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from './services/notification.service';
import { ImageApiService } from './services/image-api.service';
import { ImagePreloadService } from './services/image-preload.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  title = 'app';
  notificationMessage: string | null = null;
  isDarkMode = false;

  constructor(
    private readonly notification: NotificationService,
    private readonly imageApi: ImageApiService,
    private readonly imagePreload: ImagePreloadService
  ) {
    this.notification.message$.subscribe(msg => {
      this.notificationMessage = msg;
    });
  }

  ngOnInit(): void {
    // On app load, read theme from localStorage and apply
    const theme = localStorage.getItem('theme');
    this.isDarkMode = theme === 'dark';
    this.applyTheme(this.isDarkMode);

    this.imageApi.getImageLinks().subscribe({
      next: urls => this.imagePreload.preloadImages(urls),
      error: () => {
        console.warn('Image preload failed. World still spins.');
      }
    });
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
