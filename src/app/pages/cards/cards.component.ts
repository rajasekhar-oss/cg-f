import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../shared/bottom-nav.component';
import { TopNavComponent } from '../../shared/top-nav/top-nav.component';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, BottomNavComponent, TopNavComponent, ErrorNotificationComponent],
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
  // filtering
  cardCategories = ['FILM', 'CRICKET'];
  cricketTypes = ['BAT', 'BOWL', 'ALL'];
  // default to FILM when nothing is selected
  selectedCategory: string = 'FILM';
  selectedCricketType: string | null = null;

  // Custom dropdown state
  categoryDropdownOpen = false;
  cricketTypeDropdownOpen = false;

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    this.closeAllDropdowns();
  }

  constructor(private api: ApiService, private router: Router){
    // ensure default category is set before first load
    if (!this.selectedCategory) this.selectedCategory = 'FILM';
    this.reload();
  }
  reload(category?: { category?: string; cricketType?: string }){
    this.isLoading = true;
    // Fetch cards
    const params: any = {};
    const cat = category || { category: this.selectedCategory, cricketType: this.selectedCricketType };
    if (cat?.category) params['category'] = cat.category;
    if (cat?.cricketType) params['cricketType'] = cat.cricketType;

    const opts = Object.keys(params).length ? { params } : undefined;

    this.api.get('/cards/my', opts).subscribe((r:any)=> {
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

  onCategoryChanged() {
    // if user selects FILM, ensure cricketType is unset
    if (this.selectedCategory === 'FILM') {
      this.selectedCricketType = null;
    } else if (this.selectedCategory === 'CRICKET') {
      // ensure a sensible default for cricket type
      if (!this.selectedCricketType) this.selectedCricketType = 'ALL';
    }
    this.reload();
  }

  onCricketTypeChanged() {
    this.reload();
  }

  // Custom dropdown methods
  toggleCategoryDropdown(event: Event) {
    event.stopPropagation();
    this.categoryDropdownOpen = !this.categoryDropdownOpen;
    this.cricketTypeDropdownOpen = false;
  }

  toggleCricketTypeDropdown(event: Event) {
    event.stopPropagation();
    this.cricketTypeDropdownOpen = !this.cricketTypeDropdownOpen;
    this.categoryDropdownOpen = false;
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.categoryDropdownOpen = false;
    this.onCategoryChanged();
  }

  selectCricketType(type: string) {
    this.selectedCricketType = type;
    this.cricketTypeDropdownOpen = false;
    this.onCricketTypeChanged();
  }

  closeAllDropdowns() {
    this.categoryDropdownOpen = false;
    this.cricketTypeDropdownOpen = false;
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
