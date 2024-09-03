import {AuthService, CommonService,   Patient,   SelectedThreadHelperService,   StatusItem,StatusResponse, ThreadMessageData, UserService,ThreadHelperService,ThreadPostResponse} from "@amsconnect/shared";
import { Observable, Subscription, combineLatest, concatMap, from, take } from "rxjs";
import { ThreadsService } from "../../../services/threads.service";
import { ComposeHelperService } from "../../../services/compose-helper.service";
import { ParseDatePipe } from "../../../pipes/parse-date.pipe";
import { ConversationDetailsHelperClass } from "./conversation-details-helper-class";
import { InboxHelperService } from "../../../services/inbox-helper.service";
import { ComposeService } from "../../../services/compose.service"; 
import { ConversationHelperService } from "../../../services/conversation-helper.service";
export class ConversationDetailsClass extends ConversationDetailsHelperClass {
  public subscription: Subscription[] = [];
  public userType = "";
  public statusDataByMessage: Map<string, StatusItem[]> = new Map();
  public expandedMessageId: string | null = null;
  public hasExternalMessageTimeExpired = false;
  public hasUserLeft = false;
  public aboveUnreadMessageSet: Set<ThreadMessageData> = new Set();
  public belowUnreadMessageSet: Set<ThreadMessageData> = new Set();
  public processedMessageIds: Set<string> = new Set();
  public getIdAndtype!: { coverageId: string; type: string; };
  public patientData: Patient[] = [];
  public reachedToBottom = false;
  public isBasicUser = false;
  public storeToggleCheckboxVal = false;
  public storeThreadPostResponse!: ThreadPostResponse;
  constructor(
    public userService: UserService,
    override threadHelperService: ThreadHelperService,
    override threadService: ThreadsService,
    override composeHelperService: ComposeHelperService,
    override parseDatePipe:ParseDatePipe,
    public commonSvc: CommonService,
    override selectedThreadService: SelectedThreadHelperService,
    inboxHelperSvc : InboxHelperService,public composeService:ComposeService,
    override conversationHelperService: ConversationHelperService,
    public authService: AuthService 
    
  ) {
    super(parseDatePipe, threadHelperService, selectedThreadService, threadService,inboxHelperSvc,composeHelperService, conversationHelperService)
  }

  public getUserServiceData() {
    const userChecks$ = combineLatest([
      this.userService.userId$,
      this.userService.userType$,
      this.userService.imageUrlPath$,
      this.authService.authResponseData$
    ])
    this.subscription.push(userChecks$.subscribe(([userId, userType, imageUrl, authResponseData]) => {
      this.userId = userId;
      this.userType = userType;
      this.imageUrl = imageUrl;
      this.isBasicUser = authResponseData?.user?.flag_basic !== undefined;
    }));

    this.subscription.push(
      this.commonSvc.archiveValue$.subscribe((archive:boolean) => {
        this.archive = archive
      }));
  }

  public loadMessageStatus(messageId: string,user_id:string): void {
    const showTimeKey = this.userId+'_'+ 'show_thread_timestamp';
     this.isShowTimestampStored = localStorage.getItem(showTimeKey) === 'true';
    this.expandedMessageId =
      this.expandedMessageId === messageId ? null : messageId;                                                                                                   
    this.threadService
      .loadMessageStatus(messageId ? messageId : this.storeThreadPostResponse?.message?._id?.$oid)
      .subscribe((data: StatusResponse) => {
        const uniqueUserIds = new Set<string>();
        // Filter data.statuses based on the conditions and add unique user_ids to the Set
        const filteredStatuses = data.statuses.filter(status => {
          const userIdString = status.user_id.$oid;
          if (userIdString === user_id && !uniqueUserIds.has(userIdString) && status?.time_read?.$date) {
            uniqueUserIds.add(userIdString);
            return true;
          }
          else if(!uniqueUserIds.has(userIdString) && !status?.time_read?.$date && userIdString === user_id && status.status === 'unread') {
            uniqueUserIds.add(userIdString);
            return true;
          }
          return false;
        });
        if (filteredStatuses.length > 0 && !this.isShowTimestampStored) {
          this.statusDataByMessage.set(messageId, filteredStatuses);
        }
        else {
          const filteredStatuses = data.statuses
          .filter(status => {
            const userIdString = status.user_id.$oid;
            if (!uniqueUserIds.has(userIdString) && !status?.time_read?.$date && status.status === 'unread') {
              uniqueUserIds.add(userIdString);
              return true;
            }
            else if(!uniqueUserIds.has(userIdString) && status?.time_read?.$date) {
              uniqueUserIds.add(userIdString);
              return true;
            }
            return userIdString === user_id; // Include the matching user_id entry
          })
          .sort((a, b) => {
            const isUserIdA = a.user_id.$oid === user_id;
            const isUserIdB = b.user_id.$oid === user_id;
            // Sort based on matching user_id entries
            return isUserIdA ? -1 : isUserIdB ? 1 : 0;
          });
        this.statusDataByMessage.set(messageId, filteredStatuses);
        }
      });
  }

