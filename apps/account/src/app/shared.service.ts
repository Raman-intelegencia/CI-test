import { Institution } from "@amsconnect/shared";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SharedService {
  private emailId = new BehaviorSubject<string>('');
  emailId$ = this.emailId.asObservable();
  private institutionName = new BehaviorSubject<string>('');
  institutionName$ = this.institutionName.asObservable();
  private institutionId = new BehaviorSubject("");
  institutionId$ = this.institutionId.asObservable();
  private showPasswordScreen = new BehaviorSubject<string>('');
  showPasswordScreen$ = this.showPasswordScreen.asObservable();
 

  constructor() {

  }
  public setEmailID(emailID: string): void {
    this.emailId.next(emailID);
  }

  public setInstitutionName(instName: string): void {
    this.institutionName.next(instName);
  }

  public setInstitutionID(institutionId: string): void {
    this.institutionId.next(institutionId);
  }

  public setShowPasswordScreenFlag(showPasswordScreen: string): void {
    this.showPasswordScreen.next(showPasswordScreen);
  }
 
  
}
