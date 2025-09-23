import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Card, CardRequestDto } from '../../models/card.model';

@Component({
  standalone: true,
  selector: 'app-admin-card-detail',
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 32px; max-width: 600px; margin: 0 auto;">
      <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 24px;">Card Details</h2>
      <div *ngIf="loading">Loading card...</div>
      <div *ngIf="error" style="color: #dc2626;">{{error}}</div>
      <form *ngIf="!loading && card" (ngSubmit)="updateCard()" style="display: flex; flex-direction: column; gap: 16px;">
        <label>Total Films <input [(ngModel)]="dto.totalFilms" name="totalFilms" type="number" required /></label>
        <label>Years Active <input [(ngModel)]="dto.yearsActive" name="yearsActive" type="number" required /></label>
        <label>Highest Grossing <input [(ngModel)]="dto.highestGrossing" name="highestGrossing" required /></label>
        <label>Awards Won <input [(ngModel)]="dto.awardsWon" name="awardsWon" type="number" required /></label>
        <label>Followers <input [(ngModel)]="dto.followers" name="followers" required /></label>
        <label>Languages (as integer) <input [(ngModel)]="dto.languages" name="languages" required /></label>
        <label>Professions (as integer) <input [(ngModel)]="dto.professions" name="professions" required /></label>
        <div style="display: flex; gap: 16px; margin-top: 18px;">
          <button type="submit" style="flex:1; background: #3b82f6; color: white; border: none; border-radius: 8px; padding: 12px 0; font-weight: 600;">Update</button>
          <button type="button" (click)="deleteCard()" style="flex:1; background: #dc2626; color: white; border: none; border-radius: 8px; padding: 12px 0; font-weight: 600;">Delete</button>
        </div>
      </form>
      <div *ngIf="msg" style="color: #059669; font-weight: 500; margin-top: 12px;">{{msg}}</div>
      <div *ngIf="!loading && !card && !error" style="color: #6b7280; margin-top: 16px;">No card data to display.</div>
    </div>
  `
})
export class AdminCardDetailComponent implements OnInit {
  card: Card | null = null;
  dto: any = {};
  loading = false;
  error = '';
  msg = '';

  constructor(private admin: AdminService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (!id || isNaN(id)) {
      this.error = 'Invalid card ID: ' + idParam;
      return;
    }
    this.loading = true;
    this.admin.getCard(id).subscribe({
      next: (card) => {
        if (!card) {
          this.error = 'No card found for ID: ' + id;
        } else {
          this.card = card;
          this.dto = { ...card };
        }
        this.loading = false;
      },
      error: (e) => {
        this.error = (e?.error?.error || e?.message || 'Error loading card') + ' (ID: ' + id + ')';
        this.loading = false;
      }
    });
  }

  updateCard() {
    if (!this.card) return;
    this.msg = '';
    this.admin.updateCard(this.card.id, this.dto).subscribe({
      next: () => {
        this.msg = 'Card updated!';
      },
      error: (e) => {
        this.error = e?.error?.error || e?.message || 'Error updating card';
      }
    });
  }

  deleteCard() {
    if (!this.card) return;
    if (!confirm('Are you sure you want to delete this card?')) return;
    this.admin.deleteCard(this.card.id).subscribe({
      next: () => {
        this.router.navigate(['/admin/cards-list']);
      },
      error: (e) => {
        this.error = e?.error?.error || e?.message || 'Error deleting card';
      }
    });
  }
}
