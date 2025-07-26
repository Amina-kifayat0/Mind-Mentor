import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import Chart from 'chart.js/auto';


@Component({
  selector: 'app-adminportal',
  templateUrl: './adminportal.component.html',
  styleUrls: ['./adminportal.component.css'],
  providers: [DatePipe]
})
export class AdminPortalComponent implements OnInit {
  adminData = {
    username: '',
    new_password: ''
  };
  public apiUrl = 'http://localhost:5000'; // ✅ Now accessible from other components

  activeSection: string = 'users'; // Default active section
  feedbackList: any[] = [];
  users: any[] = [];
  therapists: any[] = [];
  selectedTherapist: any = null;
  showUpdateModal: boolean = false;
  therapistRequests: any[] = [];
  allAppointmentRequests: any[] = [];
  allConfirmedAppointments: any[] = [];
  therapistEmail: string = '';  // Store therapist email for blocking/unblocking
  blockedTherapists: any[] = [];
  totalUsers: number = 0;
totalQuickTests: number = 0;
userSignupData: any[] = [];
quickTestData: any[] = [];




  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    // Prevent backward navigation after login
    history.pushState(null, '', location.href);  // Add a state to prevent going back
    window.onpopstate = () => {
      history.pushState(null, '', location.href);  // Re-push state to prevent going back
      this.router.navigate(['/adminportal']); // Redirect to current portal page if back is pressed
    };


  }

  chartInstance: any = null;


  showSection(section: string, event?: Event) {
    if (event) {
      event.preventDefault(); // Prevent default anchor behavior
    }
    this.activeSection = section;

    // Load data for the selected section
    switch(section) {
      case 'users':
        this.fetchUsers();
        break;
      case 'therapists':
        this.getApprovedTherapists();
        break;
      case 'requests':
        this.loadTherapistRequests();
        break;
      case 'feedback':
        this.fetchFeedback();
        break;
      case 'data':
        this.fetchAnalyticsData();
        break;
      case 'Appointment Data':
        this.fetchAllAppointments()
        break;
        case 'blocked therapists':
        this.getBlockedTherapists()
        break;


            //fucntion to call confirmed
    }
  }

  fetchUsers() {
    this.http.get<any[]>('http://127.0.0.1:5000/get_users').subscribe(
      data => { this.users = data; },
      error => { console.error('Error fetching users:', error); }
    );
  }

  deleteUser(userId: string) {
    if (confirm("Are you sure you want to delete this user?")) {
      this.http.delete(`http://127.0.0.1:5000/delete_user/${userId}`).subscribe(
        () => {
          this.users = this.users.filter(user => user._id !== userId);
        },
        error => { console.error('Error deleting user:', error); }
      );
    }
  }

  openProfileModal() {
    this.authService.getAdminProfile().subscribe({
      next: (res: any) => {
        this.adminData.username = res.username;
        const modal = document.getElementById('profileModal');
        if (modal) modal.style.display = 'flex';
      },
      error: (error: any) => {
        console.error("Error fetching admin profile", error);
        alert("Failed to load admin profile.");
      }
    });
  }

  closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.style.display = 'none';
  }

  logoutAdmin() {
    this.authService.adminLogout().subscribe({
      next: () => {
        localStorage.removeItem('adminToken');
        alert("You have been logged out!");
        this.router.navigate(['/mainsignups']);
      },
      error: (error) => {
        console.error("Logout failed", error);
        alert("Logout failed. Try again.");
      }
    });
  }



  loadTherapistRequests() {
    this.authService.getTherapistRequests().subscribe(
      (requests) => {
        this.therapistRequests = requests;
      },
      (error) => {
        console.error("Error loading therapist requests:", error);
      }
    );
  }

  downloadFile(filename: string) {
    if (!filename) {
      console.error("Filename is undefined!");
      return;
    }

    const cleanFilename = filename.replace(/^uploads\//, '');
    this.authService.downloadTherapistFile(cleanFilename).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = cleanFilename;
      a.click();
      URL.revokeObjectURL(objectUrl);
    }, error => {
      console.error("Error downloading file:", error);
    });
  }

  rejectTherapist(therapistId: string, email: string) {
    this.authService.rejectTherapist(therapistId, email).subscribe(
      response => {
        alert("Therapist Rejected");
        this.loadTherapistRequests();
      },
      error => {
        console.error('Error rejecting therapist:', error);
      }
    );
  }

  getApprovedTherapists(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.http.get<any[]>('http://localhost:5000/admin/get_approved_therapists')
      .subscribe(
        (response) => {
          this.therapists = response.map(therapist => ({
            ...therapist,
            cv_document: therapist.cv_document || ''
          }));
        },
        (error) => {
          console.error("Error fetching therapists:", error);
        }
      );
  }

  approveTherapist(id: string, email: string) {
    this.http.post('http://127.0.0.1:5000/admin/approve_therapist', { id, email }).subscribe(
      (response) => {
        console.log('Therapist approved:', response);
        this.getApprovedTherapists();
        this.loadTherapistRequests();
      },
      (error) => {
        console.error('Error approving therapist:', error);
      }
    );
  }

  deleteTherapist(therapistId: string) {
    if (confirm("Are you sure you want to remove this therapist?")) {
      this.authService.deleteTherapist(therapistId).subscribe({
        next: () => {
          alert("Therapist deleted successfully!");
          this.getApprovedTherapists();
        },
        error: (error) => {
          console.error("Error deleting therapist", error);
          alert("Failed to delete therapist.");
        }
      });
    }
  }

  openUpdateModal(therapist: any) {
    this.selectedTherapist = { ...therapist };
    this.showUpdateModal = true;
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
  }

  updateTherapist() {
    if (!this.selectedTherapist) return;

    this.authService.updateTherapist(this.selectedTherapist._id, this.selectedTherapist).subscribe({
      next: (response) => {
        alert("Therapist details updated successfully!");
        this.closeUpdateModal();
        this.getApprovedTherapists();
      },
      error: (error) => {
        console.error("Error updating therapist:", error);
        alert("Failed to update therapist details.");
      }
    });
  }

  fetchFeedback() {
    this.http.get<any[]>('http://localhost:5000/api/get-feedback')
      .subscribe((data) => {
        this.feedbackList = data;
      });
  }

  deleteFeedback(feedback_id: string) {
    console.log('Deleting feedback with ID:', feedback_id);
    this.http.delete(`http://localhost:5000/api/delete-feedback/${feedback_id}`)
      .subscribe(
        () => {
          this.feedbackList = this.feedbackList.filter(f => f._id !== feedback_id);
        },
        (error) => {
          console.error('Error deleting feedback:', error);
        }
      );
  }

  fetchAllAppointments() {
    this.http.get<any>('http://localhost:5000/api/admin/get-all-appointments').subscribe({
      next: (response) => {
        this.allAppointmentRequests = response.appointment_requests;
        this.allConfirmedAppointments = response.confirmed_appointments;
        this.activeSection = 'allAppointments';  // Show related section
      },
      error: (err) => {
        console.error('Error fetching all appointments:', err);
      }
    });
  }

 // Block Therapist
