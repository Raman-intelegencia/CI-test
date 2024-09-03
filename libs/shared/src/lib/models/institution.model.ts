export interface Institution {
  id: string;
  short_name: string;
  name: string;
  is_sso_enabled: boolean;
  is_sso_only: boolean;
  is_sso_shared_authentication: boolean;
  pager_integration: boolean;
  broadcast_messages: boolean;
  peer_to_peer: boolean;
  specialties: string[];
  titles: any[];
  facilities: any[];
  is_locked: boolean;
  parent_iid: string;
  child_institutions: any[];
  master_iid: string;
  is_role_enabled: boolean;
  is_dnd_override_enabled: boolean;
  is_cellphone_verification_enabled: boolean;
  is_external_messaging_enabled: boolean;
  service_teams_notifications_enabled: boolean;
  cellphone_verification: boolean;
  web_timeout_minutes: number;
  mobile_timeout_minutes: number;
  yaml: string;
  wowos: any[];
  wowo_features: { [key: string]: WowoFeature };
  location: any;
  tags: any[];
  macros: any[];
  is_blocked: boolean;
  is_migrating: boolean;
  sem_hours: number;
  retention_days: number;
  // default_macros: string[];
}

export interface WowoFeature {
  valid: boolean;
  availability: string;
  description: string;
  message?: string;
}
export interface InstitutionResponse {
  message: string;
  status: string;
  institutions: Institution[];
  specialties: string[];
  titles: string[];
}

export interface EditInstitutionResponse {
  status: string;
  institution: Institution;
}

export interface SendCustomEmailDetails {
  subject: string;
  body: string;
  et_type: string;
  a: string;
}

export interface SaveCustomEmailDetails {
  subject: string;
  body: string;
  et_type: string;
  a: string;
  options: string
}
export interface AdminEmailTemplateResponse {
  email_templates: []
  status: string;
  message?: string;
}

export enum CustomEmailEnum {
  InactiveUser = "inactive-user",
  SecondChannel = "2-channel-notification",
  ActivationEmailNonSSO = "activation-email-non-sso",
  UnactiveUserResetLink = "unactivated-user-reset-link",
  ActivationEmailSSO = "activation-email-sso"
}
export interface EmailTemplate {
  body: string;
  display_name: string;
  et_id: string;
  iid: string;
  options: Options;
  params: string[];
  subject: string;
  tmpl_options: Tmpl_Options;
  type: string;
}

interface Tmpl_Options {
  frequency: string[],
  pending_messages_only?: boolean[]
}
interface Options {
  frequency: string | null,
  pending_messages_only?: boolean | null
}
export interface SendCustomEmailResponse {
  message: string;
  status: string;
}
export interface InstitutionSearchResponse {
  status: string;
  institutions: InstitutionDetails[];
  results_limited: boolean;
}

export interface InstitutionDetails {
  id: string;
  parent_iid: string;
  short_name: string;
  name: string;
  is_locked: boolean;
}

export interface SelectedServiceTeam {
  _id: string;
  description: string,
  iid: string,
  role_type: string,
  time_updated: string,
}

export interface ShowCurrentServiceTeam {
  name: string,
  iid: string,
  teams: SelectedServiceTeam[],
}

export interface CreateInstitution {
  id: string;
  short_name: string;
  name: string;
}
export interface RolesData {
  status: string;
  roles: string[];
  users: string[];
  active_roles: string[];
  role_pagers: RolePager[];
  warnings?: string[];
}

export interface UpdateInstitutionResponse {
  message: string;
  status: string;
  institutions?: Institution[];
  specialties?: string[];
  titles?: string[];
}

export interface RolePager {
  role: string;
  pager_number?: string;
}

export interface CombinedData {
  tags: string[],
  newAddedRoles: string[],
  deletedTag: string[],
  renamedService: renamedService[],
  user_updates?: updatedFeature
}

export interface renamedService {
  [key: string]: string;
}

export interface CustomTitles {
  [key: string]: string[];
}
export interface TimeoutConfigPayload {
  [key: string]: string;
}

export interface getUserInService {
  results: serviceUser[];
  results_limited: boolean;
  selected_users: serviceUser[];
  status: string;
}

export interface addUserInServiceData {
  users: string[];
  role_type: string;
  iid: string;
  roles: string[];
}

export interface serviceUser {
  auto_schedule: string;
  can_send_activation_email: boolean;
  cell_phone: string;
  cellphone_reverify: boolean;
  cellphone_verify: boolean;
  cellphone_verify_time: Date | null;
  email: string;
  email_comm: boolean;
  first_dnd_popup_time: Date | null;
  first_name: string;
  has_password: boolean;
  has_pin: boolean;
  has_reset_token: boolean;
  image_id: string;
  inst_migrating: boolean;
  is_initial_password: boolean;
  is_temp_password: boolean;
  journal_id: number;
  last_name: string;
  legal_agreement: {
    document: string;
    iid: string;
    version: string;
    is_complete: boolean;
  };
  notification_token: string | null;
  num_bad_logins: number;
  num_good_logins: number;
  popup_msg_last_date: Date | null;
  profile: {
    dept: string;
    iid: string;
    title: string;
    iname: string;
  };
  site: Record<string, any>;
  sms_comm: boolean;
  status: {
    s: string;
    is_signed_out: boolean;
  };
  time_created: {
    $date: number;
  };
  type: string;
  uid: {
    id: string;
    iid: string;
  };
  wowos: Record<string, any>;
  _id: {
    $oid: string;
  }
}

export interface addUserResponce {
  role_pagers: RolePager[];
  roles: string[];
  status: string;
  user_remove: any[];
  warnings: any[];
}

export interface serviceTeamPayload {
  iid: string;
  role_type: string;
  roles?: string[];
  start?: Date | string | undefined;
  end?: Date | string | undefined;
  users: string[];
  user_remove?: string;
}

export interface addUserFormEmiiter {
  start?: string;
  end?: string;
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  iid: string;
  listOfUsers: string[];
  role_type: string;
  roles: string[];
  searchTerm: string;
  selectedUsers: string[];
  users: string[];
  user_remove?: string;
}
export interface addServiceUser {
  id: string;
  name: string;
  uid: string;
  email: string;
  institution?: string;
}

export enum timeoutConfigCheck {
  web_timeout_minutes = "0",
  mobile_timeout_minutes = "0",
  sem_hours = "0",
  retention_days = "0"
}

export interface updatedFeature {
  [key: string]: string[]
}

export interface TitleCheckboxState {
  title: string;
  selected: boolean;
}
export interface SpecialtiesCheckboxState {
  specialties: string;
  selected: boolean;
}

export interface selectedInputInstitutions {
  id: string;
  is_locked: boolean;
  name: string;
  parent_iid: string;
  short_name: string;
}

export interface InstitutionResponseWithPager {
  message: string;
  status: string;
  institution: Institution;
  specialties: string[];
  titles: string[];
}