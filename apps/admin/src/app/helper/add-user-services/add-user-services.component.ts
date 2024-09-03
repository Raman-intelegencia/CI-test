import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, OnChanges, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { getUserInService,addUserFormEmiiter,addServiceUser, ModalComponent, DateUtilsService, serviceUser, ErrorHandlingService } from "@amsconnect/shared";
import { InstitutionsService } from '../../../services/institutions.service';
import { filter } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'web-messenger-add-user-services',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule,ModalComponent],
  templateUrl: './add-user-services.component.html',
  styleUrls: ['./add-user-services.component.scss'],
})
export class AddUserServicesComponent implements OnChanges {

  @Input() isServiceAddUser = false;
  @Input() addUserInServiceData!: getUserInService;
  @Input() institutionId!: string
  @Input() renderDateTimeInputs!: boolean;
  @Input() roles!: string;
  @Input() modaltitle!:string;
  @Input() user !:string | null;
  @Output() notServiceAddUser:EventEmitter<boolean>=new EventEmitter();
  @Output() saveForm: EventEmitter<addUserFormEmiiter> = new EventEmitter();
  @Input() tagsValue : string = '';
  public dynamicForm!: FormGroup;
  public serviceName = "";
  public addedUserList: addServiceUser[] = [];
  public userList: addServiceUser[] = [];
  public intiatUserList: addServiceUser[] = [];
  public isFirstExecution = true;
  public selectedemail: string[]=[];
  public addUserCount=0;
  public selectedValues: string[] = [];
  public selectedIds:string[]=[];
  public showLoader = true;
  public showContentAfterload=false;
  public isResetSearchButton=false;
  public showCheckBoxError="";
  public selectedUserEmail!:string[];
  @Output('getDataAndCloseModal')getDataAndCloseModalPopUp = new EventEmitter<boolean>();
  public minDate: string = this.getPreviousCurrentDate();
  public getStartDateandTimeValue:any;
  public searchUserListResult=true;
  public modalTitleMessage:string = "";
  public modalShowMessage:string = "";
  public showSuccessPopup:boolean = false;
  public isButtonDisabled:boolean = true;
  public filteredUsersListByEmail = false;

  constructor(private fb: FormBuilder,private InstitutionService:InstitutionsService,private dateUtilSvc: DateUtilsService,private sanitizer: DomSanitizer, public errorHandlingService:ErrorHandlingService,
    ) {
    this.dynamicForm = this.fb.group({
      fromDate: [''],
      fromTime: [''],
      toDate: [''],
      toTime: [''],
      searchTerm: [''],
      selectedUsers: new FormArray([]),
      listOfUsers: new FormArray([])
    })
  }

  ngOnChanges():void{  
    this.getStartDateandTimeValue = this.user; 
    this.serviceName=this.roles; 
    this.renderdata();
    this.setDateTimeDefaultFormValue(this.getStartDateandTimeValue.s,this.getStartDateandTimeValue.e); 
    if (this.addUserInServiceData && this.isFirstExecution) {
      this.isFirstExecution = false; 
      this.showContentAfterload=true;
    }
  }

  public get f():{[key:string]:AbstractControl} {
    return this.dynamicForm.controls;
  }

 public transform(unsafeTime: string): string | null{
    // Sanitize the unsafe time string
    const sanitizedTime = this.sanitizer.sanitize(SecurityContext.HTML, unsafeTime);
    return sanitizedTime;
  }
  
