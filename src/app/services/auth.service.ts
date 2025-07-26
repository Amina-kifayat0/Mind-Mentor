import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public apiUrl = 'http://localhost:5000'; // ✅ Now accessible from other components

  constructor(private http: HttpClient) {}






  analyzeSentiment(profileUrl: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/sentiment`, { url: profileUrl });
  }

  // ✅ Admin Login
  adminLogin(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/login`, credentials, {
      withCredentials: true // ✅ Ensures session is set after login
    });
  }

  // ✅ Fetch admin profile
  getAdminProfile(): Observable<any> {
    return this.http.get('http://127.0.0.1:5000/admin/profile'); // Remove Authorization header
  }


  // ✅ Admin Logout
  adminLogout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/logout`, {}, { withCredentials: true });
  }

  // ✅ Patient Signup
  signup(userData: any) {
    return this.http.post(`${this.apiUrl}/signup`, userData).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          localStorage.setItem('userData', JSON.stringify(response.data));
          alert("Signup successful!");
        } else {
          alert("Signup failed: " + response.message);
        }
      },
      error: (error: any) => {
        console.error("Signup error:", error);
        alert("An error occurred during signup.");
      }
    });
  }



 // Example in auth.service.ts
getProfile(): Observable<any> {
  return this.http.get('http://localhost:5000/profile', { withCredentials: true });
}
updateProfile(updatedData: any): Observable<any> {
  return this.http.put('/profile', updatedData);  // Correct, matches Flask route
}





  getTherapistRequests() {
    return this.http.get<any[]>('http://127.0.0.1:5000/admin/get_therapist_requests');
  }

  loadTherapistRequests() {
    this.getTherapistRequests().subscribe(
      (requests) => {
        console.log("Therapist Requests Loaded:", requests);
      },
      (error) => {
        console.error("Error loading therapist requests:", error);
      }
    );
  }


  approveTherapist(id: string) {
    this.http.post(`${this.apiUrl}/admin/update_therapist_status`, { therapist_id: id, status: "approved" }).subscribe(
      () => {
        alert("Therapist Approved!");
        this.loadTherapistRequests(); // ✅ Now properly defined
      },
      (error) => {
        console.error("Approval error:", error);
      }
    );
  }



   // ✅ Correct way to fetch the file
   downloadTherapistFile(filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download_file/${filename}`, { responseType: 'blob' });
  }
//reject therapist func
rejectTherapist(therapistId: string, email: string): Observable<any> {
  const body = {
    id: therapistId,
    email: email
  };

  return this.http.post('http://127.0.0.1:5000/admin/reject_therapist', body, {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  });
}
getApprovedTherapists(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/admin/get_approved_therapists`);
}



//therapist login
// authService.ts

therapistLogin(credentials: { username: string, password: string }): Observable<any> {
  return this.http.post(`${this.apiUrl}/therapist/login`, credentials, {
    withCredentials: true  // Ensures cookies are sent/received
  }).pipe(
    tap((response: any) => {
      console.log('Login Response:', response);
      if (response.message === 'Login successful') {
        // You can store user data or therapist details in the local storage
        // After successful login
localStorage.setItem('therapistData', JSON.stringify(response));
localStorage.setItem('therapist_id', response.id); // Store therapist ID

      }
    }),
    catchError(error => {
      console.error("Login error:", error);
      return throwError(() => new Error("Login failed."));
    })
  );
}



getTherapistProfile(): Observable<any> {
  return this.http.get(`${this.apiUrl}/therapist/profile`, { withCredentials: true }); // Ensures therapist is authenticated
}

// Therapist Logout
therapistLogout(): Observable<any> {
  return this.http.post(`${this.apiUrl}/therapist/logout`, {}, { withCredentials: true });
}

//admin deletes  therapist
deleteTherapist(therapistId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/admin/delete_therapist/${therapistId}`);
}

//admin update therapist
updateTherapist(id: string, updatedData: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/updateTherapist/${id}`, updatedData);
}




approveAppointment(id: string) {
  return this.http.post('http://localhost:5000/api/approve-appointment', { id });
}

declineAppointment(id: string) {
  return this.http.post('http://localhost:5000/api/decline-appointment', { id });
}
// Get Pending Appointment Requests for Therapist
getAppointmentRequests(therapistId: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/get-appointments?therapist_id=${therapistId}`);
}

// Get Confirmed Appointments for Therapist
getConfirmedAppointments(therapistId: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/get-confirmed-appointments?therapist_id=${therapistId}`);
}

// Get the current logged-in user from localStorage
getUser(): any {
  const user = localStorage.getItem('userData');
  return user ? JSON.parse(user) : null; // If user is logged in, return user data
}

login(username: string, password: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/login`, { username, password }).pipe(
    tap((response: any) => {
      console.log('Login Response:', response);  // Log the entire response to see the structure
      if (response.status === 'success' && response.data) {
        localStorage.setItem('userData', JSON.stringify(response.data));  // Save user data if valid
      }
    }),
    catchError(error => {
      console.error("Login error:", error);
      return throwError(() => new Error("Login failed."));
    })
  );
}

getTestHistory(userId: string) {
  return this.http.get<any>(`http://localhost:5000/api/quicktest/history/${userId}`);
}



// Log out by clearing localStorage
logout(): void {
  localStorage.removeItem('userData');
}


getTotalUsers(): Observable<any> {
  return this.http.get<any>('http://localhost:5000/api/analytics/users');
}

getTotalQuickTests(): Observable<any> {
  return this.http.get<any>('http://localhost:5000/api/analytics/quicktests');
}

getQuickTestsOverTime(): Observable<any> {
  return this.http.get<any>('http://localhost:5000/api/analytics/quicktests/over_time');
}

getAppointments(therapistId: string): Observable<any[]> {
  return this.http.get<any[]>(`http://localhost:5000/api/get-appointments?therapist_id=${therapistId}`);
}

sendEmailReminder(appointmentId: string): Observable<any> {
  return this.http.post<any>(`http://localhost:5000/send_email_reminder/${appointmentId}`, {});
}




}
