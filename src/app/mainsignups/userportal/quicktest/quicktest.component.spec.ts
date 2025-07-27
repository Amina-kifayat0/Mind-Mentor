import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuicktestComponent } from './quicktest.component';

describe('QuicktestComponent', () => {
  let component: QuicktestComponent;
  let fixture: ComponentFixture<QuicktestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuicktestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuicktestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
