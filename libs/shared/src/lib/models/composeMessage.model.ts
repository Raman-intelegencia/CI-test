import { ROLE_NOTIFY } from "./user.model";

export interface ProfileSearchResult {
    status: string;
    results: Result[];
    references: Reference[];
    match_tokens: string[];
    limited_results: boolean;
  }
  
  export interface Result {
    ref: string;
    type: string;
  }
  
  export interface Reference {
    type: string;
    id: string;
    data: {
      coverageProfile?: Reference;
      _id: {
        $oid: string;
      };
      cell_phone: string;
      cellphone_verify: boolean;
      date_last_login: {
        $date: number;
      };
      email_comm: boolean;
      first_name: string;
      flag_active: boolean;
      flag_basic?: boolean;
      image_id: string;
      last_name: string;
      profile: {
        dept: string;
        iid: string;
        iname: string;
        ishort: string;
        pager_number: string;
        title: string;
      };
      sms_comm: boolean;
      status: {
        s: string;
        away_message_mode: string;
        is_signed_out: boolean;
        r?: [];
        c?: {
          ref: string;
          type: string;
        };
        away_message?: string;
        role_notify?: ROLE_NOTIFY[],
      };
      type: string;
      iid?: string;
      role_type?: string;
      description?: string;
      tag?:string;
      time_updated?: {
        $date: number;
      };
      user_ids?: Array<{
        $oid: string;
      }>;
      name?: string; 
      perms?: string[]; 
      recipient_ids?: Array<{
        $oid: string;
      }>; 
      time_created?: {
        $date: number;
      }; 
      user_id?: {
        $oid: string;
      }; 
    };
    matchedProfiles?:Reference[]
    coverageProfile?:Reference
  }

  export interface statusDetails{
        s: string;
        away_message_mode: string;
        is_signed_out: boolean;
        r?: [];
        c?: {
          ref: string;
          type: string;
        };
        away_message?: string;
      };
  
  export interface PatientsSearchResult {
    status: string;
    patients: Patient[];
    match_tokens: string[];
    results: SearchResult[];
  }
  
  export interface Patient {
    id: string;
    name: string;
    pid: string;
    dob: string;
    sex: string;
  }
  
  export interface SearchResult {
    id: string;
    matches: {
      name: [number, number][];
    };
  }  
  export interface UploadFileData {
    id: number | null;
    file: File;
    progress: number;
    isComplete: boolean;
    isError: boolean;
  }

  export interface composeArray {
    id?: number;
    minimized?: boolean;
    to: Reference[];
    patient: string;
    subject: string;
    message: string;
    eventType?:string;
  }

  export interface externalComposeArray{
    id?:number;
    department?:string;
    to:string;
    recipient_name:string;
    minimized?:boolean;
  }

  export interface ComposeForm {
    to: string;
    patient: string;
    subject: string;
    message: string;
    urgent: boolean;
  }

  export interface ExternalComposeForm{
    message:string;
    to:string;
    recipient_name:string;
    department: string;
  }

  export interface FormStates {
    isInputFocused: boolean;
    isPatientInputFocused: boolean;
    collapseVisible: boolean;
    showErrorModal?:boolean;
    isUrgent: boolean;
    isMessageFocused: boolean;
    showDiscardModal: boolean;
  }

  export interface ComposeData {
    usersDataList: Reference[];
    selectedUsers: Reference[];
    patientsDataList: Patient[];
    selectedPatients: Patient[];
    uploadedFiles: UploadFileData[];
    currentIndex: number;
    selectedOffDutyUsers?: Reference[];
    selectedUserDataWithCStatus?: Reference[];
  }

  export interface ExternalComposeData {
    phoneNumberDataList: Array<string>;
    currentIndex:number;
  }

  export enum UserType {
    Cureatr = "cureatr",
    Role = "role",
    Group = "group",
    External = 'external',
    oneway = 'oneway'
  }

  export interface SelectedGroupProfileData{
    group:Reference,
    users:Reference[]
  }

  export interface SelectedServiceProfileData{
    service:Reference,
    users:Reference[]
  }

  export interface ThreadResponse {
    status: string;
    threadDetails: ThreadDetails;
    userProfiles: UserProfile[];
    message?:string | undefined
}

interface ThreadDetails {
    threadId: UniqueId;
    threadIid: string;
    threadOrigin: string;
    semHours: number;
    threadSeq: number;
    creationTime: DateTimeStamp;
    threadType: string;
    userId: UniqueId;
    subject: string;
    threadMessages: ThreadMessage[];
    lastUpdatedTime: DateTimeStamp;
    recipientIds: UniqueId[];
    threadReceivers: ThreadReceiver[];
    threadExpiration: DateTimeStamp;
}

interface UniqueId {
    oid: string;
}

interface DateTimeStamp {
    dateTimestamp: number;
}

interface ThreadMessage {
    messageId: UniqueId;
    messageIid: string;
    messageSeq: number;
    parentThreadId: UniqueId;
    messageCreationTime: DateTimeStamp;
    messageType: string;
    authorUserId: UniqueId;
    content: string;
    readStatus: string;
    statusDetails: MessageStatus[];
}

interface MessageStatus {
    statusId: UniqueId;
    currentStatus: string;
    readTime?: DateTimeStamp;
    associatedUserId: UniqueId;
}

interface ThreadReceiver {
    receiverName: string;
}

interface UserProfile {
    profileId: UniqueId;
    firstName: string;
    lastName: string;
    cellphone: string | null;
    isCellphoneVerified: boolean;
    cellphoneVerificationTime: string | null;
    needsCellphoneReverification: boolean;
    emailCommunicationEnabled: boolean;
    smsCommunicationEnabled: boolean;
    firstDoNotDisturbPopupTime: string | null;
    userType: string;
    detailedProfile: DetailedUserProfile;
    profileImageId: string;
    profileStatus: UserStatus;
}

interface DetailedUserProfile {
    institutionIid: string;
    pagerNumber: string;
    institutionName: string;
    institutionShortName: string;
}

interface UserStatus {
    status: string;
    isSignedOut: boolean;
}
