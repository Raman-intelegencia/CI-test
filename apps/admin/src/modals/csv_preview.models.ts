export interface csvPreviewBatchInterfaceData{
    existing_users:UsersCsvPreviewInterfaceData[],
    status:string;
    job_id:string;
    new_users:UsersCsvPreviewInterfaceData[];
}
export interface UsersCsvPreviewInterfaceData{
    user_id:string,
    first_name: string,
    last_name: string,
    primary_ou: string,
    associated_ou: string,
    email: string,
    title: string,
    specialty: string,
    location: string,
    location_detail:string,
    city: string,
    state: string,
    zip_code: string,
    reporting_tags: string,
    basic: string,
    app_platform: string,
    app_version: string,
    account_status: string,
    managed: string,
    has_password: string,
    has_pin: string,
    time_created: string,
    time_first_login: string,
    time_last_login: string,
    last_login_method: string,
    time_last_activity: string,
    legal_agreement: string,
    latest_agreement_version: string,
    acceptance_date: string,
    admin_permissions: string,
    features: string,
    services: string,
    bounced_emails: string,
    status: string,
    status_message: string,
    cellphone: string,
    pager_number: string
}

export interface CSVJobIDPreviewResponseData{
    archive_url:[];
    browser_viewable:boolean;
    can_access_dropbox: boolean;
    can_admin:boolean;
    dropbox:string;
    filename:string;
    has_phi:boolean;
    id:string;
    iid:string;
    last_row_processed:2
    num_rows:3
    num_rows_remaining:1
    processor:string;
    receipt_url:string;
    state:string;
    summary:string;
    time_created:string;
    time_end:string;
    time_start:string;
    type:string;
    requestor:requestorInterfaceData
}

export interface requestorInterfaceData{
    id:string;
    iid:string;
    name:string;
    uid:string;
}

export interface batchPreviewResponseData{
    job:CSVJobIDPreviewResponseData
    status:string
}