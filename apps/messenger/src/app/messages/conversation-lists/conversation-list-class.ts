 
import { CommonService,loadLatestMessage,Message, Patient, PopupServiceService, Profiles,ThreadProfile,Threads } from "@amsconnect/shared";
import { computed } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ComposeHelperService } from "apps/messenger/src/services/compose-helper.service";
import { combineLatest, Subscription } from "rxjs";
const COMPOSE = "compose";
const TRUE = "true";
export class ConversationListClass { 
    public messageType = {
        externalMessage: "ExternalMessage",
        composeMessage: "InternalMessage",
    };
    public imageUrlPath = ""; 
    public patientData: Patient[] = [];
    public selectedUserId = "";
    public journalId = 0;
    public isLoadMore = false;
    public threads!: Array<Threads>;
    public profiles!:Array<Profiles>;
    public userId = "";   
    public showArchivePopUp = false;
    public archiveChats = false;
    public selectedThreadIds: string[] = [];  
    public archive!: number;  
    public coverageId = '';
    public composePopupValue = this.messageType.composeMessage;
    public subscription!: Subscription;
    public composePopups = computed(() => this.popUpService.composePopups());
    public externalComposePopups = computed(() => this.popUpService.externalComposePopups());
    public getIdAndtype!: { coverageId: string; type: string; };
    public isNoResultsFound = false;
    public storeSearchResultsThreads: Threads[] = [];
    public isSearchDisabled = true;
    public allChatThreads: ThreadProfile[] = []; 
    public unreadChatThreads: ThreadProfile[] = [];
    public otherChatThreads: ThreadProfile[] = [];
    constructor(public commonService: CommonService, public popUpService: PopupServiceService, public router: Router,
        public activatedRoute: ActivatedRoute, public composeHelperService:ComposeHelperService) {
        }
 
    public setSchedulingCheckbox(schedulingCheckbox: number): void {
        this.commonService.setSchedulingCheckbox(schedulingCheckbox);
    }

    public setPatientList(patientsList: number): void {
        this.commonService.setPatientList(patientsList);
    }

    public updateJouralId(id: number): void {
        this.journalId <= id ? (this.commonService.setJournalId(id), (this.journalId = id)) : null;
    }

    public getLastThreadTimeUpdated(): number | null {
        const threadsLength = this.threads.length;
        if (threadsLength) {
            return this.threads[threadsLength - 1].time_updated.$date;
        } else {
            return null;
        }
    }

    // On archive cancel toggle the flag and empty the selected threads array
    public cancelArchive(): void {
        this.archiveChats = !this.archiveChats;
        this.selectedThreadIds = [];
    }

    public getUserName(user: Profiles): string {
        return `${user.first_name}  ${user.last_name}`;
    }

    public getImageUrl(image_id: string): string {
        return this.imageUrlPath + image_id + "_profile.png";
    }

    public isUrgentAndUnread(messages: Message[] | undefined): boolean {
        if (!messages) {
            return false; // Return false if messages are undefined or null
        }
        return messages.some((message) => message.urgent === true && message.status === "unread");
    }

    public checkIfUserMessage(messageUserId: string): boolean {
        return messageUserId === this.userId;
    } 

    public getInitials(firstName: string | null | undefined, lastName: string | null | undefined): string {
        return `${firstName ? firstName.charAt(0).toUpperCase() : ""}${lastName ? lastName.charAt(0).toUpperCase() : ""}`;
    } 

    public getProfileNames(profiles: Array<Profiles> | undefined): string {
        return `${profiles
            ?.map((profile: Profiles) => `${profile.first_name} ${profile.last_name}`)
            .slice(0, 3)
            .toString()} ${profiles && profiles?.length > 3 ? "+ 1 more" : ""}`;
    }

    public resetArchivePopUp(): void {
        this.showArchivePopUp = false;
    }

  public getProfileDetails(id:string):string{
    const profile = this.profiles?.find(p => p._id.$oid === id);
    return `${profile?.first_name} ${profile?.last_name}`;
  }

  // to add and remove query params to the relative route path
  private updateQueryParams(params: object) {
    const mergedQueryParams = {
        ...this.activatedRoute.snapshot.queryParams,
        ...params,
    };

    this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: mergedQueryParams,
    });
}

