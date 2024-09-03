import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { CreateUserComponent } from './create-user/create-user.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { UserPermissionsComponent } from './user-permissions/user-permissions.component';
import { EventLogsComponent } from './event-logs/event-logs.component';
import { AuditUserComponent } from './audit-user/audit-user.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportingTagsComponent } from './reporting-tags/reporting-tags.component';
import { SuccessModalComponent } from '../helper/success-modal/success-modal.component';
import {
  HumanizedDatePipe,
  ModalComponent,
  HighlightSearchTxtPipe,
  SearchPipe,
  SanitizeHtmlPipe,
  SanitizeHtmlArrayPipe,
  DateTimePipe,
} from '@amsconnect/shared';
import { CreateApiUserComponent } from './create-api-user/create-api-user.component';
import { InstitutionSearchComponent } from '../generic/institution-search/institution-search.component';
import { UserStatusModalComponent } from './user-status-modal/user-status-modal.component';
import { ApiLogsComponent } from './api-logs/api-logs.component';
import { TimeSelectSearchComponent } from "../generic/timeSearchSelect/time-select-search.component";
import { CurrentServiceTeamComponent } from "../../../../../libs/shared/src/lib/helpers/modals/current-service-team/current-service-team.component";
import { NumericPipe } from '../../pipes/numeric.pipe';

@NgModule({
    declarations: [
        CreateUserComponent,
        UserDetailsComponent,
        UserInfoComponent,
        UserPermissionsComponent,
        EventLogsComponent,
        AuditUserComponent,
        CreateApiUserComponent,
        SearchPipe,
        UserStatusModalComponent,
        ApiLogsComponent,
        NumericPipe
         
    ],
    imports: [
        CommonModule,
        UsersRoutingModule,
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        ModalComponent,
        HumanizedDatePipe,
    SuccessModalComponent,
        ReportingTagsComponent,
        HighlightSearchTxtPipe,
        InstitutionSearchComponent,
        TimeSelectSearchComponent,
        SanitizeHtmlPipe,
        SanitizeHtmlArrayPipe,
        CurrentServiceTeamComponent,
        ],
        providers:[DatePipe],
})
export class UsersModule {}
