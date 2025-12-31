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
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent {
  showNotification = false;
  notificationMessage = '';
  cards: any[] = [];
  totalPoints: number = 0;
  isLoading: boolean = true;
  selectedCard: any = null;

  constructor(private api: ApiService, private router: Router){
    this.reload();
  }
  reload(){
    this.isLoading = true;
    // Fetch cards
    this.api.get('/cards/my').subscribe((r:any)=> {
      if (r && r.errorMessage) {
        this.showError(r.errorMessage);
        this.cards = [];
        this.isLoading = false;
        return;
      }
      this.cards = r;
      this.isLoading = false;
    }, (err) => {
      if (err?.error?.errorMessage) {
        this.showError(err.error.errorMessage);
      }
      this.cards = [];
      this.isLoading = false;
    });
    // Fetch user points
    this.api.get('/users/me').subscribe((user: any) => {
      if (user && user.errorMessage) {
        this.showError(user.errorMessage);
        this.totalPoints = 0;
        return;
      }
      this.totalPoints = user.points || 0;
    }, (err) => {
      if (err?.error?.errorMessage) {
        this.showError(err.error.errorMessage);
      }
      this.totalPoints = 0;
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
  arrange(){ this.router.navigate(['/cards/arrange']);}

  add() { this.router.navigate(['/cards/add']); }
  stored() { this.router.navigate(['/cards/stored']); }

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
