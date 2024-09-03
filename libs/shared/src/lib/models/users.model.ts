export interface UserSearchResponse {
    status: string;
    results: User[];
    results_limited: boolean;
}

export interface User {
    _id: {
        $oid: string;
    };
    first_name: string;
    last_name: string;
    cell_phone: string;
    cellphone_verify: boolean;
    cellphone_verify_time: null | {$date: number};
    cellphone_reverify: boolean;
    email_comm: boolean;
    sms_comm: boolean;
    first_dnd_popup_time: null | number;
    type: string;
    profile: UserProfile;
    date_last_login: DateObject;
    image_id: string;
    status: UserStatus;
    flag_active: boolean;
    flag_basic: boolean;
    flag_managed: boolean;
    email: string;
    journal_id: number;
    has_password: boolean;
    is_temp_password: boolean;
    is_initial_password: boolean;
    admin: Admin[];
    phi_iids: PHI[];
    properties: { [key: string]: string };
    auto_schedule: string;
    inst_migrating: boolean;
    uid: UserIdentifier;
    has_pin: boolean;
    num_good_logins: number;
    num_bad_logins: number;
    time_created: DateObject;
    site: {
        location:string;
        detail:string;
        city:string;
        state:string;
    };
    can_send_activation_email: boolean;
    wowos: {};
    legal_agreement: {
        document: string,
        iid: string,
        version: string,
        is_complete:boolean
    };
    time_last_login: DateObject;
    time_password_set: DateObject;
    notification_token?:NotificationToken;
    api_key?:string;
    flag_locked?:boolean;
    has_reset_token?: boolean,
    app_platform?: string,
    app_version?: string,
    webhooks?:WebHookData,
    username?: string,
    public_key?:string 
    tags:Array<string>;
    coverage_user?: User
}

export interface WebHookData {
  user_provisioning: string;
  message_sent:string;
  message_read:string;
  user_status:string;
}

export interface NotificationToken {
    _id: {
        $oid: string;
    };
    token: string;
    type: string;
    sns: string;
    time_saved: {
        $date: number;
    };
    time_created: {
        $date: number;
    };
}


export interface UserProfile {
    dept: string;
    iid: string;
    title: string;
    pager_number: string;
    iname: string;
    ishort: string;
}

interface DateObject {
    $date: number;
}

export interface UserStatus {
    s: string;
    role_notify: RoleNotify[];
    r:string[];
    r_type:string[];
    away_message_mode: string;
    is_signed_out: boolean;
    away_message?:string
    c?: {ref: string, type: string}
}

interface RoleNotify {
    uid: {
        $oid: string;
    };
    stype: string[];
    sname: string[];
    date: DateObject;
    event: string;
    first_name: string;
    last_name: string;
    admin_first_name: string;
    admin_last_name: string;
}

export interface Admin {
    iid: string;
    iname: string;
}

interface PHI {
    iid: string;
    iname: string;
}

interface UserIdentifier {
    id: string;
    iid: string;
}

export enum ActiveStatus {
    Info = "info",
    Permissions = "permissions",
    Events = "events",
    Audit= "audit",
    ApiLog = "apilog"
  }

  export interface UserSearchByIdResponse {
    status: string,
    user: User
  }

  export interface UserInfoUpdateResponse {
    status: string,
    user?: User,
    message?:string
  }

  export interface UserProfilePhotoResponse {
    status: string,
    message?:string,
    error?:string
    image_id:string
  }

  export interface UserEmailSubscriptionResponse {
        status: string,
        user_email_subscriptions: {
            idle_email: boolean,
            second_channel: boolean
        }
  }

  export enum UserStatusType {
    Available = "available",
    Busy = "busy",
    Off = "off"
  }

  export interface WebhooksResponse {
    status: string,
    user: User,
    message?:string
  }

  export interface SftpResponse {
    status: string,
    user: User,
    message?:string
  }

  export interface ApiKeyResponse {
    status: string,
    user: User,
    message?:string
  }

  export interface UpdatePagerResponse {
    status: string,
    user: RemovePagerUser,
    message?:string
  }

  interface RemovePagerUser {
    _id: string;
    first_name: string;
    last_name: string;
    cell_phone: string;
    cellphone_verify: boolean;
    cellphone_verify_time: string | null;
    cellphone_reverify: boolean;
    popup_msg_last_date: string | null;
    email_comm: boolean;
    sms_comm: boolean;
    first_dnd_popup_time: string | null;
    type: string;
    profile: UserProfile;
    date_last_login: string;
    image_id: string;
    status: UserStatus;
    flag_active: boolean;
    flag_locked?:boolean;
    email: string;
    journal_id: number;
    has_password: boolean;
    is_temp_password: boolean;
    is_initial_password: boolean;
    admin: AdminRole[];
    phi_iids: PhiIid[];
    properties: Record<string, string>;
    auto_schedule: string;
    inst_migrating: boolean;
    uid: UserId;
    has_pin: boolean;
    num_good_logins: number;
    num_bad_logins: number;
    time_created: string;
    site: Record<string, unknown>; // Replace with a more specific type if needed
    can_send_activation_email: boolean;
    wowos: Record<string, unknown>; // Replace with a more specific type if needed
    legal_agreement: LegalAgreement;
    time_last_login: string;
    time_password_set: string;
    notification_token: string | null;
}

