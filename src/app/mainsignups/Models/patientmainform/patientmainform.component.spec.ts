import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientmainformComponent } from './patientmainform.component';

describe('PatientmainformComponent', () => {
  let component: PatientmainformComponent;
  let fixture: ComponentFixture<PatientmainformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientmainformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientmainformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
