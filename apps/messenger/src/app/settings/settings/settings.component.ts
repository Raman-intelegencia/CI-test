import { AuthService, UserService, UsersAuthResponse } from "@amsconnect/shared";
import { Component, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SetNameParameterService } from "apps/messenger/src/services/setNameParameter.service";

@Component({
    selector: "web-messenger-settings",
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent {
    public accountSideNavigation: any;
    public preferencesSideNavigation: any;
    public aboutSideNavigation: any;
    public url!: string;
    public status = "";
    public userIndex = "";
    public settingMobile: boolean = false;
    public userType = "";
    public authResponseData!: UsersAuthResponse;
    constructor(private router: Router, private setNameParameterService: SetNameParameterService, private route: ActivatedRoute, private userService: UserService, private authService: AuthService) {}
    ngOnInit(): void {
        this.userService.userIndex$.subscribe((userIndex:string) => {
            userIndex ? (this.userIndex = userIndex) : null;
        });
        this.checkForAccount();
        this.checkForabout();
        this.authService.authResponseData$.subscribe((data: UsersAuthResponse) => {
            this.authResponseData = data;
            this.userType = this.userService.getUserType(this.authResponseData.user); 
        });
        this.checkForPreferences();
    }

    public checkForAccount(): void {
        this.accountSideNavigation = [
            { name: "Profile", divId: "profile-section" },
            { name: "Multiple Accounts", divId: "multiple-accounts-section" },
            { name: "Password", divId: "password-section" },
        ];
    }

    public checkForPreferences(): void { 
        if (this.userType !== "basic") {
            this.preferencesSideNavigation = [
                { name: "Enable notifications", divId: "enable-notification-section" },
                { name: "Help pop-ups", divId: "help-pop-ups-section" },
                { name: "Inbox Management", divId: "inbox-management-section" },
                { name: "Manage Groups", divId: "manage-groups-section" },
            ];
        } else{
            this.preferencesSideNavigation = [
                { name: "Enable notifications", divId: "enable-notification-section" },
                { name: "Help pop-ups", divId: "help-pop-ups-section" },
                { name: "Inbox Management", divId: "inbox-management-section" },
            ];
        }
    }

    public checkForabout(): void {
        this.aboutSideNavigation = [
            { name: "About", divId: "about-section" },
            { name:"Release History", divId: "release-history" },
            { name: "Terms of Use", divId: "terms-of-use-section" },
            { name: "Privacy Policy", divId: "privacy-policy-section" },
            { name: "License", divId: "license-section" },
            
        ];
    }

    public AccountScrollTo(index: number, name: string): void {
        if (this.userIndex) {
            this.router.navigate([`u/${this.userIndex}/settings/account`]);
            const element = document.getElementById(this.accountSideNavigation[index].divId);
            this.status = name;
            this.setNameParameterService.sendData(this.status);
            if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
            this.settingMobile = !this.settingMobile;
        }
    }

    public PreferencesScrollTo(index: number, name: string): void {
        if (this.userIndex) {
            this.router.navigate([`u/${this.userIndex}/settings/preferences`]);
            this.status = name;
            this.setNameParameterService.sendData(this.status);
            const element = document.getElementById(this.preferencesSideNavigation[index].divId);
            if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
            this.settingMobile = !this.settingMobile;
        }
    }

    public AboutScrollTo(index: number, name: string): void {
        if (this.userIndex) {
            this.router.navigate([`u/${this.userIndex}/settings/about`]);
            this.status = name;
            this.setNameParameterService.sendData(this.status);
            const element = document.getElementById(this.aboutSideNavigation[index].divId);
            if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
            this.settingMobile = !this.settingMobile;
        }
    }
    clickSettingToggle() {
        this.settingMobile = !this.settingMobile;
    }
}
