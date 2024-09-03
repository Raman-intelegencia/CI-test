import { APP_INITIALIZER, ErrorHandler, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  HttpClient,
} from "@angular/common/http";
import { AppComponent } from "./app.component";
import { RouterModule } from "@angular/router";
import { appRoutes } from "./app.routes";
import { AuthService, AuthInterceptor, environment } from "@amsconnect/shared";
import { CreatePasswordComponent } from "./create-password/create-password.component";
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { LoginModule } from "./login/login.module"; 
@NgModule({
  declarations: [
    AppComponent,
    CreatePasswordComponent, 
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    LoginModule,
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
    RouterModule.forRoot(appRoutes, {
      initialNavigation: "enabledBlocking",
      useHash: true,
    }),
  ],
  exports: [TranslateModule],
  providers: [
    AuthService,
    TranslateService,
    TranslateStore,
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },   
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
