import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookappComponent } from './bookapp.component';

describe('BookappComponent', () => {
  let component: BookappComponent;
  let fixture: ComponentFixture<BookappComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookappComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookappComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
