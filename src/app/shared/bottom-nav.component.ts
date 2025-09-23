import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.css']
})
export class BottomNavComponent {
  @Input() bottomNavItems: any[] = [];
  @Input() getIconForRoute!: (route: string) => string;
  @Input() isActiveRoute!: (route: string) => boolean;
  @Input() navigate!: (route: string) => void;
}
