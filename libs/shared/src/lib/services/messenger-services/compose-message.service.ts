import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs/internal/Observable";
import { catchError } from "rxjs/internal/operators/catchError";
import { throwError } from "rxjs/internal/observable/throwError";
import { ComposeForm, CookieService, ExternalComposeForm, Reference, ThreadResponse, UserType } from "@amsconnect/shared";
import { environment } from "../../config/environment";

const headers = new HttpHeaders();
headers.append("Content-Type", "multipart/form-data");
@Injectable({
  providedIn: "root",
})
export class ComposeMessageService {
  public API_URL: string | undefined;
  public userType = UserType;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.API_URL = environment.baseUrl;
  }

  public getClientData(): Observable<any> {
    const newHeaders = new HttpHeaders({
      'Accept': 'application/json, text/javascript, */*; q=0.01'
    });
    return this.http
      .get(`${this.API_URL}/2015-09-01/client_data_set/get`, {
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

  // Search users api
  public searchUsers(searchText: string, searchType: string): Observable<any> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append("q", searchText);
    queryParams = queryParams.append("s", searchType);
    queryParams = queryParams.append("g", "on");
    queryParams = queryParams.append("t", "on");
    queryParams = queryParams.append("d", "on");
    queryParams = queryParams.append("r", "on");
    queryParams = queryParams.append("i", "on");
    queryParams = queryParams.append("a", "on");
    return this.http
      .get(`${this.API_URL}/profile/search3`, {
        params: queryParams,
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

  // search patients api
  public searchPatients(patientSearchText?: string): Observable<any> {
    let queryParams = new HttpParams();
    if (patientSearchText !== "") {
      queryParams = queryParams.append("query", patientSearchText ? patientSearchText : '');
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

  // attachment save api
  public saveAttachment(xCureatrUser: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append("x-cureatr-user", xCureatrUser);
    formData.append("attachment", file);
    const newHeaders = new HttpHeaders({
      'Accept': 'application/json, text/javascript, */*; q=0.01'
    })
    return this.http
      .post(`${this.API_URL}/message/attachment_save`, formData, {
        headers: newHeaders,
        withCredentials: true,
        reportProgress: true, // This is needed to report the progress of the upload
        observe: "events",
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public createThread(
    formValue: ComposeForm,
    recipients: Reference[],
    attachments: Array<string>,
    patientName: string,
    patientId?: string
  ): Observable<any> {
    const aCookieValue = this.cookieService.getCookie("a");
    // eslint-disable-next-line prefer-const
    let data = new URLSearchParams();
  
    data.append("subject", formValue.subject);
    data.append("message", formValue.message);
    data.append("urgent", formValue.urgent.toString());
  
    if (aCookieValue) {
      data.append("a", aCookieValue);
    }
    // Handle recipients
    recipients.forEach((recipient) => {
      // Assuming your API can handle multiple recipients as separate entries
      switch (recipient.type) {
        case "cureatr":
          data.append("recipients", recipient.id);
          break;
        case "role":
          if (recipient.data && recipient.data.description) {
            data.append("roles", recipient.data.description);
          }
          break;
        case "group":
          data.append("groups", recipient.id);
          break;
        default:
          console.warn("Unexpected recipient type:", recipient);
          break;
      }
    });
  
    // Handle attachments
    attachments.forEach((attachment_id) => {
      data.append("attachment_ids", attachment_id);
    });
  
    // Handle optional patientId and patientName
    if (patientId) {
      data.append("patient_id", patientId);
    }
    if (patientName) {
      data.append("patient_name", patientName);
    }
  
    // Prepare headers
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/javascript, */*; q=0.01'
    });
  
    return this.http.post(`${this.API_URL}/thread/create`, data.toString(), {
      headers: headers,
      withCredentials: true,
    }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }
  

  public createExternalThread(formValue: ExternalComposeForm): Observable<ThreadResponse> {
    const aCookieValue = this.cookieService.getCookie("a");
    // eslint-disable-next-line prefer-const
    let data = new URLSearchParams();

    data.append("department", formValue.department);
    data.append("subject", formValue.recipient_name);
    data.append("message", formValue.message);
    data.append("phone_number", formValue.to);
    if (aCookieValue) {
      data.append("a", aCookieValue);
    }
    // Prepare headers
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/javascript, */*; q=0.01'
    });

    // Looping through the recipients array and appending each user to the FormData, only if the array is not empty
    return this.http
      .post<ThreadResponse>(`${this.API_URL}/thread/create`, data.toString(), {
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
  public handleEnterKeyboardEvent(enterToSend:boolean,messageValue:string,selectedUsersLength:number): boolean {
    // Copy the code from your original method
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
        if (enterToSend && messageValue !== "" && selectedUsersLength)
        {
          return true;
      }else{
        return false;
      }
    }
    return false;
}

public moveCursorToNextLine(Data:HTMLTextAreaElement): string {
   const textarea = Data;
    if (textarea) {
      const currentCursorPosition = textarea.selectionStart;
      const textBeforeCursor = textarea.value.substring(0, currentCursorPosition);
      const textAfterCursor = textarea.value.substring(currentCursorPosition);
      const newText = `${textBeforeCursor}\n${textAfterCursor}`;
      // Move the cursor to the beginning of the next line
      const newCursorPosition = currentCursorPosition + 1;
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      return  (newText);
    }
    return ("null");
  }
}