  public renderdata():void {
    this.showLoader = true;
    this.userList=[];
    this.addedUserList=[];
    this.addUserCount = 0;
    this.InstitutionService.searchUsersInServiceTeam(this.institutionId, this.tagsValue).subscribe((data: getUserInService) => {
      if(data.status === 'ok'){
        this.showLoader = false;
        this.addUserCount = data?.selected_users?.length;
        this.selectedIds = data?.selected_users?.map(user => user._id.$oid);
        this.selectedemail = data?.selected_users?.map(user => user.email);     
        data?.results.forEach(user => {
          const formattedUser = {id: user._id.$oid,name: `${user.first_name} ${user.last_name}`,uid: user.uid.id,email: user.email,institution:user.uid.iid};
          if (this.selectedIds.includes(user._id.$oid)) {
            this.sortSelectedUser();
          } else {
            this.userList.push(formattedUser);
            this.filteredUsersListByEmail = data?.results.every(user => user.email === null);
          }
          this.userList.sort((a, b) => {
            if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
            if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
            return 0;
        });
        this.intiatUserList=this.userList;
        this.showLoader = false;
            });
            data?.selected_users.forEach(user=>{
        const formatUser = {id: user._id.$oid,name: `${user.first_name} ${user.last_name}`,uid: user.uid.id,email: user.email,institution:user.uid.iid};
        this.addedUserList.push(formatUser)});    
        this.sortSelectedUser();
        this.dynamicForm.get('searchTerm')?.setValue(''); 
        this.searchUserListResult=true;
      }
    },(err)=>{
      this.showLoader = false;
      this.errorHandlingService.getDefaultErrorResponse();
    })
 
  }

  public closePopup(): void {
    this.isServiceAddUser = false;
    this.notServiceAddUser.emit(this.isServiceAddUser);
  }

  public onSelectedUserChange(eventOnSelectedUser: Event) {
    this.selectedValues = this.selectedemail;
    const targetVal = eventOnSelectedUser.target as HTMLInputElement;
    if (targetVal.checked && !this.selectedValues.includes(targetVal.value)) {
      this.selectedValues.push(targetVal.value);
    } else {
      const index = this.selectedValues.indexOf(targetVal.value);
      if (index !== -1) {
        this.selectedValues.splice(index, 1);
      }
    }
    this.isButtonDisabled = false;
    this.processPayload();
  }

  public onSelectUserChange(eventOnSelectUser:Event) {
    this.selectedValues = this.selectedemail;
    const targetVal =eventOnSelectUser.target as HTMLInputElement;
    if (targetVal.checked) {
      if(targetVal.value===""){
        this.showCheckBoxError="User without email not allowed";
        targetVal.checked = false;
      }
      else{
      this.selectedValues.push(targetVal.value);
      }
    } else {
      const index = this.selectedValues.indexOf(targetVal.value);
      if (index !== -1) {
        this.selectedValues.splice(index, 1);
      }
    }
    this.isButtonDisabled = false;
    this.processPayload();
  }

  public processPayload():void {
    this.addUserCount=this.selectedValues.length;
  }

  public backToPrevious():void{
    this.isServiceAddUser=false;
  }

  public closeErrorPopup() :void{
    this.showCheckBoxError = "";
  }

  public onSearch():void{
    this.searchUserListResult=false;
    this.isResetSearchButton=true;
    const fromData=this.dynamicForm.value;
    const valueToSearch=fromData.searchTerm;
    this.InstitutionService.searchUsersInAddUser(this.institutionId,this.roles,valueToSearch).subscribe((data:getUserInService)=>{
      this.userList=[];
      data.results.forEach((user: { _id: { $oid: string; }; first_name: string; last_name: string; uid: { id: string;iid:string }; email: string; }) => {
        const formattedUser = {
          id: user._id.$oid,
          name: `${user.first_name} ${user.last_name}`,
          uid: user.uid.id,
          email: user.email,
          institution:user.uid.iid
        };       
        let isUserPresent = this.addedUserList.find(item => 
          item.id === formattedUser.id && item.uid === formattedUser.uid && item.email === formattedUser.email
      );
      if (!isUserPresent ) this.userList.push(formattedUser);
      });
    }) 
  }
  public onKeyDown(event: KeyboardEvent):void{
    const initialValue = this.dynamicForm.get('searchTerm')?.value;
    if (event.key === 'Backspace')this.dynamicForm.get('searchTerm')?.valueChanges.subscribe((resp) => {if (initialValue !== resp) {this.isResetSearchButton=false}});
}
  public onSave(): void {
    const formData = this.dynamicForm.value;
    if (this.renderDateTimeInputs) {
      formData['start'] = new Date(`${formData.fromDate}T${formData.fromTime}`).toISOString();
      formData['end'] = new Date(`${formData.toDate}T${formData.toTime}`).toISOString();
    }
    formData['users'] = this.selectedValues;
    formData['role_type'] = this.renderDateTimeInputs ? 'restricted':'reserved';
    formData['iid'] = this.institutionId;
    formData['roles'] = [this.roles?.split("|")[0]?.trim() || this.roles];
    if(this.selectedValues.length > 0 ){
      this.saveForm.emit(formData);
    this.isButtonDisabled = true;
    this.closePopup();
    this.getDataAndCloseModalPopUp.emit(true);
    }else{
      if(!this.renderDateTimeInputs){
        this.showModalMessage('Service Team Change',
        `You are removing the last person from this ${this.serviceName} . Are you sure you want to remove?`
        );
      }else{
        this.showCheckBoxError = "Must select atleast one user for the service."
      }
    }
  }

