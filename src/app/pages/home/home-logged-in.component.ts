import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { UserDto, ProfileDto } from '../../models/auth';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-home-logged-in',
  templateUrl: './home-logged-in.component.html',
  styleUrls: ['./home-logged-in.component.css']
})
export class HomePageLoggedInComponent implements OnInit {
  // User data from API
  profile: UserDto | null = null;
  isLoading = true;
  
  // Computed properties based on real data
  username = 'Player';
  userInitials = 'PL';
  notificationCount = 0; // This should come from notifications API
  
  userStats = {
    points: 0,
    rank: 0
  };

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

  bottomNavItems = [
    { label: 'Home', route: '/' },
    { label: 'Cards', route: '/cards' },
    { label: 'Star', route: '/leaderboard' },
    { label: 'Person', route: '/friends' },
    { label: 'Profile', route: '/profile' }
  ];

  constructor(private router: Router, private auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData() {
    this.isLoading = true;
    
    // Load user profile data from the correct endpoint
    this.api.get('/users/me').subscribe({
      next: (userData: any) => {
        console.log('User data received:', userData);
        this.profile = userData as UserDto;
        this.updateUserInfo();
        
        // Load profile picture from separate profile endpoint
        this.loadProfilePicture();
      },
      error: (error) => {
        console.error('Failed to load user data:', error);
        // Fall back to basic user info from auth service
        this.auth.user$.subscribe(user => {
          if (user) {
            this.username = user.username || 'Player';
            this.userInitials = this.getInitials(this.username);
          }
        });
        this.isLoading = false;
      }
    });
  }

  private loadProfilePicture() {
    // Load profile picture from /users/profile endpoint (optional - don't fail the whole component)
    console.log('Attempting to load profile picture from /users/profile');
    
    this.api.get('/users/profile').subscribe({
      next: (profileData: any) => {
        console.log('Profile data received from /users/profile:', profileData);
        console.log('Profile picture URL:', profileData.profilePicture);
        
        if (this.profile && profileData.profilePicture) {
          // Update the profile with the profile picture
          this.profile.profilePicture = profileData.profilePicture;
          console.log('Updated profile with picture:', this.profile.profilePicture);
        }
        
        if (profileData.name && this.profile) {
          // Also update name if provided in profile
          this.profile.name = profileData.name;
          this.updateUserInfo();
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load profile picture (non-critical error):', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          error: error.error
        });
        
        // Don't fail the whole component - just continue without profile picture
        this.isLoading = false;
        
        // Provide specific error messages
        if (error.status === 401) {
          console.error('❌ Authentication failed for /users/profile endpoint');
          console.error('🔍 Check if JWT token is being sent correctly');
        } else if (error.status === 500) {
          console.error('❌ Server error - possible causes:');
          console.error('   • User profile record does not exist in database');
          console.error('   • Backend userService.getProfileByUserId() is failing');
          console.error('   • Database connection issue');
        } else if (error.status === 404) {
          console.error('❌ Profile endpoint not found - check backend routing');
        }
      }
    });
  }

  private updateUserInfo() {
    if (this.profile) {
      console.log('Profile data in home component:', this.profile);
      console.log('Profile picture URL:', this.profile.profilePicture);
      
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