import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonSSOLoginComponent } from './non-ssologin.component';

describe('NonSSOLoginComponent', () => {
  let component: NonSSOLoginComponent;
  let fixture: ComponentFixture<NonSSOLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NonSSOLoginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NonSSOLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
