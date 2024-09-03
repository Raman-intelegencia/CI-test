import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NonSSOLoginComponent } from "./non-ssologin/non-ssologin.component";
import { InstitutionComponent } from "./institution/institution.component";
import { loginRoutes } from "./login.route";
import { RouterModule } from "@angular/router";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { InstitutionService } from "@amsconnect/shared";
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { ReactiveFormsModule } from "@angular/forms";
import { HelpSupportComponent } from "../help-support/help-support.component";

@NgModule({
  declarations: [
    NonSSOLoginComponent,
    InstitutionComponent,
    HelpSupportComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule.forChild(loginRoutes),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => {
          return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
        },
        deps: [HttpClient],
      },
    }),
  ],
  providers: [InstitutionService, TranslateService, TranslateStore],
  exports: [
    TranslateModule,
    HelpSupportComponent  ],
})
export class LoginModule {}
