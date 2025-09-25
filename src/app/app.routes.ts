import { JoinRoomComponent } from './pages/gang-play/join-room.component';
import { Routes } from '@angular/router';
import { SignInComponent } from './pages/signin/signin.component';
import { VerifyOtpComponent } from './pages/verify-otp/verify-otp.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CardsComponent } from './pages/cards/cards.component';
import { ArrangeComponent } from './pages/arrange/arrange.component';
import { AddCardsComponent } from './pages/cards/add-cards.component';
import { WaitingRoomComponent } from './pages/waiting-room/waiting-room.component';
import { GameComponent } from './pages/game/game.component';
import { PlaceholderComponent } from './pages/placeholder.component';
import { CreateRoomComponent } from './pages/gang-play/create-room.component';
import { RankingsComponent } from './pages/leaderboard/rankings.component';
import { adminRoutes } from './pages/admin/admin.routes';
import { userTodoRoutes } from './pages/user-todo/user-todo.routes';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'signin', component: SignInComponent },
  { path: 'verify-otp', component: VerifyOtpComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'cards', component: CardsComponent },
  { path: 'cards/arrange', component: ArrangeComponent },
  { path: 'cards/add', component: AddCardsComponent },
  { path: 'room/:code', component: WaitingRoomComponent },
  { path: 'game/:id', component: GameComponent },
  // New routes for game modes and features
  { path: 'notifications', component: PlaceholderComponent },
  { path: 'gang-play', component: PlaceholderComponent },
  { path: 'gang-play/create', component: CreateRoomComponent },
  { path: 'gang-play/join', component: JoinRoomComponent },
  { path: 'stranger-play', component: PlaceholderComponent },
  { path: 'temporary-play', component: PlaceholderComponent },
  { path: 'play-code', component: PlaceholderComponent },
  { path: 'leaderboard', component: RankingsComponent },
  { path: 'friends', component: PlaceholderComponent },
  ...adminRoutes,
  ...userTodoRoutes,
  { path: '**', redirectTo: '' }
];
