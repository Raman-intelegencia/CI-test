// This service is responsible for making HTTP requests related to user data
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs/internal/observable/throwError';
import {  UpdatePagerResponse, UserEventLogResponse, UserInfoUpdateResponse, UserSearchByIdResponse, UserSearchResponse, passwordResetGeneratePassword, sendActivationMail, sendNotification } from '../modals/users.model';
import { CookieService, SettingsService, usersImage } from '@amsconnect/shared';
import { UserUpdateTag, createApiUser, createUser } from '../models/create-user.model';
import { environment } from 'libs/shared/src/lib/config/environment';

// Create headers and set content type to multipart/form-data
const headers = new HttpHeaders();
headers.append('Content-Type', 'multipart/form-data');

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  public API_URL: string | undefined;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,private settingsService:SettingsService) {
      this.API_URL = environment.baseUrl;}

  // Retrieve user events with user ID and limit
  public getUserEvents(userId: string, limits: number): Observable<UserEventLogResponse> {
    const aCookieValue = this.cookieService.getCookie('a');

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("limit", limits.toString());

    if(aCookieValue){
      formData.append('a', aCookieValue);
    }

    // Make the HTTP request to get a user's events
    return this.http.post<UserEventLogResponse>(`${this.API_URL}/admin/events`, formData, { 
      headers: headers,
      withCredentials:true 
    })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      )
  }

  // Search for user events
  public searchUserEvents(userId:string, fromDate:number, toDate:number, limit:number, eventType?:string, lastEventLogId?:string): Observable<UserEventLogResponse> {
    const aCookieValue = this.cookieService.getCookie('a');
    const formData = new FormData();

    formData.append('date_from', fromDate.toString());
    formData.append('date_to', toDate.toString());
    formData.append('user_id', userId);
    formData.append('limit', limit.toString());
    if(eventType){
      formData.append('event_types', eventType);
    }
    if(aCookieValue){
      formData.append('a', aCookieValue);
    }
    if(lastEventLogId){
      formData.append('before_id', lastEventLogId);
    }
    // Make the HTTP request to search user's events
    return this.http.post<UserEventLogResponse>(`${this.API_URL}/admin/events`, formData, {
       headers: headers, 
       withCredentials:true 
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

// Retrieve user audit logs
public getAuditUserLogs(auditUserObj: FormData, responseType: 'blob' | 'text' = 'blob'): Observable<Blob | string> {
  const options = {
    headers: headers,
    withCredentials: true,
    responseType: responseType as 'json' // Cast to 'json' for TypeScript, Angular will handle it correctly at runtime
  };

  return this.http.post<Blob | string>(`${this.API_URL}/admin/audit_log`, auditUserObj, options).pipe(
    catchError((error) => {
      return throwError(error);
    })
  );
}

  // Retrieve API logs
  public getApiLogs(apiLogObj: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/admin/api_log`, apiLogObj, { headers: headers }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  public createUserAccount(accountData: FormData): Observable<createUser> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    // split the 'a' token to get user ID
    const extractedUserId = aCookieValue?.split("|")[1];
    const userId = extractedUserId ? extractedUserId : "";
    const exractedCsrfToken = this.cookieService.getCookie("csrf_token");
    const csrfToken = exractedCsrfToken ? exractedCsrfToken : "";
    // Initialize headers with default values
    let headers = new HttpHeaders();
    // Make sure userId is not empty before adding X-cureatr-user header
    if(csrfToken){
      headers = headers.set('X-CSRF-Token', csrfToken);
    }
    return this.http.post<createUser>(`${this.API_URL}/admin/user_create`, accountData, {
      headers: headers,
    withCredentials: true,
     }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  public userUpdateTag(accountData: FormData): Observable<UserUpdateTag> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    // split the 'a' token to get user ID
    const extractedUserId = aCookieValue?.split("|")[1];
    const userId = extractedUserId ? extractedUserId : "";
    //csrf token 
    const exractedCsrfToken = this.cookieService.getCookie("csrf_token");
    const csrfToken = exractedCsrfToken ? exractedCsrfToken : "";
    // Initialize headers with default values
    let headers = new HttpHeaders();
    if (csrfToken) {
        headers = headers.set('X-CSRF-Token', csrfToken);
    }
    return this.http.post<UserUpdateTag>(`${this.API_URL}/2015-09-01/admin/user_update_tags`, accountData, {
      headers: headers,
      withCredentials: true,
     }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  public getUserDataById(userId:string):Observable<UserSearchByIdResponse>{
    //csrf token 
    const exractedCsrfToken = this.cookieService.getCookie("csrf_token");
    const csrfToken = exractedCsrfToken ? exractedCsrfToken : "";
    let headers = new HttpHeaders();
    if(csrfToken){
      headers = headers.set('X-CSRF-Token', csrfToken);
    }

    const params =userId ?{params: new HttpParams().set('user_id', userId)}:{}
    return this.http.get<UserSearchByIdResponse>(`${this.API_URL}/admin/user`, {
      headers: headers,
      withCredentials: true,
      ...params
    }).pipe(
      // Handle errors
      catchError((error) => {
        return throwError(error);
      })
    )
  }

  public createApiAccount(accountData: FormData): Observable<createApiUser> {
    const exractedCsrfToken = this.cookieService.getCookie("csrf_token");
    const csrfToken = exractedCsrfToken ? exractedCsrfToken : "";
    // Initialize headers with default values
    let headers = new HttpHeaders();
    // Add CSRF token to headers if available
    if (csrfToken) {
        headers = headers.set('X-CSRF-Token', csrfToken);
    }
    // Make the HTTP request to get user's api logs
    return this.http.post<createApiUser>(`${this.API_URL}/admin/api_user_create`, accountData, {
      headers: headers,
    withCredentials: true,
     }).pipe(
      // Handle errors
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  public searchUsers(searchTxt:string, apiUsers: boolean, notSignedIn: boolean, inst: string):Observable<UserSearchResponse>{
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    //csrf token 
    const exractedCsrfToken = this.cookieService.getCookie("csrf_token");
    const csrfToken = exractedCsrfToken ? exractedCsrfToken : "";
      // Constructing the query
    let query = searchTxt;
    if (apiUsers) { query += ' type:api';}
    if (notSignedIn) {query += ' type:provisioned';}
    if(inst){query += ` inst:${inst}`;}
    const formData = new URLSearchParams();
    formData.set('q', query);
    formData.set('a', aCookieValue);
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      
    if(csrfToken){
      headers = headers.set('X-CSRF-Token', csrfToken);
    }
    return this.http.post<UserSearchResponse>(`${this.API_URL}/admin/search`, formData, {
      headers: headers,
      withCredentials:true
    }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    )
  }

  public userUpdatePager(userId:string,pager_Number?:string):Observable<UpdatePagerResponse>{
    const formData = new FormData();
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    if(aCookieValue){
      formData.append('a', aCookieValue)
    }
    formData.append("user_id", userId);
    if(pager_Number == undefined || pager_Number == null){
      formData.append("pager_number", "");
    }else if(pager_Number != undefined || pager_Number != null){
      formData.append("pager_number", pager_Number);
    }
    return this.http.post<UpdatePagerResponse>(`${this.API_URL}/2015-09-01/admin/user_update_pager`, formData, {
      headers:headers,
      withCredentials:true
    }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    )
  }

  public userInfoUpdate(userInfoData:FormData):Observable<UserInfoUpdateResponse>{    
    return this.http.post<UserInfoUpdateResponse>(`${this.API_URL}/admin/user_info_update`, userInfoData, {
      headers: headers,
      withCredentials: true,
     }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  public userProfileUpdate(profileData:FormData):Observable<UserInfoUpdateResponse>{    
    return this.http.post<UserInfoUpdateResponse>(`${this.API_URL}/admin/user_profile_update`, profileData, {headers: headers,withCredentials: true,}).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  public userProfilePhotoUpdateRemove(data:FormData): Observable<usersImage> {
    return this.http.post<usersImage>(`${this.API_URL}/admin/user_update_photo`, data, {headers: headers,withCredentials: true,})
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public searchUser(searchTxt:string):Observable<UserSearchResponse>{
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    //csrf token 
    const exractedCsrfToken = this.cookieService.getCookie("csrf_token");
    const csrfToken = exractedCsrfToken ? exractedCsrfToken : "";
    const formData = new URLSearchParams();
    formData.set('q', searchTxt);
    formData.set('i', 'off');
    formData.set('limit', '30');
    formData.set('a', aCookieValue);
   
    let newheaders = new HttpHeaders()
      .set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
    if(csrfToken){
      newheaders = newheaders.set('X-CSRF-Token', csrfToken);
    }
    return this.http.post<UserSearchResponse>(`${this.API_URL}/admin/search`, formData, {headers: newheaders,withCredentials:true}).pipe(
      catchError((error) => {
        return throwError(error);
      })
    )
  } 

  public userSendPasswordResetLink(data:FormData): Observable<passwordResetGeneratePassword> {
    return this.http.post<passwordResetGeneratePassword>(`${this.API_URL}/admin/password_reset`, data, {headers: headers,withCredentials: true,})
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public userLock(data:FormData): Observable<UserInfoUpdateResponse> {
    return this.http.post<UserInfoUpdateResponse>(`${this.API_URL}/admin/user_lock`, data, {headers: headers,withCredentials: true,})
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public userUnLock(data:FormData): Observable<UserInfoUpdateResponse> {
    return this.http.post<UserInfoUpdateResponse>(`${this.API_URL}/admin/user_unlock`, data, {headers: headers,withCredentials: true,})
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public userNotify(data:FormData): Observable<sendNotification> {
    return this.http.post<sendNotification>(`${this.API_URL}/admin/user_notify`, data, {headers: headers,withCredentials: true,})
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public sendUserActivationMail(userId:string):Observable<sendActivationMail>{
    const aCookieValue = this.cookieService.getCookie('a');
    const formData = new FormData();
    formData.append('user_id', userId);
    if(aCookieValue){
      formData.append('a', aCookieValue);
    }
    return this.http.post<sendActivationMail>(`${this.API_URL}/admin/user_send_activation`, formData, {
      headers: headers,
      withCredentials: true
    })
    .pipe(
      catchError((error) => {
        return throwError(error);
      })
    )
  }
}