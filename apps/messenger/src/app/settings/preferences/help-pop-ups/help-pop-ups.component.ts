import { CookieService, SettingsService } from "@amsconnect/shared";
import { Component } from "@angular/core";
import { Subscription } from "rxjs";

@Component({
  selector: "web-messenger-help-pop-ups",
  templateUrl: "./help-pop-ups.component.html",
  styleUrls: ["./help-pop-ups.component.scss"],
})
export class HelpPopUpsComponent {
  public isRestoreHelpPopUps = false;
  public aCookieValue = this.cookieService.getCookie("a"); 
  private subscription: Subscription = new Subscription();

  constructor(
    private settingsService: SettingsService,
    private cookieService: CookieService
  ) {}
 
  public restoreHelpPopUps(): void {
    const newSubscription = this.settingsService.getGroupList().subscribe();  
    this.subscription.add(newSubscription);  
    this.setSeenCoachMarkProperties('seen_coach_mark_hint_archive_all');
    this.setSeenCoachMarkProperties('seen_coach_mark_scheduling_checkbox');
    this.setSeenCoachMarkProperties('seen_coach_mark_mypatients_add');
    this.showSpanValue();
  } 

  public setSeenCoachMarkProperties(key:string):void{
      const formData = new FormData();
      formData.append("key", key);
      formData.append("value", "0");
      if (this.aCookieValue) {
        formData.append("a", this.aCookieValue);
      }
      const newSubscription = this.settingsService.setUserProperty(formData).subscribe();
      this.subscription.add(newSubscription);  
  }

  public showSpanValue(): void {
    this.isRestoreHelpPopUps = true;    
    setTimeout(() => {
      this.isRestoreHelpPopUps = false;
    }, 2000); 
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
 
}