// Block Therapist
// Block Therapist
blockTherapist(therapistEmail: string): void {
  if (therapistEmail) {
    this.http.post<any>('http://localhost:5000/block-therapist', { email: therapistEmail })
      .subscribe({
        next: (response) => {
          alert('Therapist blocked and removed from requests successfully');
          this.loadTherapistRequests();  // Refresh the therapist requests table
        },
        error: (err) => {
          alert('Error blocking therapist');
          console.error('Error blocking therapist:', err);
        }
      });
  } else {
    alert('Please select a therapist email');
  }
}



// Unblock Therapist
unblockTherapist(therapistEmail: string): void {
  if (therapistEmail) {
    this.http.post<any>('http://localhost:5000/unblock-therapist', { email: therapistEmail })
      .subscribe({
        next: (response) => {
          alert('Therapist unblocked successfully');
          this.getBlockedTherapists();  // Refresh the blocked therapists list
        },
        error: (err) => {
          alert('Error unblocking therapist');
          console.error('Error unblocking therapist:', err);
        }
      });
  } else {
    alert('Please select a therapist email');
  }
}


// Get Blocked Therapists
getBlockedTherapists(): void {
  this.http.get<any>('http://localhost:5000/get-blocked-therapists')
    .subscribe({
      next: (response) => {
        this.blockedTherapists = response;
      },
      error: (err) => {
        console.error('Error fetching blocked therapists:', err);
      }
    });
}

fetchAnalyticsData() {
  // Total users
  this.http.get<any>('http://localhost:5000/api/analytics/users').subscribe({
    next: (res) => this.totalUsers = res.total_users,
    error: (err) => console.error("Error fetching total users", err)
  });

  // Total quick tests
  this.http.get<any>('http://localhost:5000/api/analytics/quicktests').subscribe({
    next: (res) => this.totalQuickTests = res.total_quick_tests,
    error: (err) => console.error("Error fetching quick tests", err)
  });

  // Quick test usage over time
  this.http.get<any[]>('http://localhost:5000/api/analytics/quicktests/over_time').subscribe({
    next: (res) => {
      this.quickTestData = res;
      this.renderQuickTestChart(); // Render chart once data is available
    },
    error: (err) => console.error("Error fetching quick test usage over time", err)
  });
}



renderQuickTestChart() {
  const ctx = document.getElementById('quickTestChart') as HTMLCanvasElement;

  // Destroy the previous chart instance if it exists
  if (this.chartInstance) {
    this.chartInstance.destroy();
  }

  const labels = this.quickTestData.map(item => item._id); // Dates
  const data = this.quickTestData.map(item => item.count); // Test count

  this.chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Quick Test Usage',
        data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: 'Date' }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Number of Tests' }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            // Custom tooltip content
            afterLabel: (context) => {
              const index = context.dataIndex;
              const users = this.quickTestData[index]?.users || [];
              return users.map((u: any) => `User ID: ${u.user_id}, Name: ${u.user_name}`);
            }
          }
        }
      }
    }
  });
}


}
