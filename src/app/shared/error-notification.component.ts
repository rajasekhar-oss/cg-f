import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" class="error-notification">
      <span>{{ message }}</span>
      <button (click)="close()">OK</button>
    </div>
  `,
  styleUrls: ['./error-notification.component.css']
})
export class ErrorNotificationComponent implements OnDestroy {
  @Input() message: string = '';
  @Output() closed = new EventEmitter<void>();
  visible = true;
  private timer: any;

  ngOnInit() {
    this.startTimer();
  }

  startTimer() {
    this.clearTimer();
    this.timer = setTimeout(() => {
      this.close();
    }, 5000);
  }

  close() {
    this.visible = false;
    this.closed.emit();
    this.clearTimer();
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  ngOnDestroy() {
    this.clearTimer();
  }
}
