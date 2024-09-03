import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddUserServicesComponent } from './add-user-services.component';

describe('AddUserServicesComponent', () => {
  let component: AddUserServicesComponent;
  let fixture: ComponentFixture<AddUserServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUserServicesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddUserServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
