import {
  AuthService,
  CommonService,
  CookieService,
  PatientDetails,
  PatientService,
  PatientsResponse,
  SettingsService,
  UserService,
} from "@amsconnect/shared";
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { InboxHelperService } from "apps/messenger/src/services/inbox-helper.service";
import {
  Observable,
  Subject,
  Subscription,
  debounceTime,
  map,
  switchMap,
} from "rxjs";

@Component({
  selector: "web-messenger-existing-patients",
  templateUrl: "./existing-patients.component.html",
  styleUrls: ["./existing-patients.component.scss"],
})
export class ExistingPatientsComponent implements OnInit, OnDestroy {
  // Inject the patient service
  public isPatientCreate!: boolean;
  // Array to hold the patient data retrieved from the search
  // public patientData: PatientDetails[] = [];
  public patientData!: Observable<PatientDetails[]>;
  // Array to hold the list of patients added by the user
  public myPatientList: PatientDetails[] = [];
  public recentPatientList: PatientDetails[] = [];

  public patientSearchTextSubject = new Subject<string>();
  // Selected patient variable
  public selectedPatientId = "";
  public isPatientWatched = false;
  public is767Screen =false;
  public isNot767Screen = false;
  private queryParamsSubscription!: Subscription;
  public patientDataArray: PatientDetails[] = [];
  private patientDataSubscription!: Subscription;
  public showAddPatientButton = false;
  public userIndex ="";
  public patientList!:string;
  public showtooltip =false;
  public aCookieValue = this.cookieService.getCookie("a");
  public searchtxt = ""
  constructor(
    private patientsService: PatientService,
    private router: Router,
    private route: ActivatedRoute,private settingsService: SettingsService,
    private authService: AuthService,private cookieService: CookieService,
    private userService: UserService, private commonService: CommonService,private inboxHelperSvc: InboxHelperService,
  ) {}
  ngOnInit(): void {
    this.queryParamsSubscription = this.route.queryParams.subscribe(
      (params) => {
        this.selectedPatientId = params["id"];
      }
    );
    this.userService.userIndex$.subscribe((userIndex:string)=>{
     userIndex ? this.userIndex = userIndex: null;
    })
    this.setupPatientSearch();
 
    // On component initialization, fetch the list of user's patients
    this.getUserPatients();
    // On component initialization, fetch the list of user's patients
    this.recentUserpatients();
    this.getPatientCreateFlag();
    // Manually subscribe to patientData
    this.subscribeToPatientData(); 
   this.receivebutton(this.showAddPatientButton);
   this.commonService.COACH_MARK_MYPATIENTS_ADD$.subscribe(
    (state) => (  this.patientList =  state?.toString())
  );
  this.showtooltip =  (this.patientList === '0') ? true : false;
  if(window.innerWidth <= 767){
    this.onResize();  
}
}
public onscreenVisibiltySent(event: boolean): void {
  this.is767Screen = event;
  this.isNot767Screen = !event;
}
  public closeTooltip(): void {
    this.showtooltip = false;
    const formData = new FormData();
    formData.append("key", "seen_coach_mark_mypatients_add");
    formData.append("value", "1");
    if (this.aCookieValue) {
      formData.append("a", this.aCookieValue);
    }
    this.settingsService.setUserProperty(formData).subscribe();
  }

  // Function to setup patient search observable
  public setupPatientSearch(): void {
    this.patientData = this.patientSearchTextSubject.pipe(
      debounceTime(200),
      switchMap((searchText) =>
        this.patientsService.searchPatients(searchText)
      ),
      map((data: PatientsResponse) => data.patients)
    );
  }

  // Function to manually subscribe to patientData
  public subscribeToPatientData(): void {
    this.patientDataSubscription = this.patientData.subscribe((data) => {
      this.patientDataArray = data;
    });
  }

  // Function to search for patients based on the input value
  public searchPatients(): void {
    this.patientSearchTextSubject.next(
      this.searchtxt
    );
  }

  // Function to get the list of patients added by the user
  public getUserPatients() {
    this.patientsService
      .getUserPatients()
      .subscribe(
        (data: PatientsResponse) => (this.myPatientList = data.patients)
      );
  }

  public recentUserpatients(): void {
    this.patientsService
      .searchPatients("")
      .subscribe((data: PatientsResponse) => this.recentPatientList = data.patients);
  }

  // Function to add or remove patient from user list
  public updateUserPatient(patientId: string, action: "add" | "remove"): void {
    const observableAction =
      action === "add"
        ? this.patientsService.addUserPatients(patientId)
        : this.patientsService.removeUserPatients(patientId);

    observableAction.subscribe(() => {
      // Refresh the user's patient list
      // Function to add a patient to the user's list
      this.getUserPatients();
      this.recentUserpatients();
      this.isPatientWatched = action === "add";
      this.searchPatients();
    });
  }

  // Function to clear the search input and reset the patientData array
  public clearSearchInput(): void {
    // Clear the value of the patientSearchTxt input
    this.searchtxt = "";
    // Trigger the searchPatients function to update the patientData based on the cleared input
    this.searchPatients();
    this.getUserPatients();
    this.recentUserpatients();

  }

  // Function to remove a patient from the user's list
  public removeUserPatient(patientId: string): void {
    this.patientsService.removeUserPatients(patientId).subscribe(() => {
      // After removing a patient, refresh the user's patient list
      this.getUserPatients();
      this.recentUserpatients();
    });
  }

  // Function to prevent typing a space at the beginning of the input
  public onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLInputElement;
    if (event.key === " " && target.selectionStart === 0) {
      event.preventDefault();
    }
  }

  // function to add patientId as query params to current route path
  public selectPatient(
    patientId: string,
    isWatched: boolean | undefined
  ): void {
    // Assign the selected patient Id
    this.selectedPatientId = patientId;
    this.isPatientWatched = Boolean(isWatched);
    if(this.userIndex){
    this.router
      .navigate([`u/${this.userIndex}/patients`], {
        // relativeTo: this.route,
        queryParams: { id: patientId },
      })
      .catch((error) => {
        console.error("Navigation error:", error);
      });
    this.showAddPatientButton = true;
    if(window.innerWidth <= 767){
      this.is767Screen = false
      this.isNot767Screen =  true;  
    }
    
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.is767Screen = window.innerWidth <= 767;
    this.isNot767Screen =  false;
  }
  // function to check for the emitted data and call api for adding patient & removing the patient
  public addRemovePatient(type: "add" | "remove"): void {
    this.updateUserPatient(this.selectedPatientId, type);
  }

  public navigateToAddPatients(): void {
    this.router.navigate([`u/${this.userIndex}/patients/addPatients`]);
    this.showAddPatientButton = false;
    if(window.innerWidth <= 767){   
      this.isNot767Screen =  true;
      this.is767Screen = false  
    }
  }

  public getPatientCreateFlag(): void {
    this.authService.usersAuth().subscribe((data) => {
      this.isPatientCreate = data?.config?.client_permissions?.patient_create;
    });
  }
  public receivebutton(data:boolean):void{ 
  this.showAddPatientButton = data;
  }
  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
    if (this.patientDataSubscription) {
      this.patientDataSubscription.unsubscribe();
    }
  }
}