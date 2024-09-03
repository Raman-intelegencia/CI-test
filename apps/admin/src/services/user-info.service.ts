import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiKeyResponse, SftpResponse, UserEmailSubscriptionResponse, WebHookData, WebhooksResponse } from '../modals/users.model';
import { CookieService } from '@amsconnect/shared';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { environment } from 'libs/shared/src/lib/config/environment';

const headers = new HttpHeaders();
headers.append('Content-Type', 'multipart/form-data');

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {
    public API_URL: string | undefined;
    public dataUserInfoNameSearch = new BehaviorSubject<string>("");
    dataUserInfoNameSearch$ = this.dataUserInfoNameSearch.asObservable();
  
    public dataUserInfoApiUsersSearch = new BehaviorSubject<boolean>(false);
    dataUserInfoApiUsersSearch$ = this.dataUserInfoApiUsersSearch.asObservable();
  
    public dataUserInfoNotSignedSearch = new BehaviorSubject<boolean>(false);
    dataUserInfoNotSignedSearch$ = this.dataUserInfoNotSignedSearch.asObservable();
  
    public dataUserInfoInstitutionSearch = new BehaviorSubject<string>("");
    dataUserInfoInstitutionSearch$ = this.dataUserInfoInstitutionSearch.asObservable();

    public dataUserInfoPage = new BehaviorSubject<boolean>(false);
    dataUserInfoPage$ = this.dataUserInfoPage.asObservable();

    constructor(
      private http: HttpClient,
      private cookieService: CookieService
      ) {
      this.API_URL = environment.baseUrl;
       }

    public getEmailSubscription(userId:string):Observable<UserEmailSubscriptionResponse>{
        const params =userId ?{params: new HttpParams().set('user_id', userId)}:{}
        return this.http.get<UserEmailSubscriptionResponse>(`${this.API_URL}/admin/user_emails`,{
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
    
      public userEmailUpdateSubscription(userId:string, emailType:string, emailFlag:boolean):Observable<UserEmailSubscriptionResponse>{
    
        let aCookieValue = this.cookieService.getCookie("a");
        aCookieValue = aCookieValue ? aCookieValue : "";
    
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('email_type', emailType);
        formData.append('should_subscribe', emailFlag.toString());
    
        if(aCookieValue){
          formData.append('a', aCookieValue)
        }
    
        return this.http.post<UserEmailSubscriptionResponse>(`${this.API_URL}/admin/user_email_update_subscription`, formData, {
          headers:headers,
          withCredentials: true
        }).pipe(
          // Handle errors
          catchError((error) => {
            return throwError(error);
          })
        )
      }
    
      public generateApiKey(userId:string):Observable<ApiKeyResponse>{
        let aCookieValue = this.cookieService.getCookie("a");
        aCookieValue = aCookieValue ? aCookieValue : "";
    
        const formData = new FormData();
    
        if(aCookieValue){
          formData.append('a', aCookieValue)
        }
    
        return this.http.post<ApiKeyResponse>(`${this.API_URL}/admin/users/${userId}/api_key`, formData, {
          headers:headers,
          withCredentials:true
        }).pipe(
          catchError((error) => {
            return throwError(error);
          })
        )
      }
    
      public removeApiKey(userId:string):Observable<ApiKeyResponse>{
        return this.http.delete<ApiKeyResponse>(`${this.API_URL}/admin/users/${userId}/api_key`, {
          headers:headers,
          withCredentials:true
        }).pipe(
          catchError((error) => {
            return throwError(error);
          })
        )
      }
    
      public setWebhooks(userId:string, webhookFormValue:WebHookData):Observable<WebhooksResponse>{
    
        let aCookieValue = this.cookieService.getCookie("a");
        aCookieValue = aCookieValue ? aCookieValue : "";
    
        const formData = new FormData();
        if(webhookFormValue.message_sent) formData.append('message_sent', webhookFormValue.message_sent);
        if(webhookFormValue.message_read) formData.append('message_read', webhookFormValue.message_read);
        if(webhookFormValue.user_status)formData.append('user_status', webhookFormValue.user_status);
        if(webhookFormValue.user_provisioning)formData.append('user_provisioning', webhookFormValue.user_provisioning);
        
    
        if(aCookieValue){
          formData.append('a', aCookieValue)
        }
        return this.http.post<WebhooksResponse>(`${this.API_URL}/admin/users/${userId}/webhooks`, formData, {
          headers:headers,
          withCredentials:true
        }).pipe(
          catchError((error) => {
            return throwError(error);
          })
        )
      }
    
      public removeWebhooks(userId:string):Observable<WebhooksResponse>{
        return this.http.delete<WebhooksResponse>(`${this.API_URL}/admin/users/${userId}/webhooks`, {
          headers:headers,
          withCredentials:true
        }).pipe(
          catchError((error) => {
            return throwError(error);
          })
        )
      }
    
      public setSftpCredentials(sftpFormValue:{user_id:string,public_key:string, username: string}):Observable<SftpResponse>{
    
        let aCookieValue = this.cookieService.getCookie("a");
        aCookieValue = aCookieValue ? aCookieValue : "";
    
        const formData = new FormData();
        formData.append('user_id', sftpFormValue.user_id);
        formData.append('public_key', sftpFormValue.public_key);
        formData.append('username', sftpFormValue.username);
    
        if(aCookieValue){
          formData.append('a', aCookieValue)
        }
        return this.http.post<SftpResponse>(`${this.API_URL}/admin/user_info_update`, formData, {
          headers:headers,
          withCredentials:true
        }).pipe(
          catchError((error) => {
            return throwError(error);
          })
        )
      }
    
      public removeSftpCredentials(userId:string):Observable<SftpResponse>{
    
        let aCookieValue = this.cookieService.getCookie("a");
        aCookieValue = aCookieValue ? aCookieValue : "";
    
        const formData = new FormData();
        formData.append('public_key', "");
        formData.append('username', "");
        formData.append('user_id', userId);
    
        if(aCookieValue){
          formData.append('a', aCookieValue)
        }
        return this.http.post<SftpResponse>(`${this.API_URL}/admin/user_info_update`, formData, {
          headers:headers,
          withCredentials:true
        }).pipe(
          catchError((error) => {
            return throwError(error);
          })
        )
      }
    
      public canBeMessegedApi(userId:string,apiStatus:boolean):Observable<ApiKeyResponse>{
        let aCookieValue = this.cookieService.getCookie("a");
        aCookieValue = aCookieValue ? aCookieValue : "";
    
        const formData = new FormData();
    
        if(aCookieValue){
          formData.append('a', aCookieValue)
        }

        if(apiStatus === true){
          formData.append('enable', 'on')
        }else{
          formData.append('enable', 'off')
        }
    
        return this.http.post<ApiKeyResponse>(`${this.API_URL}/admin/users/${userId}/api_activate`, formData, {
          headers:headers,
          withCredentials:true
        }).pipe(
          catchError((error) => {
            return throwError(error);
          })
        )
      }

      public setUserInfoNameSearchData(name: string): void {
        this.dataUserInfoNameSearch.next(name);
      }
      
      public setUserInfoApiUsersSearchData(infoApiUsers: boolean): void {
        this.dataUserInfoApiUsersSearch.next(infoApiUsers);
      }

      public setUserInfoNotSignedSearchData(notSigned: boolean): void {
        this.dataUserInfoNotSignedSearch.next(notSigned);
      }

      public setUserInfoInstitutionSearchData(institute: string): void {
        this.dataUserInfoInstitutionSearch.next(institute);
      }

      public setUserInfoPageRedirection(redirectionSuccess: boolean): void {
        this.dataUserInfoPage.next(redirectionSuccess);
      }

}
