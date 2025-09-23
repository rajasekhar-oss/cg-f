import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Card, CardRequestDto } from '../../models/card.model';
import { ResponseDto } from '../../models/response-dto.model';
import { BottomNavComponent } from '../../shared/bottom-nav.component';

@Component({
  standalone: true,
  selector: 'app-admin-cards',
  imports: [CommonModule, FormsModule, BottomNavComponent],
  template: `
    <div style="display: flex; flex-direction: column; align-items: center; min-height: 80vh; background: #f3f4f6; padding: 32px 0;">
      <div style="background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 40px 32px; min-width: 340px; max-width: 480px; width: 100%; text-align: center; margin-bottom: 32px;">
        <h2 style="font-size: 2rem; font-weight: 700; color: #1f2937; margin-bottom: 28px; letter-spacing: -1px;">Admin: Cards</h2>
        <form (ngSubmit)="createCard()" style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 18px;">
          <label style="text-align: left; font-weight: 500; color: #374151;">Total Films
            <input [(ngModel)]="dto.totalFilms" name="totalFilms" type="number" required style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
          </label>
          <label style="text-align: left; font-weight: 500; color: #374151;">Years Active
            <input [(ngModel)]="dto.yearsActive" name="yearsActive" type="number" required style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
          </label>
          <label style="text-align: left; font-weight: 500; color: #374151;">Highest Grossing
            <input [(ngModel)]="dto.highestGrossing" name="highestGrossing" required style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
          </label>
          <label style="text-align: left; font-weight: 500; color: #374151;">Awards Won
            <input [(ngModel)]="dto.awardsWon" name="awardsWon" type="number" required style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
          </label>
          <label style="text-align: left; font-weight: 500; color: #374151;">Followers
            <input [(ngModel)]="dto.followers" name="followers" required style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
          </label>
          <label style="text-align: left; font-weight: 500; color: #374151;">Languages (as integer)
            <input [(ngModel)]="dto.languagesStr" name="languages" required style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
          </label>
          <label style="text-align: left; font-weight: 500; color: #374151;">Professions (as integer)
            <input [(ngModel)]="dto.professionsStr" name="professions" required style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
          </label>
          <button type="submit" style="padding: 14px 0; font-size: 1.1rem; border-radius: 10px; background: linear-gradient(90deg, #8b5cf6 60%, #3b82f6 100%); color: white; border: none; cursor: pointer; font-weight: 600; letter-spacing: 0.5px; margin-top: 8px;">Create Card</button>
        </form>
        <div *ngIf="msg" style="color: #059669; font-weight: 500; margin-bottom: 8px;">{{msg}}</div>
        <div *ngIf="error" style="color: #dc2626; font-weight: 500; margin-bottom: 8px;">{{error}}</div>
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
export class AdminCardsComponent {
  cards: Card[] = [];
  dto: any = { totalFilms: '', yearsActive: '', highestGrossing: '', awardsWon: '', followers: '', languagesStr: '', professionsStr: '' };
  msg = '';
  error = '';

  bottomNavItems = [
    { label: 'Home', route: '/' },
    { label: 'Cards', route: '/cards' },
    { label: 'Star', route: '/leaderboard' },
    { label: 'Person', route: '/friends' },
    { label: 'Profile', route: '/profile' }
  ];

  constructor(private admin: AdminService) {
    // Optionally fetch existing cards
    // this.admin.getCards().subscribe(c => this.cards = c);
  }

  createCard() {
    this.msg = '';
    this.error = '';
    const payload: CardRequestDto = {
      totalFilms: Number(this.dto.totalFilms),
      yearsActive: Number(this.dto.yearsActive),
      highestGrossing: this.dto.highestGrossing,
      awardsWon: Number(this.dto.awardsWon),
      followers: this.dto.followers,
  languages: Number(this.dto.languagesStr),
  professions: Number(this.dto.professionsStr)
    };
    this.admin.create(payload).subscribe({
      next: (c) => {
        this.msg = 'Card created!';
        this.cards.push(c);
      },
      error: (e) => {
        this.error = e?.error?.error || e?.message || 'Error creating card';
      }
    });
  }

  deleteCard(id: number) {
    this.admin.deleteCard(id).subscribe({
      next: (res: ResponseDto) => {
        this.msg = res.message;
        this.cards = this.cards.filter(c => c.id !== id);
      },
      error: (e) => {
        this.error = e?.error?.error || e?.message || 'Error deleting card';
      }
    });
  }

  navigate(route: string) {
    window.location.href = route;
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
    return window.location.pathname === route;
  }
}
