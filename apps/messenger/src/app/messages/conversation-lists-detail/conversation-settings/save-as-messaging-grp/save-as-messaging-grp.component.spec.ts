import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { SaveAsMessagingGrpComponent } from "./save-as-messaging-grp.component";
import { ConversationSettingsService } from "../../../../../services/conversation-settings.service";
import {
  ComposeMessageService,
  FormatServiceTeamPipe,
  Profiles,
  Threads,
  UserProfileService,
  UserService,
} from "@amsconnect/shared";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TranslateModule } from "@ngx-translate/core";
import { SimpleChanges } from "@angular/core";

describe("SaveAsMessagingGrpComponent", () => {
  let component: SaveAsMessagingGrpComponent;
  let fixture: ComponentFixture<SaveAsMessagingGrpComponent>;

  const selectedChatThread = {
    profile: [] as Profiles[],
    thread: {} as Threads,
    userProfile: {} as Profiles,
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaveAsMessagingGrpComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        FormatServiceTeamPipe,
      ],
      providers: [
        ConversationSettingsService,
        UserService,
        ComposeMessageService,
        UserProfileService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveAsMessagingGrpComponent);
    component = fixture.componentInstance;
    component.selectedChatThread = selectedChatThread;
    component.threads = {} as Threads;
    fixture.detectChanges();
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize form controls", () => {
    expect(component.conversationSettingsForm.get("addRecipient")).toBeTruthy();
    expect(component.conversationSettingsForm.get("groupName")).toBeTruthy();
    expect(
      component.conversationSettingsForm.get("showMessagingGrpMsgCheckbox")
    ).toBeTruthy();
    expect(
      component.conversationSettingsForm.get("includeMessagingGrpText")
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

  it("should call showConversationSettingsMenu", () => {
    const showConversationSettingsMenuSpy = jest.spyOn(
      component,
      "showConversationSettingsMenu"
    );
    const changes: SimpleChanges = {
      threads: {
        currentValue: { type: "peer_to_peer" }, // Replace with your data
        previousValue: null, // Replace with your data
        firstChange: false,
        isFirstChange: () => false,
      },
    };
    component.ngOnChanges(changes);
    expect(showConversationSettingsMenuSpy).toHaveBeenCalled();
    showConversationSettingsMenuSpy.mockRestore();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it("should call getSearchedUsersList and update recipientData", () => {
    component.conversationSettingsForm = {
      controls: {
        addRecipient: new FormControl("searchText"),
      },
    } as any;
    component.getSearchedUsersList();

    expect(component.isSearchDivOpen).toBe(true);
  });
});
