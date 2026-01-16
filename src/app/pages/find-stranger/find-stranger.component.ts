import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-find-stranger',
  templateUrl: './find-stranger.component.html',
  styleUrls: ['./find-stranger.component.css'],
  imports: [CommonModule, FormsModule, ErrorNotificationComponent]
})
export class FindStrangerComponent implements OnDestroy {
  showNotification = false;
  notificationMessage = '';
  status: 'idle' | 'searching' | 'matched' | 'timeout' = 'idle';
  message = '';
  private wsSub: any = null;
  private userId: string = '';

  // Category selection
  category: 'FILM' | 'CRICKET' = 'FILM';
  cricketType: 'BAT' | 'BOWL' | 'ALL' = 'BAT';

  constructor(
    private api: ApiService,
    private ws: WebsocketService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.userId = this.auth.getUserId() || '';
    if (this.userId) {
      this.subscribeToMatchTopic();
    }
  }

  findMatch() {
    const token = this.auth.getAccessToken();
    console.log('[FindStranger] Access token before matchmaking:', token);
    this.status = 'searching';
    this.message = 'Searching for a stranger to play with...';
    let url = `/api/matchmaking/find?category=${this.category}`;
    if (this.category === 'CRICKET') {
      url += `&cricketType=${this.cricketType}`;
    }
    this.api.post(url, null).subscribe({
      next: (res: any) => {
        if (res && res.errorMessage) {
          this.showError(res.errorMessage);
          this.status = 'idle';
          this.message = res.message;
          return;
        }
        if(res && res.message!=='searching'){
          this.message=res.message;
          this.status = 'timeout';
        }
      },
      error: (err) => {
        if (err?.error?.errorMessage) {
          this.showError(err.error.errorMessage);
        }
        this.status = 'idle';
        this.message = 'Failed to start matchmaking.';
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

  subscribeToMatchTopic() {
    const topic = `/topic/match/${this.userId}`;
    this.ws.connectAndSubscribe(topic);
    this.wsSub = this.ws.messages$.subscribe((msg: any) => {
      if (!msg || !msg.status) return;
      if (msg.status === 'searching') {
        this.status = 'searching';
        this.message = 'Searching for a stranger to play with...';
      } else if (msg.status === 'matched' && msg.roomCode) {
        this.status = 'matched';
        this.message = 'Match found! Joining game...';
        setTimeout(() => {
          this.router.navigate(['/game', msg.roomCode]);
        }, 1000);
      } else if (msg.status === 'timeout') {
        this.status = 'timeout';
        this.message = msg.message || 'No match found. Please try again.';
        console.log('[FindStranger] Matchmaking timeout:', msg);
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    if (this.wsSub && typeof this.wsSub.unsubscribe === 'function') {
      this.wsSub.unsubscribe();
    }
  }
}
