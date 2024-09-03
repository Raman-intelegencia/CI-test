import { Component,ElementRef, Injectable, ViewChild } from "@angular/core";
import { ChildOUsBaseComponent } from "../institution-reporting/child-OUs.class";
import { InstitutionsService } from "apps/admin/src/services/institutions.service";
import { UsersService } from "apps/admin/src/services/users.service";
import { ErrorHandlingService } from "@amsconnect/shared";
import { FormBuilder } from "@angular/forms";
import { InstitueRolesData } from "apps/admin/src/modals/institutions.model";
  
export class BroadcastMessageBaseComponent extends ChildOUsBaseComponent {

    public showSuccessPopup ="";
    public successError = '';
    public showErrorPopup = false;
    public hidePreviewUser = false;
    public closeInput = false;
    public isChildVisibleSpecialties?: boolean;
    public isChildVisibleTitle?: boolean;
    public isChildVisibleServiceTeam?: boolean;
    public isSpecialty!:boolean;
    public isTitles!:boolean;    
    constructor(
        fb: FormBuilder,
        errorHandlingService:ErrorHandlingService,
        userSvc: UsersService,
        institutionSvc: InstitutionsService,){
        super(fb,errorHandlingService,userSvc,institutionSvc);
    }

    public openSpecialties(): void {
        if(this.hidePreviewUser)
        {
          this.isChildVisibleSpecialties = true;
          this.isSpecialty=true;
        }
      }
      public openTitle(): void {
        if(this.hidePreviewUser)
        {
          this.isChildVisibleTitle = true;
          this.isTitles=true;
        }
      }
      public openServiceTeam(): void {
        if(this.hidePreviewUser)
        {
        this.isChildVisibleServiceTeam = true;
        }
      }

    public onListItemChange(): void {
        if (this.selectedInstitute === this.selectedInstitute) {
          this.closeInput = !this.closeInput;
        }
      }
    public showErrorMsg(data:InstitueRolesData):void{
        this.successError = data?.message || '';
        this.showErrorPopup = true;
      }
      public closeErrorPopup() :void{
        this.successError = "";
        this.showSuccessPopup = "";
      }
      public closePopUp(value:boolean):void{
        this.isSpecialty=value     
      }
      public closeTitlesPopUp(value:boolean):void{
        this.isTitles=value
      }

}
