import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class ApiService {
  base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  post(path: string, body: any) { return this.http.post(`${this.base}${path}`, body); }
  get(path: string, opts?: any) { return this.http.get(`${this.base}${path}`, opts); }
  put(path: string, body: any, options?: any) { return this.http.put(`${this.base}${path}`, body, options); }
  delete(path: string) { return this.http.delete(`${this.base}${path}`); }
}
