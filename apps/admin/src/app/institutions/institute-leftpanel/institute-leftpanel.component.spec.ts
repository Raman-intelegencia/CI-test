import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstituteLeftpanelComponent } from './institute-leftpanel.component';

describe('InstituteLeftpanelComponent', () => {
  let component: InstituteLeftpanelComponent;
  let fixture: ComponentFixture<InstituteLeftpanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InstituteLeftpanelComponent]
    });
    fixture = TestBed.createComponent(InstituteLeftpanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
