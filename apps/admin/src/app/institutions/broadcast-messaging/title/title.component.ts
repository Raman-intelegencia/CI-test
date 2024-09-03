import { CookieService, TitleCheckboxState, settingsArrayStates } from '@amsconnect/shared';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { InstitutionsService } from 'apps/admin/src/services/institutions.service';
import { UsersService } from 'apps/admin/src/services/users.service';
import { environment } from 'libs/shared/src/lib/config/environment';

@Component({
  selector: 'web-messenger-title',
  templateUrl: './title.component.html',
})
export class TitleComponent {

  public domainKey = '';
  public allTitleChecked = false;
  public titleCheckboxStates: TitleCheckboxState[] = [];
  public selectedTitle: string[] = [];
  public searchTerm: string = '';
  public filteredTitles: string[] = [];
  @Input() createBroadcastMessageForm!: FormGroup;  // Assuming you have this variable
  @Input() settingsArrayStates?: settingsArrayStates; 
  @Input() isTitles!:boolean; 
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
    const formTitles: string[] = this.createBroadcastMessageForm?.get('Title')?.value ?? [];
    const filteredTitles: string[] = this.settingsArrayStates?.filteredTitles ?? [];

    // Reset the checkbox states
    this.titleCheckboxStates = filteredTitles.map(title => ({
      title,
      selected: formTitles.includes(title)
    }));
    this.allTitleChecked=this.titleCheckboxStates.every(item => item.selected === true);
  }

  public checkAllTitle(): void { 
    this.titleCheckboxStates.forEach(spec => {
      spec.selected = this.allTitleChecked;
  });
    const title = this.settingsArrayStates?.filteredTitles ?? [];
    if (this.allTitleChecked) {
      this.selectedTitle = [...title]; 
    } else {
      this.selectedTitle = []; 
    }
  }
   
  public onCheckboxChangeTitle(index: number, title: string): void {
    this.isChange = true;
    this.titleCheckboxStates[index].selected = !this.titleCheckboxStates[index].selected;
    if (this.titleCheckboxStates[index].selected) {
      this.selectedTitle.push(title);
    } else {
      this.selectedTitle = this.selectedTitle.filter(s => s !== title);
    }
  }

  public submitTitle(): void {
    const preSelectedValue=this.createBroadcastMessageForm?.get("Title")?.value;
    const filteredTitles: string[] = this.settingsArrayStates?.filteredTitles ?? [];
    preSelectedValue.forEach((formTitle: string) => {
      const index = filteredTitles.indexOf(formTitle);
      if (index !== -1 && this.titleCheckboxStates[index].selected === true) {
        this.selectedTitle.push(formTitle);
      }
    });
    this.createBroadcastMessageForm?.get("Title")?.setValue([...this.selectedTitle]);
    this.closeChild.emit();
    this.submitSpecialties.emit();
    this.closemodal();
  }

  public filterTitles(): void {
    // Filter titles based on the search term
    let filterTitleList = this.settingsArrayStates?.filteredTitles
      .filter(title => title.toLowerCase().includes(this.searchTerm.toLowerCase()));
    if(filterTitleList)
    {
      this.filteredTitles = filterTitleList;
    }

  }
  public closemodal():void{
    const formTitles: string[] = this.createBroadcastMessageForm?.get("Title")?.value ?? [];
     const missingSpecialties = this.selectedTitle.filter(spec => !formTitles.includes(spec));
     // show Discard popup
     if (missingSpecialties.length > 0 || (JSON.stringify(formTitles) != JSON.stringify(this.selectedTitle)&& this.isChange)) {
     this.isDiscard = "You have unsaved changes to this property, do you wish to discard them?"; 
    }else{
     this.isTitles=false;
     this.closePopUp.emit(this.isTitles)
    }
  }

  public discardPopup():void{
    this.isDiscard = "";
    this.isTitles=false;
    this.closePopUp.emit(this.isTitles)
  }

  public cancelPopup():void{
    this.isDiscard = "";
    this.isTitles=true;
    this.closePopUp.emit(this.isTitles)
  }
}
