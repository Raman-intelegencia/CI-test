import { CookieService, Message, Profiles, ThreadMessageData, ThreadProfile, Threads, UserService, Users } from '@amsconnect/shared';
import { Injectable, SecurityContext } from '@angular/core';
import { environment } from 'libs/shared/src/lib/config/environment';
import { ProfileStatus } from '../../../../../../apps/messenger/src/models/profile.model';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: "root",
})
export class ThreadHelperService {
  public API_URL: string | undefined;
  private threadMessagesData: ThreadMessageData[] = [];
  private tempMessageData: ThreadMessageData[] = [];
  private profilesData: Profiles[] = [];
  private checkIfThreadIsBroadcast = false;

  constructor(
    private cookieService: CookieService,
    private userIdSvc: UserService,
    private sanitizer: DomSanitizer,
  ) {
    this.API_URL = environment.baseUrl;
  }

  public findMatchingThreads(threads: Threads[], profiles: Profiles[], userData: Users, userId: string): ThreadProfile[] {
    return threads.map(thread => {
        // Convert user data to profile structure
        const userProfileData = this.mapUserToProfile(userData);

        return {
            thread: thread,
            profile: profiles,
            userProfile: userProfileData,
            sender_profile: this.getLastMessageSender(thread, profiles, userId)
        };
    });
}

  public getLastMessageSender(thread: Threads, profiles: Profiles[], userId:string): Profiles | undefined {
    if (!thread.messages || !profiles) {
        return undefined;
    }
    // Check if the thread is a self-message scenario
    const isSelfMessage = thread.user_id.$oid === userId && thread.recipients.every(recipient => recipient.$oid === userId);
    let lastMessageSender;
    if (isSelfMessage) {
        // Handling self-message scenario
        lastMessageSender = profiles.find(profile => profile._id.$oid === userId);
    } else {
        // Find the last message sent by someone other than the current user
        const lastMessage = thread.messages.find(message => message.user_id.$oid !== userId);
        if (lastMessage) {
            lastMessageSender = profiles.find(profile => profile._id.$oid === lastMessage.user_id.$oid);
        }
        if (!lastMessageSender) {
            const firstDifferentRecipientId = thread.recipients.find(recipient => recipient.$oid !== userId)?.$oid;
            if (firstDifferentRecipientId) {
                lastMessageSender = profiles.find(profile => profile._id.$oid === firstDifferentRecipientId);
            }
        }
    }
    return lastMessageSender;
}

  public getFirstContentAndTime(
    messages: Message[],
    updatedTime: number
  ):
    | {
        content: string;
        time_updated: number;
        user_id: string;
        attachments?: any[];
      }
    | undefined {
    let obj = {
      content: messages[0].content,
      time_updated: updatedTime,
      user_id: messages[0].user_id.$oid,
      attachments: messages[0].attachments,
    };
    return obj;
  }

  public getUserNameById(userId: string, profiles: Profiles[]): string | undefined {
    const user = profiles.find((profile) => profile._id.$oid === userId);
    return user ? user.first_name : undefined;
  }

  public getUserId(): string {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    // split the 'a' token to get user ID
    const extractedUserId = aCookieValue?.split("|")[1];
    let userId = extractedUserId ? extractedUserId : "";
    return userId;
  }

  public getPreviewUrl(attachmentId: string): string {
    return `${
      this.API_URL
    }/message/attachment/${attachmentId}?X-cureatr-user=${this.getUserId()}`;
  }

  public getDownloadUrl(attachmentId: string): string {
    return `${
      this.API_URL
    }/message/attachment_download/${attachmentId}?X-cureatr-user=${this.getUserId()}`;
  }

