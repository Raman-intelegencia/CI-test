import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AboutComponent } from "./about/about.component";
import { AccountComponent } from "./account/account.component";
import { PreferencesComponent } from "./preferences/preferences.component";
import { SettingsComponent } from "./settings/settings.component";

const routes: Routes = [
  {
    path: "",
    component: SettingsComponent,
    children: [
      {
        path: "account",
        component: AccountComponent,
      },
      {
        path: "preferences",
        component: PreferencesComponent,
      },
      {
        path: "about",
        component: AboutComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule { }
