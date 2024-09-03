import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import {
  CookieService,
  InstitutionService,
} from "@amsconnect/shared";
import { Router } from "@angular/router";
import { Institution, InstitutionResponse } from "@amsconnect/shared";
import { environment } from "../../../../../../libs/shared/src/lib/config/environment";

@Component({
  selector: "web-messenger-institution",
  templateUrl: "./institution.component.html",
  styleUrls: ["./institution.component.scss"],
})
export class InstitutionComponent implements OnInit {
  @ViewChild("institutionInput", { static: true })
  institutionInput!: ElementRef<HTMLInputElement>;
  @ViewChildren("institutionItem") institutionItems!: QueryList<ElementRef>;
  public showHelpSupport: boolean = false;
  public institutions: Institution[] = [];
  public filteredInstitutions: Institution[] = [];
  public input: string = "";
  public isInputTouched: boolean = false;
  public institutionId: string = "";
  public baseUrl: string | undefined;
  public loginForm: FormGroup;
  @Input() showSSOLoginScreen = false;
  @Output() showHideEmailScreen = new EventEmitter();
  @Input() selectedInstitutionId = "";
  @Input() selectedInstName = "";
  public selectedIndex: number = 0;
  public showDropdown: boolean = false;
  public isInputFocused: boolean = false;

  constructor(
    private institutionService: InstitutionService,
    private router: Router,
    private translateService: TranslateService,
    private cookieSvc:CookieService,
  ) {
    this.translateService.setDefaultLang("en");
    this.loginForm = new FormGroup({
      institution: new FormControl(""),
    });
    this.loginForm.get("institution")?.valueChanges.subscribe((value) => {
      value.trim() ? this.onInputChanged() : "";
    });
  }
  ngOnInit(): void {
    // Function call to fetch all institutions list
    this.getInstitutions();
    this.baseUrl = environment.baseUrl;
  }

  // api call to get all list of institutions using institution service
  public getInstitutions(): void {
    this.institutionService
      .getInstitutions()
      .subscribe((data: InstitutionResponse) => {
        this.institutions = data.institutions;
      });
  }

  // function call on keyup event to filter the sso enabled institutions and filter institutions based on the input value
  public inputKeyUp(event: any): void {
    this.isInputTouched = true;
    this.institutionId = "";
    this.loginForm.get("institution")?.setValue(event.target.value);
    event.preventDefault();

    switch (event.key) {      
      case "ArrowUp":
        this.selectedIndex =
        (this.selectedIndex - 1 + this.filteredInstitutions.length) %
        this.filteredInstitutions.length;
      this.scrollToSelected();
      break;

      case "ArrowDown":
        this.selectedIndex =
          (this.selectedIndex + 1) % this.filteredInstitutions.length;
        this.scrollToSelected();

        break;

      case "Enter":
        if (
          this.selectedIndex >= 0 &&
          this.selectedIndex < this.filteredInstitutions.length
        ) {
          const selectedInstitution =
            this.filteredInstitutions[this.selectedIndex];
          this.selectInstitution(selectedInstitution.id);
        }
        break;

      default:
        this.selectedIndex = 0;
        this.scrollToSelected();
        break;
    }

    this.showDropdown =
      this.filteredInstitutions.length > 0 &&
      event.target.value.trim().length > 0;
  }

  private scrollToSelected(): void {
    const selectedItem =
      this.institutionItems.toArray()[this.selectedIndex]?.nativeElement;
    if (selectedItem) {
      selectedItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  // function call to filter the institutions and to match input accordingly
  public onInputChanged(): void {
    const institutionInputValue = this.loginForm
      .get("institution")
      ?.getRawValue()
      .trim();
    this.showDropdown = institutionInputValue.length > 0;
    this.filteredInstitutions =
      institutionInputValue.length >= 1
        ? this.institutions.filter(
            (institution: Institution) =>
              institution.is_sso_enabled &&
              institution?.name?.toLowerCase()
                .includes(institutionInputValue.toLowerCase())
          )
        : [];
  }

  public searchInstitution(name: any): void {
    if (typeof name !== 'string') {
        return;
    }    
    const selectedInstitution = this.institutions.find(
      (institution: Institution) =>
        institution?.name?.toLowerCase() === name?.toLowerCase()
    )?.id;  
    this.institutionId = selectedInstitution ? selectedInstitution : "";
  }

  // function to update the institution input value based on the selected institution ID
  public selectInstitution(id: string): void {
    this.institutionId = "";
    const selectedInstitution = this.institutions.find(
      (institution: Institution) => institution.id === id
    );

    if (selectedInstitution) {
      this.loginForm.patchValue({ institution: selectedInstitution.name });
      this.institutionId = id;
      this.filteredInstitutions = [];
      this.selectedIndex = -1; // Reset the selected index
      this.showDropdown = false;
    }
  }

  // function to redirect on click event once the institution is selected.
  public redirectToSAML(): void {
    const redirectTo = this.cookieSvc.getCookie(`redirectTo${environment.domain_key ? `-${environment.domain_key}` : ""}`)
    this.cookieSvc.createCookie(`s${environment.domain_key ? `-${environment.domain_key}` : ""}`,{"i":this.institutionId || this.selectedInstitutionId,"s":true})
    redirectTo?.includes('accounts/add') ? this.cookieSvc.createCookie(`loginRedirect${environment.domain_key ? `-${environment.domain_key}` : ""}`,"#/?ssoadditional=true"):this.cookieSvc.createCookie(`loginRedirect${environment.domain_key ? `-${environment.domain_key}` : ""}`,"/")
    this.institutionService.redirectToSamlLogin(
      this.institutionId || this.selectedInstitutionId
    );
  }

  // function to reset the institution input field
  public resetInstitutionInputValue(): void {
    this.loginForm.controls["institution"].setValue("");
    this.filteredInstitutions = [];
    this.institutionId = "";
  }

  public navigateToEmailScreen(): void {
    this.showHideEmailScreen.emit(true);
  }
}
