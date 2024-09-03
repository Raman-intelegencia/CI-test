import {
  AuthService,
  CookieService,
  SettingsService,
  UserService, ThreadHelperService
} from "@amsconnect/shared";
import {
  Component,
  DestroyRef,
  ElementRef, 
  OnInit, 
  ViewChild,
} from "@angular/core"; 
import { Subscription, combineLatest } from "rxjs";
import { AbstractControl, FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: "web-messenger-inbox-management",
  templateUrl: "./inbox-management.component.html",
  styleUrls: ["./inbox-management.component.scss"],
})
export class InboxManagementComponent implements OnInit {
  // Subscription list to hold all subscriptions to be cleaned up
  public subscription: Subscription[] = [];
  // Stores the current user's ID
  private userId = '';
  // FormGroup to manage form state for the inbox management options
  public inboxManagementForm!: FormGroup;

  constructor(
    private settingsService: SettingsService,
    private cookieService: CookieService,
    private userService: UserService,
    private authService: AuthService,
    private destroyRef: DestroyRef
  ) {
    // Ensuring that all subscriptions are cleaned up when the instance is destroyed
    this.destroyRef.onDestroy(() => this.subscription.forEach((sub) => sub.unsubscribe()))
  }

  ngOnInit(): void {
    // Initialize the form controls with default values
    this.inboxManagementForm = new FormGroup({
      isSortInbox: new FormControl(false),
      isShowTimestamp: new FormControl(false),
      isPressEnter: new FormControl(false)
    });
    // Combine latest values of userId and authentication response to fetch initial checkbox states
    const userChecks$ = combineLatest([
      this.userService.userId$,
      this.authService.authResponseData$
    ]);
    this.subscription.push(userChecks$.subscribe(([userId, authResponseData]) => {
      this.userId = userId;
      // Initialize checkbox states based on user settings fetched from backend
      this.getCheckedValues(authResponseData.user?.properties?.inbox_sort);
    }));
  }

  // Helper method to easily access form controls in the template
  public get f(): { [key: string]: AbstractControl } {
    return this.inboxManagementForm.controls;
  }

  // Generate a storage key with a prefix and value
  public keyGenerator(prefix: string, value: string): string {
    return `${prefix}_${value}`;
  }

  // Set checkbox states based on the retrieved values from localStorage or initial load
  public getCheckedValues(sortByInboxUnreadValue: string | undefined): void {
    // Check and update the sort inbox checkbox state
    if (sortByInboxUnreadValue !== undefined) {
      this.inboxManagementForm.get('isSortInbox')?.patchValue(sortByInboxUnreadValue === "1" ? true : false)
    }
    // Retrieve and update state for quick send and show timestamp from localStorage
    if (this.userId) {
      const quickSend = localStorage.getItem(`${this.userId}_quick_send`);
      const timeStamp = localStorage.getItem(`${this.userId}_show_thread_timestamp`);
      if (quickSend) {
        this.inboxManagementForm.get('isPressEnter')?.patchValue(JSON.parse(quickSend));
      }
      if (timeStamp) {
        this.inboxManagementForm.get('isShowTimestamp')?.patchValue(JSON.parse(timeStamp));
      }
    }
  }

  // Save the current form state to backend and local storage
  public saveMessagesAndEvents(): void {
    // Extract values directly from the form control
    const inboxSortValue = this.inboxManagementForm.get('isSortInbox')?.value ? 1 : 0;
    const showTimestamp = this.inboxManagementForm.get('isShowTimestamp')?.value;
    const pressEnter = this.inboxManagementForm.get('isPressEnter')?.value;

    // Prepare form data for submission
    const formData = new FormData();
    formData.append("key", "inbox_sort");
    formData.append("value", JSON.stringify(inboxSortValue));

    // Append cookie data if available
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) {
      formData.append("a", aCookieValue);
    }

    // Make API call to update user settings
    this.subscription.push(this.settingsService.setUserProperty(formData).subscribe(data => {
      if (data.status === 'ok') {
        // Save updated state to localStorage
        localStorage.setItem(this.keyGenerator(this.userId, "show_thread_timestamp"), JSON.stringify(showTimestamp));
        localStorage.setItem(this.keyGenerator(this.userId, "quick_send"), JSON.stringify(pressEnter));
        // Update user properties
        this.authService.updateInboxSort(inboxSortValue.toString());
      }
    }));
    // Mark form as pristine after successful save
    this.inboxManagementForm.markAsPristine();
  }
}
