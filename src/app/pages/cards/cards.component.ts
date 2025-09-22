import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-cards',
  templateUrl: './cards.component.html'
})
export class CardsComponent {
  cards: any[] = [];
  constructor(private api: ApiService, private router: Router){
    this.reload();
  }
  reload(){ this.api.get('/cards/my').subscribe((r:any)=> this.cards = r, ()=> this.cards = []); }
  arrange(){ this.router.navigate(['/cards/arrange']);}
}
