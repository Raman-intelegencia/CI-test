import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter, withComponentInputBinding } from '@angular/router';
import { AddAdtProcessorComponent } from './add-adt-processor/add-adt-processor.component';
import { ViewProvisioningComponent } from './view-provisioning/view-provisioning.component';
import { AddEditProcessorComponent } from './edit-processor/add-edit-processor.component';


const routes: Routes = [ 
  {
    path:'addadt',
    component:AddAdtProcessorComponent  
  },
  {
    path:'addprovi',
    component:AddEditProcessorComponent  
  },
  {
    path:'addprovi/:id',
    component:AddEditProcessorComponent  
  },
  {
    path:'view/:id',
    component:ViewProvisioningComponent
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers:[
    provideRouter(routes, withComponentInputBinding())
  ]
})

export class FileProcessorsRoutingModule { }
