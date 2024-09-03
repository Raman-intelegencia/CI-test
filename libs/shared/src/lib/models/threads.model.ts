import { ProfileReference, Reference } from "@amsconnect/shared";

export interface Configurations {
        config_attachments_url: string;
        config_limit_messages_per_thread: string;
        config_limit_threads: string;
        config_profileimage_url: string;
        do_agreement: {
            document: string;
            iid: string;
            version: string;
        };
        timeout_seconds: number;
        client_permissions: {
          patient_search_all: boolean;
          sso: boolean;
          force_app_pin: boolean;
          pager_integration: boolean;
          is_cellphone_verification_enabled: boolean;
          force_90_day_password_reset: boolean;
          disable_standard_tos: boolean;
          camera_disabled: boolean;
          dnd_override: boolean;
          redshift_available: boolean;
          message_content_notifications: boolean;
          patient_create: boolean;
          sso_shared_authentication: boolean;
          email_text_automated: boolean;
          other_attachments_disabled: boolean;
          audio_attachments_disabled: boolean;
          role: boolean;
          camera_roll_disabled: boolean;
          external_messaging: boolean;
          inactivity_emails_disabled: boolean;
          patient_centric_messaging: boolean;
          message_sending_disabled: boolean;
          override_broadcast_messages: boolean;
          override_pager_integration: boolean;
          override_peer_to_peer: boolean;
          cellphone_verification: boolean;
          filearea_admin: boolean;
          sso_only: boolean;
    };
   
}
export interface Profiles {
    _id: {
        $oid: string;
    };
    cell_phone?: string | null;
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
        away_message_mode?: string;
        r?: [];
        c?: {
          ref: string;
          type: string;
        };
        away_message?: string;
        integrated_st_tag?:Integrated[]
        
    };
    type: string;
    flag_active?: boolean;
    id?: string;
    data?: {
        _id: {
            $oid: string;
        };
        iid?: string;
        name?:string;
        description?: string;
        role_type?: string;
        time_updated?: {
            $date: number;
        };
        user_ids?: { $oid: string }[];
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
            c?: {
                ref: string;
                type: string;
              };
        };
        perms?:[];
        type: string;
    };
    matchedProfiles?:ProfileReference[];
}

export interface Threads {
    _id: {
        $oid: string;
    };
    iid: string;
    messages: Message[];
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
    receivers: Array<{ name: string }>;
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
    patient_name: string;
    patient: {
        id: { $oid: string };
        name: string;
    };
    visibility?: boolean;
    muted?: boolean;
    isOlderThread: boolean;
}

export interface Integrated {
    description: string
    tag:string
}
export interface Message {
    attachments?: Attachment[];
    attachment_ids?: AttachmentsIds[];
    _id: {
        $oid: string;
    };
    content: string;
    iid: string;
    seq: number;
    status: string;
    statuses: MessageStatus[];
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
    urgent?: boolean;
}

