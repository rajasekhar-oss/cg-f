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
  templateUrl: './arrange.component.html',
  styleUrls: ['./arrange.component.css']
})
export class ArrangeComponent {
  cards:any[] = [];
  constructor(private api: ApiService, private router: Router){
    this.api.get('/cards/my').subscribe((r:any)=> {
      this.cards = r.sort((a: any, b: any)=>a.orderIndex-b.orderIndex);
      console.log('ArrangeComponent loaded cards:', this.cards);
    });
  }
  // Smart drop logic for grid: move to the index closest to pointer
  drop(event: CdkDragDrop<any[]>) {
    if (event.previousIndex === event.currentIndex) return;
    // Find the closest index based on pointer position
    const grid = document.querySelector('.cards-grid');
    if (!grid) {
      moveItemInArray(this.cards, event.previousIndex, event.currentIndex);
      return;
    }
    const tiles = Array.from(grid.querySelectorAll('.card-tile'));
    let minDist = Infinity;
    let bestIdx = event.currentIndex;
    const pointer = event.dropPoint || (event as any).event?.pointerPosition;
    if (pointer) {
      tiles.forEach((tile, idx) => {
        const rect = (tile as HTMLElement).getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (pointer.x - cx);
        const dy = (pointer.y - cy);
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
          minDist = dist;
          bestIdx = idx;
        }
      });
    }
    moveItemInArray(this.cards, event.previousIndex, bestIdx);
  }
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
