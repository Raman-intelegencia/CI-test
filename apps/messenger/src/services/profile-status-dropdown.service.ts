import { CookieService, UpdateStatusResponse } from "@amsconnect/shared";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";
import { UserUpdateStatus } from "../models/off-duty-modal.model";
import { environment } from "libs/shared/src/lib/config/environment";

const headers = new HttpHeaders()
.set("Accept", "application/json, text/javascript, */*; q=0.01");

@Injectable({
  providedIn: "root",
})
export class ProfileStatusDropdownService {
  public API_URL: string | undefined;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.API_URL = environment.baseUrl;
  }

  public usersUpdateStatus(
    userUpdateStatus:UserUpdateStatus
  ): Observable<UpdateStatusResponse> {
    let headers = new HttpHeaders()
    .set("Accept", "application/json, text/javascript, */*; q=0.01")
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    let formData = new URLSearchParams();
    const aCookieValue = this.cookieService.getCookie("a");
    if(userUpdateStatus.status){
      formData.append("status", userUpdateStatus.status);
  }
  else {
      formData.append("status", 'available');
  }
    if (userUpdateStatus.role) {
      userUpdateStatus.role.forEach((role: string) => {
        formData.append("role", role);
      });
    }
    if(userUpdateStatus.removed_manual_role) {
      if(typeof userUpdateStatus.removed_manual_role !=='string') {
        userUpdateStatus?.removed_manual_role.forEach((remove_role) => {
          formData.append("removed_manual_role", remove_role || "");
        })
      } else {
        formData.append("removed_manual_role", userUpdateStatus.removed_manual_role || "");
      }
    }
    if (userUpdateStatus.coverage || userUpdateStatus.scheduler_type || userUpdateStatus.removed_manual_role || userUpdateStatus.away_message ) {
      formData.append("coverage", userUpdateStatus.coverage || "");
      formData.append("scheduler_type", userUpdateStatus.scheduler_type || "");
      formData.append("away_message", userUpdateStatus.away_message || "");
    }
    if (userUpdateStatus.user_remove === 'yes'){
      formData.append("user_remove", userUpdateStatus.user_remove || "");
    }
    formData.append("away_message_mode", userUpdateStatus.away_message_mode);

    if (aCookieValue) {
      formData.append("a", aCookieValue);
    }
    if(userUpdateStatus.user_id){
        formData.append("user_id", userUpdateStatus.user_id)
    }
    const body = formData.toString(); // Convert URLSearchParams to string
    return this.http
      .post<UpdateStatusResponse>(`${this.API_URL}/users/update_status`, body, {
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

  public searchUsers(searchText: string): Observable<any> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append("q", searchText);
    queryParams = queryParams.append("s", "coverage");
    queryParams = queryParams.append("g", "off");
    queryParams = queryParams.append("t", "on");
    queryParams = queryParams.append("d", "on");
    queryParams = queryParams.append("r", "off");
    queryParams = queryParams.append("i", "on");
    return this.http
      .get(`${this.API_URL}/profile/search3`, {
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

  public delete_service_notification(
    userId:string): Observable<{status:string}> { 
      let headers = new HttpHeaders()
      .set("Accept", "application/json, text/javascript, */*; q=0.01")
      .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
      let formData = new URLSearchParams();
    const aCookieValue = this.cookieService.getCookie("a");
      formData.append("user_id",userId);
    if (aCookieValue) {
      formData.append("a", aCookieValue);
    }
    const body = formData.toString();
    return this.http
      .post<{status:string}>(`${this.API_URL}/users/delete_service_notification`, body,{
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
