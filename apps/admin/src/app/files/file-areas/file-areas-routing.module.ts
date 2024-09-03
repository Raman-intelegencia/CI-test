import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllFileAreaComponent } from './all-file-area/all-file-area.component';
import { DynamicViewComponent } from './dynamic-view/dynamic-view.component';
import { FileAreaMainViewComponent } from './file-area-main-view/file-area-main-view.component';

const routes: Routes = [
  {
    path: '',
    component: FileAreaMainViewComponent,
    children: [
      {
        path: '',
        component: AllFileAreaComponent,
      },
      {
        path: '**',
        component: DynamicViewComponent,
      },
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class FileAreasRoutingModule { }
