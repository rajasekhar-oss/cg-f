import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ApiService } from '../../services/api.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { BottomNavComponent } from '../../shared/bottom-nav.component';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, DragDropModule, BottomNavComponent],
  selector: 'app-arrange',
  templateUrl: './arrange.component.html'
})
export class ArrangeComponent {
  cards:any[] = [];
  constructor(private api: ApiService, private router: Router){
    this.api.get('/cards/my').subscribe((r:any)=> this.cards = r.sort((a: any, b: any)=>a.orderIndex-b.orderIndex));
  }
  drop(e:CdkDragDrop<any[]>) { moveItemInArray(this.cards, e.previousIndex, e.currentIndex); }
  save(){
    const order = this.cards.map(c=>c.id);
    this.api.post('/cards/arrange', { cardOrder: order }).subscribe(()=> alert('saved'), (err: any)=> alert('err'));
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
