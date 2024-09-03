import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstitutionDetailsComponent } from './institution-details.component';

describe('InstitutionDetailsComponent', () => {
  let component: InstitutionDetailsComponent;
  let fixture: ComponentFixture<InstitutionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstitutionDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstitutionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
