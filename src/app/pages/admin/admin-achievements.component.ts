import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Achievement, AchievementDto } from '../../models/achievement.model';
import { BottomNavComponent } from '../../shared/bottom-nav.component';

@Component({
  standalone: true,
  selector: 'app-admin-achievements',
  imports: [CommonModule, FormsModule, BottomNavComponent],
  template: `
    <div style="display: flex; flex-direction: column; align-items: center; min-height: 80vh; background: #f3f4f6; padding: 32px 0;">
      <div style="background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 40px 32px; min-width: 340px; max-width: 480px; width: 100%; text-align: center; margin-bottom: 32px;">
        <h2 style="font-size: 2rem; font-weight: 700; color: #1f2937; margin-bottom: 28px; letter-spacing: -1px;">Admin: Achievements</h2>
        <form (ngSubmit)="createAchievement()" style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 18px;">
          <input [(ngModel)]="dto.name" name="name" placeholder="Name" required style="padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem;" />
          <input [(ngModel)]="dto.description" name="description" placeholder="Description" required style="padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem;" />
          <input [(ngModel)]="dto.requiredCardsStr" name="requiredCards" placeholder="Required Card IDs (comma separated)" required style="padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem;" />
          <input [(ngModel)]="dto.rewardCardId" name="rewardCardId" placeholder="Reward Card ID" type="number" style="padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem;" />
          <input [(ngModel)]="dto.rewardTag" name="rewardTag" placeholder="Reward Tag" style="padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1rem;" />
          <button type="submit" style="padding: 14px 0; font-size: 1.1rem; border-radius: 10px; background: linear-gradient(90deg, #3b82f6 60%, #6366f1 100%); color: white; border: none; cursor: pointer; font-weight: 600; letter-spacing: 0.5px; margin-top: 8px;">Create Achievement</button>
        </form>
        <div *ngIf="msg" style="color: #059669; font-weight: 500; margin-bottom: 8px;">{{msg}}</div>
        <div *ngIf="error" style="color: #dc2626; font-weight: 500; margin-bottom: 8px;">{{error}}</div>
      </div>
    </div>
    <div style="padding-bottom: var(--bottom-nav-height);">
    <app-bottom-nav
      [bottomNavItems]="bottomNavItems"
      [getIconForRoute]="getIconForRoute.bind(this)"
      [isActiveRoute]="isActiveRoute.bind(this)"
      [navigate]="navigate.bind(this)">
    </app-bottom-nav>
    </div>
  `
})
export class AdminAchievementsComponent {
  achievements: Achievement[] = [];
  dto: any = { name: '', description: '', requiredCardsStr: '', rewardCardId: '', rewardTag: '' };
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
    // Optionally fetch existing achievements
    // this.admin.getAchievements().subscribe(a => this.achievements = a);
  }

  createAchievement() {
    this.msg = '';
    this.error = '';
    const requiredCards = this.dto.requiredCardsStr.split(',').map((id: string) => Number(id.trim())).filter((id: number) => !isNaN(id));
    const payload: AchievementDto = {
      name: this.dto.name,
      description: this.dto.description,
      requiredCards,
      rewardCardId: this.dto.rewardCardId ? Number(this.dto.rewardCardId) : undefined,
      rewardTag: this.dto.rewardTag || undefined
    };
    this.admin.createAchievement(payload).subscribe({
      next: (a) => {
        this.msg = 'Achievement created!';
        this.achievements.push(a);
      },
      error: (e) => {
        this.error = e?.error?.error || e?.message || 'Error creating achievement';
      }
    });
  }

  navigate(route: string) {
    // Simple navigation for bottom nav
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
