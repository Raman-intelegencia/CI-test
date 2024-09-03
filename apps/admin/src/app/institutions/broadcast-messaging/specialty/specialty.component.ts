import { CookieService, SpecialtiesCheckboxState, settingsArrayStates } from '@amsconnect/shared';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { InstitutionsService } from 'apps/admin/src/services/institutions.service';
import { UsersService } from 'apps/admin/src/services/users.service';
import { environment } from 'libs/shared/src/lib/config/environment';

@Component({
  selector: 'web-messenger-specialty',
  templateUrl: './specialty.component.html',
})
export class SpecialtyComponent {

  public allSpecialtiesChecked!:boolean;
  public domainKey = '';
  public specialtiesCheckboxStates: SpecialtiesCheckboxState[] = [];
  public selectedSpecialties: string[] = [];
  public searchSpecialtiesTerm: string = '';
  public filteredSpecialties: string[] = [];
  @Input() isSpecialties!:boolean;
  @Input() createBroadcastMessageForm!: FormGroup; // Assuming you have this variable
  @Input() settingsArrayStates?: settingsArrayStates; 
  @Output() submitSpecialties = new EventEmitter<void>();
  @Output() closeChild = new EventEmitter<void>();
  @Output() closePopUp = new EventEmitter<boolean>();
  public isDiscard = "";
  public isChange = false;
  constructor(private institutionService: InstitutionsService, private cookieService: CookieService, private translateService: TranslateService, private fb: FormBuilder, private UserServices: UsersService) {
    this.translateService.setDefaultLang("en"); this.domainKey = environment.domain_key;
  }
  ngOnInit(): void {
    this.updateTitleCheckboxes();
  }
  public updateTitleCheckboxes(): void {
    const formSpecialties: string[] = this.createBroadcastMessageForm?.get('Specialty')?.value ?? [];
    const filteredSpecialties: string[] = this.settingsArrayStates?.filteredSpecialties ?? [];
    this.specialtiesCheckboxStates = filteredSpecialties.map(specialties => ({
      specialties,
      selected: formSpecialties.includes(specialties)
    }));
    this.allSpecialtiesChecked=this.specialtiesCheckboxStates.every(item => item.selected === true);
  }
  public checkAllSpecialties(): void {
    this.specialtiesCheckboxStates.forEach(spec => {
      spec.selected = this.allSpecialtiesChecked;
  });
    if (this.allSpecialtiesChecked) {
      const specialties = this.settingsArrayStates?.filteredSpecialties ?? [];
      this.selectedSpecialties = [...specialties];
    } else {
      this.selectedSpecialties = []; 
    }
  }
  public onCheckboxChange(index: number, specialty: string): void {
    this.isChange = true;
    this.specialtiesCheckboxStates[index].selected = !this.specialtiesCheckboxStates[index].selected;
    if (this.specialtiesCheckboxStates[index].selected) {
      this.selectedSpecialties.push(specialty);
    } else {
      this.selectedSpecialties = this.selectedSpecialties.filter(s => s !== specialty);
    }
  }
  public saveSpecialties(): void {
    const preSelectedValue=this.createBroadcastMessageForm?.get("Specialty")?.value;
    const filteredSpecialties: string[] = this.settingsArrayStates?.filteredSpecialties ?? [];
    preSelectedValue.forEach((formTitle: string) => {
      const index = filteredSpecialties.indexOf(formTitle);
      if (index !== -1 && this.specialtiesCheckboxStates[index].selected === true) {
        this.selectedSpecialties.push(formTitle);
      }
    });
    this.createBroadcastMessageForm?.get("Specialty")?.setValue([...this.selectedSpecialties]);
    this.closeChild.emit();
    this.submitSpecialties.emit();
    this.closemodal();
  }
  public filterSpecialties(): void {
    let filteredSpecialties = this.settingsArrayStates?.filteredSpecialties
      .filter(specialty => specialty.toLowerCase().includes(this.searchSpecialtiesTerm.toLowerCase()));
    if(filteredSpecialties)
    {
      this.filteredSpecialties = filteredSpecialties;
    }
  }

  public closemodal():void{
     const formSpecialties: string[] = this.createBroadcastMessageForm?.get("Specialty")?.value ?? [];
     const missingSpecialties = this.selectedSpecialties.filter(spec => !formSpecialties.includes(spec));
     // show Discard popup
     if (missingSpecialties.length > 0 || (JSON.stringify(formSpecialties) != JSON.stringify(this.selectedSpecialties) && this.isChange)) {
     this.isDiscard = "You have unsaved changes to this property, do you wish to discard them?"; 
      } else {
      this.isSpecialties=false;
      this.closePopUp.emit(this.isSpecialties)
     }
  }

  public discardPopup():void{
    this.isDiscard = "";
    this.isSpecialties=false;
    this.closePopUp.emit(this.isSpecialties)
  }

  public cancelPopup():void{
    this.isDiscard = "";
    this.isSpecialties=true;
    this.closePopUp.emit(this.isSpecialties)
  }
}
