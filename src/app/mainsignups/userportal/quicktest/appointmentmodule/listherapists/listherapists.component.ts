import { Component } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable} from 'rxjs';


@Component({
  selector: 'app-listherapists',
  templateUrl: './listherapists.component.html',
  styleUrl: './listherapists.component.css'
})
export class ListherapistsComponent {
  therapists: any[] = []; // Store fetched therapists

  constructor(private http: HttpClient,private router: Router) {}

  // When a patient selects a therapist
  selectTherapist(therapist: any): void {
    this.router.navigate(['/bookapp', therapist._id]);
  }


  ngOnInit() {
    this.fetchTherapists();
  }

  fetchTherapists() {
    this.http.get<any[]>('http://127.0.0.1:5000/admin/get_approved_therapists').subscribe(
      (data) => {
        this.therapists = data; // Store response in therapists array
        console.log("Fetched Therapists:", data); // Debugging log
      },
      (error) => {
        console.error('Error fetching therapists:', error);
      }
    );
  }







}

