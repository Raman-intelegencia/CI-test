import { Injectable } from "@angular/core";
import { CookieService } from '@amsconnect/shared';
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActiveStatus } from 'apps/admin/src/modals/institutionsConfig.model';
import { Configuration, DeleteSSOResponse, SchemaInterface, SchemaData, attributesconfigurationData, commonDynamicFormInterface, configurationDataBasedTabInterface, configurationInterface, configurationsDataInterface, SchemaFormInterface, OtherSSOKeysInterface, FieldAttributeInterface, ConfigDataKeysInterface } from 'apps/admin/src/modals/sso.models';
import { SSOInstitutionsService } from 'apps/admin/src/services/sso-institutions.service';
import { AppNavigationService } from "../../../services/app-navigation.service";
@Injectable()
export class SSOConfigurationBaseComponent{
  public backtoSourcePage:string="";
  public dynamicForm!: FormGroup;
  public commonDynamicForm!: FormGroup;
  public commonDynamicFormDefaultKey:string="common";
  public configurationData:Configuration[]=[] ;
  public configDataKeys:ConfigDataKeysInterface=['New'];
  public ssoTypeSelect:string = "";
  public active_status:string = 'New';
  public activeSection:String = 'New';
  public allowedFields = ['disabled','oidc','saml','smart'];
  public modalTitleMessage: string = "";
  public modalShowMessage: string = "";
  public showSuccessPopup:boolean = false;
  public preFilledDynamicForm!: FormGroup;
  public preFilledCommonDynamicForm!: FormGroup;
  public selectedTab:string = "";
  public preFilledDynamicFormType:string = "";
  public deleteConfigurationName:string = "";
  public keysToRemove = ["iid", "certificates", "time_updated","metadata"];
  public isButtonDisabled: boolean = true;
  public selectedFileUpload!:string;
  public selectedFileName!:string;
  public otherSSOFieldsData!:SchemaInterface;
  public otherSSOKeys:string[]=[];
  public downloadMetaDataLink!:string;
  public checkFileSystemINCSV!: File;
  public nameOfFileUploaded!:string; 
    constructor(
    public router: Router,
    public SSOSvc:SSOInstitutionsService,
    public fb: FormBuilder,
    public cookieSvc: CookieService,
    public cd: ChangeDetectorRef,
    public navigateSvc: AppNavigationService,
    ){}

  public getIncludedSchemaKeys(items:string):boolean { return this.allowedFields.includes(items) }

  public onValueChanges():void{
    this.commonDynamicForm.valueChanges.subscribe((value:commonDynamicFormInterface) => {
     this.ssoTypeSelect = value.common.type;
     this.isButtonDisabled = false;
    }) 
  }

  public getInitialDynamicFormGroup(initialFormData:string): FormGroup {
    return this.dynamicForm.get(initialFormData) as FormGroup;
  }

  public getInitialCommonFormGroup(initialCommonForm:string): FormGroup {
    return this.commonDynamicForm.get(initialCommonForm) as FormGroup;
  }

  public getPreFilledOtherSSOformGroup(initialFormData:string): FormGroup {
    return this.preFilledDynamicForm.get(initialFormData) as FormGroup;
  }

  public getPreFilledCommonFormGroup(initialCommonForm:string): FormGroup {
    return this.preFilledCommonDynamicForm.get(initialCommonForm) as FormGroup;
  }

  public getPrefilledConfigurationsKeys(prefilledData:string): string[] {
    if(prefilledData == "" || prefilledData == undefined ){
      return [];
    }else{
      return this.otherSSOKeys.filter((item:string)=> item == prefilledData );
    }
  }

  public downloadMetaDataFile(downloadString:string):void{ 
    window.open(downloadString,'_blank'); 
  }

  public navigateBackToSource():void{
    this.navigateSvc.navigate([this.backtoSourcePage]);
  }
  
}