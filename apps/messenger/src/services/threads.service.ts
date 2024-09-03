import { ArchiveAllChatsResponse, CookieService,  GetArchiveResponse,  QuickMessagesPayload,  QuickMessagesResponse, StatusResponse, ThreadLoadResponse, ThreadPostBody, ThreadPostResponse } from '@amsconnect/shared';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@amsconnect/shared';
import { Observable, catchError, throwError } from 'rxjs';


let headers = new HttpHeaders()
.set("Accept",'application/json, text/javascript, */*; q=0.01')

@Injectable({
  providedIn: "root",
})
export class ThreadsService {
  public API_URL: string | undefined;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.API_URL = environment.baseUrl;
  }

  public archiveUnarchiveThreads(
    threadIds: string[],
    type: number
  ): Observable<any> {
    let headers = new HttpHeaders()
    .set("Accept", "application/json, text/javascript, */*; q=0.01")
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    let formData = new URLSearchParams();  
    const aCookieValue = this.cookieService.getCookie("a");
    formData.append("enabled", type.toString());
    threadIds.forEach((threadId) => {
      formData.append("thread", threadId);
    });
    if (aCookieValue) {
      formData.append("a", aCookieValue);
    }
    const body = formData.toString();
    return this.http
      .post(`${this.API_URL}/thread/archive`, body, {
        headers: headers,
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public loadMessageStatus(messageId: string): Observable<StatusResponse> {
    let userId = messageId ? encodeURIComponent(messageId) : "";
      // Perform HTTP GET request for get load message status
    return this.http.get<StatusResponse>(`${this.API_URL}/message/load_status/` + userId, {
        headers: headers,
        withCredentials: true, // Ensure credentials are included in the request
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public markMessageAsRead(threadId: string): Observable<any> {
    return this.http
      .get(`${this.API_URL}/message/mark_read/` + threadId, {
        headers: headers,
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public getThreadArchiveAllChats(
    threadId: string,
    timeUpdated: string
  ): Observable<GetArchiveResponse> {
    const queryParams = new HttpParams()
      .set("thread_id", threadId)
      .set("time_updated", timeUpdated);
    return this.http
      .get<GetArchiveResponse>(`${this.API_URL}/2019-07-01/thread/archive_all`, {
        params: queryParams,
        headers: headers,
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public threadArchiveAllChatThreads(
    threadId: string,
    timeUpdated: string
  ): Observable<ArchiveAllChatsResponse> {
    let headers = new HttpHeaders()
    .set("Accept", "application/json, text/javascript, */*; q=0.01")
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    let formData = new URLSearchParams();  
    formData.append("thread_id", threadId);
    formData.append("time_updated", timeUpdated);
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) {
      formData.append("a", aCookieValue);
    }
    const body = formData.toString();
    return this.http
      .post<ArchiveAllChatsResponse>(`${this.API_URL}/2019-07-01/thread/archive_all`, body, {
        headers: headers,
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public newThreadPost(threadId: string, threadBody: ThreadPostBody): Observable<ThreadPostResponse>{
      // Initialize the URL-encoded data string
      let data = `message=${encodeURIComponent(threadBody.message)}&urgent=${encodeURIComponent(threadBody.urgent.toString())}`;
      // Append attachment IDs if present
      if (threadBody.attachmentIds) {
          threadBody.attachmentIds.forEach((id: string) => {
              data += `&attachment_ids=${encodeURIComponent(id)}`;
          });
      }
      // Append cookie value if present
      const aCookieValue = this.cookieService.getCookie("a");
      if (aCookieValue) {
          data += `&a=${encodeURIComponent(aCookieValue)}`;
      }
     // Prepare headers
     const newHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/javascript, */*; q=0.01'
    });
    return this.http.post<ThreadPostResponse>(`${this.API_URL}/thread/post/${threadId}`, data, {
      headers: newHeaders,
      withCredentials: true,
    })
    .pipe(
      // Handle errors
      catchError((error) => {
        return throwError(error);
      })
    )

  }

  public getQuickMessage(time_updated?:number): Observable<QuickMessagesResponse> {
    // Construct query params only if time_updated is provided
  const params = time_updated !== undefined ? { params: new HttpParams().set('time_updated', time_updated.toString()) } : {};
  const newHeaders = new HttpHeaders({
    'Accept': 'application/json, text/javascript, */*; q=0.01'
  });
    return this.http
      .get<QuickMessagesResponse>(`${this.API_URL}/2015-09-01/client_data_set/get`, {
        headers: newHeaders,
        ...params,
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public updateQuickMessage(
    formData: QuickMessagesPayload
  ): Observable<QuickMessagesResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        'Accept': 'application/json, text/javascript, */*; q=0.01'
      }),
    };
    return this.http
      .post(`${this.API_URL}/client_data_set/save`, JSON.stringify(formData), {
        headers: httpOptions.headers,
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public EditQuickMessage(
    formData: QuickMessagesPayload
  ): Observable<QuickMessagesResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        'Accept': 'application/json, text/javascript, */*; q=0.01'
      }),
    };
    return this.http
      .post(`${this.API_URL}/client_data_set/save`, JSON.stringify(formData), {
        headers: httpOptions.headers,
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public DeleteQuickMessage(
    formData: QuickMessagesPayload
  ): Observable<QuickMessagesResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        'Accept': 'application/json, text/javascript, */*; q=0.01'
      }),
    };
    return this.http
      .post(`${this.API_URL}/client_data_set/save`, JSON.stringify(formData), {
        headers: httpOptions.headers,
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public getThreadMessages(threadId:string, seq?:number):Observable<ThreadLoadResponse>{
    const params = seq !== undefined ? { params: new HttpParams().set('seq', seq.toString()) } : {};
    const newHeaders = new HttpHeaders({
      'Accept': 'application/json, text/javascript, */*; q=0.01'
    });
    return this.http.get<ThreadLoadResponse>(`${this.API_URL}/thread/load/${threadId}`,{
      headers: newHeaders,
      ...params,
      withCredentials: true,
    })
    .pipe(
      // Handle errors
      catchError((error) => {
        return throwError(error);
      })
    );
  }
}