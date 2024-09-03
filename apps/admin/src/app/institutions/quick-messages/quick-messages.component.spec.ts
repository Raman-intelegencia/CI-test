import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuickMessagesComponent } from './quick-messages.component';
import { InstitutionsService } from '../../../services/institutions.service';
import { InstitutionHelperService } from '../../../services/institution-helper.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('QuickMessagesComponent', () => {
  let component: QuickMessagesComponent;
  let fixture: ComponentFixture<QuickMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuickMessagesComponent],
      providers: [InstitutionsService,InstitutionHelperService, TranslateService],
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have createQuickMeesageForm defined', () => {
    expect(component.createQuickMeesageForm).toBeDefined();
  });
  it('forms should be invalid when initialized', () => {
    expect(component.createQuickMeesageForm.valid).toBeFalsy();
  });
  it('should toggle edit modes correctly', () => {
    component.openSpecialties();
    component.openTitle();
    component.openServiceTeam();
    expect(component.hidePreviewUser).toBeFalsy();

  });

});