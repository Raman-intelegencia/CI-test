import { APP_INITIALIZER, ErrorHandler, NgModule, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {RouterModule,provideRouter,withComponentInputBinding,} from '@angular/router';
import { appRoutes } from './app.routes';
import { UserSearchComponent } from './user-search/user-search.component';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import {
  AuthInterceptor,
  GlobalErrorHandlerInterceptor,
  HighlightSearchTxtPipe,
  ModalComponent,
  ErrorComponent,
  SharedModule,
  CSRFHeaderInterceptor,
  ChangePasswordComponent,
  ConvertDateAndTimePipe,
  DateTimePipe,
  LoaderModelComponent,
} from '@amsconnect/shared';
import { environment } from 'libs/shared/src/lib/config/environment';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DatePipe } from '@angular/common';
import { AdminInterceptor } from '../services/admin-http-interceptor';
import { JobDetailsComponent } from './files/jobs/job-details/job-details.component';

@NgModule({
  declarations: [AppComponent,UserSearchComponent,JobDetailsComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, 
    ModalComponent,
    ErrorComponent,
    ChangePasswordComponent,
    ReactiveFormsModule,
    HighlightSearchTxtPipe,
    ConvertDateAndTimePipe,DateTimePipe,
    RouterModule.forRoot(appRoutes, {
      initialNavigation: 'enabledBlocking',
      useHash: true,
    }),
    SharedModule,
    LoaderModelComponent,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => {
          return new TranslateHttpLoader(http, './assets/i18n/', '.json');
        },
        deps: [HttpClient],
      },
    }),
  ],
  exports: [TranslateModule,DateTimePipe],
  providers: [
    TranslateService,
    TranslateStore,
    DatePipe,
    ConvertDateAndTimePipe,DateTimePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CSRFHeaderInterceptor,
      multi: true,
    },
    // to load api url's based on environment
    {
      provide: HTTP_INTERCEPTORS,
      useClass: GlobalErrorHandlerInterceptor,
      multi: true,
    },
    {
      provide:HTTP_INTERCEPTORS,
      useClass: AdminInterceptor,
      multi:true,
    },
    provideRouter(appRoutes, withComponentInputBinding()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