  public closeEditModalPopup(id: string): void {
    let checkbox = document.getElementById(id) as HTMLInputElement;
    if (checkbox) {
      if (checkbox.type === 'checkbox') { 
        checkbox.checked = !checkbox.checked; 
      }
    }
  }

  public setDateTimeDefaultFormValue(startDate:string,endData:string):void{
    if(startDate != null && endData != null){
      this.dynamicForm.patchValue({
        fromDate: this.dateUtilSvc.formatDate(new Date(startDate)),
        fromTime:this.converted(startDate),
        toDate: this.dateUtilSvc.formatDate(new Date(endData)),
        toTime:this.converted(endData),
      });
    }else this.dynamicForm.patchValue({fromDate: null,fromTime: null,toDate: null,toTime: null,});

  }
  
  public converted(dateTimeString: string): string {
    const convertedDate = `${dateTimeString.slice(0, -10)}:00.000Z`;
    const utcTime = new Date(convertedDate);
    const hours = new Date(utcTime).getHours().toString().padStart(2, "0");
    const minutes = new Date(utcTime).getMinutes().toString().padStart(2, "0");
    const formattedTime = `${hours}:${minutes}`;
    return formattedTime
  }

  public getPreviousCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public showModalMessage(titleMessage: string,showModalMessage: string): void {
    this.modalTitleMessage = titleMessage;
    this.modalShowMessage = showModalMessage;
    this.showSuccessPopup = true;
  }

  public cancelpopup(): void {  this.showSuccessPopup = false; }

  public onReSave(): void {
    const formData = this.dynamicForm.value;
    if (this.renderDateTimeInputs) {
      formData['start'] = new Date(`${formData.fromDate}T${formData.fromTime}`).toISOString();
      formData['end'] = new Date(`${formData.toDate}T${formData.toTime}`).toISOString();
    }    
    formData['users'] = this.selectedValues;
    formData['role_type'] = this.renderDateTimeInputs ? 'restricted':'reserved';
    formData['iid'] = this.institutionId;
    formData['roles'] = [this.roles?.split("|")[0]?.trim() || this.roles];
    if(this.selectedValues.length == 0 ){
    formData['user_remove'] = 'yes';
    this.saveForm.emit(formData);
    }else{
      this.saveForm.emit(formData);
    }
    this.closePopup();
    this.getDataAndCloseModalPopUp.emit(true)
  }
  public onResetSearch():void{
    const alreadySelected = this.intiatUserList.filter(item => !this.selectedValues.includes(item.email));
    const removedObjects = this.intiatUserList.filter(item => this.selectedValues.includes(item.email));
    removedObjects.forEach(objA => {let isDuplicate = this.addedUserList.some(objB => objB.email === objA.email);
      if (!isDuplicate)this.addedUserList.push(objA);
      this.sortSelectedUser();});
    this.userList=alreadySelected;
    this.isResetSearchButton=false;
    this.dynamicForm.get('searchTerm')?.reset();
  }
  public sortSelectedUser():void{
    this.addedUserList.sort((a, b) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      return 0;
  });
  }
}