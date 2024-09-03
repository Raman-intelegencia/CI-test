export interface UserChildOUsConfigJson{
    iid: string; 
    processor: string;
    values?: {
      send_email?: boolean;
      managed?: boolean;
    };
  }
  export interface JobData {
    id: string;
    processor: string;
    type: string;
    state: string;
    allowed_states: string[];
    archive_url: string;
    browser_viewable: boolean;
    can_access_dropbox: boolean;
    can_admin: boolean;
    dropbox: string;
    filename: string;
    has_phi: boolean;
    iid: string;
    last_row_processed: number;
    num_rows: number;
    num_rows_remaining: number;
    receipt_url: string;
    requestor: {
        id: string;
        name: string;
        uid: string;
    };
    summary: string;
    time_created: string;
    time_end: string;
    time_start: string;
    status: string;
    message:string
  }

  export interface JobResponse {
    status: string;
    job: JobData;
  }
  
  export interface downloadUserJson{
    iid: string,
    report_type: string,
    show_child: string
  }

  export enum ActiveStatus {
    configureUser = 'configureUser',
    ChildOUs = 'ChildOUs',
    patients = 'patients',
    scheduledIntegration = 'scheduledIntegration',
    emailSettings = 'emailSettings',
    ssoNew = 'ssoNew',
    ssoPrimary = 'ssoPrimary',
  }

  export interface Property  {
    valid: boolean;
    availability: string;
    description: string;
    message?: string;
    newkey?: string;
};
 export interface filterSelectedArray {
    [key: string]: Property;
};

 export interface toggleInstituteLock{
  instituteId: string; 
  json: string; 
}
export interface editInstituteName {
  id: string; 
  short_name: string;
  name: string; 
}; 
export interface updateFeature {
  instituteId: string; 
  json: {
    value?: string;
    wowos?: (string | undefined)[];
  };
}

export interface FilteredDataMassage  {
  valid: boolean;
  availability: string;
  description: string;
  message?: string;
  newkey?: string;
  key?: string;
  index?: number;
  is_sso_enabled?: boolean;
  institution_id?: string 
};


export interface overideModelInterface {
  description?:string
  key:string
  label?:string
  valid?:boolean
  values?:string
}

export interface commonOverideFilteredDataModelInterface {
  description?:string;
  availability?: string;
  valid?:boolean;
  key?:string;
  label?:string;
  values?:string;
  message?: string;
  newkey?: string;
  index?: number;
}
export interface checkBoxArrayData {
  availability?: string;
  description?: string;
  key?: string;
  newkey?: string;
  valid?: boolean;
  index?: number;
} 


 export interface CheckboxOption {
  label: string;
  valid: boolean;
  values?: string;
}
