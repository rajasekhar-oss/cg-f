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
          <label style="text-align: left; font-weight: 500; color: #374151;">Name
            <input [(ngModel)]="dto.name" name="name" required style="margin-top: 4px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
          </label>
          <label style="text-align: left; font-weight: 500; color: #374151;">Image
            <input type="file" accept="image/*" name="image" (change)="onFileSelected($event)" style="margin-top: 4px; padding: 8px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem; width: 100%;" />
          </label>
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
  dto: any = { name: '', imageUrl: '', totalFilms: '', yearsActive: '', highestGrossing: '', awardsWon: '', followers: '', languagesStr: '', professionsStr: '' };
  selectedFile: File | null = null;
  onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  this.selectedFile = input.files[0];
  this.dto.image = this.selectedFile; // Update dto.image with the selected file
}
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
  const payload = new FormData();
  console.log(payload);
  console.log('name:', this.dto.name);
  console.log('image:', this.dto.image); // Should now log the selected image
  // console.log('imageUrl:', this.dto.imageUrl);
  console.log('totalFilms:', this.dto.totalFilms);
  console.log('yearsActive:', this.dto.yearsActive);
  console.log('highestGrossing:', this.dto.highestGrossing);
  console.log('awardsWon:', this.dto.awardsWon);
  console.log('followers:', this.dto.followers);
  console.log('languagesStr:', this.dto.languagesStr);
  console.log('professionsStr:', this.dto.professionsStr);

  if (this.dto.name) payload.append('name', String(this.dto.name));
  if (this.dto.image) {
    payload.append('pictureFile', this.dto.image); // Add the selected image file to FormData
  }
  if (this.dto.imageUrl) payload.append('picture', String(this.dto.imageUrl));
  if (this.dto.totalFilms) payload.append('totalFilms', String(this.dto.totalFilms));
  if (this.dto.yearsActive) payload.append('yearsActive', String(this.dto.yearsActive));
  if (this.dto.highestGrossing) payload.append('highestGrossing', String(this.dto.highestGrossing));
  if (this.dto.awardsWon ) payload.append('awardsWon', String(this.dto.awardsWon));
  if (this.dto.followers) payload.append('followers', String(this.dto.followers));
  if (this.dto.languagesStr) payload.append('languages', String(this.dto.languagesStr));
  if (this.dto.professionsStr) payload.append('professions', String(this.dto.professionsStr));
 // Instead of directly logging the payload, use FormData.entries() to view the contents
for (let [key, value] of payload.entries()) {
  console.log(key, value);
}


  this.admin.create(payload).subscribe({
    next: (c) => {
      this.msg = 'Card created!';
      this.cards.push(c);
      this.selectedFile = null;
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
