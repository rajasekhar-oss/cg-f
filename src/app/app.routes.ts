import { JoinRoomComponent } from './pages/gang-play/join-room.component';
import { FindStrangerComponent } from './pages/find-stranger/find-stranger.component';
import { Routes } from '@angular/router';
import { SignInComponent } from './pages/signin/signin.component';
import { VerifyOtpComponent } from './pages/verify-otp/verify-otp.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CardsComponent } from './pages/cards/cards.component';
import { ArrangeComponent } from './pages/arrange/arrange.component';
import { StoredCardsComponent } from './pages/cards/stored-cards.component';
import { AddCardsComponent } from './pages/cards/add-cards.component';
import { ContactSupportComponent } from './pages/cards/contact-support.component';
import { WaitingRoomComponent } from './pages/gang-play/waiting-room.component';
import { LeaveRoomGuard } from './guards/leave-room.guard';
import { GameComponent } from './pages/game/game.component';
import { LeaveGameGuard } from './guards/leave-game.guard';
import { PlaceholderComponent } from './pages/placeholder.component';
import { CreateRoomComponent } from './pages/gang-play/create-room.component';
import { RankingsComponent } from './pages/leaderboard/rankings.component';
import { adminRoutes } from './pages/admin/admin.routes';
import { RefundPolicyComponent } from './pages/refund-policy/refund-policy.component';
import { TermsAndConditionsComponent } from './pages/terms-and-conditions/terms-and-conditions.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'signin', component: SignInComponent },
  { path: 'verify-otp', component: VerifyOtpComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'cards', component: CardsComponent },
  { path: 'cards/arrange', component: ArrangeComponent },
  { path: 'cards/stored', component: StoredCardsComponent },
  { path: 'cards/add', component: AddCardsComponent },
  { path: 'contact-support', component: ContactSupportComponent },
  { path: 'room/:code', component: WaitingRoomComponent, canDeactivate: [LeaveRoomGuard] },
  { path: 'game/:id', component: GameComponent, canDeactivate: [LeaveGameGuard] },
  // New routes for game modes and features
  { path: 'notifications', component: PlaceholderComponent },
  { path: 'gang-play', component: PlaceholderComponent },
  { path: 'gang-play/create', component: CreateRoomComponent },
  { path: 'gang-play/join', component: JoinRoomComponent },
  { path: 'gang-play/waiting/:roomCode', component: WaitingRoomComponent, canDeactivate: [LeaveRoomGuard] },
  { path: 'stranger-play', component: FindStrangerComponent },
  { path: 'temporary-play', component: PlaceholderComponent },
  { path: 'play-code', component: PlaceholderComponent },
  { path: 'leaderboard', component: RankingsComponent },
  { path: 'friends', component: PlaceholderComponent },
  { path: 'refund-policy', component: RefundPolicyComponent },
  { path: 'terms-and-conditions', component: TermsAndConditionsComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  ...adminRoutes,
  { path: '**', redirectTo: '' }
];
