import { Component } from '@angular/core';
import { InstitutionsService } from '../../../services/institutions.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateInstitutionResponse } from '../../../modals/institutions.model';
import { AppNavigationService } from '../../../services/app-navigation.service';

@Component({
  selector: "web-messenger-create-institution",
  templateUrl: "./create-institution.component.html",
  styleUrls: ["./create-institution.component.scss"],
})
export class CreateInstitutionComponent {
  public createInstitutionForm!: FormGroup;
  public institutionResponseData!: CreateInstitutionResponse;
  public showValidationPopup = false; //flag to show validation pop-up
  public modalShowMessage = ''; // Initialize the modal message

  constructor(
    private institutionService: InstitutionsService,
    private fb: FormBuilder,
    public navigateSvc: AppNavigationService,
  ) {
    this.createInstitutionForm = this.fb.group({
      id: ["", Validators.required],
      short_name: ["", Validators.required],
      name: ["", Validators.required],
    });
  }

  public get f():{[key:string]:AbstractControl}{
    return this.createInstitutionForm.controls;
  }

  // create institution function
  public createInstitution(): void {
    if (this.createInstitutionForm.invalid) {
      // Construct the message based on missing fields
      // eslint-disable-next-line prefer-const
      let missingFields = [];
      if (!this.f['id'].value) {
        missingFields.push("ID");
      }
      if (!this.f['short_name'].value) {
        missingFields.push("Short Name");
      }
      if (!this.f['name'].value) {
        missingFields.push("Name");
      }
      // Update the message for the modal
      if (missingFields.length > 0) {
        this.modalShowMessage = missingFields.join(", ") + " are all required to save an institution";
      } else {
        this.modalShowMessage = "All fields are filled.";
      }
      // Show the validation popup
      this.showValidationPopup = true;
      return;
    }
    // Proceed with form submission if valid
    this.institutionService.createInstitution(this.createInstitutionForm.value).subscribe((data: CreateInstitutionResponse) => {
      if (data.status !== 'error') {
        this.institutionResponseData = data;
        // navigate to institution detail page when institute is created
        this.navigateSvc.navigate([`/institution/${this.institutionResponseData.institution.id}`])
        // Hide the validation popup if it was previously shown
        this.showValidationPopup = false;
      }
    });
  }
  
  // reset create institution form
  public resetInstitutionForm():void{
    this.createInstitutionForm.reset();
  } 

   // close the error modal & create the modal message
   public closepopup(): void {
    this.modalShowMessage = '';
    this.showValidationPopup = false;
  }

}