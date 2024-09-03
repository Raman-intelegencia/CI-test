import { Profiles, SelectedThreadHelperService, ThreadProfile, Threads, UploadFileData,ThreadHelperService } from "@amsconnect/shared";
import { ParseDatePipe } from "../../../pipes/parse-date.pipe";
import { ThreadsService } from "../../../services/threads.service";
import { InboxHelperService } from "../../../services/inbox-helper.service";
import { ComposeHelperService } from "../../../services/compose-helper.service"; 
import { ConversationHelperService } from "../../../services/conversation-helper.service";
import { ElementRef } from "@angular/core";
import { ConversationDetailsHelperSubClass } from "./conversation-details-helper-sub.class";
import { DomSanitizer } from "@angular/platform-browser";
export class ConversationDetailsHelperClass extends ConversationDetailsHelperSubClass{
  public getExternalMsgThreadEndsVal = false;
  public selectedThread!: ThreadProfile;
  public openUserProfileModal = false;
  public selectedChatIds!: {
    selectedProfileUserId: string;
    selectedProfileThreadId: string;
  };
  public messageType = {
    externalMessage: "ExternalMessage",
    composeMessage: "InternalMessage",
};
  public composePopupValue = this.messageType.composeMessage;
  public imageUrl = "";
  public profilesData: Profiles[] = [];
  public checkIfThreadIsBroadcast = false;
  public userName = "";
  public isLoadMore = false;
  public threadsData: Threads[] = [];
  public coverageId = "";
  public fileName = "";
  public showAttachmentPopUp = false;
  public selectedAttachmentId = "";
  public showPatientProfilePopup = false;
  public uploadedFiles: UploadFileData[] = [];
  public archive = false;
  public isPagerTypeMessage = false;
  public isApiCallInProgress = false;
  public isShowTimestampStored = false;
  public selectedUserId ="";
  public patientName!: string;
  public patientId!: string;
  public threadId!: string;
  public displayUnreadTop = false;
  public displayUnreadBottom = false;
  public belowUnreadMessageData = '';
  public userId = "";
  public messagesProcessed = false;
  constructor(
    public parseDatePipe: ParseDatePipe,
    threadHelperService: ThreadHelperService,
    public selectedThreadService: SelectedThreadHelperService,
    public threadService: ThreadsService,public inboxHelperSvc:InboxHelperService,public composeHelperService: ComposeHelperService, 
    public conversationHelperService: ConversationHelperService
  ) { 
    super(threadHelperService)
  }

  public isEnded(): boolean {
    this.getExternalMsgThreadEndsVal =
      this.selectedThread?.thread?.type === "external" && (this.isExpired() || (this.getRecipientsWithoutSender().length < 1));
    return this.selectedThread?.thread?.type === "external" && (this.isExpired() || (this.getRecipientsWithoutSender().length < 1));
  }

  public getRecipientsWithoutSender():{ $oid: string; }[] {
    const userId = this.selectedThread?.thread?.user_id?.$oid || this.selectedThread?.userProfile;
    return this.getRecipientsWithoutUser(userId);
}

public getRecipientsWithoutUser(user: string | Profiles | undefined) : { $oid: string; }[] {
  return this.selectedThread?.thread.recipients.filter(id=>  id.$oid !== user);
}

  public getExpiresInDuration() {
    const expiration = this.selectedThread?.thread?.expiration;
    if (expiration) {
      let parsedDate: Date | undefined;
      if (typeof expiration === "string") {
        const parsedDateOrNull = this.parseDatePipe?.transform(expiration);
        parsedDate = parsedDateOrNull !== null ? parsedDateOrNull : undefined;
      } else if (expiration?.$date) {
        parsedDate = new Date(expiration.$date);
      }
      if (parsedDate) {
        return this.formatDurationFromNow(parsedDate);
      }
    }
    return undefined;
  }

