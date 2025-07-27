import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListherapistsComponent } from './listherapists.component';

describe('ListherapistsComponent', () => {
  let component: ListherapistsComponent;
  let fixture: ComponentFixture<ListherapistsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListherapistsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListherapistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
