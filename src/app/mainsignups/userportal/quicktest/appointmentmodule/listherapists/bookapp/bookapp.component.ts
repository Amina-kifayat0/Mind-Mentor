import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../../../services/auth.service';

@Component({
  selector: 'app-bookapp',
  templateUrl: './bookapp.component.html',
  styleUrls: ['./bookapp.component.css']
})
export class BookappComponent implements OnInit {

  appointmentData: any = {
    therapist_id: '',
    user_id: '',
    user_name: '',
    user_email: '',
    user_age: '',
    user_gender: '',
    date: '', // Will be local-formatted
    message: '',
    gad7_score: null,
    phq9_score: null,
    sentiment_analysis_score: null
  };

  therapistId: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.therapistId = params.get('therapistId') || '';
      this.appointmentData.therapist_id = this.therapistId;
      console.log('Therapist ID:', this.therapistId);
    });

    // ✅ Set default datetime-local input to local time (not UTC)
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16); // format: yyyy-MM-ddThh:mm

    this.appointmentData.date = localDateTime;

    // ✅ Get user data from local storage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    console.log('Fetched User Data from localStorage:', userData);

    if (userData && userData.id) {
      this.appointmentData.user_id = userData.id;
      this.appointmentData.user_name = userData.name || '';
      this.appointmentData.user_email = userData.email || '';
      this.appointmentData.user_age = userData.age || '';
      this.appointmentData.user_gender = userData.gender || '';
    } else {
      console.log('User data is missing or invalid in localStorage');
    }

    console.log('Appointment Data after fetching user info:', this.appointmentData);
  }

  submitAppointment(): void {
  // Basic validation
  if (!this.appointmentData.date || !this.appointmentData.message ||
      !this.appointmentData.therapist_id || !this.appointmentData.sentiment_analysis_score) {
    alert('Please fill in all the required fields.');
    return;
  }

  if (this.appointmentData.gad7_score !== null &&
      (this.appointmentData.gad7_score < 0 || this.appointmentData.gad7_score > 21)) {
    alert('GAD-7 score must be between 0 and 21');
    return;
  }

  if (this.appointmentData.phq9_score !== null &&
      (this.appointmentData.phq9_score < 0 || this.appointmentData.phq9_score > 27)) {
    alert('PHQ-9 score must be between 0 and 27');
    return;
  }

  // 🔒 Time validation: only allow between 8:30 AM and 4:30 PM Asia/Karachi time
  const selectedDate = new Date(this.appointmentData.date);
  const khiTime = new Date(selectedDate.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
  const hours = khiTime.getHours();
  const minutes = khiTime.getMinutes();

  const totalMinutes = hours * 60 + minutes;
  const minMinutes = 8 * 60 + 30;  // 8:30 AM
  const maxMinutes = 16 * 60 + 30; // 4:30 PM

  if (totalMinutes < minMinutes || totalMinutes > maxMinutes) {
    alert('❌ Appointments can only be booked between 8:30 AM and 4:30 PM (Asia/Karachi time).');
    return;
  }

  // Confirm
  const confirmationMessage = `Before submitting, please confirm:\n\n` +
    `1. Your test scores are accurate (GAD-7: ${this.appointmentData.gad7_score ?? 'Not provided'}, ` +
    `PHQ-9: ${this.appointmentData.phq9_score ?? 'Not provided'})\n` +
    `2. Your sentiment analysis (${this.appointmentData.sentiment_analysis_score}) reflects your true feelings\n\n` +
    `These results are important for your proper treatment.`;

  if (!confirm(confirmationMessage)) return;

  // ✅ Convert local datetime to ISO 8601 UTC format
  const isoDate = new Date(this.appointmentData.date).toISOString();

  const appointmentToSend = {
    ...this.appointmentData,
    date: isoDate
  };

  console.log('📤 Sending Appointment:', appointmentToSend);

  this.http.post('http://localhost:5000/book_appointment', appointmentToSend)
    .subscribe(
      (response) => {
        alert('✅ Appointment request sent successfully!');
        this.router.navigate(['/userportal']);
      },
      (error) => {
        alert('❌ Error sending request.');
        console.error('🚫 HTTP Error:', error);
      }
    );
}


}
