import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../shared/bottom-nav.component';

@Component({
  selector: 'app-rankings',
  standalone: true,
  imports: [CommonModule, FormsModule, BottomNavComponent],
  template: `
    <div class="rankings-page">
      <input class="rankings-search" [(ngModel)]="search" placeholder="Search players by name..." />
      <div class="rankings-header-row">
        <span>Name</span>
        <span>Points</span>
        <span>Rank</span>
      </div>
      <div class="rankings-list">
        <div *ngFor="let player of filteredPlayers(); let i = index" class="rankings-row">
          <img *ngIf="player.profilePicture" [src]="player.profilePicture" class="rankings-avatar" [alt]="player.username" />
          <span class="rankings-username" (click)="openProfile(player)">{{player.username}}</span>
          <span>{{player.points}}</span>
          <span>{{player.rank || (i+1)}}</span>
        </div>
      </div>
    </div>
    <app-bottom-nav
      [bottomNavItems]="bottomNavItems"
      [getIconForRoute]="getIconForRoute.bind(this)"
      [isActiveRoute]="isActiveRoute.bind(this)"
      [navigate]="navigate.bind(this)">
    </app-bottom-nav>
  `,
  styles: [`
    .rankings-page {
      width: 100vw;
      max-width: 100vw;
      padding: 4vw 0 12vw 0;
      box-sizing: border-box;
    }
    .rankings-search {
      width: 90vw;
      margin: 0 5vw 3vw 5vw;
      padding: 1vw 2vw;
      font-size: 2vw;
      border-radius: 1vw;
      border: 1px solid #d1d5db;
    }
    .rankings-header-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 2vw;
      font-weight: 700;
      color: #374151;
      background: #f3f4f6;
      padding: 1vw 4vw;
      border-radius: 1vw;
      margin: 0 2vw 2vw 2vw;
      font-size: 2vw;
    }
    .rankings-list {
      display: flex;
      flex-direction: column;
      gap: 1vw;
      margin: 0 2vw;
    }
    .rankings-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      align-items: center;
      gap: 2vw;
      background: #fff;
      border-radius: 1vw;
      box-shadow: 0 2px 8px #e5e7eb;
      padding: 1vw 4vw;
      font-size: 2vw;
      cursor: pointer;
      transition: box-shadow 0.2s;
    }
    .rankings-avatar {
      width: 3vw;
      height: 3vw;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 1vw;
      vertical-align: middle;
    }
    .rankings-username {
      color: #2563eb;
      text-decoration: underline;
      cursor: pointer;
    }
  `]
})
export class RankingsComponent {
  @Input() players: any[] = [];
  search: string = '';

  bottomNavItems = [
    { label: 'Home', route: '/' },
    { label: 'Cards', route: '/cards' },
    { label: 'Star', route: '/leaderboard' },
    { label: 'Person', route: '/friends' },
    { label: 'Profile', route: '/profile' }
  ];

  constructor(private router: Router) {}

  filteredPlayers() {
    if (!this.search) return this.players;
    return this.players.filter(p => p.username?.toLowerCase().includes(this.search.toLowerCase()));
  }

  getIconForRoute(route: string): string {
    const icons: { [key: string]: string } = {
      '/': '\ud83c\udfe0',
      '/cards': '\ud83c\udccf',
      '/leaderboard': '\u2b50',
      '/friends': '\ud83d\udc65',
      '/profile': '\ud83d\udc64'
    };
    return icons[route] || '\ud83d\udcc4';
  }
  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
  navigate(route: string) {
    this.router.navigate([route]);
  }

  openProfile(player: any) {
    this.router.navigate(['/profile', player.id]);
  }
}
