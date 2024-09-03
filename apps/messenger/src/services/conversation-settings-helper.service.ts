import {
  ComposeMessageService,
  ProfileReference,
  Profiles,
  ProfileSearch3Results,
  Reference,
  SearchProfileRecipientData,
} from "@amsconnect/shared";
import { Injectable } from "@angular/core";
import { ConversationSettingsService } from "./conversation-settings.service";

@Injectable({
  providedIn: "root",
})
export class ConversationSettingsHelperService {
  public recipientData: SearchProfileRecipientData = {
    usersProfileList: [],
    selectedUsers: [],
  };
  constructor(
    private conversationSettingsService: ConversationSettingsService,
    private composeService: ComposeMessageService
  ) {}


  public getSearchUsersList(
    searchText: Profiles[] | Reference[],
    searchValue: string
  ): Promise<ProfileReference[]> {
    return new Promise<ProfileReference[]>((resolve, reject) => {
      const selectedUserIds = this.recipientData.selectedUsers.map(
        (user) => user.id
      );
      // Define a function to filter the data
      const filterData = (data: ProfileReference[]) => {
        return data.filter(
          (user) =>
            !selectedUserIds.includes(user.id) &&
            !searchText?.some(
              (profileData) => profileData.id === user.data._id.$oid
            )
        );
      };
      // Decide which service function to call based on searchText
      const serviceFunction =
        searchValue?.trim() === "" ||
        searchValue === null ||
        searchValue === undefined
          ? this.conversationSettingsService.profileSearch()
          : this.composeService.searchUsers(searchValue, "cureatr");

      // Subscribe to the service function and filter the data
      serviceFunction.subscribe(
        (data: ProfileSearch3Results) => {
          // Filter out selected users from the usersDataList
          const filteredData = filterData(data?.references || []);

          this.recipientData.usersProfileList = filteredData;
          // Resolve the Promise with the filtered data
          resolve(this.recipientData.usersProfileList);
        },
        (error) => {
          // Reject the Promise if there's an error
          reject(error);
        }
      );
    });
  }
}
