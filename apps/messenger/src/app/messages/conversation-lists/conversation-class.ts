import { ThreadsService } from "../../../services/threads.service";
import { NotifierService } from "../../../services/socket.service";
import { ConversationListClass } from "./conversation-list-class";
import {
    AuthService,
    CommonService,
    CookieService,
    GetArchiveResponse, 
    PopupServiceService, 
    ThreadProfile,
    Threads,
    UserService,
    Users,
    loadLatestMessage,
    Profiles,
    SettingsService,
    UserProfileService,
    ThreadHelperService
} from "@amsconnect/shared";
import { Subscription } from "rxjs/internal/Subscription";
import { combineLatest, debounceTime, filter } from "rxjs";
import { InboxHelperService } from "../../../services/inbox-helper.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ComposeHelperService } from "../../../services/compose-helper.service";
import { ProfileStatusHelperService } from "../../../services/profile-status-helper.service";
export class ConversationClass extends ConversationListClass {
    public isNoOlderThreadsAvailable = false;
    public isLoading = false; 
    public combinedSubscription: Subscription[] = [];
    public userIndex = ""; 
    public userType = "";
    public isExternalMessaging!:boolean; //= false;
    public isShowArchivedChats = false; 
    public getAllArchiveThreadsResponseData!: GetArchiveResponse;
    public aCookieValue = this.cookieService.getCookie("a");
    public properties!: number;
    public override allChatThreads: ThreadProfile[] = []; 
    public showtooltip = false;
    public showUnreadFirst = false;
    public override unreadChatThreads: ThreadProfile[] = [];
    public override otherChatThreads: ThreadProfile[] = [];
    public openedChatThreadId!: string | null;
    public selectedChatThread!: ThreadProfile;
    public showProfileModal = false;
    public userDetails!: Users | null;
    public previousArchiveValue!: boolean;
    public searchMessage = "";
    public showLoader = false;
    public profileUserId ="";
    public is767Screen =false; 
    public clientExternalPermission!:boolean;
    public isBasicUser = false;
    public showProfileModalOnLoadLatest = false;
    constructor(
        public userProfileService: UserProfileService,
        commonService: CommonService,
        public threadService: ThreadsService,
        public userService: UserService,
        public authService: AuthService,
        public cookieService: CookieService,
        public settingsService: SettingsService,
        public notifierSvc: NotifierService,
        popUpService: PopupServiceService,
        public threadHelperService: ThreadHelperService,
        public inboxHelperSvc: InboxHelperService, router: Router,
        activatedRoute: ActivatedRoute,composeHelperService:ComposeHelperService,
        public profileStatusHelperServ : ProfileStatusHelperService
    ) {
        super(commonService,popUpService,router,activatedRoute,composeHelperService);
    }

    public load_latest_2(archive:boolean) {
        if(!this.userDetails){
            return;
        }

        if(this.clientExternalPermission)
            {
                this.isExternalMessaging =  (this.clientExternalPermission && this.userDetails?.access_group_actions_map?.client_institution_external_msg) ?? false; 
            }
        this.archive = this.userDetails?.properties?.seen_coach_mark_hint_archive_all; 
        this.commonService.setCheckboxState(this.properties);
        this.showtooltip = +this.archive === 0 ? true : false;
        this.threads = this.threadHelperService.replaceTemporaryMessagesWithRealData(this.threads);
        this.allChatThreads = [];
        if (!archive) {
            this.threads = this.threads.filter(thread => {
                // Keep the thread if it doesn't have 'visibility' as its own property, 
                return !Object.prototype.hasOwnProperty.call(thread, "visibility");
            });
        }   
        this.allChatThreads = this.threadHelperService.findMatchingThreads(this.threads, this.profiles, this.userDetails, this.userId);
        this.showUnreadFirst = this.properties === 1;
        this.showProfileModal = false;
        if (this.showUnreadFirst) {
            this.separateChatThreads();
        }
        if (this.allChatThreads && this.openedChatThreadId) {
            this.extractThreadById(this.allChatThreads, this.openedChatThreadId);
        }
    }

public searchThreadProfile(): void {
    this.showLoader = true;
    this.isSearchDisabled = this.showLoader;
    this.userProfileService.searchProfileMessages(this.isShowArchivedChats, this.searchMessage)
      .subscribe((dataResponse:loadLatestMessage) => {
        this.showLoader = false;
 // Assuming dataResponse contains an array of threads
 const sortedThreads = dataResponse.threads.sort((a, b) => {
    // Assuming time_updated is a property in each thread
    const timeA = a.time_updated.$date;
    const timeB = b.time_updated.$date;

    // Sorting in descending order (newest first)
    return timeB - timeA;
  });

  // Process the sorted threads
  this.processSearchResponse({ ...dataResponse, threads: sortedThreads });
      });
}

private processSearchResponse(dataResponse: loadLatestMessage): void {
    this.archive = dataResponse.user?.properties?.seen_coach_mark_hint_archive_all; 
    this.commonService.setCheckboxState(this.properties);
    this.showtooltip = +this.archive === 0 ? true : false;
    if (!this.isShowArchivedChats) {
        dataResponse.threads = dataResponse.threads.filter(thread => {
            // Keep the thread if it doesn't have 'visibility' as its own property, 
            return !Object.prototype.hasOwnProperty.call(thread, "visibility");
        });
    }   
    this.storeSearchResultsThreads = dataResponse.threads;
    this.isSearchDisabled = this.storeSearchResultsThreads.length > 0;
    if (this.storeSearchResultsThreads.length === 0) {
        this.isNoResultsFound = true;
        this.isSearchDisabled = true;
    } else {
        this.clearChatThreads();
        const unreadChat = dataResponse.threads.filter((thread: { unread_count: number; }) => thread.unread_count > 0);
        const otherChat = dataResponse.threads.filter((thread: { unread_count: number; }) => thread.unread_count === 0);
        if (unreadChat.length && this.showUnreadFirst) {
            this.unreadChatThreads = this.filterThreads(unreadChat,dataResponse.profiles,this.userDetails?? {} as Users);            
        }
        if (otherChat.length && this.showUnreadFirst) {
            this.otherChatThreads = this.filterThreads(otherChat,dataResponse.profiles,this.userDetails?? {} as Users);            
        }
        if (!this.showUnreadFirst) {
            this.allChatThreads = this.filterThreads(dataResponse.threads,dataResponse.profiles,this.userDetails?? {} as Users);
        }
    }
}

public filterThreads(threads: Threads[],profiles:Profiles[],user:Users): ThreadProfile[] {
    return this.threadHelperService.findMatchingThreads(threads, profiles, user, this.userId);
}

