import { Component,DestroyRef,OnInit } from '@angular/core';
import { FilesService } from 'apps/admin/src/services/files.service';
import { CookieService, UserService, status } from '@amsconnect/shared';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CreateNewFileDirectoryBucket, DeleteFileAreaData, FileAreasDataDirectory, fileAreasInterfaceData, fileAreasUsersGrantsProjInterfaceData, fileAreasUsersInterfaceData } from 'apps/admin/src/modals/filesAreas.model';
import { AppNavigationService } from '../../../../services/app-navigation.service';

@Component({
  selector: 'web-messenger-all-file-area',
  templateUrl: './all-file-area.component.html'
})
export class AllFileAreaComponent implements OnInit{

  fileareasData:fileAreasInterfaceData[]=[];
  usersAccessFileAreas:any[] = [];
  currentURL!: string;
  public showSuccessPopup = false;
  public modalTitleMessage: string = "";
  public modalShowMessage: string = "";
  public createNewDirectoryForm: any;
  public submitted: boolean = false;  
  public subscription = new Subscription();
  public imageUrl = "";
  public deleteFileName:string= "";
  public showLoader = false; 
  constructor(
    public filesService:FilesService,
    private router: Router,
    public formBuilder: FormBuilder,
    public cookieService: CookieService,
    public userDataSvc: UserService,
    public destroySub: DestroyRef,
    public navigateSvc: AppNavigationService,
    ){ 
      this.currentURL = this.router.url; 
      this.createNewDirectoryForm = this.formBuilder.group({
        directoryName: new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(200)]),
      });
      this.destroySub.onDestroy(() => {
        this.subscription.unsubscribe();
      });
    }

  ngOnInit(): void {
    this.subscription = this.userDataSvc.imageUrlPath$.subscribe(path => this.imageUrl = path);
    this.getAllFileAreaData();
  }

  public getAllFileAreaData(): void {
    this.showLoader = true;
    this.filesService.adminAllFileArea().subscribe((data: FileAreasDataDirectory) => {
      this.showLoader = false;
      if (data.status == status.StatusCode.OK) {
        this.fileareasData = data.fileareas;
        this.usersAccessFileAreas = data.filearea_users;
      }
    })
  }

  public deleteSelectedFolderBucket(fileName: string):void {
    this.showSuccessPopup = true;
    this.modalTitleMessage = "Delete";
    this.modalShowMessage = `Are you sure you want to delete ${fileName}`;
    this.deleteFileName = `${this.currentURL}/${fileName}`;
  }

  public cancelpopup(): void { 
    this.showSuccessPopup = false; 
  }

  public deleteFile(fileName:string):void{
    this.filesService.deleteFileBucket(fileName).subscribe((data: DeleteFileAreaData) => {
      this.showSuccessPopup = false;
      if (data.status == status.StatusCode.OK) {
        this.getAllFileAreaData();
      }
    });
  }

  get h() { 
    return this.createNewDirectoryForm.controls; 
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
    formData.append("filearea", `${this.createNewDirectoryForm.controls['directoryName'].value}`);

    this.filesService.createNewFileDirectoryAdminFileArea(formData)
    .subscribe((data: CreateNewFileDirectoryBucket) => {
      if (data.status == status.StatusCode.OK) {
        this.getAllFileAreaData();
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

  public getFileAreaPermission(permission: string): string {
    let readWritePermissions!:string; 
    switch (permission) {
      case 'filearea-read':
        readWritePermissions = 'Read';
        break;
      case 'filearea-write':
        readWritePermissions = 'Write';
      break;
    }
    return readWritePermissions;
  }

  public getImageUrl(imageId: string | undefined): string { return imageId ? this.imageUrl + imageId + "_profile.png" : ""; }

  public navigateToBucket(bucketName:string):void{
    this.navigateSvc.navigate([`/filearea/${bucketName}`]);
  }

}