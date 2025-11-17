import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { PlayerRankDto } from '../../interfaces/player-rank-dto';
import { BottomNavComponent } from '../../shared/bottom-nav.component';
import { TopNavComponent } from '../../shared/top-nav/top-nav.component';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';

@Component({
  selector: 'app-rankings',
  standalone: true,
  imports: [CommonModule, FormsModule, BottomNavComponent, TopNavComponent, ErrorNotificationComponent],
  template: `
  <app-error-notification *ngIf="showNotification" [message]="notificationMessage" (closed)="onNotificationClosed()"></app-error-notification>
  <app-top-nav
      [topNavItems]="bottomNavItems"
      [isActiveRoute]="isActiveRoute.bind(this)"
      [navigate]="navigate.bind(this)"
    ></app-top-nav>
    <div class="rankings-page">
      <input class="rankings-search" [(ngModel)]="search" placeholder="Search players by name..."
        [style.background]="'var(--bg-2)'" [style.color]="'var(--text-1)'" [style.borderColor]="'var(--border-1)'" />
      <div class="rankings-header-row">
        <span class="header-player" [style.color]="'var(--text-2)'">Player</span>
        <span class="header-rank" [style.color]="'var(--text-2)'">Rank</span>
        <span class="header-cards" [style.color]="'var(--text-2)'">Cards</span>
      </div>
      <div class="rankings-list">
        <div *ngFor="let player of filteredPlayers(); let i = index"
             [ngClass]="{'rankings-row': true, 'local-user-row': i === 0}"
             [style.background]="i === 0 ? 'linear-gradient(90deg, var(--yellow-1, #fef9c3) 0%, var(--bg-2) 100%)' : 'var(--bg-2)'"
             [style.borderColor]="i === 0 ? 'var(--yellow-2, #facc15)' : 'var(--border-1)'"
             [style.color]="i === 0 ? 'var(--text-1)' : null">
          <div class="rankings-usercell">
            <ng-container *ngIf="player.pictureUrl; else noPic">
              <img [src]="player.pictureUrl" class="rankings-avatar" [alt]="player.username"
                [style.borderColor]="'var(--blue-2)'" [style.background]="'var(--bg-3)'" [style.color]="'var(--blue-2)'" />
            </ng-container>
            <ng-template #noPic>
              <span class="rankings-avatar avatar-initial"
                [style.background]="'linear-gradient(135deg, var(--blue-1) 0%, var(--bg-2) 100%)'"
                [style.color]="'var(--blue-2)'">
                {{ (i === 0 ? 'Y' : (player.username ? player.username.charAt(0).toUpperCase() : '?')) }}
              </span>
            </ng-template>
            <span class="rankings-username" [style.color]="'var(--text-1)'">
              {{ i === 0 ? 'You' : player.username }}
              <ng-container *ngIf="player.rank === 1">
                <span class="rank-crown" title="Top 1" [style.color]="'var(--orange-1, #f59e42)'">👑</span>
              </ng-container>
              <ng-container *ngIf="player.rank === 2">
                <span class="rank-medal silver" title="Top 2" [style.color]="'var(--gray-2, #a3a3a3)'">🥈</span>
              </ng-container>
              <ng-container *ngIf="player.rank === 3">
                <span class="rank-medal bronze" title="Top 3" [style.color]="'var(--orange-2, #b45309)'">🥉</span>
              </ng-container>
            </span>
          </div>
          <span class="rankings-rank" [style.color]="'var(--blue-2)'">{{player.rank}}</span>
          <span class="rankings-cards" [style.color]="'var(--blue-3)'">{{player.cardsCount}}</span>
        </div>
      </div>
      <div class="rankings-pagination">
        <button class="pagination-button" *ngIf="hasPrevPage" (click)="prevPage()"
          [style.background]="'var(--blue-2)'" [style.color]="'var(--text-on-primary, #fff)'">
          &#8592; Previous
        </button>
        <button class="pagination-button" *ngIf="hasNextPage" (click)="nextPage()"
          [style.background]="'var(--blue-2)'" [style.color]="'var(--text-on-primary, #fff)'">
          Next &#8594;
        </button>
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
      background: var(--bg-1);
    }
    .rankings-search {
      width: 90vw;
      margin: 0 5vw 3vw 5vw;
      padding: 1vw 2vw;
      font-size: 2vw;
      border-radius: 1vw;
      border: 1px solid var(--border-1);
      background: var(--bg-2);
      color: var(--text-1);
    }
    .rankings-header-row {
      display: grid;
      grid-template-columns: 2.5fr 1fr 1fr;
      align-items: center;
      gap: 2vw;
      font-weight: 700;
      color: var(--text-2);
      background: linear-gradient(90deg, var(--blue-1) 0%, var(--bg-2) 100%);
      padding: 1.5vw 4vw;
      border-radius: 1vw;
      margin: 0 2vw 2vw 2vw;
      font-size: 2.2vw;
      box-shadow: none;
      letter-spacing: 0.03em;
      border: 1px solid var(--border-2);
    }
    .header-player, .header-rank, .header-cards {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      color: var(--text-2);
    }
    .header-rank, .header-cards {
      justify-content: center;
    }
    .rankings-list {
      display: flex;
      flex-direction: column;
      gap: 1.5vw;
      margin: 0 2vw;
    }
    .rankings-row {
      display: grid;
      grid-template-columns: 2.5fr 1fr 1fr;
      align-items: center;
      gap: 2vw;
      background: var(--bg-2);
      border-radius: 1vw;
      box-shadow: none;
      padding: 1.5vw 4vw;
      font-size: 2.1vw;
      cursor: pointer;
      transition: box-shadow 0.2s, transform 0.2s;
      min-height: 5vw;
      border: 1px solid var(--border-1);
    }
    .rankings-row:hover {
      box-shadow: 0 4px 18px var(--shadow-2, var(--blue-2));
      transform: translateY(-2px) scale(1.01);
      background: var(--bg-3);
    }
    .local-user-row {
      background: linear-gradient(90deg, var(--yellow-1, #fef9c3) 0%, var(--bg-2) 100%) !important;
      border: 2px solid var(--yellow-2, #facc15);
      box-shadow: none;
    }
    .local-user-row:hover {
      box-shadow: 0 4px 18px var(--yellow-3, #fde68a);
      font-weight: 700;
      font-size: 2.2vw;
      color: var(--text-1);
    }
    .rank-crown {
      margin-left: 0.5vw;
      font-size: 2.2vw;
      color: var(--orange-1, #f59e42);
      vertical-align: middle;
      filter: drop-shadow(0 1px 2px var(--orange-2, #fbbf24));
    }
    .rank-medal {
      margin-left: 0.5vw;
      font-size: 2vw;
      vertical-align: middle;
    }
    .rank-medal.silver {
      color: var(--gray-2, #a3a3a3);
      filter: drop-shadow(0 1px 2px var(--border-2, #d1d5db));
    }
    .rank-medal.bronze {
      color: var(--orange-2, #b45309);
      filter: drop-shadow(0 1px 2px var(--yellow-3, #fde68a));
    }
    .rankings-usercell {
      display: flex;
      align-items: center;
      gap: 1vw;
    }
    .rankings-avatar {
      width: 3.5vw;
      height: 3.5vw;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1vw;
      border: 2px solid var(--blue-2);
      box-shadow: none;
    }
    .rankings-avatar:hover {
      box-shadow: 0 1px 4px var(--blue-1);
      background: var(--bg-3);
      font-size: 1.7vw;
      font-weight: 700;
      color: var(--blue-2);
      object-fit: cover;
      text-transform: uppercase;
    }
    .avatar-initial {
      background: linear-gradient(135deg, var(--blue-1) 0%, var(--bg-2) 100%);
      color: var(--blue-2);
    }
    .rankings-username {
      color: var(--text-1);
      font-weight: 600;
      font-size: 2vw;
      letter-spacing: 0.01em;
      margin-left: 0.2vw;
    }
    .rankings-rank {
      color: var(--blue-2);
      font-weight: 700;
      font-size: 2vw;
      text-align: center;
    }
    .rankings-cards {
      color: var(--blue-3);
      font-weight: 600;
      font-size: 2vw;
      text-align: center;
    }
    .rankings-pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 2vw 0;
    }
    .pagination-button {
      background: var(--blue-2);
      color: var(--text-on-primary, #fff);
      border: none;
      border-radius: 1vw;
      padding: 1vw 2vw;
      font-size: 2vw;
      cursor: pointer;
      transition: background 0.3s;
      box-shadow: none;
    }
    .pagination-button:hover {
      background: var(--blue-3);
      box-shadow: 0 2px 8px var(--shadow-1, var(--blue-1));
    }
  `]
})
export class RankingsComponent implements OnInit {
  showNotification = false;
  notificationMessage = '';
  notificationCount = 0;
  onNotificationsClick = () => {
    this.navigate('/notifications');
  };
  players: PlayerRankDto[] = [];
  search: string = '';
  bottomNavItems = [
    { label: 'Home', route: '/' },
    { label: 'Cards', route: '/cards' },
    { label: 'Star', route: '/leaderboard' },
    { label: 'Person', route: '/friends' },
    { label: 'Profile', route: '/profile' }
  ];
  page = 0;
  size = 10;
  hasNextPage = false;
  hasPrevPage = false;
  totalLoaded = 0;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadPage(0);
  }

  loadPage(page: number) {
    this.api.get(`/api/players/ranks?page=${page}&size=${this.size}`).subscribe((data: any) => {
      if (data && data.errorMessage) {
        this.showError(data.errorMessage);
        this.players = [];
        this.hasNextPage = false;
        this.hasPrevPage = page > 0;
        return;
      }
      this.players = data;
      this.page = page;
      this.hasPrevPage = page > 0;
      this.hasNextPage = Array.isArray(data) && data.length === this.size;
      this.totalLoaded = page * this.size;
    }, (err) => {
      if (err?.error?.errorMessage) {
        this.showError(err.error.errorMessage);
      }
      this.players = [];
      this.hasNextPage = false;
      this.hasPrevPage = page > 0;
    });
  }

  nextPage() {
    if (this.hasNextPage) {
      this.loadPage(this.page + 1);
    }
  }

  prevPage() {
    if (this.hasPrevPage) {
      this.loadPage(this.page - 1);
    }
  }

  showError(msg: string) {
    this.notificationMessage = msg;
    this.showNotification = true;
  }

  onNotificationClosed() {
    this.showNotification = false;
    this.notificationMessage = '';
  }

  filteredPlayers() {
    if (!this.search) return this.players;
    return this.players.filter(p => p.username?.toLowerCase().includes(this.search.toLowerCase()));
  }

  getRankForIndex(i: number): number {
    return this.page * this.size + i + 1;
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
}