interface AdminRole {
    iid: string;
    iname: string;
}

interface PhiIid {
    iid: string;
    iname: string;
}

interface UserId {
    id: string;
    iid: string;
}

interface LegalAgreement {
    document: string;
    iid: string;
    version: string;
    is_complete: boolean;
}

export interface UserPermissionsReponse {
    status: string;
    permission: PermissionData;
    all_actions: { [key: string]: string };
    actions_sorted: string[];
    action_map: { [key: string]: string[] };
    disabled_actions: { [key: string]: string };
    institutions: { [key: string]: Institution };
    message: string;
}

export interface PermissionData {
    entity: Entity;
    grants: Grant[];
}

export interface Entity {
    type: string;
    user_id?: string;
    iid?: string;
    path?:string;
}

export interface Grant {
    actions: string[];
    targets: Target[];
}

export interface Target {
    entity: Entity;
    type: string;
}

export interface Institution {
    id: string;
    short_name: string;
    name: string;
}

export interface UserPermissionGrant {
    actions: Record<string, boolean>;
    institutions: AppendedInstitution[];
  }
  
  export interface FileGrant {
    actions: {
      'filearea-read': boolean;
      'filearea-write': boolean;
    };
    filePaths: string[];
  }
  
  export interface AppendedInstitution {
    id: string;
  }
  
  export interface ExtractedTarget {
    type: 'i' | 'f';
    entity: {
      type: 'i' | 'f';
      iid?: string;
      path?: string;
    };
  }
  
  export interface CombinedGrant {
    actions: string[];
    targets: ExtractedTarget[];
  }

export interface UserEventLogResponse {
    status: string;
    events: UserEventData[];
    actors: Actor[];
    objects: EventObject[];
    event_names: { [key: string]: string };
    results_limited: boolean;
}

export interface UserEventData {
    _id: string;
    aid: string;
    ip: string;
    at: string;
    ed: EventDetails;
    et: number;
    oid: string;
    ot: string;
    tc: string;
}

export interface ProcessedUserEventData extends UserEventData {
    eventDataDisplay: string;
    isLongEventData: boolean;
    fullEventData: string;
    target?: string; // Optional, as it may not always be present
}

export interface ApiLogData {
  typeofEventLogsData:boolean,
  userId:string,
  fromDate:number,
  toDate:number,
  limit:number,
  url_prefixes?:string,
  user_ids?:string,
  instituteName?: string,
  lastEventId?: string
}

export interface EventDetails {
    t?: string;
    l?: string;
    g?: EventDetailGrant[];
    e?: EventLogEntity;
    [key: string]: any; // For any additional properties not explicitly defined
}

export interface EventDetailGrant {
    a: string[];
    r: EventLogRole[];
}

export interface EventLogRole {
    t: string;
    e: EventLogEntity;
}

export interface EventLogEntity {
    t: string;
    e: string;
}

export interface Actor {
    id: string;
    type: string;
    name: string;
}

export interface EventObject {
    id: string;
    t: string;
    name: string;
}
  export  interface UsersResponse {
    status: string;
    users: User[];
  }

type ErrorType = 'error' | 'exception' | 'otherErrorTypes';

export interface UserErrorResponse {
  status?: string,
  message?: string,
}


export interface passwordResetGeneratePassword {
  error?: string;
  message?: string;
  status: string;
  temp_password?: string;
  user?: User,
}

export interface sendNotification {
  error?: string;
  status: string;
  notifications?:number
}

export interface sendActivationMail{
  status:string;
  message:string;
}
export interface generateRemoveApiKeyResponse {
  status: string,
  user: generateRemoveApiUser,
  message?:string
}

export interface generateRemoveApiUser {
  _id: string;
  first_name: string;
  last_name: string;
  cell_phone: string;
  cellphone_verify: boolean;
  cellphone_verify_time: null | {$date: number};
  cellphone_reverify: boolean;
  email_comm: boolean;
  sms_comm: boolean;
  first_dnd_popup_time: null | number;
  type: string;
  profile: UserProfile;
  date_last_login: DateObject;
  image_id: string;
  status: UserStatus;
  flag_active: boolean;
  flag_basic: boolean;
  flag_managed: boolean;
  email: string;
  journal_id: number;
  has_password: boolean;
  is_temp_password: boolean;
  is_initial_password: boolean;
  admin: Admin[];
  phi_iids: PHI[];
  properties: { [key: string]: string };
  auto_schedule: string;
  inst_migrating: boolean;
  uid: UserIdentifier;
  has_pin: boolean;
  num_good_logins: number;
  num_bad_logins: number;
  time_created: DateObject;
  site: {
      location:string;
      detail:string;
      city:string;
      state:string;
  };
  can_send_activation_email: boolean;
  wowos: {};
  legal_agreement: {
      document: string,
      iid: string,
      version: string,
      is_complete:boolean
  };
  time_last_login: DateObject;
  time_password_set: DateObject;
  notification_token?:NotificationToken;
  api_key?:string;
  flag_locked?:boolean;
  has_reset_token?: boolean,
  app_platform?: string,
  app_version?: string,
  webhooks?:WebHookData,
  username?: string,
  public_key?:string 
  tags:Array<string>;
}


export interface FileGrantAccessUserPermission {
  actions: {
    'filearea-read': boolean;
    'filearea-write': boolean;
  };
  filePaths: string[];
}