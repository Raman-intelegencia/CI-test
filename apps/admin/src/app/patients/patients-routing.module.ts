import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter, withComponentInputBinding } from '@angular/router';
import { AddPatientComponent } from './add-patient/add-patient.component';
import { EditPatientComponent } from './edit-patient/edit-patient.component';
import { PatientsSearchComponent } from './patients-search/patients-search.component';

const routes: Routes = [

  //default route path to search the patients
  {
    path: '',
    component: PatientsSearchComponent
  },

  // dynamic route path with institute name to add patient to the institution. 
  {
    path: 'add/:instituteName',
    component: AddPatientComponent
  },

  // dynamic route path with institute name and patient ID to edit the details of the institute's patient
  {
    path: 'edit/:instituteName/:patientId',
    component: EditPatientComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers:[
    provideRouter(routes, withComponentInputBinding())
  ]
})
export class PatientsRoutingModule { }
