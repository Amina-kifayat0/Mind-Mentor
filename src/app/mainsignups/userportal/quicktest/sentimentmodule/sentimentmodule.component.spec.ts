import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentimentmoduleComponent } from './sentimentmodule.component';

describe('SentimentmoduleComponent', () => {
  let component: SentimentmoduleComponent;
  let fixture: ComponentFixture<SentimentmoduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SentimentmoduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SentimentmoduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
