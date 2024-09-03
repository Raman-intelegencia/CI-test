export interface UserUpdateProfile {
  status: string;
  user: UsersData;
}

export interface UsersData {
  access_group_actions_map: access_group_actions_map_users_update_profile;
  admin?: string[];
  auto_schedule: string;
  cache_key: string;
  cell_phone: string;
  cellphone_verify: boolean;
  date_last_login: string[];
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
  num_bad_pins: number;
  phi_iids: string[];
  pin: string;
  profile: UsersProfile;
  properties: string[];
  sms_comm: boolean;
  status: {
    s: string;
    r: [];
    r_type: [];
    away_message_mode: string;
    is_signed_out: boolean;
    away_message: string;
    c?: {
      ref: string;
      type: string;
    };
  };
  _id: { $oid: string };
  flag_basic?: boolean;
  flag_managed?: boolean;
}

export interface access_group_actions_map_users_update_profile {
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
}

export interface UsersProfile {
  dept: string;
  iid: string;
  iname: string;
  ishort: string;
  pager_number: string;
  title: string;
}

export interface usersImage {
  status: string;
  image_id: string;
}

export interface settingsArrayStates
{
  filteredSpecialties: string[],
  filteredTitles: string[],
  showCurrentServiceTeam?: string[] ,
}

export interface ServiceTeam {
  tag?:string;
  description:string;
}

export interface getGroupList{
  status: string,
  groups: groupArrayData[]
}

export interface groupArrayData{
      edit?:boolean,
      id?:string;
        _id: {
            $oid: string
        }, 

        iid: string,
        user_id: {
            $oid: string
        },
        name: string,
        status: string,
        perms: [],
        time_created: {
            $date: number
        },
        time_updated: {
            $date: number
        },
        public: null,
        recipients: [
            { 
                _id: {
                    $oid: string
                },
                first_name: string,
                last_name: string,
                cell_phone: null,
                cellphone_verify: boolean,
                cellphone_verify_time: null,
                cellphone_reverify: boolean,
                email_comm: boolean,
                sms_comm: boolean,
                type: string,
                profile: {
                    dept: string,
                    iid: string,
                    title: string,
                    pager_number: string,
                    iname: string,
                    ishort: string
                },
                date_last_login: {
                  $date: 1695206354966
              },
              image_id: string,
              status: {
                  s: string,
                  is_signed_out: boolean
              },
              flag_active: boolean
          },
        ],
        is_writable: boolean,
        is_group_readable: boolean,
        user: {
            _id: {
                $oid: string
            },
            first_name: string,
            last_name: string,
            cell_phone: null,
            cellphone_verify: boolean,
            cellphone_verify_time: null,
            cellphone_reverify: boolean,
            email_comm: boolean,
            sms_comm: boolean,
            type: string,
            profile: {
                dept: string,
                iid: string,
                title: string,
                pager_number: string,
                iname: string,
                ishort: string
            },
            date_last_login: {
                $date: 1695206354966
            },
            image_id: string,
            status: {
                s: string,
                is_signed_out: boolean
            },
            flag_active: boolean
        },
        recipient_ids: 
            {
                $oid: string
            }[]
    }

    export interface updateUserInfoResponse {
      status: string
  }
