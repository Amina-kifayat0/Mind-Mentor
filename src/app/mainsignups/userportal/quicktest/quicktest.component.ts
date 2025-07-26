import { AuthService } from './../../../services/auth.service';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-quicktest',
  templateUrl: './quicktest.component.html',
  styleUrl: './quicktest.component.css'
})
export class QuicktestComponent {
  gad7form: FormGroup;
  totalGAD7Score: number = 0;
  totalPHQ9Score: number = 0;
  showRecommendations: boolean = false; // Controls the visibility of the component
  testResults: any[] = [];
  userId: string = '';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    private snackbar: MatSnackBar,
    private authService: AuthService
  ) {
    this.gad7form = this.fb.group({
      question1: [null, Validators.required],
      question2: [null, Validators.required],
      question3: [null, Validators.required],
      question4: [null, Validators.required],
      question5: [null, Validators.required],
      question6: [null, Validators.required],
      question7: [null, Validators.required],
      question8: [null, Validators.required], // PHQ-9 Questions start here
      question9: [null, Validators.required],
      question10: [null, Validators.required],
      question11: [null, Validators.required],
      question12: [null, Validators.required],
      question13: [null, Validators.required],
      question14: [null, Validators.required],
      question15: [null, Validators.required],
      question16: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    // Retrieve user ID from localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    this.userId = userData.id;

    // Ensure userId is valid
    if (!this.userId) {
      console.error('User not logged in or user ID is missing.');
      this.snackbar.open('User not logged in. Please log in to proceed.', 'Close', {
        panelClass: ['warning-snackbar'],
        duration: 5000,
      });
      return;
    }

    // Fetch test history on page load
    this.authService.getTestHistory(this.userId).subscribe({
      next: (res) => {
        this.testResults = res.history;
      },
      error: (err) => {
        console.error('Error fetching test history:', err);
      }
    });
  }

  openModal() {
    const modalElement = document.getElementById('testHistoryModal');

    // Ensure modalElement is not null before creating a new Modal
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    } else {
      console.error('Modal element not found');
    }
  }

  onSubmit() {
    if (this.gad7form.invalid) {
      this.snackbar.open('Error! Please answer all questions before proceeding.', 'Close', {
        panelClass: ['warning-snackbar'],
        duration: 5000,
      });
      return;
    }

    // Separate GAD-7 (First 7 Questions) and PHQ-9 (Last 9 Questions)
    let gad7Score = 0;
    let phq9Score = 0;

    Object.keys(this.gad7form.value).forEach((key, index) => {
      const score = parseInt(this.gad7form.value[key], 10);
      if (index < 7) {
        gad7Score += score;
      } else {
        phq9Score += score;
      }
    });

    this.totalGAD7Score = gad7Score;
    this.totalPHQ9Score = phq9Score;

    let anxietyLevel = this.getAnxietyLevel(gad7Score);
    let depressionLevel = this.getDepressionLevel(phq9Score);

    let message = `GAD-7 Score: ${gad7Score} (${anxietyLevel})\nPHQ-9 Score: ${phq9Score} (${depressionLevel})`;

    // Check if userId is valid
    if (!this.userId) {
      console.error('User is not logged in or user ID is missing.');
      this.snackbar.open('User not logged in. Please log in to proceed.', 'Close', {
        panelClass: ['warning-snackbar'],
        duration: 5000,
      });
      return;
    }

    // Construct payload to send to backend
    const payload = {
      gad7_score: gad7Score,
      phq9_score: phq9Score,
      anxiety_level: anxietyLevel,
      depression_level: depressionLevel,
      id: this.userId,  // Send user ID as "id"
    };

    console.log('Payload being sent to backend:', payload);  // Log the payload to check if the ID is included

    // Submit data to backend
    this.http.post('http://localhost:5000/api/quicktest/savehistory', payload).subscribe({
      next: (response) => {
        console.log('Quick test results saved:', response);
      },
      error: (error) => {
        console.error('Error saving quick test results:', error);
        this.snackbar.open('Failed to save test results. Please try again.', 'Close', {
          panelClass: ['warning-snackbar'],
          duration: 5000,
        });
      }
    });

    let isSevere = (gad7Score >= 10 || phq9Score >= 15);

    let snackbarRef = this.snackbar.open(
      isSevere
        ? `${message}\nRedirecting to Sentiment Analysis Module...`
        : `${message}\nClick below to view Recommendations.`,
      isSevere ? 'Close' : 'View Recommendations',
      {
        panelClass: ['success-snackbar'],
        duration: 0,  // Set duration to 0 so the user has to click to close
      }
    );

    snackbarRef.afterDismissed().subscribe(() => {
      if (isSevere) {
        this.router.navigate(['/sentimentmodule']);
      } else {
        this.router.navigate(['/recommendanxdep']);
      }
    });
  }

  getAnxietyLevel(score: number): string {
    if (score <= 4) return 'Minimal Anxiety';
    if (score <= 9) return 'Mild Anxiety';
    if (score <= 14) return 'Moderate Anxiety';
    return 'Severe Anxiety';
  }

  getDepressionLevel(score: number): string {
    if (score <= 4) return 'Minimal Depression';
    if (score <= 9) return 'Mild Depression';
    if (score <= 14) return 'Moderate Depression';
    if (score <= 19) return 'Moderately Severe Depression';
    return 'Severe Depression';
  }
}
