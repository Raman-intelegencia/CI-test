import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs/internal/Observable";
import { catchError } from "rxjs/internal/operators/catchError";
import { throwError } from "rxjs/internal/observable/throwError";
import { Injectable } from "@angular/core";
import { CookieService } from "../cookie.service";
import { environment } from "../../config/environment";
import { PatientDataDetail, PatientDetailsResponse, PatientPayload, PatientThreadResponse } from "../../models/patients.model";

const headers = new HttpHeaders();
headers.append("Content-Type", "multipart/form-data");
@Injectable({
  providedIn: "root",
})
export class PatientService {
  public API_URL: string | undefined;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.API_URL = environment.baseUrl;
  }

  public searchPatients(searchTxt: string): Observable<any> {
    let queryParams = new HttpParams();
    if (searchTxt && searchTxt.trim() !== "") {
      queryParams = queryParams.set("query", searchTxt.trim());
    }
    const newHeaders = new HttpHeaders({
      'Accept': 'application/json, text/javascript, */*; q=0.01'
    });
    return this.http
      .get(`${this.API_URL}/2014-11-01/patients/search`, {
        params: queryParams,
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

  public getPatients(patientId: string,threadId?:string): Observable<PatientDetailsResponse> {
    let queryParams = new HttpParams();
    if(threadId){
      queryParams = queryParams.set("thread_id",threadId);
    }
    const newHeaders = new HttpHeaders({
      'Accept': 'application/json, text/javascript, */*; q=0.01'
    });
    return this.http
      .get<PatientDetailsResponse>(`${this.API_URL}/2014-11-01/patients/${patientId}`, {
        params: queryParams,
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

  public getUserPatients(): Observable<any> {
    return this.http
      .get(`${this.API_URL}/2018-09-01/user_patients`, {
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

  public addUserPatients(patientId: string): Observable<any> {
    const aCookieValue = this.cookieService.getCookie("a");
    // Prepare URL-encoded data string
    let data = `patient_id=${encodeURIComponent(patientId)}`;
    if (aCookieValue) {
      data += `&a=${encodeURIComponent(aCookieValue)}`;
    }
    // Prepare headers with Content-Type and Accept
    const newHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/javascript, */*; q=0.01'
    });
    return this.http
      .post(`${this.API_URL}/2018-09-01/user_patients`, data, {
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

  public removeUserPatients(patientId: string): Observable<any> {
    const newHeaders = new HttpHeaders({
      'Accept': 'application/json, text/javascript, */*; q=0.01'
    })
    return this.http
      .delete(`${this.API_URL}/2018-09-01/user_patients/${patientId}`, {
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

  public addNewPatient(
    formData: PatientPayload
      ) : Observable<PatientDataDetail>{ 
        const newHeaders = new HttpHeaders({
          'Accept': 'application/json, text/javascript, */*; q=0.01'
        })
        return this.http
        .post(`${this.API_URL}/2020-03-01/patients/create`, JSON.stringify(formData), {
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

  public getPatientthreads(patientId: string,threadId?:string): Observable<PatientThreadResponse> {
    let queryParams = new HttpParams();
    if(threadId){
      queryParams = queryParams.set("thread_id",threadId);
    }
     // Set the Accept header to specify expected response formats
    const newHeaders = new HttpHeaders({
      'Accept': 'application/json, text/javascript, */*; q=0.01'
    });
    return this.http
      .get<PatientThreadResponse>(`${this.API_URL}/2015-02-01/patients/threads/${patientId}`, {
        headers: newHeaders,
        withCredentials: true,
        params: queryParams,
      })
      .pipe(
        // Handle erros
        catchError((error) => {
          return throwError(error);
        })
      );
  }
}