export interface MessageStatus {
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

export interface Users {
    _id: {
        $oid: string;
    };
    access_group_actions_map: {
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
    };
    admin: {
        iid: string;
        iname: string;
    }[];
    auto_schedule: string;
    cache_key: string;
    cell_phone: string;
    cellphone_verify: boolean;
    cellphone_reverify: boolean;
    cellphone_verify_time: null;
    date_last_login: {
        $date: number;
    };
    email: string;
    first_name: string;
    flag_active?: boolean;
    flag_managed?: boolean;
    has_password: boolean;
    image_id: string;
    inst_migrating: boolean;
    is_initial_password: boolean;
    is_temp_password: boolean;
    journal_id: number;
    last_name: string;
    profile: {
        dept: string;
        iid: string;
        iname: string;
        ishort: string;
        title: string;
        pager_number: string;
    };
    status: {
        s: string;
        r: [];
        r_type: [];
        away_message_mode: string;
        is_signed_out: boolean;
        away_message?: string;
        role_notify?: Role_Notify[];
        c?: {
            ref: string;
            type: string;
        };
        integrated_st_tag?:Integrated[]
    };
    type: string;
    properties: {
        seen_coach_mark_hint_archive_all: number;
        seen_coach_mark_scheduling_checkbox: number;
        seen_coach_mark_mypatients_add: number;
        inbox_sort: string;
        pref_mute_pager: number;
    };
    phi_iids?: { iid: string; iname: string }[];
}

export interface Role_Notify {
    uid: {
        $oid: string;
    };
    stype: [];
    sname: [];
    date: {
        $date: number;
    };
    c?: {
        ref: string;
        type: string;
    };
    event: string;
    first_name: string;
    last_name: string;
    admin_first_name: string;
    admin_last_name: string;
}
export interface loadLatestMessage {
    config: Configurations;
    counters: {
        msg: number;
    };
    counters_unread: {
        msg: number;
    };
    entries: any[];
    flush_local: number;
    max_journal_id: number;
    profiles: Profiles[];
    status: string;
    integrated_st_tag?:Integrated[]
    threads: Threads[];
    user: Users;
    counter_tally?: number;
    error?:string;
}

export interface loadOlderMessage {
    entries: any[];
    profiles: Profiles[];
    status: string;
    threads: Threads[];
}

export interface ThreadProfile {
    profile: Profiles[];
    thread: Threads;
    userProfile: Profiles | undefined;
    sender_profile: Profiles | undefined;
}

export interface ProfileThread {
    profile: Profiles;
    thread: Threads;
}

export interface addRecipientData {
    usersDataList: Reference[];
    selectedUsers: Reference[];
}
export interface QuickMessagesPayload {
    a?: string;
    macros?: Macros[];
}
export interface Macros {
    body: string;
    id: string;
    edit?: boolean;
}
export interface QuickMessagesResponse {
    status?: string;
    macros?: Macros[];
    titles?: any[];
    specialties?: any[];
    time_updated?: number;
    refresh_period?: number;
}

export interface GetArchiveResponse {
    status: string;
    archivable_count: number;
}

export interface ArchiveAllChatsResponse {
    status: string;
    is_async: boolean;
    archived: number;
    counters: Counter;
    counters_unread: Counter;
}

interface Counter {
    msg: number;
}

export interface EnableNotifications {
    status?: string;
}

interface OID {
    $oid: string;
}

interface DateObj {
    $date: number;
}

interface UserStatus {
    s: string;
    role_notify: Role_Notify[];
    r: string[];
    r_type: string[];
    away_message_mode: string;
    integrated_st_tag?:Integrated[]
    is_signed_out: boolean;
}

export interface StatusItem {
    _id: OID;
    status: string;
    user_id: OID;
    user_status?: UserStatus; // Optional as it doesn't appear in all objects
    time_read?: DateObj; // Optional as it doesn't appear in all objects
}

export interface StatusResponse {
    status: string;
    statuses: StatusItem[];
}

export interface ThreadMessageData {
    first_name: string;
    last_name: string;
    image_id: string;
    user_id: string;
    type: string;
    message_id: string;
    content: string;
    iid: string;
    status: string;
    thread_id: string;
    time_created: number; // Assuming this is a string-formatted date
    user_status: string; // Assuming 's' is a string
    attachments: Attachment[];
    urgent?: boolean;
    isFirstMessageOfDay?:boolean;
    isLastMessageOfDay?:boolean;
    threadType?:string,
    isTemporary?: boolean,
    seq?: number
}

export interface Attachment {
    _id: {
        $oid: string;
    };
    iid: string;
    message_id: {
        $oid: string;
    };
    mime_type: string;
    preview: boolean;
    size: number;
    status: string;
    time_attached: {
        $date: number;
    };
    time_created: {
        $date: number;
    };
    time_saved: {
        $date: number;
    };
    time_updated: {
        $date: number;
    };
    user_id: {
        $oid: string;
    };
    name: string;
}

export interface AttachmentsIds {
    $oid: string;
}

export interface ThreadPostResponse {
    status: string;
    message: {
        _id: {
            $oid: string;
        };
        iid: string;
        seq: number;
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
        content: string;
        status: string;
        statuses: [
            {
                _id: {
                    $oid: string;
                };
                status: string;
                user_id: {
                    $oid: string;
                };
                time_read?: {
                    $date: number;
                };
            },
        ];
    };
}

export interface ThreadPostBody {
    message: string;
    urgent: boolean;
    attachmentIds: string[];
}

export interface SyncMessage {
    sender_id: string;
    sender_name: string;
    thread_id: string;
    urgent?: boolean;
    is_muted?: boolean;
    type: string;
    counters?: {
        msg: number;
    };
    counters_unread?: {
        msg: number;
    };
}

export interface ThreadLoadResponse {
    profiles: Profiles[],
    status: string,
    thread: Threads[]
}