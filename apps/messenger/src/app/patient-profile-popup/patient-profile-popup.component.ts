import { SelectedThreadHelperService, PatientDetailsResponse, PatientField, PatientService } from "@amsconnect/shared";
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";

@Component({
  selector: "web-messenger-patient-profile-popup",
  templateUrl: "./patient-profile-popup.component.html",
  styleUrls: ["./patient-profile-popup.component.scss"],
  standalone: true,
  imports: [TranslateModule, CommonModule],
})
export class PatientProfilePopupComponent implements OnInit {
  @Input() patientId!: string;
  @Input() threadId!: string;
  @Input() patientName!: string;
  @Input() showPatientProfilePopup = false;
  @Output() closePopup: EventEmitter<void> = new EventEmitter<void>();
  public patientInfo!: PatientField[];

  constructor(private patientService: PatientService, private router: Router, private selectedThreadService: SelectedThreadHelperService,) {}
  ngOnInit(): void {
    this.fetchPatientDetails();
  }

  public fetchPatientDetails(): void {
    this.patientService
      .getPatients(this.patientId,this.threadId)
      .subscribe((data: PatientDetailsResponse) => {
        this.patientInfo = data.patient.fields;
      });
  }

  public navigateToViewPatient(): void { 
    this.selectedThreadService.setThreadId(this.threadId);
    this.closePopup.emit();
    this.router
      .navigate(["u/0/patients"], {
        queryParams: { id: this.patientId},
      })
      .catch((error) => {
        console.error("Navigation error:", error);
      });
  }
  // on pop-up close emit and change the flag value
  public closePatientPopUp(): void {
    this.showPatientProfilePopup = false;
    this.patientId = "";
    this.patientName= "";
    this.closePopup.emit();
  }
}
