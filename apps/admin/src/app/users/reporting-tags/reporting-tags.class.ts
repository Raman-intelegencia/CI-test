import { RolesData, getUserInService } from "@amsconnect/shared";

 
  
export class ReportingTagsBaseComponent   {
  public tags: string[] = [];
  public editedValue: string = '';
  public selectedIndex: number = -1;
  public isEditing: boolean = false;
  public newTagInput = "";
  public deletedTagArray: string[] = [];
  public filteredArray!: string[];
  public deletedTag !: string;
  public valuesBeforeEdit: string = "";
  public initialServiceRoles: string[] = []
  public renamedServicesName: { [key: string]: string }[] = []
  public iRolesParseData !: RolesData
  public showAddUserInServiceTeam = false;
  public selectedService !: string;
  public institutionId!: string;
  public addUserServiceData !: getUserInService;
  public renderDateTimeInputs = false;
  public roles!: string;
  public addUser = false;
  public addUserModalTitle!: string;
  public previousCursorPosition: number = 0;
  public triggerFlag: boolean = true;
  public selectedUser!:string | null
  public isModified: boolean = false;
  public previousTagInput: string = '';
  public deletedRows: string[] = [];
  
  public resetForm(): void {
    this.tags = [];
    this.newTagInput = "";
  }

  public getRenameTags(): void {
    let RenameTags = {
      "lastValue": "newValue"
    }
  }

  public backtolist(): void {
    this.selectedIndex = -1;
  } 
 
}
