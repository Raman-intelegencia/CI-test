import { ExtractedThreadDetail, MessageInfo, PatientInfo, Thread, UserProfileInfo } from "@amsconnect/shared";

 
export class ViewPatientClass {
public userId = ""; 
public activeStatus = "patient-info";
public imageUrlPath = ""; 
public showProfileModal =false;
public isShowArchivedChats = false;
public selectedUserId ="";
public coverageId ="";
public patientInfo: PatientInfo = {
  institution: "",
  id_number: "",
  name: "",
  dob: "",
  sex: "",
  address: "",
    };
    public messageType = {
      externalMessage: "ExternalMessage",
      composeMessage: "InternalMessage",
  };
 public extractThreadDetails(
    threads: Thread[],
    profiles: UserProfileInfo[],
    loggedInUserId: string
  ): ExtractedThreadDetail[] {
    // Create a mapping of user IDs to profiles
    const profileMap = Object.fromEntries(profiles.map((p) => [p._id, p]));
    return threads.map((thread: Thread) => {
      const recipients = thread.recipients.filter(
        (id) => id !== loggedInUserId
      );
      // Use the profileMap to quickly access the matched profiles
      const matchedProfiles = recipients
        .map((id) => profileMap[id])
        .filter(Boolean);

      const isSelfMessage = thread.user_id === this.userId && thread.recipients.every(recipient => recipient === this.userId);
      let lastMessageSender;
      if (isSelfMessage) {
        // Handling self-message scenario
        lastMessageSender = profiles.find(profile => profile._id === this.userId);
    } else {
      const lastMessage = thread.messages.find(message => message.user_id !== this.userId);
      if (lastMessage) {
          lastMessageSender = profiles.find(profile => profile._id === lastMessage.user_id);
      }
      if (!lastMessageSender) {
          const firstDifferentRecipientId = thread.recipients.find(recipient => recipient !== this.userId);
          if (firstDifferentRecipientId) {
              lastMessageSender = profiles.find(profile => profile._id === firstDifferentRecipientId);
          }
      }
    }  
      const latestMessage = thread.messages.reduce(
        (latest: MessageInfo, message: MessageInfo) =>
          new Date(latest.time_created) > new Date(message.time_created)
            ? latest
            : message,
        thread.messages[0]
      );
      // Use the profileMap again to find the profile for the latest message
      const latestMessageProfile = profileMap[latestMessage.user_id];
 
      return {
        thread_id: thread._id,
        latest_message: latestMessage,
        matched_profiles: matchedProfiles,
        latest_message_profile: latestMessageProfile,
        recipients :recipients,
        receivers :thread.receivers,
        patient_name: thread.patient_name,
        sender_profile :lastMessageSender,
        subject: thread.subject,
        time_updated: thread.time_updated,
        visibility:thread.visibility
      };
    });
  }

  public getProfileNames(matched_profiles: UserProfileInfo[]): string {
    return (
      matched_profiles
        ?.map((profile) => `${profile.first_name} ${profile.last_name}`)
        .join(", ") || ""
    );
  }

  public transformPatientName(patientName: string): string {
    return patientName
      .split(" ")
      .reverse()
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(", ");
  }

  public changeTab(tabname: string): void {
    this.activeStatus = tabname;
  }

  public getImageUrl(image_id: string): string { 
    return this.imageUrlPath + image_id + "_profile.png"; 
}


public openUserProfile( userId: string): void {
  this.showProfileModal = true; 
  this.userId = userId;
}

public showUserProfile(showProfileModal: boolean): void {
  this.showProfileModal = showProfileModal;
}

public getReceiversValues(receivers: Array<{ name: string }> | undefined): string {
  if (!receivers || receivers.length === 0) return ''; 
  const maxLength = 35; 
  let maxDisplayCount = Math.min(receivers.length, 3);
  let displayString = '';
  while (maxDisplayCount > 0) {
    // Get the names to display and construct the string
    const displayNames = receivers.slice(0, maxDisplayCount).map(r => r.name).join(', ');
    const additionalCount = receivers.length - maxDisplayCount;
    // Construct the final string with or without the "+ more"
    displayString = additionalCount > 0 ? `${displayNames} + ${additionalCount} more...` : displayNames;
    // Check if the string length is within the limit
    if (displayString.length <= maxLength) {
      break;
    }
    // Reduce the number of displayed names for the next iteration
    maxDisplayCount -= 1;
  }
  return displayString;
}
  
}
