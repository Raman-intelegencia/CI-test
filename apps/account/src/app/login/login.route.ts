import { Route } from '@angular/router';
import { InstitutionComponent } from './institution/institution.component';
import { NonSSOLoginComponent } from './non-ssologin/non-ssologin.component';

export const loginRoutes: Route[] = [
    {
        path: '',
        component: NonSSOLoginComponent
      },
      {
        path:'institution',
        component: InstitutionComponent
      },
      
];