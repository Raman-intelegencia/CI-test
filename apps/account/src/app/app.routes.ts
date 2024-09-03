import { Route } from "@angular/router";
import { CreatePasswordComponent } from "./create-password/create-password.component";
import { NonSSOLoginComponent } from "./login/non-ssologin/non-ssologin.component";

export const appRoutes: Route[] = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "login",
    loadChildren: () =>
      import("./login/login.module").then((m) => m.LoginModule),
  },

  {
    path: "password",
    loadChildren: () =>
      import("./password/password.module").then((m) => m.PasswordModule),
  },
  {
    path: "reset",
    component: CreatePasswordComponent,
  },
  {
    path: "accounts/add",
    component: NonSSOLoginComponent,
  },
  {
    path: "accounts/switch/:id",
    component: NonSSOLoginComponent,
  },
  {
    path: "welcome",
    component:CreatePasswordComponent,

  }
];
