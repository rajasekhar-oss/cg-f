import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from './services/notification.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'app';
  notificationMessage: string | null = null;

  constructor(private notification: NotificationService) {
    this.notification.message$.subscribe(msg => {
      this.notificationMessage = msg;
    });
  }
}
