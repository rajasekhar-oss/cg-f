import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

export interface GameRequest {
  username: string;
  imageUrl: string;
  roomCode: string;
}

@Injectable({ providedIn: 'root' })
export class GameRequestService {
  private requestsSubject = new BehaviorSubject<GameRequest[]>([]);
  requests$ = this.requestsSubject.asObservable();

  constructor(private api: ApiService) {}

  fetchRequests() {
    this.api.get('/request/requests').subscribe((requests: any) => {
      this.requestsSubject.next(requests as GameRequest[]);
    });
  }
}
