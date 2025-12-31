import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Achievement, AchievementDto } from '../models/achievement.model';
import { Card, CardRequestDto } from '../models/card.model';
import { Sticker, StickerDto } from '../models/sticker.model';
import { ResponseDto } from '../models/response-dto.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  // Achievements
  createAchievement(dto: AchievementDto): Observable<Achievement> {
    return this.http.post<Achievement>(`${environment.apiUrl}/admin/achievements`, dto);
  }

  // Cards
  create(payload: FormData): Observable<any> {
    // If you are using HttpClient, the code should be simple like this.
    // Do not add custom headers like 'Content-Type': 'multipart/form-data'
    // The browser will handle it for FormData
    return this.http.post<Card>(`${environment.apiUrl}/admin/cards`, payload);
  }
  getCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${environment.apiUrl}/admin/cards`);
  }
  getCard(id: number): Observable<Card> {
    return this.http.get<Card>(`${environment.apiUrl}/admin/cards/${id}`);
  }
  updateCard(id: number, dto: CardRequestDto | FormData): Observable<Card> {
    return this.http.put<Card>(`${environment.apiUrl}/admin/cards/${id}`, dto);
  }
  deleteCard(id: number): Observable<ResponseDto> {
    return this.http.delete<ResponseDto>(`${environment.apiUrl}/admin/cards/${id}`);
  }

  // Stickers
  createSticker(dto: StickerDto): Observable<Sticker> {
    return this.http.post<Sticker>(`${environment.apiUrl}/admin/stickers`, dto);
  }
}
