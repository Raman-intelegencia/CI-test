import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstitutionReportingComponent } from './institution-reporting.component';
import { InstitutionsService } from '../../../services/institutions.service';
import { InstitutionHelperService } from '../../../services//institution-helper.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('InstitutionReportingComponent', () => {
  let component: InstitutionReportingComponent;
  let fixture: ComponentFixture<InstitutionReportingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstitutionReportingComponent ],
      providers: [InstitutionHelperService,InstitutionsService, TranslateService],
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstitutionReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have createInstituteReportForm defined', () => {
    expect(component.createInstituteReportForm).toBeDefined();
  });
  it('forms should be invalid when initialized', () => {
    expect(component.createInstituteReportForm.valid).toBeFalsy();
  });
  it('should toggle edit modes correctly', () => {
    component.openServiceTeam();
    expect(component.hidePreviewUser).toBeFalsy();

  });
});