import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CommonModule } from '@angular/common';
import { TranslateModule } from "@ngx-translate/core";
import {JobResponse } from "apps/admin/src/modals/institutionsConfig.model";
import { Router } from "@angular/router";
import { AppNavigationService } from "../../../services/app-navigation.service";

@Component({
  selector: 'web-messenger-success-modal',
  standalone: true,
  imports: [CommonModule,TranslateModule],
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.scss'],
})
export class SuccessModalComponent implements OnInit{
  @Input() showSuccessModal=false;
  @Input() updateValuesInUser!:JobResponse;
  @Input() replacedPatient = false;
  @Input() conditionForFileProcessed=false;
  @Input() jobIdFromQuickMessage="";
  @Input() showConfirmRemoveWebHook=false;
  @Output() resetPopupvalue = new EventEmitter();
  @Output()  removeWebHook = new EventEmitter();
 
 
  public updatedSummary="";
  public jobId="";
  
  constructor(
    public router: Router,
    public navigateSvc: AppNavigationService,
    ){}

  ngOnInit() :void{
    this.updatedSummary = this.updateValuesInUser?.job?.summary ?? null;
    this.jobId = this.updateValuesInUser?.job?.id ?? null;
  }

  public closePopUp():void{
    this.showSuccessModal=false;
    this.resetPopupvalue.emit(this.showSuccessModal);
  }

  public navigateToJob():void{
    this.navigateSvc.navigate([`/job/${this.jobIdFromQuickMessage}`]);
  }
  
  public navigateToMineJob():void{
   this.navigateSvc.navigate([`/jobs/mine`])
  }

  public removeWebHookInParent():void {
    this.removeWebHook.emit();
  }
}












