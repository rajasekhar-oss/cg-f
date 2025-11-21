import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.css']
})

export class BottomNavComponent implements AfterViewInit {
  @Input() bottomNavItems: any[] = [];
  @Input() getIconForRoute!: (route: string) => string;
  @Input() isActiveRoute!: (route: string) => boolean;
  @Input() navigate!: (route: string) => void;
  @ViewChild('bottomNav', { static: false }) bottomNav!: ElementRef;

  ngAfterViewInit(): void {
    const height = this.bottomNav.nativeElement.offsetHeight;

    // store dynamically in a CSS variable
    document.documentElement.style
      .setProperty('--bottom-nav-height', `${height}px`);
  }
}
