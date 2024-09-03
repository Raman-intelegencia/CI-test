import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import {
  DayOfWeekDisplayPipe,
  FormatServiceTeamPipe,
  TimerPipe,
  ModalComponent,
  ChangePasswordComponent,
  ConvertDateAndTimePipe,
  CurrentServiceTeamComponent,
  ServiceTeamPopUpComponent,
  DateTimePipe,
  LoaderModelComponent,
} from '@amsconnect/shared';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OtpComponent } from './otp/otp.component';
import { ProfileStatusDropdownComponent } from './profile-status-dropdown/profile-status-dropdown.component';
import { TermsOfServicesComponent } from './terms-of-services/terms-of-services.component';
import { OffDutyModalComponent } from './off-duty-modal/off-duty-modal.component';
import { NotifierService } from '../services/socket.service';
import { OffDutyUserPickerComponent } from './offduty-user-picker/offduty-user-picker.component';
import { PatientProfilePopupComponent } from './patient-profile-popup/patient-profile-popup.component';
import { SafePipe } from './pipes/safe.pipe';
import { AccountAssociationsService } from '../services/account-association-helper.service';
import { RedirectToComponent } from './redirect-to/redirect-to.component';
import { MessengerInterceptor } from '../services/messenger-http-interceptor';
import { DatePipe } from '@angular/common';
import { UserProfileModalComponent } from './messages/user-profile-modal/user-profile-modal.component';
import { ComposeComponent } from './compose/compose.component';
import { ExternalMessageComposeComponent } from './external-message-compose/external-message-compose.component';
import { ScheduledStatusPopupComponent } from './scheduled-status-popup/scheduled-status-popup.component';
import { ScheduleNewStatusPopupComponent } from './schedule-new-status-popup/schedule-new-status-popup.component';
import { AutoResponseModelComponent } from './auto-response-model/auto-response-model.component';
import { UserSearchComponent } from './user-search/user-search-model.component';

@NgModule({
  declarations: [
    AppComponent,
    OtpComponent,
    TimerPipe,
    ProfileStatusDropdownComponent,
    OffDutyModalComponent,
    TermsOfServicesComponent,
    SafePipe,
    RedirectToComponent,
    ScheduledStatusPopupComponent,
    ScheduleNewStatusPopupComponent,
  
  ],
  imports: [
    UserProfileModalComponent,
    BrowserModule,
    CurrentServiceTeamComponent,
    ServiceTeamPopUpComponent,
    DayOfWeekDisplayPipe,
    ReactiveFormsModule,
    FormsModule,
    OffDutyUserPickerComponent,
    ModalComponent,
    ChangePasswordComponent,
    FormatServiceTeamPipe,
    PatientProfilePopupComponent,
    ComposeComponent,
    LoaderModelComponent,
    AutoResponseModelComponent,
    ExternalMessageComposeComponent,
    UserSearchComponent,
    RouterModule.forRoot(appRoutes, {
      initialNavigation: 'enabledBlocking',
      useHash: true,
    }),
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
  exports: [TranslateModule],
  providers: [
    TranslateService,
    AccountAssociationsService,
    NotifierService,
    TranslateStore,
    ConvertDateAndTimePipe,
    DateTimePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MessengerInterceptor,
      multi: true,
    },
    DatePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
