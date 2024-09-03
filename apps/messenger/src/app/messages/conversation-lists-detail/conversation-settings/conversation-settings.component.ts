import {
  AuthService,
  AuthUser,
  LEAVE_CHAT,
  loadLatestMessage,
  Profiles,
  ThreadProfile,
  Threads,
  UPDATE_USERS,
  Users,
  UsersAuthResponse,
  UserService,
  SelectedThreadHelperService,
  ThreadHelperService
} from "@amsconnect/shared";
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from "@angular/core";
import { Router } from "@angular/router";
import { combineLatest, Subscription } from "rxjs";
import { ConversationSettingsService } from "../../../../services/conversation-settings.service";
import { InboxHelperService } from "../../../../services/inbox-helper.service";
import { ComposeHelperService } from "../../../../services/compose-helper.service";
import { ComposeService } from "../../../../services/compose.service";
import { ConversationSettingsHelperClass } from "./conversation-settings-helper-class";
@Component({
  selector: "web-messenger-conversation-settings",
  templateUrl: "./conversation-settings.component.html",
  styleUrls: ["./conversation-settings.component.scss"],
})
export class ConversationSettingsComponent extends ConversationSettingsHelperClass
  implements OnInit, OnDestroy, OnChanges
{
  public threadsData: Array<Threads> = [];
  public profiles!: Array<Profiles>;
  @Output() getLeaveResponse = new EventEmitter<LEAVE_CHAT>();
  @Output() getEndConversationResponse = new EventEmitter();
  @Output() updatedRecipients = new EventEmitter();
  @Input() hasUserLeftTheChat = false;
  @Input() getExternalMsgThreadEndsVal = false;
  @Input() public selectedThreadId = "";
  @Input() selectedChatThreadData!: ThreadProfile;
  public showArchive = "Archive";
  public showMuteUnmuteText = "Mute Notifications";
  public usersAuthResponse!: AuthUser;
  private enabledValue!: string;
  public userType = "";
  private subscription: Subscription = new Subscription();
  private authSubscription: Subscription = new Subscription();
  private userSubscription: Subscription = new Subscription();
  public journalId = 0;
  public storeLeaveThreadResponse!: LEAVE_CHAT;
  public showSaveAsMessagingGrp: { $oid: string } | undefined;
  public userId = "";
  public loadLatestResponse!: loadLatestMessage;
  public endConversationResponse!: UPDATE_USERS;
  public userLeftTheChat = false;
  public serviceTeamCharacterMaxLength = 27;
  public isExternalThreadInitiater = false;
  public isUserTypeBasic = false;
  public isBasic = false;
  @Input() loggedInUserDetails!: Users | null;
  public leaveConversationApiCall = false;
  public endConversationApiCall = false;
  constructor(
    private conversationSettingsService: ConversationSettingsService,
    private userService: UserService,
    cd: ChangeDetectorRef,
    private inboxHelperSvc: InboxHelperService,
    private threadHelperService: ThreadHelperService,
    private router: Router,private selectedThreadHelperService : SelectedThreadHelperService,
    private authService: AuthService,
    composeHelperService: ComposeHelperService, composeService:ComposeService,
  ) {
    super(composeHelperService,composeService,cd);
    this.userService.userIndex$.subscribe((userIndex:string)=>{
      userIndex ? this.userIndex =  userIndex: null;
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.userIsInThread = this.selectedChatThreadData?.thread?.recipients.some(userIdObj => userIdObj?.$oid === this.selectedChatThreadData?.userProfile?._id?.$oid);
    const dataForLoadLatest2$ = combineLatest([
      this.inboxHelperSvc.threads$,
      this.inboxHelperSvc.profiles$,
      this.inboxHelperSvc.user$,this.userService.imageUrlPath$,
    ]);
    this.subscription.add(
      dataForLoadLatest2$.subscribe(([threads, profiles, currentUser,imageUrlPath]) => {
        this.threadsData = threads;
        this.profiles = profiles;
        this.loggedInUserDetails = currentUser;
        this.imageUrlPath = imageUrlPath;
      })
    );
    this.fetchMatchingThreadData();
    this.showArchive =
      this.selectedChatThread?.visibility === false ? "Unarchive" : "Archive";
    this.showMuteUnmuteText = this.selectedChatThread?.muted
      ? "Unmute Notifications"
      : "Mute Notifications";
    this.showSaveAsMessagingGrp = this.selectedChatThread?.recipients.find(
      (recipient) => recipient.$oid !== undefined
    );
  }
  ngOnInit(): void {
   this.authSubscription = this.authService.authResponseData$.subscribe((data: UsersAuthResponse) => {
      this.isBasic = data?.user?.flag_basic !== undefined;
      this.showLeaveEndConversation.isUserTypeBasic = this.isBasic;
    }) 
   this.userSubscription = this.userService.userType$.subscribe((userType) => {
      this.userType = userType;
      this.isUserTypeBasic = this.userType !== "basic";
      this.showLeaveEndConversation.isUserTypeBasic = this.isUserTypeBasic;
    });
  }

  public isExtThreadInitiater(): boolean {
    if (
      this.selectedChatThread?.user_id?.$oid &&
      (this.selectedChatThread?.user_id?.$oid !==
        this.loggedInUserDetails?._id?.$oid ||
        !this.settingsLabelStates.externalThreads)
    ) {
      return false;
    } else if (
      this.selectedChatThread?.user_id?.$oid &&
      this.selectedChatThread?.user_id?.$oid ===
        this.loggedInUserDetails?._id?.$oid
    ) {
      return true;
    }
    return false;
  }
  public fetchMatchingThreadData(): void {
    this.selectedChatThread = this.threadsData.find(
      (thread) => thread?._id?.$oid === this.selectedThreadId
    );
    if (this.selectedChatThread) {
      const recipientsIds = this.selectedChatThread.recipients.map(
        (recipientId) => recipientId.$oid
      );
      this.matchingRecipientIdWithLoggedInUser = recipientsIds.filter(
        (id) => id === this.loggedInUserDetails?._id.$oid
      );
      const nonMatchingRecipientIds = recipientsIds.filter(
        (id) => id !== this.loggedInUserDetails?._id.$oid
      );
      const nonMatchingProfiles = this.profiles.filter((profile) =>
        nonMatchingRecipientIds.includes(profile._id.$oid)
      );
      this.selectedThreadProfiles = nonMatchingProfiles;
      this.selectedThreadHelperService.setSelectedThreadProfile(this.selectedThreadProfiles);
    } 
    this.showConversationSettingsMenu(this.selectedChatThread);
  }

  public showConversationSettingsMenu(threads: Threads | undefined): void {
    this.settingsLabelStates.pagerThreads =  threads?.origin === 'api' && threads?.messages[0].type ==='pager' ? true:false;
    this.settingsLabelStates.peerToPeerThreads =
    (threads?.messages[0].type !== 'pager') && (threads?.type === "peer_to_peer");
    this.settingsLabelStates.externalThreads = threads?.["type"] === "external";
    this.settingsLabelStates.broadcastThreads =
      threads?.["type"] === "broadcast";
    this.showLeaveEndConversation.isExternalThreadInitiater =
      this.isExtThreadInitiater();
    this.showLeaveEndConversation.isExternal =
      this.settingsLabelStates.externalThreads;
    this.showLeaveEndConversation.isBroadcast =
      this.settingsLabelStates.broadcastThreads;
  }

  public archiveThread(): void {
    this.enabledValue = this.showArchive === "Archive" ? "1" : "0";
    this.conversationSettingsService
      .archiveThread(
        this.selectedChatThread?._id?.$oid ?? "",
        this.enabledValue
      )
      .subscribe((archive: { status: string }) => {
        if (archive.status === "ok") {
          this.showArchive =
            this.showArchive === "Archive" ? "Unarchive" : "Archive";
          const indexOfThreadToUpdate = this.threadsData.findIndex((thread) => {
            return thread._id.$oid === this.selectedChatThread?._id.$oid;
          });
          if (
            indexOfThreadToUpdate !== -1 &&
            this.selectedChatThread !== undefined
          ) {
            // Replace the matching thread with the updated thread
            this.threadsData[indexOfThreadToUpdate] = this.selectedChatThread;
            if (this.showArchive === "Archive") {
              if ('visibility' in this.threadsData[indexOfThreadToUpdate]) {
                delete this.threadsData[indexOfThreadToUpdate].visibility;
                this.inboxHelperSvc.threadsSource.next(this.threadsData);
              } 
              else{
                this.inboxHelperSvc.threadsSource.next(this.threadsData);
              }
            }
            else{
              this.isShowArchivedChats = this.threadHelperService.getArchiveCheckboxState();
              this.isShowArchivedChats === false ? this.router.navigateByUrl(`u/${this.userIndex}`) : '';
            }
          }
        }
      });
  }

  public muteThread(): void {
    const MUTE_NOTIFICATIONS = "Mute Notifications";
    const UNMUTE_NOTIFICATIONS = "UnMute Notifications";
    this.conversationSettingsService
      .muteThread(
        this.selectedChatThread?._id?.$oid ?? "",
        this.showMuteUnmuteText === "Mute Notifications" ? "-1" : "0"
      )
      .subscribe((mute: { status: string }) => {
        if (mute.status === "ok") {
          this.showMuteUnmuteText =
            this.showMuteUnmuteText === MUTE_NOTIFICATIONS
              ? UNMUTE_NOTIFICATIONS
              : MUTE_NOTIFICATIONS;
          const indexOfThreadToUpdate = this.threadsData.findIndex((thread) => {
            return thread._id.$oid === this.selectedChatThread?._id.$oid;
          });
          if (
            indexOfThreadToUpdate !== -1 &&
            this.selectedChatThread !== undefined
          ) {
            // Replace the matching thread with the updated thread
            this.threadsData[indexOfThreadToUpdate] = this.selectedChatThread;
            if (this.showMuteUnmuteText === "Mute Notifications") {
              this.inboxHelperSvc.threadsSource.next(this.threadsData);
            }
          }
        }
      });
  }

  public leaveConversation(): void {
    if(this.leaveConversationApiCall){
      return;
    }
    this.leaveConversationApiCall = true;
    this.conversationSettingsService
      .leaveConversation(this.selectedChatThread?._id?.$oid ?? "")
      .subscribe((leaveConversation: LEAVE_CHAT) => {
        this.settingsLabelStates.showLeavePopup = false;
        this.storeLeaveThreadResponse = leaveConversation;
        this.showErrorMessage =
          leaveConversation.status === "error" ? leaveConversation.message : "";
        this.getLeaveResponse.emit(leaveConversation);
        this.userLeftTheChat = leaveConversation.status === "ok" ? true : false;
        this.leaveConversationApiCall = false;
        const indexOfThreadToUpdate = this.threadsData.findIndex((thread) => {
          return thread._id.$oid === this.selectedChatThread?._id.$oid;
        });
        if (
          indexOfThreadToUpdate !== -1 &&
          this.selectedChatThread !== undefined
        ) {
          // Replace the matching thread with the updated thread
          this.selectedChatThread.recipients = this.selectedChatThread.recipients.filter(userId => userId.$oid !== this.loggedInUserDetails?._id.$oid);
          this.threadsData[indexOfThreadToUpdate] = this.selectedChatThread;
            this.inboxHelperSvc.threadsSource.next(this.threadsData);
        }
        this.inboxHelperSvc.fetchThreadsAndProfiles(false);
      });
  }

  public endConversation(): void {
    if(this.endConversationApiCall){
      return;
    }
    this.endConversationApiCall = true;
    const userProfileId = this.selectedChatThreadData.userProfile?._id;
    // Ensure userProfileId is defined and is an array of objects
    const recipientIds: { $oid: string }[] = Array.isArray(userProfileId)
      ? userProfileId.filter(id => id !== undefined) as { $oid: string }[]
      : userProfileId
        ? [{ $oid: userProfileId.$oid }]  // Wrap the single object in an array
        : [];
    this.conversationSettingsService
      .threadUpdateUsers(
        this.selectedChatThread?._id?.$oid ?? "",
        recipientIds
      )
      .subscribe((endConversation: UPDATE_USERS) => {
        this.settingsLabelStates.showEndConversation = false;
        this.endConversationResponse = endConversation;
        this.getEndConversationResponse.emit();
        this.showErrorMessage =
          endConversation.status === "error" ? endConversation.message : "";
          this.endConversationApiCall = false;
        this.inboxHelperSvc.fetchThreadsAndProfiles(false);
      });
  }

  public getUpdatedRecipientsData(updatedProfiles:Profiles[]): void {
    this.selectedThreadProfiles = updatedProfiles;
    this.selectedThreadHelperService.setSelectedThreadProfile(this.selectedThreadProfiles);
    this.updatedRecipients.emit();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.authSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }
}
