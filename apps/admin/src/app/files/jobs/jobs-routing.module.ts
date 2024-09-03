import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter, withComponentInputBinding } from '@angular/router';
import { AllJobsComponent } from './all-jobs/all-jobs.component';
import { UserJobsComponent } from './user-jobs/user-jobs.component';

const routes: Routes = [
  
  //route path to view user jobs. 
  {
    path:'mine',
    component: AllJobsComponent
  },

  // route path to view all jobs.
  {
    path: 'all',
    component: AllJobsComponent
  },

  // dynamic route path with institute name to view the all the jobs of that institution.
  {
    path: 'institution/:instituteName',
    component: AllJobsComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers:[
    provideRouter(routes, withComponentInputBinding())
  ]
})
export class JobsRoutingModule { }
