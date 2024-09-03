import { Reference } from "./composeMessage.model";

export interface User {
  uid: string;
  token: string;
}

export interface Authenticate {
  email: string;
  iid: string;
  password: string;
  type: string;
}

export interface UsersLoginResponse {
  message: string;
  client_data_sets: ClientDataSets[];
  config: Config;
  status: string;
  user: AuthUser;
}

export interface ClientDataSets {
  macros: string[];
  refresh_period: number;
  specialties: string[];
  time_updated: number;
  titles: string[];
}

export interface Config {
  client_permissions: ClientPermissions;
  config_attachments_url: string;
  do_agreement: agreement;
  config_limit_messages_per_thread: string;
  time_updated?: number;
  titles?: string[];
  config_profileimage_url?: string;
  timeout_seconds: number
}

export interface UsersAuthResponse {
  status: string;
  user: AuthUser;
  config: Config;
  message?: string;
  error?: string;
  references?:Reference[];
  counters_unread?: {
    msg: number;
  };
  counters?: {
    msg: number;
  };
}

export interface AuthUser {
  access_group_actions_map: access_group_actions_map;
  admin?: {
    iid: string;
    iname: string;
  }[];
  auto_schedule: string;
  cache_key: string;
  cell_phone: string | null;
  cellphone_verify: boolean;
  cellphone_verify_time: string | null;
  cellphone_reverify: boolean;
  date_last_login: {
    $date: number;
  };
  email: string;
  email_comm: boolean;
  first_name: string;
  flag_active: boolean;
  has_password: boolean;
  image_id: string;
  inst_migrating: boolean;
  is_initial_password: boolean;
  is_temp_password: boolean;
  journal_id: number;
  last_name: string;
  num_bad_pins?: number;
  phi_iids: {
    iid: string;
    iname: string;
  }[];
  pin?: string;
  profile: Profile;
  properties: {
    inbox_sort?: string
    seen_coach_mark_hint_archive_all: string;
    seen_coach_mark_mypatients_add: string;
  };
  sms_comm: boolean;
  status: {
    s: string;
    r: string[];
    r_type: string[];
    away_message_mode?: string;
    is_signed_out: boolean;
    away_message?:string;
    role_notify?:ROLE_NOTIFY[];
    c?: {
      ref: string;
      type: string;
    };
  };
  _id: {
    $oid: string;
  };
  flag_basic?: boolean;
  flag_managed?:boolean;
  password_change_reason:string;
}

export interface ROLE_NOTIFY {
    uid: {
        $oid: string;
    },
    stype: [],
    sname: [],
    date: {
        $date: number
    },
    event: string,
    first_name: string,
    last_name: string,
    admin_first_name: string,
    admin_last_name: string
}
export interface access_group_actions_map {
  client_api_active_modify: boolean;
  client_api_key_modify: boolean;
  client_api_user_create: boolean;
  client_api_webhooks_modify: boolean;
  client_apilog_view: boolean;
  client_ctn_search: boolean;
  client_ctn_update_config: boolean;
  client_file_processor_update: boolean;
  client_institution_broadcast: boolean;
  client_institution_create: boolean;
  client_institution_external_msg: boolean;
  client_institution_permissions: boolean;
  client_institution_update: boolean;
  client_institution_update_sso: boolean;
  client_institution_view_sso: boolean;
  client_report_bi: boolean;
  client_report_execute: boolean;
  client_report_execute_all: boolean;
  client_user_create: boolean;
  client_user_info_update: boolean;
  client_user_lock_unlock: boolean;
  client_user_manage_activation: boolean;
  client_user_pager_update: boolean;
  client_user_permissions: boolean;
  client_user_schedule_update: boolean;
  client_user_tags_update: boolean;
  client_user_view: boolean;
  client_user_view_auditlog: boolean;
  client_filearea?:boolean;
  client_manage_integrated_service_team?: boolean;
  client_manage_third_party_integration?: boolean;
}

export interface oid {
  $oid: string;
}
export interface Profile {
  dept: string;
  iid: string;
  iname: string;
  ishort: string;
  pager_number: string;
  title: string;
}
export interface ClientPermissions {
  is_integrated_service_team_enabled?: boolean;
  audio_attachments_disabled: boolean;
  camera_disabled: boolean;
  camera_roll_disabled: boolean;
  cellphone_verification: boolean;
  disable_standard_tos: boolean;
  dnd_override: boolean;
  email_text_automated: boolean;
  enable_mass_notification?: boolean;
  external_messaging: boolean;
  filearea_admin: boolean;
  force_90_day_password_reset: boolean;
  force_app_pin: boolean;
  inactivity_emails_disabled: boolean;
  is_cellphone_verification_enabled: boolean;
  message_content_notifications: boolean;
  message_sending_disabled: boolean;
  other_attachments_disabled: boolean;
  override_broadcast_messages: boolean;
  override_pager_integration: boolean;
  override_peer_to_peer: boolean;
  pager_integration: boolean;
  patient_centric_messaging: boolean;
  patient_create: boolean;
  patient_search_all: boolean;
  redshift_available: boolean;
  role: boolean;
  sso: boolean;
  sso_only: boolean;
  sso_shared_authentication: boolean;
  service_teams_notifications_enabled?:boolean;
}

export interface load_latest2 {
  config: Config[];
  counter_tally: number;
  counters: counters;
  counters_unread: counters;
  entries: [];
  flush_local: number;
  max_journal_id: number;
  profiles: Profile;
  status: string;
  threads: [];
  user: AuthUser;
}

export interface counters {
  msg: number;
}

export interface status {
  _id: oid;
  message_id: oid;
  status: string;
  time_read: object;
  user_id: oid;
}

export interface date {
  $date: number;
}

export interface agreement {
  document: string;
  iid: string;
  version: string;
}

export interface changePassword {
  error?: string;
  message?: string;
  status: string;
  old_password: string;
  new_password: string;
}
export interface UpdateFeatureData {
  instituteId: string; 
  json: {
    value?: string;
    wowos?: (string | undefined)[];
  };
}

export interface ChangePasswordData{
  new_password: string;
  old_password: string;
  a?: string; // Optional property
}