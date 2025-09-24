import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../shared/bottom-nav.component';

@Component({
  standalone: true,
  imports: [CommonModule, BottomNavComponent],
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent {
  cards: any[] = [];
  totalPoints: number = 0;
  isLoading: boolean = true;
  constructor(private api: ApiService, private router: Router){
    this.reload();
  }
  reload(){
    this.isLoading = true;
    // Fetch cards
    this.api.get('/cards/my').subscribe((r:any)=> {
      console.log('Fetched cards:', r);
      this.cards = r;
      this.isLoading = false;
    }, ()=> {
      this.cards = [];
      this.isLoading = false;
    });
    // Fetch user points
    this.api.get('/users/me').subscribe((user: any) => {
      this.totalPoints = user.points || 0;
    }, () => {
      this.totalPoints = 0;
    });
  }
  arrange(){ this.router.navigate(['/cards/arrange']);}


  add() { this.router.navigate(['/cards/add']); }
  stored() { /* TODO: Implement stored cards logic */ }

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
