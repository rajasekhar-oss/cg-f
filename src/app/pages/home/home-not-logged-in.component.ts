import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-home-not-logged-in',
  templateUrl: './home-not-logged-in.component.html',
  styleUrls: ['./home-not-logged-in.component.css']
})
export class HomePageNotLoggedInComponent {
  gameModes = [
    {
      title: 'Gang Play',
      description: 'Play with your friends in a private group',
      icon: '👥',
      route: '/gang-play'
    },
    {
      title: 'Stranger Play',
      description: 'Match with random players worldwide',
      icon: '🌍',
      route: '/stranger-play'
    },
    {
      title: 'Temporary Play',
      description: 'Quick games without saving progress',
      icon: '⚡',
      route: '/temporary-play'
    },
    {
      title: 'Play with Code',
      description: 'Join a game using a room code',
      icon: '🔢',
      route: '/play-code'
    }
  ];

  constructor(private router: Router) {}

  navigate(route: string) {
    this.router.navigate([route]);
  }
}