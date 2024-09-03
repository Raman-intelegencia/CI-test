import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs/internal/Observable";
import { catchError } from "rxjs/internal/operators/catchError";
import { throwError } from "rxjs/internal/observable/throwError";
import { CookieService, CreateGroupResponse, UPDATE_USERS } from "@amsconnect/shared";
import { environment } from "libs/shared/src/lib/config/environment";
import { ScheduleStatus, ScheduleStatusResponse, showScheduleStatusResponse } from "../models/schedule-status.model";

const headers = new HttpHeaders();
headers.set("Content-Type", "multipart/form-data");
@Injectable({
  providedIn: "root",
})
export class ScheduledStatusService {
  public API_URL: string | undefined;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.API_URL = environment.baseUrl;
  }

  public showScheduleStatus(id: string): Observable<showScheduleStatusResponse> {
    const formData = new FormData();
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) {
      formData.append("a", aCookieValue);
    }
    if(id){
      formData.append("user_id", id);
    }

    return this.http
      .post<showScheduleStatusResponse>(`${this.API_URL}/users/get_status`, JSON.stringify(formData), {
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
  
  public deleteScheduleStatus(id: string, objectId:string): Observable<ScheduleStatusResponse> {
    const param ={
      "user_id": id,
      "object_id": objectId,
      "a": this.cookieService.getCookie("a")
    }

    return this.http
      .post<ScheduleStatusResponse>(`${this.API_URL}/users/delete_status`, JSON.stringify(param), {
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

  public saveScheduleStatus(scheduleStatus: ScheduleStatus): Observable<ScheduleStatusResponse> {
    let aCookieValue = this.cookieService.getCookie("a");
    const encodedParams = {
      "user_id": scheduleStatus.user_id,
      "status":  scheduleStatus.status,
      "duration":  scheduleStatus.duration,
      "start_date": scheduleStatus.start_date,
      "end_date": scheduleStatus.end_date,
      "coverage":   scheduleStatus.coverage,
      "away_message_mode":  scheduleStatus.away_message_mode,
      "away_message":  scheduleStatus.away_message,
      "a": aCookieValue ?  aCookieValue : ""
    };
    // Perform HTTP POST request to save the scheduled status
    return this.http.post<ScheduleStatusResponse>(`${this.API_URL}/users/save_status`, JSON.stringify(encodedParams), {
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
}
