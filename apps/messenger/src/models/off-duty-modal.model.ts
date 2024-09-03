import { Role } from "@amsconnect/shared";
import { Shift } from "./profile.model";

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

export interface addRecipientData {
  usersDataList: Reference[];
  selectedUsers: Reference[];
}
