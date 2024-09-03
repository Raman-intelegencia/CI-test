import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserSearchComponent } from './user-search-model.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { Reference } from '../../models/profile.model';
import { ProfileStatusDropdownService } from '../../services/profile-status-dropdown.service';
 

describe('UserSearchComponent', () => {
  let component: UserSearchComponent;
  let fixture: ComponentFixture<UserSearchComponent>;
  let httpTestingController: HttpTestingController;
  let profileStatusDropdown: ProfileStatusDropdownService;
  const errorMessage = 'An error occurred'; 

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[UserSearchComponent, HttpClientModule,TranslateModule.forRoot(),HttpClientTestingModule,]
      
    }).compileComponents();

    fixture = TestBed.createComponent(UserSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpTestingController = TestBed.inject(HttpTestingController);
    profileStatusDropdown = TestBed.inject(ProfileStatusDropdownService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
 
  it('get search user list', () => {
    profileStatusDropdown.searchUsers(component.currentCoverage.nativeElement.value).subscribe(data => {
      component.searchResults = data.references;
      const selectedUserIds = component.selectedUsers.map((user: Reference) => user.id);
      component.showUserList = true;
      component.searchResults = component.searchResults.filter(
        (user: Reference) => !selectedUserIds.includes(user.id)
      );
      component.noResultsFound =
        component.searchResults.length === 0 &&
        component.currentCoverage.nativeElement.value.trim() === "";
    },
      error => {
        expect(error).toEqual(errorMessage);
      });
  })
  
  
  it('remove selected user', () => {
   let user !: Reference ;
    component.selectedUsers = component.selectedUsers.filter((u) => u !== user);
    component.searchUsersData.usersDataList.push(user);
    component.inputEditable = true;
    component.coverageId = '';
  });

});
