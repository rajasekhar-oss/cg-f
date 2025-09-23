import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Card } from '../../models/card.model';

@Component({
  standalone: true,
  selector: 'app-admin-cards-list',
  imports: [CommonModule],
  template: `
    <div style="padding: 32px; max-width: 600px; margin: 0 auto;">
      <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 24px;">All Cards</h2>
      <div *ngIf="loading">Loading cards...</div>
      <div *ngIf="error" style="color: #dc2626;">{{error}}</div>
      <div *ngIf="!loading && cards.length === 0">No cards found.</div>
      <ul style="list-style: none; padding: 0;">
        <li *ngFor="let card of cards" (click)="openCard(card.id)" style="background: #fff; border-radius: 10px; box-shadow: 0 2px 8px #e5e7eb; margin-bottom: 16px; padding: 18px 20px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: box-shadow 0.2s;">
          <span style="font-weight: 600; color: #374151;">Card #{{card.id}}</span>
          <span style="color: #6b7280;">Films: {{card.totalFilms}}, Awards: {{card.awardsWon}}</span>
        </li>
      </ul>
    </div>
  `
})
export class AdminCardsListComponent implements OnInit {
  cards: Card[] = [];
  loading = false;
  error = '';

  constructor(private admin: AdminService, private router: Router) {}

  ngOnInit() {
    this.loading = true;
    this.admin.getCards().subscribe({
      next: (cards) => {
        this.cards = cards;
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.error || e?.message || 'Error loading cards';
        this.loading = false;
      }
    });
  }

  openCard(id: number) {
    this.router.navigate([`/admin/cards-detail/${id}`]);
  }
}