public onComposeButtonClick(): void {
    if (this.composePopupValue === this.messageType.composeMessage) {
        const composeData = { to: [], patient: "", subject: "", message: "" ,eventType : "compose"};
        this.popUpService.addComposePopUp(composeData);
    } else {
        const composeData = { to: "", recipient_name: "", message: "" };
        this.popUpService.addExternalComposePopUp(composeData);
    }
}

  // add the query params to current path
  public addComposeQueryParams(messageType: string = this.messageType.composeMessage): void {
    if (messageType == this.messageType.composeMessage) {
        this.getIdAndtype = {coverageId:"",type:''};
        this.subscription = combineLatest([
            this.composeHelperService.coverageId$,
            this.composeHelperService.userId$,
            this.composeHelperService.patientData$
          ]).subscribe(([coverageId,userId, patientData]) => {
            this.coverageId = coverageId; 
            this.selectedUserId = userId;
            this.patientData = patientData;
          });
      if(this.selectedUserId){
        this.composeHelperService.sendUserIdToCompose(""); 
    }
    if(this.patientData){
        this.composeHelperService.sendPatientDataToCompose([]);
    } 
      this.coverageId ? this.composeHelperService.setCoverageId("") : '';
        const queryParams = { [COMPOSE]: this.messageType.composeMessage };
        this.composePopupValue = this.messageType.composeMessage;
        this.updateQueryParams(queryParams);
        this.onComposeButtonClick();
    } else {
        const queryParams = { [COMPOSE]: this.messageType.externalMessage };
        this.composePopupValue = this.messageType.externalMessage;
        this.updateQueryParams(queryParams);
        this.onComposeButtonClick();
    }
}

 // add the query params to current path
 public addComposeQueryParamsForCoverageId(getIdAndtype:{ coverageId: string; type: string; },messageType: string = this.messageType.composeMessage): void {
    if (messageType == this.messageType.composeMessage) {
        if(this.selectedUserId){
            this.composeHelperService.sendUserIdToCompose("");   
        }
        if(this.patientData){
            this.composeHelperService.sendPatientDataToCompose([]);
        } 
        this.getIdAndtype = {coverageId:getIdAndtype.coverageId,type:getIdAndtype.type};
             const queryParams = { [COMPOSE]: this.messageType.composeMessage };
             this.composePopupValue = this.messageType.composeMessage;                 
             this.updateQueryParams(queryParams);
             this.onComposeButtonClickCoverage();
         } else {
             const queryParams = { [COMPOSE]: this.messageType.externalMessage };
             this.composePopupValue = this.messageType.externalMessage;
             this.updateQueryParams(queryParams);
             this.onComposeButtonClickCoverage();
         }
     }
// check if its last pop-up then remove query params and close it
public closeComposePopup(index: number, messageType = this.messageType.composeMessage): void {
    messageType === this.messageType.composeMessage ? this.popUpService.removeComposePopUp(index) : this.popUpService.removeExternalComposePopUp(index);
    if (this.composePopups().length === 0 && this.externalComposePopups().length === 0) {
        this.updateQueryParams({ [COMPOSE]: null });
    }
}

  public addComposeQueryParamsForSendMsg(userId:string,messageType: string = this.messageType.composeMessage): void {
    if (messageType == this.messageType.composeMessage) { 
      this.subscription.add(this.composeHelperService.coverageId$.subscribe(
            (state) => {
              this.coverageId = state;  
            }
          ));
      if(this.coverageId) {
        this.composeHelperService.setCoverageId("")
      }
      this.subscription.add(this.composeHelperService.patientData$.subscribe(
        (state) => {
          this.patientData = state;   
        }
      ));
    if(this.patientData){
        this.composeHelperService.sendPatientDataToCompose([]);
    } 
    this.selectedUserId = userId;
    this.composeHelperService.sendUserIdToCompose(this.selectedUserId);
        const queryParams = { [COMPOSE]: this.messageType.composeMessage };
        this.composePopupValue = this.messageType.composeMessage;
        this.updateQueryParams(queryParams);
        this.onComposeButtonClick();
    } else {
        const queryParams = { [COMPOSE]: this.messageType.externalMessage };
        this.composePopupValue = this.messageType.externalMessage;
        this.updateQueryParams(queryParams);
        this.onComposeButtonClick();
    }
}

  // subscribe to query params if compose true
  public listenRouteParams(): void {
    if (this.subscription) {
        this.subscription.unsubscribe();
    }
    this.subscription = this.activatedRoute.queryParams.subscribe((params) => {
        if (params[COMPOSE] === TRUE && this.composePopups().length === 0) {
            this.onComposeButtonClick();
        }
    });
}

// push the compose form object to array using pop-up service
public onComposeButtonClickCoverage(): void {
    if (this.composePopupValue === this.messageType.composeMessage) {
        const composeData = { to: [], patient: "", subject: "", message: "" ,eventType : 'userProfile'};
        this.popUpService.addComposePopUp(composeData);
    } else {
        const composeData = { to: "", recipient_name: "", message: "" };
        this.popUpService.addExternalComposePopUp(composeData);
    }
}

public clearChatThreads(): void {
    this.allChatThreads = [];
    this.otherChatThreads = [];
    this.unreadChatThreads = [];
}


public separateChatThreads(): void {
    this.unreadChatThreads = this.allChatThreads.filter((thread) => thread.thread.unread_count > 0);
    this.otherChatThreads = this.allChatThreads.filter((thread) => thread.thread.unread_count === 0);
}

public trackByThreadId(index: number, item: ThreadProfile): string {    
    return item?.thread?._id?.$oid;
  }
}
