import {AuthService, CommonService, SelectedThreadHelperService, LEAVE_CHAT, ThreadPostResponse, ThreadProfile, UserService,ThreadHelperService} from "@amsconnect/shared";
import { Threads } from "@amsconnect/shared";
import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild,} from "@angular/core";
import { ThreadsService } from "../../../services/threads.service";
import { Subscription, interval, startWith, takeWhile, first } from "rxjs";
import { ComposeHelperService } from "../../../services/compose-helper.service";
import { ConversationDetailsClass } from "./conversation-details-class";
import { ParseDatePipe } from "../../../pipes/parse-date.pipe";
import { ActivatedRoute, Router } from "@angular/router";
import { ClientDataSetManager } from "../../../services/clientDataSetManager.service";
import { InboxHelperService } from "../../../services/inbox-helper.service";
import { ComposeService } from "../../../services/compose.service";
import { ConversationHelperService } from "../../../services/conversation-helper.service";
import { ProfileStatus } from "../../../models/profile.model";
import { ProfileStatusHelperService } from "../../../services/profile-status-helper.service";

@Component({
  selector: "web-messenger-conversation-lists-detail",
  templateUrl: "./conversation-lists-detail.component.html",
  styleUrls: ["./conversation-lists-detail.component.scss"],
})
export class ConversationListsDetailComponent
  extends ConversationDetailsClass
  implements OnInit, OnChanges, OnDestroy, AfterViewChecked {
  @ViewChild("inputField") inputField!: ElementRef;
  @Input() selectedChatThread!: ThreadProfile;
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input() showChatThread = false;
  @Output() messageSent = new EventEmitter<{checkFlag: boolean, message: string, urgent: boolean}>();
  @Output() screenVisibiltySent = new EventEmitter<boolean>();
  @Output() emitUpdatedThreads = new EventEmitter<Threads>();
  @Output() sendCoverageIdToComposePopup = new EventEmitter<string>();
  @ViewChild("scrollContainerRef", { static: false })
  private scrollContainerRef!: ElementRef<any>;
  @Input() selectedThreadId = '';
  public archiveChats = false;
  public threads!: Threads[];
  public message!: string;
  public urgentMessage = false;
  public runChecksEveryHour = true;
  public intervalSubscription: Subscription = new Subscription();
  public unreadMessageIds: string[] = [];
  private lastSeenThreadId: string | null = null;
  public getExpiresInDurationVal: string | number | undefined;
  public isExternalThread = false;
  public userIndex = "";
  private apiCalledAtTop = false;
  public lastScrollTop!: number;
  public lastSeq!: number;
  public threadInputValues: { [threadId: string]: string } = {};
  public shouldClearMessage = false;
  // Add a property to track the number of messages in the selected thread
  private previousMessageCount = 0;
  constructor(
    userService: UserService,
    threadService: ThreadsService,
    selectedThreadService: SelectedThreadHelperService,
    threadHelperService: ThreadHelperService,
    composeHelperService: ComposeHelperService,
    override parseDatePipe: ParseDatePipe,
    private router: Router, public route: ActivatedRoute,
    private clientDataSetManagerSvc: ClientDataSetManager,
    commonSvc: CommonService,
    public cd: ChangeDetectorRef,
    inboxHelperSvc:InboxHelperService,composeService:ComposeService, conversationHelperService: ConversationHelperService, authService: AuthService, private profileStatusHelperServ:ProfileStatusHelperService
  ) {
    super(userService, threadHelperService, threadService, composeHelperService, parseDatePipe, commonSvc, selectedThreadService, inboxHelperSvc, composeService, conversationHelperService, authService);
    this.composeHelperService.userId$.subscribe(
      (state) => {
        this.selectedUserId = state;  
      }
    );
    this.subscription.push(this.userService.userIndex$.subscribe(value => {
      this.userIndex = value;
    }))
  }
  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
       this.cd.detectChanges(); //fix: if the flag value is updated before change detection then we get 'ExpressionChangedAfterItHasBeenCheckedError'
    }
    if (this.messagesProcessed) {
      this.initializeScrollContainer();
      this.messagesProcessed = false; // Reset the flag
      this.cd.detectChanges();
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      if (changes['selectedThreadId']?.currentValue) {
        this.checkAndLoadOlderMessages(this.selectedChatThread);
        if (changes['selectedThreadId']?.currentValue !== changes['selectedThreadId']?.previousValue) {
          this.shouldScrollToBottom = true;
          // Reset the previous message count when a new thread is selected
        this.previousMessageCount = this.selectedChatThread?.thread.messages?.length || 0;
        this.inputField?.nativeElement?.focus();
        }
      }
      if (changes?.['selectedChatThread']) {
        this.subscription.push(
          this.selectedThreadService.clearInputField$
            .pipe(first())  // Take only the first emitted value
            .subscribe(clearInputField => {
              this.shouldClearMessage = clearInputField;
              if (this.shouldClearMessage) { 
                this.selectedThreadService.setFlagToClearInputField(false);
              } else {
                // Retrieve the input value for the current thread
                this.message = this.threadInputValues[this.selectedChatThread?.thread?._id.$oid] || '';
              }
            })
        );
      }
    // When the current thread's messages are updated
    if (changes['selectedChatThread'] && changes['selectedChatThread'].currentValue) {
      const userId = this.selectedChatThread.userProfile?._id?.$oid
      const messageId = this.selectedChatThread.thread.messages[0].user_id.$oid;
        if(userId === messageId){
          this.shouldScrollToBottom = true;
        }
      }
      this.hasUserLeft = false;
      this.getExternalMsgThreadEndsVal = false;
      this.hasExternalMessageTimeExpired = false;
      this.getUserServiceData();
      this.transformThreadMessages(this.selectedChatThread, this.userId);
      this.checkForUserLeftStatus();
      this.isTypePager();
      if (this.intervalSubscription) {
        // If an interval already exists, unsubscribe from it to avoid multiple intervals
        this.intervalSubscription.unsubscribe();
      }
      this.intervalSubscription = interval(3600000)
        .pipe(
          startWith(0),
          takeWhile(() => this.runChecksEveryHour)
        )
        .subscribe(() => {
          if (this.selectedChatThread && this.selectedChatThread.thread) {
            this.hasExternalMessageTimeExpired = this.isEnded();
          }
        });
      this.subscription.push(this.intervalSubscription);
      this.unreadMessageIds = [];
      setTimeout(() => {
        this.processedMessageIds.clear();
        if (
          changes["selectedChatThread"]?.currentValue?.thread._id.$oid !==
          this.lastSeenThreadId
        ) {
          this.lastSeenThreadId =
            changes["selectedChatThread"]?.currentValue?.thread._id.$oid;
        }
      }, 1000);
      if (this.selectedThread?.thread?.type === "external") {
        if (this.isEnded()) {
          this.isEnded();
          this.hasExternalMessageTimeExpired = true
        } else {
          this.getExpiresInDurationVal = this.getExpiresInDuration();
        }
      }
      this.isExternalThread = this.selectedThread?.thread?.type === "external";
    }
  }
  ngOnInit(): void {
  // Retrieve the persisted selectedThreadId asynchronously
  this.selectedThreadService.getSelectedThreadIdAsync().then((threadId) => {
    this.selectedThreadId = threadId ?? '';
    // Check if the selectedThreadId is not empty
    if (this.selectedThreadId !== null && this.selectedThreadId !== '' && this.userIndex) {
      this.router.navigate([`u/${this.userIndex}/inbox/thread/${this.selectedThreadId}`]);
    }
  });
  // Subscribe to changes in the selectedThreadId
  this.selectedThreadService.selectedThreadId$.subscribe((threadId) => {
    this.selectedThreadId = threadId;
  });
    this.getHeight()
  }
 
  public validateAndPost(): void {
    (localStorage.getItem(`${this.userId}_quick_send`)) ? this.newThreadPost() : null;
  }
  @HostListener("scroll", ["$event"])
  public scrollHandler(event: Event) :void {
      const scrollContainer = this.scrollContainerRef.nativeElement;
      const isAtTop = scrollContainer.scrollTop === 0;   
      const isScrollingUp = this.lastScrollTop > scrollContainer.scrollTop;
      const hasVerticalScrollBar = scrollContainer.scrollHeight > scrollContainer.offsetHeight;
   const scrollEnd = scrollContainer.scrollHeight - scrollContainer.scrollTop === scrollContainer.offsetHeight;
   this.reachedToBottom = false;
    if(scrollEnd || this.selectedChatThread.thread.unread_count===0 ){
    this.displayUnreadBottom = false;
  }
  const visibleUnreadMessageIds = this.getVisibleUnreadMessageIds(this.scrollContainerRef);
      if (isScrollingUp && !this.apiCalledAtTop && !this.isApiCallInProgress) {
        if (visibleUnreadMessageIds.length > 0 && this.selectedChatThread.thread.unread_count >= 1) {
          this.displayUnreadTop = true;
          this.isApiCallInProgress = true;
          this.displayUnreadBottom =  false;
          this.markVisibleMessagesAsRead(visibleUnreadMessageIds,hasVerticalScrollBar);  
        }
      }
      if (isAtTop && !this.apiCalledAtTop) {
        // Save the current scroll height before loading older messages
        const oldScrollHeight = this.scrollContainerRef.nativeElement.scrollHeight;
        this.displayUnreadTop = false;
        this.apiCalledAtTop = true;
        this.displayUnreadBottom =  false;
        this.isLoadMore = false;
          const processThread = (chatThread: ThreadProfile) => {
            this.threadHelperService.extractMessagesFromThread(chatThread, this.userId);
            this.selectedThread = chatThread;
            this.threadMessagesData = this.threadHelperService.getThreadMessagesData().reverse();
            this.markFirstMessagesOfDay(); //call this function to check the first message of the day & change the flag
            this.profilesData = this.threadHelperService.getProfilesData();
            this.checkIfThreadIsBroadcast = this.threadHelperService.isThreadBroadcast();
            if (chatThread.userProfile) {
              this.userName = `${chatThread.userProfile.first_name} ${chatThread.userProfile.last_name}`;
            }
          };
        // check if the thread is older or not
          if (this.selectedChatThread.thread.messages[this.selectedChatThread.thread.messages.length - 1].seq !== 1) {
            this.displayUnreadBottom = false
        // If the thread is older, fetch the updated thread first
            this.conversationHelperService.getOlderThreadMessages(this.selectedChatThread)
            .then(({ thread, lastSeq }) => {
              processThread(thread);
                this.lastSeq = lastSeq;
                this.isLoadMore = lastSeq> 1 ? true :false;
                this.previousMessageCount = thread?.thread?.messages.length;
                // Adjust the scroll position after the DOM update
                setTimeout(() => {
                  this.adjustScrollPosition(this.scrollContainerRef, oldScrollHeight);
                },0); // Delay to ensure DOM update

              })
              .catch(error => {
                console.error("Error updating thread:", error);
              });
          }
           else {
            this.displayUnreadBottom = false
            // If the thread is not older, process it directly
            processThread(this.selectedChatThread);
          }
      }
      else {
        // Reset the flag if the user is not at the top
        this.apiCalledAtTop = false;
        this.isLoadMore = false;
        this.displayUnreadBottom = false;
        if (this.selectedChatThread.thread.unread_count >= 1 && !scrollEnd && !isAtTop && this.selectedChatThread.thread.messages.length > this.previousMessageCount) {
          this.displayUnreadBottom = true;
          const unreadMessagesToMarkAsRead = this.threadMessagesData
          .filter((message) => message.status === "unread")
          .map((message) => message.message_id);
          unreadMessagesToMarkAsRead.forEach(messageId => {
            this.belowUnreadMessageData = messageId;
          })
          if (!this.apiCalledAtTop && this.reachedToBottom) {
            // Call the API for the same ID only once
            this.markVisibleMessagesAsRead(visibleUnreadMessageIds,false);
            this.apiCalledAtTop = true;  // Set the flag to avoid repeated API calls
        }
        }
      }
      this.lastScrollTop = scrollContainer.scrollTop;
  }

  public onMessageChange() {
    // Update the input field value for the selected thread
    if (this.selectedChatThread && this.selectedChatThread.thread) {
      this.threadInputValues[this.selectedChatThread?.thread?._id?.$oid] = this.message;      
    }
  }

  public adjustOverflowY(): void{
    const textarea: HTMLTextAreaElement = this.inputField.nativeElement;
    this.composeHelperService.commonAdjustOverflowY(textarea);
  }
 
  private initializeScrollContainer(): void {
    this.displayUnreadBottom = false;
      if (this.scrollContainerRef) {
        const scrollContainer = this.scrollContainerRef.nativeElement;
        const hasScrollbar = scrollContainer.scrollHeight > scrollContainer.clientHeight;
        // Determine if the scrollbar is at the bottom
        const isAtBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 1;
        const isAtTop = scrollContainer?.scrollTop === 0; 
    
        if (hasScrollbar && isAtBottom) {   
          // Scrollbar exists, handle accordingly
          const visibleUnreadMessageIds = this.getVisibleUnreadMessageIds(this.scrollContainerRef);
          if (this.selectedChatThread.thread.unread_count > 0) {      
            this.markVisibleMessagesAsRead(visibleUnreadMessageIds,false);
            this.displayUnreadTop = true;
            this.displayUnreadBottom = false;
          }
        } else if(!hasScrollbar) {
          // No scrollbar, potentially mark all messages as read
          let unreadMessageIds = [];
          if (this.selectedChatThread?.thread?.unread_count > 0) {
             unreadMessageIds = this.selectedChatThread.thread.messages
              .filter(message => message.status === 'unread')
              .map(message => message._id?.$oid);
          
            if (unreadMessageIds.length > 0) {
              this.markVisibleMessagesAsRead(unreadMessageIds, false);
            }
          }
          this.displayUnreadTop = false;
          this.displayUnreadBottom = false;
        }
        else if(hasScrollbar && !isAtBottom){
          if (!isAtTop && this.selectedChatThread.thread.messages.length > this.previousMessageCount) {
            const visibleUnreadMessageIds = this.getVisibleUnreadMessageIds(this.scrollContainerRef);
            this.displayUnreadBottom = true;
            const unreadMessagesToMarkAsRead = this.threadMessagesData
            .filter((message) => message.status === "unread")
            .map((message) => message.message_id);
            unreadMessagesToMarkAsRead.forEach(messageId => {
              this.belowUnreadMessageData = messageId;
            })
            if (!this.apiCalledAtTop && this.reachedToBottom) {
              // Call the API for the same ID only once
              this.markVisibleMessagesAsRead(visibleUnreadMessageIds,false);
              this.apiCalledAtTop = true;  // Set the flag to avoid repeated API calls
          }
          }
        }
        else if(this.selectedChatThread.thread.unread_count > 0 && hasScrollbar){
   // Scrollbar exists, handle accordingly
   const visibleUnreadMessageIds = this.getVisibleUnreadMessageIds(this.scrollContainerRef);
     this.markVisibleMessagesAsRead(visibleUnreadMessageIds,false);
     this.displayUnreadTop = true;
     this.displayUnreadBottom = false;
      }
      }
    }
  
  public scrollToBottom(): void {
    if (this.scrollContainerRef && this.scrollContainerRef.nativeElement) {
      this.scrollContainerRef.nativeElement.scrollTop =
        this.scrollContainerRef.nativeElement.scrollHeight;
    }
  }
  // Function to find the profile corresponding to a given status
  public findProfileForStatus(senderUserId: string): ProfileStatus {
    return this.threadHelperService.findProfileForStatus(
      senderUserId,
      this.selectedChatThread,
      this.userId
    );
  }
  // Combined function to check user type and get initials
  public getUserInfo(messageUserId: string): { isExternal: boolean, imageUrl: string, initials?: string } {
    return this.getMsgUserData(messageUserId, this.selectedChatThread);
  }
  public newThreadPost(): void {
    // Check if there's an ongoing API call or if there's no message and no attachments
    if (this.newThreadPostApiCall || (!this.message.trim() && this.uploadedFiles.length === 0)) {
      return;
    }
    // Indicate that an API call is now in progress
    this.newThreadPostApiCall = true;
    // Store the current values in temporary variables
    const currentMessage = this.message;
    const currentUrgent = this.urgentMessage;
    const currentAttachments = [...this.uploadedFiles];
    // Clear the original properties immediately
    this.message = "";
    this.urgentMessage = false;
    this.uploadedFiles = [];
    // Create the temporary message with the current values
    this.createNewTempMessage(currentMessage, this.selectedChatThread, currentUrgent);
    // Prepare the API request data using the temporary variables
    const formData = {
      message: currentMessage,
      urgent: currentUrgent,
      attachmentIds: currentAttachments.map(file => file.id ? file.id.toString() : "").filter(id => id !== "")
    };
    // Make the API call
    this.threadService.newThreadPost(this.selectedChatThread.thread._id.$oid, formData)
      .subscribe({
        next: (data: ThreadPostResponse) => {
          this.storeThreadPostResponse = data;
          this.storeToggleCheckboxVal  = false;
          this.displayUnreadBottom = false;
          // Success handling
          this.messageSent.emit({checkFlag: true, message: currentMessage, urgent: currentUrgent});
          this.shouldClearMessage = true;
          this.selectedThreadService.setFlagToClearInputField(true);
          this.threadInputValues = {};
          this.resetHeightToDefault();
          this.shouldScrollToBottom = true; // Set the flag to true to scroll to bottom
          this.profileStatusHelperServ.setShowHideUserProfileFlag(this.openUserProfileModal);
        },
        error: (error) => {
          // Error handling
          console.error("Error in newThreadPost:", error);
        },
        complete: () => {
          // Reset the API call flag on completion
          this.newThreadPostApiCall = false;
        }
      });
  }
  
  public updatedRecipients(): void {
    this.messageSent.emit({checkFlag: true, message: this.message, urgent: this.urgentMessage});
  }

  public getUpdatedLeaveResponse(event: LEAVE_CHAT): void {
    this.messageSent.emit({checkFlag: true, message: this.message, urgent: this.urgentMessage});
  }
  public navigatetoBack(): void {
    this.screenVisibiltySent.emit(true);
    this.router.navigate([`u/${this.userIndex}/inbox`]);
  }
  public getEndConversationResponse(): void {
    this.messageSent.emit({checkFlag: true, message: this.message, urgent: this.urgentMessage});
    this.getExternalMsgThreadEndsVal = true;
  }
  public toggleUrgentState(): void {
    this.urgentMessage = !this.urgentMessage;
  }
  public selectedQuickMessage(data: string): void {
    this.message = data;
    this.newThreadPost();
  }
  public closeModal(): void {
    this.openUserProfileModal = false;
  }
  @HostListener('input', ['$event'])
public onInput(event: Event): void {
  const textarea = document.getElementById('message') as HTMLTextAreaElement | null;
  if (textarea) {
    textarea.classList.toggle('no-new-line', localStorage.getItem(`${this.userId}_quick_send`) === "true");
  }
}
@HostListener('window:keydown', ['$event'])
public onKeyDown(event: KeyboardEvent): void {
  const textarea = document.getElementById('message') as HTMLTextAreaElement | null;

  if (textarea && event.key === 'Enter' && !event.shiftKey && localStorage.getItem(`${this.userId}_quick_send`) === "true") {
    const trimmedMessage = this.message?.trim();
    if (trimmedMessage) {
      event.preventDefault();
      this.newThreadPost();
    } else {
      //trigger for quick chat messages.
    }
  }
}

 public resetHeightToDefault(): void {
    const inputElement = document.getElementById('message') as HTMLTextAreaElement | null;
    if (inputElement) {
      inputElement.classList.remove('no-new-line');
      this.composeHelperService.resetHeightToDefault(inputElement);
    }
  }
  ngOnDestroy(): void {
    this.runChecksEveryHour = false;
    this.subscription.forEach(sub => sub.unsubscribe());
  }
}