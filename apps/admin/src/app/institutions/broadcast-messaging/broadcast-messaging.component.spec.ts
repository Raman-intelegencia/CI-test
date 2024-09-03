import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BroadcastMessagingComponent } from './broadcast-messaging.component';
import { InstitutionsService } from '../../../services/institutions.service';
import { InstitutionHelperService } from '../../../services/institution-helper.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('BroadcastMessagingComponent', () => {
  let component: BroadcastMessagingComponent;
  let fixture: ComponentFixture<BroadcastMessagingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BroadcastMessagingComponent ],
      providers: [InstitutionsService,InstitutionHelperService,TranslateService],
      imports: [HttpClientTestingModule, TranslateModule.forRoot(),],
    })
    .compileComponents();

    fixture = TestBed.createComponent(BroadcastMessagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have createBroadcastMessageForm defined', () => {
    expect(component.createBroadcastMessageForm).toBeDefined();
  });
  it('forms should be invalid when initialized', () => {
    expect(component.createBroadcastMessageForm.valid).toBeFalsy();
  });
  it('should toggle edit modes correctly', () => {
    component.openSpecialties();
    component.openTitle();
    component.openServiceTeam();
    expect(component.hidePreviewUser).toBeFalsy();

  });
});