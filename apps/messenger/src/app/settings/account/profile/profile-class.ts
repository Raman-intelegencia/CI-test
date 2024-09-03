import { CookieService, SettingsService, UserUpdateProfile, usersImage, Users, settingsArrayStates, UserService } from "@amsconnect/shared";
import { Injectable } from "@angular/core";
import { InboxHelperService } from "../../../../services/inbox-helper.service";
import { FormGroup } from "@angular/forms";
import { Subscription } from "rxjs";

export enum ChangedButton {
  Edit = "Edit",
  Save = "Save",
}
@Injectable()
export class ProfileBaseComponent{
  public isRemovePhoto = true; 
  public isImageVisible = true; 
  public storeImageUrl = "";
  public storeProfileResponse!: UserUpdateProfile;
  public selectedIndex = 0;
  public showDropdownSpecialty = false;
  public selectedSpecialty!:string;
  public serviceTeamModalState = false;
  public selectedTitle!:string;
  public maxLength = 27;
  public showDropdownTitle = false; 
  public closeInput= false;
  public inputValue = "";
  public CellPhoneForm!: FormGroup;
  public EditOrSave = ChangedButton;
  public cellPhoneNumber !:string;
  public changeButton = this.EditOrSave.Edit;
  public specialty !:string; 
  public settingsArrayStates: settingsArrayStates = {
    filteredSpecialties: [],
    filteredTitles: [], 
    showCurrentServiceTeam: []
  };
  public instituteName!:string;
  public subscription: Subscription = new Subscription;
  public updatedUserDetails!: Users | null;

   constructor( 
    public settingsService: SettingsService, 
    public cookieService: CookieService,
    public inboxHelperSvc :InboxHelperService,
    public  userSvc: UserService
    ){}

    public removePhoto(): void {
        this.settingsService
          .setUsersImage(null, true)
          .subscribe((imageResponse: usersImage) => {
            this.isRemovePhoto = false;
            this.isImageVisible = false;
            this.storeImageUrl = imageResponse.image_id;
            this.userSvc.setImageId(imageResponse.image_id);
          });
      }
     
    public updateProfile(specialty: string, title: string): void {
        const formData = new FormData();
        const aCookieValue = this.cookieService.getCookie("a");
        if (aCookieValue) {
          formData.append("a", aCookieValue);
        }
        if (title) {
          formData.append("title", title);
        }
        if (specialty) {
          formData.append("dept", specialty);
        }
        this.settingsService
          .updateProfile(formData)
          .subscribe((profileResponse) => {
            this.storeProfileResponse = profileResponse;
          });
      }

      public setInputAndIndex():void{
        this.closeInput = false ; 
        this.selectedIndex = 0; 
      }
    
      public onListItemChange():void{
        if(this.selectedSpecialty === this.selectedSpecialty || this.selectedTitle === this.selectedTitle){
          this.closeInput = !this.closeInput ; 
        }
      }
     public closetoggleDropdown(): void{  
      this.showDropdownSpecialty = false;
      this.showDropdownTitle = false;
      }

      public editCellPhoneNumber():void{
        this.CellPhoneForm.controls['cell_phone']?.enable();
        this.changeButton = this.EditOrSave.Save;
        const inputElement = document.getElementById('editCellPhoneInput') as HTMLInputElement;
        if (inputElement) {
          inputElement.focus();
        }
      }
     public saveCellPhoneNumber():void{
      const formData = new FormData();
      const aCookieValue = this.cookieService.getCookie("a");
      formData.append("cellphone", this.CellPhoneForm.controls['cell_phone'].value);
      if (aCookieValue) {
        formData.append("a", aCookieValue);
      } 
      if(this.CellPhoneForm.controls['cell_phone'].value !==this.cellPhoneNumber){
        this.settingsService.updateUserInfo(formData).subscribe(userInfo=>{ 
          if(userInfo.status === "error"){
            this.CellPhoneForm.get('cell_phone')?.setValue(this.cellPhoneNumber);  
          } else {
            const cellPhoneNumber = this.CellPhoneForm.controls['cell_phone'].value.replace(/^\+1|[-()]/g, '');
            this.CellPhoneForm.get('cell_phone')?.setValue(cellPhoneNumber);
          }
        }) 
      } 
      this.changeButton = this.EditOrSave.Edit;
      this.CellPhoneForm.controls['cell_phone']?.disable();
      }

  public closeServiceTeamPopUp(event: Event):void{
    if(!event){
      this.serviceTeamModalState = false;
    }
  }
 
}