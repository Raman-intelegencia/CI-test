import { CommonModule } from "@angular/common";
import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { ViewType } from "apps/admin/src/models/create-user.model";
import { ActivatedRoute, Router } from "@angular/router";
import { RolesData, CombinedData, StatusItem, CustomTitles, getUserInService, addUserInServiceData, addUserResponce, addUserFormEmiiter, SanitizeHtmlPipe } from "@amsconnect/shared";
import { AddUserServicesComponent } from "../../helper/add-user-services/add-user-services.component";
import { InstitutionsService } from "apps/admin/src/services/institutions.service";
import { ReassignModalComponent } from "../../helper/reassign-modal/reassign-modal.component";
import { ReportingTagsBaseComponent } from "./reporting-tags.class";

@Component({
  selector: "web-messenger-reporting-tags",
  templateUrl: "./reporting-tags.component.html",
  styleUrls: ["./reporting-tags.component.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, AddUserServicesComponent, ReassignModalComponent, SanitizeHtmlPipe]
})

export class ReportingTagsComponent extends ReportingTagsBaseComponent implements OnChanges {
  public reportingTagForm: FormGroup;
  public addbuttonToInput = false;
  @Input() isReportingTag = false;
  @Input() updateInstitutionPermission = true;
  @Input() resetTags = false;
  @Output() tagsDataEvent = new EventEmitter<string[]>();
  @Output() isReportingTags = new EventEmitter<boolean>();
  @Output() saveRolesEvent = new EventEmitter<CombinedData>();
  @Output() saveTitlesEvent = new EventEmitter<CustomTitles>();

  public addUserInServiceData!: getUserInService;
  @Input() showQuickMessageTitle = false;
  @Input() modaltitle = "";
  @Input() showTitle = false;
  @Input() title = "";
  @Input() serviceTags!: string[];
  @Input() isaddUser = false;
  @Input() Iroles!: RolesData;
  @Input() isQuickMessage=false;
  @Input() activeRoles!: string[];
  @Input() user !: string[];
  public viewType = ViewType;
  public tagsValue!: string;
  @ViewChild("editMessageInput") set editMessageInputRef(editMessageInput: ElementRef) {
    if (!!editMessageInput) {
      editMessageInput.nativeElement.focus();
    }
  }
  @ViewChild("addMessageInput") set addMessageInputRef(addMessageInput: ElementRef) {
    if (!!addMessageInput) {
      addMessageInput.nativeElement.focus();
    }
  }
  constructor(private formBuilder: FormBuilder, private InstitutionService: InstitutionsService, private route: ActivatedRoute, private router: Router) {
    super();
    this.reportingTagForm = this.formBuilder.group({
      tag: [""],
    });
    this.route.params.subscribe(params => {
      this.institutionId = params['institutionID'];
    });
  }

  ngOnChanges() {
    if (this.serviceTags) {
      this.tags = JSON.parse(JSON.stringify(this.serviceTags));
      this.initialServiceRoles = JSON.parse(JSON.stringify(this.serviceTags));
      this.newTagInput = this.tags?.join('\n');
      this.previousTagInput = this.newTagInput;
      if (this.Iroles) {
        this.iRolesParseData = JSON.parse(JSON.stringify(this.Iroles));
      }
    }
    if (this.resetTags) {
      this.resetForm();
    }
  }

  public closePopup(): void {
    this.isReportingTag = !this.isReportingTag;
    this.isReportingTags.emit(this.isReportingTag);
  }

  public get tag(): AbstractControl {
    return this.reportingTagForm.controls["tag"];
  }
  public active_status_reporting_tag = 'info';
  public reporting_active_status = this.viewType.List;

  public changeTabReportingTag(tabname: string): void {
    this.active_status_reporting_tag = tabname;
  }

  public changeAddbuttonToInput(): void {
    this.reportingTagForm.controls["tag"].reset();
    this.addbuttonToInput = true;
  }

  public savetags(): void {
    const newString = this.reportingTagForm.controls["tag"].value;
    if (newString) {
      this.tags?.push(newString);
      this.reportingTagForm.reset();
      this.addbuttonToInput = false;
      this.newTagInput = this.tags?.join('\n');

    }
  }

  public deleteReportingTag(tag: string): void {
    const filteredStrings = this.tags.filter(item => item === tag);
    this.deletedTag = filteredStrings.toString();
    this.deletedTagArray.push(this.deletedTag);
    this.tags = this.tags.filter(item => item !== tag);
    this.newTagInput = this.tags.join('\n');
  }

  public isEditingTag(index: number): boolean {
    return this.selectedIndex === index;
  }

  public editValueAtIndex(index: number): void {
    if (this.Iroles) {
      this.iRolesParseData = JSON?.parse(JSON.stringify(this.Iroles))
    }
    this.selectedIndex = index;
    this.editedValue = this.tags[index];
    this.valuesBeforeEdit = this.iRolesParseData?.roles[index]
    this.isEditing = true;
  }

  public saveEditedValue(): void {
    // Update the value at the specified index
    if (this.selectedIndex !== -1 && this.editedValue.trim() !== '') {
      this.tags[this.selectedIndex] = this.editedValue.trim();
      const before = this.valuesBeforeEdit;
      const after = this.editedValue.trim();
      this.pushChangesInRolesPager(before, after)
      this.newTagInput = this.tags.join('\n');
      this.tagsDataEvent.emit(this.tags);
    }
    this.selectedIndex = -1;
    this.editedValue = '';
    this.isEditing = false;
  }

  public pushChangesInRolesPager(key: string, value: string) {
    //push obj to renamedServicesName obj
    const existingObject = this.renamedServicesName.find(obj => obj.hasOwnProperty(key));
    if (existingObject) {
      existingObject[key] = value;
    } else {
      const obj: { [key: string]: string } = {};
      obj[key] = value;
      this.renamedServicesName.push(obj);
    }
  }

  public saveReportingTags(): void {
    this.isReportingTag = false;
    this.isReportingTags.emit(this.isReportingTag);
    this.tags = this.newTagInput.split('\n').map(tag => tag.trim());
    this.tags = this.tags.filter(item => item != "")
    this.tagsDataEvent.emit(this.tags);
  }

  public findNewRolesAdded(initialServiceRoles: string[], finalServiceRoles: string[], renamedRoles: { [key: string]: string }[]): string[] {
    const addedRoles: string[] = [];
    finalServiceRoles.forEach((role, index) => {
      if (
        !initialServiceRoles.includes(role) &&
        finalServiceRoles.indexOf(role) === index &&
        !Object.values(renamedRoles).some(value => value[role] === role)
      ) {
        addedRoles.push(role);
      }
    });
    return addedRoles;
  }

  public saveRoles(): void {
    if (this.isModified) {
      const previousRows = this.previousTagInput.split('\n').map(row => row.trim());
      const currentRows = this.newTagInput.split('\n').map(row => row.trim());
    for (let i = 0; i < previousRows.length; i++) {
      if (currentRows[i] !== undefined && previousRows[i] !== currentRows[i]) {
          let [prefix, suffix] = previousRows[i].split('|').map(part => part.trim());
          this.renamedServicesName.push({ [prefix]: currentRows[i] });
      }
  }    
      if (currentRows.length < previousRows.length) {
          this.deletedRows = previousRows.filter(row => !currentRows.includes(row));
          for (let deletedRow of this.deletedRows) {
              if (deletedRow !== null && !this.deletedTagArray.includes(deletedRow)) {
                  this.deletedTagArray.push(deletedRow);
              }
          }
      }
  }
    this.tags = this.newTagInput.split('\n').map(tag => tag.trim());
    this.tags = this.tags.filter(item => item !== "");
    const newRolesAdded = this.findNewRolesAdded(this.initialServiceRoles, this.tags, this.renamedServicesName);
    if (this.Iroles || this.isQuickMessage) {
      const combinedData: CombinedData = {
        tags: this.tags,
        newAddedRoles: newRolesAdded,
        deletedTag: this.deletedTagArray,
        renamedService: this.renamedServicesName,
      };
      this.saveRolesEvent.emit(combinedData);
    }
    else {
      const titleToVariableMap: Record<string, string> = {
        specialties: "Edit specialties",
        titles: "Edit titles",
        tags: "Edit Reporting tags",
      };

      let typeOfCustomTitles = Object.keys(titleToVariableMap).find(
        (key) => titleToVariableMap[key as keyof typeof titleToVariableMap] === this.modaltitle
      );
      let finalTypeOFCustomTitles = typeOfCustomTitles || "Default value if modaltitle doesn't match any condition";
      const jsonForCustomTitles: CustomTitles = {
        [finalTypeOFCustomTitles]: this.tags
      }
      this.saveTitlesEvent.emit(jsonForCustomTitles);
    }
  }

  public addUserModal(value: number): void {
    this.addUser = true;
    this.roles = this.tags[value];
    this.selectedUser = this.getEmailsByGroup(this.tags[value]?.split("|")[0]?.trim() || this.tags[value]);
    this.addbuttonToInput = (this.modaltitle === "Edit Reserved Service Team") ? false : true;
    this.addUserModalTitle = this.modaltitle;
    const tags= this.tags[value];
    this.tags[value] = this.tags[value]?.split("|")[0]?.trim() || this.tags[value];
    this.tagsValue = this.tags[value];
    this.addUserInServiceData = {
      results: [],
      results_limited: false,
      selected_users: [],
      status: '' 
    };
    // this.InstitutionService.searchUsersInServiceTeam(this.institutionId, this.tags[value]).subscribe((data: getUserInService) => {
    //   if(data.status == 'ok'){
    //     this.addUserInServiceData = data
    //     this.tags[value]=tags
    //   }
    // })

    this.showAddUserInServiceTeam = true;
  }

  public getEmailsByGroup(groupName: string): string {
    const groupData = this.user.find(item => Object.keys(item)[0] === groupName);
    return groupData ? groupData : "";
  }

  public saveAddUser(addUserFormData: addUserFormEmiiter): void {
    const { users, role_type, iid, roles, start, end,user_remove } = addUserFormData;
    const payload = { users, role_type, iid, roles, start, end,user_remove };
    this.InstitutionService.addUserInServiceTeam(payload).subscribe()
  }

  public changeShowModalvalue(changeShowAddUserValue: boolean): void {
    this.showAddUserInServiceTeam = changeShowAddUserValue;
    this.addbuttonToInput=false;
    this.addUser = false;
    this.isaddUser = true;
    this.tags = JSON.parse(JSON.stringify(this.serviceTags));
  }

  public closeaddbuttonInput(): void {
    this.addbuttonToInput = false;
    this.reportingTagForm.reset();
  }

  public detectDeletedRows(): void {
    this.isModified = true;
}

  public getDataAndCloseodalWindow(event: boolean): void {
    if (event) {
      this.saveReportingTags();
    }
  }
}