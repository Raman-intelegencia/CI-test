import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstitutionSubdetailsComponent } from './institution-subdetails.component';

describe('InstitutionSubdetailsComponent', () => {
  let component: InstitutionSubdetailsComponent;
  let fixture: ComponentFixture<InstitutionSubdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstitutionSubdetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InstitutionSubdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
