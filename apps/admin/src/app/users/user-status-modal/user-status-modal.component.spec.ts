import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserStatusModalComponent } from './user-status-modal.component';

describe('UserStatusModalComponent', () => {
  let component: UserStatusModalComponent;
  let fixture: ComponentFixture<UserStatusModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserStatusModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserStatusModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
