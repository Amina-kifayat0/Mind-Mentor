import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service'; // ✅ Correct path
import { Router } from '@angular/router';

@Component({
  selector: 'app-patientmainform',
  templateUrl: './patientmainform.component.html',
  styleUrls: ['./patientmainform.component.css']
})
export class PatientmainformComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  loginError: string = '';

  constructor(private authService: AuthService, private router: Router) {} // ✅ AuthService injected properly

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    if (!this.username || !this.password) {
      this.loginError = "Both fields are required!";
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: (response: { status: string; message?: string; data?: any }) => { // Add 'data' in response type
        if (response.status === 'success') {
          console.log("Login successful", response);
          // Save user data to localStorage if login is successful
          localStorage.setItem('userData', JSON.stringify(response.data));  // Save to localStorage

          alert("Login Successful!");
          this.router.navigate(['/userportal']); // Redirect after login
        } else {
          this.loginError = response.message || "Invalid credentials!";
        }
      },
      error: (error) => {
        console.error("Login failed", error);
        this.loginError = "Invalid username or password!";
      }
    });
  }

}
