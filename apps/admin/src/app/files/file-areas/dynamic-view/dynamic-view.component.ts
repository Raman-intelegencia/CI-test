import { CookieService, DateUtilsService, ErrorHandlingService, UserService, status } from '@amsconnect/shared';
import { ChangeDetectorRef, Component, OnChanges, OnInit, Input,Output, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FilesService } from 'apps/admin/src/services/files.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DeleteFileAreaData, FileAreasResponse, RenameFileAreaData, filesData } from 'apps/admin/src/modals/filesAreas.model';
import { FilesProcessService } from 'apps/admin/src/services/file-process.service';
import { DropboxesData, FileDetails, FileProcessProcessorResponse, FileResponse } from 'apps/admin/src/modals/filesProcess.model';
import { UserInfoService } from 'apps/admin/src/services/user-info.service';
import { Subscription } from 'rxjs';
import { DynamicViewBaseComponent } from './dynamic-view.class';
import { UsersService } from 'apps/admin/src/services/users.service';
import { AppNavigationService } from 'apps/admin/src/services/app-navigation.service';

@Component({
  selector: 'web-messenger-dynamic-view',
  templateUrl: './dynamic-view.component.html',
})

export class DynamicViewComponent extends DynamicViewBaseComponent implements OnInit,OnChanges,OnDestroy{
  @Input('userIDSearchInstitution') userIDInstitution !: string;
  @Input() showInstitutionLabel = true;
  public id!: string;
  public currentURL!: string;
  public fileAreaData:filesData[] = [];
  public showSuccessPopup = false;
  public modalTitleMessage: string = "";
  public modalShowMessage: string = "";
  public subscription: Subscription[] = [];

