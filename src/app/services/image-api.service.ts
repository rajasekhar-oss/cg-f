import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageApiService {
  constructor(private readonly http: HttpClient) {}

  getImageLinks(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/users/images`);
  }
}
