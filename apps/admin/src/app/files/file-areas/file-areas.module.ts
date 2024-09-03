import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllFileAreaComponent } from './all-file-area/all-file-area.component';
import { FileAreasRoutingModule } from './file-areas-routing.module';
import { DynamicViewComponent } from './dynamic-view/dynamic-view.component';
import { IstConversionPipe, LoaderModelComponent, ModalComponent, TimeAgoPipe } from '@amsconnect/shared';
import { FileAreaMainViewComponent } from './file-area-main-view/file-area-main-view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AllFileAreaComponent,
    DynamicViewComponent,
    FileAreaMainViewComponent,
  ],
  imports: [
    CommonModule, 
    FileAreasRoutingModule, 
    ModalComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    TimeAgoPipe,
    IstConversionPipe,
    LoaderModelComponent
  ],
})
export class FileAreasModule {}
