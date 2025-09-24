import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Achievement, AchievementDto } from '../models/achievement.model';
import { Card, CardRequestDto } from '../models/card.model';
import { Sticker, StickerDto } from '../models/sticker.model';
import { ResponseDto } from '../models/response-dto.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  // Achievements
  createAchievement(dto: AchievementDto): Observable<Achievement> {
    return this.http.post<Achievement>('http://localhost:8081/admin/achievements', dto);
  }

  // Cards
  // create(dto: CardRequestDto | FormData): Observable<Card> {
  //   console.log('[AdminService] Creating card:', dto);
  //   return this.http.post<Card>('http://localhost:8081/admin/cards', dto);
  // }
  // Inside your Angular service
create(payload: FormData): Observable<any> {
  // If you are using HttpClient, the code should be simple like this.
  // Do not add custom headers like 'Content-Type': 'multipart/form-data'
  // The browser will handle it for FormData
  return this.http.post<Card>('http://localhost:8081/admin/cards', payload);
}
  getCards(): Observable<Card[]> {
    console.log('[AdminService] Fetching all cards...');
    return this.http.get<Card[]>('http://localhost:8081/admin/cards');
  }
  getCard(id: number): Observable<Card> {
    console.log('[AdminService] Fetching card with ID:', id);
    return this.http.get<Card>(`http://localhost:8081/admin/cards/${id}`);
  }
  updateCard(id: number, dto: CardRequestDto | FormData): Observable<Card> {
    console.log('[AdminService] Updating card with ID:', id, 'Payload:', dto);
    return this.http.put<Card>(`http://localhost:8081/admin/cards/${id}`, dto);
  }
  deleteCard(id: number): Observable<ResponseDto> {
    console.log('[AdminService] Deleting card with ID:', id);
    return this.http.delete<ResponseDto>(`http://localhost:8081/admin/cards/${id}`);
  }

  // Stickers
  createSticker(dto: StickerDto): Observable<Sticker> {
    return this.http.post<Sticker>('http://localhost:8081/admin/stickers', dto);
  }
}
