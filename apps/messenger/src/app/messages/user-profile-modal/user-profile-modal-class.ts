import { Reference, SettingsService, UserService } from "@amsconnect/shared";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ProfileStatusHelperService } from "../../../services/profile-status-helper.service";
import { profileResponse, Shift, UserProfile, Thread, thread, profileData, Message, threadProfileData, USER_PROFILE_THREAD
} from "../../../models/profile.model";
@Injectable()
export class UserProfileModalClass {
  public showEnterServiceSchedule = false;
  public showNonActiveUserModal = "";
  public showNonActiveUser = false;
  public userProfileResponse!: profileResponse;
  public configProfileImgUrl: string | undefined;
  public userImageId !:string;
  public userFirstName !:string;
  public userLastName !:string;
  public coverageId = "";
  public showServiceTeamList = false;
  public userIndex= "";
  public storeImageUrl = "";
  public showUploadPhoto = false;
  public profileImageSubscription: Subscription = new Subscription;
  public subscription: Subscription = new Subscription();
  public displayProfileData!: UserProfile;
  public shiftsData: Shift[] = [];
  public scheduledServiceTeam: Shift[] = [];
  public currentServiceTeam: Shift[] = [];
  public getUserThreadValue!: Thread;
  public initialMessageCount = 3;
  public showDeleteModal = false;
  public showErrorMessage = "";
  public journalId = 0;
  public archiveChats = false;
  public maxLength = 27;
  public userProfileType = true;
  public selectedUserId = "";
  public getThreadMessagesResponse: thread[] = [];
  public selectedServiceRoleList: Shift[] = [];
  public closeDeleteScheduledPopup = false;
  public selectedScheduledServiceRoleList: Shift[] = [];
  public showSelectedScheduledServiceTeamsList = false;
  public image_id = '';
  public showImageLoader = false;

  constructor(public settingsService: SettingsService,public router: Router,public userService:UserService,public profileHelperService:ProfileStatusHelperService){}

  public getRecieversName(threadData: {
    receivers: { name: string }[];
  }): string {
    const receiverNames = threadData?.receivers?.map(
      (receiver: { name: string }) => receiver.name
    );
    return `${receiverNames?.length === 1
      ? receiverNames[0]
      : receiverNames?.slice(0,3).toString()} ${receiverNames && receiverNames?.length > 3 ? "+ 1 more" : ""}`;
  }
 
  public fetchImageUrl(image_id: string): string {
    return this.configProfileImgUrl + image_id + "_profile.png";
  }

  public getInitials(
    firstName: string | null | undefined,
    lastName: string | null | undefined
  ): string {
    return `${firstName ? firstName.charAt(0).toUpperCase() : ""}${
      lastName ? lastName.charAt(0).toUpperCase() : ""
    }`;
  }

  public enterServiceSchedule():void {
    this.showServiceTeamList = true;
  }

  public displayNonActiveModalHeading(userProfileResponseData: profileResponse): void {
    this.showNonActiveUserModal =
    !userProfileResponseData?.references?.[0]?.data?.flag_active ||
    !this.userProfileResponse?.profile?.flag_active
      ? `${userProfileResponseData?.references?.[0]?.data?.first_name ||
          userProfileResponseData?.profile?.first_name || ''} ${
          userProfileResponseData?.references?.[0]?.data?.last_name ||
          userProfileResponseData?.profile?.last_name || ''} is not active`
      : '';    
  }

