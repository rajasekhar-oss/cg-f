import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ApiService } from '../../services/api.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { BottomNavComponent } from '../../shared/bottom-nav.component';
import { TopNavComponent } from '../../shared/top-nav/top-nav.component';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  standalone: true,
  imports: [CommonModule, DragDropModule, BottomNavComponent, TopNavComponent, ErrorNotificationComponent],
  selector: 'app-arrange',
  templateUrl: './arrange.component.html',
  styleUrls: ['./arrange.component.css']
})
export class ArrangeComponent {
  cards: any[] = [];
  showNotification = false;
  notificationMessage = '';
  fromWaitingRoom = false;
  roomCode = '';
  // Mode: 'drag' or 'manual'
  arrangeMode: 'drag' | 'manual' = 'drag';
  // For manual selection
  manualOrder: string[] = [];
  scrollInterval: any = null;

  constructor(private api: ApiService, private router: Router, private notification: NotificationService) {
    const nav = (this.router.getCurrentNavigation() as any);
    const state = nav?.extras?.state;
    if (state?.fromWaitingRoom) {
      this.fromWaitingRoom = true;
      this.roomCode = state.roomCode || '';
    }
    this.api.get('/cards/my').subscribe(
      (r: any) => {
        if (r && r.errorMessage) {
          this.showError(r.errorMessage);
          this.cards = [];
          this.manualOrder = [];
          return;
        }
        if (Array.isArray(r)) {
          this.cards = r.sort((a: any, b: any) => a.orderIndex - b.orderIndex);
          this.manualOrder = this.cards.map(c => c.id);
        } else {
          this.showError('Error loading cards.');
          this.cards = [];
          this.manualOrder = [];
        }
      },
      (err: any) => {
        this.showError('Error loading cards.');
        this.cards = [];
        this.manualOrder = [];
      }
    );
  }

  showError(msg: string) {
    this.notificationMessage = msg;
    this.showNotification = true;
  }

  onNotificationClosed() {
    this.showNotification = false;
    this.notificationMessage = '';
  }
  // Smart drop logic for grid: move to the index closest to pointer
  drop(event: CdkDragDrop<any[]>) {
    if (this.arrangeMode !== 'drag') return;
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

  // Manual selection logic
  selectCardManual(card: any) {
    if (this.arrangeMode !== 'manual') return;
    const idx = this.manualOrder.indexOf(card.id);
    if (idx !== -1) {
      // Deselect
      this.manualOrder.splice(idx, 1);
    } else {
      // Reselect, add to end
      this.manualOrder.push(card.id);
    }
  }
  deselectAllManual() {
    this.manualOrder = [];
  }
  selectAllManual() {
    this.manualOrder = this.cards.map(c => c.id);
  }
  getManualIndex(card: any): number {
    return this.manualOrder.indexOf(card.id);
  }

  // Edge-drag scrolling for drag-and-drop
  onDragMoved(event: any) {
    if (this.arrangeMode !== 'drag') return;
    const grid = document.querySelector('.cards-grid');
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const y = event.pointerPosition ? event.pointerPosition.y : event.event?.clientY;
    const scrollZone = 60; // px
    const scrollStep = 24; // px per interval
    if (y < rect.top + scrollZone) {
      this.startScroll(grid, -scrollStep);
    } else if (y > rect.bottom - scrollZone) {
      this.startScroll(grid, scrollStep);
    } else {
      this.stopScroll();
    }
  }
  startScroll(grid: Element, step: number) {
    this.stopScroll();
    this.scrollInterval = setInterval(() => {
      (grid as HTMLElement).scrollTop += step;
    }, 32);
  }
  stopScroll() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
    }
  }
  save() {
    let order: string[];
    if (this.arrangeMode === 'manual') {
      // Only selected cards, in their order
      order = [...this.manualOrder];
    } else {
      order = this.cards.map(c => c.id);
    }
    this.api.post('/cards/arrange', { cardOrder: order }).subscribe(
      (r: any) => {
        if (r && r.errorMessage) {
          this.showError(r.errorMessage);
          return;
        }
        this.notification.show('Order changed successfully');
        if (this.fromWaitingRoom) {
          window.history.back();
        }
      },
      (err: any) => {
        if (err?.error?.errorMessage) {
          this.showError(err.error.errorMessage);
        } else {
          this.showError('Error saving card order.');
        }
      }
    );
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

  // Mode switch
  setArrangeMode(mode: 'drag' | 'manual') {
    this.arrangeMode = mode;
    if (mode === 'manual') {
      this.selectAllManual();
    }
    this.stopScroll();
  }

  // Clean up scroll interval
  ngOnDestroy() {
    this.stopScroll();
  }
}
