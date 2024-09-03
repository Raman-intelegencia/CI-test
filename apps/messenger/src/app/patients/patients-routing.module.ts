import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ExistingPatientsComponent } from "./existing-patients/existing-patients.component";
import { AddPatientComponent } from "./add-patient/add-patient.component";
import { ViewPatientDetailsComponent } from "./view-patient-details/view-patient-details.component";

const routes: Routes = [
  {
    path: "",
    component: ExistingPatientsComponent,
    children: [
      {
        path: "addPatients",
        component:  AddPatientComponent,
      }, 
    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PatientsRoutingModule {}
