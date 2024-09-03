import { CookieService } from '@amsconnect/shared';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Configuration, DeleteSSOResponse, SchemaInterface, SchemaData, attributesconfigurationData, commonDynamicFormInterface, configurationDataBasedTabInterface, configurationInterface, configurationsDataInterface, SchemaFormInterface, OtherSSOKeysInterface, FieldAttributeInterface, ConfigDataKeysInterface } from 'apps/admin/src/modals/sso.models';
import { SSOInstitutionsService } from 'apps/admin/src/services/sso-institutions.service';
import { SSOConfigurationBaseComponent } from './sso-configurations';
import { AppNavigationService } from '../../../services/app-navigation.service';
@Component({
  selector: 'web-messenger-sso-configuration',
  templateUrl: './sso-configuration.component.html'
})
export class SsoConfigurationComponent extends SSOConfigurationBaseComponent implements OnInit {
  @Input() instituteId = "";
  constructor(
    router: Router,
    SSOSvc:SSOInstitutionsService,
    fb: FormBuilder,
    cookieSvc: CookieService,
    cd: ChangeDetectorRef,
    navigateSvc: AppNavigationService,
    ){
    super(router, SSOSvc, fb, cookieSvc, cd, navigateSvc)
      this.dynamicForm = this.fb.group({});
      this.commonDynamicForm = this.fb.group({});
    }

  ngOnInit(): void { 
    this.backtoSourcePage = `/institution/${this.instituteId}`;
    this.getSSODetalsOfInstitute(); 
  }

  public getSSODetalsOfInstitute(): void {
    this.SSOSvc.getSSOListOfInstitute(this.instituteId).subscribe((data:SchemaData) => {
      if(data.status ==='ok'){  
        this.otherSSOFieldsData = data.schema;
        this.configurationData = data.configurations;
        this.createTwoDynamicForm(data.schema);
        this.getConfigurationKeys();
      }
    });
  }

  public createTwoDynamicForm(schemaDataFields:SchemaFormInterface): void {
    this.otherSSOKeys = Object.keys(this.otherSSOFieldsData);
    this.otherSSOKeys.forEach((schemaKey: string) => {
      if(this.getIncludedSchemaKeys(schemaKey) == false){
        const schema = schemaDataFields[schemaKey];
        const group: { [key: string]: any } = {};
      schema.forEach((field: FieldAttributeInterface) => {
        const validators = field.constraint === 'required' ? [Validators.required] : [];
        if(field.attribute === 'iid') {
          group[field.attribute] = { value: this.instituteId, disabled: true };
        }else{
          group[field.attribute] = this.fb.control('', validators);
        }
      });
      this.commonDynamicForm.addControl(schemaKey, this.fb.group(group));
      }else if(this.getIncludedSchemaKeys(schemaKey) == true){
        const schema = schemaDataFields[schemaKey];
        const group: { [key: string]: any } = {};
        schema.forEach((field: FieldAttributeInterface) => {
          const validators = field.constraint === 'required' ? [Validators.required] : [];
          if(field.constraint === 'readonly') {
            group[field.attribute] = { value: '', disabled: true };
          }else{
            group[field.attribute] = this.fb.control('', validators);
          }
        });
        this.dynamicForm.addControl(schemaKey, this.fb.group(group));
      }
    });
    this.onValueChanges();
  }
 
  public getOtherSSOSchemaKeysExceptCommon(selectedItem:string): string[] {
    if(selectedItem == "" || selectedItem == undefined ){
      return [];
    }else{
      return this.otherSSOKeys.filter((item:string)=> item !== 'common' && item == selectedItem );
    }
  }

  public getOnlyCommonFieldsKeys(selectedItem:string): string[] {
    return this.otherSSOKeys.filter((item:string)=> item == selectedItem) || [];
  }

  public getConfigurationKeys():void{
    this.configurationData.forEach((item:Configuration)=> {
      if(item.attributes.alt !== undefined){
        this.configDataKeys.push(item.attributes.alt);
      }else {
        this.configDataKeys.push('Primary');
      }
    });
  }

  public showModalMessage(titleMessage: string,showModalMessage: string): void {
    this.modalTitleMessage = titleMessage;
    this.modalShowMessage = showModalMessage;
    this.showSuccessPopup = true;
  }

