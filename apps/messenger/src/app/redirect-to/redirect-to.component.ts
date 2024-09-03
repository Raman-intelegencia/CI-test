import { AuthService, AuthUser, CookieService, UsersAuthResponse } from "@amsconnect/shared";
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AccountAssociationsService } from "../../services/account-association-helper.service";

@Component({
    selector: "web-messenger-redirect-to-component",
    template: "",
  })

  export class RedirectToComponent  {

    constructor(
        public accountAssociationSvc:AccountAssociationsService,
        public cookieSvc:CookieService,private authService: AuthService, private route:Router){

    }
  }