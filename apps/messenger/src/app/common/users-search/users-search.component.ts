import { AfterViewInit, Component, DestroyRef, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComposeMessageService, ProfileSearchResult, Reference, UserService, UserType } from '@amsconnect/shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs';
import { ModalComponent } from "@amsconnect/shared";
enum  role_type_Enum {
  integrated = 'integrated',
}
@Component({
    selector: 'web-messenger-users-search',
    standalone: true,
    templateUrl: './users-search.component.html',
    styleUrls: ['./users-search.component.scss'],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, ModalComponent]
})
export class UsersSearchComponent implements OnChanges, OnInit, AfterViewInit {
  @Input() selectedUsersData:Reference[] = [];
  @Input() eventType = "";
  @Input() composeArrayIndex = 0;
  @Output() allUsersDataListUpdated = new EventEmitter<Reference[]>();
  @Output() openUserProfile = new EventEmitter<{event: Event, userId:string}>();
  @Output() openServiceProfile = new EventEmitter<{event: Event, service:Reference}>();
  @Output() openGroupProfile = new EventEmitter<{event: Event, group:Reference}>();
  @Output() selectedUsersList = new EventEmitter<Reference[]>();
  @Output() updateToSearchDataValue = new EventEmitter<string>();
  @Output() selectUsers = new EventEmitter<Reference>();
  @Output() removeUsers = new EventEmitter<Reference>();
  @ViewChild("toSearchInput") toSearchInput!: ElementRef;
  public usersDataList: Reference[] = [];
  public allUsersDataList: Reference[] = [];
  public userType = UserType;
  public selectedUsers: Reference[] =[];
  public isInputFocused = false;
  private subscription!: Subscription;
  public imageUrlPath = "";
  public userSearchApiCall = false;
  private searchTrigger = new Subject<{ searchText: string, searchType: string | undefined }>();
  private fullUserList: Reference[] = [];
  public storeUsersName = '';
  public role_type = role_type_Enum; 
  public userNotActivatedDescription = '';
  public isInitialLoad = true;
  constructor(
    private composeService: ComposeMessageService,
    private userService: UserService,
    private destroyRef: DestroyRef,
    ) {
      this.searchTrigger.pipe(
        debounceTime(500), // Adjust this time as needed
        distinctUntilChanged(),
        switchMap(({ searchText, searchType }) => {
          searchType = searchType || (searchText ? "cureatr" : "recent");
          return this.composeService.searchUsers(searchText, searchType).pipe(
            map((data:ProfileSearchResult) => ({ data, searchText }))
          );
        })
        ).subscribe(({ data, searchText }) => {
          if(!data.results.length){
            this.storeUsersName = searchText;
          }
          if (data.status !== 'error') {
            this.handleSearchResults(data, this.isInitialLoad);
            if (searchText === '') {
              this.isInitialLoad = false; // After the first load, change the flag
            }
          }
        });
      // on destroy unsubscribe the observable
      this.destroyRef.onDestroy(() => {
        this.subscription.unsubscribe();
      })
    }

