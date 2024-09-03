import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs/internal/Observable";
import { catchError } from "rxjs/internal/operators/catchError";
import { throwError } from "rxjs/internal/observable/throwError";
import { ComposeForm, CookieService, EnableNotifications, updateUserInfoResponse, usersImage, UserUpdateProfile,getGroupList, GetGroupResponse } from "@amsconnect/shared";
import { environment } from "../../config/environment";

const headers = new HttpHeaders()
.set("Accept",'application/json, text/javascript, */*; q=0.01')
@Injectable({
  providedIn: "root",
})
export class SettingsService {
  public API_URL: string | undefined;
  public userId = "";

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.API_URL = environment.baseUrl;
  }

  public parseAuthCookie(): string | null {
    const authCookie = this.cookieService.getCookie("a");
    if (authCookie) {
      const parts = authCookie.split("|");
      if (parts.length === 2) {
        const userId = parts[1];
        return userId;
      }
    }
    return null;
  }

  public setUsersImage(
    image: File | null,
    removePhoto: boolean
  ): Observable<usersImage> {
    const formData = new FormData();
    const aCookieValue = this.cookieService.getCookie("a");
    if (image) {
      formData.append("image", image as Blob);
    }
    if (removePhoto && aCookieValue) {
      formData.append("a", aCookieValue);
    } else {
      formData.append("X-cureatr-user", this.parseAuthCookie() || "");
    }

    return this.http
      .post<usersImage>(`${this.API_URL}/users/set_image`, formData, {
        headers: headers,
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          console.log("Error getting client data", error);
          return throwError(error);
        })
      );
  }

  public updateProfile(formdata:FormData): Observable<UserUpdateProfile> {
    // Initialize an array to hold the encoded key-value pairs
    const encodedData: string[] = [];

    formdata.forEach((value, key) => {
      encodedData.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`);
    });

    // Join the encoded data into a single string
    const data = encodedData.join('&');
    const newHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/javascript, */*; q=0.01'
    }); 
     // Perform HTTP POST request to update the profile
    return this.http.post<UserUpdateProfile>(`${this.API_URL}/users/update_profile`, data, {
        headers: newHeaders,
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public updateUserInfo(formdata:FormData): Observable<updateUserInfoResponse> {
    return this.http
      .post<updateUserInfoResponse>(`${this.API_URL}/users/update_user_info`, formdata, {
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
  
  public setUserProperty(formData:FormData): Observable<EnableNotifications> {
    // Initialize an array to hold the encoded key-value pairs
    const encodedData: string[] = [];

    formData.forEach((value, key) => {
      encodedData.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`);
    });

    // Join the encoded data into a single string
    const data = encodedData.join('&');
    const newHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/javascript, */*; q=0.01'
    }); 
  return this.http
    .post(`${this.API_URL}/users/set_property`, data,{
      headers: newHeaders,
      withCredentials: true,
    })
    .pipe(
      // Handle errors
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  public getGroupList(): Observable<getGroupList>{
    return this.http.get<getGroupList>(`${this.API_URL}/group/list`, {
      headers: headers,
      withCredentials:true
    })
    .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
    )
  }

  public getGroupById(id:string):Observable<GetGroupResponse>{
    return this.http.get<GetGroupResponse>(`${this.API_URL}/group/load?id=${id}`, {
      headers: headers,
      withCredentials:true
    })
    .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
    )
  }
}
