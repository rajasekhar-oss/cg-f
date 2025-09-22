import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
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
}