import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter, withComponentInputBinding } from '@angular/router';
import { CreateUserComponent } from './create-user/create-user.component';
import { UserDetailsComponent } from './user-details/user-details.component';

const routes: Routes = [

  {
    path: '', 
    pathMatch: 'full', 
    redirectTo: 'create' ,
},
  // route path to create new user.
  {
    path: 'create', 
    component: CreateUserComponent
  },

  // dynamic route path with user ID to view the details of particular user.
  {
    path: ':userId', 
    component: UserDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers:[
    provideRouter(routes, withComponentInputBinding())
  ]
})
export class UsersRoutingModule { }
