import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {
  amount: number = 100; // Default amount, can be set from UI

  constructor(private http: HttpClient) {}

  payNow() {
    this.http.post('http://localhost:8080/create-order', { amount: this.amount })
      .subscribe((order: any) => {
        const options = {
          key: "rzp_test_RmeSFTitE0PwjA",  // Razorpay TEST Key
          amount: order.amount,    // Backend returned amount
          currency: "INR",
          order_id: order.id,      // Razorpay Order ID
          handler: (res: any) => { // Runs only when payment succeeds
            this.verifyPayment(res);
          }
        };
        new (window as any).Razorpay(options).open();
      });
  }

  verifyPayment(res: any) {
    this.http.post('http://localhost:8080/verify-payment', res, { responseType: 'text' })
      .subscribe();
  }
}
