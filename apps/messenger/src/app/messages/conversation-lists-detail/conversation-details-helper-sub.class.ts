import { StatusItem, ThreadMessageData, ThreadProfile, ThreadHelperService } from "@amsconnect/shared";

export class ConversationDetailsHelperSubClass{

public threadMessagesData: ThreadMessageData[] = [];
public shouldScrollToBottom = false;
public newThreadPostApiCall = false

constructor(
    public threadHelperService: ThreadHelperService
){}


public createNewTempMessage(message:string, selectedChatThread:ThreadProfile, urgentMessage:boolean):void{
    if(message){
        const tempMessage = {
            first_name: selectedChatThread.userProfile?.first_name ?? "",
            last_name: selectedChatThread.userProfile?.last_name ?? "",
            image_id: selectedChatThread.userProfile?.image_id ?? "",
            user_id: selectedChatThread.userProfile?._id?.$oid ?? "",
            type: "user",
            message_id: "",
            content: message,
            iid: "",
            status: "read",
            urgent: urgentMessage,
            thread_id: selectedChatThread.thread._id.$oid,
            time_created: new Date().getTime(), // Make sure this is correctly generated
            user_status: selectedChatThread.userProfile?.status?.s ?? "",
            attachments: [],
            isTemporary: true,
            seq: (this.threadMessagesData[this.threadMessagesData.length - 1]?.seq ?? 0) + 1,
            isFirstMessageOfDay: false,
            isLastMessageOfDay : true
        };
        // Check for duplicates in threadMessagesData before pushing
        const doesExistInThreadMessages = this.threadMessagesData.some(msg => msg.seq === tempMessage.seq);
    
        if (!doesExistInThreadMessages) {
            this.threadMessagesData.push(tempMessage);
            this.shouldScrollToBottom = true;
        }
        // Add the temporary message to tempMessageData in ThreadHelperService
        this.threadHelperService.addTemporaryMessage(tempMessage);
        }
}

public getHeight(): number {
    const inputElement = document.getElementById('message') as HTMLTextAreaElement | null;
    if (inputElement) {
      return inputElement.scrollHeight;
    }
    return 40;
  }
  public getStyle(): { 'height.px': number } {
    const inputElement = document.getElementById('message') as HTMLTextAreaElement | null;
    return { 'height.px': this.getHeight() };
  }

  public trackByMessageId(index: number, message: ThreadMessageData): string {
    return message?.message_id;
  }

  public trackByStatusId(index: number, status: StatusItem): string {    
    return status._id?.$oid || '';
  }

}