  public markMessageread(messageId: string): Observable<any> {
    return this.threadService.markMessageAsRead(messageId);
  }

  public checkForUserLeftStatus(): void {
    this.hasUserLeft = this.selectedThread?.thread?.recipients?.find(user => user.$oid === this.userId) ? false:true;
  }

  public isTypePager():void{
    this.isPagerTypeMessage = this.selectedThread?.thread?.origin === 'api' && this.selectedThread?.thread?.messages[0].type ==='pager' ? true:false;
  }
  //  show patient details with ID & name
  public showPatientDetails(): void {
    this.threadId= this.selectedThread.thread._id.$oid;
    this.patientId = this.selectedThread.thread?.patient?.id?.$oid;
    this.patientName = this.selectedThread.thread?.patient?.name;
    this.showPatientProfilePopup = true;
  }

  public uploadFile(event: any): void {
    this.composeHelperService.uploadFile(this.userId, event).subscribe(
      (uploadedFiles) => {
        this.uploadedFiles = uploadedFiles;
      },
      (error) => {
        console.error("Error during file upload:", error);
      }
    );
  }
  // check if the content consist of "Note: Basic Users cannot reply to messages" then show in next line
  public checkBasicUserContentAndFormat(content: string): string {
    return content.replace(
      "Note: Basic Users cannot reply to messages",
      "<br>Note: Basic Users cannot reply to messages"
    );
  }

  public getUnreadMessagesIdsData(messageId: string,hasVerticalScrollBar:boolean): void {
    const index = this.threadMessagesData.findIndex(
      (message) => message.message_id === messageId
    );
    this.aboveUnreadMessageSet.clear(); // Clearing previous data
    this.belowUnreadMessageSet.clear();
    this.threadMessagesData.forEach((x, i) => {
      if (x.status === "unread") {
        if (i < index) {
          this.aboveUnreadMessageSet.add(x);
        } else if (i > index) {
          this.belowUnreadMessageSet.add(x);
        }
      }
    });
    // Setting flags for showing buttons:
    this.displayUnreadTop = this.aboveUnreadMessageSet.size > 0 && hasVerticalScrollBar;    
    this.displayUnreadBottom = this.belowUnreadMessageSet.size > 0;
  }

  public scrollToMessage(messageId: string): void {
    const element = document.getElementById("message-" + messageId);
    element?.scrollIntoView({ behavior: "smooth" });
    this.displayUnreadBottom = false;
    this.displayUnreadTop = false; 
    this.belowUnreadMessageData = '';   
    this.reachedToBottom = true;
    let unreadMessageIds = [];
    unreadMessageIds = this.selectedThread.thread.messages
    .filter(message => message.status === 'unread')
    .map(message => message._id?.$oid);

  if (unreadMessageIds.length > 0) {
    this.markVisibleMessagesAsRead(unreadMessageIds, false);
  }
  }

  public scrollToFirstUnread(): void {
    const aboveUnreadMessage = Array.from(this.aboveUnreadMessageSet);
    let aboveUnreadMessageData;
    const unreadMessagesToMarkAsRead = this.threadMessagesData
    .filter((message) => message.status === "unread")
    .map((message) => message.message_id);
    unreadMessagesToMarkAsRead.forEach(messageId => {
       aboveUnreadMessageData = messageId;
    })
    this.scrollToMessage(aboveUnreadMessage[0]?.message_id || (aboveUnreadMessageData ?? ''));
  }

  public scrollToLastUnread(): void {
    const belowUnreadMessage = Array.from(this.belowUnreadMessageSet);
    this.scrollToMessage(belowUnreadMessage[0]?.message_id  || this.belowUnreadMessageData);
  }

