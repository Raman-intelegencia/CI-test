import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PatientsRoutingModule } from './patients-routing.module';
import { AddPatientComponent } from './add-patient/add-patient.component';
import { EditPatientComponent } from './edit-patient/edit-patient.component';
import { PatientsSearchComponent } from './patients-search/patients-search.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InstitutionSearchComponent } from '../generic/institution-search/institution-search.component';
import { HighlightSearchTxtPipe, LoaderModelComponent, ModalComponent, SanitizeHtmlPipe } from '@amsconnect/shared';


@NgModule({
  declarations: [
    AddPatientComponent,
    EditPatientComponent,
    PatientsSearchComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PatientsRoutingModule,
    InstitutionSearchComponent,
    HighlightSearchTxtPipe,
    ModalComponent,
    SanitizeHtmlPipe,
    LoaderModelComponent,
  ]
})
export class PatientsModule { }
