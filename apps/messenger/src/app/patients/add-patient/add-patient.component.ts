import { AuthService, CookieService, DateUtilsService, PatientAddress, PatientDataDetail, PatientName, PatientService, UserService, UsersAuthResponse } from "@amsconnect/shared";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AccountAssociationsService } from "../../../services/account-association-helper.service";

@Component({
    selector: "web-messenger-add-patient",
    templateUrl: "./add-patient.component.html",
    styleUrls: ["./add-patient.component.scss"],
})
export class AddPatientComponent implements OnInit {
    @Output() sendshowAddPatientButton = new EventEmitter<boolean>();
    @Output() screenVisibiltySent = new EventEmitter<boolean>();
    public addPatient: FormGroup;
    public isPatientCreate!: boolean;
    public showErrorMessage: string | undefined = "";
    public patientName!: string;
    public showVerificationModal = false;
    public required = false;
    public maxDate!: Date;
    public submitted = false;
    public patientId!: string;
    public selectedDate!: Date;
    public showAddPatientButton = false;
    public userIndex= "";
    public currentDate = "";
    

    constructor(
        private fb: FormBuilder,
        private PatientService: PatientService,
        private cookieService: CookieService,
        private authService: AuthService,
        private userService: UserService,
        private router: Router,
        private accountAssociationSvc: AccountAssociationsService,
        private dateUtilSvc: DateUtilsService
    ) {
        this.addPatient = this.fb.group({
            pid: [""],
            given: ["", Validators.required],
            family: ["", Validators.required],
            dob: ["", [Validators.required, this.maxDateValidator(this.maxDate), this.futureDateValidator]],
            sex: ["", Validators.required],
            zip: ["", Validators.required],
        });
    }
    public ngOnInit(): void {
        this.currentDate = this.dateUtilSvc.formatDate(new Date());
      this.userService.userIndex$.subscribe((userIndex:string)=>{
        this.userIndex = userIndex;
      });
        this.userService.userId$.subscribe((userID: string) => {
            this.authService.usersAuth(userID).subscribe((data) => {
                if (data.error !== "auth") {
                    this.isPatientCreate = data?.config?.client_permissions?.patient_create;
                } else {
                    this.accountAssociationSvc.explicitlyLogoutRemovedUser(userID);
                }
            });
        });

        this.maxDate = new Date();
        this.sendDataToParent();
    }

    sendDataToParent() {
        this.showAddPatientButton = false;
        this.sendshowAddPatientButton.emit(this.showAddPatientButton);
    }
    public navigatetoBack(): void{
        this.router.navigate([`u/${this.userIndex}/patients`]);
        this.screenVisibiltySent.emit(true);
    }

    public addNewPatient(): void {
        this.submitted = true;
        const patientAddress: PatientAddress = {
            zip: this.addPatient.value.zip,
        };
        const patientName: PatientName = {
            given: this.addPatient?.value?.given,
            family: this.addPatient?.value?.family,
        };
        const aCookieValue = this.cookieService.getCookie("a");
        const payload = aCookieValue
            ? {
                  id: "",
                  pid: this.addPatient.value.pid,
                  name: patientName,
                  dob: this.addPatient.value.dob,
                  sex: this.addPatient.value.sex,
                  address: patientAddress,
                  a: aCookieValue,
              }
            : {};

        this.PatientService.addNewPatient(payload).subscribe((patientData: PatientDataDetail) => {
            this.patientId = patientData?.patient?.id || "";
            const allowedStatuses = ["error", "exception"];
            this.showErrorMessage = allowedStatuses.includes(patientData?.status || "") ? patientData.message || patientData.error : "";
            this.navigateToViewPatient();
        });
    }

    public navigateToViewPatient(): void {
      if(this.userIndex){ 
        this.router
            .navigate([`u/${this.userIndex}/patients`], {
                queryParams: { id: this.patientId },
            })
            .catch((error) => {
                console.error("Navigation error:", error);
            });
          }
    }

    public closeErrorPopup(): void {
        this.showVerificationModal = this.showErrorMessage === "patient must have at least a zip code (5 or 9-digit)" ? false : true;
        this.showErrorMessage = "";
    }

    public cancelErrorpopup(): void {
        this.showErrorMessage = "";
    }

    public closeSuccessPopup(): void {
        this.showErrorMessage = "";
        this.showVerificationModal = true;
    }
    public futureDateValidator(control: AbstractControl): {
        [key: string]: boolean;
    } {
        const selectedDate = new Date(control.value);
        const minDate = new Date("1900-01-01");
        return { PastDate: selectedDate <= minDate ? true : false };
    }

    public maxDateValidator(maxDate: Date): (control: AbstractControl) => { [key: string]: boolean } | null {
        return (control: AbstractControl): { [key: string]: boolean } | null => {
            this.selectedDate = new Date(control.value);
            return { maxDateExceeded: this.selectedDate >= new Date() ? true : false };
        };
    }

    public verifyCreateButton(): boolean {
        return Boolean(
            this.addPatient.controls["given"].value &&
                this.addPatient.controls["family"].value &&
                this.addPatient.controls["dob"].value &&
                this.addPatient.controls["sex"].value &&
                this.addPatient.controls["zip"].value &&
                this.selectedDate <= this.maxDate,
        );
    }
}
