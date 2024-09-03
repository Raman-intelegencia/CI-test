import { CreateShiftRequest, UpdateStatusResponse, createShiftResponse, CookieService, DELETE_SHIFT_RESPONSE } from '@amsconnect/shared';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Shift, UserUpdateStatus } from '../../models/profile.model';
import { Observable, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '@amsconnect/shared';

const headers = new HttpHeaders()
    .set("Accept", 'application/json, text/javascript, */*; q=0.01')
@Injectable({
    providedIn: 'root'
})
export class ServiceTeamsService {
    public API_URL: string | undefined;
    private shiftsData = new BehaviorSubject<Shift[]>([]);
    shiftsData$ = this.shiftsData.asObservable();
    constructor(
        private http: HttpClient,
        private cookieService: CookieService
    ) {
        this.API_URL = environment.baseUrl;
    }

    public getServiceRoles(id?: string): Observable<any> {
        let queryParams = new HttpParams();
        if (id) {
            queryParams = queryParams.set("user_id", id);
        }
        return this.http.get(`${this.API_URL}/2021-05-20/roles`, {
            headers: headers,
            withCredentials: true, params: queryParams,
        })
            .pipe(
                // Handle errors
                catchError((error) => {
                    return throwError(error);
                })
            )
    }

    public usersUpdateStatus(
        userUpdateStatus: UserUpdateStatus
    ): Observable<UpdateStatusResponse> {
        const formData = new FormData();
        const aCookieValue = this.cookieService.getCookie("a");
        let extractedUserId = aCookieValue?.split("|")[1];
        let userId = extractedUserId ? extractedUserId : "";
        formData.append("X-cureatr-user", userId);
        console.log(userUpdateStatus.status);
        if(userUpdateStatus.status){
            formData.append("status", userUpdateStatus.status);
        }
        else{
            formData.append("status", 'available');
        }
        if (userUpdateStatus.role) {
            userUpdateStatus.role.forEach((role: string) => {
                formData.append("role", role);
            });
        }
        if (userUpdateStatus.removed_manual_role) {
            if (typeof userUpdateStatus.removed_manual_role !== 'string') {
                userUpdateStatus?.removed_manual_role.forEach((remove_role) => {
                    formData.append("removed_manual_role", remove_role || "");
                })
            } else {
                formData.append("removed_manual_role", userUpdateStatus.removed_manual_role || "");
            }
        }
        if (userUpdateStatus.coverage || userUpdateStatus.scheduler_type) {
            formData.append("coverage", userUpdateStatus.coverage || "");
            formData.append("scheduler_type", userUpdateStatus.scheduler_type || "");
        }
        if (userUpdateStatus.away_message) {
            formData.append("away_message", userUpdateStatus.away_message || "");
        }
        if (userUpdateStatus.user_remove === 'yes') {
            formData.append("user_remove", userUpdateStatus.user_remove || "");
        }
        formData.append("away_message_mode", userUpdateStatus.away_message_mode);

        if (aCookieValue) {
            formData.append("a", aCookieValue);
        }
        if (userUpdateStatus.user_id) {
            formData.append("user_id", userUpdateStatus.user_id)
        }
        return this.http
            .post<UpdateStatusResponse>(`${this.API_URL}/users/update_status`, formData, {
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

    public getRecentServiceRoles(id?: string): Observable<any> {
        let queryParams = new HttpParams();
        if (id) {
            queryParams = queryParams.set("user_id", id);
        }
        return this.http.get(`${this.API_URL}/roles/recent`, {
            headers: headers,
            withCredentials: true, params: queryParams,
        })
            .pipe(
                // Handle errors
                catchError((error) => {
                    return throwError(error);
                })
            )
    }

    public updateStatus(formData: FormData): Observable<UpdateStatusResponse> {
        return this.http.post<UpdateStatusResponse>(`${this.API_URL}/users/update_status`, formData, {
            headers: headers,
            withCredentials: true
        })
            .pipe(
                // Handle errors
                catchError((error) => {
                    return throwError(error);
                })
            )
    }

    public createShifts(formData: CreateShiftRequest): Observable<createShiftResponse> {
        let headers = new HttpHeaders()
            .set("Accept", "application/json, text/javascript, */*; q=0.01")
            .set('Content-Type', 'json')

        // Perform HTTP POST request to create the shifts
        return this.http.post<createShiftResponse>(`${this.API_URL}/2017-08-01/shifts/create`, formData, {
            headers: headers,
            withCredentials: true
        })
            .pipe(
                // Handle errors
                catchError((error) => {
                    return throwError(error);
                })
            )
    }

    public updateShifts(formData: CreateShiftRequest, id: string): Observable<createShiftResponse> {
        let headers = new HttpHeaders()
            .append("Accept", "application/json, text/javascript, */*; q=0.01")
            .append('Content-Type', 'json')
        let shiftId = id ? encodeURIComponent(id) : "";
        // Perform HTTP POST request to update the shifts
        return this.http.post<createShiftResponse>(`${this.API_URL}/2017-08-01/shifts/update/${shiftId}`, formData, {
            headers: headers,
            withCredentials: true  // Ensure credentials are included in the request
        })
            .pipe(
                // Handle errors
                catchError((error) => {
                    return throwError(error);
                })
            )
    }

    public setShiftsData(shiftsData: Shift[]): void {
        this.shiftsData.next(shiftsData);
    }

    public deleteSelectedShifts(
        id: string, user_id?: string
    ): Observable<DELETE_SHIFT_RESPONSE> {
        let headers = new HttpHeaders()
            .set("Accept", 'application/json, text/javascript, */*; q=0.01')
            .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')

        let formData = new URLSearchParams();
        const aCookieValue = this.cookieService.getCookie("a");
        if (aCookieValue) {
            let aValue = encodeURIComponent(aCookieValue);
            formData.append("a", aValue);
        }
        if (user_id) {
            let userId = encodeURIComponent(user_id);
            formData.append("user_id", userId);
        }
        const body = formData.toString();
        let shiftId = id ? encodeURIComponent(id) : "";
        return this.http.post<DELETE_SHIFT_RESPONSE>(`${this.API_URL}/2021-05-20/shifts/delete/${shiftId}`, body, {
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
