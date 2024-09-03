import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs/internal/Observable";
import { catchError } from "rxjs/internal/operators/catchError";
import { throwError } from "rxjs/internal/observable/throwError";
import { CookieService, CreateGroupResponse, UPDATE_USERS } from "@amsconnect/shared";
import { environment } from "libs/shared/src/lib/config/environment";

const headers = new HttpHeaders()
.set("Accept",'application/json, text/javascript, */*; q=0.01')

@Injectable({
  providedIn: "root",
})
export class ConversationSettingsService {
  public API_URL: string | undefined;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.API_URL = environment.baseUrl;
  }

  public leaveConversation(id: string): Observable<any> {
    let headers = new HttpHeaders()
    .set("Accept", "application/json, text/javascript, */*; q=0.01")
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    let formData = new URLSearchParams();
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) {
      formData.append("a", aCookieValue);
    }
    const body = formData.toString();
    return this.http
      .post(`${this.API_URL}/thread/leave/${id}`, body, {
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

  public archiveThread(id: string, enabledValue: string): Observable<any> {
    let headers = new HttpHeaders()
    .set("Accept", "application/json, text/javascript, */*; q=0.01")
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    let formData = new URLSearchParams();
    formData.append("enabled", enabledValue);
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) {
      formData.append("a", aCookieValue);
    }
    const body = formData.toString();
    return this.http
      .post(`${this.API_URL}/thread/archive/${id}`, body, {
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

  public muteThread(id: string, enabledValue: string): Observable<any> {
    let headers = new HttpHeaders()
    .set("Accept", "application/json, text/javascript, */*; q=0.01")
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    let formData = new URLSearchParams();
    formData.append("time_unmute", enabledValue);
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) {
      formData.append("a", aCookieValue);
    }
    const body = formData.toString();
    return this.http
      .post(`${this.API_URL}/thread/mute/${id}`, body, {
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

  public groupUpdate(formData: URLSearchParams): Observable<CreateGroupResponse> {    
    let headers = new HttpHeaders()
    .set("Accept", "application/json, text/javascript, */*; q=0.01")
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) {
      formData.append("a", aCookieValue);
    }
    const body = formData.toString();
    return this.http
      .post<CreateGroupResponse>(`${this.API_URL}/group/update`, body, {
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

  public groupCreate(formData:URLSearchParams): Observable<CreateGroupResponse> {
    let headers = new HttpHeaders()
    .set("Accept", "application/json, text/javascript, */*; q=0.01")
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) {
      formData.append("a", aCookieValue);
    }
    const body = formData.toString();
    return this.http
      .post<CreateGroupResponse>(`${this.API_URL}/group/create`, body, {
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

  public groupDelete(id?: string): Observable<{'status':string}> {
    let headers = new HttpHeaders()
    .set("Accept", "application/json, text/javascript, */*; q=0.01")
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    let formData = new URLSearchParams();
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) {
      formData.append("a", aCookieValue);
    }
    if(id){
      formData.append("id", id);
    }
    const body = formData.toString();
    return this.http
      .post<CreateGroupResponse>(`${this.API_URL}/group/delete`, body, {
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
  public profileSearch(includeR?:boolean,includeA?:boolean): Observable<any> {
    let queryParams = new HttpParams().set('s', 'recent');
    if (includeR) {
      queryParams = queryParams.set('r', 'on');
    }
  
    if (includeA) {
      queryParams = queryParams.set('a', 'on');
    }
    return this.http
      .get(`${this.API_URL}/profile/search3`, {
        headers: headers,
        withCredentials: true,
        params: queryParams,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public groupList(): Observable<CreateGroupResponse> {
    return this.http
      .get<CreateGroupResponse>(`${this.API_URL}/group/list`, {
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

  public threadUpdateUsers(id: string,recipientIds:Array<{$oid: string}>,groups?:string,roles?:string): Observable<UPDATE_USERS> {
    let headers = new HttpHeaders()
    .set("Accept", "application/json, text/javascript, */*; q=0.01")
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    let formData = new URLSearchParams();
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) {
      formData.append("a", aCookieValue);
    }
    if (groups) {
      formData.append("groups", groups);
    }
    if (roles) {
      formData.append("roles", roles);
    }
    // Use Set to remove duplicates and spread operator to convert back to array
  const uniqueRecipientIds = Array.from(new Set(recipientIds.map(recipientId => recipientId.$oid)));

  uniqueRecipientIds.forEach(uniqueRecipientId => {
    if (uniqueRecipientId) {
    formData.append("recipients", uniqueRecipientId);
    }
  });
  const body = formData.toString();
    return this.http
      .post<UPDATE_USERS>(`${this.API_URL}/thread/update_users/${id}`, body, {
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
}