    public clearThreadSearch(): void {
        this.searchMessage = '';
        this.isSearchDisabled = true;
        this.clearChatThreads();  
        this.inboxHelperSvc.fetchThreadsAndProfiles(this.isShowArchivedChats, 1);
        const unreadChat = this.threads.filter((thread: { unread_count: number; }) => thread.unread_count > 0);
        const otherChat = this.threads.filter((thread: { unread_count: number; }) => thread.unread_count === 0)
    if (unreadChat.length && this.showUnreadFirst) {
        this.unreadChatThreads = this.filterThreads(unreadChat,this.profiles,this.userDetails as Users);
    }
    if (otherChat.length && this.showUnreadFirst) {
        this.otherChatThreads = this.filterThreads(otherChat,this.profiles,this.userDetails as Users);
    }
    if (!this.showUnreadFirst) {
        this.allChatThreads = this.filterThreads(this.threads,this.profiles,this.userDetails as Users);
    } 
    }
    public setUserProperties():void{
        this.combinedSubscription.push( this.inboxHelperSvc.user$.subscribe((user) => { 
             this.setSchedulingCheckbox(user?.properties?.seen_coach_mark_scheduling_checkbox as number);
             this.setPatientList(user?.properties?.seen_coach_mark_mypatients_add as number);
          }));
    }

    public loadOlderThreads() {
        const lastTimeStamp = this.getLastThreadTimeUpdated();
        if (lastTimeStamp && !this.isNoOlderThreadsAvailable && this.isLoading) {
            if (this.threads.length) {
                this.inboxHelperSvc.fetchAndMergeOlderThreads(this.isShowArchivedChats, false, (hasData) => {
                    this.isLoadMore = false
                    if (hasData) {
                        if (this.userDetails) {
                            this.allChatThreads = [];
                            this.allChatThreads = this.threadHelperService.findMatchingThreads(this.threads, this.profiles, this.userDetails, this.userId);
                        }
                        if (this.showUnreadFirst) {
                            this.separateChatThreads();
                        }
                        if (this.allChatThreads && this.openedChatThreadId) {
                            this.extractThreadById(this.allChatThreads, this.openedChatThreadId);
                        }
                        this.isLoading = false;
                    } else {
                        this.isLoading = false;
                        this.isNoOlderThreadsAvailable = true;
                        this.isLoadMore = false;
                    }
                });
            } else {
                this.isLoadMore = false;
                this.isLoading = false;
                this.isNoOlderThreadsAvailable = true;
            }
        }
    }

