 
import { InstitutionService } from '@amsconnect/shared';
import { Injectable } from '@angular/core';
import { UserBaseComponent } from '../create-user/create-user.class';
import { Router } from '@angular/router';
import { UsersService } from '../../../services/users.service';
import { sendActivationMail } from '../../../modals/users.model';
import { FormGroup } from '@angular/forms';
import { AppNavigationService } from '../../../services/app-navigation.service';

@Injectable()
export class UserDetailChildBaseComponent extends UserBaseComponent {
  public showResendSuccessModal = false;
  public resendActivationMailData!: sendActivationMail;
  public showServiceTeamModal = false;
  constructor(
  institutionsService: InstitutionService,
  public router: Router,
  public userSvc: UsersService,
  public navigateSvc: AppNavigationService,
  ) {
    super(institutionsService);
  }

  public toggleSpecialtyDropdown(event: Event,currentInstitute:string): void {
    event.stopPropagation();
    this.showInstituteDropdown = false;
    this.showspecialtyDropdown = !this.showspecialtyDropdown;
    this.showTitleDropdown = false;
    this.setToggleProperty();
    this.getSpecialityAndTitleBasedInstitution(currentInstitute,"edit");
  }
  public setToggleProperty():void{
    this.closeInput = false;
    this.selectedIndex = 0;
  }
  public searchProperty(name: Event, propertyName: 'selectedSpecialty' | 'selectedTitle'): void {
    name.stopPropagation();
    const typedName = name;  
    if (typeof typedName !== 'string') {
    return;
    }  this[propertyName] = typedName;
    }

    public onListItemChange(): void {
      if (this.selectedInstitute === this.selectedInstitute) {
        this.closeInput = !this.closeInput;
      }
    } 
    public clickSpecialtyTitle(event: Event): void {
      event.stopPropagation();
    }

    public toggleTitleDropdown(event: Event,currentInstitute:string): void {
      this.getSpecialityAndTitleBasedInstitution(currentInstitute,"edit");
      event.stopPropagation();
      this.showInstituteDropdown = false;
      this.showspecialtyDropdown = false;
      this.showTitleDropdown = !this.showTitleDropdown;
      this.setToggleProperty(); 
    }

    public navigateToInstitutionPage(instituteName:string| undefined):void{
      this.navigateSvc.navigate([`/institution/${instituteName}`]);
    }

    public sendActivationMail(userId:string | undefined):void{
      if(!userId){
        console.warn('user id not available');
        return;
      }
      this.showResendSuccessModal = false;
      this.userSvc.sendUserActivationMail(userId).subscribe(data => {
        this.resendActivationMailData = data;
        this.showResendSuccessModal = true;
      })
    }

    public closeResendActivationSuccessPopup():void{
      this.showResendSuccessModal = false
    }

    public setSelectedSpeciality(event: TouchEvent | MouseEvent,specialities:string,specialtyFormGroup:FormGroup):void{
      specialtyFormGroup.get('specialty')?.setValue(specialities);
      this.selectSpecialty(specialities);
    }

    public setSelectedTitle(event: TouchEvent | MouseEvent,title:string,titleFormGroup:FormGroup):void{
      titleFormGroup.get('title')?.setValue(title);
      this.selectTitles(title);
    }

    public closeServiceTeamEvent():void{
      this.showServiceTeamModal = false;
    }
    
}
