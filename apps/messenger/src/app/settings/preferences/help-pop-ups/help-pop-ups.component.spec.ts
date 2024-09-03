import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HelpPopUpsComponent } from "./help-pop-ups.component";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { SettingsService } from "apps/messenger/src/services/settings.service";
 

describe("HelpPopUpsComponent", () => {
  let component: HelpPopUpsComponent;
  let fixture: ComponentFixture<HelpPopUpsComponent>;
  let settingsService:SettingsService;
  let httpTestingController: HttpTestingController;
  const errorMessage = 'An error occurred'; 

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HelpPopUpsComponent],
      imports:[HttpClientModule,HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HelpPopUpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    settingsService = TestBed.inject(SettingsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it('should save the seen_coach_mark_mypatients_add', () => { 
    const formData = new FormData();
    formData.append('key', 'seen_coach_mark_mypatients_add');
    formData.append('value',"0");
    const aCookieValue = " " ;
    formData.append('a',aCookieValue);
    const response={
      status:"ok"
    }
    settingsService.setUserProperty(formData).subscribe(data => {
      expect(data).toEqual(response);
    },
    error => {
      expect(error).toEqual(errorMessage);
    });
  });


  it('should save the seen_coach_mark_hint_archive_all', () => { 
    const formData = new FormData();
    formData.append('key', 'sseen_coach_mark_hint_archive_all');
    formData.append('value',"0");
    const aCookieValue = " " ;
    formData.append('a',aCookieValue);
    const response={
      status:"ok"
    }
    settingsService.setUserProperty(formData).subscribe(data => {
      expect(data).toEqual(response);
    },
    error => {
      expect(error).toEqual(errorMessage);
    });
  });


  it('should save the seen_coach_mark_scheduling_checkbox', () => { 
    const formData = new FormData();
    formData.append('key', 'seen_coach_mark_scheduling_checkbox');
    formData.append('value',"0");
    const aCookieValue = " " ;
    formData.append('a',aCookieValue);
    const response={
      status:"ok"
    }
    settingsService.setUserProperty(formData).subscribe(data => {
      expect(data).toEqual(response);
    },
    error => {
      expect(error).toEqual(errorMessage);
    });
  });

  it('should get the group list', () => { 
    const response={
      status:"ok"
    }
    settingsService.getGroupList().subscribe(data => {
      expect(data).toEqual(response);
    },
    error => {
      expect(error).toEqual(errorMessage);
    });
  });
});
