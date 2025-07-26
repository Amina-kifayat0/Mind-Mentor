import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutestComponent } from './aboutest.component';

describe('AboutestComponent', () => {
  let component: AboutestComponent;
  let fixture: ComponentFixture<AboutestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AboutestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
