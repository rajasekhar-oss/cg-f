import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-refund-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="top-bar">
      <button class="back-btn" (click)="goBack()">&#8592; Back</button>
      <span class="top-bar-title">Refund & Cancellation Policy</span>
    </div>
    <div class="policy-content">
      <h2>Refund & Cancellation Policy</h2>
      <p>All purchases made inside the app, including points, virtual cards, upgrades, or any other digital items, are non-refundable.</p>
      <p>Since these digital items are delivered instantly to the user’s account, cancellations or reversals cannot be provided once the transaction is completed.</p>
      <p>If your purchase was completed but the points were not added to your account due to a technical issue, please contact our support team with the exact details of the problem.<br>
      We will review your request and resolve the issue as quickly as possible.</p>
    </div>
  `,
  styles: [`
    .top-bar {
      width: 100vw;
      display: flex;
      align-items: center;
      background: var(--bg-1);
      padding: 2vw 4vw;
      box-shadow: var(--shadow-md);
    }
    .back-btn {
      background: var(--btn-subtle-bg);
      color: var(--btn-subtle-text);
      border: none;
      border-radius: 1vw;
      font-size: 1.5vw;
      padding: 1vw 2vw;
      cursor: pointer;
      margin-right: 2vw;
    }
    .top-bar-title {
      font-size: 2vw;
      font-weight: 700;
      color: var(--text-1);
    }
    .policy-content {
      background: var(--bg-2);
      color: var(--text-1);
      margin: 4vw auto;
      padding: 4vw;
      border-radius: 1vw;
      max-width: 700px;
      box-shadow: var(--shadow-sm);
    }
    h2 {
      font-size: 2vw;
      margin-bottom: 2vw;
      color: var(--text-1);
    }
    p {
      font-size: 1.5vw;
      margin-bottom: 1.5vw;
      color: var(--text-2);
    }
  `]
})
export class RefundPolicyComponent {
  constructor(private router: Router, private location: Location) {}
  goBack() {
    this.location.back();
  }
}
