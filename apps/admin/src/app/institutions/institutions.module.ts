import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InstitutionsRoutingModule } from './institutions-routing.module';
import { SearchComponent } from './search/search.component';
import { InstitutionDetailsComponent } from './institution-details/institution-details.component';
import { InstitutionReportingComponent } from './institution-reporting/institution-reporting.component';
import { InstitutionPermissionsComponent } from './institution-permissions/institution-permissions.component';
import { CreateInstitutionComponent } from './create-institution/create-institution.component';
import { QuickMessagesComponent } from './quick-messages/quick-messages.component';
import { ApiLogsComponent } from './api-logs/api-logs.component';
import { EventLogsComponent } from './event-logs/event-logs.component';
import { BroadcastMessagingComponent } from './broadcast-messaging/broadcast-messaging.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  ErrorComponent,
  SharedModule,
  TimeAgoPipe,
  HighlightSearchTxtPipe,
  ModalComponent, SanitizeHtmlPipe, SanitizeHtmlArrayPipe,
  LoaderModelComponent,
} from '@amsconnect/shared';
import { PermissionModalComponent } from '../helper/permission-modal/permission-modal.component';
import { InstitutionSubdetailsComponent } from './institution-details/institution-subdetails/institution-subdetails.component';
import { ReportingTagsComponent } from '../users/reporting-tags/reporting-tags.component';
import { TitleComponent } from './broadcast-messaging/title/title.component';
import { SpecialtyComponent } from './broadcast-messaging/specialty/specialty.component';
import { UploadUsersPreviewComponent } from './institution-details/configure-user-childOus/upload-users-preview/upload-users-preview.component';
import { ConfigureUserChildOusComponent } from './institution-details/configure-user-childOus/configure-user-child-ous.component';
import { SuccessModalComponent } from '../helper/success-modal/success-modal.component';
import { InstituteLeftpanelComponent } from './institute-leftpanel/institute-leftpanel.component';
import { SsoConfigurationComponent } from './sso-configuration/sso-configuration.component';
import { ReassignModalComponent } from '../helper/reassign-modal/reassign-modal.component';
import { GenericEventLogsComponent } from '../generic/event-logs/generic-event-logs.component';
import { TimeSelectSearchComponent } from '../generic/timeSearchSelect/time-select-search.component';
import { IntegrationWizardComponent } from './institution-details/integration-wizard/integration-wizard.component';
import { IntegrationWizardDoneStepComponent } from './institution-details/integration-wizard/done-step/done-step.component';
import { SettingsStepComponent } from './institution-details/integration-wizard/settings-step/settings-step.component';
import { MatchUsersStepComponent } from './institution-details/integration-wizard/match-users-step/match-users-step.component';
import { CardListComponent } from './institution-details/integration-wizard/card-list/card-list.component';
import { BaseCardComponent } from './institution-details/integration-wizard/base-card/base-card.component';
import { MatchedCardListComponent } from './institution-details/integration-wizard/matched-card-list/matched-card-list.component';
import { MatchedCardPairComponent } from './institution-details/integration-wizard/matched-card-list/matched-card-pair/matched-card-pair.component';
import { MatchServicesStepComponent } from './institution-details/integration-wizard/match-services-step/match-services-step.component';
import { EmailSettingsComponent } from './institution-details/configure-user-childOus/email-settings/email-settings.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TitleToWordsPipe } from '../../pipes/title-to-words-pipe.pipe';



@NgModule({
  declarations: [
    SearchComponent,
    InstitutionDetailsComponent,
    InstitutionReportingComponent,
    InstitutionPermissionsComponent,
    CreateInstitutionComponent,
    QuickMessagesComponent,
    ApiLogsComponent,
    EventLogsComponent,
    BroadcastMessagingComponent,
    InstitutionSubdetailsComponent,
    TitleComponent,
    SpecialtyComponent,
    ConfigureUserChildOusComponent,
    UploadUsersPreviewComponent,
    InstituteLeftpanelComponent,
    SsoConfigurationComponent,
    IntegrationWizardComponent,
    IntegrationWizardDoneStepComponent,
    SettingsStepComponent,
    MatchUsersStepComponent,
    CardListComponent,
    BaseCardComponent,
    MatchedCardListComponent,
    MatchedCardPairComponent,
    MatchServicesStepComponent,
    EmailSettingsComponent,
  ],
  imports: [
    CommonModule,
    InstitutionsRoutingModule,
    TranslateModule,
    FormsModule,
    ScrollingModule,
    ReactiveFormsModule,
    ModalComponent,
    ReassignModalComponent,
    PermissionModalComponent,
    ReportingTagsComponent,
    SuccessModalComponent,
    ErrorComponent,
    HighlightSearchTxtPipe,
    GenericEventLogsComponent,
    TimeSelectSearchComponent,
    PermissionModalComponent,
    ReportingTagsComponent,
    TimeAgoPipe,
    SharedModule,
    SanitizeHtmlPipe,
    SanitizeHtmlArrayPipe,
    TitleToWordsPipe,
    LoaderModelComponent,
  ]
})
export class InstitutionsModule {}
