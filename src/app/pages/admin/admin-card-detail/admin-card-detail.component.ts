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
    const payload = new FormData();
    if (this.dto.name) payload.append('name', String(this.dto.name));
    if (this.selectedFile) {
      payload.append('pictureFile', this.selectedFile);
      // Do NOT send the old image URL if a new file is selected
    } else if (this.dto.picture) {
      payload.append('picture', String(this.dto.picture));
    }
    // include category and cricketType if present
    if (this.dto.category) payload.append('category', String(this.dto.category));
    if (this.dto.cricketType) payload.append('cricketType', String(this.dto.cricketType));
    if (this.dto.totalFilms) payload.append('totalFilms', String(this.dto.totalFilms));
    if (this.dto.yearsActive) payload.append('yearsActive', String(this.dto.yearsActive));
    if (this.dto.highestGrossing) payload.append('highestGrossing', String(this.dto.highestGrossing));
    if (this.dto.awardsWon) payload.append('awardsWon', String(this.dto.awardsWon));
    if (this.dto.followers) payload.append('followers', String(this.dto.followers));
    if (this.dto.languages) payload.append('languages', String(this.dto.languages));
    if (this.dto.professions) payload.append('professions', String(this.dto.professions));
    // append cricket-specific fields when present
    if (this.dto.matchesPlayed) payload.append('matchesPlayed', String(this.dto.matchesPlayed));
    if (this.dto.wicketsTaken) payload.append('wicketsTaken', String(this.dto.wicketsTaken));
    if (this.dto.economyRateBetter) payload.append('economyRateBetter', String(this.dto.economyRateBetter));
    if (this.dto.totalRuns) payload.append('totalRuns', String(this.dto.totalRuns));
    if (this.dto.highestScore) payload.append('highestScore', String(this.dto.highestScore));
    if (this.dto.battingAverageBetter) payload.append('battingAverageBetter', String(this.dto.battingAverageBetter));
    if (this.dto.strikeRateBetter) payload.append('strikeRateBetter', String(this.dto.strikeRateBetter));
    if (this.dto.foursHit) payload.append('foursHit', String(this.dto.foursHit));
    if (this.dto.sixesHit) payload.append('sixesHit', String(this.dto.sixesHit));
    if (this.dto.ballsBowled) payload.append('ballsBowled', String(this.dto.ballsBowled));
    if (this.dto.runsConceded) payload.append('runsConceded', String(this.dto.runsConceded));
    if (this.dto.bestBowlingMatch) payload.append('bestBowlingMatch', String(this.dto.bestBowlingMatch));
    if (this.dto.bowlingAverage) payload.append('bowlingAverage', String(this.dto.bowlingAverage));
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
