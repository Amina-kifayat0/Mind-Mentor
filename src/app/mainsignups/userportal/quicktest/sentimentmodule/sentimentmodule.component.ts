import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-sentimentmodule',
  templateUrl: './sentimentmodule.component.html',
  styleUrls: ['./sentimentmodule.component.css']
})
export class SentimentmoduleComponent {
  profileUrl: string = '';
  sentimentResult: string | null = null;
  reasonText: string | null = null;
  errorMessage: string | null = null;
  loading: boolean = false;
  examples: { text: string; score: number }[] = [];


  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  analyzeSentiment() {
  if (!this.profileUrl) return;

  this.loading = true;
  const apiUrl = 'http://127.0.0.1:5000/api/sentiment';

  this.http.post<{
    summary: string;
    explanation: string;
    examples?: { text: string; score: number }[];
  }>(apiUrl, { url: this.profileUrl }).subscribe({
    next: (response) => {
      console.log('Received response:', response);

      this.sentimentResult = response.summary || 'No summary provided.';
      this.reasonText = response.explanation || null;
      this.examples = response.examples || [];

      this.errorMessage = null;
      this.loading = false;
    },
    error: (error) => {
      console.error('Error during sentiment analysis:', error);
      this.errorMessage = 'Error. It may be that the request rate limit has been exceeded. Try again in 15 minutes.';
      this.sentimentResult = null;
      this.reasonText = null;
      this.loading = false;
    }
  });
}


  closePopup() {
    this.sentimentResult = null;
    this.reasonText = null;
  }

  handlePopupClose() {
    this.sentimentResult = null;
    this.reasonText = null;
  }
}
