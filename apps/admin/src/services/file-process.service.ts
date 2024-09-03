// This service is responsible for making HTTP requests related to File Areas
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CookieService } from '@amsconnect/shared';
import { environment } from 'libs/shared/src/lib/config/environment';
import { FileAreasResponse,DeleteFileAreaData,RenameFileAreaData, CreateNewFileDirectoryBucket } from '../modals/filesAreas.model';
import { BehaviorSubject, Observable,catchError,throwError } from 'rxjs';
import { AddViewEditProcessingAdtProcessorData, AdtProcessorSubjectData, Editprocessor, FileProcessProcessorResponse, ViewFileProcessProcessorResponse } from '../modals/filesProcess.model';

// Create headers and set content type to multipart/form-data
let headers = new HttpHeaders();
headers.set('Content-Type', 'multipart/form-data');

@Injectable({
  providedIn: 'root'
})
export class FilesProcessService {
  public API_URL: string | undefined;
  private offloadUrl: string | undefined ;

  public dataAddADTSubject = new BehaviorSubject<AdtProcessorSubjectData>({urlRoute: '',cancelRoute: ''});
  dataAddADT$ = this.dataAddADTSubject.asObservable();

  public dataAddProcessorSubject = new BehaviorSubject<AdtProcessorSubjectData>({urlRoute: '',cancelRoute: ''});
  dataAddProcessor$ = this.dataAddProcessorSubject.asObservable();

 
  constructor(
    private http: HttpClient,
    private cookieService: CookieService) {
      this.API_URL = environment.baseUrl;
      this.offloadUrl = environment.offloadUrl;
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

 

  public addProcessorArea(data: Editprocessor): Observable<ViewFileProcessProcessorResponse> {
    return this.http.post<ViewFileProcessProcessorResponse>(`${this.API_URL}/admin/dropboxes`,data, {
      headers: headers,
      withCredentials: true,
    }).pipe(
        catchError((error) => {
          return throwError(error);
        })
    );
  }

  public viewCreatedProcessor(id:string): Observable<ViewFileProcessProcessorResponse> {
    return this.http.get<ViewFileProcessProcessorResponse>(`${this.API_URL}/admin/dropboxes/${id}`,{
      headers: headers,
      withCredentials: true,
    }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }


  public addADTSubjectData(ADTData: AdtProcessorSubjectData):void {
    this.dataAddADTSubject.next(ADTData);
  }

  public addAddProcessorSubjectData(AddProcessorData: AdtProcessorSubjectData):void {
    this.dataAddProcessorSubject.next(AddProcessorData);
  }
}