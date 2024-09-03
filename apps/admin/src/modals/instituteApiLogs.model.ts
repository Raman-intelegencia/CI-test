export interface InstitutionsAPILogsDataResponse {
    logs:LogsData[];
    results_limited:boolean;
    status: string;
}


export interface LogsData {
  id: string;
  time_created: string;
  request_duration: string;
  user_id: string;
  remote_ip: string;
  url: string;
  request_content_type: string;
  request_method: string;
  request_length: string;
  response_content_type: string;
  response_length: string;
  response_code: string;
  exception: string;
  request_body: string;
}