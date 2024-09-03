import { ComposeData, ComposeMessageService, Patient, ProfileSearchResult, Reference, ROLE_NOTIFY, UserType } from "@amsconnect/shared";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ConversationSettingsService } from "./conversation-settings.service";
import { HttpEventType } from "@angular/common/http";

interface UploadData {
  file: File;
  progress: number;
  isComplete: boolean;
  id: string | null;
  isError: boolean;
}
@Injectable({
  providedIn: "root",
})
export class ComposeHelperService {
  private coverageId = new BehaviorSubject<string>('');
  coverageId$ = this.coverageId.asObservable();
  private userId = new BehaviorSubject<string>('');
  userId$ = this.userId.asObservable();
  private patientData = new BehaviorSubject<Patient[]>([]);
  patientData$ = this.patientData.asObservable();
  public userType = UserType;
  private coverageUserData = new BehaviorSubject<Reference>({} as Reference);
  coverageUserData$ = this.coverageUserData.asObservable();
  private userProfileData = new BehaviorSubject<Reference>({} as Reference);
  userProfileData$ = this.userProfileData.asObservable();
  constructor(private conversationSettings:ConversationSettingsService, private composeService: ComposeMessageService) {}

  public getFormattedNames(selectedUsers: Reference[]): string {
    const names = selectedUsers
      .map((user) => {
        switch (user?.type) {
          case this.userType.Cureatr:
            return `${user?.data?.first_name} ${user?.data?.last_name}`;
          case this.userType.Role:
            return user?.data?.description;
          case this.userType.Group:
            return user?.data?.name;
          default:
            return "";
        }
      })
      .filter((name) => name) // This removes any empty names that might result from the default case.
      .join(", ");
    return names.length > 25 ? names.substring(0, 30) + "..." : names;
  }

  public updateOffDutyUsers(composeData: ComposeData,allUsersDataList: Reference[]): {
    selectedOffDutyUsers: Reference[];
    selectedUserDataWithCStatus: Reference[];
  } {
    const userDataWithCStatus = [];
    composeData.selectedOffDutyUsers = composeData.selectedUsers?.filter(
      (u: Reference) =>
        (u?.data?.status?.s === "off" || u?.data?.status?.s === "busy") &&
        u.type !== "role"
    );
    for (const user of composeData.selectedOffDutyUsers) {
      if (user?.data?.status?.c) {
        const userData = allUsersDataList?.find(
          (userData: any) => userData.id === user?.data?.status?.c?.ref
        );
        if (userData) {
          userDataWithCStatus.push(userData);
        }
      }
    }
    composeData.selectedUserDataWithCStatus = userDataWithCStatus;
    return {
      selectedOffDutyUsers: composeData.selectedOffDutyUsers,
      selectedUserDataWithCStatus: userDataWithCStatus,
    };
  }

  public removeUser(composeData: ComposeData, user: Reference): ComposeData {
    composeData.selectedUsers = composeData.selectedUsers.filter(
      (u: Reference) => u !== user
    );
    composeData.usersDataList.push(user);
    return composeData;
  }

  public selectPatient(
    composeData: ComposeData,
    patient: Patient
  ): ComposeData {
    if (composeData.selectedPatients.length === 0) {
      composeData.selectedPatients.push(patient);
      composeData.patientsDataList = composeData.patientsDataList.filter(
        (u: Patient) => u !== patient
      );
    }
    return composeData;
  }

  public removePatient(
    composeData: ComposeData,
    patient: Patient
  ): ComposeData {
    composeData.selectedPatients = composeData.selectedPatients.filter(
      (u: Patient) => u !== patient
    );
    composeData.patientsDataList.push(patient);
    return composeData;
  }

  public selectedProfileUserId(selectedUserId: string): Observable<{ userList: Reference[], selectedUsers: Reference | undefined }> {
    return new Observable(observer => {
      this.conversationSettings.profileSearch(true, true).subscribe((data: ProfileSearchResult) => {
        const usersDataList = data.references;
        const selectedUser = usersDataList.find((user: Reference) => user.id === selectedUserId);        
        observer.next({ userList: usersDataList, selectedUsers: selectedUser });
        observer.complete();
      });
    });
  }

  public uploadFile(userId: string, event: any): Observable<any> {
    return new Observable(observer => {
      if (event.target.files && event.target.files[0]) {
        const files = Array.from(event.target.files);
        const uploadedFiles:UploadData[] = [];
  
        // Clear the file input value to allow selecting the same file again
        event.target.value = "";
  
        for (const file of files) {
          const uploadData = {
            file: file as File,
            progress: 0,
            isComplete: false,
            id: null,
            isError: false,
          };
  
          uploadedFiles.push(uploadData);
          this.composeService.saveAttachment(userId, file as File).subscribe(
            (event) => {
              if (event.type === HttpEventType.UploadProgress) {
                const percentDone = Math.round((100 * event.loaded) / event.total);
                uploadData.progress = percentDone;
              } else if (event.type === HttpEventType.Response) {
                uploadData.isComplete = true;
                uploadData.id = event.body.id;
              }
              observer.next(uploadedFiles);
            },
            (error) => {
              console.error("Error uploading file:", error);
              uploadData.isComplete = true;
              uploadData.isError = true;
              observer.error(error);
            }
          );
        }
      } else {
        observer.complete();
      }
    });
  }

  public setCoverageId(coverageId: string):void { 
    this.coverageId.next(coverageId);
}

public sendUserIdToCompose(userId: string):void { 
  this.userId.next(userId);
}
public sendPatientDataToCompose(patientData: Patient[]):void { 
  this.patientData.next(patientData);
}

public setCoverageUserData(coverageUser: Reference):void { 
  this.coverageUserData.next(coverageUser);
}

public setUserProfileData(userProfileResponse: Reference):void { 
  this.userProfileData.next(userProfileResponse);
}
public adjustHeight(inputElement: HTMLTextAreaElement, offset: number): void {
  const currentHeight = inputElement.scrollHeight;
  const newHeight = currentHeight + offset;
  if (newHeight > 40) {
    inputElement.style.height = `${newHeight}px`;
  }
}

public resetHeightToDefault(inputElement: HTMLTextAreaElement): void {
  inputElement.style.height = 'auto';
  inputElement.style.height = '40px'; 
}

public commonAdjustOverflowY(textarea: HTMLTextAreaElement): void {
  if (textarea.scrollHeight > textarea.clientHeight) {
    textarea.style.overflowY = 'scroll';
  } else {
    textarea.style.overflowY = 'hidden';
  }
}
  
}
