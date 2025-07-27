import { Router } from '@angular/router';  // ✅ Import Router
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-usersignup',
  templateUrl: './usersignup.component.html',
  styleUrls: ['./usersignup.component.css']
})
export class UsersignupComponent {
  username: string = "";
  password: string = "";
  age: string = "";
  gender: string = "";
  email: string = "";
  showPassword: boolean = false;


  error: any = {
    username: "",
    password: "",
    age: "",
    gender: "",
    email: "",
    isError: false
  };

  constructor(private http: HttpClient, private router: Router) {}  // ✅ Inject Router

   togglePassword(): void {
    this.showPassword = !this.showPassword;
  }


  ValidateInput(event: any, type: string) {
    this.error[type] = event.target.value.length === 0 ? 'Field Required' : '';
    this.updateIsError();
  }

  signmodal() {
    console.log("signmodal triggered");

    this.error.username = this.username.length === 0 ? 'Field Required' : '';
    this.error.password = this.password.length === 0 ? 'Field Required' : '';
    this.error.age = this.age.length === 0 ? 'Field Required' : '';
    this.error.gender = this.gender.length === 0 ? 'Field Required' : '';
    this.error.email = this.email.length === 0 ? 'Field Required' : '';

    this.updateIsError();

    if (!this.error.isError) {
      const userData = {
        username: this.username,
        password: this.password,
        age: this.age,
        gender: this.gender,
        email: this.email
      };

      this.http.post('http://127.0.0.1:5000/signup', userData)
        .subscribe(
          (response: any) => {
            console.log('Signup Successful', response);
            alert("Signup successful!");
            this.router.navigate(['/mainsignups']);

            // ✅ Store user profile in localStorage
            localStorage.setItem('userData', JSON.stringify(response.user));


          },
          (error) => {
            console.error('Signup Failed', error);
            alert("Signup failed! " + error.error.error);
          }
        );
    } else {
      console.log("Form has errors", this.error);
    }
  }


  updateIsError() {
    this.error.isError = Object.values(this.error).some(error => error === 'Field Required');
    console.log("isError status:", this.error.isError);
  }
}
