/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthService, CookieService, InstitutionService, UsersLoginResponse } from "@amsconnect/shared";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Institution, InstitutionResponse } from "@amsconnect/shared";
import { FormGroup, FormControl, Validators, AbstractControl } from "@angular/forms";
import { SharedService } from "../../shared.service";
import { combineLatest, Subscription } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "../../../../../../libs/shared/src/lib/config/environment";
@Component({
    selector: "web-messenger-non-ssologin",
    templateUrl: "./non-ssologin.component.html",
    styleUrls: ["./non-ssologin.component.scss"],
})
export class NonSSOLoginComponent implements OnInit, OnDestroy {
    public ROUTECHECK = {
        showEmail: "Show Email",
        showPassword: "Show Password",
        showMultiple: "Show Multiple",
        showSSO: "Show SSO",
    };
    public institutionResponseFlag = {
        selectedInstName: "",
        selectedInstId: "",
        showErrorMessage: "",
        institutionName: "",
        institutionId: "",
        emailValue: "",
    };
    public isMultiAccountChoices = {
        isMultiAccount:'isMultiAccount',
        isSwitchAccount:'isSwitchAccount',
    }
    public isMultiAccount = "";
    public filteredInstitutions: Institution[] = [];
    public institutionsName: [] = [];
    public routeCheck = this.ROUTECHECK.showEmail;
    public showHelpSupport = false;
    public readonly messenger_server_url = new URL(`${environment.messenger_server_url}`);
    public existing_url = "";
    public nonSSOLoginForm: FormGroup;
    private subscription: Subscription = new Subscription();
    public showPasswordDiv = false;
    public domainKey = "";

    constructor(
        private institutionService: InstitutionService,
        private authService: AuthService,
        private translateService: TranslateService,
        private sharedService: SharedService,
        private route: Router,
        private cookieSvc: CookieService,
    ) {
        this.domainKey = environment.domain_key.toString();
        this.translateService.setDefaultLang("en");
        this.nonSSOLoginForm = new FormGroup({
            email: new FormControl("", [Validators.required, Validators.email, Validators.pattern("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}")]),
            password: new FormControl("", [Validators.required]),
        });
    }

    ngOnInit(): void {
        this.existing_url = environment.existing_url.toString();
        this.getUpdatedValue();
        this.route.url === "/accounts/add" ? (this.isMultiAccount = this.isMultiAccountChoices.isMultiAccount) : "";
        this.route.url.includes('/accounts/switch/') ? (this.isMultiAccount = this.isMultiAccountChoices.isSwitchAccount):""
        this.checkAccountLoginType();
        this.validateUserLogout();
    }

    // for now only checks for Add Account should also check for Switch
    private checkAccountLoginType(): void {
        if (this.isMultiAccount === this.isMultiAccountChoices.isMultiAccount) {
            this.cookieSvc.createCookie(`redirectTo${this.domainKey ? `-${this.domainKey}` : ""}`, `${environment.messenger_server_url}#/accounts/add`);
        }else if(this.isMultiAccount === this.isMultiAccountChoices.isSwitchAccount){
            this.cookieSvc.createCookie(`redirectTo${this.domainKey ? `-${this.domainKey}` : ""}`, `${environment.messenger_server_url}#${this.route.url}`)
        }
    }

    private validateUserLogout(): void {
      if(this.isMultiAccount !== this.isMultiAccountChoices.isMultiAccount){
        const prefixKey = `${environment.domain_key ? `-${environment.domain_key}` : ""}`;
        const logoutMessage = this.cookieSvc.getCookie(`logoutMessage${prefixKey}`);
        this.institutionResponseFlag.showErrorMessage =
        logoutMessage !== undefined && logoutMessage !== 'undefined'
          ? JSON.parse(logoutMessage)
          : null;
        this.userDetailsRouteCheck(prefixKey)
        logoutMessage?  this.deleteCookie(`logoutMessage${prefixKey}`): null;
        logoutMessage ? this.deleteCookie(`s${prefixKey}`) : null;
        }
      }

