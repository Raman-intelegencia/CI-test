import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllJobsComponent } from './all-jobs/all-jobs.component';
import { UserJobsComponent } from './user-jobs/user-jobs.component';
import { JobsRoutingModule } from './jobs-routing.module';
import { TranslateModule} from '@ngx-translate/core';
import { IstConversionPipe, LoaderModelComponent, ModalComponent, TimeAgoPipe } from '@amsconnect/shared';
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [AllJobsComponent, UserJobsComponent],
  imports: [CommonModule,JobsRoutingModule,
    ModalComponent,
    TranslateModule,
    ReactiveFormsModule,
    IstConversionPipe,
    TimeAgoPipe,
    LoaderModelComponent
  ],
  exports: [],
  providers: []
})
export class JobsModule {}