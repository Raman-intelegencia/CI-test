import {
  AuthService,
  CookieService,
  InstitutionResponse,
  InstitutionService,
  SettingsService,
  UserService,
  UsersAuthResponse,
} from "@amsconnect/shared";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,  
  OnDestroy,  
  OnInit,
  QueryList, 
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { InboxHelperService } from "../../../../services/inbox-helper.service";
import { catchError } from "rxjs";
import { ProfileBaseComponent } from "./profile-class";
import { FormBuilder } from "@angular/forms";
@Component({
  selector: "web-messenger-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent extends ProfileBaseComponent implements OnInit,OnDestroy {
  public institutions!: InstitutionResponse | null;
  public showLoader= false;
  public authResponse: UsersAuthResponse = {} as UsersAuthResponse;
  @ViewChild("specialtyInput", { static: true })specialtyInput!: ElementRef<HTMLInputElement>;
  @ViewChild("titleInput", { static: true })titleInput!: ElementRef<HTMLInputElement>;
  @ViewChildren("specialtyItem") specialtyItem!: QueryList<ElementRef>;
  @ViewChildren("titleItem") titleItem!: QueryList<ElementRef>;
  @ViewChild('fileInput')fileInput!: ElementRef<HTMLInputElement>;
 
  constructor(
    private institutionService: InstitutionService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,private formBuilder: FormBuilder,
    settingsService: SettingsService,
    cookieService: CookieService,inboxHelperSvc:InboxHelperService, userSvc: UserService) {
    super(settingsService,cookieService,inboxHelperSvc, userSvc);
  }

  ngOnInit(): void {
    this.getInstitutions(); 
    this.inboxHelperSvc.fetchThreadsAndProfiles(false);
    this.CellPhoneForm = this.formBuilder.group({
      cell_phone: [this.cellPhoneNumber],
    });
    this.CellPhoneForm.controls['cell_phone']?.disable();
  }

  public getInstitutions(): void {
    this.subscription.add(this.authService.authResponseData$.pipe(catchError((error) => {
      console.error("Error fetching auth data:", error);
      return [];
    })
  )
  .subscribe((userAuthResponse: UsersAuthResponse) => {
    this.authResponse = userAuthResponse; 
    this.getSpecialtyTitle();
    }));
  if (this.specialtyInput) {
    this.specialtyInput.nativeElement.focus();
  }
    this.subscription.add(this.inboxHelperSvc.user$.pipe(
    ).subscribe((currentUser) => {
        this.updatedUserDetails = currentUser;     
        this.cellPhoneNumber = this.updatedUserDetails?.cell_phone?.replace(/^\+1/, '')!; 
        this.CellPhoneForm?.get('cell_phone')?.setValue(this.cellPhoneNumber);  
        this.instituteName = this.updatedUserDetails?.profile?.iname ?? '';
        this.settingsArrayStates.showCurrentServiceTeam = this.updatedUserDetails?.status?.r;
        this.selectedSpecialty = this.updatedUserDetails?.profile?.dept ?? '';
        this.selectedTitle = this.updatedUserDetails?.profile?.title ?? '';
        this.isImageVisible = this.updatedUserDetails?.image_id? true:false;
        this.isRemovePhoto = this.isImageVisible;
        this.storeImageUrl = this.updatedUserDetails?.image_id
        ? this.authResponse.config.config_profileimage_url + this.authResponse.user.image_id + "_profile.png": "";
    })
); 
  }
 
  public uploadFile(event: Event): void {
    this.showLoader = true;
    this.isRemovePhoto = true;
    this.isImageVisible = true;
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const binaryData = reader.result as string;
        this.storeImageUrl = binaryData;
        this.getUsersImageId(file);
        this.showLoader= false;
      };
      // ChangeDetectorRef since file is loading outside the zone
      this.cd.markForCheck();
    }
  }

  public handleFileInputClick() {
    this.fileInput.nativeElement.click();
}
  public clickSpecialtyTitle(event:Event):void{
    event.stopPropagation();
    this.getSpecialtyTitle(); 
  }
 
  public inputKeyUpSpecialityOrTitle(
    event: any,
    arrayToUpdate: string[],
    inputType: "specialty" | "title"
  ): void {  
     this.inputValue = event.target.value.trim();
    let query = this.inputValue.toLowerCase(); 
    let isValueInList = arrayToUpdate.some(
      (item) => item.toLowerCase() === query
    );
    // If not in the list, add it to the list
    if (!isValueInList && this.inputValue !== "" && event.key !== "Backspace") {
      arrayToUpdate.push(this.inputValue);
    }else if (event.key === 'Backspace' && typeof this.inputValue === 'string') { 
      this.inputValue = this.inputValue.slice(0, -1); 
      if (inputType === "specialty") {
        this.selectedSpecialty = this.inputValue;
      } else if (inputType === "title") {
        this.selectedTitle = this.inputValue;
      } 
      if(this.inputValue !== "" && !isValueInList){
        arrayToUpdate.push(this.inputValue);  
      }
      else{  
        this.getSpecialtyTitle(); 
      } 
    }  
    let filteredArray = (arrayToUpdate || [])?.filter((item) => item.toLowerCase().includes(query)).sort(); 
   
    if (arrayToUpdate === this.settingsArrayStates.filteredSpecialties && event.key !== "Backspace") { 
     this.settingsArrayStates.filteredSpecialties = filteredArray;
    } else if (arrayToUpdate === this.settingsArrayStates.filteredTitles && event.key !== "Backspace") {
      this.settingsArrayStates.filteredTitles = filteredArray;
    }    
    switch (event.key) {
      case "ArrowUp":
        this.selectedIndex = 
          (this.selectedIndex - 1 + filteredArray.length) % filteredArray.length; 
        this.scrollToSelected(); 
        break;
      case "ArrowDown":
        this.selectedIndex = (this.selectedIndex + 1) % filteredArray.length;
        this.scrollToSelected(); 
        break;
      case "Enter":
        if (
          this.selectedIndex >= 0 &&
          this.selectedIndex < filteredArray.length
        ) {
          const selectedItem = filteredArray[this.selectedIndex];
          if (inputType === "specialty") {
            this.selectSpecialty(selectedItem); 
          } else if (inputType === "title") {
            this.selectTitles(selectedItem); 
          }
        }
        this.showDropdownSpecialty = false;
        this.closeInput= true; 
        this.showDropdownTitle =false; 
                      break; 
      default: 
        if (
          this.selectedIndex >= 0 &&
          this.selectedIndex < filteredArray.length
        ) {
          const selectedItem = filteredArray[this.selectedIndex];
          if (inputType === "specialty") {
            this.selectSpecialty(selectedItem);
          } else if (inputType === "title") {
            this.selectTitles(selectedItem);
          }}
        this.selectedIndex = 0;
        this.scrollToSelected(); 
        break;
    }
  } 
  public getSpecialtyTitle():void{
    this.institutionService
    .getInstitutions()
    .subscribe((data: InstitutionResponse) => {
      this.institutions = data;
     this.institutions.institutions.find(data=>{ 
      if (data.name === this.instituteName) {
        this.settingsArrayStates.filteredSpecialties = data.specialties && data.specialties.length > 0
          ? data.specialties.sort()
          : this.institutions?.specialties
            ? this.institutions.specialties.sort()
            : [];
       
        this.settingsArrayStates.filteredTitles = data.titles && data.titles.length > 0
          ? data.titles.sort()
          : this.institutions?.titles
            ? this.institutions.titles.sort()
            : [];
      }
    })  
    this.pushUniqueValue(this.settingsArrayStates.filteredSpecialties, this.selectedSpecialty);
      this.pushUniqueValue(this.settingsArrayStates.filteredTitles, this.selectedTitle);
    });
  }
  public pushUniqueValue(filteredValue:string[], selectedValue:string):void {
    // Check if the value is not already present in the array 
    if (!filteredValue.includes(selectedValue)) { 
      filteredValue.unshift(selectedValue);
    }
  }

  public toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.getSpecialtyTitle(); 
    this.showDropdownSpecialty = !this.showDropdownSpecialty;
    this.showDropdownTitle =false;
    this.setInputAndIndex(); 
  }
  public toggleDropdownTitle(event: Event): void {
    event.stopPropagation();
    this.showDropdownTitle = !this.showDropdownTitle;
    this.showDropdownSpecialty = false;
    this.setInputAndIndex();
    this.getSpecialtyTitle();
  }

  public selectSpecialty(specialty: string): void {
    this.updateProfile(specialty, "");
   if(specialty) this.selectedSpecialty =  specialty;  
    if (specialty) {
      const selectedSpecialty = this.settingsArrayStates.filteredSpecialties.find(
        (specialtyName) => specialtyName === specialty
      ); 
      if (selectedSpecialty) {   
        this.showDropdownSpecialty = true;
        this.closeInput= false;  
        this.selectedIndex = 0; // Reset the selected index   
      }
    }
  }
  public selectTitles(title: string): void {
    this.updateProfile("", title);
    this.selectedTitle = title; 
    const selectedTitle = this.settingsArrayStates.filteredTitles.find(
      (titleName) => titleName === title
    );
    if (selectedTitle) { 
    this.showDropdownTitle =true;
    this.closeInput= false;
      this.selectedIndex = 0;  
    }
  }

  private scrollToSelected(): void {
    const selectedItem =
      this.specialtyItem.toArray()[this.selectedIndex]?.nativeElement ||
      this.titleItem.toArray()[this.selectedIndex]?.nativeElement;
    if (selectedItem) {
      selectedItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  public searchSpecialty(name: Event): void {  
    if (typeof name !== "string") {
      return;
    }
    this.selectedSpecialty = name; 
  }
  public searchTitle(name: Event): void { 
    if (typeof name !== "string") {
      return;
    }
    this.selectedTitle = name;
  }
  public openCurrentServiceTeamModal(): void {
    this.serviceTeamModalState = true;
  }

  public getUsersImageId(storeImageUrl: File) {
    this.settingsService
      .setUsersImage(storeImageUrl, false)
      .subscribe((imageResponse: any) => {
        this.storeImageUrl = imageResponse ? this.authResponse.config.config_profileimage_url + imageResponse.image_id + "_profile.png" : "";
        this.userSvc.setImageId(imageResponse.image_id);
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); 
  }
}