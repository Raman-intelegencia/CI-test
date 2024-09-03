import {
  AuthService, 
  ExtractedThreadDetail, 
  Patient,
  PatientDetailsResponse,
  PatientFieldValue,
  PatientInfo,
  PatientService,
  PatientThreadResponse,
  PopupServiceService, 
  Thread, 
  ThreadProfile,
  SelectedThreadHelperService,
  UserProfileInfo,
  UserService,
  UsersAuthResponse,ThreadHelperService
} from "@amsconnect/shared";
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  computed,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router"; 
import { Subscription, combineLatest } from "rxjs";
import { ViewPatientClass } from "./view-patient-class";
import { ComposeHelperService } from "../../../services/compose-helper.service";
import { ComposeService } from "../../../services/compose.service";

const COMPOSE = 'compose';
const TRUE = 'true';
@Component({
  selector: "web-messenger-view-patient-details",
  templateUrl: "./view-patient-details.component.html",
  styleUrls: ["./view-patient-details.component.scss"],
})
export class ViewPatientDetailsComponent extends  ViewPatientClass implements OnInit, OnDestroy {
  @Input() patientId = ""; 
  public patientsData: Patient[] = [];
  @Input() isPatientWatched = false;
  @Output() addRemovePatientFromMyList = new EventEmitter<"add" | "remove">();
  @Output() screenVisibiltySent = new EventEmitter<boolean>();
  public patientThreads: ExtractedThreadDetail[] = [];
  private subscription: Subscription[] = [];
  public userIndex ="";
  public threadId ="";
  public label_annotation !:string;
  public composePopups = computed(() => this.popUpService.composePopups());
  public externalComposePopups = computed(() => this.popUpService.externalComposePopups());
  public patientData: Patient[] = [];
  public authResponseData!: UsersAuthResponse;
  public userType = "";
  public selectedProfile!: ThreadProfile;
  public user !:UserProfileInfo; 
  public filteredData = false;
  public threads !:Thread[]
 
