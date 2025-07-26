import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainsignupsComponent } from './mainsignups.component';

describe('MainsignupsComponent', () => {
  let component: MainsignupsComponent;
  let fixture: ComponentFixture<MainsignupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MainsignupsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainsignupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
