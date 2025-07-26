import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TherapistportalComponent } from './therapistportal.component';

describe('TherapistportalComponent', () => {
  let component: TherapistportalComponent;
  let fixture: ComponentFixture<TherapistportalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TherapistportalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TherapistportalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
