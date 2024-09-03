import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TitleComponent } from './title.component';
import { InstitutionsService } from 'apps/admin/src/services/institutions.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder } from '@angular/forms';

describe('TitleComponent', () => {
  let component: TitleComponent;
  let fixture: ComponentFixture<TitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TitleComponent],
      providers: [InstitutionsService,TranslateService],
      imports: [HttpClientTestingModule, TranslateModule.forRoot(),],
    }).compileComponents();

    fixture = TestBed.createComponent(TitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create an instance of TitleComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with an empty Title array', () => {
    const formBuilder = TestBed.inject(FormBuilder);
    component.createBroadcastMessageForm = formBuilder.group({
      Title: [[]],
    });

    component.settingsArrayStates = {
      filteredTitles: ['Title1', 'Title2', 'Title3'],
      filteredSpecialties: [],
    };

    component.ngOnInit();

    const formValue = component.createBroadcastMessageForm.value;

    expect(formValue.Title).toEqual([]);
  });

  it('should update title checkboxes based on the form data', () => {
    const formBuilder = TestBed.inject(FormBuilder);
    component.createBroadcastMessageForm = formBuilder.group({
      Title: [['Title1', 'Title2']],
    });

    component.settingsArrayStates = {
      filteredTitles: ['Title1', 'Title2', 'Title3'],
      filteredSpecialties: [],
    };

    component.ngOnInit();

    expect(component.titleCheckboxStates).toEqual([true, true, false]);
  });

  it('should check all titles when allTitleChecked is true', () => {
    component.allTitleChecked = true;
    component.settingsArrayStates = {
      filteredTitles: ['Title1', 'Title2', 'Title3'],
      filteredSpecialties: [],
    };
    component.checkAllTitle();

    expect(component.titleCheckboxStates).toEqual([true, true, true]);
    expect(component.selectedTitle).toEqual(['Title1', 'Title2', 'Title3']);
  });

  it('should filter titles based on the search term', () => {
    component.settingsArrayStates = {
      filteredTitles: ['Title1', 'Title2', 'Title3'],
      filteredSpecialties: [],
    };
    component.searchTerm = '2';
    component.filterTitles();

    expect(component.filteredTitles).toEqual(['Title2']);
  });

  afterEach(() => {
    // Cleanup: unsubscribe, etc.
    fixture.destroy();
  });
});
