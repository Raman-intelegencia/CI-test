import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs/internal/Observable";
import { catchError } from "rxjs/internal/operators/catchError";
import { throwError } from "rxjs/internal/observable/throwError";
import { ChangePasswordData, agreement, changePassword } from "../../models/user.model";
import { environment } from "../../config/environment";

// const API_URL = process.env['NX_API_URL'];
const headers = new HttpHeaders();
headers.append("Content-Type", "multipart/form-data");
@Injectable({
  providedIn: "root",
})
export class NonSSOService {
  public API_URL: string | undefined;

  constructor(
    private http: HttpClient,
  ) {
    this.API_URL = environment.baseUrl;
  }

  public sendResetLink(email: string, institutionId: string): Observable<any> {
    // Create form data and add email and institution ID to it
    const formData = new FormData();
    formData.append("email", email);
    formData.append("iid", institutionId);
    // Send POST request to the API endpoint
    return this.http
      .post(`${this.API_URL}/2019-11-01/users/reset`, formData, {
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

  public getCreatePasswordScreen(
    token: string,
    user_id: string
  ): Observable<any> {
    const queryParams = new HttpParams({ fromObject: { token, user_id } });
    return this.http
      .get(`${this.API_URL}/2019-11-01/users/reset`, {
        params: queryParams,
        headers: headers,
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }
  public passwordCheck(password: string): Observable<any> {
    // Prepare URL-encoded data string
    const data = `password=${encodeURIComponent(password)}`;
    // Prepare headers
    const newHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/javascript, */*; q=0.01'
    });
    // Send POST request to the API endpoint
    return this.http
      .post(`${this.API_URL}/users/passcheck`, data, {
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

  public newPassword(
    auth: string,
    password: string,
    user_id: string,
    agreement?: agreement
  ): Observable<any> {
    const payload = {
      auth: auth,
      password: password,
      user_id: user_id,
      agreement: agreement
    };
    // Send POST request to the API endpoint
    return this.http
      .post(`${this.API_URL}/2019-11-01/users/newpassword`, payload, {
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

  public changePassword(formValues: ChangePasswordData): Observable<changePassword> {
     // Convert object to URL-encoded string
     const encodedData = Object.keys(formValues)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(formValues[key as keyof ChangePasswordData]))}`)
      .join('&');

    // Set headers, including the Content-Type
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/javascript, */*; q=0.01'
    });
    return this.http
      .post<changePassword>(`${this.API_URL}/users/password`, encodedData, {
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
