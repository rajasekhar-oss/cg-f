import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { UserDto, UpdateProfileRequest, ResponseDto } from '../../models/auth';
import { BottomNavComponent } from '../../shared/bottom-nav.component';
import { TopNavComponent } from '../../shared/top-nav/top-nav.component';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';


@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, BottomNavComponent, TopNavComponent, ErrorNotificationComponent],
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {
    showNotification = false;
    notificationMessage = '';
    
    // Menu and Modal state
    showMenu = false;
    activeModal: 'image' | 'username' | 'password' | null = null;
    
    constructor(
        private api: ApiService,
        private auth: AuthService,
        private router: Router,
        private http: HttpClient
    ) {
        // Close menu when clicking outside
        document.addEventListener('click', () => {
            this.showMenu = false;
        });
    }
    
    // Bottom nav logic
    bottomNavItems = [
        { label: 'Home', route: '/' },
        { label: 'Cards', route: '/cards' },
        { label: 'Leaderboard', route: '/leaderboard' },
        { label: 'Profile', route: '/profile' }
    ];

    isActiveRoute(route: string): boolean {
        return this.router.url === route;
    }

    navigate(route: string) {
        this.router.navigate([route]);
    }
    
    // Menu and Modal methods
    toggleMenu(event: Event) {
        event.stopPropagation();
        this.showMenu = !this.showMenu;
    }
    
    openModal(type: 'image' | 'username' | 'password') {
        this.showMenu = false;
        this.activeModal = type;
        // Reset messages when opening modal
        this.updateMessage = '';
        this.usernameMessage = '';
        this.passwordMessage = '';
    }
    
    closeModal() {
        this.activeModal = null;
        this.updateMessage = '';
        this.usernameMessage = '';
        this.passwordMessage = '';
    }
    
    // Rank
    userRank: number | null = null;
    rankError: string = '';
    // Username update
    newUsername: string = '';
    usernameMessage: string = '';
    usernameSuccess: boolean = false;
    isUpdatingUsername: boolean = false;

    // Password update
    oldPassword: string = '';
    newPassword: string = '';
    passwordMessage: string = '';
    passwordSuccess: boolean = false;
    isUpdatingPassword: boolean = false;
    updateUsername() {
        if (!this.newUsername) {
            this.usernameMessage = 'New username is required.';
            this.usernameSuccess = false;
            return;
        }
        this.isUpdatingUsername = true;
        this.usernameMessage = '';
        this.api.put('/users/me/username', { newUsername: this.newUsername }).subscribe({
            next: (res: any) => {
                if (res && res.errorMessage) {
                    this.showError(res.errorMessage);
                    this.usernameSuccess = false;
                    this.isUpdatingUsername = false;
                    return;
                }
                this.usernameMessage = res.message || 'Username updated successfully!';
                this.usernameSuccess = true;
                this.isUpdatingUsername = false;
                this.loadProfile();
                setTimeout(() => {
                    this.closeModal();
                }, 1500);
            },
            error: (err: any) => {
                if (err?.error?.errorMessage) {
                    this.showError(err.error.errorMessage);
                } else {
                    this.usernameMessage = err?.error?.message || 'Failed to update username.';
                }
                this.usernameSuccess = false;
                this.isUpdatingUsername = false;
            }
        });
    }

    updatePassword() {
        if (!this.oldPassword || !this.newPassword) {
            this.passwordMessage = 'Both current and new password are required.';
            this.passwordSuccess = false;
            return;
        }
        this.isUpdatingPassword = true;
        this.passwordMessage = '';
        this.api.put('/users/me/password', { oldPassword: this.oldPassword, newPassword: this.newPassword }).subscribe({
            next: (res: any) => {
                if (res && res.errorMessage) {
                    this.showError(res.errorMessage);
                    this.passwordSuccess = false;
                    this.isUpdatingPassword = false;
                    return;
                }
                this.passwordMessage = res.message || 'Password updated successfully!';
                this.passwordSuccess = true;
                this.isUpdatingPassword = false;
                this.oldPassword = '';
                this.newPassword = '';
                setTimeout(() => {
                    this.closeModal();
                }, 1500);
            },
            error: (err: any) => {
                if (err?.error?.errorMessage) {
                    this.showError(err.error.errorMessage);
                } else if (err?.status === 403) {
                    this.passwordMessage = 'Forbidden: Either your current password is incorrect or your session has expired. Please check your password and login again if needed.';
                } else {
                    this.passwordMessage = err?.error?.message || 'Failed to update password.';
                }
                this.passwordSuccess = false;
                this.isUpdatingPassword = false;
            }
        });
    }
    profile: UserDto | null = null;
    isLoading = true;
    error = '';

    // Update form
    updateForm: UpdateProfileRequest = {
        imageUrl: ''
    };

    isUpdating = false;
    updateMessage = '';
    updateSuccess = false;

    selectedFile: File | null = null;


    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;
        this.selectedFile = input.files[0];
    }

    isDarkMode = false;

    ngOnInit() {
        this.loadProfile();
        this.getRank();
        // Load dark mode preference
        this.isDarkMode = localStorage.getItem('theme') === 'dark';
        this.applyTheme();
    }

    toggleDarkMode(event: Event) {
        this.isDarkMode = (event.target as HTMLInputElement).checked;
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
        this.applyTheme();
    }

    applyTheme() {
        const root = document.documentElement;
        if (this.isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }

    getRank() {
        this.rankError = '';
        this.userRank = null;
        this.api.get('/users/me/rank').subscribe({
            next: (data: any) => {
                if (data && data.errorMessage) {
                    this.showError(data.errorMessage);
                    return;
                }
                this.userRank = data.rank;
            },
            error: (err: any) => {
                if (err?.error?.errorMessage) {
                    this.showError(err.error.errorMessage);
                } else {
                    this.rankError = err?.error?.message || 'Could not fetch rank.';
                }
            }
        });
    }

    loadProfile() {
        this.isLoading = true;
        this.error = '';

        // Load profile data - single API call that returns everything
        this.api.get('/users/me').subscribe({
            next: (profileData: any) => {
                if (profileData && profileData.errorMessage) {
                    this.showError(profileData.errorMessage);
                    this.isLoading = false;
                    return;
                }
                this.profile = profileData as UserDto;
                // Initialize form with current profile data
                this.updateForm = {
                    imageUrl: this.profile.imageUrl || ''
                };
                this.isLoading = false;
            },
            error: (error) => {
                if (error?.error?.errorMessage) {
                    this.showError(error.error.errorMessage);
                } else {
                    if (error.status === 0) {
                        this.error = 'Cannot connect to server.';
                    } else if (error.status === 401) {
                        this.error = 'Authentication failed. Please login again.';
                    } else if (error.status === 403) {
                        this.error = 'Access forbidden. Please check your permissions.';
                    } else {
                        this.error = `Failed to load profile: ${error.status} ${error.statusText}`;
                    }
                }
                this.isLoading = false;
            }
        });
    }

    updateProfile() {
        if (this.isUpdating) return;
        this.isUpdating = true;
        this.updateMessage = '';
        let formData: FormData | UpdateProfileRequest;
        if (this.selectedFile) {
            formData = new FormData();
            formData.append('image', this.selectedFile); // field name must match backend
        } else {
            formData = this.updateForm;
        }
        this.api.put('/users/me/profile', formData).subscribe({
            next: (response: any) => {
                if (response && response.errorMessage) {
                    this.showError(response.errorMessage);
                    this.updateSuccess = false;
                    this.isUpdating = false;
                    return;
                }
                if (response.accessToken && response.refreshToken) {
                    this.auth.setAccessToken(response.accessToken);
                    this.auth.setRefreshToken(response.refreshToken);
                    this.updateMessage = 'Profile updated! Session refreshed.';
                } else {
                    this.updateMessage = response.message || 'Profile updated successfully!';
                }
                this.updateSuccess = true;
                this.isUpdating = false;
                setTimeout(() => {
                    this.loadProfile();
                    this.updateMessage = '';
                    this.closeModal();
                }, 1500);
            },
            error: (error: any) => {
                if (error?.error?.errorMessage) {
                    this.showError(error.error.errorMessage);
                } else {
                    this.updateMessage = error?.error?.message || 'Failed to update profile. Please try again.';
                }
                this.updateSuccess = false;
                this.isUpdating = false;
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

    resetForm() {
        if (this.profile) {
            this.updateForm = {
                imageUrl: this.profile.imageUrl || ''
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
