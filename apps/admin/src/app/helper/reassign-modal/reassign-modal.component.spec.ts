import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReassignModalComponent } from './reassign-modal.component';

describe('ReassignModalComponent', () => {
  let component: ReassignModalComponent;
  let fixture: ComponentFixture<ReassignModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReassignModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReassignModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
