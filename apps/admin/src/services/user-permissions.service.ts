import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from '@amsconnect/shared';
import { Observable, catchError, throwError } from 'rxjs';
import { PermissionData, UserPermissionsReponse } from '../modals/users.model';
import { environment } from 'libs/shared/src/lib/config/environment';

const headers = new HttpHeaders();
headers.append('Content-Type', 'multipart/form-data');

@Injectable({
  providedIn: 'root'
})
export class UserPermissionsService {
    public API_URL: string | undefined;

    constructor(
      private http: HttpClient,
      private cookieService: CookieService
      ) {
      this.API_URL = environment.baseUrl;
       }

    public getUserPermissions(userId:string):Observable<UserPermissionsReponse>{
    return this.http.get<UserPermissionsReponse>(`${this.API_URL}/admin/permission/${userId}`,{
        headers: headers,
        withCredentials: true,
    }).pipe(
        // Handle errors
        catchError((error) => {
        return throwError(error);
        })
    )
    }

    public updateUserPermissions(userId:string, payload:PermissionData):Observable<UserPermissionsReponse>{
      const aCookieValue = this.cookieService.getCookie('a');

      const formData = new FormData();
      formData.append('json', JSON.stringify(payload));

      if(aCookieValue){
        formData.append('a', aCookieValue);
      }

      return this.http.post<UserPermissionsReponse>(`${this.API_URL}/admin/permission/${userId}`, formData,{
        headers: headers,
        withCredentials: true,
    }).pipe(
        // Handle errors
        catchError((error) => {
        return throwError(error);
        })
    )
    }
    
}