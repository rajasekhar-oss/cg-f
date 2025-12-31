import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
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
    <div class="rankings-page" #rankingsPage>
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
             [style.background]="i === 0 ? 'var(--card-bg)' : 'var(--bg-2)'"
             [style.borderColor]="i === 0 ? 'var(--card-border)' : 'var(--border-1)'"
             [style.color]="i === 0 ? 'var(--btn-primary-text)' : null">
          <div class="rankings-usercell">
            <ng-container *ngIf="player.pictureUrl; else noPic">
              <img [src]="player.pictureUrl" class="rankings-avatar" [alt]="player.username"
                [style.borderColor]="'var(--blue-2)'" [style.background]="'var(--bg-3)'" [style.color]="'var(--blue-2)'" />
            </ng-container>
            <ng-template #noPic>
              <span class="rankings-avatar avatar-initial"
                [style.background]="'var(--blue-1)'"
                [style.color]="'var(--blue-2)'">
                {{ (i === 0 ? 'Y' : (player.username ? player.username.charAt(0).toUpperCase() : '?')) }}
              </span>
            </ng-template>
            <span class="rankings-username" [style.color]="'var(--text-1)'">
              {{ localUsername === player.username ? 'You' : player.username }}
              <ng-container *ngIf="player.rank === 1">
                <span class="rank-crown" title="Top 1" [style.color]="'var(--orange-1)'">👑</span>
              </ng-container>
              <ng-container *ngIf="player.rank === 2">
                <span class="rank-medal silver" title="Top 2" [style.color]="'var(--gray-2)'">🥈</span>
              </ng-container>
              <ng-container *ngIf="player.rank === 3">
                <span class="rank-medal bronze" title="Top 3" [style.color]="'var(--orange-2)'">🥉</span>
              </ng-container>
            </span>
          </div>
          <span class="rankings-rank" [style.color]="'var(--blue-2)'">{{player.rank}}</span>
          <span class="rankings-cards" [style.color]="'var(--blue-3)'">{{player.cardsCount}}</span>
        </div>
      </div>
      <div class="rankings-pagination">
        <button class="pagination-button" *ngIf="hasPrevPage" (click)="prevPage()"
          [ngClass]="{'with-bottom-nav': showBottomNav}"
          [style.background]="'var(--blue-2)'" [style.color]="'var(--text-on-primary)'">
          Previous
        </button>
        <button class="pagination-button" *ngIf="hasNextPage" (click)="nextPage()"
          [ngClass]="{'with-bottom-nav': showBottomNav}"
          [style.background]="'var(--blue-2)'" [style.color]="'var(--text-on-primary)'">
          Next 
        </button>
      </div>
    </div>
    <app-bottom-nav
      [bottomNavItems]="bottomNavItems"
      [isActiveRoute]="isActiveRoute.bind(this)"
      [navigate]="navigate.bind(this)">
    </app-bottom-nav>
  `,
  styles: [`
    .rankings-page {
      width: 100vw;
      max-width: 100vw;
      padding: 4vw 0 4vw 0;
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
      background: var(--blue-3);
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
      min-height: 48px;
      border: 1px solid var(--border-1);
    }
    .rankings-row:hover {
      box-shadow: 0 4px 18px var(--shadow-2);
      transform: translateY(-2px) scale(1.01);
      background: var(--bg-3);
    }
    .local-user-row {
      background: var(--card-bg) !important;
      border: 2px solid var(--card-border);
      box-shadow: var(--card-shadow);
      font-weight: 700;
      color: var(--btn-primary-text);
      transition: box-shadow 0.2s, background 0.2s, color 0.2s;
    }
    .local-user-row:hover {
      background: var(--btn-primary-bg);
      box-shadow: var(--shadow-md-hover);
      color: var(--btn-primary-text);
      font-size: 2.2vw;
    }
    .rank-crown {
      margin-left: 0.5vw;
      font-size: 2.2vw;
      color: var(--orange-1);
      vertical-align: middle;
      filter: drop-shadow(0 1px 2px var(--orange-2));
    }
    .rank-medal {
      margin-left: 0.5vw;
      font-size: 2vw;
      vertical-align: middle;
    }
    .rank-medal.silver {
      color: var(--gray-2);
      filter: drop-shadow(0 1px 2px var(--border-2));
    }
    .rank-medal.bronze {
      color: var(--orange-2);
      filter: drop-shadow(0 1px 2px var(--yellow-3));
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
      background: var(--blue-1);
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
      margin: 2vw 1vw;
    }
    .pagination-button {
      background: var(--blue-2);
      color: var(--text-on-primary);
      border: none;
      border-radius: 1vw;
      padding: 1vw 2vw;
      font-size: 2vw;
      cursor: pointer;
      transition: background 0.3s;
      box-shadow: none;
    }
    .pagination-button.with-bottom-nav {
      margin-bottom: var(--bottom-nav-height);
    }
    .pagination-button:hover {
      background: var(--blue-3);
      box-shadow: 0 2px 8px var(--shadow-1);
    }
  `]
})
export class RankingsComponent implements OnInit, AfterViewInit, OnDestroy {
    localUsername: string = '';
  @ViewChild('rankingsPage', { static: true }) rankingsPageRef!: ElementRef<HTMLElement>;
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
    { label: 'Leaderboard', route: '/leaderboard' },
    { label: 'Profile', route: '/profile' }
  ];
  page = 0;
  size = 10;
  private resizeTimeout: any = null;
  private minRows = 3;
  private maxRows = 100;
  hasNextPage = false;
  hasPrevPage = false;
  totalLoaded = 0;
  showBottomNav = true; // Set this based on your logic for when bottom nav should be shown

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadPage(0);
    this.api.get('/users/me').subscribe({
                next: (profileData: any) => {
                    if (profileData && profileData.errorMessage) {
                        this.showError(profileData.errorMessage);
                        return;
                    }
                    this.localUsername = profileData.username;
                }
            });
  }

  ngAfterViewInit() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.calculateSizeAndLoad();
      });
    });
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('orientationchange', this.onWindowResize);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('orientationchange', this.onWindowResize);
  }

  private onWindowResize = () => {
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      setTimeout(() => {
        this.calculateSizeAndLoad();
      }, 0);
    }, 150);
  };

  private calculateSizeAndLoad() {
    try {
      const viewportHeight = window.innerHeight;
      const rankingsPageEl = this.rankingsPageRef.nativeElement;
      const searchEl = rankingsPageEl.querySelector('.rankings-search') as HTMLElement | null;
      const headerEl = rankingsPageEl.querySelector('.rankings-header-row') as HTMLElement | null;
      const paginationEl = rankingsPageEl.querySelector('.rankings-pagination') as HTMLElement | null;
      const rankingsListEl = rankingsPageEl.querySelector('.rankings-list') as HTMLElement | null;
      const topNavEl = document.querySelector('app-top-nav') as HTMLElement | null;

      // Get bottom nav height from CSS variable
      let bottomNavHeight = 0;
      const cssBottomNavHeight = window.getComputedStyle(document.documentElement).getPropertyValue('--bottom-nav-height');
      if (cssBottomNavHeight) {
        bottomNavHeight = parseFloat(cssBottomNavHeight) || 0;
      }
      // If not set, fallback to 0
      const heightsToRemove = [
        topNavEl?.getBoundingClientRect().height || 0,
        bottomNavHeight,
        searchEl?.getBoundingClientRect().height || 0,
        headerEl?.getBoundingClientRect().height || 0,
        paginationEl?.getBoundingClientRect().height || 0,
      ];

      const style = window.getComputedStyle(rankingsPageEl);
      const paddingTop = parseFloat(style.paddingTop || '0');
      const paddingBottom = parseFloat(style.paddingBottom || '0');

      const usedHeight = heightsToRemove.reduce((a, b) => a + b, 0) + paddingTop + paddingBottom + 8;
      const availableHeight = viewportHeight - usedHeight;

      // Measure one row height inside rankings-list for accuracy
      let rowHeight = 48; // fallback
      if (rankingsListEl) {
        const firstRealRow = rankingsListEl.querySelector('.rankings-row') as HTMLElement;
        if (firstRealRow) {
          const clone = firstRealRow.cloneNode(true) as HTMLElement;
          clone.style.opacity = '0';
          clone.style.pointerEvents = 'none';
          clone.style.position = 'static';
          rankingsListEl.appendChild(clone);
          void clone.offsetHeight;
          rowHeight = clone.getBoundingClientRect().height;
          rankingsListEl.removeChild(clone);
        }
      }

      let rows = Math.floor(availableHeight / rowHeight);
      rows = Math.max(this.minRows, Math.min(this.maxRows, rows));

      if (rows !== this.size) {
        this.size = rows;
        this.loadPage(0);
      }
    } catch (err) {
      this.size = this.minRows;
      this.loadPage(0);
    }
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

      // ⭐ REQUIRED FIX ⭐
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.calculateSizeAndLoad();
        });
      });

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

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
  navigate(route: string) {
    this.router.navigate([route]);
  }
}
