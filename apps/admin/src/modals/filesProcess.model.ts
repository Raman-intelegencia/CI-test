export interface FileProcessProcessorResponse {
  status:string;
  dropboxes:DropboxesData[];
}

export interface ViewFileProcessProcessorResponse {
  status:string;
  dropbox:DropboxesData;
}

export interface DropboxesData{
  id: string;
  type: string;
  url: string;
  interval: number;
  next_poll: string;
  allowed_errors: number;
  iid: string;
  email_admins: boolean;
  notification_emails: [];
  processors:ProcessorsData[];
}

export interface ProcessorsData{
    name:string;
    type: string;
    patterns: [];
}


export interface AdtProcessorSubjectData{
  urlRoute:string;
  cancelRoute:string;
}

export interface AddViewEditProcessingAdtProcessorData{
  id?:string;
  type:string;
  url:string;
  iid?:string;
  notification_emails?:Array<string>;
  email_admins:string;
  interval?:string;
}

export interface FileDetails {
  type: string;
  filename: string;
  last_modified: string;
  mimetype: string;
  size: number;
  created_by: {
      id: string;
      name:string;
      type: string;
  };
  modified_by: {
      id: string;
      name:string;
      type: string;
  };
}

export interface FileResponse {
  status: string;
  permissions: string;
  file: FileDetails;
}
export interface Editprocessor {
  id?: string;
  type: string;
  url: string;
  interval: number;
  allowed_errors: number;
  iid: string;
  email_admins: boolean;
  notification_emails?: string[];
  a: string;
}

