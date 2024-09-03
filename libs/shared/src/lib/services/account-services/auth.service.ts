import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { User, UsersAuthResponse } from "../../models/user.model";
import { BehaviorSubject, catchError, firstValueFrom, map, Observable, of, tap, throwError } from "rxjs";
import { loadLatestMessage, Configurations, Threads, Users } from "../../models/threads.model";
import { CookieService } from "../cookie.service";
import { Router } from "@angular/router";
import { environment } from "../../config/environment";

const headers = new HttpHeaders();
headers.append("Content-Type", "multipart/form-data");
@Injectable({
    providedIn: "root",
})
export class AuthService {
    public user: User | undefined;
    public isAuthenticated = false;
    public API_URL: string | undefined;
    private journalId = new BehaviorSubject(0);
    journalId$ = this.journalId.asObservable();
    private authResponseData = new BehaviorSubject<UsersAuthResponse>({} as UsersAuthResponse);
    authResponseData$ = this.authResponseData.asObservable();
    public accountUrl = "";

    constructor(private http: HttpClient, private router: Router) {
        this.API_URL = environment.baseUrl;
        this.accountUrl = environment.accounts_server_url;
    }

    public login(authenticate: FormData): Observable<any> {
        return this.http
            .post(`${this.API_URL}/2015-09-01/users/login`, authenticate, {
                headers: headers,
                withCredentials: true,
            })
            .pipe(
                tap((user: User | any) => {
                    this.isAuthenticated = true;
                    this.user = user;
                    this.setAuthToken(user.token);
                }),
                catchError((error) => {
                    return throwError(error);
                }),
            );
    }

    public usersAuth(userId?: string): Observable<UsersAuthResponse> {
        let params = new HttpParams();
        params = params.append("type", "web");
        let newHeaders = new HttpHeaders()
        .set("Accept",'application/json, text/javascript, */*; q=0.01')
        if (userId) {
         // Set the new header (replaces any existing X-cureatr-user header)
         newHeaders = newHeaders.set("X-cureatr-user", userId);
        }
        return this.http
            .get<UsersAuthResponse>(`${this.API_URL}/2014-11-01/users/auth`, {
                params,
                headers: newHeaders,
                withCredentials: true,
            })
            .pipe(
                tap((response: UsersAuthResponse) => {
                    this.setAuthUsersReponse(response);
                }),
                catchError((error) => {
                    return throwError(error);
                }),
            );
    }

    public send_otp(otpPayload: FormData): Observable<any> {
        return this.http
            .post(`${this.API_URL}/admin/users/send_otp`, otpPayload, {
                headers: headers,
                withCredentials: true,
            })
            .pipe(
                catchError((error) => {
                    return throwError(error);
                }),
            );
    }

    public verify_otp(otpPayload: FormData): Observable<any> {
        return this.http
            .post(`${this.API_URL}/admin/verify_otp`, otpPayload, {
                headers: headers,
                withCredentials: true,
            })
            .pipe(
                catchError((error) => {
                    return throwError(error);
                }),
            );
    }

    setAuthToken(token: string) {
        localStorage.setItem("token", token);
    }

    getAuthToken(): string | null {
        return localStorage.getItem("token");
    }

    clearAuthToken() {
        localStorage.removeItem("token");
    }

    public logout(userId?: string): Observable<any> {
        let newHeaders = new HttpHeaders()
            .set("Content-Type", "multipart/form-data")
        if (userId) {
            newHeaders = newHeaders.set("X-cureatr-user", userId);
        }
        return this.http
            .get(`${this.API_URL}/users/logout`, {
                headers: newHeaders,
                withCredentials: true,
            })
            .pipe(
                catchError((error) => {
                    return throwError(error);
                }),
            );
    }

    public setAuthUsersReponse(UsersAuthResponse: UsersAuthResponse): void {
        this.authResponseData.next(UsersAuthResponse);
    }
    // update the inbox sort value to get updated behaviour subject
    public updateInboxSort(inboxSortValue: string): void {
        const currentAuthData = this.authResponseData.getValue(); // Get the current value
        if (currentAuthData.user && currentAuthData.user.properties) {
            currentAuthData.user.properties.inbox_sort = inboxSortValue; // Update the value
            this.authResponseData.next(currentAuthData); // Push the updated value back
        }
    }

    public initializeDefaultCheckboxStates(userId:string): void {
        const defaults = [
            { key: 'show_thread_timestamp', value: true },
            { key: 'quick_send', value: true },
        ];
    
        defaults.forEach(({ key, value }) => {
            // Generate the full key using the user's ID to ensure user-specific settings
            const fullKey = this.keyGenerator(userId, key);
            
            // Check if the key already exists in localStorage
            if (localStorage.getItem(fullKey) === null) {
                // If the key doesn't exist, set it with a value of true
                localStorage.setItem(fullKey, JSON.stringify(value));
            }
            // If the key exists, no action is taken, preserving the existing value
        });
    }
    
    public keyGenerator(prefix:string,value:string):string{
      return `${prefix}_${value}`;
    }
}
