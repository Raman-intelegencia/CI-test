 import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ErrorMessageService {
  private errorResponse = new BehaviorSubject<string>('');
  errorResponse$ = this.errorResponse.asObservable();
  private ConnectionErrorResponse = new BehaviorSubject<string>('');
  ConnectionErrorResponse$ = this.ConnectionErrorResponse.asObservable();
  private SucsessErrorResponse = new BehaviorSubject<string>('');
  SucsessErrorResponse$ = this.SucsessErrorResponse.asObservable();
  public setErrorResponse(errorResponse: string): void {
    this.errorResponse.next(errorResponse);
  } 

  public setConnectionErrorResponse(ConnectionError: string): void {
    this.ConnectionErrorResponse.next(ConnectionError);
  }  

  public set200ErrorResponse(Error: string): void {
    this.SucsessErrorResponse.next(Error);
  } 
}
