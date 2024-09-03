import { ComponentFixture, TestBed } from "@angular/core/testing";
import { InboxManagementComponent } from "./inbox-management.component";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HttpClientModule } from "@angular/common/http"; 
import { TranslateModule } from "@ngx-translate/core";
import { SettingsService } from "apps/messenger/src/services/settings.service";

describe("InboxManagementComponent", () => {
  let component: InboxManagementComponent;
  let fixture: ComponentFixture<InboxManagementComponent>;
  let settingsService:SettingsService;
  let httpTestingController: HttpTestingController;
  const errorMessage = 'An error occurred'; 

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InboxManagementComponent],
      imports:[HttpClientModule,HttpClientTestingModule,TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InboxManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    settingsService = TestBed.inject(SettingsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it('should toggle messages checkbox selection', () => {
    const checkbox = fixture.nativeElement.querySelector('#InboxCheckbox');
    expect(component.isSortInbox).toBe(false);
 
  });

  it('should toggle pager checkbox selection', () => {
    const checkbox = fixture.nativeElement.querySelector('#TimestampCheckbox');
    expect(component.isShowTimestamp).toBe(false);
  });

  it('should toggle pager checkbox selection', () => {
    const checkbox = fixture.nativeElement.querySelector('#EnterCheckbox');
    expect(component.isPressEnter).toBe(false);
  });

  it('should save the changes', () => { 
    const formData = new FormData();
    formData.append('key', 'inbox_sort');
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
});