  public getReceiversValues(receivers: Array<{ name: string }> | undefined): string {
    if (!receivers || receivers.length === 0) return '';
    // Maximum allowed length for the string
    const maxLength = 35;
    // Define how many names to initially attempt to show
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

  public getFirstContentAndTime(
    messages: Message[],
    updatedTime:  string
  ):
    | {
        content: string;
        time_updated:  string;
        user_id: string;
        attachments?: any[];
      }
    | undefined {
    let obj = {
      content: messages[0].content,
      time_updated: updatedTime,
      user_id: messages[0].user_id, 
    };  
    return obj;
  }

  public getFirstUserContentAndTime(
    messages: Message[],
    threadUpdatedTime: string,
):
    | {
          content: string;
          time_updated: string;
          user_id: string;
          attachments?: any[];
      }
    | undefined {
    return this.getFirstContentAndTime(messages, threadUpdatedTime);
}

public getUserNameById(userId: string, profiles: threadProfileData[]): string | undefined { 
  const user = profiles?.find((profile) => profile?._id === userId); 
  return user ? user.first_name : undefined;
}

public getImageIdById(userId: string, profiles: threadProfileData[]): string | undefined {
  const user = profiles?.find((profile) => profile._id === userId);
  return user ? user.image_id : undefined;
}

public getLastNameById(userId: string, profiles: threadProfileData[]): string | undefined {
  const user = profiles?.find((profile) => profile._id === userId);
  return user ? user?.last_name : undefined;
} 

public removePhoto(): void {
  this.settingsService
    .setUsersImage(null, true)
    .subscribe((imageResponse: any) => {
      this.storeImageUrl = imageResponse.image_id;
      this.userService.setImageId(imageResponse.image_id);
      this.userProfileResponse.profile.image_id = '';
      this.showUploadPhoto = true;
      this.userService.setImageId(imageResponse.image_id);
    });
}

public redirectTo(route:string):void{
  this.userIndex ? this.router.navigateByUrl(`u/${this.userIndex}/${route}`):'';
}
public getImageUrl(): void {
  this.profileImageSubscription = this.userService.imageUrlPath$.subscribe((imageUrlPath) => {
    this.configProfileImgUrl = imageUrlPath;
  });
  this.subscription.add(this.profileImageSubscription);
}

public isUrgentAndUnread(messages: Message[] | undefined): boolean {
  if (!messages) {
      return false; // Return false if messages are undefined or null
  }
  return messages.some((message) => message.urgent === true && message.status === "unread");
}


public uploadProfilePicture($event: Event): void {
  this.showImageLoader = true;
  this.profileHelperService
    .uploadFile($event, this.configProfileImgUrl)
    .subscribe(
      {
      next: (storeImageUrl: string) => {
        this.storeImageUrl = storeImageUrl;
        this.image_id = this.profileHelperService.image_id;
        this.showUploadPhoto = false;
        this.userService.setImageId(this.profileHelperService.image_id);
        this.showImageLoader=false;
      },
      error: (error) => {
        console.error(error);
      },
    });
}

public createProfileReference(userProfileResponseData: profileResponse): Reference {
  return {
    type: 'cureatr',
          id: userProfileResponseData?.profile?._id?.$oid,
          data: {
            _id: userProfileResponseData?.profile?._id,
            cell_phone: userProfileResponseData?.profile?.cell_phone,
            cellphone_verify: userProfileResponseData?.profile?.cellphone_verify,
            date_last_login: { $date: userProfileResponseData?.profile?.date_last_login?.$date },
            email_comm: userProfileResponseData?.profile?.email_comm,
            first_name: userProfileResponseData?.profile?.first_name,
            flag_active: userProfileResponseData?.profile?.flag_active ?? false,
            image_id: userProfileResponseData?.profile?.image_id,
            last_name: userProfileResponseData?.profile?.last_name,
            profile: userProfileResponseData?.profile?.profile,
            sms_comm: userProfileResponseData?.profile?.sms_comm,
            status: {
              s: userProfileResponseData.profile?.status?.s ?? '',
              away_message_mode: userProfileResponseData?.profile?.status?.away_message ?? '',
              is_signed_out: userProfileResponseData?.profile?.status?.is_signed_out ?? false,
              r: userProfileResponseData?.profile?.status?.r,
              c: {
                ref: userProfileResponseData?.profile?.status?.c?.ref ?? '',
                type: userProfileResponseData?.profile?.status?.c?.type ?? '',
              },
              away_message: userProfileResponseData?.profile?.status?.away_message,
              role_notify: []
            },
            type: userProfileResponseData?.profile?.type,
          },
          matchedProfiles: [],
          coverageProfile: undefined,
  };
}
public trackByThreadId(index: number, threadData: USER_PROFILE_THREAD): string {
  return threadData?.threads?._id || '';
}
}
