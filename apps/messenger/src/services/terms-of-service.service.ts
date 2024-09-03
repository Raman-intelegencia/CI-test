import { CookieService } from "@amsconnect/shared";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "libs/shared/src/lib/config/environment";
import { Observable, catchError, throwError } from "rxjs";

const headers = new HttpHeaders();
headers.append("Content-Type", "multipart/form-data");

@Injectable({
  providedIn: "root",
})
export class TermsOfServiceService {
public API_URL: string | undefined;

        constructor(
          private http: HttpClient ) {
          this.API_URL = environment.baseUrl;
        }  
    public acceptTermsOfService(formData:any): Observable<any> {    
        return this.http
          .post(`${this.API_URL}/2014-11-01/users/agreement_accept`,JSON.stringify(formData),{
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
