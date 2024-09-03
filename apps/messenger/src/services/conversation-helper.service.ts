import { ThreadProfile,ThreadLoadResponse } from '@amsconnect/shared';
import { Injectable } from '@angular/core';
import { ThreadsService } from './threads.service';

@Injectable({
  providedIn: "root",
})
export class ConversationHelperService {
  public isLoadMore = false;

  constructor(
  public threadService: ThreadsService
  ) {
  }

  public getOlderThreadMessages(selectedChatThread: ThreadProfile): Promise<{ thread: ThreadProfile, lastSeq: number }>{
    return new Promise((resolve, reject) => {
      const threadId = selectedChatThread?.thread?._id?.$oid;
      const selectedThreadMsgs = selectedChatThread?.thread?.messages.map(msg=> msg);
      const lastSeq = selectedThreadMsgs.length > 0 ? selectedThreadMsgs[selectedThreadMsgs.length - 1].seq : undefined;
      if(lastSeq !== 1){
        this.threadService.getThreadMessages(threadId, lastSeq).subscribe(
            (data:ThreadLoadResponse) => {
                const olderMessages = data?.thread[0]?.messages;
                const currentMessages = selectedChatThread?.thread?.messages;
                // Merge currentMessages and olderMessages
                const mergedMessages = [...(currentMessages || []), ...(olderMessages || [])];
                // Update selectedChatThread with merged messages
                selectedChatThread.thread.messages = mergedMessages;
                resolve({ thread: selectedChatThread, lastSeq:lastSeq ?? 0 });
              },
            error => {
                console.error("Error fetching thread messages:", error);
                reject(error);
            }
        );
    }
    else {
      resolve({ thread: selectedChatThread, lastSeq: lastSeq });
  }
});
}
}