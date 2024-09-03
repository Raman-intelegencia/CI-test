export interface CreateInstitutionResponse {
    status: string;
    institution: Institution;
    message?: string
}

export interface Institution {
    isDndEnable?: any;
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
    default_macros?:string[]
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

export interface CheckboxOption {
    label: string;
    valid: boolean;
    values?:string
}
export interface WowoFeaturesData {
    [key: string]: {
        valid: boolean,
        availability: string,
        description: string,
    };
}
export interface Institute {
    name: string;
    id: string; 
    short_name: string;
    parent_iid?: string;
    is_locked: boolean;    
}

export interface RolesData {
    status: string;
    roles: string[];
    users: string[];
    active_roles: string[];
    role_pagers: RolePager[];
  }
    
  export interface RolePager {
    role: string;
    pager_number?: string;

}

export interface InstitutionResponse {
    message: string;
    status: string;
    institution: Institution;
    specialties: string[];
    titles: string[];
}

export interface InstitutionRole{
  _id: string,
  description:string,
  iid:string,
  role_type:string
  time_updated:{
      $date: number;
  };
}
  export interface Processor {
    name: string;
    metadata: ProcessorMetadata;
  }
 export interface BroadcastMessagingValues {
    subject?: {
      type: string;
      name: string;
      label: string;
      msg: string;
      order: number;
      optional?: boolean;
    };
    sender?: {
      type: string;
      name: string;
      label: string;
      hint: string;
      msg: string;
      order: number;
      optional?: boolean;
    };
    message: {
      type: string;
      name: string;
      label: string;
      hint: string;
      msg: string;
      order: number;
    };
    urgent?: {
      type: string;
      name: string;
      label: string;
      msg: string;
      order: number;
      optional?: boolean;
    };
  }
  
  interface MacrosModifyValues {
    add: {
      type: string;
      name: string;
      label: string;
      msg: string;
      order: number;
      values: {
        messages: {
          type: string;
          name: string;
          label: string;
          order: number;
          optional?: boolean;
          item_type: {
            type: string;
            name: string;
          };
        };
        prepend?: {
          type: string;
          name: string;
          label: string;
          hint: string[];
          order: number;
          optional?: boolean;
        };
      };
    };
    remove: {
      type: string;
      name: string;
      label: string;
      msg: string;
      order: number;
      values: {
        messages: {
          type: string;
          name: string;
          label: string;
          optional?: boolean;
          item_type: {
            type: string;
            name: string;
          };
        };
      };
    };
  }
  export interface ProcessorMetadata {
    type: string;
    values: BroadcastMessagingValues;
  }  
  interface ProcessorsData {
    status: string;
    processors: Processor[];
  }
  export  interface Subject {
    type: string;
    name: string;
    label: string;
    msg: string;
    order: number;
    optional?: boolean;
  }
  export  interface Sender {
    type: string;
    name: string;
    label: string;
    hint: string;
    msg: string;
    order: number;
    optional?: boolean;
  }
  
  export  interface Message {
    type: string;
    name: string;
    label: string;
    hint: string;
    msg: string;
    order: number;
  }
  
  export  interface Urgent {
    type: string;
    name: string;
    label: string;
    msg: string;
    order: number;
    optional?: boolean;
  }  
  export interface Add {
    type: string;
    name: string;
    label: string;
    msg: string;
    order: number;
    values: {
      messages: {
        type: string;
        name: string;
        label: string;
        order: number;
        optional?: boolean;
        item_type: {
          type: string;
          name: string;
        };
      };
      prepend: {
        type: string;
        name: string;
        label: string;
        hint: string[];
        order: number;
        optional?: boolean;
      };
    };
  }
    export interface Remove {
    type: string;
    name: string;
    label: string;
    msg: string;
    order: number;
    values: {
      messages: {
        type: string;
        name: string;
        label: string;
        optional?: boolean;
        item_type: {
          type: string;
          name: string;
        };
      };
    };
  }

  export interface RootObject {
    status: string;
    processors: Processor[];
  }
export interface SpecialtiesAndTitles {
  specialties: string[];
  titles: string[];
}

export interface RootObjectInstitutions {
  status: string;
  institutions: Institution[];
  specialties: string[];
  titles: string[];
}

export interface Role {
  _id: string;
  iid: string;
  role_type: string;
  description: string;
  time_updated: string;
}
export interface RootObjectRoles {
  status: string;
  roles: Role[];
}
export interface ValuesData {
  subject: string;
  sender?: string;
  message: string;
  urgent: boolean;
}

export interface ProcessorData {
  processor: string;
  users: Users;
  values: ValuesData;
  commit: boolean;
}
export interface Users {
  ou: string[];
  specialty: string[];
  title: string[];
  service: string[];
}
export interface PreviwUserRequestData {
  processor: string;
  users: Users;
}

export interface InstitueRoles {
  _id: string;
  iid: string;
  role_type: string;
  description: string;
  time_updated: string;
  tag?:string;
}

export interface InstitueRole {
  description: string;
  tag?: string | undefined; // Adjust tag to allow undefined values
  role_type: string;
}

export interface InstitueRolesData {
  status: string;
  roles: InstitueRoles[];
  message?:string
}
export interface QuickMessageApiResponse {
  status: string;
  job: string;
}
export interface QuickMessageData {
  processor: string;
  users: Users;
  values: MessageData;
  commit: boolean;
}
export interface MessageData {
  add: AddQuickMessages;
  remove: RemoveQuickMessages;
}
export interface AddQuickMessages{
  messages:string[],
  prepend:boolean
}
export interface RemoveQuickMessages{
  messages:string[],
  prepend:boolean
}
export interface Report {
  id: string;
  report_name: string;
  has_phi: boolean;
  can_obscure_phi: boolean;
  can_run_monthly: boolean;
  can_run_daily: boolean;
  can_run_weekly: boolean;
  can_run_by_child_ou: boolean;
}
export interface ReportsResponse {
  status: string;
  reports: Report[];
}

export interface InstitueReportsRequest {
  date_to: string;
  date_from: string;
  report_id: string;
  tags?: string[];
  thread_id?:string;
  message_id?:string;
  services?: Record<string, unknown>;
  iids: string | string [];
  obscure_phi?:string;
  show_results_by_child_ou?:string;
  results_daily?:string;
  results_weekly?:string;
  results_monthly?:string;
  no_phi_ok?:boolean;
  exclude_locked_user?: string;
}
export interface InstitueReportsResponse {
  status: string;
  message?:string;
  job: {
    id: string;
    processor: string;
    type: string;
    state: string;
    dropbox: string;
    can_access_dropbox: boolean;
    filename: string;
    time_created: string;
    has_phi: boolean;
    can_admin: boolean;
    browser_viewable: boolean;
    allowed_states: string[];
    last_row_processed: number;
    iid: string;
    values: [string, string][];
    requestor: {
      id: string;
      name: string;
      uid: string;
      iid: string;
    };
  };
  missing_phi?: string[];
}

export interface VendorCredentialsResponse {
    success?: boolean;
    message?: string;
    companyKey?: string;
    companyName?: string;
}