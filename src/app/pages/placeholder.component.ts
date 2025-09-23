import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

  import { BottomNavComponent } from '../shared/bottom-nav.component';

@Component({
  standalone: true,
  imports: [CommonModule, BottomNavComponent],
  selector: 'app-placeholder',
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">{{ title }}</h1>
        <p class="text-gray-600 dark:text-gray-400">This page is coming soon!</p>
        <button 
          (click)="goBack()"
          class="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
          Go Back
        </button>
      </div>
    </div>
    <app-bottom-nav
      [bottomNavItems]="bottomNavItems"
      [getIconForRoute]="getIconForRoute.bind(this)"
      [isActiveRoute]="isActiveRoute.bind(this)"
      [navigate]="navigate.bind(this)">
    </app-bottom-nav>
  `
})
export class PlaceholderComponent {
  title = 'Page';
  
  constructor() {
    // Set title based on current route
    const path = window.location.pathname;
    this.title = this.getPageTitle(path);
  }

  private getPageTitle(path: string): string {
    const titles: { [key: string]: string } = {
      '/notifications': 'Notifications',
      '/gang-play': 'Gang Play',
      '/stranger-play': 'Stranger Play',
      '/temporary-play': 'Temporary Play',
      '/play-code': 'Play with Code',
      '/leaderboard': 'Leaderboard',
      '/friends': 'Friends'
    };
    return titles[path] || 'Page';
  }

  goBack() {
    window.history.back();
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
    return window.location.pathname === route;
  }
  navigate(route: string) {
    window.location.href = route;
  }
}