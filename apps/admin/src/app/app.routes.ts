import { Route } from '@angular/router';
import { UserSearchComponent } from './user-search/user-search.component';
import { JobDetailsComponent } from './files/jobs/job-details/job-details.component';

export const appRoutes: Route[] = [

    // Initial default route for admin user.
    {
        path: '', 
        pathMatch: 'full', 
        redirectTo: 'search' ,
    },

    // user search route path and it's component.
    {
        path: 'search',
        component: UserSearchComponent
    },

    // user search with username as dynamic path and it's component. 
    {
        path: 'search/:userName',
        component: UserSearchComponent
    },

    // user route path loads the users module with it's corresponding routes.
    {
        path: 'user',
        loadChildren: () => import('./users/users.module').then(m => m.UsersModule)
    },

    // institution route path loads the institutions module & it's corresponding routes.
    {
        path: 'institution',
        loadChildren: () => import('./institutions/institutions.module').then(m => m.InstitutionsModule)
    },

    // jobs route path loads the jobs module & it's corresponding routes.
    {
        path: 'filearea',
        loadChildren: () => import('./files/files.module').then(m => m.FilesModule)
    },
    // jobs route path loads the jobs module & it's corresponding routes.
    { path: 'jobs', loadChildren: () => import('./files/jobs/jobs.module').then(m => m.JobsModule) },

    { path: 'job/:jobId', component: JobDetailsComponent },
    
    {
        path:'patients',
        loadChildren: () => import('./patients/patients.module').then(m => m.PatientsModule)
    },
    {
        path:'dropbox',
        loadChildren: () => import('./file-processors/file-processors.module').then(m => m.FileProcessorsModule)
    }
];
