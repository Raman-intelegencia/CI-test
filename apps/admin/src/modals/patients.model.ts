export interface PatientSearchResponse {
    status: string;
    can_view_phi: boolean;
    results: PatientId[];
    patients: PatientRecord[];
  }
  
  export interface PatientId {
    patient_id: string;
  }
  
  export interface PatientRecord {
    id: string;
    iid: string;
    name_prefix: string;
    given_name: string;
    middle_name: string;
    last_name: string;
    name_suffix: string;
    dob: string;
    sex: string;
    pcm_enabled: string;
    associated_ou: string[];
    pid: string;
    time_created: string;
    time_updated: string;
    ssn: string;
    medicaid_id: string;
  }

  export interface PatientCSVRecord {
    pid: string | null;
    name_prefix: string | null;
    name_given: string | null;
    name_middle: string | null;
    name_family: string | null;
    name_suffix: string | null;
    dob: string | null;
    sex: string | null;
    pcm_enabled: string | null;
    associated_ou: string;
    time_created: string | null;
    time_updated: string | null;
  }
  
  export interface CreatePatientResponse {
    status: string;
    patient: Patient;
    message?:string;
}

export interface Patient {
    id: string;
    iid: string;
    name_prefix: string;
    given_name: string;
    middle_name: string;
    last_name: string;
    name_suffix: string;
    dob: string;
    sex: string;
    pcm_enabled: string;
    associated_ou: string[];
    pid: string;
    time_created: string;
    time_updated: string;
    ssn: string;
    medicaid_id: string;
    address?:PatientAddress
    primary_insurance?: PrimaryInsuranceDetails;
}

export interface PrimaryInsuranceDetails {
  company_name: string;
  end_date: string;
  plan_id: string;
  policy_number: string;
  start_date:string,
}
export interface PatientName {
  prefix: string;
  given: string;
  middle: string;
  family: string;
  suffix: string;
}

export interface PatientAddress {
  street_address: string;
  street_other: string;
  location: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface PrimaryInsurance {
  policy_number: string;
  policy_start_date: string;
  policy_end_date: string;
  plan_id ?:string,
  company_name ?:string,
}

export interface PatientData {
  iid: string;
  pid: string;
  name: PatientName;
  dob: string;
  sex: string;
  pcm_enabled: boolean;
  address: PatientAddress;
  medicaid_id: string;
  ssn: string;
  associated_ou: Array<{ id: string; short_name: string; name: string }>;
  primary_insurance: PrimaryInsurance;
}
export interface FilteredPatientData {
  iid?: string;
  pid?: string;
  name?: PatientName | undefined;
  dob?: string;
  sex?: string;
  pcm_enabled?: boolean;
  address?: PatientAddress | undefined;
  medicaid_id?: string;
  ssn?: string;
  associated_ou?: string[];
  primary_insurance?: PrimaryInsurance | undefined;
  new_pid?:string;
  a?: string;
}
