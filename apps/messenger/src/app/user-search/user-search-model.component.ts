import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Reference } from '../../models/profile.model';
import { ProfileSearchResult, addRecipientData } from '../../models/off-duty-modal.model';
import { AuthService, UsersAuthResponse, UsersListingService } from '@amsconnect/shared';
import { Subscription } from 'rxjs';
import { ProfileStatusDropdownService } from '../../services/profile-status-dropdown.service';

@Component({
  selector: 'web-messenger-user-search',
  templateUrl: './user-search-model.component.html',
  styleUrls: ['./user-search-model.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, ReactiveFormsModule,]
})
export class UserSearchComponent {
  @ViewChild("currentCoverage") currentCoverage!: ElementRef;
  public showProfileModal = false;
  public searchResults: Reference[] = [];
  public selectedUserIdDetails = ''; 
  public selectedUsers: Reference[] = []; 
  @Output() selectedUsersEvent = new EventEmitter<Reference[]>();
  public imageUrl = "";
  public searchUsersData: addRecipientData = {
    usersDataList: [],
    selectedUsers: [],
  };
  public coverageId = '';
  public inputEditable = true;
  public showUserList= true;
  public subscription: Subscription = new Subscription();
  public noResultsFound = false;
  public isInputFocused= false;
  constructor(private usersListingSvc: UsersListingService,private profileStatusDropdown: ProfileStatusDropdownService,
              public authService: AuthService){}

  ngOnInit(): void {
    this.subscription.add(this.authService.authResponseData$.subscribe(
      (data: UsersAuthResponse) => { 
        this.imageUrl =
          data?.config?.config_profileimage_url || "";
      }
    )); 
  }
  public openUserProfile(user_id: string): void {
    this.selectedUserIdDetails = user_id;
    this.showProfileModal = true;
  }

  public removeUser(user: Reference, event: Event): void {
    event.stopPropagation();
    this.selectedUsers = this.selectedUsers.filter((u) => u !== user);
    this.selectedUsersEvent.emit(this.selectedUsers);
    this.searchUsersData.usersDataList.push(user);
    this.inputEditable = true;
    this.coverageId = '';
  }

  public selectUser(user: Reference, event: Event): void {
    event.stopPropagation();
    this.selectedUsers.push(user);
    this.selectedUsersEvent.emit(this.selectedUsers);
    this.showUserList = false;
    this.inputEditable = false;
    // Filter out the selected user from searchResults
    this.searchResults = this.searchResults.filter(
      (u: Reference) => u !== user
    );
    this.currentCoverage.nativeElement.value = "";
    this.currentCoverage.nativeElement.focus();
    this.coverageId = user.data._id.$oid; 
  }

  public getImageUrl(image_id: string): string {
    return this.usersListingSvc.getImageUrl(this.imageUrl, image_id);
  }

  public getSearchedUsersList(): void {
    this.profileStatusDropdown
      .searchUsers(this.currentCoverage.nativeElement.value)
      .subscribe((data: ProfileSearchResult) => {
        this.searchResults = data.references;
        const selectedUserIds = this.selectedUsers.map((user: Reference) => user.id);
        this.showUserList = true;
        this.searchResults = this.searchResults.filter(
          (user: Reference) => !selectedUserIds.includes(user.id)
        );
        this.noResultsFound =
          this.searchResults.length === 0 &&
          this.currentCoverage.nativeElement.value.trim() === "";
      });
  }
}
