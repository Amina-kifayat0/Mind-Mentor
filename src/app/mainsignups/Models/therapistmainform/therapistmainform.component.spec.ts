import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TherapistmainformComponent } from './therapistmainform.component';

describe('TherapistmainformComponent', () => {
  let component: TherapistmainformComponent;
  let fixture: ComponentFixture<TherapistmainformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TherapistmainformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TherapistmainformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
