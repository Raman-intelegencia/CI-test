import { CookieService, DateUtilsService, ErrorHandlingService, UserService, status } from '@amsconnect/shared';
import { ChangeDetectorRef, Component, OnChanges, OnInit, Input,Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FilesService } from 'apps/admin/src/services/files.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DeleteFileAreaData, FileAreasResponse, RenameFileAreaData, filesData } from 'apps/admin/src/modals/filesAreas.model';
import { FilesProcessService } from 'apps/admin/src/services/file-process.service';
import { DropboxesData, FileDetails, FileProcessProcessorResponse, FileResponse } from 'apps/admin/src/modals/filesProcess.model';
import { AppNavigationService } from '../../../../services/app-navigation.service';
  
export class DynamicViewBaseComponent{
    public segments!: string[];
    public fileDetails!:FileDetails;
    public userId!:string;
    public renameFileNameForm: any;
    public createNewDirectoryForm: any;
    public submitted: boolean = false;
    public viewAddProvisiongProcessorTag:Array<DropboxesData> = [];
    public fileDownloadviewURL!: string;
    public segmentsData!: string[];
    public showLoader=false;
    public deleteFileName:string= "";
    public showProgressBarWithName:boolean= false;
    public uploadFileStatus:number = 0;
    public totalNumberOfFilesUploaded:File[] = [];

    constructor(
      public  fb: FormBuilder,
      public  router:Router,
      public  filesService:FilesService,
      public filesProcessService:FilesProcessService,
      public  dateUtilSvc: DateUtilsService,
      public  errorHandlingService:ErrorHandlingService,
      public navigateSvc: AppNavigationService,
      public cookieService: CookieService
      ){
    }
    
    public carryDetails(data:string):void
    {
        this.filesService.getAdminFileAreaDetailsSelected(data,this.segments.join('/')).subscribe((data: FileResponse) => {
        if (data.status == status.StatusCode.OK) {
          let FileProperty = data.file;
          FileProperty.last_modified = this.dateUtilSvc.changeTimezone(FileProperty.last_modified);
          this.fileDetails = FileProperty;
        }
      });
    }

      public navigateTocreatedDetails(): void {
        if (this.fileDetails?.created_by?.id && this.userId) {
          const currentUserFromCookie = this.getCurrentUserIdFromCookie();
          
          // Constructing the query parameters string
          const queryParams = new URLSearchParams({
            user_id: this.userId, // Always include this userId
          });
          
          // Optionally add current_user_id if it exists
          if (currentUserFromCookie) {
            queryParams.set('current_user_id', currentUserFromCookie);
          }
      
          const url = `/user/${this.fileDetails.created_by.id}?${queryParams.toString()}`;
          window.open(url, '_blank');
        }
      }
      
      public navigateTomodifyDetails(): void {
        if (this.fileDetails?.modified_by?.id && this.userId) {
          const currentUserFromCookie = this.getCurrentUserIdFromCookie();
          
          // Constructing the query parameters string
          const queryParams = new URLSearchParams({
            user_id: this.userId, // Always include this userId
          });
          
          // Optionally add current_user_id if it exists
          if (currentUserFromCookie) {
            queryParams.set('current_user_id', currentUserFromCookie);
          }
      
          const url = `/user/${this.fileDetails.modified_by.id}?${queryParams.toString()}`;
          window.open(url, '_blank');
        }
      }

      private getCurrentUserIdFromCookie(): string | undefined {
        const tabId = sessionStorage.getItem('tabId');
        if (!tabId) return undefined; // Tab ID not found
      
        return this.cookieService.getCookie(`current_user_id_${tabId}`);
      }
      
      public navigateToViewProvisioningPage():void {
        if(this.viewAddProvisiongProcessorTag.length > 0){
          this.navigateSvc.navigate([`/dropbox/view/${this.viewAddProvisiongProcessorTag[0].id}`]);
        }else{
          this.filesProcessService.addAddProcessorSubjectData({urlRoute:this.segments[0],cancelRoute:this.segments.join('/')});
          this.navigateSvc.navigate(['/dropbox/addprovi']);
        }
      }
    
      public navigateToBatchJobsPage():void {
        this.navigateSvc.navigate([`/jobs/all`], { queryParams: { bucketName: this.segments[0]} });
      }
    
      public navigateToSelectedPage(data:Array<string>,index:number):void{
        data.splice(index + 1, data.length - (index + 1) );;
        this.navigateSvc.navigate([`/filearea/${data.join('/')}`]);
      }
}

