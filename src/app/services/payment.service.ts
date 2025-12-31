import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = environment.apiUrl + '/api/payments';

  constructor(private http: HttpClient) {}

  createOrder(plan: string): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/create-order?plan=${plan}`,
      {}
    );
  }
}
