import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter, withComponentInputBinding } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { CreateInstitutionComponent } from './create-institution/create-institution.component';
import { InstitutionReportingComponent } from './institution-reporting/institution-reporting.component';
import { InstitutionDetailsComponent } from './institution-details/institution-details.component';
import { InstitutionPermissionsComponent } from './institution-permissions/institution-permissions.component';
import { EventLogsComponent } from './event-logs/event-logs.component';
import { ApiLogsComponent } from './api-logs/api-logs.component';
import { BroadcastMessagingComponent } from './broadcast-messaging/broadcast-messaging.component';
import { QuickMessagesComponent } from './quick-messages/quick-messages.component';
import { CustomEmailsComponent } from './institution-details/custom-emails/custom-emails.component';
import { UploadUsersPreviewComponent } from './institution-details/configure-user-childOus/upload-users-preview/upload-users-preview.component';
import { SsoConfigurationComponent } from './sso-configuration/sso-configuration.component';
import { IntegrationWizardComponent } from './institution-details/integration-wizard/integration-wizard.component';
import { IntegrationDeactivateGuard } from './institution-details/integration-wizard/integration-deactivate.guard';


const routes: Routes = [

  {
    path: '', 
    pathMatch: 'full', 
    redirectTo: 'search' ,
},

  //Institution search route path and it's component.
  {
    path: 'search',
    component: SearchComponent
  },

  // Institution search with dynamic route path for institute name.
  {
    path: 'search/:instituteName',
    component: SearchComponent
  },

  // route path for creating new institute.
  {
    path: 'create',
    component: CreateInstitutionComponent
  },

  // route path for institution reporting. 
  {
    path: 'reporting',
    component: InstitutionReportingComponent
  },

  // dynamic route with institute name for viewing institute details.
  {
    path: ':institutionID',
    component: InstitutionDetailsComponent
  },

{
  path: ':instituteId/custom-email',
  component: CustomEmailsComponent
},
  {
    path: ':institutionID/create-integration',
    component: IntegrationWizardComponent,
    canDeactivate: [IntegrationDeactivateGuard]
  },
  {
    path: ':institutionID/create-integration/:integrationId',
    component: IntegrationWizardComponent,
    canDeactivate: [IntegrationDeactivateGuard]
  },
  {
    path: ':institutionID/update-integration/:integrationId',
    component: IntegrationWizardComponent,
    canDeactivate: [IntegrationDeactivateGuard]
  },
  // route path for institution permissions page.
  {
    path: ':institutionID/permissions',
    component: InstitutionPermissionsComponent
  },

  // dynamic route path with institute name for viweing the institute's event logs.
  {
    path: ':instituteId/event_log',
    component: EventLogsComponent
  },

  // dynamic route path with institute name for viweing the institute's api logs.
  {
    path: ':instituteId/api_log',
    component: ApiLogsComponent

  },

  // route path to add quick messages in institute.
  {
    path: 'batch_processing/quick_messages',
    component: QuickMessagesComponent
  },

  // route path of institution for broadcasting messages.
  {
    path: 'batch_processing/broadcast_messaging',
    component: BroadcastMessagingComponent
  },

  {
    path:':instituteId/csv_upload',
    component: UploadUsersPreviewComponent
  },
  // SSO configuration component
  {
    path: ':instituteId/sso_configuration',
    component: SsoConfigurationComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers:[
    provideRouter(routes, withComponentInputBinding())
  ]
})

export class InstitutionsRoutingModule { }
