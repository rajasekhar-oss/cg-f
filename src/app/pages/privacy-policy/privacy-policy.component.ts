import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="top-bar">
      <button class="back-btn" (click)="goBack()">&#8592; Back</button>
      <span class="top-bar-title">Privacy Policy</span>
    </div>
    <div class="policy-content">
      <h2>Privacy Policy</h2>
      <p>We respect your privacy and are committed to protecting your information.</p>
      <h3>Information We Collect</h3>
      <ul>
        <li>Basic account details (such as username or login info)</li>
        <li>Email address</li>
        <li>Purchase and usage details inside the app</li>
        <li>Technical data used to improve performance</li>
      </ul>
      <p><strong>We do NOT collect or store:</strong></p>
      <ul>
        <li>Card details</li>
        <li>Banking information</li>
        <li>Sensitive personal data</li>
      </ul>
      <h3>How Your Information Is Used</h3>
      <ul>
        <li>Manage your account</li>
        <li>Provide points or digital items purchased</li>
        <li>Improve gameplay and security</li>
        <li>Resolve support requests</li>
        <li>Communicate important updates</li>
      </ul>
      <h3>Data Protection</h3>
      <p>We use standard security measures to ensure your data is protected against unauthorized access.</p>
      <h3>Your Control</h3>
      <p>You may request correction or deletion of your basic account information by contacting us.</p>
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
    h2, h3 {
      font-size: 2vw;
      margin-bottom: 2vw;
      color: var(--text-1);
    }
    p, li {
      font-size: 1.5vw;
      margin-bottom: 1.5vw;
      color: var(--text-2);
    }
    ul {
      padding-left: 2vw;
      margin-bottom: 2vw;
    }
    li {
      margin-bottom: 1vw;
    }
  `]
})
export class PrivacyPolicyComponent {
  constructor(private router: Router, private location: Location) {}
  goBack() {
    this.location.back();
  }
}
