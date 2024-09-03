import { CookieService, status } from '@amsconnect/shared';
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FilesService } from 'apps/admin/src/services/files.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FilesProcessService } from 'apps/admin/src/services/file-process.service';
import { DropboxesData, FileProcessProcessorResponse, ViewFileProcessProcessorResponse } from 'apps/admin/src/modals/filesProcess.model';
import { AppNavigationService } from '../../../services/app-navigation.service';
@Component({
  selector: 'web-messenger-view-provisioning',
  templateUrl: './view-provisioning.component.html'
})
export class ViewProvisioningComponent implements OnChanges{
  @Input() id:string  = "";

  public viewAddProvisiongProcessorTag = {} as ViewFileProcessProcessorResponse; 

  constructor(
  private route: ActivatedRoute,
  public router: Router,
  public filesProcessService:FilesProcessService,
  public navigateSvc: AppNavigationService,) {}
  public showLoader = false; 

  ngOnChanges(): void {
    this.fetchViewDataForCreatedProcessor(this.id);
  }

  public fetchViewDataForCreatedProcessor(pathID:string):void{
    this.showLoader = true;
    this.filesProcessService.viewCreatedProcessor(pathID).subscribe((data: ViewFileProcessProcessorResponse) => {
      this.showLoader = false;
      if (data.status == status.StatusCode.OK) {
        this.viewAddProvisiongProcessorTag = data; 
      }
    })
  }

  public navigateToBucketPage():void {
    const modifiedURL = this.viewAddProvisiongProcessorTag.dropbox.url.replace("filearea:/", "");
    this.navigateSvc.navigate([`/filearea${modifiedURL}`]);
  }

  public navigateToInstitutionPage():void {
    this.navigateSvc.navigate([`/institution/${this.viewAddProvisiongProcessorTag.dropbox.iid}`]);
  }

  public navigateToEditProcessorPage():void {
    this.navigateSvc.navigate([`/dropbox/addprovi/${this.id}`]);
  }

}
