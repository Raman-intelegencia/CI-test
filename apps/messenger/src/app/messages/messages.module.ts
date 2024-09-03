import { NgModule } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { MessagesRoutingModule } from "./messages-routing.module";
import { ConversationListsComponent } from "./conversation-lists/conversation-lists.component";
import { ConversationListsDetailComponent } from "./conversation-lists-detail/conversation-lists-detail.component";
import { ConversationSettingsComponent } from "./conversation-lists-detail/conversation-settings/conversation-settings.component";
import { ComposeComponent } from "../compose/compose.component";
import { TranslateModule } from "@ngx-translate/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { UserProfileModalComponent } from "./user-profile-modal/user-profile-modal.component";
import { AddRecipientComponent } from "./conversation-lists-detail/conversation-settings/add-recipient/add-recipient.component";
import { QuickMessagesComponent } from "../quick-messages/quick-messages.component";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { FormatServiceTeamPipe, ModalComponent, SanitizeHtmlPipe, ServiceTeamPopUpComponent, TimeAgoPipe } from "@amsconnect/shared";
import { SaveAsMessagingGrpComponent } from "./conversation-lists-detail/conversation-settings/save-as-messaging-grp/save-as-messaging-grp.component";
import { ExternalMessageComposeComponent } from "../external-message-compose/external-message-compose.component";
import { PatientProfilePopupComponent } from "../patient-profile-popup/patient-profile-popup.component";
import { MessageTruncatePipe } from "../../pipes/message-truncate.pipe";
import { CurrentScheduledServiceTeamComponent } from "./user-profile-modal/current-scheduled-service-team/current-scheduled-service-team.component";
import { ParseDatePipe } from "../../pipes/parse-date.pipe";
import { UsersSearchComponent } from "../common/users-search/users-search.component";

@NgModule({
  declarations: [
    ConversationListsComponent,
    ConversationListsDetailComponent,
    ConversationSettingsComponent,
    AddRecipientComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MessagesRoutingModule,
    TranslateModule,
    ComposeComponent,
    ExternalMessageComposeComponent,
    ModalComponent,
    QuickMessagesComponent,
    DragDropModule,
    TimeAgoPipe,
    FormatServiceTeamPipe,
    PatientProfilePopupComponent,
    UserProfileModalComponent,
    MessageTruncatePipe,
    SaveAsMessagingGrpComponent,
    CurrentScheduledServiceTeamComponent,
    NgOptimizedImage,
    UsersSearchComponent,
    SanitizeHtmlPipe,
    ServiceTeamPopUpComponent
  ],
  providers:[ParseDatePipe]
})
export class MessagesModule {}
