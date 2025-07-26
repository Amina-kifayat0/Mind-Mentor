import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  CalendarEvent,
  CalendarView,
  CalendarMonthViewDay,  // Corrected import
} from 'angular-calendar';
import { parseISO } from 'date-fns';

@Component({
  selector: 'app-therapistportal',
  templateUrl: './therapistportal.component.html',
  styleUrls: ['./therapistportal.component.css']
})
export class TherapistportalComponent implements OnInit {

  therapistId: string = '';
  appointmentRequests: any[] = [];
  confirmedAppointments: any[] = [];
  showProfileModal: boolean = false;
  reminderInterval: any;
  notifiedAppointmentIds: Set<string> = new Set();


  reminders: any[] = [];
  reminderMessage: string = '';


  token: string = '';
  password: string = '';

  therapist: any = {
    username: '',
    age: '',
    email: '',
    gender: '',
    qualification: '',
    experience: '',
    contact_number: ''
  };

  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  CalendarView = CalendarView;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {

        this.startReminderPolling();


    // 🔒 Prevent back navigation
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', () => {
      history.pushState(null, '', location.href);
    });

    const therapistData = JSON.parse(localStorage.getItem('therapistData') || '{}');
    this.therapistId = therapistData.id || localStorage.getItem('therapist_id') || '';

    if (!this.therapistId) {
      this.router.navigate(['/therapist-login']);
      return;
    }


    localStorage.setItem('therapist_id', this.therapistId);

    this.getAppointmentRequests();
    this.getConfirmedAppointments();
    this.fetchTherapistProfile();

    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  getAppointmentRequests() {
    const therapist_id = localStorage.getItem('therapist_id');
    if (!therapist_id) return;

    this.http.get<any[]>(`http://127.0.0.1:5000/api/get-appointments?therapist_id=${therapist_id}`)
      .subscribe(
        (data) => {
          this.appointmentRequests = data;
        },
        (error) => {
          console.error("❌ Error fetching appointment requests:", error);
        }
      );
  }

  getConfirmedAppointments() {
    const therapist_id = localStorage.getItem('therapist_id');
    if (!therapist_id) return;

    this.http.get<any[]>(`http://127.0.0.1:5000/api/get-confirmed-appointments?therapist_id=${therapist_id}`)
      .subscribe(
        (data) => {
          this.confirmedAppointments = data;

          // Generate calendar events from confirmed appointments
          this.events = data.map(appointment => {
            const parsedDate = parseISO(appointment.date); // Assumes ISO 8601 format (e.g., "2025-05-12T13:00:00Z")
            return {
              start: parsedDate,
              title: `Appointment with ${appointment.patient_name || 'Patient'}`,
              color: { primary: '#1e90ff', secondary: '#D1E8FF' },
            };
          });
        },
        (error) => {
          console.error("❌ Error fetching confirmed appointments:", error);
        }
      );
          alert("You Has Scedhuled Appointments, View Calendar")

  }

  approveAppointment(appointment_id: string) {
    if (!appointment_id) return;

    this.http.post('http://127.0.0.1:5000/approve_appointment', { appointment_id })
      .subscribe(
        () => {
          alert("Appointment approved successfully!");
          this.getAppointmentRequests();
          this.getConfirmedAppointments();
        },
        (error) => {
          console.error("❌ Error approving appointment:", error);
        }
      );
  }

  declineAppointment(requestId: string): void {
    const reason = prompt('Please provide a reason for declining the appointment:');
    if (!reason) return;

    this.http.post('http://127.0.0.1:5000/decline_appointment', {
      request_id: requestId,
      reason
    }).subscribe(
      () => {
        alert('Appointment declined!');
        this.getAppointmentRequests();
      },
      (error) => {
        console.error("❌ Error declining appointment:", error);
      }
    );
  }

  showRequests = true;
  showConfirmed = false;
  showCalendar = false;

  showSection(section: string) {
    this.showRequests = section === 'requests';
    this.showConfirmed = section === 'confirmed';
    this.showCalendar = section === 'calendar';
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();

    this.http.post('http://localhost:5000/therapist/logout', {}, { withCredentials: true }).subscribe({
      next: () => this.router.navigate(['/mainsignups']),
      error: (err) => console.error('🔴 Logout failed', err)
    });
  }

  fetchTherapistProfile() {
    const therapistId = localStorage.getItem('therapist_id');
    if (!therapistId) return;

    this.http.get<any>(`http://127.0.0.1:5000/api/therapist-profile?id=${therapistId}`)
      .subscribe(
        (response) => {
          this.therapist = response;
          this.showProfileModal = true;
        },
        (error) => {
          console.error("❌ Error fetching therapist profile:", error);
        }
      );
  }

  openProfileModal(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.fetchTherapistProfile();
  }

  closeProfileModal(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.showProfileModal = false;
  }


  isReminderDue(dateString: string): boolean {
    const appointmentTime = new Date(dateString).getTime();
    const now = new Date().getTime();
    return appointmentTime - now <= 60 * 60 * 1000 && appointmentTime - now > 0;
  }

startReminderPolling() {
    console.log('✅ Reminder polling started');  // Add this at the top

  this.reminderInterval = setInterval(() => {
        console.log('⏰ Checking for reminders...');  // Add this too

    this.authService.getAppointments(this.therapistId).subscribe((appointments) => {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      appointments.forEach((appt: any) => {
        const apptTime = new Date(appt.date);

        // 🟡 DEBUG LOG — Add this block
        console.log(
          '🚨 DEBUG:',
          '\nAppt ID:', appt._id,
          '\nStatus:', appt.status,
          '\nAppt Time:', apptTime.toLocaleString(),
          '\nNow:', now.toLocaleString(),
          '\nOne Hour From Now:', oneHourFromNow.toLocaleString(),
          '\nAlready Notified?', this.notifiedAppointmentIds.has(appt._id)
        );

        if (
          appt.status === 'approved' &&
          apptTime >= now &&
          apptTime <= oneHourFromNow &&
          !this.notifiedAppointmentIds.has(appt._id)
        ) {
          this.snackBar.open(
            `Reminder: You have an appointment at ${apptTime.toLocaleString()}`,
            'Dismiss',
            { duration: 10000 }
          );

          this.notifiedAppointmentIds.add(appt._id);

          this.authService.sendEmailReminder(appt._id).subscribe(
            () => console.log('✅ Email reminder sent.'),
            (err) => console.error('❌ Email reminder failed:', err)
          );
        }
      });
    });
  }, 60000);
}



  // Corrected dayClicked event handler with the correct type
  dayClicked({ day, sourceEvent }: { day: CalendarMonthViewDay; sourceEvent: MouseEvent | KeyboardEvent }) {
    if (day.events.length > 0) {
      console.log('Event clicked:', day.events);
      const event = day.events[0]; // Assume the first event in the day
      alert(`Event: ${event.title} on ${event.start}`);
    }
  }
}
