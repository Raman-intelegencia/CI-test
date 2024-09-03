import { Component, DestroyRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule,} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {FilteredDataMassage, commonOverideFilteredDataModelInterface, overideModelInterface,CheckboxOption,checkBoxArrayData } from "../../../modals/institutionsConfig.model";
import { UserHelperService } from '../../../services/user-helper.service';
import { AuthService, ModalComponent } from '@amsconnect/shared';
import { Subscription } from 'rxjs';

@Component({
  selector: 'web-messenger-permission-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ReactiveFormsModule,ModalComponent],
  templateUrl: './permission-modal.component.html',
  styleUrls: ['./permission-modal.component.scss'],
})
export class PermissionModalComponent implements OnInit, OnChanges {
  @Input() filteredFeatureData:FilteredDataMassage[]=[];
  @Input() isCheckboxModal = false;
  @Input() id = '';
  @Input() title = '';
  @Input() checkboxOptions: CheckboxOption[] = [];
  @Input ({required: false}) overrideModal = false;
  @Output() closePopup: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onSaveFeature: EventEmitter<(string | undefined)[]> = new EventEmitter<(string | undefined)[]>();
  @Output() onsaveOverride:EventEmitter<string>=new EventEmitter<string>();
  public form!: FormGroup;
  public checkedKeys: string[] = [];
  public overrideData:overideModelInterface[]=[];
  public authReponse = new Subscription();
  public isSuperAdmin = false;
  public isAdmin = false;
  public intialFilteredFeatureData:FilteredDataMassage[]=[];
  public adminInstitutions:{
    iid: string;
    iname: string;
  }[] | undefined = []
  public saveButtonDisabled:boolean = true;
  public showSuccessPopup: boolean = false;
  public modalTitleMessage: string = "";
  public modalShowMessage: string = "";

  constructor(
    public formBuilder: FormBuilder,
    private userHelperSvc: UserHelperService,
    private authService: AuthService,
    private destroyRef: DestroyRef
    ) {
      this.destroyRef.onDestroy(() => {
        this.authReponse.unsubscribe();
      })
    }

  ngOnChanges(changes: SimpleChanges): void {
      if(changes['filteredFeatureData']?.currentValue){
        this.getAuthData();
      }

  }

  ngOnInit() {
    this.intialFilteredFeatureData = JSON.parse(JSON.stringify(this.filteredFeatureData));
    if(this.overrideModal === true){
      this.addKeyInobject(this.checkboxOptions);
    }
    this.createForm();
  }

  public getAuthData():void{
    this.authReponse = this.authService.authResponseData$.subscribe(data => {
      this.isSuperAdmin = this.userHelperSvc.isSuperAdmin(data.user.admin);
      this.isAdmin = this.userHelperSvc.isAdmin(data.user.admin)
        this.adminInstitutions = data.user.admin; 
        if (!this.isSuperAdmin) {
            console.warn('Not a super admin');
        }  
    })
  }

  public addKeyInobject(data: CheckboxOption[]): void {
    let convertedData= data.map((item:CheckboxOption) => ({
        key: item.label,
        description: item.label,
        ...item,
      })
    );
    this.overrideData = convertedData; 
  }

  public onCloseClick(): void {
    this.filteredFeatureData = this.intialFilteredFeatureData;
    this.saveButtonDisabled = true;
    this.showSuccessPopup = false;
    this.isCheckboxModal = false;
    this.closePopup.emit(this.isCheckboxModal);
  }

  public createForm():void {
    let formSelected = this.overrideModal ? this.overrideData : this.filteredFeatureData;

    const controls = formSelected.map((option: commonOverideFilteredDataModelInterface) => {
      return this.formBuilder.control(option.valid);
    });

    this.form = this.formBuilder.group({
      options: new FormArray(controls),
    });
  }

  public onSaveClick():void {
    if(this.overrideModal){
      const transformedData = this.overrideData.reduce((result:any, item:overideModelInterface) => {
        const key:any = item.values;
        const value = item.valid;
        result[key] = value;
        return result;
      }, {});
      this.onsaveOverride.emit(JSON.stringify(transformedData));
    }else{
      this.onSaveFeature.emit(this.intialFilteredFeatureData.filter((item:FilteredDataMassage)=> item.valid).map((item:FilteredDataMassage)=> item.key));
    }
    this.onCloseClick();
  }

  public toggleSelection(checkedData: checkBoxArrayData):void {
    this.saveButtonDisabled = false;
    if(this.overrideModal){
      const overideChecked = this.overrideData.some((item:overideModelInterface) => item.key === checkedData.key);
      checkedData.valid = checkedData.valid ? false : overideChecked ? true : false;
      const index = this.overrideData.findIndex((item:overideModelInterface )=> item.key === checkedData.key);
      // used for some scenario if (index !== -1) { this.overrideData['index'] = checkedData;} 
    }else{
      const abcExists = this.filteredFeatureData.some((item:FilteredDataMassage) => item.key === checkedData.key);
      checkedData.valid = checkedData.valid ? false : abcExists ? true : false;
      const index = this.filteredFeatureData.findIndex((item:FilteredDataMassage )=> item.key === checkedData.key);
      // used for some scenario if (index !== -1) { this.filteredFeatureData['index'] = checkedData;}   
    }
  }

  public cancelpopup(): void {
    this.modalTitleMessage = "" ;
    this.modalShowMessage = "";
    this.showSuccessPopup = false;
  }

  public showModalMessage():void{
    if(this.saveButtonDisabled === false){
      this.modalTitleMessage = 'Discard Changes' ;
      this.modalShowMessage = 'Are you sure you want to discard changes ?';
      this.showSuccessPopup = true;
    }else{
      this.onCloseClick();
    } 
  }

}
