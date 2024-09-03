import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ResetComponent } from "./reset/reset.component";
import { passwordRoutes } from "./password.route";
import { RouterModule } from "@angular/router";
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { InstitutionService, NonSSOService } from "@amsconnect/shared";
import { LoginModule } from "../login/login.module";

@NgModule({
  declarations: [ResetComponent],
  imports: [CommonModule, RouterModule.forChild(passwordRoutes),
    HttpClientModule,
    TranslateModule,
    LoginModule,
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
  providers: [InstitutionService, TranslateService, TranslateStore, NonSSOService],

})
export class PasswordModule {}
