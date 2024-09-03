import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadUsersPreviewComponent } from './upload-users-preview.component';

describe('UploadUsersPreviewComponent', () => {
  let component: UploadUsersPreviewComponent;
  let fixture: ComponentFixture<UploadUsersPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadUsersPreviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadUsersPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
