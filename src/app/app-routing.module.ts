import { AdminloginComponent } from './mainsignups/Models/adminlogin/adminlogin.component';
import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SplashscreenComponent } from './splashscreen/splashscreen.component';
import { MainsignupsComponent } from './mainsignups/mainsignups.component';
import { AdminPortalComponent } from './mainsignups/adminportal/adminportal.component';
import { TherapistportalComponent } from './mainsignups/therapistportal/therapistportal.component';
import { UserportalComponent } from './mainsignups/userportal/userportal.component';
import { QuicktestComponent } from './mainsignups/userportal/quicktest/quicktest.component';
import { SentimentmoduleComponent } from './mainsignups/userportal/quicktest/sentimentmodule/sentimentmodule.component';
import { AboutestComponent } from './mainsignups/userportal/quicktest/aboutest/aboutest.component';
import { RecommendanxdepComponent } from './mainsignups/userportal/quicktest/recommendanxdep/recommendanxdep.component';
import { NavbarComponent } from './mainsignups/navbar/navbar.component';
import { FooterComponent } from './mainsignups/footer/footer.component';
import { UsersignupComponent } from './mainsignups/Models/usersignup/usersignup.component';
import { TherapistsignupComponent } from './mainsignups/Models/therapistsignup/therapistsignup.component';
import { AppointmentmoduleComponent } from './mainsignups/userportal/quicktest/appointmentmodule/appointmentmodule.component';
import { NavbarSecondaryComponent } from './mainsignups/userportal/quicktest/appointmentmodule/navbar-secondary/navbar-secondary.component';
import { ListherapistsComponent } from './mainsignups/userportal/quicktest/appointmentmodule/listherapists/listherapists.component';
import { BookappComponent } from './mainsignups/userportal/quicktest/appointmentmodule/listherapists/bookapp/bookapp.component';
import { PatientmainformComponent } from './mainsignups/Models/patientmainform/patientmainform.component';
import { TherapistmainformComponent } from './mainsignups/Models/therapistmainform/therapistmainform.component';
import { AboutusComponent } from './mainsignups/navbar/aboutus/aboutus.component';
import { FeedbackComponent } from './mainsignups/navbar/feedback/feedback.component';


const routes: Routes = [
  {path:'', component: SplashscreenComponent},
  {path:'mainsignups',component:MainsignupsComponent},
  {path:'navbar', component:NavbarComponent},
  {path:'footer',component:FooterComponent},
   {path: 'adminportal', component:AdminPortalComponent},
   {path: 'therapistportal', component:TherapistportalComponent},
   {path: 'userportal', component: UserportalComponent},
   {path:'quicktest',component: QuicktestComponent},
   {path:'sentimentmodule', component: SentimentmoduleComponent},
   {path:'aboutest', component:AboutestComponent},
   {path:'recommendanxdep', component: RecommendanxdepComponent},
   {path:'usersignup', component: UsersignupComponent},
   {path:'therapistsignup', component:TherapistsignupComponent},
   {path:'adminlogin', component:AdminloginComponent},
   {path:'appointmentmodule', component:AppointmentmoduleComponent},
   {path:'navbar-secondary', component: NavbarSecondaryComponent},
   {path:'listherapists', component: ListherapistsComponent},
   {path: 'bookapp/:therapistId', component: BookappComponent},
   {path:'patientmainform', component:PatientmainformComponent},
   {path:'therapistmainform',component:TherapistmainformComponent},
   {path:'aboutus',component:AboutusComponent},
   {path:'feedback', component:FeedbackComponent}





 ];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