  public onConfirmPopUP():void {    
    if(this.configurationData.length > 0){
      if(this.commonDynamicForm.value.common.alt == ''){
        return this.showModalMessage("Error","Please select different Alternative Name other than Primary");
      }else if(this.commonDynamicForm.value.common.alt.toLowerCase() === "primary"){
        return this.showModalMessage("Error","Please select different Alternative Name other than Primary");
      }
    };

    if(this.commonDynamicForm.value.common['type'] ==""){
      return this.showModalMessage("Error","Please Select SSO Type");
    };
    
    if(this.commonDynamicForm.value.common['type'] !== ""){
      return this.showModalMessage("Are you Sure","Are you Sure");
    };
  }

  public uploadFile(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.selectedFileName = file.name;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => { 
        this.selectedFileUpload = reader.result as string  
        this.uploadProfileImage(file);
      };
      this.cd.markForCheck();
    }
  }

  public uploadProfileImage(storeImageUrl: File): void {
    this.nameOfFileUploaded = storeImageUrl.name;
    this.checkFileSystemINCSV = storeImageUrl;
  }
  public cancelpopup(): void {  this.showSuccessPopup = false; }

  public onEditConfirmPopUP():void {
   if(this.preFilledCommonDynamicForm.value.common.type === ""){
    return this.showModalMessage("Error","Please Select SSO Type");
    }else if(this.preFilledCommonDynamicForm.value.common['type'] !== ""){
    return this.showModalMessage("Edit","Are you Sure, you want to Edit");
    } 
  }

  public onDeleteConfirmPopUP(configurationName:string):void {
    this.deleteConfigurationName = configurationName;
    return this.showModalMessage("Delete",`Are you Sure, you want to Delete ${configurationName}`);
  }

  public performPopUPMessage(showTitle:string): void {
    if(showTitle === 'Error'){
      this.showSuccessPopup = false;
    }else if(showTitle === 'Are you Sure'){
      this.onSubmit(this.commonDynamicForm.value.common,this.dynamicForm.value[this.commonDynamicForm.value.common['type']]);
    }else if(showTitle === "Edit"){
      this.onSubmit(this.preFilledCommonDynamicForm.value.common,this.preFilledDynamicForm.value[this.preFilledCommonDynamicForm.value.common['type']]);
    }else if(showTitle === "Delete"){
      this.onDeleteSeletctedSSO(this.deleteConfigurationName);
    }else if(showTitle === "Success"){
      this.showSuccessPopup = false;
    } 
  }

  public removeNullOrUndefined(obj:any):object { // object can be anything in dynamic format
    for (var key in obj) {
      if (obj[key] === null || obj[key] === undefined || obj[key] === "" || this.keysToRemove.includes(key)) {
        delete obj[key];
      }
    }
    return obj;
  }

  public onSubmit(form1:FormGroup,form2:FormGroup):void {
    this.showSuccessPopup = false;
    let newDataObject = {};
    let filteredData:any = {};
    let convertedObjectData:any = {};
    let extractedUserId = this.cookieSvc.getCookie("a")?.split("|")[1];
    let userId = extractedUserId ? extractedUserId : "";
      for (const [key, value] of Object.entries(form1)) {
          if (value !== "" ||  value != null || value != undefined) {
              filteredData[key] = value;
          }
      }

      for (const [key, value] of Object.entries(form2)) {
        if (value !== "" || value !== null || value !== undefined ) {
            filteredData[key] = value;
        }
      }
      filteredData = this.removeNullOrUndefined(filteredData)

      Object.assign(newDataObject, filteredData);

      const formData = new FormData();
      if(this.selectedFileUpload === undefined){
        convertedObjectData = {
          json:newDataObject,
          a:this.cookieSvc.getCookie("a"),
        }
      }else if(this.selectedFileUpload !== undefined){
        convertedObjectData = {
          json:newDataObject,
          a:this.cookieSvc.getCookie("a"),
          file_name:this.selectedFileName,
          metadata:this.checkFileSystemINCSV as Blob,
          'X-cureatr-user':userId
        }
      }   
      for (const key in convertedObjectData) {
        if (convertedObjectData.hasOwnProperty(key)) {
          if (typeof convertedObjectData[key] === 'object') {
            if(key == 'metadata'){
              formData.append(key, convertedObjectData[key] as Blob);
            }else{
              formData.append(key, JSON.stringify(convertedObjectData[key]));
            }
          } else {
            formData.append(key, convertedObjectData[key]);
          }
        }
      }
      this.onCreateEditSubmitFormData(formData);  
  }

  public onCreateEditSubmitFormData(Data:FormData):void {
    this.SSOSvc.createSSOForInstitute(this.instituteId,Data).subscribe((value:Configuration) => {
      if(this.nameOfFileUploaded){
        return this.showModalMessage("Success",this.nameOfFileUploaded);
      }
    })
  }

  public onDeleteSeletctedSSO(altID:string):void {
    this.showSuccessPopup = false;
    const formData = new FormData();
    const aCookieValue = this.cookieSvc.getCookie("a");
    if (aCookieValue) { formData.append("a", aCookieValue); }
    this.SSOSvc.deleteSSOForInstitute(this.instituteId,altID,formData).subscribe((value:DeleteSSOResponse) => {})
  }

  public changeTab(tabname: string): void {
    this.active_status = tabname;
    this.activeSection = tabname;
    if(tabname !== 'New'){
      this.selectedTab= tabname;
      let resultsonTabChange = this.findDataByAlt(tabname,this.configurationData);
      let dataMassageresultsonTabChange = this.transformObject(resultsonTabChange);
      if(dataMassageresultsonTabChange){
        this.preFilledDynamicFormType = dataMassageresultsonTabChange.attributes.type;
        this.createFormHavingConfigurationsData(dataMassageresultsonTabChange.attributes,dataMassageresultsonTabChange.index);
      }
    }
  }

  public transformObject(inputObject:configurationDataBasedTabInterface |null) {
    if(inputObject != null){
      const outputObject = JSON.parse(JSON.stringify(inputObject));
      if (Object.keys(outputObject.downloads).length === 0) {
          outputObject.attributes.metadata = "";
      } else {
          outputObject.attributes.metadata = outputObject.downloads.metadata;
      }
      return outputObject;
    }
  }

  public findDataByAlt(altToFind:string,data:Configuration[]): configurationDataBasedTabInterface|null {
    const result = (altToFind === 'Primary') 
    ? data[0] 
    : data.find(item => item.attributes.alt && item.attributes.alt.toLowerCase() === altToFind.toLowerCase());
    if (result !== undefined) {
      const index = data.indexOf(result);
      return { ...result, index: index };
    } else {
      return null;
    }
  } 

  public createFormHavingConfigurationsData(attributesData:attributesconfigurationData,indexNumber:number): void{
    this.preFilledDynamicForm = this.fb.group({});
    this.preFilledCommonDynamicForm = this.fb.group({});
    let indexData:any = this.configurationData[indexNumber];
    if(Object.keys(indexData.downloads).length !== 0){
      this.downloadMetaDataLink = indexData.downloads.metadata;
    }
    if(JSON.stringify(indexData.downloads) === '{}' ){ this.downloadMetaDataLink = ''; }
    const commonControls:any={};
    const controls:any = {};
    this.otherSSOFieldsData['common'].forEach((field:FieldAttributeInterface) => {
       const defaultValue = indexData.attributes[field.attribute];
      if(defaultValue != undefined || defaultValue != "" || defaultValue != null){
        commonControls[field.attribute] = [defaultValue, Validators.required];
      }
      if(field.attribute === 'iid' ){ commonControls[field.attribute] =  { value: defaultValue, disabled: true } }
    
      if(field.attribute === 'alt' ){ commonControls[field.attribute] =  { value: defaultValue, disabled: true } }

      if(field.attribute === 'time_updated'){ commonControls[field.attribute] =  { value: defaultValue.split('T')[0], disabled: true }}
    });

    this.otherSSOFieldsData[attributesData.type].forEach((field:FieldAttributeInterface) => {
      const defaultValue = indexData.attributes[field.attribute];
      if(defaultValue != undefined || defaultValue != "" || defaultValue != null){
        controls[field.attribute] = [defaultValue, Validators.required];
      }
      if(field.attribute === 'certificates' ){ controls[field.attribute] =  { value: defaultValue, disabled: true } }
    });
    this.preFilledCommonDynamicForm.addControl('common', this.fb.group(commonControls));
    this.preFilledDynamicForm.addControl(attributesData.type, this.fb.group(controls));
  }   
}