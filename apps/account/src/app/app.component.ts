import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "web-messenger-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "account";
  constructor(private translateService: TranslateService) {
    this.translateService.setDefaultLang("en");
  }
}
