import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-adminlogin',
  templateUrl: './adminlogin.component.html',
  styleUrls: ['./adminlogin.component.css']
})
export class AdminloginComponent implements OnInit {
  adminname: string = "";
  passkey: string = "";
  error: any = {
    adminname: "",
    passkey: "",
    isError: false
  };
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute
  ) {}

   togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  ngOnInit() {
    const token = this.activatedRoute.snapshot.queryParams["token"]; // Get token from URL

    if (token) {
      setTimeout(() => {
        const newPassword = prompt("Enter your new password:");
        if (newPassword) {
          this.http.post(`${this.authService.apiUrl}/reset_password/${token}`, { password: newPassword }).subscribe(
            (response: any) => {
              alert(response.message);
              this.router.navigate(['/adminlogin']);
            },
            (error) => {
              alert("Error: " + (error.error?.error || 'Invalid or expired token.'));
            }
          );
        }
      }, 500);
    }
  }

  updateIsError() {
    this.error.isError = !!Object.values(this.error).find(val => val === 'Field Required');
  }

  ValidateInput(value: string, type: string) {
    this.error[type] = value.length === 0 ? 'Field Required' : '';
    this.updateIsError();
  }

  // ✅ Admin Login API Call
  loginmodal() {
    this.error.adminname = this.adminname.length === 0 ? 'Field Required' : '';
    this.error.passkey = this.passkey.length === 0 ? 'Field Required' : '';
    this.updateIsError();

    if (!this.error.isError) {
      const adminCredentials = {
        username: this.adminname, // ✅ Ensure key is 'username'
        password: this.passkey
      };

      this.authService.adminLogin(adminCredentials).subscribe({
        next: (response: any) => {
          console.log("✅ Login successful", response);
          alert("Admin login successful!");
          this.router.navigate(['/adminportal']); // Redirect to admin portal
        },
        error: (error: any) => {
          console.error("❌ Login failed", error);
          alert("Invalid username or password!");
        }
      });
    }
  }


  forgotPassword() {
    const email = prompt("Enter your registered email:");
    if (email) {
      this.http.post(`${this.authService.apiUrl}/forgot_password`, { email }).subscribe(
        (response: any) => {
          console.log("✅ Success:", response);
          alert(response.message);
        },
        (error) => {
          console.error("❌ Error:", error);
          alert("Error: " + (error.error?.error || "Something went wrong!"));
        }
      );
    }
  }
}
