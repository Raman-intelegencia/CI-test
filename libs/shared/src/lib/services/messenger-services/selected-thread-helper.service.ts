import { Profiles } from '@amsconnect/shared';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SelectedThreadHelperService {
  private selectedUserIdSource = new BehaviorSubject<string>('');
  selectedUserIdSource$ = this.selectedUserIdSource.asObservable();
  private threadId = new BehaviorSubject<string>('');
  threadId$ = this.threadId.asObservable();

  private showProfileModalSubject = new BehaviorSubject<boolean>(false);
  showProfileModal$ = this.showProfileModalSubject.asObservable();

  private showShiftsSubject = new BehaviorSubject<boolean>(false);
  showShiftsSubject$ = this.showShiftsSubject.asObservable();

  private selectedThreadProfile = new BehaviorSubject<Profiles[]>([]);
  selectedThreadProfile$ = this.selectedThreadProfile.asObservable();

  private showOffDutyModal = new BehaviorSubject<boolean>(false);
  showOffDutyModal$ = this.showOffDutyModal.asObservable();
  private clearInputField = new BehaviorSubject<boolean>(false);
  clearInputField$ = this.clearInputField.asObservable();
  private selectedThreadIdSubject = new BehaviorSubject<string>('');
  selectedThreadId$ = this.selectedThreadIdSubject.asObservable();

  public setThreadId(threadId: string):void {
    this.threadId.next(threadId);
}

  public setFlagToCallShifts(showShiftsSubject:boolean){
  this.showShiftsSubject.next(showShiftsSubject);
  }

  public setSelectedThreadProfile(selectedThreadProfile: Profiles[]):void{
    this.selectedThreadProfile.next(selectedThreadProfile);
    }
    
  public setFlagToShowOffDutyModal(showOffDutyModal:boolean):void{
      this.showOffDutyModal.next(showOffDutyModal);
    }

    public setFlagToClearInputField(clearInputField:boolean):void{
      this.clearInputField.next(clearInputField);
    }

   public setSelectedThreadId(threadId: string) {
      this.selectedThreadIdSubject.next(threadId);
      localStorage.setItem('selectedThreadId', threadId || '');
    }
  
  public  getSelectedThreadIdAsync(): Promise<string | null> {
      return Promise.resolve(localStorage.getItem('selectedThreadId'));
    }
}
