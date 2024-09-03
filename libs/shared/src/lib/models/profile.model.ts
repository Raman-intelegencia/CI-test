import { Role } from "@amsconnect/shared";
import { ROLE_NOTIFY } from "libs/shared/src/lib/models/user.model";

export interface profileResponse {
  profile: profileData;
  status: string;
  references?:Reference[]
}

export interface profileData {
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
  image_id: string;
  last_name: string;
  profile: UserProfile;
  sms_comm: boolean;
  status: status;
  type: string;   
  flag_active?:boolean;
}

export interface threadProfileData {
  _id: string;
  cell_phone: string;
  cellphone_verify: boolean;
  date_last_login: {
    $date: number;
  };
  email_comm: boolean;
  first_name: string;
  image_id: string;
  last_name: string;
  profile: UserProfile;
  sms_comm: boolean;
  status: status;
  type: string;   
  flag_active?:boolean;
}

export interface UserProfile {
  dept: string;
  iid: string;
  iname: string;
  ishort: string;
  pager_number: string;
  title: string;
}
export interface status {
  away_message?: string;
  away_message_mode: string;
  is_signed_out: boolean;
  r?: [];
  r_type?: string[];
  s?: string;
  c?: {
    ref: string;
    type: string;
  };
  role_notify?:ROLE_NOTIFY[];
}

export interface Shift {
  id: string;
  start: string;
  time_updated: string;
  roles?: string[];
  end?: string;
  currently_active: boolean;
  role_types?: string[];
  scheduler_type?: string;
  recurring?: {
    timezone: string,
    start_time: string,
    end_time: string,
    days: number[]
},
}
export interface Thread {
  threads: thread[];
  profiles: threadProfileData[];
  status: string;
  results_limited?: boolean;
}

export interface USER_PROFILE_THREAD {
  threads: thread;
  profiles: threadProfileData[];
  sender_profile: threadProfileData | undefined
}
export interface thread {
patient: any;
patient_name: any;
  _id: string;
  iid: string;
  origin: string;
  seq: number;
  expiration?: string;
  time_created: string;
  time_updated: string;
  type: string;
  unread_count: number;
  subject: string;
  recipients:string[] ;
  messages: Message[];
  user_id: string;
  status?:string;
  receivers: Array<{ name: string }>;
  visibility?: boolean;
  muted?: boolean;
  isOlderThread?: boolean;

}

export interface Threads {
  _id: {
    $oid: string;
  };
  iid: string;
  messages: Message[];
  thread_id?: {
    $oid: string;
  };
  time_created: {
    $date: number;
  };
  type: string;
  user_id: {
    $oid: string;
  };
  origin: string;
  recipients: {
    $oid: string;
  }[];
  seq: number;
  subject: string;
  time_updated: {
    $date: number;
  };
  unread_count: number;
  expiration?: string;

}

export interface Message {
  _id: {
    $oid: string;
  };
  content: string;
  iid: string;
  seq: number;
  status: string;
  statuses: MessageStatus[];
  thread_id: {
    $oid: string;
  };
  time_created: {
    $date: number;
  };
  type: string;
  user_id: string;
  urgent?: boolean;

}
export interface MessageStatus {
  _id: {
    $oid: string;
  };
  message_id: {
    $oid: string;
  };
  status: string;
  user_id: {
    $oid: string;
  };
  time_read?: {
    $date: number;
  };
}

export interface RECIPIENTS {
  firstName: string;
  lastName: string;
  _id: string;
}

export interface Reference {
  type: string;
  id: string;
  data: {
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
    };
    type: string;
  };
}
  export interface SHIFTS {
      status?: string;
      current_time?: string;
      current_manual_roles?: [];
      current_manual_roles_type?: [];
      shifts?: Shift[];
      user?: string;
      role_type: RoleType[],
      id?: string;
      start?: string;
      time_updated?: string;
      roles?: string[];
      end?: string;
      currently_active?: boolean;
      role_types?: string[];
      scheduler_type?: string;
      recurring?: {
        timezone: string,
        start_time: string,
        end_time: string,
        days: number[]
  }
}

export interface RoleType {
  general: string[];
  reserved: string[];
  restricted: string[];
  integrated: integrated[];
}
export interface integrated {
    description: string
    tag:string
}



export enum UserType {
  oneway = "oneway",
}

export interface ProfileStatus {
  firstAndLastName: string;
  status?: string;
}


export interface UserUpdateStatus {
  status: string;
  away_message_mode: string;
  role: string[];
  coverage?: string;
  scheduler_type?: string;
  removed_manual_role: string | string[] | undefined;
  away_message?: string;
  user_remove?:string;
  user_id?:string;
}

export interface SELECTED_SERVICE_ROLE_LIST{
  selectedServiceTeam: Shift[];
  selectedServiceRoleList: Role[];
}
