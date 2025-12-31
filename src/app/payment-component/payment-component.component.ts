import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../services/payment.service';

declare var Cashfree: any;

@Component({
  selector: 'app-payment',
  templateUrl: './payment-component.component.html',
  styleUrls: ['./payment-component.component.css']
})
export class PaymentComponent implements OnInit {

  private cashfree: any;
  loading = false;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.cashfree = Cashfree({
      mode: 'production'
    });
  }

  pay(plan: string): void {
    this.loading = true;
    this.paymentService.createOrder(plan).subscribe({
      next: (res) => {
        const sessionId = res.payment_session_id;
        this.cashfree.checkout({
          paymentSessionId: sessionId,
          redirectTarget: '_modal'
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });
  }
  // Alias for template compatibility
  openCheckout(plan: string): void {
    this.pay(plan);
  }
}