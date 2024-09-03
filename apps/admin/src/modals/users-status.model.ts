export interface ShowModalStates {
    showCurrentServiceTeam: boolean;
    noResultsFound: boolean;
    isInputFocused: boolean;
    showAutoResponsePopup: boolean;
    isCustomResponseEnabled: boolean;
    showUserList: boolean;
    inputEditable: boolean;
    showModal: boolean;
  }
  
  export interface UserUpdateStatus {
    status: string;
    away_message_mode: string;
    role: string[];
    coverage: string;
    scheduler_type: string;
    removed_manual_role: string;
    away_message: string;
  }

  export interface UserData {
    _id: {
      $oid: string;
    };
    first_name: string;
    last_name: string;
    cell_phone: string | null;
    cellphone_verify: boolean;
    cellphone_verify_time: null | number;
    cellphone_reverify: boolean;
    popup_msg_last_date: null | number;
    email_comm: boolean;
    sms_comm: boolean;
    first_dnd_popup_time: null | number;
    type: string;
    profile: {
      dept: string;
      iid: string;
      title: string;
      pager_number: string;
      iname: string;
      ishort: string;
    };
    date_last_login: {
      $date: number;
    };
    image_id: string;
    status: {
      s: string;
      role_notify: {
        uid: {
          $oid: string;
        };
        stype: string[];
        sname: string[];
        date: {
          $date: number;
        };
        event: string;
        first_name: string;
        last_name: string;
        admin_first_name: string;
        admin_last_name: string;
      }[];
      r: string[];
      r_type: string[];
      away_message_mode: string;
      is_signed_out: boolean;
      away_message?:string
      c?: {ref: string, type: string}
    };
    flag_active: boolean;
    email: string;
    journal_id: number;
    has_password: boolean;
    is_temp_password: boolean;
    is_initial_password: boolean;
    admin: {
      iid: string;
      iname: string;
    }[];
    phi_iids: {
      iid: string;
      iname: string;
    }[];
    properties: {
      seen_coach_mark_hint_archive_all: string;
      seen_coach_mark_scheduling_checkbox: string;
      seen_coach_mark_mypatients_add: string;
      inbox_sort: string;
      pref_mute_pager: string;
    };
    auto_schedule: string;
    inst_migrating: boolean;
    uid: {
      id: string;
      iid: string;
    };
    has_pin: boolean;
    num_good_logins: number;
    num_bad_logins: number;
    time_created: {
      $date: number;
    };
    site: Record<string, any>;
    can_send_activation_email: boolean;
    wowos: Record<string, any>;
    legal_agreement: {
      document: string;
      iid: string;
      version: string;
      is_complete: boolean;
    };
    time_last_login: {
      $date: number;
    };
    time_password_set: {
      $date: number;
    };
    notification_token: null | string;
  }
  
  export interface UsersSearchResponse {
    status: string;
    result: UserData[];
  }
  
  export interface UpdateStatusPayloadObj {
    status: string
    coverage: string,
    away_message: string,
    away_message_mode: string,
    user_id: string
  }

  export interface addRecipientData {
    usersDataList: UserData[];
    selectedUsers: UserData[];
}