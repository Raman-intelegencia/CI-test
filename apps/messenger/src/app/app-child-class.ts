import { environment, PopupServiceService, UpdateStatusResponse, UsersAuthResponse } from '@amsconnect/shared';
import { computed, Injectable } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorMessageService } from 'libs/shared/src/lib/services/account-services/error.service';
import { Subscription } from 'rxjs';
const COMPOSE = 'compose';
const TRUE = 'true';
@Injectable()
export class AppChildClassComponent {
  public userIndex: number | null = null;
  public currentRoute = '';
  public tosUrl!: SafeResourceUrl;
  public showPatientTab = false;
  public authResponse!: UsersAuthResponse;
  public serviceTeam: string | undefined;
  public showCounts = 0;
  public isDropdownOpen = false;
  public maxLength = 27;
  public showServices: string[] = [];
  public isTempPassword = false;
  public is_password_change_reason:string = "";
  public userId = '';
  public url = '';
  public accountUrl = '';
  public journalId = 0;
  public archiveChats = false;
  public imageId = '';
  public imageUrl = '';
  public errorMessage = '';
  public connectionError = '';
  public successError = '';
  public userAvailabilityStatus: string | undefined;
  public subscription: Subscription[] = [];
  public messageType = {
    externalMessage: "ExternalMessage",
    composeMessage: "InternalMessage",
};
  public composePopups = computed(() => this.popUpService.composePopups());
  public composePopupValue = this.messageType.composeMessage;
  public externalComposePopups = computed(() => this.popUpService.externalComposePopups());
  constructor(
    public router: Router,
    public errorMessageService: ErrorMessageService,
    public route: ActivatedRoute,  
    private popUpService: PopupServiceService,
  ) {}

  public getUpdatedUsersStatus(statusResponse: UpdateStatusResponse): void {
    this.authResponse = statusResponse;
  }

  public closepopup(): void {
    this.successError = '';
  }

  public showErrorMessage(): void {
    const subs = this.errorMessageService.errorResponse$.subscribe(
      (state) => (this.errorMessage = state)
    );
    this.subscription.push(subs);
  }

  public navigateTo(path: string): void {
    localStorage.removeItem('selectedThreadId');
    this.route.firstChild?.params.subscribe((params) => {
      this.userIndex = params['id'];
      this.router.navigateByUrl(`u/${this.userIndex}/${path}`);
    });
  }

  public isRouterLinkActive(routeSegment: string): boolean {
    const urlSegments = this.router.url.split('?')[0].split('/'); // Split by '?' first to ignore query params
    return urlSegments.includes(routeSegment);
  }

  public toggleDropdown(event:Event): void {
  event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  public redirectToLogin() {
    window.location.href = environment.accounts_server_url;
  }


  public onComposeButtonClick(): void {
    const composeData = {
      to: [],
      patient: "",
      subject: "",
      message: "",
    };
    this.popUpService.addComposePopUp(composeData);
  }

  private updateQueryParams(params: object) {
    const mergedQueryParams = {
      ...this.route.snapshot.queryParams,
      ...params,
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: mergedQueryParams,
    });
  }

  public swapActivePopup(index: number) {
    this.popUpService.swapComposePopUps(index);
  }

    public swapActiveExternalPopup(index: number) {
      this.popUpService.swapComposeExternalPopUps(index);
  }

  public closeComposePopup(index: number, messageType = this.messageType.composeMessage): void {
    messageType === this.messageType.composeMessage ? this.popUpService.removeComposePopUp(index) : this.popUpService.removeExternalComposePopUp(index);
    if (this.composePopups().length === 0 && this.externalComposePopups().length === 0) {
        this.updateQueryParams({ [COMPOSE]: null });
    }
}

public listenRouteParams(): void {
  this.subscription.push(
    this.route.queryParams.subscribe((params) => {
      if (params[COMPOSE] === TRUE && this.composePopups().length === 0) {
        this.onComposeButtonClick();
      }
    })
  );
}

 public handleDropdownClosed(isDropdownOpen: boolean): void { 
  this.isDropdownOpen = isDropdownOpen;
  }

}
