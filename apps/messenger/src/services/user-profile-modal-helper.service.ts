import { Injectable } from '@angular/core';
import { profileData, thread, threadProfileData, USER_PROFILE_THREAD } from '../models/profile.model';

@Injectable({
  providedIn: "root",
})
export class UserProfileModalHelperService {

  public findMatchingUserProfileThreads(threads: thread[], profiles: threadProfileData[],userId:string):USER_PROFILE_THREAD[]{
    return threads.map(thread => {
        return {
            threads: thread,
            profiles: profiles,
            sender_profile: this.getLastMessageUserProfileSender(thread, profiles, userId)
        };
    });
  }
  
  public getLastMessageUserProfileSender(thread: thread, profiles: threadProfileData[], userId:string): threadProfileData | undefined {
    if (!thread.messages || !profiles) {
        return undefined;
    }
    // Check if the thread is a self-message scenario
    const isSelfMessage = thread.user_id === userId && thread.recipients.every(recipient => recipient === userId);
    let lastMessageSender;
    if (isSelfMessage) {
        // Handling self-message scenario
        lastMessageSender = profiles.find(profile => profile?._id === userId);
    } else {
        // Find the last message sent by someone other than the current user
        const lastMessage = thread.messages.find(message => message.user_id !== userId);
        if (lastMessage) {
            lastMessageSender = profiles.find(profile => profile?._id === lastMessage.user_id);
        }
        if (!lastMessageSender) {
            const firstDifferentRecipientId = thread.recipients.find(recipient => recipient !== userId);
            if (firstDifferentRecipientId) {
                lastMessageSender = profiles.find(profile => profile?._id === firstDifferentRecipientId);
            }
        }
    }
    return lastMessageSender;
  }
}