  constructor(
    private patientService: PatientService,
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private popUpService: PopupServiceService,
    private authService: AuthService,
    public threadHelperService: ThreadHelperService,private selectedThreadService: SelectedThreadHelperService,
    public composeHelperService:ComposeHelperService, private composeService:ComposeService
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["patientId"]) {
      // Check if 'patientId' input has changed
      this.fetchPatientDetails(this.patientId,this.threadId);
      this.changeTab("patient-info");  
      }
  }

  ngOnInit(): void {
    this.subscription.push(this.selectedThreadService.threadId$.subscribe(
      (state) => ( this.threadId = state )
    ));
    this.getPatientThreads(this.patientId,this.threadId);
    this.subscription.push(
      this.userService.userId$.subscribe((userId) => (this.userId = userId)),
      this.authService.authResponseData$.subscribe(
        (data: UsersAuthResponse) => {
          this.authResponseData = data;
          this.userType = this.userService.getUserType(this.authResponseData.user);
        }
      )
    );
    this.listenRouteParams(); 
    this.userService.userIndex$.subscribe((userIndex:string)=>{
      userIndex ? this.userIndex = userIndex: null;
     }) 
     this.subscription.push(this.userService.imageUrlPath$.subscribe(state=>{
      this.imageUrlPath = state }))
     this.isShowArchivedChats = this.threadHelperService.getArchiveCheckboxState();  
     
  }

  public fetchPatientDetails(patientId: string,threadId:string): void {
    this.patientService
      .getPatients(patientId,threadId)
      .subscribe((data: PatientDetailsResponse) => {
        this.extractPatientKeyValues(data.patient.fields[0].value); 
        this.label_annotation = data.patient?.fields[0]?.label_annotation?.value as string; 
      });
  }
  public navigatetoBack(): void{
    this.router.navigate([`u/${this.userIndex}/patients`]);
    this.screenVisibiltySent.emit(true);
  }

  public extractPatientKeyValues(patientFieldValue: PatientFieldValue[]): void {
    const labelToKeyMap: { [key: string]: keyof PatientInfo } = {
      Institution: "institution",
      "ID Number": "id_number",
      Name: "name",
      DOB: "dob",
      Sex: "sex",
      Address: "address",
          };

    this.patientInfo = patientFieldValue.reduce(
      (acc: PatientInfo, field: PatientFieldValue) => {
        const key = labelToKeyMap[field.label];
        if (key) {
          acc[key] = Array.isArray(field.value)
            ? field.value.join(", ")
            : field.value;
        }
        return acc;
      },
      {
        institution: "",
        id_number: "",
        name: "",
        dob: "",
        sex: "",
        address: "",
       } as PatientInfo
    );

    this.patientData.push({
      id: this.patientId,
      name: this.patientInfo.name,
      pid: this.patientInfo.id_number,
      dob: this.patientInfo.dob,
      sex: this.patientInfo.sex, 
    }); 
  }

  public getPatientThreads(patientId: string,threadId:string): void {
    this.patientService
      .getPatientthreads(patientId,threadId)
      .subscribe((data: PatientThreadResponse) => {
        this.patientThreads = this.extractThreadDetails(
          data.threads,
          data.profiles,
          this.userId  
          );   
          this.threads =  data.threads; 
        data.profiles.filter(user => { 
          data.threads.filter(res => {  
            if(user._id  === this.userId){  
              this.user = user; 
            }}) 
        });
        
        this.filteredData = this.patientThreads.every((item) => item.visibility !== undefined); 
      })}

      public swapActiveExternalPopup(index: number) {
        this.popUpService.swapComposeExternalPopUps(index);
    }


  public addRemovePatient(type: "add" | "remove"): void {
    this.addRemovePatientFromMyList.emit(type);
  }

  // compose pop-up functions
  // subscribe to query params if compose true
  private listenRouteParams(): void {
    this.subscription.push(
      this.activatedRoute.queryParams.subscribe((params) => {
        if (params[COMPOSE] === TRUE && this.composePopups().length === 0) {
          this.onComposeButtonClick();
        }
      })
    );
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

  // push the compose form object to array using pop-up service
  public onComposeButtonClick(): void {
    const composeData = {
      to: [],
      patient: this.patientInfo.name,
      subject: "",
      message: "",
    };
    this.popUpService.addComposePopUp(composeData);
  }

  // send the index of the pop-up to swap with using pop-up service
  public swapActivePopup(index: number) {
    this.popUpService.swapComposePopUps(index);
  }

  // add the query params to current path
  public addComposeQueryParams(): void {
    this.subscription.push(combineLatest([
      this.composeHelperService.coverageId$,
      this.composeHelperService.userId$,
      this.composeHelperService.patientData$
    ]).subscribe(([coverageId,userId, patientData]) => {
      this.coverageId = coverageId; 
      this.selectedUserId = userId;
      this.patientData = patientData;
    }));
    if(this.selectedUserId){
      this.composeHelperService.sendUserIdToCompose(""); 
  }
  if(this.coverageId) {
    this.composeHelperService.setCoverageId("")
  } 
    const patientData = this.patientData.filter(data => data.id === this.patientId); 
    if(!patientData.length){
      patientData.push(
        {
          id: this.patientInfo.id_number,
          name: this.patientInfo.name,
          pid: this.patientInfo.id_number,
          dob: this.patientInfo.dob,
          sex: this.patientInfo.sex
        }
        )
      }
    this.composeHelperService.sendPatientDataToCompose(patientData);
    const queryParams = { [COMPOSE]: TRUE };
    this.updateQueryParams(queryParams);
    this.onComposeButtonClick();
  }
  public addComposeQueryParamsForCoverageId(getIdAndtype:{ coverageId: string; type: string; },messageType = "InternalMessage"): void {
    this.composeHelperService.setCoverageId(getIdAndtype.coverageId);
    this.composeService.addComposeQueryParamsForCoverageId(getIdAndtype,messageType);
 }

 public addComposeQueryParamsForUserId(userId: string,messageType = 'InternalMessage'): void {
  this.composeService.addComposeQueryParamsForUserId( userId,messageType);
}
  // check if its last pop-up then remove query params and close it
 public closeComposePopup(index: number, messageType = this.messageType.composeMessage): void {
        messageType === this.messageType.composeMessage ? this.popUpService.removeComposePopUp(index) : this.popUpService.removeExternalComposePopUp(index);
        if (this.composePopups().length === 0 && this.externalComposePopups().length === 0) {
            this.updateQueryParams({ [COMPOSE]: null });
        }
    }

  public toggleThreadSelection(threadId: string): void { 
    this.router.navigate([`u/${this.userIndex}/inbox/thread/${threadId}`]); 
}

  // unsubscribe the subscription to prevent data leaks
  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }
}
