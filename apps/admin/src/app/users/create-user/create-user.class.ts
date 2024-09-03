import { InstitutionDetails, InstitutionResponse, InstitutionService, settingsArrayStates } from "@amsconnect/shared";
import { ChangeDetectionStrategy, ElementRef, Injectable, QueryList, ViewChildren } from "@angular/core";

@Injectable()
export class UserBaseComponent {
  public selectedIndex: number = 0; // Initial value, adjust as needed
  public allInstitutionsData: InstitutionDetails[] = []; // Add the appropriate type
  public selectedInstitute = "";
  public instituteId = "";
  public showInstituteDropdown = false;
  public closeInput = false;
  public showspecialtyDropdown = false;
  public selectedSpecialty = "";
  public selectedTitle = "";
  public showTitleDropdown = false;
  public inputValue = "";
  public intialSettingsArrayStates: settingsArrayStates = {
    filteredSpecialties: [],
    filteredTitles: [],
  };
  public settingsArrayStates: settingsArrayStates = {
    filteredSpecialties: [],
    filteredTitles: [],
  };
  public filteredArray !:string[] ;
  @ViewChildren("institute") institute!: QueryList<ElementRef>;
  @ViewChildren("specialty") specialty!: QueryList<ElementRef>;
  @ViewChildren("title") title!: QueryList<ElementRef>;
  public institutions!: InstitutionResponse | null;
  public instituteName!:string;
  constructor(private institutionsService: InstitutionService){}

  
  public getSpecialityAndTitle(mode?: 'edit' | 'create'): void {
    this.institutionsService
      .getInstitutions()
      .subscribe((data: InstitutionResponse) => {

        this.institutions = data;
        if (mode === 'edit') { 
          const foundInstitution = this.institutions.institutions.find((instData) => instData.name === this.instituteName);
          if (foundInstitution) {
            this.settingsArrayStates.filteredSpecialties = foundInstitution.specialties && foundInstitution.specialties.length > 0
              ? foundInstitution.specialties.sort()
              : this.institutions?.specialties
                ? this.institutions.specialties.sort()
                : [];
  
            this.settingsArrayStates.filteredTitles = foundInstitution.titles && foundInstitution.titles.length > 0
              ? foundInstitution.titles.sort()
              : this.institutions?.titles
                ? this.institutions.titles.sort()
                : [];
          }
        } else if (mode === 'create') {
          // Code for "create" mode 
          this.settingsArrayStates.filteredSpecialties = data?.specialties.sort();
          this.intialSettingsArrayStates.filteredSpecialties =this.settingsArrayStates.filteredSpecialties 
          this.settingsArrayStates.filteredTitles = data?.titles.sort();
          this.intialSettingsArrayStates.filteredTitles=this.settingsArrayStates.filteredTitles   
        }
  
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

  public inputKeyUpSpecialityOrTitle(event: KeyboardEvent, arrayToUpdate: string[],  inputType: "specialty" | "title", mode:'edit' | 'create' ): void {  
   this.inputValue = (event?.target as HTMLInputElement).value.trim();
  let query = this.inputValue.toLowerCase(); 
  let isValueInList = arrayToUpdate.some(
    (item) => item.toLowerCase() === query
  ); 
  if (inputType === "specialty") {
    this.selectedSpecialty = this.inputValue;
  } else if (inputType === "title") {
    this.selectedTitle = this.inputValue;
  } 
  if (!isValueInList && this.inputValue !== "" && event.key !== "Backspace") {
    arrayToUpdate.push(this.inputValue);
  }else if (event.key === 'Backspace' && typeof this.inputValue === 'string') { 
    this.inputValue = this.inputValue.slice(0, -1); 
    if(this.inputValue !== "" && !isValueInList){
      arrayToUpdate.push(this.inputValue);  
    }
    else{  
      this.getSpecialityAndTitle(mode); 
    } 
  }  
  this.filteredArray = (arrayToUpdate || [])?.filter((item) => item.toLowerCase().includes(query)).sort(); 
  
  if (arrayToUpdate === this.settingsArrayStates.filteredSpecialties && event.key !== "Backspace") { 
    this.settingsArrayStates.filteredSpecialties = this.filteredArray;
  } else if (arrayToUpdate === this.settingsArrayStates.filteredTitles && event.key !== "Backspace") {
    this.settingsArrayStates.filteredTitles = this.filteredArray;
  }    
  if (this.filteredArray) {
    this.handleSwitchCase(event, this.filteredArray, inputType)
  }
} 

public handleSwitchCase(event: KeyboardEvent, filteredArray:  string[], inputType: "specialty" | "title"):void {
  switch (event.key) {
    case "ArrowUp":
      this.handleArrowUp(filteredArray, inputType);
      break;
    case "ArrowDown":
      this.handleArrowDown(filteredArray, inputType);
      break;
    case "Enter":
      this.handleEnterKey(filteredArray, inputType);
      break;
    default:
      this.handleDefault(filteredArray, inputType);
      break;
  }
}

private handleArrowUp(filteredArray: string[], inputType: "specialty" | "title"): void {
  this.selectedIndex = (this.selectedIndex - 1 + filteredArray.length) % filteredArray.length;
  const selectedItemUp = filteredArray[this.selectedIndex];
  this.setSelectedItem(selectedItemUp, inputType);
  this.scrollToSelected();
}

private handleArrowDown(filteredArray: string[], inputType: "specialty" | "title"): void {
  this.selectedIndex = (this.selectedIndex + 1) % filteredArray.length;
  const selectedItemDown = filteredArray[this.selectedIndex]; 
  this.setSelectedItem(selectedItemDown, inputType);
  this.scrollToSelected();
}

private setSelectedItem(selectedItem: string, inputType: "specialty" | "title"): void {
  if (inputType === "specialty") {
    this.selectedSpecialty = selectedItem;
  } else if (inputType === "title") {
    this.selectedTitle = selectedItem;
  }
}

  public handleEnterKey(filteredArray: string[], inputType: "specialty" | "title"): void {
    if (this.selectedIndex >= 0 && this.selectedIndex < filteredArray.length) {
      const selectedItem = filteredArray[this.selectedIndex];
      if (typeof selectedItem === 'string') {
        // Handle string type
        if (inputType === "specialty") {
          this.selectSpecialty(selectedItem);
        } else if (inputType === "title") {
          this.selectTitles(selectedItem);
        }
      }
    }
    this.handleConditions();
  }

  public handleDefault(filteredArray: InstitutionDetails[] | string[], inputType: "specialty" | "title" | "institution"): void {
    if (this.selectedIndex >= 0 && this.selectedIndex < filteredArray.length) {
      const selectedItem = filteredArray[this.selectedIndex];
    }
    this.selectedIndex = 0;
    this.scrollToSelected();
  }

  public handleConditions(): void {
    this.showInstituteDropdown = false;
    this.showspecialtyDropdown = false;
    this.closeInput = true;
    this.showTitleDropdown = false;
  }

  public selectSpecialty(specialty: string,event?:Event): void {
    event?.stopPropagation();
    this.selectedSpecialty = specialty;  
    if (specialty) {
      const selectedSpecialty = this.settingsArrayStates.filteredSpecialties.find(
        (specialtyName) => specialtyName === specialty
      ); 
      if (selectedSpecialty) {  
        this.showspecialtyDropdown = true;
        this.closeInput =  ! this.closeInput;
        this.selectedIndex = 0;
      }
    }
    this.settingsArrayStates.filteredSpecialties =this.intialSettingsArrayStates.filteredSpecialties;
   
  }
  public selectTitles(title: string): void { 
    this.selectedTitle = title; 
    const selectedTitle = this.settingsArrayStates.filteredTitles.find(
      (titleName) => titleName === title
    );
    if (selectedTitle) {
      this.showTitleDropdown = true;
     this.handleInputAndIndex();
    }
    this.settingsArrayStates.filteredTitles =this.intialSettingsArrayStates.filteredTitles;
  }

  public handleInputAndIndex():void{
    this.closeInput = false;
    this.selectedIndex = 0;
  }
 
  private scrollToSelected(): void {
    const selectedItem =
      this.specialty?.toArray()[this.selectedIndex]?.nativeElement ||
      this.title?.toArray()[this.selectedIndex]?.nativeElement;
    if (selectedItem) {
      selectedItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  public getSpecialityAndTitleBasedInstitution(institution:string,mode?: 'edit' | 'create'): void {
    this.institutionsService.getInstitutions().subscribe((data: InstitutionResponse) => {
      this.institutions = data;
        if (mode === 'edit') { 
          const foundInstitution = this.institutions.institutions.find((instData) => instData.id === institution);
          if (foundInstitution) {
            this.settingsArrayStates.filteredSpecialties = foundInstitution.specialties && foundInstitution.specialties.length > 0
              ? foundInstitution.specialties.sort()
              : this.institutions?.specialties
                ? this.institutions.specialties.sort()
                : [];
  
            this.settingsArrayStates.filteredTitles = foundInstitution.titles && foundInstitution.titles.length > 0
              ? foundInstitution.titles.sort()
              : this.institutions?.titles
                ? this.institutions.titles.sort()
                : [];          
          }
        } else if (mode === 'create') {
          // Code for "create" mode 
          this.settingsArrayStates.filteredSpecialties = data?.specialties.sort();
          this.settingsArrayStates.filteredTitles = data?.titles.sort();
        }
  
        this.pushUniqueValue(this.settingsArrayStates.filteredSpecialties,"");
        this.pushUniqueValue(this.settingsArrayStates.filteredTitles, "");
      });
  }
}
