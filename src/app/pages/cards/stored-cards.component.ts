import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../shared/bottom-nav.component';
import { TopNavComponent } from '../../shared/top-nav/top-nav.component';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';

@Component({
  standalone: true,
  imports: [CommonModule, BottomNavComponent, TopNavComponent, ErrorNotificationComponent],
  selector: 'app-stored-cards',
  templateUrl: './stored-cards.component.html',
  styleUrls: ['./stored-cards.component.css']
})
export class StoredCardsComponent {
  showNotification = false;
  notificationMessage = '';
  allCards: any[] = [];
  storedCards: any[] = [];
  storedCardIds: Set<string> = new Set();
  isLoading: boolean = true;
  selectedCard: any = null;

  constructor(private api: ApiService, private router: Router) {
    this.reload();
  }

  reload() {
    this.isLoading = true;
    // Fetch all cards
    this.api.get('/cards/my').subscribe((r: any) => {
      if (r && r.errorMessage) {
        this.showError(r.errorMessage);
        this.allCards = [];
        this.isLoading = false;
        return;
      }
      this.allCards = r;
      this.isLoading = false;
    }, (err) => {
      if (err?.error?.errorMessage) {
        this.showError(err.error.errorMessage);
      }
      this.allCards = [];
      this.isLoading = false;
    });
    // Fetch only stored cards
    this.api.get('/cards/stored').subscribe((r: any) => {
      if (r && r.errorMessage) {
        this.showError(r.errorMessage);
        this.storedCards = [];
        this.storedCardIds.clear();
        return;
      }
      this.storedCards = r;
      this.storedCardIds = new Set(r.map((c: any) => c.id));
    }, (err) => {
      if (err?.error?.errorMessage) {
        this.showError(err.error.errorMessage);
      }
      this.storedCards = [];
      this.storedCardIds.clear();
    });
  }

  toggleStored(card: any) {
    const isStored = this.storedCardIds.has(card.id);
    const url = isStored ? `/cards/unstore/${card.id}` : `/cards/store/${card.id}`;
    this.api.post(url, {}).subscribe((r: any) => {
      if (r && r.errorMessage) {
        this.showError(r.errorMessage);
        return;
      }
      // Update local state without reload to prevent scroll jump
      if (isStored) {
        // Remove from stored
        this.storedCardIds.delete(card.id);
        this.storedCards = this.storedCards.filter((c: any) => c.id !== card.id);
      } else {
        // Add to stored
        this.storedCardIds.add(card.id);
        this.storedCards = [...this.storedCards, card];
      }
    }, (err) => {
      if (err?.error?.errorMessage) {
        this.showError(err.error.errorMessage);
      }
    });
  }

  showError(msg: string) {
    this.notificationMessage = msg;
    this.showNotification = true;
  }

  onNotificationClosed() {
    this.showNotification = false;
    this.notificationMessage = '';
  }

  showCardDetails(card: any) {
    this.selectedCard = card;
  }
  closeCardDetails() {
    this.selectedCard = null;
  }

  // Bottom nav logic
  bottomNavItems = [
    { label: 'Home', route: '/' },
    { label: 'Cards', route: '/cards' },
    { label: 'Leaderboard', route: '/leaderboard' },
    { label: 'Profile', route: '/profile' }
  ];
  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
  navigate(route: string) {
    this.router.navigate([route]);
  }
}
