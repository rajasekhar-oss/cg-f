
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { GameRequestService, GameRequest } from '../../services/game-request.service';
import { UserDto, ProfileDto } from '../../models/auth';
import { BottomNavComponent } from '../../shared/bottom-nav.component';
import { TopNavComponent } from '../../shared/top-nav/top-nav.component';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, BottomNavComponent, TopNavComponent, ErrorNotificationComponent],
  selector: 'app-home-logged-in',
  templateUrl: './home-logged-in.component.html',
  styleUrls: ['./home-logged-in.component.css']
})
export class HomePageLoggedInComponent implements OnInit {
  showNotification = false;
  notificationMessage = '';
  // User data from API
  profile: UserDto | null = null;
  isLoading = true;
  isAdmin = false;

  // Subscription for joinGame
  sub?: import('rxjs').Subscription;
  
  // Computed properties based on real data
  username = 'Player';
  userInitials = 'PL';

  // For mobile nav game requests
  mobileRequests: GameRequest[] = [];
  showMobileRequests = false;
  
  userStats = {
    points: 0,
    rank: 0
  };

  gameModes = [
    {
      title: 'Gang Play',
      description: 'Play with your friends in a private group',
      icon: '👥',
      route: '/gang-play/create'
    },
    {
      title: 'Stranger Play',
      description: 'Match with random players worldwide',
      icon: '🌍',
      route: '/stranger-play'
    },
    {
      title: 'Play with Code',
      description: 'Join a game using a room code',
      icon: '🔢',
      route: '/gang-play/join'
    }
  ];

  bottomNavItems = [
    { label: 'Home', route: '/' },
    { label: 'Cards', route: '/cards' },
    { label: 'Star', route: '/leaderboard' },
    { label: 'Person', route: '/friends' },
    { label: 'Profile', route: '/profile' }
  ];

  onNotificationsClick = () => {
    this.navigate('/notifications');
  };

  constructor(
    private router: Router,
    private auth: AuthService,
    private api: ApiService,
    private gameRequestService: GameRequestService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.gameRequestService.requests$.subscribe(requests => {
      this.mobileRequests = requests;
    });
    this.gameRequestService.fetchRequests();
  }
  joinGame(request: GameRequest) {
     if (this.sub) this.sub.unsubscribe && this.sub.unsubscribe();
    this.sub = this.api.post(`/api/rooms/${request.roomCode}/join`, {}).subscribe({
      next: (res: any) => {
        if (res && res.errorMessage) {
          // Optionally show error in UI
          alert(res.errorMessage);
          return;
        }
        // Navigate to waiting room on success
        this.router.navigate(['/gang-play/waiting', request.roomCode], { state: { roomInfo: res } });
      },
      error: (e: any) => {
        alert("Joining game failed: " + (e?.error?.errorMessage || 'Error joining game'));
      }
    });
  }

  private loadUserData() {
    this.isLoading = true;
    // Load user profile data from the correct endpoint
    this.api.get('/users/me').subscribe({
      next: (userData: any) => {
        if (userData && userData.errorMessage) {
          this.showError(userData.errorMessage);
          this.isLoading = false;
          return;
        }
        this.profile = userData as UserDto;
        this.auth.user$.next(userData);
        this.updateUserInfo();
        const role = this.auth.getUserRole();
        this.isAdmin = role === 'ADMIN';
      },
      error: (error) => {
        if (error?.error?.errorMessage) {
          this.showError(error.error.errorMessage);
        }
        // Fall back to basic user info from auth service
        this.auth.user$.subscribe(user => {
          if (user) {
            this.username = user.username || 'Player';
            this.userInitials = this.getInitials(this.username);
            const role = this.auth.getUserRole();
            this.isAdmin = role === 'ADMIN';
          }
        });
        this.isLoading = false;
      }
    });
  }
  showError(msg: string) {
    this.notificationMessage = msg;
    this.showNotification = true;
  }

  onNotificationClosed() {
    this.showNotification = false;
    this.notificationMessage = '';
  }

  // Removed loadProfilePicture() - all profile data comes from /users/me

  private updateUserInfo() {
    if (this.profile) {
      console.log('Profile data in home component:', this.profile);
  console.log('Profile picture URL:', this.profile.imageUrl);
      
      // Update username with priority: name > firstName+lastName > username
      if (this.profile.name) {
        this.username = this.profile.name;
      } else if (this.profile.firstName && this.profile.lastName) {
        this.username = `${this.profile.firstName} ${this.profile.lastName}`.trim();
      } else if (this.profile.firstName) {
        this.username = this.profile.firstName;
      } else {
        this.username = this.profile.username || 'Player';
      }
      
      // Update initials
      this.userInitials = this.getInitials(this.username);
      
      // Update stats
      this.userStats = {
        points: this.profile.points || 0,
        rank: this.profile.rank || 0
      };
      
      console.log('Updated username:', this.username);
      console.log('Updated stats:', this.userStats);
    }
  }

  private getInitials(name: string): string {
    if (!name) return 'PL';
    
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else {
      return name.substring(0, 2).toUpperCase();
    }
  }

  onImageError(event: any) {
    // Hide the image when it fails to load, show initials instead
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  getDisplayName(): string {
    if (!this.profile) return this.username;
    
    // Priority 1: name field from backend (if provided)
    if (this.profile.name) {
      return this.profile.name;
    }
    
    // Priority 2: firstName and lastName combined
    if (this.profile.firstName && this.profile.lastName) {
      return `${this.profile.firstName} ${this.profile.lastName}`.trim();
    }
    
    // Priority 3: firstName only
    if (this.profile.firstName) {
      return this.profile.firstName;
    }
    
    // Priority 4: lastName only
    if (this.profile.lastName) {
      return this.profile.lastName;
    }
    
    // Fallback: username
    return this.profile.username || this.username;
  }

  private initializeUserData() {
    // This method is no longer needed - replaced by loadUserData
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  getIconForRoute(route: string): string {
    const icons: { [key: string]: string } = {
      '/': '🏠',
      '/cards': '🃏',
      '/leaderboard': '⭐',
      '/friends': '👥',
      '/profile': '👤'
    };
    return icons[route] || '📄';
  }
}