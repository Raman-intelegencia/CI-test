import { Configurations, Profiles, Threads } from "./threads.model";

export interface RoleResponse {
  status: string;
  roles: Role[];
  count?: number;
}

export interface Role {
  _id: string;
  iid: string;
  role_type: string;
  description: string;
  time_updated: string;
}

export interface RoleWithIndex {
  role: Role;
  index: number;
}

export interface CreateShiftRequest {
  start: string | null | Date;
  end: string | null | Date;
  roles: string[];
  a?: string;
  recurring?: Recurring;
  user_id?:string;
}

export interface Recurring {
  start_time: string | null | undefined | Date;
  end_time: string | null | undefined | Date;
  timezone: string;
  days: number[] | undefined;
}
interface CreateShiftUserProfile {
  _id: string;
  first_name: string;
  last_name: string;
  cell_phone: string | null;
  cellphone_verify: boolean;
  cellphone_verify_time: string | null;
  cellphone_reverify: boolean;
  email_comm: boolean;
  sms_comm: boolean;
  type: string;
  profile: UserProfileData;
  date_last_login: string;
  image_id: string;
  status: UserStatus;
  flag_active: boolean;
  email: string;
  journal_id: number;
  has_password: boolean;
  is_temp_password: boolean;
  is_initial_password: boolean;
  admin: UserAdmin[];
  phi_iids: UserPhiIid[];
  properties: UserProfileProperties;
  auto_schedule: string;
  inst_migrating: boolean;
  cache_key: string;
  access_group_actions_map: UserAccessGroupActionsMap;
}

interface ShiftData {
  id: string;
  start: string;
  time_updated: string;
  roles: string[];
  end: string;
  currently_active: boolean;
}

export interface createShiftResponse {
  status: string;
  user: CreateShiftUserProfile;
  shift: ShiftData;
  auto_schedule: string;
  message?: string;
}

export interface DELETE_SHIFT_RESPONSE {
  status: string;
  user: CreateShiftUserProfile;
  auto_schedule: string;
  message?: string;
}

export interface UserStatus {
  s: string;
  r: string[];
  r_type: string[];
  away_message_mode?: string;
  is_signed_out: boolean;
  away_message?: string;
  c?: {
    ref: string;
    type: string;
  };
}

export interface UserProfile {
  _id: {
    $oid: string;
  };
  first_name: string;
  last_name: string;
  cell_phone: string | null;
  cellphone_verify: boolean;
  cellphone_verify_time: string | null;
  cellphone_reverify: boolean;
  email_comm: boolean;
  sms_comm: boolean;
  type: string;
  profile: UserProfileData;
  date_last_login: {
    $date: number;
  };
  image_id: string;
  status: UserStatus;
  flag_active: boolean;
  email: string;
  journal_id: number;
  has_password: boolean;
  is_temp_password: boolean;
  is_initial_password: boolean;
  admin: UserAdmin[];
  phi_iids: UserPhiIid[];
  properties: UserProfileProperties;
  auto_schedule: string;
  inst_migrating: boolean;
  cache_key: string;
  access_group_actions_map: UserAccessGroupActionsMap;
  num_bad_pins?: number;
  password_change_reason: string;
}

interface UserProfileData {
  dept: string;
  iid: string;
  title: string;
  pager_number: string;
  iname: string;
  ishort: string;
}

interface UserAdmin {
  iid: string;
  iname: string;
}

interface UserPhiIid {
  iid: string;
  iname: string;
}

interface UserAccessGroupActionsMap {
  client_user_view: boolean;
  client_api_user_create: boolean;
  client_user_create: boolean;
  client_user_manage_activation: boolean;
  client_user_lock_unlock: boolean;
  client_user_info_update: boolean;
  client_user_pager_update: boolean;
  client_user_schedule_update: boolean;
  client_user_tags_update: boolean;
  client_api_key_modify: boolean;
  client_api_webhooks_modify: boolean;
  client_api_active_modify: boolean;
  client_user_permissions: boolean;
  client_user_view_auditlog: boolean;
  client_apilog_view: boolean;
  client_institution_broadcast: boolean;
  client_institution_create: boolean;
  client_institution_permissions: boolean;
  client_institution_update: boolean;
  client_report_execute: boolean;
  client_report_execute_all: boolean;
  client_report_bi: boolean;
  client_ctn_search: boolean;
  client_ctn_update_config: boolean;
  client_file_processor_update: boolean;
  client_institution_view_sso: boolean;
  client_institution_update_sso: boolean;
  client_institution_external_msg: boolean;
}
interface UserProfileProperties {
  seen_coach_mark_hint_archive_all: string;
  seen_coach_mark_mypatients_add: string;
}
export interface UpdateStatusResponse {
  status: string;
  user: UserProfile;
  config: Configurations;
  counters?: {
    msg: number;
  };
  counters_unread?: {
    msg: number;
  };
  entries?: any[];
  flush_local?: number;
  max_journal_id?: number;
  profiles?: Profiles[];
  threads?: Threads[];
  counter_tally?: number;
  user_remove?: {
    show_pop_up: boolean;
    removed_service: [];
}
}

export interface Shift {
  tag?: string;
  id: string;
  start: string;
  time_updated: string;
  roles?: string[];
  end?: string;
  currently_active: boolean;
  role_types?: string[];
  scheduler_type?: string;
  recurring?: {
    timezone: string;
    start_time: string;
    end_time: string;
    days: number[];
  };
}
