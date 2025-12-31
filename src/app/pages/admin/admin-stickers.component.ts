import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Sticker, StickerDto } from '../../models/sticker.model';
import { BottomNavComponent } from '../../shared/bottom-nav.component';

@Component({
  standalone: true,
  selector: 'app-admin-stickers',
  imports: [CommonModule, FormsModule, BottomNavComponent],
  template: `
    <div style="display: flex; flex-direction: column; align-items: center; min-height: 80vh; background: #f3f4f6; padding: 32px 0;">
      <div style="background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 40px 32px; min-width: 340px; max-width: 480px; width: 100%; text-align: center; margin-bottom: 32px;">
        <h2 style="font-size: 2rem; font-weight: 700; color: #1f2937; margin-bottom: 28px; letter-spacing: -1px;">Admin: Stickers</h2>
        <form (ngSubmit)="createSticker()" style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 18px;">
          <input [(ngModel)]="dto.name" name="name" placeholder="Name" required style="padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem;" />
          <input [(ngModel)]="dto.imageUrl" name="imageUrl" placeholder="Image URL" required style="padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem;" />
          <button type="submit" style="padding: 14px 0; font-size: 1.1rem; border-radius: 10px; background: linear-gradient(90deg, #10b981 60%, #3b82f6 100%); color: white; border: none; cursor: pointer; font-weight: 600; letter-spacing: 0.5px; margin-top: 8px;">Create Sticker</button>
        </form>
        <div *ngIf="msg" style="color: #059669; font-weight: 500; margin-bottom: 8px;">{{msg}}</div>
        <div *ngIf="error" style="color: #dc2626; font-weight: 500; margin-bottom: 8px;">{{error}}</div>
      </div>
    </div>
    <div style="padding-bottom: var(--bottom-nav-height);">
    <app-bottom-nav
      [bottomNavItems]="bottomNavItems"
      [isActiveRoute]="isActiveRoute.bind(this)"
      [navigate]="navigate.bind(this)">
    </app-bottom-nav>
    </div>
  `
})
export class AdminStickersComponent {
  stickers: Sticker[] = [];
  dto: StickerDto = { name: '', imageUrl: '' };
  msg = '';
  error = '';

  bottomNavItems = [
    { label: 'Home', route: '/' },
    { label: 'Cards', route: '/cards' },
    { label: 'Leaderboard', route: '/leaderboard' },
    { label: 'Profile', route: '/profile' }
  ];

  constructor(private admin: AdminService) {}

  createSticker() {
    this.msg = '';
    this.error = '';
    this.admin.createSticker(this.dto).subscribe({
      next: (s) => {
        this.msg = 'Sticker created!';
        this.stickers.push(s);
      },
      error: (e) => {
        this.error = e?.error?.error || e?.message || 'Error creating sticker';
      }
    });
  }

  navigate(route: string) {
    window.location.href = route;
  }

  isActiveRoute(route: string): boolean {
    return window.location.pathname === route;
  }
}
