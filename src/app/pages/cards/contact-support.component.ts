
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-contact-support',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "contact-support.component.html",
  styleUrls: ["contact-support.component.css"]
})
export class ContactSupportComponent {
  constructor(private router: Router, private location: Location) {}
  goBack() {
    this.location.back();
  }
}