  ngAfterViewInit():void {
    setTimeout(() => {
      this.toSearchInput.nativeElement.focus();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedUsersData'] && changes['selectedUsersData'].currentValue) {
      this.selectedUsers = changes['selectedUsersData'].currentValue;
    }
  }

  ngOnInit(): void {
      this.subscription = this.userService.imageUrlPath$.subscribe(path => this.imageUrlPath = path);
  }
      /**
    * Handles search results for users, updating the full user list and filtering based on selection.
    * 
    * @param data The search result data, including a list of user references.
    * @param initialLoad A boolean indicating whether the current operation is the initial loading of data.
    */
    private handleSearchResults(data: ProfileSearchResult, initialLoad: boolean): void {
      // If the search result contains data, reset the stored user name.
      if (data.results.length) {
        this.storeUsersName = '';
      }

      if (initialLoad) {
        // If this is the initial load, directly assign the received references to the allUsersDataList.
        // This replaces the existing list with the new one, assuming that the initial load brings the full list of users.
        this.allUsersDataList = data.references;
      } else {
        // For non-initial loads (subsequent searches), iterate through the search results and add new items.
        // This ensures that allUsersDataList accumulates all unique items over time, without duplicating any.
        data.references.forEach((item) => {
          // Check if the current item from the search results is already present in the allUsersDataList based on the ID.
          // If not present, add it to the list. This keeps the list comprehensive and up-to-date with unique entries.
          if (!this.allUsersDataList.some((existingItem) => existingItem.id === item.id)) {
            this.allUsersDataList.push(item);
          }
        });
      }
      // Emit the updated allUsersDataList to any subscribers, allowing other components to react to the updated list.
      this.allUsersDataListUpdated.emit(this.allUsersDataList);
      // Format the current set of references (users) for display or further processing.
      this.usersDataList = this.getFormattedList(data.references);
      // Obtain the IDs of currently selected users to filter them out from the displayed list.
      const selectedUserIds = this.selectedUsers.map((user: Reference) => user.id);
      // Filter the usersDataList to exclude any users that are currently selected.
      // This prevents selected users from appearing again in the list of searchable users.
      this.usersDataList = this.usersDataList.filter((user: Reference) => !selectedUserIds.includes(user.id));
    }


  public getFormattedList(allUserServiceGroupList: Reference[]): Reference[] {
    return allUserServiceGroupList.map(list => {
      const matchedProfiles: Reference[] = [];
      // Handle the service type
      if (list.type === this.userType.Role) {
          list.data.user_ids?.forEach((id: { $oid: string }) => {
              const matchedProfile = allUserServiceGroupList.find((userId) => userId.id === id.$oid);
              if (matchedProfile) {
                  matchedProfiles.push(matchedProfile);
              }
          });
          list['matchedProfiles'] = matchedProfiles;
      } 
      // Handle the group type
      else if (list.type === this.userType.Group) {
          list.data.recipient_ids?.forEach((id: { $oid: string }) => {
              const matchedProfile = allUserServiceGroupList.find((userId) => userId.id === id.$oid);
              if (matchedProfile) {
                  matchedProfiles.push(matchedProfile);
              }
          });
          list['matchedProfiles'] = matchedProfiles;
      }

      //  Handle coverage profiles & Use the full list for matching coverage profiles
      if (list.data.status?.c) {
        const coverageProfile = this.allUsersDataList.find((user) => user.id === list?.data?.status?.c?.ref);
        if (coverageProfile) {
          list['coverageProfile'] = coverageProfile;
        }
      }
      return list;
    });
  }


public openProfilePopUp(event: Event, userId:string,user: Reference):void{
  if(user?.data?.type !== 'oneway'){
    this.openUserProfile.emit({event, userId});
  }
}

public openServiceProfilePopUp(event: Event, service:Reference):void{
  // Check if the service has matchedProfiles data; if not, repopulate it
  if (!service.matchedProfiles || service.matchedProfiles.length === 0) {
    const allUserServiceGroupList = this.allUsersDataList; // Use the full list for matching
    const matchedProfiles: Reference[] = [];
    if (service.type === this.userType.Role) {
      service.data.user_ids?.forEach((id: { $oid: string }) => {
        const matchedProfile = allUserServiceGroupList.find((userId) => userId.id === id.$oid);
        if (matchedProfile) {
          matchedProfiles.push(matchedProfile);
        }
      });
    }

    // Update the service object with the newly populated matchedProfiles
    service.matchedProfiles = matchedProfiles;
  }
  this.openServiceProfile.emit({event, service});
}

public openGroupProfilePopUp(event: Event, group:Reference):void{
  this.openGroupProfile.emit({event, group});
}

public getSearchedUsersList(searchType?: string): void {
  const searchText = this.toSearchInput.nativeElement.value;
  this.searchTrigger.next({ searchText, searchType });
}

public selectUser(user: Reference): void {
  this.selectedUsers.push(user);
  if(!user.matchedProfiles){
    this.userNotActivatedDescription = !user?.data?.flag_active  ? user?.data?.first_name + " " + user?.data?.last_name + " is not active" : '';
  }
  this.usersDataList = this.usersDataList.filter((u: Reference) => u !== user);
  this.toSearchInput.nativeElement.value = "";
  this.toSearchInput.nativeElement.focus();
  this.getSearchedUsersList("recent");
  this.selectUsers.emit(user);
}

public removeUser(user: Reference): void {
  // Remove the user from the selected users list
  this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
  // Refocus the input for user convenience
  this.toSearchInput.nativeElement.focus();
  this.getSearchedUsersList("recent");
  // Emit the removed user
  this.removeUsers.emit(user);
}

public handleBackspace(event: KeyboardEvent, inputValue: string): void {
  if (event.key === "Backspace" && inputValue === "") {
    this.selectedUsers.pop();
    this.getSearchedUsersList("recent");
  }
}

public updateDataValue(key:string, searchValue:string):void{
  this.updateToSearchDataValue.emit(searchValue);
}

public formatNames(profiles: Reference[] | undefined, type: string): string {
  const names = profiles?.map(user => this.getUserNames(user.data.first_name, user.data.last_name, type));
  const combinedNames = names ? names?.join(', '): "";

  // If combined string length is greater than a limit, then truncate and add ellipsis
  const maxLength = 45;
  return combinedNames.length > maxLength ? combinedNames.slice(0, maxLength - 3) + '...' : combinedNames;
}

public getUserNames(firstName: string, lastName: string, type: string): string {
  if (type === 'service') {
    return `${firstName} ${lastName.charAt(0)}`;
  } else if (type === 'group') {
    return `${firstName} ${lastName}`;
  }
  return '';
}

public getImageUrl(image_id: string): string {
  return this.imageUrlPath + image_id + "_profile.png";
}

public checkEventType():void{
  if(this.eventType === 'compose'){
    this.updateDataValue('to',this.toSearchInput.nativeElement.value)
  }
}
public closeNonActiveUserModal():void {
  this.userNotActivatedDescription = '';
}
}