  public formatDurationFromNow(date: Date): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const secondsAgo = Math.floor(diff / 1000);
    if (secondsAgo < 60) {
      return "a few seconds";
    }
    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) {
      return `${minutesAgo} ${minutesAgo === 1 ? "minute" : "minutes"}`;
    }
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) {
      return `${hoursAgo} ${hoursAgo === 1 ? "hour" : "hours"}`;
    }
    const daysAgo = Math.floor(hoursAgo / 24);
    return `${daysAgo} ${daysAgo === 1 ? "day" : "days"}`;
  }

  public isExpired(): boolean {
    const expiration = this.selectedThread.thread?.expiration;
    const currentDate = new Date();
    const expirationDate =
      typeof expiration === "string"
        ? this.parseDatePipe?.transform(expiration)
        : expiration?.$date;
    return !!expirationDate && currentDate > new Date(expirationDate);
  }

  public getInitials(firstName: string, lastName: string):string {
    return this.threadHelperService.getInitials(firstName, lastName);
  }

  public openUserProfile(message: {
    user_id: string;
    thread_id: string;
  }): void {
    const openProfileModal = true;
    this.openUserProfileModal = openProfileModal;
    this.selectedChatIds = {
      selectedProfileUserId: message.user_id,
      selectedProfileThreadId: message.thread_id,
    };
  }

  public getImageUrl(imageId:string):string{
    return this.imageUrl + imageId + "_profile.png"
  }

  public getMsgUserData(messageUserId: string, selectedChatThread:ThreadProfile): {isExternal: boolean, imageUrl: string, initials?: string }{
    const senderProfile = selectedChatThread.profile.find(profile => profile._id.$oid === messageUserId);
   
    if (!senderProfile) {
      return { isExternal: false, imageUrl: "" };
    }
  
    const userImageUrl = senderProfile.image_id ? this.getImageUrl(senderProfile.image_id) : "";
  
    return {
      isExternal: senderProfile.type === "external",
      imageUrl: userImageUrl,
      initials: senderProfile.type !== "external" 
        ? `${senderProfile.first_name.charAt(0).toUpperCase()}${senderProfile.last_name.charAt(0).toUpperCase()}`
        : undefined
    };
  }

  public transformThreadMessages(selectedChatThread: ThreadProfile, currentUserID: string): void {
    if (!selectedChatThread) {
      return;
    }
    // process the threads as needed 
    const processThread = (chatThread: ThreadProfile) => {
      this.threadHelperService.extractMessagesFromThread(chatThread, currentUserID);
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
      // If the thread is not older, process it directly
      processThread(selectedChatThread);
      this.messagesProcessed = true;
  }

  public markFirstMessagesOfDay():void {
    let lastDate = null;
    // Mark the first message of each day
    for (const message of this.threadMessagesData) {
      const currentDate = new Date(message.time_created).toDateString();
      message.isFirstMessageOfDay = lastDate !== currentDate;
      lastDate = currentDate;
    }

    // Reset lastDate and iterate in reverse to mark the last message of each day
    lastDate = null;
    for (let i = this.threadMessagesData.length - 1; i >= 0; i--) {
      const message = this.threadMessagesData[i];
      const currentDate = new Date(message.time_created).toDateString();
      message.isLastMessageOfDay = lastDate !== currentDate;
      lastDate = currentDate;
    }
  }

  //  On close of attachment pop-up change values
  public closeAttachmentPopUp(): void {
    this.showAttachmentPopUp = false;
    this.fileName = "";
    this.selectedAttachmentId = "";
  }
  //  download attachment functionality from service with download URL
  public downloadAttachment(): void {
    this.threadHelperService.downloadAttachment(
      this.selectedAttachmentId,
      this.fileName
    );
    this.closeAttachmentPopUp();
  }

  //  Handle file click to show attachment pop-up
  public fileClicked(
    attachmentId: string,
    fileName: string,
    event: Event
  ): void {
    this.showAttachmentPopUp = true;
    this.fileName = fileName;
    this.selectedAttachmentId = attachmentId;
  }

    //  On close of patient pop-up change flag
    public closePatientPopUp(): void {
      this.showPatientProfilePopup = false;
    }

    public removeFile(index: number): void {
      this.uploadedFiles.splice(index, 1);
    }

    public checkAndLoadOlderMessages(selectedChatThread: ThreadProfile): void {
      const messages = selectedChatThread.thread.messages;
      if (messages && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        const lastSeq = lastMessage.seq;
    
        // Check if the last message's seq is greater than 1 and there are no older messages
        if (lastSeq > 1 && messages.length === 1) {
          this.conversationHelperService.getOlderThreadMessages(selectedChatThread)
            .then(({ thread, lastSeq }) => {
              // Handle the loaded messages as required
              this.threadHelperService.extractMessagesFromThread(thread, this.userId);
              this.selectedThread = thread;
              this.threadMessagesData = this.threadHelperService.getThreadMessagesData().reverse();
              this.selectedThread = thread;
              this.shouldScrollToBottom = true;
            })
            .catch(error => console.error("Error loading older messages:", error));
        }
      }
    }

    public adjustScrollPosition(scrollContainer: ElementRef, oldScrollHeight: number): void {
      // Only adjust scroll position if we are not intending to scroll to bottom
      if (!this.shouldScrollToBottom) {
          setTimeout(() => {
              const newScrollHeight = scrollContainer.nativeElement.scrollHeight;
              const heightDifference = newScrollHeight - oldScrollHeight;
              scrollContainer.nativeElement.scrollTop += heightDifference;
          }, 0);
      }
  }
  
  public showUserProfile(showProfileModal: boolean): void {
    this.openUserProfileModal = showProfileModal;      
  }

  public getVisibleUnreadMessageIds(scrollContainerRef:ElementRef): string[] {
    const visibleIds:string[] = [];
    const scrollContainer = scrollContainerRef.nativeElement;
    const containerTop = scrollContainer.scrollTop;
    const containerBottom = containerTop + scrollContainer.clientHeight;
  
    this.threadMessagesData.forEach(message => {
      if (message.status === "unread") {
        const messageElement = document.getElementById(`message-${message.message_id}`);
        if (messageElement) {
          const messageTop = messageElement.offsetTop;
          const messageBottom = messageTop + messageElement.clientHeight;
          // Check if the message is within the visible area of the container
          if (messageTop < containerBottom && messageBottom > containerTop) {
            visibleIds.push(message.message_id);
          }
        }
      }
    });
    return visibleIds;
  }   
}