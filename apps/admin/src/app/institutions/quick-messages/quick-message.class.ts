import { ChangeDetectorRef, Injectable } from "@angular/core";
import { ChildOUsBaseComponent } from "../institution-reporting/child-OUs.class";
import { InstitutionsService } from "apps/admin/src/services/institutions.service";
import { UsersService } from "apps/admin/src/services/users.service";
import { ErrorHandlingService } from "@amsconnect/shared";
import { FormBuilder } from "@angular/forms";
import { InstitueRolesData } from "apps/admin/src/modals/institutions.model";
  
export class QuickMessagesBaseComponent extends ChildOUsBaseComponent {
    public showSuccessPopup ="";
    public successError = '';
    public showErrorPopup = false;
    public hidePreviewUser = false;
    public closeInput = false;
    public isChildVisibleSpecialties?: boolean;
    public isChildVisibleTitle?: boolean;
    public isChildVisibleServiceTeam?: boolean;
    public fileSelected: File | null = null;
    public selectedIndex: number | null = null;
    public isSelectedInstitute=false;
    public QuickMessageModalTitle = "Messages";
    public enableQuickMessageModalTitle = true;
    public selectedInstituteId !: string[]; 
    public textarea: string = '';
    public lines: string[] = [];
    public removeQuickMessage: string[]=[];
    public tags !: string[];
    public isReportingTag = false;
    public isRemoveMessage = false;
    public resetTags=false;
    public showSuccessModalPopUP:boolean = false;
    public isSpecialty!:boolean;
    public isTitles!:boolean;
    public enableOrDisableStartProcess:boolean = true;
    public selectedFileName!:string;
    public selectedFileUpload!:string;
    public checkFileSystemINCSV: File | null = null;
    public isCSVUpload:boolean = false;

    constructor(
        fb: FormBuilder,
        errorHandlingService:ErrorHandlingService,
        userSvc: UsersService,
        institutionSvc: InstitutionsService,private cd: ChangeDetectorRef){
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

    public showErrorMsg(data:InstitueRolesData):void{
        this.successError = data?.message || '';
        this.showErrorPopup = true;
      }
      public closeErrorPopup() :void{
        this.successError = "";
        this.showSuccessPopup = "";
        this.showSuccessModalPopUP = false;
      }
     public onFileSelected(event: Event):void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.files && inputElement.files.length > 0) {
          const file: File = inputElement.files[0];
          this.fileSelected = file;
        }
      }
      
      public uploadFile(event: Event): void {
        const fileInput = event.target as HTMLInputElement;
        const files = fileInput.files;
        this.selectedFileName = "";
        if (files && files.length > 0) {
          const file = files[0];
          this.selectedFileName = file.name;
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => { 
            this.selectedFileUpload = reader.result as string;  
            this.uploadProfileImage(file);
          };
          this.cd.markForCheck();
        }
      }
    
      public uploadProfileImage(storeFile: File): void {
        this.selectedFileName = storeFile.name;
        this.checkFileSystemINCSV = storeFile;
        this.isCSVUpload=true;
        this.enableOrDisableStartProcess = false;
      }
}