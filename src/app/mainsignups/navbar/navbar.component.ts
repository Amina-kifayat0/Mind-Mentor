import { Component, OnInit } from '@angular/core';
import { AuthService } from '../.././services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms'; // Make sure this is imported


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {

  userProfile: any = {}; // This will hold user profile data
  isLoggedIn: boolean = false; // Track if user is logged in
  userProfileModalOpen = false;
updateModalOpen = false;

  constructor(private authService: AuthService, private router: Router,private http: HttpClient,  private fb: FormBuilder // ✅ Inject FormBuilder
  ) {}
user:any={}


ngOnInit(): void {
  // Check if the user is logged in by looking at localStorage
  const userData = localStorage.getItem('userData');
  if (userData) {
    this.isLoggedIn = true;
    const parsedUser = JSON.parse(userData);
    this.fetchUserProfile(parsedUser.id);
  }
}
isEditing = false;

enableEdit() {
  this.isEditing = true;
}

saveProfile() {
  this.authService.updateProfile(this.userProfile).subscribe({
    next: (res) => {
      alert('Profile updated successfully!');
      this.isEditing = false;
    },
    error: (err) => {
      alert(err.error?.error || 'Error updating profile');
    }
  });
}

// Method to fetch user profile from the backend API
fetchUserProfile(userId: string): void {
  this.http.get(`http://127.0.0.1:5000/api/user-profile?id=${userId}`).subscribe(
    (response: any) => {
      console.log('User profile:', response);
      this.userProfile = response; // Store the user profile in a variable
    },
    (error) => {
      console.error('Error fetching profile:', error);
    }
  );
}

// Open profile modal (show profile info)
openProfileModal(): void {
  const userData = localStorage.getItem('userData');
  if (userData) {
    const parsedUser = JSON.parse(userData);
    this.fetchUserProfile(parsedUser.id); // Ensure we have the updated user profile
  }
}

// Close the profile modal (hide profile info)
closeProfileModal(): void {
  this.userProfile = null; // Clear user profile data when closing the modal
}

openUpdateModal() {
  this.updateModalOpen = true;
  this.userProfileModalOpen = false;
}

closeUpdateModal() {
  this.updateModalOpen = false;
}

updateProfile() {
  // Ensure userProfile is correctly populated with current user data
  this.authService.updateProfile(this.userProfile).subscribe(
    (res) => {
      console.log('Profile updated successfully', res);
      alert("Profile Updated Successfully");
      this.closeUpdateModal();
      this.openProfileModal(); // Optionally reopen profile view
    },
    (err) => {
      console.error('Error updating profile', err);
      // Optionally handle errors (e.g., display message to user)
    }
  );
}


  logout() {
    this.http.post<any>('http://localhost:5000/logout', {}, { withCredentials: true })
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            // ✅ Clear user-related data from localStorage/sessionStorage
            localStorage.removeItem('user_id');
            localStorage.removeItem('username');
            localStorage.removeItem('email');
            localStorage.removeItem('age');
            localStorage.removeItem('gender');
            localStorage.removeItem('userData')

            sessionStorage.removeItem('user_id');
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('email');
            sessionStorage.removeItem('age');
            sessionStorage.removeItem('gender');

            // 🔁 Redirect to login/home
            this.router.navigate(['/mainsignups']);
          }
        },
        error: (error) => {
          console.error('Logout failed', error);
        }
      });
  }

}
