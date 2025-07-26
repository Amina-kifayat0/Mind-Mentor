import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TherapistsignupComponent } from './therapistsignup.component';

describe('TherapistsignupComponent', () => {
  let component: TherapistsignupComponent;
  let fixture: ComponentFixture<TherapistsignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TherapistsignupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TherapistsignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
