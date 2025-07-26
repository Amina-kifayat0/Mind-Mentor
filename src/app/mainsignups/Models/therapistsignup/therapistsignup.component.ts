import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service'; // ✅ Correct path
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-therapistsignup',
  templateUrl: './therapistsignup.component.html',
  styleUrl: './therapistsignup.component.css'
})
export class TherapistsignupComponent {
  username = '';
  age = '';
  gender = '';
  email = '';
  password = '';
  qualification = '';
  experience = '';
  contact_number = '';
  selectedFile: File | null = null; // Store selected file

  constructor(private http: HttpClient    ,private router: Router,
  ) {}

  // Function to handle file selection
 /* onFileSelected(event: any) {
    this.selectedFile = event.target.files[0]; // Get the selected file
    console.log('📂 Selected file:', this.selectedFile);
  }*/
 // ✅ Function to handle file selection
 onFileSelected(event: any) {
  this.selectedFile = event.target.files[0];

  if (this.selectedFile) {
    console.log("✅ Selected File:", this.selectedFile);
    console.log("➡ File Name:", this.selectedFile.name);
    console.log("➡ File Type:", this.selectedFile.type);
    console.log("➡ File Size:", this.selectedFile.size);
  } else {
    console.error("❌ No file selected!");
  }
}



error: any = {};

ValidateInput(field: string, value: any) {
  switch(field) {
    case 'email':
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      this.error[field] = emailRegex.test(value) ? '' : 'Please enter a valid @gmail.com email';
      break;

    case 'contact_number':
      const phoneRegex = /^\d{11}$/;
      this.error[field] = phoneRegex.test(value) ? '' : 'Contact number must be 11 digits';
      break;

    case 'username':
      const nameRegex = /^[A-Z][a-zA-Z]*$/;
      this.error[field] = nameRegex.test(value) ? '' : 'First letter must be capital and no numbers/symbols';
      break;

    case 'password':
      const passRegex = /^.{8}$/;
      this.error[field] = passRegex.test(value) ? '' : 'Password must be exactly 8 characters';
      break;

    case 'age':
      const ageNum = parseInt(value);
      this.error[field] = (ageNum >= 27) ? '' : 'Age must be 27 or older';
      break;

    default:
      this.error[field] = value ? '' : 'Field Required';
  }
}

onSubmit() {
  // Validate all fields before submission
  let isValid = true;

  // Check all required fields
  const fieldsToValidate = {
    username: this.username,
    age: this.age,
    gender: this.gender,
    email: this.email,
    password: this.password,
    qualification: this.qualification,
    experience: this.experience,
    contact_number: this.contact_number
  };

  // Run validation for each field
  Object.entries(fieldsToValidate).forEach(([field, value]) => {
    this.ValidateInput(field, value);
    if (this.error[field]) {
      isValid = false;
    }
  });

  // Additional age validation
  if (this.age && parseInt(this.age) < 27) {
    this.error['age'] = 'Age must be 27 or older';
    isValid = false;
  }

  // Check file selection
  if (!this.selectedFile) {
    alert("Please upload your CV document");
    isValid = false;
  }

  // If any validation failed, stop submission
  if (!isValid) {
    alert("Please correct the errors in the form");
    return;
  }

  // Proceed with form submission if valid
  const formData = new FormData();
  formData.append("username", this.username);
  formData.append("age", this.age);
  formData.append("gender", this.gender);
  formData.append("email", this.email);
  formData.append("password", this.password);
  formData.append("qualification", this.qualification);
  formData.append("experience", this.experience);
  formData.append("contact_number", this.contact_number);

  if (this.selectedFile) {
    formData.append("cv_document", this.selectedFile);
  }

  this.http.post("http://127.0.0.1:5000/therapist_signup", formData)
    .subscribe(response => {
      console.log("✅ Success:", response);
      alert("Therapist Request sent successfully for approval");
      this.router.navigate(['/mainsignups']); // Redirect to admin portal

    }, error => {
      console.error("❌ Error:", error);
    });
}

}
