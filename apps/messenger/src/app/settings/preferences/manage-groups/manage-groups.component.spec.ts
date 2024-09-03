import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ManageGroupsComponent } from "./manage-groups.component";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TranslateModule } from "@ngx-translate/core";
import { FormatServiceTeamPipe} from "@amsconnect/shared";
import { ConversationSettingsService } from "apps/messenger/src/services/conversation-settings.service";
import { SettingsService } from "apps/messenger/src/services/settings.service";

describe("ManageGroupsComponent", () => {
  let component: ManageGroupsComponent;
  let fixture: ComponentFixture<ManageGroupsComponent>;
  let settingsService:SettingsService;
  let httpTestingController: HttpTestingController;
  let conversationSettingsService : ConversationSettingsService
  const errorMessage = 'An error occurred'; 

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageGroupsComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        FormatServiceTeamPipe,
      ],
      providers: [
        ConversationSettingsService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    settingsService = TestBed.inject(SettingsService);
    httpTestingController = TestBed.inject(HttpTestingController);
    conversationSettingsService :TestBed.inject(ConversationSettingsService);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
  it("should initialize form controls", () => {
    expect(component.ManageGroupForm.get("addRecipient")).toBeTruthy();
    expect(component.ManageGroupForm.get("groupName")).toBeTruthy();
    expect(
      component.ManageGroupForm.get("showMessagingGrpMsgCheckbox")
    ).toBeTruthy();
    expect(
      component.ManageGroupForm.get("includeMessagingGrpText")
    ).toBeTruthy();
  });

  it("should get addRecipient", () => {
    const abstractControl = component.addRecipient;
    expect(abstractControl).toBeInstanceOf(FormControl);
  });

  it("should get groupName", () => {
    const abstractControl = component.groupName;
    expect(abstractControl).toBeInstanceOf(FormControl);
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

  it('should get the group by Id', () => { 
    const id ="9899090"
    const response={
      status:"ok"
    }
    settingsService.getGroupById(id).subscribe(data => {
      expect(data).toEqual(response);
    },
    error => {
      expect(error).toEqual(errorMessage);
    });
  });

  it('should get the search', () => { 
    conversationSettingsService?.profileSearch().subscribe();  
  });
});