    private userDetailsRouteCheck(prefixKey:string):void{
        const userDetails = this.cookieSvc.getCookie(`s${prefixKey}`); 
        if (userDetails) {
            if (!JSON.parse(userDetails).s) { 
               this.sharedService.setInstitutionName(JSON.parse(userDetails).inst)
                this.sharedService.setEmailID(JSON.parse(userDetails).e);
                this.sharedService.setInstitutionID(JSON.parse(userDetails).i);
                this.institutionResponseFlag.selectedInstId = JSON.parse(userDetails).i
                this.routeCheck = this.ROUTECHECK.showPassword;
            } else {
                this.sharedService.setInstitutionID(JSON.parse(userDetails).i);
                this.institutionResponseFlag.selectedInstId = JSON.parse(userDetails).i
                this.routeCheck = this.ROUTECHECK.showSSO;
            }
    }
}

    private getUpdatedValue(): void { 
        this.subscription.add(
            combineLatest([this.sharedService.emailId$, this.sharedService.institutionName$, this.sharedService.institutionId$, this.sharedService.showPasswordScreen$]).subscribe(
                ([email, name, id, showPasswordDiv]) => {
                    this.email.setValue(email);
                    this.institutionResponseFlag.institutionName = name; 
                    this.institutionResponseFlag.institutionId = id;
                    this.routeCheck = !showPasswordDiv ? this.ROUTECHECK.showEmail : showPasswordDiv;
                },
            ),
        );
    }

    public get email(): AbstractControl {
        return this.nonSSOLoginForm.controls["email"];
    }

