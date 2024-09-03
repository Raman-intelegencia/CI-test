import { AuthService, CommonService, CookieService, UserProfileService, UsersAuthResponse, loadLatestMessage } from "@amsconnect/shared";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Component, Input, OnInit } from "@angular/core";
import { TermsOfServiceService } from "../../services/terms-of-service.service";
import { Subscription, combineLatest } from "rxjs";
import { environment } from "../../../../../libs/shared/src/lib/config/environment";

@Component({
  selector: "web-messenger-terms-of-services",
  templateUrl: "./terms-of-services.component.html",
  styleUrls: ["./terms-of-services.component.scss"],
})
export class TermsOfServicesComponent  {
  public isTermsConditions: boolean = false;
  public user_id: string = "";
  
  @Input() termsOfServiceUrl!: SafeResourceUrl;
  @Input() agreement!:{agreementId:string,agreementDocument:string,agreementVersion:string};
  public API_URL: string | undefined;
  public showErrorMessage = "";
  public account_server_url = "";
  private journalId!: number;
  public archiveChats = false;
  public payload = {}
  private subscription: Subscription = new Subscription();
  constructor(private authService: AuthService, private cookieService: CookieService, public sanitizer: DomSanitizer,
    private termsOfService: TermsOfServiceService, private commonService : CommonService,private userProfileService :UserProfileService) {
    this.API_URL = environment.baseUrl;
  }

  public crossButton(): void {
    this.showErrorMessage = "You will be logged out!";
  }

  public logOutPopup(): void {
    this.logOut();
    this.showErrorMessage = "";
  }

  public CancelTermsOfServices(): void {
    this.showErrorMessage = "";
  }

  public acceptTermsOfService(): void {
    const agreement = {
      document: this.agreement.agreementDocument,
      iid: this.agreement.agreementId,
      version: this.agreement.agreementVersion,
    } 
    const aCookieValue = this.cookieService.getCookie("a");
    if(aCookieValue){
      this.payload = { agreement: agreement, a: aCookieValue }
    }
    this.termsOfService.acceptTermsOfService(this.payload).subscribe((Response) => { 
      this.getMessageload_latest2();
    })
  }

  public getMessageload_latest2(){
    this.subscription.add(
      combineLatest([
        this.commonService.journalId$,
        this.commonService.archiveValue$,
      ]).subscribe(([journalId, archiveValue]) => {
        this.journalId = journalId;
        this.archiveChats = archiveValue;
      })
    );
  this.userProfileService.getMessageload_latest2(this.journalId, this.archiveChats).subscribe((response:loadLatestMessage) => {
    this.termsOfServiceUrl = '';
  })
}
public sanitizeURL(url: string) {
  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}
  public logOut():void{ 
    this.authService.logout().subscribe((response)=>{ 
      this.account_server_url = environment.accounts_server_url; 
      window.location.href = this.account_server_url;
      window.open(this.account_server_url,"_self");
    })
  }
}
