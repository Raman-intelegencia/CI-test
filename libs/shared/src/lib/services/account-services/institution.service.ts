import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs/internal/observable/throwError';
import { environment } from '../../config/environment';

// const API_URL = process.env['NX_API_URL'];

@Injectable({
  providedIn: 'root'
})
export class InstitutionService {
  public API_URL:string | undefined;

  constructor(private http: HttpClient) { 
    this.API_URL = environment.baseUrl;
  }

  // SSO Login redirection path with indtitution ID
  public redirectToSamlLogin(institutionId: string):void {
    window.location.href = this.API_URL + '/saml/login/' + institutionId + '?type=web';
  }  

  public getInstitutions(): Observable<any> {
    return this.http.get(`${this.API_URL}/profile/institutions`, {withCredentials: true}).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  public getUserInstitutions(email:string):Observable<any>{
    const formData = new FormData();
    formData.append('email', email);

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');

    return this.http.post(`${this.API_URL}/profile/institutions`, formData, { headers: headers,  withCredentials: true}).pipe(
      catchError((error)=>{
        return throwError(error);
      })
    )
  }
  
}
