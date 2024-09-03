import { CommonService, loadLatestMessage, load_latest2, SettingsService, UsersAuthResponse, AuthUser, UserService, UserProfileService } from "@amsconnect/shared";
import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, Observable, Subscription, switchMap, tap } from "rxjs";
import { Reference, ShowModalStates, UserUpdateStatus } from "../models/off-duty-modal.model";
import { AccountAssociationsService } from "./account-association-helper.service";

@Injectable({
    providedIn: "root",
})
export class ProfileStatusHelperService {
 
    private journalId = 0;
    public loadLatestResponse!: loadLatestMessage;
    public storeImageUrl = "";
    public loadLatestResp!: load_latest2;
    public selectedUsersStatus = "";
    public customAutoResponse = "";
    public autoResponse: string | undefined;
    public storeMultipleAccountsData!: {
        url_user_associations: object;
        account_information: { [x: string]: UsersAuthResponse };
    };
    public loggedInUsersData!: UsersAuthResponse;
    public hasMultipleAccounts = false;
    public accountInformation: AuthUser[] = [];
    public userUpdateStatus: UserUpdateStatus = {
        status: "",
        away_message_mode: "",
        role: [],
        coverage: "",
        scheduler_type: "",
        removed_manual_role: "",
        away_message: "",
    };
    public showModalStates: ShowModalStates = {
        showCurrentServiceTeam: false,
        noResultsFound: false,
        isInputFocused: false,
        showAutoResponsePopup: false,
        isCustomResponseEnabled: false,
        showUserList: true,
        inputEditable: true,
        showModal: true,
    };
    public archiveChats = false;
    private subscription: Subscription = new Subscription();
    public image_id ='';
    private selectedCoverageProfile = new BehaviorSubject<Reference>({} as Reference);
    selectedCoverageProfile$ = this.selectedCoverageProfile.asObservable();
    private showUserProfileModal = new BehaviorSubject<boolean>(false);
    showUserProfileModal$ = this.showUserProfileModal.asObservable();
    constructor(
        private commonService: CommonService,
        private userProfileService: UserProfileService,
        private settingsService: SettingsService,
        private accountAssociationSvc: AccountAssociationsService,
        private userSvc: UserService
    ) {}

  

    public loadLatestWithJournalId(): Promise<void> {
        this.commonService?.journalId$.subscribe((journalId: number) => (this.journalId = journalId));
        return new Promise<void>((resolve, reject) => {
            this.userProfileService.getMessageload_latest2(this.journalId, false).subscribe({
                next: (loadLatest: load_latest2) => {
                    this.loadLatestResp = loadLatest;
                },
                error: (error: any) => {
                    console.error("Error in loadLatest():", error);
                    reject(); // Reject the promise
                },
                complete: () => {
                    resolve(); // Resolve the promise
                },
            });
        });
    }

    public uploadFile(event: Event, image_id: string | undefined): Observable<string> {
        return new Observable<string>((observer) => {
            const fileInput = event.target as HTMLInputElement;
            const files = fileInput.files;

            if (!files || files.length === 0) {
                observer.error("No files selected");
                return;
            }

            const file = files[0];
            const reader = new FileReader();

            reader.onload = () => {
                const binaryData = reader.result as string;
                this.storeImageUrl = binaryData;

                this.getUsersImageId(file, image_id).subscribe({
                    next: (response: string) => {
                        observer.next(response);
                        observer.complete();
                    },
                    error: (error) => {
                        observer.error(error);
                    },
                });
            };

            reader.readAsDataURL(file);
        });
    }

    public getUsersImageId(storeImageUrl: File, image_id: string | undefined): Observable<string> {
        return new Observable<string>((observer) => {
            this.settingsService.setUsersImage(storeImageUrl, false).subscribe({
                next: (imageResponse: any) => {
                    const imageUrl = imageResponse ? image_id + imageResponse.image_id + "_profile.png" : "";
                   this.image_id = imageResponse.image_id;
                   this.userSvc.setImageId(imageResponse.image_id);        
                    observer.next(imageUrl);
                    observer.complete();
                },
                error: (error) => {
                    observer.error(error);
                },
            });
        });
    }

    public getUserAccounts(loggedInUsersData: UsersAuthResponse): any {
        const existingData = this.accountAssociationSvc.parseJStorageData();
        this.storeMultipleAccountsData = this.accountAssociationSvc.parseJStorageData();
            this.accountInformation = [];
            const accountLists = existingData[this.accountAssociationSvc.storageKeyForUserId(loggedInUsersData.user._id.$oid,"account_associations")];
            if (loggedInUsersData && accountLists) {
                const filteredAccountList = Object.keys(accountLists as Record<string, any>)
                this.hasMultipleAccounts = filteredAccountList ? true:false;
                filteredAccountList.forEach((accountKey) => {
                    const keyValue = this.accountAssociationSvc.storageKeyForUserId(accountKey,"account_information");
                    if (existingData[keyValue]) {
                        this.accountInformation.push((existingData[keyValue] as Record<string, any>)['user']);
                    }
                });
            }
        return { account_information: this.accountInformation, hasMultipleAccounts: this.hasMultipleAccounts, storeMultipleAccsData: this.storeMultipleAccountsData };
    }

    public selectedAutoResponse(option: string): { userUpdateStatus: string; showModalStates: boolean } {
        // Reset the custom response when the radio buttons are clicked
        switch (option) {
            case "default":
                this.userUpdateStatus.away_message_mode = option;
                this.showModalStates.isCustomResponseEnabled = false;
                break;
            case "custom":
                this.showModalStates.isCustomResponseEnabled = true;
                this.userUpdateStatus.away_message_mode = option;
                break;
            case "disable":
                this.userUpdateStatus.away_message_mode = option;
                this.showModalStates.isCustomResponseEnabled = false;
                break;
            default:
                break;
        }
        return { userUpdateStatus: this.userUpdateStatus.away_message_mode, showModalStates: this.showModalStates.isCustomResponseEnabled };
    }

    public loadLatest2Response(): Observable<loadLatestMessage> {
        return combineLatest([this.commonService.journalId$, this.commonService.archiveValue$]).pipe(
            switchMap(([journalId, archiveValue]) => {
                this.journalId = journalId;
                this.archiveChats = archiveValue;
                return this.userProfileService.getMessageload_latest2(this.journalId, this.archiveChats);
            })
        );
    }

  public setSelectedCoverageProfile(selectedCoverageProfile: Reference):void{
    this.selectedCoverageProfile.next(selectedCoverageProfile);
    }

    public setShowHideUserProfileFlag(showUserProfileModal: boolean):void{
        this.showUserProfileModal.next(showUserProfileModal);
        } 
    
}
