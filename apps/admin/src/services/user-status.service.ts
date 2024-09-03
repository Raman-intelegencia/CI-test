import { CookieService, UpdateStatusResponse, environment } from "@amsconnect/shared";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";
import { UpdateStatusPayloadObj, UsersSearchResponse } from "../modals/users-status.model";

const headers = new HttpHeaders();
headers.append('Content-Type', 'multipart/form-data');

@Injectable({
    providedIn: 'root'
  })
  export class UserStatusService {
    public API_URL: string | undefined;

    constructor(
      private http: HttpClient,
      private cookieService: CookieService
      ) {
      this.API_URL = environment.baseUrl;
       }
    
    public updateUserStatus(statusObj: UpdateStatusPayloadObj):Observable<UpdateStatusResponse>{
        const aCookieVal = this.cookieService.getCookie('a');
        const formData = new FormData();
        formData.append('status', statusObj.status)
        formData.append('coverage', statusObj.coverage);
        formData.append('away_message', statusObj.away_message);
        formData.append('away_message_mode', statusObj.away_message_mode);
        formData.append('user_id', statusObj.user_id);
        if(aCookieVal){
            formData.append('a', aCookieVal)
        }
        return this.http.post<UpdateStatusResponse>(`${this.API_URL}/admin/user_status_update`, formData, {
            headers: headers,
            withCredentials: true
        }).pipe(
             // Handle errors
          catchError((error) => {
            return throwError(error);
          })
        )
    }

    public adminUserSearch(userId: string, searchTxt: string):Observable<UsersSearchResponse>{
        let queryParams = new HttpParams();
        queryParams = queryParams.append("u", userId);
        queryParams = queryParams.append("q", searchTxt);
        queryParams = queryParams.append("i", 'on');
        return this.http.get<UsersSearchResponse>(`${this.API_URL}/2021-09-06/admin/usearch`, {
            headers: headers,
            params: queryParams,
            withCredentials:true
        }).pipe(
            // Handle errors
         catchError((error) => {
           return throwError(error);
         })
       )
    }
  }