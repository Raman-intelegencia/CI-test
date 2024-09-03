// This service is responsible for making HTTP requests related to File Areas
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CookieService } from '@amsconnect/shared';
import { environment } from 'libs/shared/src/lib/config/environment';
import { FileAreasResponse,DeleteFileAreaData,RenameFileAreaData, CreateNewFileDirectoryBucket, FileAreasDataDirectory } from '../modals/filesAreas.model';
import { Observable,catchError,throwError } from 'rxjs';
import { FileProcessProcessorResponse, FileResponse } from '../modals/filesProcess.model';

// Create headers and set content type to multipart/form-data
const headers = new HttpHeaders();
headers.append('Content-Type', 'multipart/form-data');

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  public API_URL: string | undefined;
  private offloadUrl: string | undefined ;

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


  public adminAllFileArea(): Observable<FileAreasDataDirectory> {
    return this.http.get<FileAreasDataDirectory>(`${this.offloadUrl}/offload/admin/filearea`, {
      headers: this.setcookie(),
      withCredentials: true,
    })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public getFileAreaParticularBucket(bucketName: string): Observable<FileAreasResponse> {
    return this.http.get<FileAreasResponse>(`${this.offloadUrl}/offload/admin/filearea/${bucketName}`, {
      headers: this.setcookie(),
      withCredentials: true,
    })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public getAdminFileAreaSelectedBucket(bucketName: string): Observable<FileProcessProcessorResponse> {
    return this.http.get<FileProcessProcessorResponse>(`${this.API_URL}/admin/dropboxes?filearea=${bucketName}`, {
      headers: headers,
      withCredentials: true
    })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      )
  }

  public deleteFileBucket(bucketFileName: string): Observable<DeleteFileAreaData> {
    return this.http.delete<DeleteFileAreaData>(`${this.offloadUrl}/offload/admin${bucketFileName}`, {
      headers: this.setcookie(),
      withCredentials: true,
    })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public renameFile(previousFileName:string, data: FormData): Observable<RenameFileAreaData>{
    return this.http.put<RenameFileAreaData>(`${this.offloadUrl}/offload/admin${previousFileName}`, data, {
    headers: headers,
    withCredentials: true,
    }).pipe(
      catchError((error)=> {
        return throwError(error);
      })
    )
  }

  public createNewFileInBucket(bucketPath:string, data: FormData): Observable<RenameFileAreaData>{
    return this.http.post<RenameFileAreaData>(`${this.offloadUrl}/offload/admin${bucketPath}`, data, { 
      headers: headers,
      withCredentials: true,
    }).pipe(
      catchError((error)=> {
        return throwError(error);
      })
    )
  }

  public viewDownloadFileUrl(filePathName: string,isPngElseCsv:boolean,type:string):string{
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    let viewDownloadUrl!:string; 
    switch (type) {
      case "viewFile":
        viewDownloadUrl = `${this.offloadUrl}/offload/admin${filePathName}?force_download=false&inline=${isPngElseCsv}&a=${aCookieValue?.split("|")[0]}&X-cureatr-user=${aCookieValue?.split("|")[1]}`;
        break;
      case "downloadFile":
        viewDownloadUrl = `${this.offloadUrl}/offload/admin${filePathName}?force_download=true&inline=false&a=${aCookieValue?.split("|")[0]}&X-cureatr-user=${aCookieValue?.split("|")[1]}`;
        break;
    }
    return viewDownloadUrl; 
  }

  public createNewFileDirectoryAdminFileArea(data: FormData): Observable<CreateNewFileDirectoryBucket> {
    return this.http.post<CreateNewFileDirectoryBucket>(`${this.offloadUrl}/offload/admin/filearea`,data, {
      headers: headers,
      withCredentials: true,
    }).pipe(
        catchError((error) => {
          return throwError(error);
        })
    );
  }

  public getAdminFileAreaDetailsSelected(bucketName: string,url:string): Observable<FileResponse> {
    return this.http.get<FileResponse>(`${this.offloadUrl}/offload/admin/filearea/${url}/${bucketName}?properties`, {
      headers: this.setcookie(),
      withCredentials: true
    })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      )
  }
}