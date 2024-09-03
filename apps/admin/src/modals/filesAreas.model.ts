import { DropboxesData } from "./filesProcess.model"

export interface FileAreasResponse {
  permissions:string,
  status:string,
  files:filesData[],
  users:ListUsersPermissionData[]
}

export interface filesData{
  type: string,
  filename: string,
  last_modified: string,
  mimetype: string
  size?: any
}

export interface ListUsersPermissionData{
  user: string,
  actions?: [],
  path: string
}

export interface DeleteFileAreaData{
  fileareas?: [],
  status?: string
}

export interface RenameFileAreaData{
  status?: string
}

export interface CreateNewFileDirectoryBucket{
  fileareas:[]
  status: string
}


export interface FileAreasDataDirectory{
  status: string;
  fileareas:fileAreasInterfaceData[];
  top_level_permissions:string
  filearea_users:fileAreasUsersInterfaceData[]
}

export interface fileAreasInterfaceData{
  name: string,
  permissions: string,
  dropboxes: DropboxesData[],
}

export interface fileAreasUsersInterfaceData{
  user_grants?:fileAreasUserGrantsInterfaceData[],
  user_proj:fileAreasUserProjInterfaceData
}

export interface fileAreasUsersGrantsProjInterfaceData{
  user_grants?:Array<fileAreasUserGrantsInterfaceData>,
  user_proj:fileAreasUserProjInterfaceData
}

export interface fileAreasUserGrantsInterfaceData{
  user: string,
  actions: any,
  path: string
}
export interface fileAreasUserProjProfileInterfaceData{
    dept: string,
    iid: string,
    title: string,
    pager_number: string,
    iname: string,
    ishort: string
}

export interface fileAreasUserStatusInterfaceData{
  s: string,
  is_signed_out: false
}

export interface fileAreasUserUIDInterfaceData{
  id: string,
  iid: string
}

export interface fileAreasUserLegalAgreementInterfaceData{
  document: string,
  iid:string,
  version: string,
  is_complete: boolean
}

export interface fileAreasUserProjInterfaceData{
  _id: string,
  first_name: string,
  last_name: string,
  cell_phone: string,
  cellphone_verify: boolean,
  cellphone_verify_time: string,
  cellphone_reverify: boolean,
  popup_msg_last_date: string,
  email_comm: boolean,
  sms_comm: boolean,
  first_dnd_popup_time: string,
  type: string,
  profile:fileAreasUserProjProfileInterfaceData
  date_last_login: string
  image_id:string,
  status: fileAreasUserStatusInterfaceData,
  flag_active: boolean,
  email: string,
  journal_id: number,
  has_password: boolean,
  is_temp_password: boolean,
  is_initial_password: boolean,
  admin: [],
  phi_iids: [],
  properties: {}
  auto_schedule: string,
  inst_migrating: boolean,
  uid: fileAreasUserUIDInterfaceData
  has_pin: boolean,
  num_good_logins: number,
  num_bad_logins: number,
  time_created: string,
  site: {},
  can_send_activation_email: boolean,
  wowos: {},
  legal_agreement: fileAreasUserLegalAgreementInterfaceData,
  time_last_login: string,
  time_password_set: string,
  notification_token: string
}