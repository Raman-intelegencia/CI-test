import { Reference } from "./composeMessage.model";

export interface ProfileSearch3Results {
  status: string;
  results: ProfileResult[];
  references: ProfileReference[];
  match_tokens: string[];
  limited_results: boolean;
}

export interface ProfileResult {
  ref: string;
  type: string;
}

export interface ProfileReference {
  type: string;
  id: string;
  data: {
    _id: {
      $oid: string;
    };
    name?:string;
    iid?: string;
    description?: string;
    role_type?: string;
    time_updated?: {
      $date: number;
    };
    user_ids?: { $oid: string }[];
    recipient_ids?: Array<{
      $oid: string;
    }>; 
    cell_phone: string;
    cellphone_verify: boolean;
    cellphone_reverify?: boolean;
    cellphone_verify_time?: {
      $date: number;
    };
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
      r_type?: [];
      c?:{ref:string, type:string}
    };
    type: string;
  };
  matchedProfiles?:ProfileReference[],
  coverageProfile?:ProfileReference
}

export interface CREATE_GROUP_REFERENCE {
    _id: {
      $oid: string;
    };
    name?:string;
    iid?: string;
    description?: string;
    role_type?: string;
    time_updated?: {
      $date: number;
    };
    user_ids?: { $oid: string }[];
    cell_phone?: string |null;
    cellphone_verify?: boolean;
    cellphone_reverify?: boolean;
    cellphone_verify_time?: {
      $date: number;
    };
    date_last_login: {
      $date: number;
    };
    email_comm?: boolean;
    first_name: string;
    flag_active?: boolean;
    image_id: string;
    last_name: string;
    profile: {
      dept: string;
      iid: string;
      iname: string;
      ishort: string;
      pager_number?: string;
      title: string;
    };
    sms_comm?: boolean;
    status: {
      s: string;
      away_message_mode?: string;
      is_signed_out: boolean;
      r?: [];
      r_type?: [];
    };
    type: string;
    coverageProfile?:Reference;
  };
export interface SearchProfileRecipientData {
  usersProfileList: ProfileReference[];
  selectedUsers: ProfileReference[];
}

export interface ProfileThreadData {
  profile: ProfilesData;
  thread: ThreadsData;
}

export interface ProfilesData {
  _id: {
    $oid: string;
  };
  flag_active?:boolean;
  cell_phone: string;
  cellphone_verify?: boolean;
  date_last_login: {
    $date: number;
  };
  first_name: string;
  image_id: string;
  last_name: string;
  profile: {
    dept: string;
    iid: string;
    iname: string;
    ishort: string;
    title: string;
  };
  status: {
    is_signed_out: boolean;
    s: string;
    r?: [];
    r_type?: [],
    c?: {
      ref:string;
      type:string;
  },
  away_message_mode?: string,
  away_messag?: string,
  };

  type: string;
}

export interface ThreadsData {
  _id: {
    $oid: string;
  };
  iid: string;
  messages: MessageData[];
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
  expiration?: {
    $date: number;
  };
}

export interface MessageData {
  _id: {
    $oid: string;
  };
  content: string;
  iid: string;
  seq: number;
  status: string;
  statuses: MessageStatusData[];
  thread_id: {
    $oid: string;
  };
  time_created: {
    $date: number;
  };
  type: string;
  user_id: {
    $oid: string;
  };
}

export interface MessageStatusData {
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

export interface CreateGroupResponse {
  status: string;
  group: Group;
  groups?:Group;
  error?: string;
  message?: string;
}
export interface Group {
  _id: {
    $oid: string;
  };
  iid: string;
  id?:string;
  user_id: {
    $oid: string;
  };
  name: string;
  status: string;
  perms: [];
  time_created: {
    $date: number;
  };
  time_updated: {
    $date: number;
  };
  public: null;
  recipients: CREATE_GROUP_REFERENCE[];
  is_writable: boolean;
  is_group_readable: boolean;
  user: ProfilesData;
  recipient_ids:
    {
      $oid: string;
    }[];
}

export interface SettingsLabelStates {
  pagerThreads: boolean;
  peerToPeerThreads: boolean;
  externalThreads: boolean;
  broadcastThreads: boolean;
  showLeavePopup: boolean;
  isAddRecipientPopup: boolean;
  archiveChats: boolean;
  isSaveMessagingGrpModal: boolean;
  showRecipient:boolean;
  showConversationSettingsMenuBar:boolean;
  showEndConversation:boolean;
}

export interface UPDATE_USERS
{
  status: string,
  messages: [
      {
          _id: {
              $oid: string;
          },
          iid:string;
          seq: number;
          thread_id: {
              $oid: string;
          },
          time_created: {
              $date: number;
          },
          type: string;
          user_id: {
              $oid: string;
          },
          content: string;
          status: string;
          statuses: [
              {
                  _id: {
                      $oid: string;
                  },
                  status: string;
                  user_id: {
                      $oid: string;
                  }
                }
          ]
      }
  ],
  profiles: ProfilesData[],
  message?:string
}

export interface LEAVE_CHAT
{
  status: string,
  messages:
      {
          _id: {
              $oid: string;
          },
          iid:string;
          seq: number;
          thread_id: {
              $oid: string;
          },
          time_created: {
              $date: number;
          },
          type: string;
          user_id: {
              $oid: string;
          },
          content: string;
          status: string;
          statuses: [
              {
                  _id: {
                      $oid: string;
                  },
                  status: string;
                  user_id: {
                      $oid: string;
                  }
                }
          ]
      },
      message?:string
}
