import { ProfileThreadData, Threads} from "@amsconnect/shared";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CommonService {
  private journalId = new BehaviorSubject(0);
  journalId$ = this.journalId.asObservable();
  private archiveValue = new BehaviorSubject(false);
  archiveValue$ = this.archiveValue.asObservable();
  private threadResponse = new BehaviorSubject<Threads[]>([]);
  threadResponse$ = this.threadResponse.asObservable();
  private matchingProfile = new BehaviorSubject<ProfileThreadData[]>([]);
  matchingProfile$ = this.matchingProfile.asObservable();
  private propertiesResponse = new BehaviorSubject<number>(0);
  propertiesResponse$ = this.propertiesResponse.asObservable();
  private COACH_MARK_MYPATIENTS_ADD = new BehaviorSubject<number>(0);
  COACH_MARK_MYPATIENTS_ADD$ = this.COACH_MARK_MYPATIENTS_ADD.asObservable();
  private COACH_MARK_SCHEDULING_CHECKBOX = new BehaviorSubject<number>(0);
  COACH_MARK_SCHEDULING_CHECKBOX$ = this.COACH_MARK_SCHEDULING_CHECKBOX.asObservable();


  public setThreadResponse(threadResponse: Threads[]): void {
    this.threadResponse.next(threadResponse);
  }

  public setJournalId(journalId: number): void {
    this.journalId.next(journalId);
  }
  public setArchiveValue(archiveValue: boolean): void {
    this.archiveValue.next(archiveValue);
  }

  public setMatchingProfile(matchingProfile: ProfileThreadData[]): void {
    this.matchingProfile.next(matchingProfile); 
  }
 
  public setCheckboxState(properties :number): void {
    this.propertiesResponse.next(properties);
  }

  public setPatientList(patientList: number): void {
    this.COACH_MARK_MYPATIENTS_ADD.next(patientList); 
  }

  public setSchedulingCheckbox(scheduling: number): void {
    this.COACH_MARK_SCHEDULING_CHECKBOX.next(scheduling); 
  }
   
}
