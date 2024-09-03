import { Profiles } from '@amsconnect/shared';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ComposeDataService {
  private selectedUserIdSource = new BehaviorSubject<string>('');
  selectedUserIdSource$ = this.selectedUserIdSource.asObservable();
  private threadId = new BehaviorSubject<string>('');
  threadId$ = this.threadId.asObservable();

  private selectedThreadId = new BehaviorSubject<string>('');
  selectedThreadId$ = this.selectedThreadId.asObservable();

  private showProfileModalSubject = new BehaviorSubject<boolean>(false);
  showProfileModal$ = this.showProfileModalSubject.asObservable();

  private showShiftsSubject = new BehaviorSubject<boolean>(false);
  showShiftsSubject$ = this.showShiftsSubject.asObservable();

  private selectedThreadProfile = new BehaviorSubject<Profiles[]>([]);
  selectedThreadProfile$ = this.selectedThreadProfile.asObservable();

  public setSelectedThreadId(threadId: string, selectedThreadId: string,showProfileModalSubject:boolean):void {
    this.showProfileModalSubject.next(showProfileModalSubject);
    this.selectedUserIdSource.next(threadId);
    this.selectedThreadId.next(selectedThreadId);
  }

  public setThreadId(threadId: string):void {
    this.threadId.next(threadId);
}

  public setFlagToCallShifts(showShiftsSubject:boolean):void{
  this.showShiftsSubject.next(showShiftsSubject);
  }

  public setSelectedThreadProfile(selectedThreadProfile: Profiles[]):void{
    this.selectedThreadProfile.next(selectedThreadProfile);
    }
}
