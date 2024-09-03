import { CookieService, status } from '@amsconnect/shared';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdtProcessorSubjectData, ViewFileProcessProcessorResponse } from 'apps/admin/src/modals/filesProcess.model';
import { AppNavigationService } from '../../../services/app-navigation.service';
import { FilesProcessService } from 'apps/admin/src/services/file-process.service';
import { UsersService } from 'apps/admin/src/services/users.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'web-messenger-add-adt-processor',
  templateUrl: './add-adt-processor.component.html'
})
export class AddAdtProcessorComponent implements OnDestroy  {
  public addADTProcessForm: FormGroup;
  public userId!:string;
  public submitted: boolean = false;
  public isReportingTag: boolean = false;
  public uRLADTProcessData!:string;
  public returnToURLPageTriggerd!:string;
  public disabledFormChanged: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    public formBuilder: FormBuilder,
    public cookieService: CookieService,
    public filesProcessService:FilesProcessService,
    public userSvc: UsersService,
    public router: Router,
    public navigateSvc: AppNavigationService,
    ){
    this.getBehaviourSubjectData();
    this.addADTProcessForm = this.formBuilder.group({
      typeADTProcess: new FormControl({ value: "adt", disabled: true }),
      uRLADTProcess: new FormControl({value: `filearea://${this.uRLADTProcessData}`,disabled: true}),
      fid: new FormControl(""),
      interval: new FormControl(""),
    });
    this.onChangeFormDisabledRemoved();
  }

  public onChangeFormDisabledRemoved(): void {
    this.addADTProcessForm.valueChanges.subscribe(() => {
      this.disabledFormChanged = true;
    });
  }

  public getBehaviourSubjectData():void{
    this.subscription.add(
      this.filesProcessService.dataAddADT$.subscribe((data:AdtProcessorSubjectData) => {
        if(data.urlRoute !== "" && data.cancelRoute !== ""){
          this.uRLADTProcessData = data.urlRoute;
          this.returnToURLPageTriggerd = data.cancelRoute
        }else if (data.urlRoute === "" && data.cancelRoute ===""){
          this.navigateSvc.navigate([`/filearea`]);
        }
      })
    );
  }

  public addADTProcessSubmit(): void {
    const formData = new URLSearchParams();
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) { 
      formData.append("a", aCookieValue); 
    }
    formData.append("type",this.addADTProcessForm.controls['typeADTProcess'].value);
    formData.append("url",this.addADTProcessForm.controls['uRLADTProcess'].value );
    formData.append("fid", this.addADTProcessForm.controls['fid'].value);
    formData.append("interval", this.addADTProcessForm.controls['interval'].value);
    const jsonObject:any = {};
    formData.forEach((value, key) => { jsonObject[key] = value });

    this.filesProcessService.addProcessorArea(jsonObject).subscribe((data: ViewFileProcessProcessorResponse) => {
      if (data.status == status.StatusCode.OK) {
      this.navigateSvc.navigate([`/dropbox/view/${data.dropbox.id}`]);
      }
    })
  }

  public returnToRoute():void{
    this.navigateSvc.navigate([`/filearea/${this.returnToURLPageTriggerd}`]);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
