import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-userportal',
  templateUrl: './userportal.component.html',
  styleUrls: ['./userportal.component.css']
})
export class UserportalComponent implements OnInit, OnDestroy {

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // Block browser back/forward navigation
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, '', window.location.href);
      this.logout();  // Logout on back/forward attempt
    };

    // Clear session storage if user refreshes or leaves the page
    window.onbeforeunload = () => {
      sessionStorage.removeItem('loggedIn');
    };

    // Optional: Verify if session is actually active
    const loggedIn = sessionStorage.getItem('loggedIn');
    if (!loggedIn) {
      this.logout();  // Force logout if session is missing
    }
  }

  ngOnDestroy(): void {
    window.onpopstate = null;
    window.onbeforeunload = null;
  }

  logout(): void {
    this.http.post<any>('http://localhost:5000/logout', {}, { withCredentials: true })
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            sessionStorage.removeItem('loggedIn');
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          console.error('Logout failed', error);
          this.router.navigate(['/login']);  // Still redirect in case of error
        }
      });
  }
}
