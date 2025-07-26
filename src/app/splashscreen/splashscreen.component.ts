import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splashscreen',
  templateUrl: './splashscreen.component.html',
  styleUrl: './splashscreen.component.css'
})
export class SplashscreenComponent implements OnInit {
     constructor(private router: Router){}
     ngOnInit(): void {
       setTimeout(()=>{
        this.router.navigate(['/mainsignups']);
       },2000);
     }
     }




