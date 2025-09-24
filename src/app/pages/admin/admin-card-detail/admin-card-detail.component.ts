  // ...existing code...
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { Card } from '../../../models/card.model';

@Component({
  selector: 'app-admin-card-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-card-detail.component.html',
  styleUrls: ['./admin-card-detail.component.css']
})
export class AdminCardDetailComponent implements OnInit {
  selectedFile: File | null = null;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.selectedFile = input.files[0];
  }
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
    let payload: any;
    if (this.selectedFile) {
      payload = new FormData();
      payload.append('name', String(this.dto.name));
      payload.append('pictureFile', this.selectedFile);
      if (this.dto.imageUrl) payload.append('picture', String(this.dto.imageUrl));
      if (this.dto.totalFilms) payload.append('totalFilms', String(this.dto.totalFilms));
      if (this.dto.yearsActive) payload.append('yearsActive', String(this.dto.yearsActive));
      if (this.dto.highestGrossing) payload.append('highestGrossing', String(this.dto.highestGrossing));
      if (this.dto.awardsWon) payload.append('awardsWon', String(this.dto.awardsWon));
      if (this.dto.followers) payload.append('followers', String(this.dto.followers));
      if (this.dto.languages) payload.append('languages', String(this.dto.languages));
      if (this.dto.professions) payload.append('professions', String(this.dto.professions));
    } else {
      payload = {
        name: this.dto.name,
        picture: this.dto.imageUrl,
        totalFilms: Number(this.dto.totalFilms),
        yearsActive: Number(this.dto.yearsActive),
        highestGrossing: this.dto.highestGrossing,
        awardsWon: Number(this.dto.awardsWon),
        followers: this.dto.followers,
        languages: Number(this.dto.languages),
        professions: Number(this.dto.professions)
      };
    }
    this.admin.updateCard(this.card.id, payload).subscribe({
      next: () => {
        this.msg = 'Card updated!';
        this.selectedFile = null;
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
