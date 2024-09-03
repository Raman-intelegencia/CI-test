import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Message, PopupServiceService, Profiles, ThreadProfile, CommonService, ArchiveAllChatsResponse, UserService, AuthService, CookieService, loadLatestMessage, SelectedThreadHelperService, Users, Integrated, SettingsService, UserProfileService,ThreadHelperService 
} from "@amsconnect/shared";
import { filter, startWith } from "rxjs";
import { ThreadsService } from "../../../services/threads.service";
import { NotifierService } from "../../../services/socket.service";
import { ConversationClass } from "./conversation-class";
import { InboxHelperService } from "../../../services/inbox-helper.service";
import { USER_TYPE } from "../../../models/user-type.model";
import { ConversationHelperService } from "../../../services/conversation-helper.service";
import { ComposeHelperService } from "../../../services/compose-helper.service";
import { ProfileStatusHelperService } from "../../../services/profile-status-helper.service";
@Component({
    selector: "web-messenger-conversation-lists",
    templateUrl: "./conversation-lists.component.html",
    styleUrls: ["./conversation-lists.component.scss"],
})
export class ConversationListsComponent extends ConversationClass implements OnInit, OnDestroy{

    @ViewChild("showArchiveCheckbox", { static: false })
    showArchiveCheckbox!: ElementRef<HTMLInputElement>;
    @ViewChild("scrollableList") scrollableList!: ElementRef;
    public isNot767Screen = false;
    public showThreadMessages!: boolean;
    public archiveAllThreadsResponseData!: ArchiveAllChatsResponse;
    public selectedThreadId ='';
    public user_Type = USER_TYPE;
    public loadingInProgress =false;
    public storeOlderSearchResults!: loadLatestMessage;
    public integratedTag :Integrated[]=[]; 
    constructor(
        router: Router,
        activatedRoute: ActivatedRoute,
        popUpService: PopupServiceService,
        userProfileService: UserProfileService,
        threadService: ThreadsService,
        commonService: CommonService,
        threadHelperService: ThreadHelperService,
        userService: UserService,
        authService: AuthService,
        settingsService: SettingsService,
        notifierSvc: NotifierService,
        cookieService: CookieService,
        inboxHelperSvc: InboxHelperService,
        private conversationHelperService: ConversationHelperService,
        composeHelperService:ComposeHelperService,private selectedThreadService:SelectedThreadHelperService,profileStatusHelperServ : ProfileStatusHelperService
    ) {
        super(userProfileService, commonService, threadService, userService, authService, cookieService, settingsService, notifierSvc, popUpService, threadHelperService, inboxHelperSvc,router,activatedRoute,composeHelperService,profileStatusHelperServ);
    }

