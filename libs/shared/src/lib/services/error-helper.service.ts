import { Injectable } from '@angular/core';

type ErrorType = 'error' | 'exception' | 'otherErrorTypes';

interface UserResponse {
  status: ErrorType,
  message: string,
  user: any
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  public getErrorResponse(data: any): string {
    let statusResponse = ["error", "exception"];
    return statusResponse.includes(data.status) ? data.message : "";
  }

  public getDefaultErrorResponse(): string {
    return `An unknown error occurred (0). Please try again, if the error persists, please contact amsconnect@americanmessaging.net.`
  }
}