import { AuthService, FormatServiceTeamPipe, ModalComponent, Profiles, Reference, ServiceTeamPopUpComponent, SettingsService, ThreadProfile, UserProfileService, Users, UsersAuthResponse, UserService ,ThreadHelperService} from "@amsconnect/shared";
import {
  Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import {
  status, profileResponse, Shift, UserProfile, Thread, UserType, USER_PROFILE_THREAD, threadProfileData
} from "../../../models/profile.model";
import { ProfileStatusHelperService } from "../../../services/profile-status-helper.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MessageTruncatePipe } from "../../../pipes/message-truncate.pipe";
import { ComposeComponent } from "../../compose/compose.component";
import { CurrentScheduledServiceTeamComponent } from "./current-scheduled-service-team/current-scheduled-service-team.component";
import { UserProfileModalClass } from "./user-profile-modal-class";
import { InboxHelperService } from "../../../services/inbox-helper.service";
import { UserProfileModalHelperService } from "../../../services/user-profile-modal-helper.service";
import { ComposeHelperService } from "../../../services/compose-helper.service";
@Component({
  selector: "web-messenger-user-profile-modal",
  templateUrl: "./user-profile-modal.component.html",
  styleUrls: ["./user-profile-modal.component.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, MessageTruncatePipe, ModalComponent, FormatServiceTeamPipe, ServiceTeamPopUpComponent, ComposeComponent, CurrentScheduledServiceTeamComponent]
})
export class UserProfileModalComponent extends UserProfileModalClass implements OnChanges, OnDestroy {
  @Input() selectedChatThread!: ThreadProfile;
  @Output() navigateToSelectedThread = new EventEmitter();
  @Input()
  selectedChatIds!: { selectedProfileUserId: string; selectedProfileThreadId: string; };
  @Output() closeModalEvent = new EventEmitter();
  @Output() sendUserIdToCompose = new EventEmitter();
  @Output() sendCoverageIdToCompose = new EventEmitter<{coverageId:string,type:string}>();
  @Output() composeModalEvent = new EventEmitter();
  @Output() showUserProfile = new EventEmitter<boolean>();
  @Output() showChildProfileModal = new EventEmitter<boolean>();
  @Input() public showUserProfileModal = false;
  @Input() userId = "";
  @ViewChild('fileInput')
  fileInput!: ElementRef;
  public userType = UserType;
  public getProfileValue !: Profiles;
  public authResponseData!: UsersAuthResponse;
  public isbasic = false;
  public PROFILE_CONFIG = {
    showInitials: 'show Initials',
    showProfileImage: 'show Profile Image',
    showRemovePhoto: 'show Remove Photo',
    showUploadPhoto: "show Upload Photo",
    showCameraIcon: 'show Camera Icon'
  }
  public showLoader = false;
  public showLoaderForMessageScreen = false;
  public userProfileConfig = this.PROFILE_CONFIG.showProfileImage;
  public loggedInUserDetails!: Users | null;
  public loggedInUserId = '';
  public showProfileModal = false;
  public getUpdatedUsersThreadData: USER_PROFILE_THREAD[] = [];
  public showProfileStatus!: status;
  constructor(
    private userProfileService: UserProfileService,
    profileHelperService: ProfileStatusHelperService,
    private threadHelperService: ThreadHelperService,
    router: Router, private translateService: TranslateService, 
    settingsService: SettingsService,
    userService: UserService, 
    private inboxHelperSvc: InboxHelperService,
    private authService: AuthService,
    private userProfileModalHelperService :UserProfileModalHelperService,public composeHelperService: ComposeHelperService,
    private profileStatusHelperServ:ProfileStatusHelperService
  ) {
    super(settingsService, router, userService,profileHelperService);
    this.translateService.setDefaultLang("en");
    this.subscription.add(userService.userIndex$.subscribe((userIndex: string) => {
      userIndex ? this.userIndex = userIndex : null;
    }))
  }

  ngOnChanges(changes: SimpleChanges): void {    
    if (changes) {
      this.subscription.add(
          this.userService.userId$
        .subscribe(
          (userId) => {
            this.loggedInUserId = userId;
          }));
      this.showUserProfileModal = true;
      this.showProfileModal = false;
      const userId = this.userId ? this.userId : changes?.['userId']?.currentValue;
      const selectedChatThreadValue = changes?.['selectedChatIds']?.['currentValue']?.['selectedProfileUserId'];
      this.userId = userId ? userId : selectedChatThreadValue;
      this.getImageUrl();
      this.getMessageLoad_latest2Response();
    }
    this.userProfileType = this.selectedChatThread?.sender_profile?.type.includes('oneway') ? false : true;
    this.subscription.add(this.authService.authResponseData$.subscribe((data: UsersAuthResponse) => {
      this.authResponseData = data;
      this.isbasic = this.authResponseData?.user?.flag_basic !== undefined;
    }) 
    );
  }
  public triggerFileInputClick(): void {
    this.fileInput.nativeElement.click();
  }

  public getMessageLoad_latest2Response(): void {
    this.subscription.add(
      this.inboxHelperSvc.user$.subscribe((currentUser) => {
        this.loggedInUserDetails = currentUser;
      })
    );
    this.showEnterServiceSchedule = this.loggedInUserDetails?.access_group_actions_map?.client_user_schedule_update ?? false;
    this.getUserProfileResponse();
  }

  public getUserProfileResponse(): void {
    this.showLoader = this.userProfileType ? true : false;
    this.userProfileService
      .userProfile(
        this.userId,
        this.selectedChatThread?.thread?._id.$oid ? this.selectedChatThread?.thread?._id.$oid :
          this.selectedChatIds?.selectedProfileThreadId,
        "t"
      )
      .subscribe((userProfileResponseData: profileResponse) => {
        this.showLoader = false;
        const { profile, status } = userProfileResponseData.profile;
        this.userProfileResponse = userProfileResponseData;
        this.displayProfileData =  profile ?? {} as UserProfile;
        this.showProfileStatus = status ?? {} as status;
        if(userProfileResponseData?.references){
          this.composeHelperService.setCoverageUserData(userProfileResponseData?.references?.[0]);
        }
        const profileReference: Reference = this.createProfileReference(userProfileResponseData);
        this.composeHelperService.setUserProfileData(profileReference);
        this.storeImageUrl = userProfileResponseData?.profile?.image_id
          ? this.configProfileImgUrl +
          userProfileResponseData?.profile?.image_id +
          "_profile.png"
          : "";
        this.displayNonActiveModalHeading(userProfileResponseData);
        this.showUploadPhoto = this.selectedChatIds?.selectedProfileUserId === this.selectedChatThread?.userProfile?._id?.$oid ? true : false;
        this.coverageId = userProfileResponseData?.references ? userProfileResponseData?.references?.[0].id : '';
        this.userProfileConfig =
          this.selectedChatIds?.selectedProfileUserId === this.selectedChatThread?.userProfile?._id?.$oid
            ? (this.PROFILE_CONFIG.showCameraIcon)
            : (this.selectedChatIds?.selectedProfileUserId !== this.selectedChatThread?.userProfile?._id?.$oid && this.storeImageUrl
              ? this.PROFILE_CONFIG.showProfileImage
              : this.PROFILE_CONFIG.showInitials)
        this.shifts();
      });
  }

  public shifts(): void {
    this.showLoader = this.userProfileType ? true : false;

    this.userProfileService
      .shifts(
        this.userId
          ? this.userId
          : this.selectedChatIds.selectedProfileUserId
      )
      .subscribe((shiftsResponse) => {
        this.showLoader = false;
        this.shiftsData = shiftsResponse.shifts || [];
        
        this.scheduledServiceTeam = this.shiftsData.filter((shift: Shift) => shift.currently_active === false).map(shift => {
          const integratedService = shiftsResponse.role_type.flatMap(role => role.integrated)
            .find(service => shift.roles?.includes(service.description) && service.tag);
          if (integratedService) {
            shift.tag = integratedService.tag;
          } 
            return shift
        });

        this.currentServiceTeam = this.shiftsData.filter((shift: Shift) => shift.currently_active === true).map(shift => {
          const integratedService = shiftsResponse.role_type.flatMap(role => role.integrated)
            .find(service => shift.roles?.includes(service.description) && service.tag);
          if (integratedService) {
            shift.tag = integratedService.tag;
          } 
          return shift;
        });
        this.selectedUserId = this.userProfileResponse?.references?.[0]
          ? this.userProfileResponse?.references[0]?.id
          : "";
        this.getUserThreadResponse();
      });
  }

  public getUserThreadResponse(): void {
    this.showLoaderForMessageScreen = this.userProfileType ? true : false;
    this.userProfileService
      .userThreadResponse(
        this.userId ? this.userId : this.selectedChatIds?.selectedProfileUserId
      )
      .subscribe((userThreadResponse: Thread) => {
        this.showLoaderForMessageScreen = false;
        this.getUserThreadValue = userThreadResponse;
        this.getThreadMessagesResponse = userThreadResponse.threads;
        this.getUpdatedUsersThreadData = this.userProfileModalHelperService.findMatchingUserProfileThreads(this.getThreadMessagesResponse,userThreadResponse.profiles,this.loggedInUserId);
      });
  }
  public getFormattedContent(messages: any, profiles: threadProfileData[], threadUpdatedTime: string): string | undefined {
    const messageInfo = this.getFirstUserContentAndTime(messages, threadUpdatedTime);
    if (messageInfo) {
      if (messageInfo.attachments && messageInfo.attachments.length && !messageInfo.content) {
        const attachmentMsg = `${messageInfo.attachments.length} attachments`;
        return messageInfo.user_id === this.userId ? attachmentMsg : `${this.getUserNameById(messageInfo.user_id, profiles)}: ${attachmentMsg}`;
      }
      else {
        this.userImageId = this.getImageIdById(messageInfo.user_id, profiles) as string;
        this.userLastName = this.getLastNameById(messageInfo.user_id, profiles) as string;
        this.userFirstName = this.getUserNameById(messageInfo.user_id, profiles) as string;
        const truncatedContent = this.threadHelperService.truncateContent(messageInfo.content);
        return this.userFirstName ? `${this.userFirstName}: ${truncatedContent}` : truncatedContent;
      }
    }
    return undefined;
  }
  public showMoreMessages(): void {
    this.initialMessageCount = this.getThreadMessagesResponse.length;
  }

  public backToFirstServiceTeamScreen(): void {    
    this.showServiceTeamList = false;
    this.shifts();
  }
  public openMessagesDetailScreen(id: string): void {
    this.showUserProfileModal = false;
    this.userIndex ? this.router.navigateByUrl(`/u/${this.userIndex}/inbox/thread/${id}`) : null;
    this.navigateToSelectedThread.emit();
  }

  public openCurrentlyCoveredProfile(): void {
    this.showLoader = this.userProfileType ? true : false;
    this.userProfileService
      .userProfile(
        this.userProfileResponse?.references?.[0] ? this.userProfileResponse?.references[0]?.id : ''
      )
      .subscribe((userProfileResponseData: profileResponse) => {
        this.showLoader = false;
        const { profile, status } = userProfileResponseData.profile;
        this.userProfileResponse = userProfileResponseData;
        this.displayProfileData =  profile ?? {} as UserProfile;
        this.selectedUserId = userProfileResponseData?.profile?._id?.$oid ?? '';
        this.showNonActiveUserModal = !userProfileResponseData?.references?.[0]?.data?.flag_active ? userProfileResponseData?.references?.[0]?.data?.first_name + " " + userProfileResponseData?.references?.[0]?.data?.last_name + "is not active" : '';
        this.coverageId = userProfileResponseData?.references ? userProfileResponseData?.references?.[0].id : '';
        this.showProfileStatus = status ?? {} as status;
        this.userId = userProfileResponseData?.profile?._id?.$oid ?? '';
        this.shifts();
      });
  }

  public clearUserProfileData(): void {
    this.scheduledServiceTeam = [];
    this.currentServiceTeam = [];
    this.userProfileResponse = {} as profileResponse;
    this.displayProfileData = {} as UserProfile;
    this.showProfileStatus = {} as status;
    this.showUploadPhoto = false;
    this.userId = '';
    this.coverageId = '';
    this.storeImageUrl = "";
    this.showUserProfileModal = false;
    const showProfileModal = false;
    this.showProfileModal = showProfileModal;
    this.getUserThreadValue = {} as Thread;
    this.getThreadMessagesResponse = [];
    this.showUserProfile.emit(this.showUserProfileModal);
    this.showChildProfileModal.emit(this.showProfileModal);
    this.showEnterServiceSchedule = false;
    this.getUpdatedUsersThreadData = [];
    this.showLoader = false;
    this.closeModalEvent.emit(false);
    this.profileStatusHelperServ.setShowHideUserProfileFlag(false);
  }

  public sendMessage(): void {
    this.showNonActiveUser = !this.userProfileResponse?.profile?.flag_active;
    this.sendUserIdToCompose.emit(this.userId);
    this.composeHelperService.sendUserIdToCompose(this.userId); 
    this.composeHelperService.setCoverageId("");
    this.composeModalEvent.emit();
    this.showUserProfileModal = false;
  }

  public openProfileModal(user_id: string):void{
    this.showUserProfileModal = false;
    this.userId = user_id;    
    this.showProfileModal = true;
  }
  public sendMsgToCoverage(): void {
    this.showNonActiveUser =
      !this.userProfileResponse?.references?.[0]?.data?.flag_active;
    this.sendCoverageIdToCompose.emit({coverageId:this.coverageId,type:'userProfile'});
    this.composeHelperService.setCoverageId(this.coverageId);
    this.composeHelperService.sendUserIdToCompose("");
    this.showUserProfileModal = false;
  }
  public closeNonActiveUserModal(): void {
    this.showNonActiveUser = false;
    this.showUserProfileModal = false;
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
