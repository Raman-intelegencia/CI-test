import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { PatientsRoutingModule } from "./patients-routing.module";
import { ExistingPatientsComponent } from "./existing-patients/existing-patients.component";
import { ViewPatientDetailsComponent } from "./view-patient-details/view-patient-details.component";
import { AddPatientComponent } from "./add-patient/add-patient.component";
import { TranslateModule } from "@ngx-translate/core";
import { HighlightSearchKeyPipe, ModalComponent, TimeAgoPipe } from "@amsconnect/shared";
import { ComposeComponent } from "../compose/compose.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { UserProfileModalComponent } from "../messages/user-profile-modal/user-profile-modal.component";
import {IstConversionPipe} from "@amsconnect/shared"
import { MessageTruncatePipe } from "../../pipes/message-truncate.pipe";
import { ExternalMessageComposeComponent } from "../external-message-compose/external-message-compose.component";

@NgModule({
    declarations: [
        ExistingPatientsComponent,
        ViewPatientDetailsComponent,
        AddPatientComponent,
        HighlightSearchKeyPipe,
    ],
    imports: [
        CommonModule,
        FormsModule,
        PatientsRoutingModule,
        TranslateModule,
        TimeAgoPipe,
        ComposeComponent, ReactiveFormsModule, ModalComponent,
        UserProfileModalComponent,
        IstConversionPipe,
        MessageTruncatePipe,
        ExternalMessageComposeComponent,
    ]
})
export class PatientsModule {}
