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
    return this.http.post<Achievement>('/admin/achievements', dto);
  }

  // Cards
  create(dto: CardRequestDto): Observable<Card> {
    return this.http.post<Card>('/admin/cards', dto);
  }
  getCards(): Observable<Card[]> {
    return this.http.get<Card[]>('/admin/cards');
  }
  getCard(id: number): Observable<Card> {
    return this.http.get<Card>(`/admin/cards/${id}`);
  }
  updateCard(id: number, dto: CardRequestDto): Observable<Card> {
    return this.http.put<Card>(`/admin/cards/${id}`, dto);
  }
  deleteCard(id: number): Observable<ResponseDto> {
    return this.http.delete<ResponseDto>(`/admin/cards/${id}`);
  }

  // Stickers
  createSticker(dto: StickerDto): Observable<Sticker> {
    return this.http.post<Sticker>('/admin/stickers', dto);
  }
}
