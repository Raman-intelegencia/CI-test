import { Route } from "@angular/router";
import { RedirectToComponent } from "./redirect-to/redirect-to.component";

export const appRoutes: Route[] = [
  {
    path:"accounts/add",
    component: RedirectToComponent
  },
  {
    path:"accounts/switch/:id",
    component:RedirectToComponent
  },
  {
    path:"?user=:id",
    component:RedirectToComponent,
  },
  {
    path:"?user_id=:id",
    component:RedirectToComponent,
  },
  {
    path: "u/:id",
    loadChildren: () =>
      import("./messages/messages.module").then((m) => m.MessagesModule),
  },

  {
    path: "u/:id/patients",
    loadChildren: () =>
      import("./patients/patients.module").then((m) => m.PatientsModule),
  },
  {
    path: "u/:id/settings",
    loadChildren: () =>
      import("./settings/settings.module").then((m) => m.SettingsModule),
  },
];