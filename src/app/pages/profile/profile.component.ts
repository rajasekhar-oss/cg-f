import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { UserDto, UpdateProfileRequest, ResponseDto } from '../../models/auth';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: UserDto | null = null;
  isLoading = true;
  error = '';
  
  // Update form
  updateForm: UpdateProfileRequest = {
    name: '',
    profilePicture: ''
  };
  
  isUpdating = false;
  updateMessage = '';
  updateSuccess = false;

  constructor(
    private api: ApiService, 
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.error = '';

    console.log('Loading profile from:', `${this.api.base}/users/me`);
  console.log('JWT Token available:', !!this.auth.getAccessToken());

    // Load profile data - single API call that returns everything
    this.api.get('/users/me').subscribe({
      next: (profileData: any) => {
        console.log('Profile data received:', profileData);
        this.profile = profileData as UserDto;
        
        // Initialize form with current profile data
        this.updateForm = {
          name: this.profile.name || 
                (this.profile.firstName && this.profile.lastName) 
                  ? `${this.profile.firstName} ${this.profile.lastName}`.trim()
                  : this.profile.firstName || this.profile.lastName || '',
          profilePicture: this.profile.profilePicture || ''
        };
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load profile:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error url:', error.url);
        
        if (error.status === 0) {
          this.error = 'Cannot connect to server. Please check if the backend is running on port 8081.';
        } else if (error.status === 401) {
          this.error = 'Authentication failed. Please login again.';
        } else if (error.status === 403) {
          this.error = 'Access forbidden. Please check your permissions.';
        } else {
          this.error = `Failed to load profile: ${error.status} ${error.statusText}`;
        }
        this.isLoading = false;
      }
    });
  }

  updateProfile() {
    if (this.isUpdating) return;
    
    if (!this.updateForm.name?.trim()) {
      this.updateMessage = 'Name is required.';
      this.updateSuccess = false;
      return;
    }
    
    this.isUpdating = true;
    this.updateMessage = '';

    this.api.put('/users/me/profile', this.updateForm).subscribe({
      next: (response: any) => {
        this.updateMessage = response.message || 'Profile updated successfully!';
        this.updateSuccess = true;
        this.isUpdating = false;
        
        // Reload profile to get updated data
        setTimeout(() => {
          this.loadProfile();
          this.updateMessage = '';
        }, 2000);
      },
      error: (error: any) => {
        console.error('Profile update failed:', error);
        this.updateMessage = error?.error?.message || 'Failed to update profile. Please try again.';
        this.updateSuccess = false;
        this.isUpdating = false;
      }
    });
  }

  resetForm() {
    if (this.profile) {
      this.updateForm = {
        name: this.profile.name || 
              (this.profile.firstName && this.profile.lastName) 
                ? `${this.profile.firstName} ${this.profile.lastName}`.trim()
                : this.profile.firstName || this.profile.lastName || '',
        profilePicture: this.profile.profilePicture || ''
      };
    }
    this.updateMessage = '';
  }

  getUserInitials(): string {
    if (!this.profile) return 'U';
    
    const firstName = this.profile.firstName || '';
    const lastName = this.profile.lastName || '';
    const username = this.profile.username || '';
    
    // Try to get initials from firstName and lastName if available
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    } else if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    } else {
      // Fallback to username initials
      return username.substring(0, 2).toUpperCase();
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  getDisplayName(): string {
    if (!this.profile) return 'Unknown User';
    
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
    return this.profile.username || 'Unknown User';
  }

  onImageError(event: any) {
    // Hide the image when it fails to load, show initials instead
    event.target.style.display = 'none';
    
    // Find the parent container and show the initials div
    const container = event.target.parentElement;
    if (container) {
      const initialsDiv = container.querySelector('div');
      if (initialsDiv) {
        initialsDiv.style.display = 'flex';
      }
    }
  }
}
