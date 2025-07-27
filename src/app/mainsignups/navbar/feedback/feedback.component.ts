import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent {


  feedback = {
    rating: null,
    feelings: '',
    improvement: '',
    complaints: '',
    requirements: ''
  };
  constructor(private http: HttpClient, private router: Router) {}



  submitFeedback() {
    let errorMessage = '';

    if (!this.feedback.rating) {
      errorMessage += '• Rating is required\n';
    } else if (this.feedback.rating < 1 || this.feedback.rating > 5) {
      errorMessage += '• Rating must be between 1 and 5\n';
    }

    if (!this.feedback.feelings) errorMessage += '• Feeling selection is required\n';
    if (!this.feedback.improvement) errorMessage += '• Improvement field is required\n';
    if (!this.feedback.complaints) errorMessage += '• Complaints field is required\n';
    if (!this.feedback.requirements) errorMessage += '• Requirements field is required\n';

    if (errorMessage) {
      alert('Please correct the following:\n' + errorMessage);
      return;
    }

    // Rest of the function remains the same...
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    const feedbackData = {
      user_id: user.id,
      username: user.username,
      email: user.email,
      rating: this.feedback.rating,
      feelings: this.feedback.feelings,
      improvement: this.feedback.improvement,
      complaints: this.feedback.complaints,
      requirements: this.feedback.requirements
    };

    this.http.post('http://127.0.0.1:5000/api/submit-feedback', feedbackData)
      .subscribe(
        response => {
          alert('Feedback submitted successfully');
          this.router.navigate(['/userportal']);
        },
        error => {
          alert('Error submitting feedback');
          console.error(error);
        }
      );
  }
}
