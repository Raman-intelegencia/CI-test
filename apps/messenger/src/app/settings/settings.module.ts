import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PreferencesComponent } from "./preferences/preferences.component";
import { TermsOfUseComponent } from "./about/terms-of-use/terms-of-use.component";
import { LicenseComponent } from "./about/license/license.component";
import { SettingsComponent } from "./settings/settings.component";
import { ProfileComponent } from "./account/profile/profile.component";
import { PasswordComponent } from "./account/password/password.component";
import { EnableNotificationsComponent } from "./enable-notifications/enable-notifications.component";
import { ManageMultipleAccountsComponent } from "./account/manage-multiple-accounts/manage-multiple-accounts.component";
import { PrivacyPolicyComponent } from "./about/privacy-policy/privacy-policy.component";
import { AccountComponent } from "./account/account.component";
import { SettingsRoutingModule } from "./settings-routing.module";
import { HelpPopUpsComponent } from "./preferences/help-pop-ups/help-pop-ups.component";
import { InboxManagementComponent } from "./preferences/inbox-management/inbox-management.component";
import { ManageGroupsComponent } from "./preferences/manage-groups/manage-groups.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { CurrentServiceTeamComponent, FormatServiceTeamPipe, ModalComponent,SanitizeHtmlPipe } from "@amsconnect/shared";
import { AboutComponent } from "./about/about.component";
import { PasswordValidationDirective } from "../Directive/Password-validation.directive";
import { UserProfileModalComponent } from "../messages/user-profile-modal/user-profile-modal.component";
import { SearchPipe } from "../../../../../libs/shared/src/lib/helpers/search.pipe"; 
import { ReleaseHistoryComponent } from "./about/release-history/release-history.component";
import { ReleaseNoteModelComponent } from "./about/release-note-model/release-note-model.component";
 

@NgModule({
  declarations: [
    AccountComponent,
    PreferencesComponent,
    AboutComponent,
    PrivacyPolicyComponent,
    TermsOfUseComponent,
    LicenseComponent,
    ManageMultipleAccountsComponent,
    HelpPopUpsComponent,
    InboxManagementComponent,
    ManageGroupsComponent,
    SettingsComponent,
    ProfileComponent,
    EnableNotificationsComponent,
    SearchPipe,
    ReleaseHistoryComponent,
    ReleaseNoteModelComponent,
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    TranslateModule,
    FormsModule,
    CurrentServiceTeamComponent,
    FormatServiceTeamPipe,
    ReactiveFormsModule,
    ModalComponent,
    PasswordValidationDirective,
    PasswordComponent,
    UserProfileModalComponent,
    SanitizeHtmlPipe
  ],
})
export class SettingsModule {}
