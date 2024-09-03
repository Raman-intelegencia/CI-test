export interface Job {
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
  summary: string;
  time_start: string;
  time_end: string;
  requestor: {
    id: string;
    name: string;
    uid: string;
    iid: string;
  };
  num_rows: number;
  num_rows_remaining: number;
  archive_url: string;
  receipt_url: string;
  values: Parameter[];
  time_remaining?: string;
  original_job_id: string;
  actions: BroadcastMessagingActionsResponse;
  progress:number;
}

export interface ApiJobResponse {
  before?: string;
  status: string;
  jobs: Job[];
  message?: string;
}
export interface ApiJobDetailResponse {
  status: string;
  job: Job;
  message?: string;
}

export enum JobState {
  Completed = 'completed',
  Running = 'running',
  Pending = 'pending',
  Failed = 'failed',
  Rerun = 'rerun',
  Aborted = 'aborted',
  Processing = 'processing',
  New = 'new',
}

export interface Parameter {
  [key: string]: string | string[];
}

export interface FormDataInterface {
  force_download: boolean;
  inline: boolean;
  a: string;
  'X-cureatr-user': string;
}


export interface BroadcastMessagingResponse {
  status: string;
  summary: BroadcastMessagingSummaryResponse;
}

export interface BroadcastMessagingSummaryResponse {
  read: number;
  unread: number;
}

export interface BroadcastMessagingActionsResponse {
  details: string;
  summary: string
}