  public downloadAttachment(attachmentId: string, fileName?: string): void {
    const downloadUrl = this.getDownloadUrl(attachmentId);
    // Sanitize the download URL to ensure it's safe
    const sanitizedUrl = this.sanitizer.sanitize(SecurityContext.URL, downloadUrl) || '';
    if(sanitizedUrl){
      const a = document.createElement("a");
      a.href = sanitizedUrl
      if (fileName) {
        a.download = fileName; // Set filename if provided
      }
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  public getFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const sizes: string[] = ["Bytes","KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB",];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  public getInitials(firstName: string, lastName: string) {
    if (!firstName && !lastName) return "";
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
    return firstInitial + lastInitial;
  }

  public findProfileForStatus(senderUserId: string, selectedChatThread: ThreadProfile, userId: string): ProfileStatus {
    let result: ProfileStatus = {
      firstAndLastName: "",
      status:''
    };
    // Search through profiles for a matching _id.$oid
    const matchingProfile = selectedChatThread.profile.find(
      (profile) => profile._id.$oid === senderUserId
    );

    if (matchingProfile) {
      result.firstAndLastName = matchingProfile?.first_name + " " + matchingProfile?.last_name;
      result.status = matchingProfile?.status?.s;
    } else if (selectedChatThread.userProfile?._id.$oid == userId) {
      result.firstAndLastName =
        selectedChatThread.userProfile.first_name +
        " " +
        selectedChatThread.userProfile.last_name;
        result.status = selectedChatThread.userProfile?.status?.s;
    }
    return result;
  }

  public extractMessagesFromThread(selectedChatThread: ThreadProfile, currentUserID: string): void {
    // Reset arrays
    this.profilesData = [];
    // Early return if data is not available
    if (
      !selectedChatThread ||
      !selectedChatThread.thread ||
      !selectedChatThread.thread.messages ||
      !selectedChatThread.profile
    ) {
      return;
    }
    // Destructure for ease of use
    const { messages } = selectedChatThread.thread;
    const { profile: profiles } = selectedChatThread;
    // Set profilesData
    this.profilesData = selectedChatThread.profile;
    this.checkIfThreadIsBroadcast =
      selectedChatThread.thread.type == "broadcast" &&
      selectedChatThread.thread.user_id.$oid ==
        selectedChatThread.userProfile?._id?.$oid;
    // Process each message and build up threadMessagesData
    const newMessages = messages
      .map((message) => {
        let relatedProfile = profiles.find(
          (profile) => profile._id.$oid === message.user_id.$oid
        );
        // If no related profile is found and it's the current user, set accordingly
        if (!relatedProfile && message.user_id.$oid === currentUserID) {
          // Use user profile; consider passing it as a parameter or obtaining it in a more dynamic way
          relatedProfile = selectedChatThread.userProfile;
        }
        // Check if attachments exist and is an array
        const hasAttachments =
          Array.isArray(message.attachments) && message.attachments.length > 0;

        return relatedProfile
          ? {
              first_name: relatedProfile.first_name,
              last_name: relatedProfile.last_name,
              image_id: relatedProfile.image_id,
              user_id: relatedProfile._id.$oid,
              type: message.type,
              message_id: message._id.$oid,
              content: message.content,
              iid: message.iid,
              status: message.status,
              thread_id: message.thread_id.$oid,
              time_created: message.time_created.$date,
              user_status: relatedProfile.status.s,
              attachments: hasAttachments ? message.attachments : [],
              seq: message.seq,
              threadType: selectedChatThread.thread.type,
              ...(message.hasOwnProperty("urgent")
                ? { urgent: message.urgent }
                : {}),
            }
          : null;
      })
      .filter(Boolean) as ThreadMessageData[];

    // Check if the thread ID has changed and clear temporary messages if it has
    if (this.tempMessageData.length > 0 && this.tempMessageData[0].thread_id !== selectedChatThread.thread._id.$oid) {
      this.tempMessageData = []; // Clear temp messages for a different thread
    }
    // Merge new messages with existing temporary messages
    this.threadMessagesData = this.mergeMessages(newMessages, this.tempMessageData);
    // Clear replaced temporary messages
    this.clearReplacedTemporaryMessages(newMessages);
  }

  private mergeMessages(newMessages: ThreadMessageData[], tempMessages: ThreadMessageData[]): ThreadMessageData[] {
    // Filter out temporary messages that have a corresponding new message with the same seq ID
    const filteredTempMessages = tempMessages.filter(tempMsg => 
        !newMessages.some(newMsg => newMsg.seq === tempMsg.seq && newMsg.message_id !== "") //realtime message data will have message_id where as temp message do not.
    );
    // Prepend the remaining temporary messages to the start of the new messages array
    return [...filteredTempMessages, ...newMessages];
}
  
  private clearReplacedTemporaryMessages(newMessages: ThreadMessageData[]): void {
    this.tempMessageData = this.tempMessageData.filter(tempMsg => 
      !newMessages.some(newMsg => newMsg.seq === tempMsg.seq)
    );

  }

  public addTemporaryMessage(tempMessage: ThreadMessageData): void {
    const doesExist = this.tempMessageData.some(msg => 
      msg.seq === tempMessage.seq && msg.thread_id === tempMessage.thread_id);
    
    if (!doesExist) {
      // Clear temporary messages from other threads
      this.tempMessageData = this.tempMessageData.filter(msg => 
        msg.thread_id === tempMessage.thread_id);
  
      // Add the new temporary message
      this.tempMessageData.push(tempMessage);
    }
  }


  public isThreadBroadcast(): boolean {
    return this.checkIfThreadIsBroadcast;
  }

  public getThreadMessagesData(): ThreadMessageData[] {
    return this.threadMessagesData;
  }

  public getProfilesData(): Profiles[] {
    return this.profilesData;
  }

  public mapUserToProfile(user: Users): Profiles {
    return {
      _id: user?._id,
      cell_phone: user?.cell_phone || null,
      cellphone_verify: user?.cellphone_verify,
      date_last_login: user?.date_last_login,
      first_name: user?.first_name,
      image_id: user?.image_id,
      last_name: user?.last_name,
      profile: user?.profile,
      status: {
        is_signed_out: user?.status?.is_signed_out,
        s: user?.status?.s,
        r: user?.status?.r || [],
      },
      type: user?.type,
      flag_active: user?.flag_active,
      id: user?._id?.$oid, // Assuming this is the desired value for `id`
      data: {
        _id: user?._id,
        iid: user?.profile.iid,
        user_ids: [{ $oid: user?._id?.$oid }],
        cell_phone: user?.cell_phone,
        cellphone_verify: user?.cellphone_verify,
        date_last_login: user?.date_last_login,
        email_comm: true,
        first_name: user?.first_name,
        flag_active: user?.flag_active || false,
        image_id: user?.image_id,
        last_name: user?.last_name,
        profile: user?.profile,
        sms_comm: true,
        status: user?.status,
        type: user?.type,
      },
    };
  }

  public truncateContent(content: string | undefined): string {
    return content ? content.length > 35 ? content.substr(0, 35) + "..." : content : "";
  }

  private getJStorage(): any {
    const jStorageRaw = localStorage.getItem('jStorage');
    return jStorageRaw ? JSON.parse(jStorageRaw) : {};
  }

  private setJStorage(data: any): void {
    localStorage.setItem('jStorage', JSON.stringify(data));
  }

  public setArchiveCheckboxState(userId: string, state: boolean): void {
    const jStorageData = this.getJStorage();
    jStorageData[`${userId}:show_archived`] = state;
    this.setJStorage(jStorageData);
  }
  
  public getArchiveCheckboxState(): boolean {
    const userId = this.userIdSvc.getUserId();
    const jStorageData = this.getJStorage();
    const key = `${userId}:show_archived`;
    return jStorageData[key] ?? false;  // Returns false if the key doesn't exist
  }

  public loadInboxSortValue(userId: string): number {
    const storedData = localStorage.getItem('jStorage');
    if (storedData) {
      const jStorageObject = JSON.parse(storedData);
      const inboxSortValue = jStorageObject?.[`${userId}_account_information`]?.user?.properties?.inbox_sort;
      return parseInt(inboxSortValue, 10) || 0;
    }
    return 0;
  }
// check for temporary messages in threads data and replace them with realtime message data.
  public replaceTemporaryMessagesWithRealData(threads:Threads[]): Threads[] {
    threads.forEach((thread) => {
        thread.messages.forEach((message, index) => {
            if (message._id.$oid === "") {
                const realMessageIndex = thread.messages.findIndex(m => 
                    m.seq === message.seq && m._id.$oid !== ""); //temp messages will not have message id

                if (realMessageIndex !== -1) {
                    thread.messages[index] = thread.messages[realMessageIndex];
                    if (index !== realMessageIndex) {
                        thread.messages.splice(realMessageIndex, 1);
                    }
                }
            }
        });
    });
    return threads; // Explicitly return the updated threads
  }

  public addTempMessagesInThreads(threads:Threads[], selectedChatThread:ThreadProfile, userId:string, message:string, urgent:boolean):Threads[]{
    const index = threads.findIndex(x => x._id.$oid === selectedChatThread.thread._id.$oid);
    if(index != -1){
        threads[index].messages.unshift({
            _id: { $oid: "" }, // You need to generate or map this appropriately
            content: message ?? '',
            iid: "",
            seq: threads[index].messages[0].seq + 1, // Provide a default or ensure this is set
            status: "unread",
            statuses: [], // Populate this based on your application logic
            thread_id: { $oid: selectedChatThread.thread._id.$oid }, // Transform or generate this
            time_created: { $date: new Date().getTime() }, // Convert to expected format
            type: "",
            user_id: { $oid: userId }, // Transform or generate this
            urgent: urgent ?? false, 
        });
    }
    return threads;
  }
}