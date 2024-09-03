import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ModalComponent } from '@amsconnect/shared';
import { JobsRoutingModule } from './jobs/jobs-routing.module';
import { FilesRoutingModule } from './files-routing.module';

@NgModule({
  declarations: [],
  imports: [
    FilesRoutingModule,
    JobsRoutingModule,
    CommonModule,
    TranslateModule,
    ModalComponent,
  ]
})
export class FilesModule { }
