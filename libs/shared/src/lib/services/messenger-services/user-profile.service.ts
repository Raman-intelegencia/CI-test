import { CookieService, loadLatestMessage } from "@amsconnect/shared";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, throwError } from "rxjs";
import { Thread, thread, profileResponse, SHIFTS } from "../../models/profile.model";
import { environment } from "@amsconnect/shared";

let headers = new HttpHeaders()
.set("Accept",'application/json, text/javascript, */*; q=0.01')
@Injectable({
    providedIn: "root",
})
export class UserProfileService {
    public API_URL: string | undefined;

    constructor(private http: HttpClient, private cookieService: CookieService) {
        this.API_URL = environment.baseUrl;
    }

    public getMessageload_latest2(journal_id: number, archived: boolean): Observable<any> {
        const queryParams = new HttpParams({ fromObject: { archived } });
        const newHeaders = new HttpHeaders({
            'Accept': 'application/json, text/javascript, */*; q=0.01'
          });
        return this.http
            .get(`${this.API_URL}/message/load_latest2/${journal_id}`, {
                headers: newHeaders,
                params: queryParams,
                withCredentials: true,
            })
            .pipe(
                // Handle errors
                catchError((error) => {
                    return throwError(error);
                }),
            );
    }

    public searchProfileMessages(archived: boolean, search: string,timestamp?:number): Observable<loadLatestMessage> {
        let queryParams;
        if (timestamp) {
             queryParams = new HttpParams().set('archived', archived).set('q', search).set('timestamp',timestamp);
        }
        else {
             queryParams = new HttpParams().set('archived', archived).set('q', search);
        }
        const newHeaders = new HttpHeaders({
            'Accept': 'application/json, text/javascript, */*; q=0.01'
          });
        return this.http.get<loadLatestMessage>(`${this.API_URL}/thread/search`, {
            headers: newHeaders,
            params: queryParams,
            withCredentials: true,
        })
        .pipe(
            // Handle error
            catchError((error) => {
                return throwError(error);
            })
        )
    }

    public getMessage_load_older_threads(lastThreadTimeUpdated: string, archived: boolean, interactive: boolean): Observable<any> {
        const queryParams = new HttpParams({ fromObject: { archived: archived, interactive: interactive } });
        const newHeaders = new HttpHeaders({
            'Accept': 'application/json, text/javascript, */*; q=0.01'
          });
        return this.http
            .get(`${this.API_URL}/message/load_older_threads/${lastThreadTimeUpdated}`, {
                headers: newHeaders,
                params: queryParams,
                withCredentials: true,
            })
            .pipe(
                catchError((error) => {
                    return throwError(error);
                }),
            );
    }

    public getMessageload_latest2_0(archived: boolean): Observable<any> {
        const queryParams = new HttpParams({ fromObject: { archived } });
        const newHeaders = new HttpHeaders({
            'Accept': 'application/json, text/javascript, */*; q=0.01'
          });
        return this.http
            .get(`${this.API_URL}/message/load_latest2/0`, {
                headers: newHeaders,
                params: queryParams,
                withCredentials: true,
            })
            .pipe(
                // Handle errors
                catchError((error) => {
                    return throwError(error);
                }),
            );
    }

    public userProfile(id: string, patient_access_token?: string, patient_access_token_type?: string): Observable<profileResponse> {
        const queryParams = new HttpParams({
            fromObject: { patient_access_token: patient_access_token || "", patient_access_token_type: patient_access_token_type || "" },
        });
        const newHeaders = new HttpHeaders({
            'Accept': 'application/json, text/javascript, */*; q=0.01'
          });
        return this.http
            .get<profileResponse>(`${this.API_URL}/profile/get/${id}`, {
                headers: newHeaders,
                params: queryParams,
                withCredentials: true,
            })
            .pipe(
                // Handle errors
                catchError((error) => {
                    return throwError(error);
                }),
            );
    }

    public shifts(id?: string): Observable<SHIFTS> {
        let headers = new HttpHeaders()
        .set("Accept",'application/json, text/javascript, */*; q=0.01')

        let url = `${this.API_URL}/2021-05-20/shifts`;
        let shiftId = id ? encodeURIComponent(id) : "";
        if (shiftId) {
            url += `/${shiftId}`;
        }
        // Perform HTTP GET request to fetch shift response
        return this.http.get<SHIFTS>(url, {
                headers: headers,
                withCredentials: true,
            })
            .pipe(
                // Handle errors
                catchError((error) => {
                    return throwError(error);
                }),
            );
    }

    public shiftsAuto(auto_schedule: string,id?:string): Observable<any> {
        let headers = new HttpHeaders()
        .set("Accept",'application/json, text/javascript, */*; q=0.01')
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')

        let formData = new URLSearchParams();  
        formData.append("auto_schedule", auto_schedule);
        if(id){
            formData.append("user_id",id)
        }
        const aCookieValue = this.cookieService.getCookie("a");
        if (aCookieValue) {
            formData.append("a", aCookieValue);
        }
        const body = formData.toString();
        return this.http
            .post(`${this.API_URL}/2017-08-01/shifts/auto`, body, {
                headers: headers,
                withCredentials: true,
            })
            .pipe(
                // Handle errors
                catchError((error) => {
                    return throwError(error);
                }),
            );
    }

    public userThreadResponse(id: string): Observable<Thread> {
        const newHeaders = new HttpHeaders({
            'Accept': 'application/json, text/javascript, */*; q=0.01'
        })
        let userId = id ? encodeURIComponent(id) : "";
        // Perform HTTP GET request to fetch user thread response
        return this.http.get(`${this.API_URL}/thread/users/${userId}`, {
                headers: newHeaders,
                withCredentials: true,
            })
            .pipe(
                map((response: any) => {
                    // Ensure the response is properly structured as a Thread
                    if (response && response.threads && response.profiles && response.status) {
                        const threadContext = response.threads.map((item: thread) => {
                            if (item.recipients) {
                                return { ...item };
                            } else {
                                return [];
                            }
                        });

                        return {
                            threads: threadContext,
                            profiles: response.profiles,
                            status: response.status,
                        };
                    } else {
                        // Handle cases where the response doesn't match the expected structure
                        console.error("Invalid API response:", response);
                        return {
                            threads: [],
                            profiles: [],
                            status: "",
                        };
                    }
                }),
            );
    }
    public deleteSelectedShifts(id: string, deletePayload: FormData): Observable<any> {
        return this.http
            .post(`${this.API_URL}/2021-05-20/shifts/delete/${id}`, {
                headers: headers,
                withCredentials: true,
                deletePayload,
            })
            .pipe(
                // Handle errors
                catchError((error) => {
                    return throwError(error);
                }),
            );
    }
}
