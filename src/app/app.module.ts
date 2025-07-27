import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SplashscreenComponent } from './splashscreen/splashscreen.component';
import { MainsignupsComponent } from './mainsignups/mainsignups.component';
import { AdminPortalComponent } from './mainsignups/adminportal/adminportal.component';
import { UserportalComponent } from './mainsignups/userportal/userportal.component';
import { NavbarComponent } from './mainsignups/navbar/navbar.component';
import { FooterComponent } from './mainsignups/footer/footer.component';
import { QuicktestComponent } from './mainsignups/userportal/quicktest/quicktest.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SentimentmoduleComponent } from './mainsignups/userportal/quicktest/sentimentmodule/sentimentmodule.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AboutestComponent } from './mainsignups/userportal/quicktest/aboutest/aboutest.component';
import { RecommendanxdepComponent } from './mainsignups/userportal/quicktest/recommendanxdep/recommendanxdep.component';
import { UsersignupComponent } from './mainsignups/Models/usersignup/usersignup.component';
import { TherapistsignupComponent } from './mainsignups/Models/therapistsignup/therapistsignup.component';
import { AdminloginComponent } from './mainsignups/Models/adminlogin/adminlogin.component';
import { AppointmentmoduleComponent } from './mainsignups/userportal/quicktest/appointmentmodule/appointmentmodule.component';
import { NavbarSecondaryComponent } from './mainsignups/userportal/quicktest/appointmentmodule/navbar-secondary/navbar-secondary.component';
import { ListherapistsComponent } from './mainsignups/userportal/quicktest/appointmentmodule/listherapists/listherapists.component';
import { BookappComponent } from './mainsignups/userportal/quicktest/appointmentmodule/listherapists/bookapp/bookapp.component';
import { PatientmainformComponent } from './mainsignups/Models/patientmainform/patientmainform.component';
import { TherapistmainformComponent } from './mainsignups/Models/therapistmainform/therapistmainform.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AboutusComponent } from './mainsignups/navbar/aboutus/aboutus.component';
import { FeedbackComponent } from './mainsignups/navbar/feedback/feedback.component';
import { TherapistportalComponent } from './mainsignups/therapistportal/therapistportal.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { HttpClientModule } from '@angular/common/http'; // <-- import this




@NgModule({
  declarations: [
    AppComponent,
    SplashscreenComponent,
    MainsignupsComponent,
    UserportalComponent,
    NavbarComponent,
    FooterComponent,
    QuicktestComponent,
    SentimentmoduleComponent,
    AboutestComponent,
    RecommendanxdepComponent,
    UsersignupComponent,
    TherapistsignupComponent,
    AdminloginComponent,
    AppointmentmoduleComponent,
    NavbarSecondaryComponent,
    ListherapistsComponent,
    BookappComponent,
    TherapistmainformComponent,
    PatientmainformComponent,
    AdminPortalComponent,
    AboutusComponent,
    FeedbackComponent,
    TherapistportalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSnackBarModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),


  ],
  providers: [
    provideAnimationsAsync(),
    provideHttpClient(), // ✅ Enables HTTP client globally
    provideRouter([])
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
