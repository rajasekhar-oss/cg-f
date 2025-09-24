import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-get-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="get-cards-grid">
      <div *ngFor="let c of cards" class="get-card-tile">
        <img *ngIf="c.picture || c.imageUrl" [src]="c.picture || c.imageUrl" [alt]="c.name" />
      </div>
    </div>
  `,
  styles: [`
    .get-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2vw;
      width: 96vw;
      margin-left: 2vw;
    }
    .get-card-tile {
      background: #fff;
      border-radius: 1.5vw;
      box-shadow: 0 2px 8px #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      cursor: pointer;
      transition: box-shadow 0.2s;
    }
    .get-card-tile img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 1.5vw;
    }
  `]
})
export class GetCardsComponent {
  @Input() cards: any[] = [];
}
