import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../shared/bottom-nav.component';

@Component({
  standalone: true,
  selector: 'app-admin-home',
  imports: [CommonModule, BottomNavComponent],
  template: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; background: #f3f4f6;">
      <div style="background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 48px 32px; min-width: 340px; max-width: 420px; width: 100%; text-align: center;">
        <h2 style="font-size: 2.2rem; font-weight: 700; color: #1f2937; margin-bottom: 32px; letter-spacing: -1px;">Admin Dashboard</h2>
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <button (click)="goTo('admin/achievements')" style="padding: 18px 0; font-size: 1.1rem; border-radius: 10px; background: linear-gradient(90deg, #3b82f6 60%, #6366f1 100%); color: white; border: none; cursor: pointer; font-weight: 600; letter-spacing: 0.5px; transition: box-shadow 0.2s; box-shadow: 0 2px 8px rgba(59,130,246,0.08);">🏆 Manage Achievements</button>
          <button (click)="goTo('admin/cards')" style="padding: 18px 0; font-size: 1.1rem; border-radius: 10px; background: linear-gradient(90deg, #8b5cf6 60%, #3b82f6 100%); color: white; border: none; cursor: pointer; font-weight: 600; letter-spacing: 0.5px; transition: box-shadow 0.2s; box-shadow: 0 2px 8px rgba(139,92,246,0.08);">🃏 Manage Cards</button>
          <button (click)="goTo('admin/cards-list')" style="padding: 18px 0; font-size: 1.1rem; border-radius: 10px; background: linear-gradient(90deg, #f59e42 60%, #fbbf24 100%); color: white; border: none; cursor: pointer; font-weight: 600; letter-spacing: 0.5px; transition: box-shadow 0.2s; box-shadow: 0 2px 8px rgba(251,191,36,0.08);">✏️ Update Card</button>
          <button (click)="goTo('admin/stickers')" style="padding: 18px 0; font-size: 1.1rem; border-radius: 10px; background: linear-gradient(90deg, #10b981 60%, #3b82f6 100%); color: white; border: none; cursor: pointer; font-weight: 600; letter-spacing: 0.5px; transition: box-shadow 0.2s; box-shadow: 0 2px 8px rgba(16,185,129,0.08);">💎 Manage Stickers</button>
        </div>
      </div>
    </div>
    <div style="padding-bottom: var(--bottom-nav-height);">
    <app-bottom-nav
      [bottomNavItems]="bottomNavItems"
      [getIconForRoute]="getIconForRoute.bind(this)"
      [isActiveRoute]="isActiveRoute.bind(this)"
      [navigate]="goTo.bind(this)">
    </app-bottom-nav>
    </div>
  `
})
export class AdminHomeComponent {
  bottomNavItems = [
    { label: 'Home', route: '/' },
    { label: 'Cards', route: '/cards' },
    { label: 'Star', route: '/leaderboard' },
    { label: 'Person', route: '/friends' },
    { label: 'Profile', route: '/profile' }
  ];

  constructor(private router: Router) {}

  goTo(route: string) {
    this.router.navigate([route]);
  }

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
}
