import { AccountAssociation, AuthService, AuthUser, CookieService, MultiUserService, UserService, UsersAuthResponse, UsersListingService, access_group_actions_map } from '@amsconnect/shared';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '@amsconnect/shared';
import { Subscription, filter, take } from 'rxjs';
import { UserHelperService } from '../services/user-helper.service';
import { QueryParamsService } from '../services/queryparams.service';
import { AppNavigationService } from '../services/app-navigation.service';
import { UserInfoService } from '../services/user-info.service';
import { AccountAssociationsService } from '../services/account-association-helper.service';
@Component({
  selector: "web-admin",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "AMSConnect Admin";
  public authResponse!: UsersAuthResponse;
  public readonly accountUrl = environment.accounts_server_url;
  public userAdminPermissions!: access_group_actions_map;
  public userName = "";
  public menutoggle = false;
  public fileAreaAdmin = false;
  public subscription = new Subscription;
  public userImageUrl= "";
  public isImageVisible = false;
  public userId="";
  public isTempPassword = false;
  public is_password_change_reason = "";
  public multiAccountUsersData!:AuthUser[];
  public config_profileimage_url = "";
  public showUsersForSwitch = false;
  public loggedInUserId = "";
  public authSubscription = new Subscription;
  public imageSubscription = new Subscription();
  public imageId = '';

  constructor(
    public  multiUserSvc: MultiUserService,
    private translateService: TranslateService,
    private authService: AuthService,
    private userService: UserService,
    private userHelperSvc: UserHelperService,
    private router: Router,
    public userInfoSvc:UserInfoService,
    private accountAssociationSvc:AccountAssociation,
    private accountAssociation : AccountAssociationsService,
    private cookieSvc:CookieService,
    private route: ActivatedRoute,
    public usersListingSvc: UsersListingService,
    public queryParamsSvc:QueryParamsService,
    public navigateSvc: AppNavigationService,
  ) {
    this.translateService.setDefaultLang("en");
  }

  ngOnInit(): void {
    //Get the current tab id from session
    const tabId = sessionStorage.getItem('tabId');
    // fetch the user id from cookie with tab id as unique identifier.
    const userId = this.cookieSvc.getCookie(`current_user_id_${tabId}`);
    if (userId) {
      this.loggedInUserId  = userId;
      // Navigate and set query params only if user_id is present
      this.queryParamsSvc.setQueryParams({ current_user_id: userId });
      this.updateCurrentRouteQueryParams(userId)
    }
    this.subscription.add(this.userService.imageId$.subscribe(imageId => {
      this.isImageVisible = imageId !== '';
        this.userImageUrl = this.getImageUrl(imageId);
    }))

    this.fetchUserAuth();
    this.subscription = this.authService.authResponseData$.subscribe(response => {
      if(response && response.user && response.user._id){
        if(!this.loggedInUserId){
          this.userPermissionAccessFileAreasTemPassword(response);
        }else if(this.loggedInUserId == response.user._id.$oid){
          this.fileAreaAdmin = response?.config?.client_permissions?.filearea_admin;
          this.isTempPassword = response?.user?.is_temp_password; 
          this.is_password_change_reason = response?.user?.password_change_reason;
          if (response.user && response.user.access_group_actions_map) {
            this.userAdminPermissions = response.user.access_group_actions_map;
          }
        }
      }
    })
  }

  private updateCurrentRouteQueryParams(userId: string): void {
    // Ensure Angular's router is ready to manipulate the route
    this.router.events.pipe(filter(event => event instanceof NavigationEnd), take(1))
      .subscribe(() => {
        // Use Angular's router to update the current route's queryParams
        // without navigating away
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { current_user_id: userId },
          queryParamsHandling: 'merge', // Merge with existing query params
          replaceUrl: true // Replace the current state in history
        });
      });
  }
  /**
 * Fetches and processes user authentication data.
 * In the case of a logged-in user (indicative of a multi-user context), it fetches all logged-in users,
 * finds the matching user based on `loggedInUserId`, filters out non-admin users and the current user
 * from the list to update `multiAccountUsersData` for UI display, and processes the authentication response.
 * For a single user context (no `loggedInUserId`), it directly fetches and processes the user's authentication data.
 */
  public fetchUserAuth(): void {
  // Check if there's a logged-in user ID, indicating a multi-user context.
  if(this.loggedInUserId){
    // Fetch all logged-in users.
    this.multiUserSvc.checkAllUsersLogged().then(allUsers => {
      // Find the user that matches the logged-in user ID.
      const matchingUser = allUsers.find(user => user.user._id.$oid === this.loggedInUserId);

      // Filter out all users to find those who are admins and not the current logged-in user.
      // This data is used to display other admin accounts in the UI.
      this.multiAccountUsersData = allUsers
        .filter(item => {
          const isDifferentUser = item.user._id.$oid !== matchingUser?.user._id.$oid;
          const isAdmin = this.userService.getUserType(item.user) === "admin";
          return isDifferentUser && isAdmin;
        })
        .map(item => item.user);

      // If a matching user is found, process the authentication response for that user.
      let authReponse: UsersAuthResponse;
      if (matchingUser) {
        authReponse = matchingUser;
        this.processAuthResponse(authReponse, true);
      }
      // Note: Ensure these operations are performed after authReponse is assigned
      // to properly handle the authentication response.
    })
  } else {
    // For a single user context (no logged-in user ID),
    // directly fetch and process the user's authentication data.
    this.authService.usersAuth().subscribe((response: UsersAuthResponse) => {
      this.processAuthResponse(response, false);
    });
  }
  }

  // Process the auth data to authenticate the user & update as required
  private processAuthResponse(response: UsersAuthResponse, multiUser:boolean): void {
    if (response.status === "error" && response.message === "authentication required") {
      this.navigateToAccount();
      return;
    }
    this.authResponse = response;
    if(multiUser){
      if(this.loggedInUserId === response.user._id.$oid){
        this.authService.setAuthUsersReponse(response);
      }
    }else{
      this.authService.setAuthUsersReponse(response);
    }
    
    if (response.status === "ok") {
      const userType = this.userService.getUserType(response.user);
      if (userType !== "admin") {
        this.navigateToAccount();
      } else {
        if(response.user){
          this.userService.setImageId(response.user.image_id);
          this.isImageVisible = response.user.image_id !== ''; //check if the image id exists 
          //  construct the image url
           this.userImageUrl = response?.user?.image_id
            ? response.config.config_profileimage_url +
              response.user.image_id +
              "_profile.png"
            : "";
          this.userName = response.user.first_name + " " + response.user.last_name;
          this.userService.setImageUrlPath(response?.config?.config_profileimage_url ? response?.config?.config_profileimage_url: "");
          this.config_profileimage_url = response?.config?.config_profileimage_url ? response?.config?.config_profileimage_url: ""
          this.userId = response.user._id.$oid;
          this.userService.setUserId(response.user._id.$oid);
          const hasPhiIids = Array.isArray(response.user.phi_iids) && response.user.phi_iids.length > 0;
          this.userHelperSvc.setViewPhi(hasPhiIids);
          if (response.user && response.user.access_group_actions_map) {
            this.userAdminPermissions = response.user.access_group_actions_map;
          }
        }
    }
  }
  }

  public checkIfMultiAuthedUser():boolean{
    return this.multiUserSvc.checkIsMultiUsers();
  }

