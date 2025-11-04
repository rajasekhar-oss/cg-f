import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../shared/bottom-nav.component';

@Component({
  standalone: true,
  imports: [CommonModule, BottomNavComponent],
  selector: 'app-stored-cards',
  templateUrl: './stored-cards.component.html',
  styleUrls: ['./stored-cards.component.css']
})
export class StoredCardsComponent {
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
      this.allCards = r;
      this.isLoading = false;
    }, () => {
      this.allCards = [];
      this.isLoading = false;
    });
    // Fetch only stored cards
    this.api.get('/cards/stored').subscribe((r: any) => {
      this.storedCards = r;
      this.storedCardIds = new Set(r.map((c: any) => c.id));
    }, () => {
      this.storedCards = [];
      this.storedCardIds.clear();
    });
  }

  toggleStored(card: any) {
    const isStored = this.storedCardIds.has(card.id);
    const url = isStored ? `/cards/unstore/${card.id}` : `/cards/store/${card.id}`;
    this.api.post(url, {}).subscribe(() => {
      this.reload();
    });
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
    { label: 'Star', route: '/leaderboard' },
    { label: 'Person', route: '/friends' },
    { label: 'Profile', route: '/profile' }
  ];
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
    return this.router.url === route;
  }
  navigate(route: string) {
    this.router.navigate([route]);
  }
}