    public get password(): AbstractControl {
        return this.nonSSOLoginForm.controls["password"];
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public getUserInstitutions(): void {
        this.password.setValue("");
        this.institutionResponseFlag.showErrorMessage = "";
        this.institutionResponseFlag.institutionName = "";
        this.institutionResponseFlag.institutionId = "";
        const emailValue = this.email.value as string;
        this.sharedService.setEmailID(emailValue);
        if (emailValue && emailValue.includes("@")) {
            this.resetToDefault();
            this.institutionService.getUserInstitutions(emailValue).subscribe((institutionData: InstitutionResponse) => {
                this.filteredInstitutions = institutionData.institutions;
                institutionData.status === "ok"
                    ? institutionData?.institutions?.length > 1
                        ? ((this.routeCheck = this.ROUTECHECK.showMultiple), this.sharedService.setShowPasswordScreenFlag(this.routeCheck))
                        : this.isSSOEnabled(institutionData.institutions)
                    : ((this.institutionResponseFlag.showErrorMessage = institutionData.message),
                      this.sharedService.setInstitutionName(institutionData.institutions?.[0].name),
                      this.sharedService.setInstitutionID(institutionData.institutions?.[0].id));
            });
        }
    }



    public isSSOEnabled(institution: Array<Institution>): void {
        institution[0].is_sso_enabled
            ? ((this.routeCheck = this.ROUTECHECK.showSSO),
              this.sharedService.setShowPasswordScreenFlag(this.routeCheck),
              (this.institutionResponseFlag.selectedInstName = institution[0].name),
              (this.institutionResponseFlag.selectedInstId = institution[0].id),
              this.sharedService.setInstitutionName(this.institutionResponseFlag.selectedInstName),
              this.sharedService.setInstitutionID(this.institutionResponseFlag.selectedInstId))
            : ((this.routeCheck = this.ROUTECHECK.showPassword),
              this.sharedService.setShowPasswordScreenFlag(this.routeCheck),
              this.sharedService.setInstitutionName(institution[0].name),
              this.sharedService.setInstitutionID(institution[0].id));
    }

    public resetToEmailScreen(): void {
        this.institutionResponseFlag.institutionName = "";
        this.institutionResponseFlag.institutionId = "";
        this.email.setValue("");
        this.sharedService.setEmailID("");
        this.sharedService.setInstitutionID("");
        this.sharedService.setInstitutionName("");
        this.sharedService.setShowPasswordScreenFlag("");
        this.password.setValue("");
        this.institutionResponseFlag.showErrorMessage = "";
        this.getCookie(`s${this.domainKey ? `-${this.domainKey}` : ""}`) ? this.deleteCookie(`s${this.domainKey ? `-${this.domainKey}` : ""}`) : "";
        this.getCookie(`redirectTo${this.domainKey ? `-${this.domainKey}` : ""}`) ? this.deleteCookie(`redirectTo${this.domainKey ? `-${this.domainKey}` : ""}`) : "";
        this.resetToDefault();
    }

    public resetToDefault(): void {
        this.routeCheck = this.ROUTECHECK.showEmail;
        this.filteredInstitutions = [];
    }

    public nonSSOLogin(): void {
        const userData = new FormData();
        const email = this.email.value as string;
        const password = this.nonSSOLoginForm.get("password")?.getRawValue();
        this.institutionResponseFlag.selectedInstId =
            this.institutionResponseFlag.selectedInstId === "" || typeof this.institutionResponseFlag.selectedInstId === "undefined"
                ? this.filteredInstitutions.length > 0
                    ? this.filteredInstitutions[0]?.id
                    : this.institutionResponseFlag.institutionId
                : this.institutionResponseFlag.selectedInstId;

        userData.set("iid", this.institutionResponseFlag.selectedInstId);
        userData.set("email", email);
        userData.set("type", "web");
        userData.set("password", password);
        if (this.isMultiAccount) {
            userData.set("additional", "true");
            const cookieValue = this.getCookie("a");
            const cookieStringValue = cookieValue !== undefined ? cookieValue : "";
            userData.set("a", cookieStringValue);
        }

        if (this.institutionResponseFlag.selectedInstId && email && password) {
            this.authService.login(userData).subscribe((usersLoginData: UsersLoginResponse) => {
                this.institutionResponseFlag.showErrorMessage = usersLoginData.status === "error" ? usersLoginData.message : "";
                if (!this.institutionResponseFlag.showErrorMessage) {
                    this.cookieSvc.setSCookie(usersLoginData, environment.domain_key);
                    const url = this.getCookie(`redirectTo${this.domainKey ? `-${this.domainKey}` : ""}`)
                    const redirectUrl = url ? new URL(JSON.parse(url)) : new URL(this.messenger_server_url.toString());
                    window.location.assign(redirectUrl);
                } else {
                    this.routeCheck = this.ROUTECHECK.showPassword;
                }
            });
        }
    }

    private createSSOCookie(institutionId: string): void {
        const ssoCookieData = { i: institutionId, s: true };
        this.cookieSvc.createCookie(`s${this.domainKey ? `-${this.domainKey}` : ""}`, ssoCookieData);
        this.cookieSvc.createCookie(`loginRedirect${this.domainKey ? `-${this.domainKey}` : ""}`, "/");
    }

    private getCookie(attr: string): string | undefined {
        return this.cookieSvc.getCookie(attr);
    }

    private deleteCookie(id: string): void {
        this.cookieSvc.removeCookie(id);
    }

    public changeEmail(): void {
        this.resetToEmailScreen();
    }

    public eraseCookieForReset(): void {
        this.deleteCookie(`s${this.domainKey ? `-${this.domainKey}` : ""}`);
        this.deleteCookie(`loginRedirect${this.domainKey ? `-${this.domainKey}` : ""}`);
    }

    public institutionLogin(Institution: Institution): void {
        this.institutionResponseFlag.institutionName = Institution.name;
        this.institutionResponseFlag.institutionId = Institution.id;
        this.institutionResponseFlag.selectedInstId = Institution.id;
        this.institutionResponseFlag.selectedInstName = Institution.name;
        this.sharedService.setInstitutionID(Institution.id);
        this.sharedService.setInstitutionName(Institution.name);
        this.filteredInstitutions.filter((institution: Institution) => institution.is_sso_enabled)?.find((institution) => institution.name === Institution.name)
            ? (this.routeCheck = this.ROUTECHECK.showSSO)
            : (this.routeCheck = this.ROUTECHECK.showPassword);
        this.sharedService.setShowPasswordScreenFlag(this.routeCheck);
        this.routeCheck === this.ROUTECHECK.showSSO
            ? this.createSSOCookie(this.institutionResponseFlag.institutionId) // this needs to be based on environement
            : this.eraseCookieForReset();
    }
}
