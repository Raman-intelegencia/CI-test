import {
  UserService,
  UsersAuthResponse,
  AuthService,
  CookieService,
  AuthUser,
  CommonService,
  PopupServiceService,
  Patient,
  ErrorMessageService,
  environment,SelectedThreadHelperService
} from '@amsconnect/shared';
import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  computed,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  filter,
  combineLatest,
  Observable,
  retry,
  timer,
  bindCallback,
} from 'rxjs';
import {
  AccountAssociationsService,
  STYPE,
} from '../services/account-association-helper.service';
import { NotifierService } from '../services/socket.service';
import { InboxHelperService } from '../services/inbox-helper.service';
import { ClientDataSetManager } from '../services/clientDataSetManager.service';
import { AppChildClassComponent } from './app-child-class';
import { ComposeHelperService } from '../services/compose-helper.service';
import { PopupStateService } from '../services/off-duty-model.service';
import { UserSessionService } from '../services/user-session.service';
import { ExponentialDelay } from './exponentialDelay';
@Component({
  selector: 'web-messenger-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent
  extends AppChildClassComponent
  implements OnInit, OnDestroy
{
  public agreement = {
    agreementId: '',
    agreementDocument: '',
    agreementVersion: '',
  };
  title = 'messenger';
  public readonly CONFIG = { count: 3, delay: 200 };
  public patientData: Patient[] = [];
  public xdUrl: SafeResourceUrl;
  public retryCount = 0;
  public max_retry_count = 7;
  public selectedUserId = '';
  public showOffDutyModal = false;
  public showErrorModal = false;
  public backoffTimer = new ExponentialDelay();
  constructor(
    private translateService: TranslateService,
    private commonService: CommonService,
    private userService: UserService,
    private authService: AuthService,
    public sanitizer: DomSanitizer,
    public cookieSvc: CookieService,
    popUpService: PopupServiceService,
    public accountAssociationSvc: AccountAssociationsService,
    private notifySvc: NotifierService,
    private inboxHelperSvc: InboxHelperService,
    private clientDataSetManagerSvc: ClientDataSetManager,
    router: Router,
    @Inject(ErrorMessageService) errorMessageService: ErrorMessageService,
    route: ActivatedRoute,
    public composeHelperService: ComposeHelperService,
    private selectedThreadHelperService: SelectedThreadHelperService,
    private popupStateService: PopupStateService,
    private userSessionSvc: UserSessionService
  ) {
    super(router, errorMessageService, route, popUpService);
    this.translateService.setDefaultLang('en');
    this.xdUrl = this.sanitizeURL(`${environment.baseUrl}/users/xd`);
    this.clientDataSetManagerSvc.startInactivityTimer(); // Start the timer when the app initializes
    this.subscription.push(
      this.composeHelperService.patientData$.subscribe((state) => {
        this.patientData = state;
      })
    );
  }

  ngOnInit(): void {
    this.accountUrl = environment.accounts_server_url;
    this.fetchUserAuth();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentRoute = this.router.url.match(/\/u\/(\d+)\/[a-zA-Z0-9]+/)
          ? this.router.url
          : '';
        this.showErrorMessage();
        const sub = this.errorMessageService.ConnectionErrorResponse$.subscribe(
          (state) => (this.connectionError = state)
        );
        this.subscription.push(sub);
      });
    this.getLoadLatest();
    this.listenRouteParams();
    this.composeHelperService.userId$.subscribe((state) => {
      this.selectedUserId = state;
    });
    this.notifySvc
      .connect();
    this.subscription.push(
      this.notifySvc.onOpen.subscribe((data: any) => {
        this.notifySvc.sendMessage(
          this.cookieSvc.getCookie('a') || '',
          this.userId
        );
      })
    );
    this.subscription.push(
      this.notifySvc.onClose.subscribe((data: any) => {
        this.incrementRetry();
      })
    );
    this.subscription.push(
      this.notifySvc.onHeartBeat.subscribe((data: any) => {
      })
    );
    this.subscription.push(
      this.notifySvc.onMessage.subscribe((data: any) => {
        if (data.data.type === 'auth' && data.data.status === 'ok') {
          this.retryCount = 0;
          this.backoffTimer.reset();
        } else {
          this.handleNewMessage(data.data);
        }
      })
    );
  }

  public keyGenerator(prefix: string, value: string): string {
    return `${prefix}_${value}`;
  }


  public incrementRetry(): void {
    const delay = this.backoffTimer.next();
    setTimeout(() => {
      this.notifySvc.connect();
    }, delay);
    this.retryCount += 1;
    if (this.retryCount >= 7) {
      console.error('Notification socket still closed after 7 retries');
    }
  }

  handleNewMessage(message: any): void {
    const MessagesState = this.keyGenerator(this.userId, 'is_sound_on');
    const PagerState = this.keyGenerator(this.userId, 'pref_mute_pager');
    const savedMessagesState = localStorage.getItem(MessagesState);
    const savedPagerState = localStorage.getItem(PagerState);
    const isThreadMuted = message.is_muted;
    // Proceed only if the thread is not muted
    if (message.sender_id && message.sender_id !== this.userId) {
      switch (true) {
        case message.urgent:
          if (savedMessagesState === 'true' && !isThreadMuted) {
            this.notifySvc.playUrgentNotification();
            this.notifySvc.startTitleNotification();
          }
          break;
        case message.sender_name?.includes('AMS Connect  '):
          if (savedPagerState === 'true' && !isThreadMuted) {
            this.notifySvc.playPagerNotification();
          }
          break;
        case !message.urgent:
          if (savedMessagesState === 'true' && !isThreadMuted) {
            this.notifySvc.playSimpleNotification();
            this.notifySvc.startTitleNotification();
          }
          break;
      }
    }
  }

  @HostListener('window:click')
  @HostListener('window:keydown')
  public onUserActivity(): void {
    this.clientDataSetManagerSvc.startInactivityTimer(); // Reset the timer on user activity
  }

  public getLoadLatest(): void {
    this.subscription.push(
      combineLatest([
        this.commonService.journalId$,
        this.commonService.archiveValue$,
        this.userService.userId$,
        this.inboxHelperSvc.unreadCounters$,
        this.inboxHelperSvc.user$,
        this.userService.imageId$,
      ]).subscribe(
        ([
          journalId,
          archiveValue,
          userId,
          unreadCount,
          currentUser,
          imageId,
        ]) => {
          this.journalId = journalId;
          this.archiveChats = archiveValue;
          this.userId = userId;
          this.showServices = currentUser?.status?.r ?? [];
          this.userAvailabilityStatus = currentUser?.status.s;
          // Check if imageId has changed
          if (this.imageId !== imageId) {
            this.imageId = imageId;
            this.getUserImage();
          }
          this.showCounts = unreadCount;
        }
      )
    );
    const subs = this.errorMessageService.SucsessErrorResponse$.subscribe(
      (state) => {
        this.successError = state;
        if (this.successError) {
          this.showErrorModal = true;
        }
        if (
          this.successError.includes('User cannot access shifts for user id')
        ) {
          this.showErrorModal = false;
        }
      }
    );
    this.subscription.push(subs);
  }
  // call auth api on messenger application load
  public async fetchUserAuth(): Promise<void> {
    /* Scenarios to cover 
            1: First time user login -- its should redirect to 0'th index and append an entry to localstorage
            2: Second if the user additional user check who is logging in and if user ID is 
            present then navigate to it else add id
            3: check if user  has changed or switch to second alternate User Id 
            4: if cookie is expired and has been removed ,remove account and its associations
            5: 
        */

    this.accountAssociationSvc.setStoredUrlAssociations();
    if (this.isUserMultiAuth()) {
      /* 
            Scenarios to cover 
            1: check if the user logged is 0th index or other
            2: based on user logged in navigate to correct route if needed or correct the ID set
            3: Based on route navigation handle get Auth call to give information on for that user 
            4: Manage to show both user details in Add account Page / show switch list  
            5: if one of the user get logged out due to cookie, remove his associations from the list
            6: redirect only the user who logged out. (Try)
            7: when the page is reloaded 

        */
      await this.accountAssociationSvc.loadAccountInfoFromServer();
      // loading all account information
      // to get index first priority would be to check if the route already has index params else get the user detail based on s-* cookie

      // checking for parameter in route
      if (this.currentRoute) {
        this.route.firstChild?.params.subscribe((params) => {
          const userIdString = params['id'];
          this.userIndex = userIdString ? userIdString : null;
          if (this.userIndex)
            this.userService.setUserIndex(this.userIndex.toString());
          this.url = `https://messenger${environment.existing_url}amsconnectapp.com/u/${this.userIndex}/inbox`;
          if (userIdString) {
            const fetchedUserId =
              this.accountAssociationSvc.getAssociatedUserId(userIdString);
            fetchedUserId ? (this.userId = fetchedUserId) : '';
            fetchedUserId ? this.getUserData(fetchedUserId) : '';
          }
        });
      } else {
        // checking for s* cookie and passing the index to route
        //  this logic would only work for add & switch accounts
        const currentUserType = this.cookieSvc.getCookie(
          `s${environment.domain_key ? `-${environment.domain_key}` : ''}`
        );
        let currentUserInfo: Partial<AuthUser>;
        if (currentUserType) {
          const parsedCurrentUserType = JSON.parse(currentUserType);
          switch (true) {
            case parsedCurrentUserType.s:
              currentUserInfo = this.accountAssociationSvc.getUserInformation(
                JSON.parse(currentUserType).i,
                STYPE['i']
              );
              break;
            case !parsedCurrentUserType.s:
              currentUserInfo = this.accountAssociationSvc.getUserInformation(
                JSON.parse(currentUserType).e,
                STYPE['e']
              );
              break;
            default:
              currentUserInfo = {};
          }
          let userUrlValue: number | null;
          currentUserInfo && currentUserInfo?._id
            ? (userUrlValue = this.accountAssociationSvc.getUrlAssociations(
                currentUserInfo?._id.$oid
              ))
            : (userUrlValue = null);
          if (userUrlValue) {
            this.userIndex = userUrlValue;
            this.userService.setUserIndex(userUrlValue.toString());
            this.url = `https://messenger${environment.existing_url}amsconnectapp.com/u/${userUrlValue}/inbox`;
            this.router.navigateByUrl(`/u/${userUrlValue}`);

            this.getUserData(
              this.accountAssociationSvc.parseAuthCookie()[userUrlValue]
            );
          }
        }
      }
    } else {
      this.userIndex = 0;
      this.userService.setUserIndex('0');
      this.url = `https://messenger${environment.existing_url}amsconnectapp.com/u/${this.userIndex}/inbox`;
      this.getUserData(this.accountAssociationSvc.parseAuthCookie()[0]);
      this.router.navigateByUrl('u/0/inbox');
      // Store current URL in localStorage when the route changes
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          localStorage.setItem('lastVisitedUrl', event.url);
        }
      });

      // Check if there's a stored URL in localStorage and redirect to it
      const lastVisitedUrl = localStorage.getItem('lastVisitedUrl');
      if (lastVisitedUrl) {
        this.router.navigateByUrl(lastVisitedUrl);
      }
    }
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentRoute = this.router.url.match(/\/u\/(\d+)\/[a-zA-Z0-9]+/)
          ? this.router.url
          : '';
      });
  }

  public getUserData(userId: string): void {
    this.authService
      .usersAuth(userId)
      .subscribe((response: UsersAuthResponse) => {
        if (response.error !== 'auth') {
          this.authResponse = response;
          this.authService.initializeDefaultCheckboxStates(userId);
          if (this.popupStateService.shouldShowPopup()) {
            this.showOffDutyModal = response?.user?.status?.s === 'off';
            this.selectedThreadHelperService.setFlagToShowOffDutyModal(
              response.user?.status?.s === 'off'
            );
          }
          this.agreement.agreementId =
            response?.config?.do_agreement?.iid || '';
          this.agreement.agreementDocument =
            response?.config?.do_agreement?.document || '';
          this.agreement.agreementVersion =
            response?.config?.do_agreement?.version || '';
          this.tosUrl =
            this.agreement.agreementId &&
            this.agreement.agreementDocument &&
            this.agreement.agreementVersion
              ? this.sanitizeURL(
                  `${environment.baseUrl}/legal/agreement/${this.agreement.agreementId}/${this.agreement.agreementDocument}/${this.agreement.agreementVersion}`
                )
              : '';
          // Check if properties exist and set inbox_sort to "1" if not defined
          if (!response.user.properties) {
            response.user.properties = {
              inbox_sort: '1', // default to showing unread first
              seen_coach_mark_hint_archive_all: '',
              seen_coach_mark_mypatients_add: '',
            };
          }
          if (response.user.properties.inbox_sort === undefined) {
            response.user.properties.inbox_sort = '1'; // Default to showing unread first
          }
          this.authService.setAuthUsersReponse(response);
          this.userService.setUserType(
            this.userService.getUserType(response?.user)
          );
          this.userService.setUserId(response.user._id.$oid);
          this.userService.setImageId(response.user.image_id);
          this.userService.setImageUrlPath(
            response.config.config_profileimage_url
              ? response.config.config_profileimage_url
              : ''
          );
          this.imageUrl = response.config.config_profileimage_url
            ? response.config.config_profileimage_url
            : '';
          this.usersAuth();
          // webtimeout initialization
          this.userSessionSvc.initialize(
            response.user._id.$oid,
            response.config.timeout_seconds
          );
        } else {
          this.accountAssociationSvc.removeUrlAssociation(userId);
          this.redirectToLogin();
        }
      });
  }

  public getUserImage(): string {
    const imageUrlPath = this.imageUrl + this.imageId + '_profile.png';
    return imageUrlPath;
  }

  public isUserMultiAuth(): boolean {
    return this.accountAssociationSvc.isUserMultiAuthed();
  }

  public sanitizeURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public usersAuth(): void {
    this.showPatientTab =
      this.authResponse?.config?.client_permissions?.patient_centric_messaging;
    this.showServices = this.authResponse?.user?.status?.r;
    this.isTempPassword = this.authResponse?.user?.is_temp_password;
    this.is_password_change_reason =
      this.authResponse?.user?.password_change_reason;
    // Retrieve user permissions from auth response or set as an empty object if undefined,then set it in user service
    const userPermissions = this.authResponse?.config?.client_permissions || {};
    // Update & set the user permissions subject in the user service
    this.userService.setUserPermissions(userPermissions);
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
    this.clientDataSetManagerSvc.clearInactivityTimer();
  }
}