  constructor(
    public route: ActivatedRoute,
    public cd: ChangeDetectorRef,
    cookieService: CookieService,
    public formBuilder: FormBuilder,
    private userInfoSvc: UserInfoService,
    private userService: UserService,
    filesService:FilesService,
    filesProcessService:FilesProcessService,
    dateUtilSvc: DateUtilsService,
    errorHandlingService:ErrorHandlingService,
    router: Router,
    userSvc: UsersService,
    navigateSvc: AppNavigationService,
    ) { 
      super(formBuilder,router,filesService,filesProcessService,dateUtilSvc,errorHandlingService, navigateSvc, cookieService);
      this.renameFileNameForm = this.formBuilder.group({
        reNamedFile: new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(200)]),
        previousFileName: new FormControl(""),
      });

      this.createNewDirectoryForm = this.formBuilder.group({
        directoryName: new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(200)]),
      });
    }
  
  ngOnInit(): void {
    this.currentURL = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentURL = this.router.url;
      }
    });
    this.subscription.push(this.userService.userId$.subscribe(res => {
      this.userId = res;
    }));
  }

  ngOnChanges(): void{
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });

    this.fileDownloadviewURL = this.router.url;
    this.route.url.subscribe(segments => {
      this.segments = segments.map(segment => segment.path);
      this.segmentsData = this.segments;
      this.fetchDataBasedURL(this.segments.join('/'));
      this.fetchDataForProcessor(this.segments[0]);
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentURL = this.router.url;
      }
    });
  }

  public refreshPage(): void{
    this.fetchDataBasedURL(this.segments.join('/'));
    this.fetchDataForProcessor(this.segments[0]);
  }

  public fetchDataBasedURL(path:string):void{
    this.showLoader = true;
    this.filesService.getFileAreaParticularBucket(path).subscribe((data: FileAreasResponse) => {
      if (data.status == status.StatusCode.OK) {
        let allfiles = data.files;
        this.fileAreaData = allfiles.map(job => {
          return {
            ...job,
            last_modified: this.dateUtilSvc.changeTimezone(job.last_modified)
          };
        }).sort((a, b) => {
          // Convert filenames to lowercase for case-insensitive sorting
          const filenameA = a.filename.toLowerCase();
          const filenameB = b.filename.toLowerCase();
        
          if (filenameA < filenameB) {
            return -1;
          }
          if (filenameA > filenameB) {
            return 1;
          }
          return 0;
        });
      this.showLoader = false;
      }
    })
  }

  public fetchDataForProcessor(path:string):void{
    this.filesService.getAdminFileAreaSelectedBucket(path).subscribe((data: FileProcessProcessorResponse) => {
      if (data.status == status.StatusCode.OK) {
        this.viewAddProvisiongProcessorTag = data.dropboxes;
      }
    })
  }

  public viewDownloadFile(fileName:string,type:string):void{
    let extension =  fileName.split('.').pop();
    let isPngOrCsv; 
    let viewDownloadFiles
    switch (extension) {
      case "png":
        isPngOrCsv = false;
        break;
      case "csv":
        isPngOrCsv = true;
      break;
      default:
        isPngOrCsv = false;
      break;
    }

    if(type =='viewFile'){
      viewDownloadFiles = this.filesService.viewDownloadFileUrl(`${this.currentURL}/${fileName}`,isPngOrCsv,type);
      window.open(viewDownloadFiles, '_blank');
    }else if(type =='downloadFile'){
      viewDownloadFiles = this.filesService.viewDownloadFileUrl(`${this.currentURL}/${fileName}`,isPngOrCsv,type);
      window.open(viewDownloadFiles, '_blank');
    }
  }

  public deleteFile(fileName:string):void{
    this.filesService.deleteFileBucket(fileName).subscribe((data: DeleteFileAreaData) => {
      this.showSuccessPopup = false;
      if (data.status == status.StatusCode.OK) {
        this.refreshPage();
      }
    });
  }

  public lockResetSendPassword(fileName: string):void {
    this.showSuccessPopup = true;
    this.modalTitleMessage = "Delete";
    this.modalShowMessage = `Are you sure you want to delete ${fileName}`;
    this.deleteFileName = `${this.currentURL}/${fileName}`;
  }

  public cancelpopup(): void { 
    this.showSuccessPopup = false; 
  }

  public uploadFile(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput.files;    
    if (files && files.length > 0) {
      this.totalNumberOfFilesUploaded = [];
      Array.from(files).forEach(file => {
        this.totalNumberOfFilesUploaded.push(file);
      });
      for(let i = 0; i < files.length; i++) {
        this.showSuccessPopup = true;
        const file = files[i];
        this.showProgressBarWithName = true;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const binaryData = reader.result as string;
          this.uploadProfileImage(file);
          this.showSuccessPopup = false;
        };
        this.cd.markForCheck();// ChangeDetectorRef since file is loading outside the zone
      }
    }
  }

  public uploadProfileImage(storeImageUrl: File): void {
    const formData = new FormData();
    const aCookieValue = this.cookieService.getCookie("a");
    let extractedUserId = aCookieValue?.split("|")[1];
    let userId = extractedUserId ? extractedUserId : "";
    formData.append("X-cureatr-user",userId );
    formData.append("path", `${this.segments.join('/')}`);
    formData.append("source", storeImageUrl as Blob);
    this.filesService.createNewFileInBucket(this.currentURL,formData).subscribe((imageResponse: RenameFileAreaData) => {
      if (imageResponse.status == status.StatusCode.OK) {
        this.showProgressBarWithName = false;
        this.refreshPage();
      }
      this.showProgressBarWithName = false;
    });
  }

  get f() { 
    return this.renameFileNameForm.controls; 
  }

  get h() { 
    return this.createNewDirectoryForm.controls; 
  }

  public onClickfileRenameForm(): void {
    this.renameFileNameForm = this.formBuilder.group({
        reNamedFile: new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(200)]),
        previousFileName: new FormControl(""),
    });

    this.createNewDirectoryForm = this.formBuilder.group({
      directoryName: new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(200)]),
    });
  }

  public setFileName(fullFileName:string):void{
    this.renameFileNameForm.get('reNamedFile')?.setValue(`${fullFileName}`);
    this.renameFileNameForm.get('previousFileName')?.setValue(`${fullFileName}`);
  }

  public fileRename(closeModalname:string): void {
    this.submitted = true;
    if (this.renameFileNameForm.invalid) { 
      return;
    }
    const formData = new FormData();
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) { 
      formData.append("a", aCookieValue); 
    }
    formData.append("new_path", `${this.segments.join('/')}/${this.renameFileNameForm.controls['reNamedFile'].value}`);

    this.filesService.renameFile(`${this.currentURL}/${this.renameFileNameForm.controls['previousFileName'].value}`,formData)
    .subscribe((data: RenameFileAreaData) => {
      if (data.status == status.StatusCode.OK) {
        this.refreshPage();
      }
    })
    this.closeEditModalPopup(closeModalname);
  }

  public createNewFileBucket(closeModalname:string): void {
    this.submitted = true;
    if (this.createNewDirectoryForm.invalid) { 
      return;
    }
    const formData = new FormData();
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) { 
      formData.append("a", aCookieValue); 
    }
    formData.append("directory", `${this.createNewDirectoryForm.controls['directoryName'].value}`);

    this.filesService.createNewFileInBucket(`${this.currentURL}`,formData).subscribe((data: RenameFileAreaData) => {
      if (data.status == status.StatusCode.OK) {
        this.refreshPage();
      }
    })
    this.closeEditModalPopup(closeModalname);    
  }

  public closeEditModalPopup(id: string): void {
    let checkbox = document.getElementById(id) as HTMLInputElement;
    if (checkbox) {
      if (checkbox.type === 'checkbox') { 
        checkbox.checked = !checkbox.checked; 
      }
    }
  }

  public navigateToADTProcessorPage():void {
    this.filesProcessService.addADTSubjectData({urlRoute:this.segments[0],cancelRoute:this.segments.join('/')});
    this.router.navigate(['/dropbox/addadt']);
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }
}