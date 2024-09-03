import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs/internal/observable/throwError';
import { CookieService, environment } from '@amsconnect/shared';
import { ApiJobDetailResponse, ApiJobResponse, BroadcastMessagingResponse, FormDataInterface } from '../modals/jobs.model';

// Create headers and set content type to multipart/form-data
const headers = new HttpHeaders();
headers.append('Content-Type', 'multipart/form-data');

@Injectable({
  providedIn: 'root'
})
export class JobsService {

  public API_URL: string | undefined;
  private offloadUrl: string | undefined;
  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.API_URL = environment.baseUrl;
    this.offloadUrl = environment.offloadUrl;
  }

  // Fetch all jobs records
  public getAllJobs(timeTo: string, timeFrom: string, owner?: boolean,bucketName?:string,): Observable<ApiJobResponse> {
    // Create params and append from and to time
    let params = new HttpParams();
    params = params.set('time_to', timeTo);
    params = params.set('time_from', timeFrom);
    if(owner !== undefined){ params = params.set('owner', owner.toString()); }
    if(bucketName !== undefined){ params = params.set('filearea', bucketName); }

    return this.http.get<ApiJobResponse>(`${this.API_URL}/admin/jobs`, { params, headers: this.setcookie(), withCredentials: true })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  // Fetch job details
  public getJobDetails(jobId: string): Observable<ApiJobDetailResponse> {
    // Make the HTTP request to get job details
    return this.http.get<ApiJobDetailResponse>(`${this.API_URL}/admin/jobs/${jobId}`, { headers: this.setcookie(), withCredentials: true },).pipe(
      // Handle errors
      catchError((error) => {
        return throwError(error);
      })
    )
  }

  // Download job details 
  public rerunJobDetails(jobId: string, jobDetails: string): Observable<ApiJobDetailResponse> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    let rerunData={
      state:jobDetails,
      a:aCookieValue
    }
    return this.http.post<ApiJobDetailResponse>(`${this.API_URL}/admin/jobs/${jobId}`, rerunData,
      { headers: this.setcookie(), withCredentials: true, }
    )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }
   // Download job details 
   public downloadJobDetails(jobId: string, jobDetailsObj: FormDataInterface): Observable<Blob> {
    let headers = this.setHeaders(); 
    headers = headers.set('Accept', '*/*');
    return this.http.post(`${this.offloadUrl}/offload/admin/jobs/${jobId}/archive`, jobDetailsObj, { 
      headers: headers,
      withCredentials: true,
      responseType: 'blob' // Expecting a blob response
    }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
}
public viewReceiptDetails(link: string, jobDetailsObj: FormDataInterface): Observable<Blob> {
  let modifiedUrl;
  let headers = this.setHeaders(); 
  headers = headers.set('Accept', '*/*');  
  if(link.toLowerCase().includes('https') === true){
    modifiedUrl = link;
  }else{
    modifiedUrl = `${this.offloadUrl}/offload/admin/jobs/${link}/archive`;
  }
  return this.http.post(`${modifiedUrl}`, jobDetailsObj, { 
    headers: headers,
    withCredentials: true,
    responseType: 'blob' // Expecting a blob response
  }).pipe(
    catchError((error) => {
      return throwError(error);
    })
  );
}
  private setHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    headers = headers.append('X-Requested-With', 'XMLHttpRequest');
    headers = headers.append('Accept', 'application/json, text/javascript, */*; q=0.01');
    return headers;
  }

  private setcookie(): HttpHeaders {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    // split the 'a' token to get user ID
    const extractedUserId = aCookieValue?.split("|")[1];
    let userId = extractedUserId ? extractedUserId : "";

    const exractedCsrfToken = this.cookieService.getCookie("csrf");
    let csrfToken = exractedCsrfToken ? exractedCsrfToken : "";
    const newheaders = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-CSRF-Token": csrfToken,
      "X-Requested-With": "XMLHttpRequest",
      Accept: "application/json, text/javascript, */*; q=0.01",
    });
    return (newheaders);
  }


  public reRefreshDetails(jobId: string): Observable<ApiJobDetailResponse> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    return this.http.get<ApiJobDetailResponse>(`${this.API_URL}/admin/jobs/${jobId}`,{withCredentials: true})
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public getAfterJobsOnInterval(timeTo: string, timeFrom: string, after:string|undefined): Observable<ApiJobResponse> {
    let params = new HttpParams();
    params = params.set('time_to', timeTo);
    params = params.set('time_from', timeFrom);
    if(after !== undefined){ params = params.set('after', after); }
    params = params.set('owner', true);

    return this.http.get<ApiJobResponse>(`${this.API_URL}/admin/jobs`, { params, headers: this.setcookie(), withCredentials: true })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public getBeforeJobsOnInterval(timeTo: string, timeFrom: string, before:string,owner?: boolean): Observable<ApiJobResponse> {
    let params = new HttpParams();
    params = params.set('time_to', timeTo);
    params = params.set('time_from', timeFrom);
    params = params.set('before', before);
    if(owner !== undefined){ params = params.set('owner', owner.toString()); }

    return this.http.get<ApiJobResponse>(`${this.API_URL}/admin/jobs`, { params, headers: this.setcookie(), withCredentials: true })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  // Fetch Summary Broadcast Messaging
  public getBroadcastMessagingSummaryDetails(jobId: string): Observable<BroadcastMessagingResponse> {
    // Make the HTTP request to get job details
    return this.http.get<BroadcastMessagingResponse>(`${jobId}`, 
    { headers: this.setcookie(), withCredentials: true })
    .pipe(
      // Handle errors
      catchError((error) => {
        return throwError(error);
      })
    )
  }

}