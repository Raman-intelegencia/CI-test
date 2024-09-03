import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseCardComponent } from './base-card.component';

describe('BaseCardComponent', () => {
  let component: BaseCardComponent;
  let fixture: ComponentFixture<BaseCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BaseCardComponent]
    });
    fixture = TestBed.createComponent(BaseCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