  public markVisibleMessagesAsRead(ids: string[],hasVerticalScrollBar:boolean) {
     if (!ids.length) {
    // All messages have been processed, stop recursion
    return;
  }
    // Filter out IDs that have already been processed
    const unprocessedIds = Array.from(new Set(ids.filter(id => !this.processedMessageIds.has(id))));
    this.subscription.push(
      this.inboxHelperSvc.threads$.subscribe((threads) => {
        this.threadsData = threads;
      })
    );
    from(unprocessedIds)
      .pipe(
        concatMap((id) => {
          this.processedMessageIds.add(id); // Mark this ID as processed
          return this.markMessageread(id).pipe(take(1));
        })
      )
      .subscribe({
        next: (data) => {
           // Find the index of the selected thread in threadsData
          const indexInThreadsData = this.threadsData.findIndex(
            thread => thread._id.$oid === this.selectedThread.thread._id.$oid
          );
          if (indexInThreadsData !== -1) {
              unprocessedIds.forEach(id => {
                // Find the message in the selected thread
                const indexOfMessage = this.threadsData[indexInThreadsData].messages.findIndex(
                  message => message._id?.$oid === id
                );

              if (indexOfMessage !== -1) {
                // Update the message status to 'read' in both threadsData and selectedThread.thread
                this.threadsData[indexInThreadsData].messages[indexOfMessage].status = "read";
                this.selectedThread.thread.messages[indexOfMessage].status = "read";
              }
            });
            // Recalculate the unread count for the selected thread after updating message statuses
             const newUnreadCount = this.threadsData[indexInThreadsData].messages.filter(message => message.status === 'unread').length;
             this.selectedThread.thread.unread_count = newUnreadCount;
          }
          // Handle after a single message is marked as read.
        },
        error: (error) => {
          // Handle any errors that occurred during the sequence.
          console.warn(error);
        },
        complete: () => {
          this.inboxHelperSvc.threadsSource.next(this.threadsData);
          this.isApiCallInProgress = false;
          // This function will run after all messages are marked as read.
          this.processedMessageIds.clear();
          if (ids.length > 0) {
            this.getUnreadMessagesIdsData(ids[ids.length - 1],hasVerticalScrollBar);
          }
        },
      });
  }
  //  Functionality to get preview url for image
  public getPreviewUrl(attachmentId: string): string {
    return this.threadHelperService.getPreviewUrl(attachmentId);
  }
  // Get file size from the service to determine the bytes
  public getFileSize(bytes: number): string {
    return this.threadHelperService.getFileSize(bytes);
  }
  // Determine if the file is an image type (png or jpeg)
  public isImageType(fileMimeType: string): boolean {
    return ["image/png", "image/jpeg"].includes(fileMimeType);
  }
  // Determine if the file is a PDF type
  public isPDFType(fileMimeType: string): boolean {
    return fileMimeType === "application/pdf";
  }
  // Determine if the file is a DOC type
  public isDocType(fileMimeType: string): boolean {
    return [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ].includes(fileMimeType);
  }
  // Check if the file doesn't match any of the specified types
  public isOtherType(fileMimeType: string): boolean {
    return (
      !this.isImageType(fileMimeType) &&
      !this.isPDFType(fileMimeType) &&
      !this.isDocType(fileMimeType)
    );
  }
  //toogle the collapse to stop event bubbling with nested click events
  public toggleCheckbox(checkbox: HTMLInputElement, messageId: string,user_id: string): void {
    checkbox.checked = !checkbox.checked;
    this.storeToggleCheckboxVal = checkbox.checked;
    if (checkbox.checked) { 
      this.loadMessageStatus(messageId,user_id);
    }
  }
   
  public addComposeQueryParamsForCoverageId(getIdAndtype:{ coverageId: string; type: string; },messageType: string = this.messageType.composeMessage): void {
    this.coverageId = getIdAndtype.coverageId; 
    if(this.selectedUserId){
      this.composeHelperService.sendUserIdToCompose("")
    }
  if(this.patientData){
      this.composeHelperService.sendPatientDataToCompose([]);
  } 
    this.getIdAndtype = {coverageId:getIdAndtype.coverageId,type:getIdAndtype.type};
    this.composeHelperService.setCoverageId(getIdAndtype.coverageId);
    this.composeService.addComposeQueryParamsForCoverageId(getIdAndtype,messageType);
 }

 public addComposeQueryParamsForUserId(userId: string,messageType: string = this.messageType.composeMessage): void {
  this.selectedUserId = userId;  
  if(this.patientData){
    this.composeHelperService.sendPatientDataToCompose([]);
  } 
  this.coverageId ? this.composeHelperService.setCoverageId("") : ''; 
  this.composeService.addComposeQueryParamsForUserId( this.selectedUserId,messageType)
 }
}