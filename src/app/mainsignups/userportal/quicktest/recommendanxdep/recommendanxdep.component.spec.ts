import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendanxdepComponent } from './recommendanxdep.component';

describe('RecommendanxdepComponent', () => {
  let component: RecommendanxdepComponent;
  let fixture: ComponentFixture<RecommendanxdepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecommendanxdepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecommendanxdepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