    ngOnInit(): void {
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                startWith(null), // Emit an initial value to check immediately
            )
            .subscribe(() => {
                // Traverse down to the child route, if one exists
                let route = this.activatedRoute;
                while (route.firstChild) {
                    route = route.firstChild;
                }
                // At this point, `route` is the last child in the route tree.
                route.params.subscribe((params) => {
                    const threadId = params["threadId"];
                    this.openedChatThreadId = threadId;
                    this.showThreadMessages = !!threadId;
                });
            });
            this.inboxHelperSvc.user$.subscribe(( currentUser) => { 
                this.integratedTag = currentUser?.status?.integrated_st_tag!; 
              })
        this.getUserServiceData();
        this.listenRouteParams();
        this.setUserProperties();
    }

    public closeTooltip(): void {
        this.showtooltip = false;
        const formData = new FormData();
        formData.append("key", "seen_coach_mark_hint_archive_all");
        formData.append("value", "1");
        if (this.aCookieValue) {
            formData.append("a", this.aCookieValue);
        }
        this.settingsService.setUserProperty(formData).subscribe();
    }

    public navigateToChatThread(chatThread: ThreadProfile, threadId: string): void {
        this.selectedThreadService.setSelectedThreadId(threadId);
        if (chatThread.thread.isOlderThread) {            
        this.conversationHelperService.getOlderThreadMessages(chatThread)
        .then(({ thread, lastSeq }) => {
          this.selectedChatThread = thread;
          this.selectedThreadId = thread.thread._id.$oid;
        })
        .catch(error => {
          console.error("Error updating thread:", error);
        });
    }
    else {
        this.selectedChatThread = chatThread;
        this.selectedThreadId = this.selectedChatThread.thread._id.$oid;
    }
        this.showThreadMessages = true;
        if (this.userIndex) {
            this.router.navigate([`u/${this.userIndex}/inbox/thread/${threadId}`]);
            if(window.innerWidth <= 767){
                this.onResize();
                this.is767Screen = false 
                this.isNot767Screen =  true;
            }
        }
    }
    @HostListener('window:resize', ['$event'])
    onResize(): void {
      this.is767Screen = window.innerWidth <= 767;
      this.isNot767Screen =  false;
    }

    public getFirstUserContentAndTime(
        messages: Message[],
        threadUpdatedTime: number,
    ):
        | {
              content: string;
              time_updated: number;
              user_id: string;
              attachments?: any[];
          }
        | undefined {
        return this.threadHelperService.getFirstContentAndTime(messages, threadUpdatedTime);
    }

    public getFormattedContent(messages: Message[], profiles: Profiles[], threadUpdatedTime: number): string | undefined {
        const messageInfo = this.getFirstUserContentAndTime(messages, threadUpdatedTime);
        if (messageInfo) {
            // Check if there are attachments without content
            if (messageInfo.attachments && messageInfo.attachments.length && !messageInfo.content) {
                const attachmentMsg = `${messageInfo.attachments.length} attachments`;
                return messageInfo.user_id === this.userId ? attachmentMsg : `${this.threadHelperService.getUserNameById(messageInfo.user_id, profiles)}: ${attachmentMsg}`;
            }
            // If it's the current logged-in user, just return the content
            if (messageInfo.user_id === this.userId) {
                return this.threadHelperService.truncateContent(messageInfo.content);
            } else {
                // Otherwise, prepend the username
                const userName = this.threadHelperService.getUserNameById(messageInfo.user_id, profiles);
                const truncatedContent = this.threadHelperService.truncateContent(messageInfo.content);
                return userName ? `${userName}: ${truncatedContent}` : truncatedContent;
            }
        }
        return undefined;
    }

    public toggleShowArchivedChats(): void {
        this.updateShowArchivedChatsStatus();
    }

    private updateShowArchivedChatsStatus(): void {
        if (this.showArchiveCheckbox) {
            const isChecked = this.showArchiveCheckbox.nativeElement.checked;
            this.isShowArchivedChats = isChecked;
            this.commonService.setArchiveValue(isChecked);
            this.threadHelperService.setArchiveCheckboxState(this.userId,isChecked);
            // Call the API when the checkbox is checked
            this.inboxHelperSvc.fetchThreadsAndProfiles(isChecked, 'val')
        }
    }

    public toggleThreadSelection(threadId: string): void {
        const index = this.selectedThreadIds.indexOf(threadId);
        // add/remove thread Id
        index === -1 ? this.selectedThreadIds.push(threadId) : this.selectedThreadIds.splice(index, 1);
    }

    public archiveAllChatThreads(): void {
        this.threadService.threadArchiveAllChatThreads(this.threads[0]._id.$oid, new Date(this.threads[0].time_updated.$date).toISOString()).subscribe((data: ArchiveAllChatsResponse) => {
            this.archiveAllThreadsResponseData = data;
            this.showArchivePopUp = false;
            this.archiveChats = !this.archiveChats;
            this.inboxHelperSvc.fetchThreadsAndProfiles(this.isShowArchivedChats, 1); //loadlatest api call to update the chat lists
        });
    } 
    
    public getReceiversValues(receivers: Array<{ name: string; }> | undefined): string {
        if (!receivers || receivers.length === 0) return '';
       
        const maxLength = 35;
       
        let maxDisplayCount = Math.min(receivers.length, 3);
        let displayString = '';
      
        while (maxDisplayCount > 0) { 
          let modifiedNames = [];
      
          // Iterate through the receivers
          for (let i = 0; i < maxDisplayCount; i++) {
            const receiver = receivers[i];
            let displayName = receiver.name;
      
            // Check if there's a corresponding description in integratedTag
            const integratedReceiver = this.integratedTag?.find(x => x.description === receiver.name);
            if (integratedReceiver) {
              // Postpend "Qgenda" to the name
              displayName = `${displayName} <span class="text-xs font-bold bg-accent rounded p-1 dark:text-black">${integratedReceiver.tag}</span>`;
            }
            // Push the modified name to the array
            modifiedNames.push(displayName);
          }
          displayString = modifiedNames.join(', ');
          const additionalCount = receivers.length - maxDisplayCount; 
          displayString = additionalCount > 0 ? `${displayString} + ${additionalCount} more` : displayString;
      
          // Check if the string length is within the limit
          if (displayString.length <= maxLength) {
            break;
          }
          maxDisplayCount -= 1;
        }
        return displayString;
      }

    // unsubscribe the subscription to prevent data leaks
    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        if (this.combinedSubscription) {
            this.combinedSubscription.forEach(sub => sub.unsubscribe());
        }
    }

    @HostListener("scroll", ["$event"])
    scrollHandler(event: any) {
        const scrollContainer = this.scrollableList.nativeElement;
        this.isLoadMore = scrollContainer.scrollTop + scrollContainer.clientHeight > scrollContainer.scrollHeight - 10
        const isAtBottom = scrollContainer.scrollTop + scrollContainer.clientHeight > scrollContainer.scrollHeight - 5;
        if(this.isNoOlderThreadsAvailable){
            this.isLoadMore = false;
        }
        if (isAtBottom && !this.isLoading && !this.isNoOlderThreadsAvailable && !this.searchMessage) {
            this.isLoading = true;
            this.loadOlderThreads();
        }        
        const getTimestampVal = this.storeSearchResultsThreads[this.storeSearchResultsThreads.length - 1]?.time_updated?.$date;
        if(!getTimestampVal && this.threads.length && this.storeOlderSearchResults?.threads.length===0){            
            this.isLoadMore = false;
        }
        if (isAtBottom && !this.isLoading && !this.isNoOlderThreadsAvailable  && this.searchMessage && getTimestampVal) {
            if (!this.loadingInProgress) {
            this.loadingInProgress = true;
            this.userProfileService.searchProfileMessages(this.isShowArchivedChats, this.searchMessage, getTimestampVal).subscribe(
                    (dataResponse: loadLatestMessage) => {    
                        this.storeOlderSearchResults = dataResponse;
                        this.archive = dataResponse.user?.properties?.seen_coach_mark_hint_archive_all; 
                        this.commonService.setCheckboxState(this.properties);
                        this.showtooltip = +this.archive === 0 ? true : false;
                        if (!this.isShowArchivedChats) {
                            dataResponse.threads = dataResponse.threads.filter(thread => {
                                // Keep the thread if it doesn't have 'visibility' as its own property, 
                                return !Object.prototype.hasOwnProperty.call(thread, "visibility");
                            });
                        }   
                const sortedThreads = dataResponse.threads.sort((a, b) => {
                const timeA = a.time_updated.$date;
                const timeB = b.time_updated.$date;
                     return timeB - timeA;
                        });
                this.processDataResponse({ ...dataResponse, threads: sortedThreads });
                    },(error) => {  this.handleErrorResponse(); }
                );}
    }
    }
    
    private processDataResponse(dataResponse: loadLatestMessage): void {
        this.storeSearchResultsThreads = dataResponse.threads;
        if (dataResponse.threads.length) {
            this.isSearchDisabled = true;
        }
        if (!dataResponse.threads.length) {
            this.isLoadMore = false;
            this.loadingInProgress = false;
        } 
        else {
            this.threads = dataResponse.threads;
            this.profiles = dataResponse.profiles;
            this.loadingInProgress = false;
            const unreadChat = dataResponse.threads.filter((thread: { unread_count: number }) => thread.unread_count > 0);
            const otherChat = dataResponse.threads.filter((thread: { unread_count: number }) => thread.unread_count === 0);
            const updatedUnreadThreads = [...this.unreadChatThreads.map((threads) => threads.thread), ...unreadChat];
            const updatedOlderOtherChats = [...this.otherChatThreads.map((threads) => threads.thread), ...otherChat];
            const updatedAllChatThreads = [...this.allChatThreads.map((threads) => threads.thread), ...dataResponse.threads];
            if (unreadChat.length && this.showUnreadFirst) {
                this.unreadChatThreads = this.filterThreads(updatedUnreadThreads,dataResponse.profiles,this.userDetails?? {} as Users);
            }
            if (otherChat.length && this.showUnreadFirst) {
                this.otherChatThreads = this.filterThreads(updatedOlderOtherChats,dataResponse.profiles,this.userDetails?? {} as Users);
            }
            if (!this.showUnreadFirst) {
                this.allChatThreads = this.filterThreads(updatedAllChatThreads,dataResponse.profiles,this.userDetails?? {} as Users);
            }
        }
        this.showLoader = false;
            }
    
    private handleErrorResponse(): void {
        // Reset the flag in case of an error
        this.loadingInProgress = false;
        this.showLoader = false;
    }

    public closeErrorPopup(){
        this.isNoResultsFound = false;
    }
    public onChangeThreadSearch(event: string) {
        this.searchMessage = event;
        if (this.searchMessage.trim().length === 0) {
            this.isSearchDisabled = true;
          this.inboxHelperSvc.fetchThreadsAndProfiles(this.isShowArchivedChats, 1);
          this.allChatThreads = this.threadHelperService.findMatchingThreads(this.threads, this.profiles, this.userDetails as Users, this.userId);
        } 
        else {
            this.isSearchDisabled = false;
        }
      }

    public onMessageSent(event: {checkFlag: boolean, message: string, urgent: boolean}): void {
        this.threadHelperService.addTempMessagesInThreads(this.threads, this.selectedChatThread, this.userId, event.message, event.urgent);
        event.checkFlag ? this.load_latest_2(this.isShowArchivedChats) : null;
    }
}
