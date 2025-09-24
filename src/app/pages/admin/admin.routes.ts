import { Routes } from '@angular/router';
import { AdminAchievementsComponent } from './admin-achievements.component';
import { AdminCardsComponent } from './admin-cards.component';
import { AdminStickersComponent } from './admin-stickers.component';
import { AdminHomeComponent } from './admin-home.component';
import { AdminCardsListComponent } from './admin-cards-list.component';
import { AdminCardDetailComponent } from './admin-card-detail/admin-card-detail.component';

export const adminRoutes: Routes = [
  { path: 'admin', component: AdminHomeComponent },
  { path: 'admin/achievements', component: AdminAchievementsComponent },
  { path: 'admin/cards', component: AdminCardsComponent },
  { path: 'admin/cards-list', component: AdminCardsListComponent },
  { path: 'admin/cards-detail/:id', component: AdminCardDetailComponent },
  { path: 'admin/stickers', component: AdminStickersComponent }
];
