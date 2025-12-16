import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-terms-and-conditions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="top-bar">
      <button class="back-btn" (click)="goBack()">&#8592; Back</button>
      <span class="top-bar-title">Terms & Conditions</span>
    </div>
    <div class="policy-content">
      <h2>Terms & Conditions</h2>
      <p>By using this application, you agree to the following terms:</p>
      <ol>
        <li><strong>Digital Items</strong><br>
          All items such as points, cards, and rewards are virtual. They cannot be exchanged, transferred, or converted into real money.
        </li>
        <li><strong>Fair Use</strong><br>
          You must not exploit bugs, use unauthorized tools, attempt to hack, manipulate points, or perform any action that harms the game experience for others.
        </li>
        <li><strong>Payments</strong><br>
          All in-app purchases are final.<br>
          Once points or digital items are delivered, no refunds or cancellations will be provided.
        </li>
        <li><strong>Account Responsibility</strong><br>
          You are responsible for maintaining the security of your account.<br>
          Any actions or purchases made through your account will be treated as authorized.
        </li>
        <li><strong>Changes & Updates</strong><br>
          Features, rules, or gameplay mechanics may be updated or modified at any time to improve the service.
        </li>
        <li><strong>Account Actions</strong><br>
          We reserve the right to suspend or restrict accounts involved in cheating, hacking, abuse, or violating these terms.
        </li>
        <li><strong>Acceptance</strong><br>
          By continuing to use this app, you acknowledge that you have read and agreed to these terms.
        </li>
      </ol>
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
    p, li {
      font-size: 1.5vw;
      margin-bottom: 1.5vw;
      color: var(--text-2);
    }
    ol {
      padding-left: 2vw;
    }
    li {
      margin-bottom: 1vw;
    }
  `]
})
export class TermsAndConditionsComponent {
  constructor(private router: Router, private location: Location) {}
  goBack() {
    this.location.back();
  }
}
