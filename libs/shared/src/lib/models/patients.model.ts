import { Profiles } from "./threads.model";

export interface PatientDetails {
  id: string;
  name: string;
  pid: string;
  dob: string;
  sex: string;
  is_watched?: boolean;
}

export interface PatientSearchResult {
  id: string;
  matches: {
    name: [number, number][];
  };
}

export interface PatientsResponse {
  status: string;
  patients: PatientDetails[];
  match_tokens: string[];
  results: PatientSearchResult[];
}

export interface PatientLabelAnnotation {
  value: string;
}

export interface PatientFieldValue {
  label: string;
  value: string | string[]; // Value can be a string or an array of strings
  render?: string; // Optional property
}

export interface PatientField {
  label: string;
  value: PatientFieldValue[];
  render?: string;
  label_annotation?: PatientLabelAnnotation;
}

export interface PatientDataInfo {
  id: string;
  name: string;
  fields: PatientField[];
}

export interface PatientDetailsResponse {
  status: string;
  patient: PatientDataInfo;
}

export interface PatientInfo {
  institution: string;
  id_number: string;
  name: string;
  dob: string;
  sex: string;
  address: string;
}

export interface Status {
  _id: string;
  message_id: string;
  status: string;
  time_read?: string;
  user_id: string;
}

export interface MessageInfo {
  _id: string;
  iid: string;
  seq: number;
  thread_id: string;
  time_created: string;
  type: string;
  user_id: string;
  content: string;
  status: string;
  statuses: Status[];
  urgent?: boolean;
}

export interface PatientData {
  id: string;
  name: string;
}

export interface Thread {
  _id: string;
  iid: string;
  origin: string;
  seq: number;
  time_created: string;
  type: string;
  user_id: string;
  subject: string;
  messages: MessageInfo[];
  unread_count: number;
  time_updated: string;
  recipients: string[];
  receivers: { name: string; }[]|undefined;
 
  patient_name: string;
  patient: PatientData;
  visibility:boolean
}

export interface RoleNotify {
  uid: string;
  stype: string[];
  sname: string[];
  date: string;
  event: string;
  first_name: string;
  last_name: string;
  admin_first_name: string;
  admin_last_name: string;
}

export interface ProfileStatus {
  s?: string;
  role_notify?: RoleNotify[];
  r: string[];
  r_type: string[];
  away_message_mode: string;
  is_signed_out: boolean;
  c?: {
    ref: string;
    type: string;
  };
  away_message?: string;
}

export interface UserProfileInfo {
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
  profile: {
    dept?: string;
    iid: string;
    title?: string;
    pager_number: string;
    iname: string;
    ishort: string;
  };
  date_last_login?: string;
  image_id: string;
  status: ProfileStatus;
  flag_active: boolean;
}

export interface PatientThreadResponse {
  status: string;
  threads: Thread[];
  profiles: UserProfileInfo[]; 
}

export interface ExtractedThreadDetail {
  thread_id: string;
  latest_message: MessageInfo;
  matched_profiles: UserProfileInfo[];
  latest_message_profile: UserProfileInfo | undefined;
  receivers: { name: string; }[]|undefined;
  patient_name: string;
  subject?: string;
  sender_profile: any;
  time_updated: string;
   visibility?:boolean
}

export interface PatientLabelAnnotation {
  value: string;
}

export interface PatientFieldValue {
  label: string;
  value: string | string[]; // Value can be a string or an array of strings
  render?: string; // Optional property
}

export interface PatientField {
  label: string;
  value: PatientFieldValue[];
  render?: string;
  label_annotation?: PatientLabelAnnotation;
}

export interface PatientDataInfo {
  id: string;
  name: string;
  fields: PatientField[];
}

export interface PatientDetailsResponse {
  status: string;
  patient: PatientDataInfo;
}

export interface PatientInfo {
  institution: string;
  id_number: string;
  name: string;
  dob: string;
  sex: string;
  address: string;
}

export interface Status {
  _id: string;
  message_id: string;
  status: string;
  time_read?: string;
  user_id: string;
}

export interface MessageInfo {
  _id: string;
  iid: string;
  seq: number;
  thread_id: string;
  time_created: string;
  type: string;
  user_id: string;
  content: string;
  status: string;
  statuses: Status[];
  urgent?: boolean;
}

export interface PatientData {
  id: string;
  name: string;
}

export interface Thread {
  _id: string;
  iid: string;
  origin: string;
  seq: number;
  time_created: string;
  type: string;
  user_id: string;
  subject: string;
  messages: MessageInfo[];
  unread_count: number;
  time_updated: string;
  recipients: string[]; 
  sender_profile?: any;
  patient_name: string;
  patient: PatientData;
}

export interface RoleNotify {
  uid: string;
  stype: string[];
  sname: string[];
  date: string;
  event: string;
  first_name: string;
  last_name: string;
  admin_first_name: string;
  admin_last_name: string;
}

export interface ProfileStatus {
  s?: string;
  role_notify?: RoleNotify[];
  r: string[];
  r_type: string[];
  away_message_mode: string;
  is_signed_out: boolean;
  c?: {
    ref: string;
    type: string;
  };
  away_message?: string;
}

export interface UserProfileInfo {
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
  profile: {
    dept?: string;
    iid: string;
    title?: string;
    pager_number: string;
    iname: string;
    ishort: string;
  };
  date_last_login?: string;
  image_id: string;
  status: ProfileStatus;
  flag_active: boolean;
}

export interface PatientThreadResponse {
  status: string;
  threads: Thread[];
  profiles: UserProfileInfo[];
}

export interface ExtractedThreadDetail {
  thread_id: string;
  latest_message: MessageInfo;
  matched_profiles: UserProfileInfo[];
  latest_message_profile: UserProfileInfo | undefined;
  patient_name: string;
  subject?: string;
  time_updated: string;
}

export interface PatientAddress{
    zip: string
}

export interface PatientName {
    given:string;
    family: string;
  
}
export interface PatientPayload{
  id?: string;
  name?: PatientName;
  pid ?: string;
  dob?: string;
  sex?: string;
  address?: PatientAddress;
  a?:string;
}

export interface PatientDataDetail{
  status?: string;
    patient?: {
      id: string;
      name: PatientName;
      pid ?: string;
      dob: string;
      sex: string;
      address: PatientAddress;
    }
    message?: string;
    error?:string
  
}
