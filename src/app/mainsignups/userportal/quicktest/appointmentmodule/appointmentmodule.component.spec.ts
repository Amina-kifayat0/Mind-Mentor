import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentmoduleComponent } from './appointmentmodule.component';

describe('AppointmentmoduleComponent', () => {
  let component: AppointmentmoduleComponent;
  let fixture: ComponentFixture<AppointmentmoduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppointmentmoduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentmoduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
