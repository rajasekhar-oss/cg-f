import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PopupStateService {
  showPaymentConfirm = false;
  paymentAmount: number = 0;
  paymentPoints: number = 0;

  saveState(show: boolean, amount: number, points: number) {
    this.showPaymentConfirm = show;
    this.paymentAmount = amount;
    this.paymentPoints = points;
  }

  getState() {
    return {
      showPaymentConfirm: this.showPaymentConfirm,
      paymentAmount: this.paymentAmount,
      paymentPoints: this.paymentPoints
    };
  }

  clearState() {
    this.showPaymentConfirm = false;
    this.paymentAmount = 0;
    this.paymentPoints = 0;
  }
}
