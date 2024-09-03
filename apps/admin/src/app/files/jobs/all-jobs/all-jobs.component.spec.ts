import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllJobsComponent } from './all-jobs.component';
import { JobsService } from '../../../../services/jobs.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('AllJobsComponent', () => {
  let component: AllJobsComponent;
  let fixture: ComponentFixture<AllJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllJobsComponent ],
      providers: [JobsService, TranslateService],
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have timeRangeForm defined', () => {
    expect(component.timeRangeForm).toBeDefined();
  });
  it('forms should be invalid when initialized', () => {
    expect(component.timeRangeForm.invalid).toBeFalsy();
  });
  it('should keep the form valid after calling onClickSearch', () => {
    // Arrange: Set initial values or perform any necessary setup
    const currentDate = new Date();
    const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    component.timeRangeForm.get('timeFrom')?.setValue(component.formattedDate(oneWeekAgo));
    component.timeRangeForm.get('timeTo')?.setValue(component.formattedDate(currentDate));
  
    // Act: Call the onClickSearch method
    component.onClickSearch();
  
    // Assert: Check that the form remains valid
    expect(component.timeRangeForm.valid).toBeTruthy();
  });
  
});