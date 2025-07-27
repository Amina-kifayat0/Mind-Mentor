import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-therapistmainform',
  templateUrl: './therapistmainform.component.html',
  styleUrls: ['./therapistmainform.component.css']
})
export class TherapistmainformComponent implements OnInit {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';

  isResetMode: boolean = false;
  newPassword: string = '';
  resetToken: string = '';
  resetMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    if (token) {
      this.isResetMode = true;
      this.resetToken = token;
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  loginTherapist(): void {
    if (!this.username || !this.password) {
      this.errorMessage = "Please fill in all fields.";
      return;
    }

    const therapistCredentials = { username: this.username, password: this.password };

    this.authService.therapistLogin(therapistCredentials).subscribe({
      next: (response: any) => {
        console.log("✅ Therapist Login Successful", response);
        localStorage.setItem('therapist_id', response.therapist_id);
        localStorage.setItem('therapist_username', response.username);
        alert("Therapist login successful!");
        this.router.navigate(['/therapistportal']);
      },
      error: (error: any) => {
        console.error("❌ Therapist Login Failed", error);
        this.errorMessage = "Invalid username or password!";
      }
    });
  }

  logoutTherapist(): void {
    localStorage.removeItem('therapist_id');
    localStorage.removeItem('therapist_username');
    this.router.navigate(['/mainsignups']);
  }

forgotPassword(event: Event): void {
  event.preventDefault();  // 🛑 Stops default href="#" from reloading page

  const email = prompt("Enter your registered therapist email:");
  if (!email) return alert("Email is required.");

  this.http.post('http://localhost:5000/therapist_forgot_password',
    { email },
    { headers: { 'Content-Type': 'application/json' } }
  ).subscribe({
    next: (res: any) => {
      alert("Password reset link sent to your email.");
    },
    error: (err) => {
      console.error(err);
      alert(err.error?.error || "Failed to send reset email.");
    }
  });
}



  // This function is triggered when "Reset Password" is clicked
  resetTherapistPassword(): void {
    if (!this.newPassword) {
      alert("Please enter a new password.");
      return;
    }

    // Call the backend to update the password with the reset token
    this.http.post(`http://localhost:5000/therapist_reset_password/${this.resetToken}`, {
      new_password: this.newPassword  // ✅ Match Flask backend expectation
    })
    .subscribe(
      (response: any) => {
        this.resetMessage = response.message;
        alert("✅ Password successfully reset!");
        this.router.navigate(['/mainsignups']);
      },
      (error) => {
        this.resetMessage = error.error?.error || "❌ Invalid or expired reset token.";
      }
    );
  }
}
