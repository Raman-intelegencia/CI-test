/* eslint-disable no-debugger */
import { Component, OnDestroy, OnInit } from "@angular/core";
import { CookieService, Institution, InstitutionResponse, InstitutionService, NonSSOService, User, environment } from "@amsconnect/shared";
import { TranslateService } from "@ngx-translate/core";
import { SharedService } from "../../shared.service";
import { Router } from "@angular/router";
import { combineLatest, Subject, Subscription } from "rxjs";

@Component({
  selector: "web-messenger-reset",
  templateUrl: "./reset.component.html",
  styleUrls: ["./reset.component.scss"],
})
export class ResetComponent implements OnInit,OnDestroy{
  public showEmailSent: boolean = false;
  public email: string = "";
  public institutionId: string = "";
  public showErrorMessage = "";
  public institutionName = '';
  private subscription: Subscription = new Subscription();
  public filteredInstitutions: Institution[] = [];
  public domainKey = "";

  constructor(
    private nonSsoService: NonSSOService,
    private translateService: TranslateService,
    private sharedService: SharedService,
    private router: Router, private cookieSvc:CookieService
  ) {
    this.translateService.setDefaultLang("en");
    this.domainKey = environment.domain_key.toString();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe(); 

  }
  ngOnInit(): void {   
    this.cookieSvc.removeCookie(`redirectTo${this.domainKey ? `-${this.domainKey}` : ""}`);
    this.subscription.add(
      combineLatest([
        this.sharedService.emailId$,
        this.sharedService.institutionId$,
        this.sharedService.institutionName$,
      ]).subscribe(([email, id, name]) => {
        this.email = email;
        this.institutionId = id;
        this.institutionName = name
      })
    );
  }

  public sendResetEmailLink(): void {
    this.nonSsoService
      .sendResetLink(this.email, this.institutionId)
      .subscribe((resetData) => {
        this.showEmailSent = resetData.status === "ok" ? true : false;
        this.showErrorMessage =
          resetData.status === "error" ? resetData.message : "";
      });
  }

  public backToPasswordScreen(): void {
    this.sharedService.setShowPasswordScreenFlag('Show Password');
    this.sharedService.setEmailID(this.email);
    this.sharedService.setInstitutionID(this.institutionId);
    this.sharedService.setInstitutionName(this.institutionName);

    this.router.navigateByUrl("/login");
    }

    public navigateToEmailScreen(): void {
      this.sharedService.setShowPasswordScreenFlag('Show Email');
      this.sharedService.setEmailID('');
      this.router.navigateByUrl("/login");
      }
      
}