    public getUserServiceData() {
        // Streams that should trigger the update
        const triggerStreams$ = combineLatest([this.notifierSvc.onMessage, this.commonService.archiveValue$])
            .pipe(filter(([syncMessage, archive]) => syncMessage.data.type === 'sync' || archive !== this.previousArchiveValue)
            );
        // Streams that only update the component's view-model
        const viewModelStreams$ = combineLatest([
            this.userService.userIndex$,
            this.userService.userId$,
            this.userService.imageUrlPath$,
            this.userService.userType$,
            this.authService.authResponseData$,
        ]);
        // Subscription for view-model updates
        this.combinedSubscription.push(
            viewModelStreams$.subscribe(([userIndex, userId, imageUrlPath, userType, authResponseData]) => {
                // Update component view-model here
                userIndex ? (this.userIndex = userIndex) : null;
                this.userId = userId;
                this.imageUrlPath = imageUrlPath;
                this.userType = userType;
                this.isBasicUser = authResponseData?.user?.flag_basic !== undefined; //check if logged user is basic
                this.clientExternalPermission = authResponseData.config?.client_permissions?.external_messaging;
                this.properties = authResponseData.user?.properties?.inbox_sort === "1" ? 1 : 0;
                if(userId){
                    this.isShowArchivedChats = this.threadHelperService.getArchiveCheckboxState();
                    this.inboxHelperSvc.fetchThreadsAndProfiles(this.isShowArchivedChats);
                }
                
            })
        );
        // Subscription for triggering updates
        this.combinedSubscription.push(
            triggerStreams$.pipe(
                debounceTime(1500) //Add debounce to reduce the frequency of API calls
            )
            .subscribe(([syncMessage, archive]) => {
                if (syncMessage && syncMessage.data.type === 'sync') {
                    this.inboxHelperSvc.fetchThreadsAndProfiles(this.isShowArchivedChats);
                    this.subscription.add(this.profileStatusHelperServ.showUserProfileModal$.subscribe(showProfileModal=>
                    this.showProfileModal = showProfileModal));          
                    if (this.showProfileModal) {
                     this.showProfileModalOnLoadLatest = true;
                        }      
                }
                if (archive !== this.previousArchiveValue) {
                    // this.inboxHelperSvc.fetchThreadsAndProfiles(archive);
                    this.previousArchiveValue = archive;
                }
            })
        );
        // We will combine the streams needed for load_latest_2 into one subscription.
        const dataForLoadLatest2$ = combineLatest([
            this.inboxHelperSvc.threads$,
            this.inboxHelperSvc.profiles$,
            this.inboxHelperSvc.user$
        ]);
        this.combinedSubscription.push(
            dataForLoadLatest2$.subscribe(([threads, profiles, currentUser]) => {
                this.threads = threads;
                this.profiles = profiles;
                this.userDetails = currentUser;
                this.isShowArchivedChats = this.threadHelperService.getArchiveCheckboxState();
                this.load_latest_2(this.isShowArchivedChats)
            })
        )
    }

    public convertMillisecondsToUrlEncodedIso(milliseconds: number): string {
        const timeMilliseconds = Number(milliseconds);
        return encodeURIComponent(new Date(timeMilliseconds).toISOString().slice(0, -1) + "000");
    }

    public getThreadArchiveAllChats(): void {
        this.threadService.getThreadArchiveAllChats(this.threads[0]._id.$oid, this.convertMillisecondsToUrlEncodedIso(this.threads[0].time_updated.$date)).subscribe((data: GetArchiveResponse) => {
            this.getAllArchiveThreadsResponseData = data;
            this.showArchivePopUp = true;
        });
    }

    public archiveSelected(): void {
        this.threadService.archiveUnarchiveThreads(this.selectedThreadIds, 1).subscribe((response) => {
            this.archiveChats = false;
            this.selectedThreadIds = [];
            this.load_latest_2(this.isShowArchivedChats);
        });
    }
    public closeModal(closeEventForProfile:boolean): void {        
        this.showProfileModalOnLoadLatest = closeEventForProfile;
      }
    public extractThreadById(threadProfiles: ThreadProfile[], threadIdToSearch: string): void {
        const matchedThreadProfile = threadProfiles.find((threadProfile) => threadProfile.thread._id.$oid === threadIdToSearch);
        this.selectedChatThread = matchedThreadProfile ? matchedThreadProfile : this.selectedChatThread;
    }
    // Function to find a profile by recipient IDs and return initials or image_id
    public getRecipientProfileInfo(thread: Threads): { imageId?: string, initials?: string, profileId?: string } {
    const recipientId = thread.recipients?.length === 1 ? thread.recipients[0].$oid : thread.recipients?.find(r => r.$oid !== this.userId)?.$oid;
    if (!recipientId) return {};
    const profile = this.profiles?.find(p => p._id.$oid === recipientId);
    return profile
      ? {
          imageId: profile.image_id,
          initials: `${profile.first_name.charAt(0).toUpperCase()}${profile.last_name.charAt(0).toUpperCase()}`,
          profileId: profile._id.$oid
        }
      : {};
  }

  public openUserProfile(chatThread: ThreadProfile, userId: string): void {
    this.profileUserId = userId
    this.showProfileModal = true;
    this.selectedChatThread = chatThread;
    this.profileStatusHelperServ.setShowHideUserProfileFlag(this.showProfileModal);
}
public showUserProfile(data: boolean): void {
    this.showProfileModal = data;
  }
  public showChildProfileModal(data: boolean): void {
    this.showProfileModal = data;
  }
public onscreenVisibiltySent(event: boolean): void {
    this.is767Screen = event;
 }
 
 public openUserProfileModal():void{
    this.showProfileModal = true;
   }

   public sendSelectedUserIdToCompose(userId: string): void {
    this.selectedUserId = userId;
}
}
