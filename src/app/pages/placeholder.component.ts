import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../shared/bottom-nav.component';

@Component({
  selector: 'app-blue-theme-demo',
  standalone: true,
  imports: [BottomNavComponent],
  template: `
    <app-bottom-nav
      [bottomNavItems]="bottomNavItems"
      [isActiveRoute]="isActiveRoute"
      [navigate]="navigate"
    ></app-bottom-nav>
  `
})
export class PlaceholderComponent {
  bottomNavItems = [
    { label: 'Home', route: '/' },
    { label: 'Cards', route: '/cards' },
    { label: 'Leaderboard', route: '/leaderboard' },
    { label: 'Profile', route: '/profile' }
  ];

  constructor(private router: Router) {}

  isActiveRoute = (route: string) => this.router.url === route;
  navigate = (route: string) => {
    this.router.navigate([route]);
  };
}
