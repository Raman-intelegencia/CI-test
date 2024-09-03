import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddAdtProcessorComponent } from './add-adt-processor/add-adt-processor.component';
import { ViewProvisioningComponent } from './view-provisioning/view-provisioning.component';
import { IstConversionPipe, LoaderModelComponent, ModalComponent, TimeAgoPipe } from '@amsconnect/shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FileProcessorsRoutingModule } from './file-processors-routing.module';
import { InstitutionSearchComponent } from '../generic/institution-search/institution-search.component';
import { ReportingTagsComponent } from '../users/reporting-tags/reporting-tags.component';
import { AddEditProcessorComponent } from './edit-processor/add-edit-processor.component';

@NgModule({
  declarations: [
    AddAdtProcessorComponent,
    ViewProvisioningComponent,
    AddEditProcessorComponent
  ],
  imports: [
    CommonModule,
    FileProcessorsRoutingModule, 
    ModalComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    TimeAgoPipe,
    IstConversionPipe,
    InstitutionSearchComponent,
    ReportingTagsComponent,
    LoaderModelComponent
  ],
})
export class FileProcessorsModule {}
