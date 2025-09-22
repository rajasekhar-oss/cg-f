import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HomePageNotLoggedInComponent } from './home-not-logged-in.component';
import { HomePageLoggedInComponent } from './home-logged-in.component';

@Component({
  standalone: true,
  imports: [CommonModule, HomePageNotLoggedInComponent, HomePageLoggedInComponent],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(public auth: AuthService, private router: Router) {}
}
