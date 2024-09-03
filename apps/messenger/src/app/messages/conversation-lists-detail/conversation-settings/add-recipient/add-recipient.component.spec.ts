import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { AddRecipientComponent } from "./add-recipient.component";
import { of } from "rxjs";
import { ComposeMessageService, ProfilesData, Reference, ThreadsData } from "@amsconnect/shared";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ConversationSettingsService } from "../../../../../services/conversation-settings.service";
import { TranslateModule } from "@ngx-translate/core";

describe("AddRecipientComponent", () => {
  let component: AddRecipientComponent;
  let fixture: ComponentFixture<AddRecipientComponent>;

  const mockComposeService = {
    searchUsers: jest.fn().mockReturnValue(of({ references: [] })),
  };

  const mockConversationSettingsService = {
    profileSearch: jest.fn().mockReturnValue(of({ references: [] })),
  };

  const referenceObj: Reference = {
    type: "someType",
    id: "someId",
    data: {
      _id: {
        $oid: "",
      },
      cell_phone: "",
      cellphone_verify: false,
      date_last_login: {
        $date: 0,
      },
      email_comm: false,
      first_name: "",
      flag_active: false,
      image_id: "",
      last_name: "",
      profile: {
        dept: "",
        iid: "",
        iname: "",
        ishort: "",
        pager_number: "",
        title: "",
      },
      sms_comm: false,
      status: {
        s: "",
        away_message_mode: "",
        is_signed_out: false,
        r: undefined,
      },
      type: "",
    },
  };

  const threadsData: ThreadsData = {
    _id: {
      $oid: "",
    },
    iid: "",
    messages: [],
    time_created: {
      $date: 0,
    },
    type: "",
    user_id: {
      $oid: "",
    },
    origin: "",
    recipients: [],
    seq: 0,
    subject: "",
    time_updated: {
      $date: 0,
    },
    unread_count: 0,
  };
  const profileToRemove: ProfilesData = {
    _id: {
      $oid: "someId",
    },
    cell_phone: "123-456-7890",
    date_last_login: { $date: 0 },
    first_name: "John",
    image_id: "image123",
    last_name: "",
    profile: {
      dept: "",
      iid: "",
      iname: "",
      ishort: "",
      title: "",
    },
    status: {
      is_signed_out: false,
      s: "",
      r: undefined,
    },
    type: "",
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule,TranslateModule.forRoot()],
      declarations: [AddRecipientComponent],
      providers: [
        { provide: ComposeMessageService, useValue: mockComposeService },
        {
          provide: ConversationSettingsService,
          useValue: mockConversationSettingsService,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRecipientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should call getProfileSearchList and update recipientData on value changes", () => {
    const searchText = "test";
    const profileSearchResult = { references: [{ id: 1, data: {} }] };
    mockComposeService.searchUsers.mockReturnValue(of(profileSearchResult));

    component.conversationSettingsControls["addRecipient"].setValue(searchText);
    fixture.detectChanges();

    expect(mockComposeService.searchUsers).toHaveBeenCalledWith(
      searchText,
      "test"
    );
    expect(component.recipientData.usersDataList).toEqual(
      profileSearchResult.references
    );
  });

  it("should call addRecipientToList and add recipient to settingsMatchingProfile", () => {
    component.addRecipientToList(referenceObj);
    expect(component.settingsMatchingProfile.length).toBe(1);
    expect(component.settingsMatchingProfile[0].profile).toEqual(
      referenceObj.data
    );
  
  });

  it("should call removeExistingUser and remove user from settingsMatchingProfile", () => {
    component.settingsMatchingProfile = [
      { profile: profileToRemove, thread: threadsData },
    ];
    component.removeExistingUser(profileToRemove);
    expect(component.settingsMatchingProfile.length).toBe(0);
  });
});