public navigateToPatients():void { 
  this.router.navigate(['/patients'], { queryParams: { user_id: this.userId } })
}

public navigateToUsers(): void {
  this.userInfoSvc.setUserInfoPageRedirection(false);
  this.navigateSvc.navigate(['/search']);
}

public navigateToInstitutions(): void {
  this.navigateSvc.navigate(['./institution/search']);
}

public navigateToFileAreas(): void { 
  this.router.navigate(['./jobs/all'])
}
// redirect the user to login page
private navigateToAccount(): void {
  const url = new URL(this.accountUrl);
  window.location.assign(url);
}

public navigateToPage(path:string):void{ 
  this.router.navigate([`.${path}`])
}

  // logout user and redirect to login page
  public logout(): void {
      // Clear localStorage
      localStorage.clear();
      this.removeCurrentUserCookie();
      this.accountAssociationSvc.createLogoutCookieForAdmin();
      this.accountAssociation.explicitlyLogoutRemovedUser(this.authResponse?.user?._id.$oid);
  }

  public removeCurrentUserCookie():void{
    const tabId = sessionStorage.getItem('tabId');
    if(tabId){
      const cookieName = `current_user_id_${tabId}`;
      this.cookieSvc.removeCookie(cookieName);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.imageSubscription.unsubscribe();
  }

  public getImageUrl(image_id: string): string {
    return this.usersListingSvc.getImageUrl(this.config_profileimage_url, image_id);
  }

  public openSelectedAccount(userId:string | undefined):void{
    localStorage.setItem('requestNewTabId', 'true');
    // Construct the URL with the user_id if present
    const authString = userId ? `?user_id=${userId}` : '';
    window.open(environment.admin_server_url + authString, '_blank');
  }

  public userPermissionAccessFileAreasTemPassword(data:UsersAuthResponse):void{
    this.fileAreaAdmin = data?.config?.client_permissions?.filearea_admin;
    this.isTempPassword = data?.user?.is_temp_password; 
    this.is_password_change_reason = data?.user?.password_change_reason;
  }

}