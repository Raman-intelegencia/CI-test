import { AuthService, CookieService, Institution, UsersAuthResponse, access_group_actions_map, environment, status } from '@amsconnect/shared';
import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { batchPreviewResponseData, csvPreviewBatchInterfaceData } from 'apps/admin/src/modals/csv_preview.models';
import { ActiveStatus, JobResponse, UserChildOUsConfigJson } from "apps/admin/src/modals/institutionsConfig.model";
import { DashboardIntegration, OutdatedSyncProblem, SyncProblem } from 'apps/admin/src/models/integration.model';
import { InstitutionHelperService } from 'apps/admin/src/services/institution-helper.service';
import { InstitutionsService } from 'apps/admin/src/services/institutions.service';
import { InstitutionsConfigService } from 'apps/admin/src/services/institutionsConfig.service';
import { Subscription, firstValueFrom, interval, map, mergeMap, takeLast, takeWhile, timer } from 'rxjs';
import { AppNavigationService } from '../../../../services/app-navigation.service';

interface ViewModel extends DashboardIntegration {
  errorText: string | undefined;
}

interface ProblemInfo {
  __messageType: string;
  parameters: object;
}

@Component({
  selector: 'web-messenger-configure-user-child-ous',
  templateUrl: './configure-user-child-ous.component.html',
  styleUrls: ['./configure-user-child-ous.component.scss'],
})


export class ConfigureUserChildOusComponent implements OnInit, OnChanges {
  @Input() institution !: Institution
  public active_status = "configureUser";
  public activeSection = ActiveStatus;
  public sendEmailToNewUsers = true;
  public makeUsersManaged = true;
  public uploadForm!: FormGroup;
  public userFileName = "";
  public userCsvFileName = "";
  public childOUSFileName = "";
  public patientFileName = "";
  public enablebutton = true;
  public isUploadCsv = true;
  public isPreviewCsv = true;
  public showUserFileName = false;
  public showPreviewCsvFileName = false;
  public file!: File;
  public binaryData = "";
  public showSuccessModal = false;
  public checkCSV!: File;
  public updateValuesInUser!: JobResponse;
  public showErrorModal = false;
  public showErrorMessage = "";
  public downloadSuccessModal = false;
  public showValidation!: string;
  public submitButtonType = "";
  public jobId!:string;
  public subscription = new Subscription();
  public getALLCurrentUserPermissionList!:access_group_actions_map;
  public isChildInstitution=false;
  public isPatientUploadPreviewCsv = true;
  public integrationsViewModels: ViewModel[] = [];
  public showSyncScheduledMessage = false;
  public syncError?: string;
  public replacedPatient = false;

  @Output() onIntegrationSyncCompleted = new EventEmitter<void>();
  public showToast = false;
  public toastIsClosing = false;
  public get EMAIL_CONFIG_IID() {
    return environment.EMAIL_CONFIG_IID;
  };

  @Input({ required: true }) set integrations(value: DashboardIntegration[]) {
    this.integrationsViewModels = value.map<ViewModel>((integration) => { 
      if (integration.isHealthy) {
        if (!integration.problems || integration.problems.length == 0) {
          return { ...integration, errorText: this.translate.instant("syncErrors.healthyIntegration") };
        }
        else {
          const errors = integration.problems.map((problem) => {
            const problemInfo = this.extractProblemInfo(problem);
            return this.translate.instant(problemInfo.__messageType, { ...problemInfo.parameters });
          }).join('\n');

          const errorText = this.translate.instant("syncErrors.healthyIntegrationWithProblems", { successfulCount: integration.successfulSyncs, totalCount: integration.totalSyncsConsidered }) + '\n' + errors;

          return { ...integration, errorText: errorText };
        }
      }
      else if (!integration.problems || integration.problems.length == 0) {
        return { ...integration, errorText: undefined };
      }
      else {
        const errors = integration.problems.map((problem) => {
          const problemInfo = this.extractProblemInfo(problem);
          return this.translate.instant(problemInfo.__messageType, { ...problemInfo.parameters });
        }).join('\n');

        const errorText = this.translate.instant("syncErrors.unhealthyIntegrationHeader") + '\n' + errors;
      
        return { ...integration, errorText: errorText };
      }
    });
  }
  
  private extractProblemInfo(problem: SyncProblem) {
    let info: ProblemInfo;
    const { type, ...parametersWithoutType} = problem;
    switch (problem.type) {
      case "OutdatedSync": {
        if ((problem as OutdatedSyncProblem).lastSyncTime != null) {
        info = { parameters: { ...parametersWithoutType,  lastSyncTime: this.datePipe.transform((problem as OutdatedSyncProblem).lastSyncTime, "YYYY-MM-dd HH:mm")} , __messageType: "syncErrors." + problem.type };
        }
        else {
          info = { parameters: { ...parametersWithoutType }, __messageType: "syncErrors.OutdatedSyncNever" };
        }
        break;
      }
      default: {
        info = { parameters: { ...parametersWithoutType }, __messageType: "syncErrors." + problem.type }
        break;
      }
    }

    return info;
  }

  constructor(
    private route: ActivatedRoute, 
    private InstitutionsConfigService: InstitutionsConfigService,
    private InstitutionHelper: InstitutionHelperService,
    private formBuilder: FormBuilder,
    private InstitutionService: InstitutionsService,
    public cookieService: CookieService, 
    public cd: ChangeDetectorRef,
    public router: Router,
    public translate: TranslateService,
    public datePipe: DatePipe,
    public authService: AuthService,
    public destroySub: DestroyRef,
    public navigateSvc: AppNavigationService,
    ) {
    this.uploadForm = this.formBuilder.group({
      sendEmailToNewUsers: [false],
      makeUsersManaged: [false],
      replaceExisting: [false],
      csvFile: "",
      userFile: "",
      patientFile: ""
    });

    this.destroySub.onDestroy(() => {
      this.subscription.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.getdata();
  }

  ngOnChanges():void{
    this.isChildInstitution=!!this.institution?.child_institutions?.length;
  }

  public closeToast(): void {
    this.toastIsClosing = true;
    setTimeout(() => {
      this.showToast = false;
      this.toastIsClosing = false;
    }, 250);
  }
  
  public changeTab(tabname: string): void {
    this.uploadForm.reset();
    this.active_status = tabname;
    this.showSuccessModal = false;
    this.downloadSuccessModal = false;
  }

  public navigateTo(destination: string): void {
    this.InstitutionHelper.navigateTo(destination, this.institution.id);
  }

  public downloadUser(report: string): void {
    const formData = {
      iid: this.institution.id,
      report_type: report,
      show_child: 'true'
    }
    this.InstitutionsConfigService.executeInstitutionReport(formData).subscribe((data: JobResponse) => {
      this.showSuccessModal = true;
      this.downloadSuccessModal = true;
      this.jobId=data.job.id;
    });

  }

  public resetPopupvalue():void{
    this.showSuccessModal = false;
    this.downloadSuccessModal = false;
   }

  public uploadFile(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput.files;
    this.submitButtonType = fileInput.id;

    if (files && files.length > 0) {
      const isUserFile = fileInput.id === "userfile";
      this.isPreviewCsv = !isUserFile;
      this.isUploadCsv = isUserFile;
      this.showUserFileName = isUserFile;
      this.showPreviewCsvFileName = !isUserFile;
      this.isPatientUploadPreviewCsv = !(fileInput.id === "patientfile");
      const file = files[0];
      if(fileInput.id === "patientfile") {
        this.patientFileName = file.name
      } else if(fileInput.id === "childousfile") {
        this.childOUSFileName = file.name;
      } else if(fileInput.id === "usercsv") {
        this.userFileName = "";
        this.userCsvFileName = file.name;
      } else {
        this.userCsvFileName ="";
        this.userFileName = file.name;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const binaryData = reader.result as string;
        this.checkCSV = file;
      };
      this.cd.markForCheck();
    }
  }

  public onSubmit(type: string): void {
    const jsonData: UserChildOUsConfigJson = this.constructJsonData(type);
    const formData: FormData = this.constructFormData(jsonData);
    this.addCookieToFormData(formData);
    this.submitFormData(formData);
  }

  private constructJsonData(type: string): UserChildOUsConfigJson {
    this.replacedPatient = this.uploadForm.value.replaceExisting;
    const jsonData: UserChildOUsConfigJson = {
      iid: this.institution.id,
      processor: this.uploadForm.value.replaceExisting ? 'patients_replace' : 'patients_add'
    };

    if (type === "users_add") {
      jsonData.processor = type;
      jsonData.values = {
        send_email: this.uploadForm.value.sendEmailToNewUsers,
        managed: this.uploadForm.value.makeUsersManaged
      };
    } else if (type === "ou_add") {
      jsonData.processor = type;
    }

    return jsonData;
  }

  private constructFormData(jsonData: UserChildOUsConfigJson): FormData {
    const formData = new FormData();
    formData.set('json', JSON.stringify(jsonData));
    formData.append('file_name', this.checkCSV.name);
    if(this.submitButtonType === "usercsv") {
      formData.append("csv_preview", this.checkCSV as Blob);
    } else {
      formData.append("csv", this.checkCSV as Blob);
    }
    return formData;
  }

  public configureIntegration(integration: ViewModel): void {
    this.router.navigate(["institution", integration.integrationData.institutionId, "update-integration", integration.integrationData.id]);
  }

  public async triggerIntegrationScheduleSync(institutionId: string, integrationId: number): Promise<void> {
    const response = await firstValueFrom(this.InstitutionService.triggerIntegrationScheduleSync(institutionId, integrationId));

    this.showSyncScheduledMessage = true;
    if (response.status !== "ok") {
      let message = "Error calling schedule sync API: " + response.toString();
      console.error(message);
      this.syncError = message;

      return;
    }

    interval(5000)
      .pipe(
        mergeMap(() => this.InstitutionService.pollIntegrationScheduleSync(institutionId, response.jobId)),
        takeWhile((isDone) => isDone === false, true),
        takeLast(1),
        map(() => this.showToast = true ),
        map(() => timer(10000).subscribe(() => this.closeToast())),
        map(() => this.onIntegrationSyncCompleted.next())
      )
      .subscribe();
  }

  private addCookieToFormData(formData: FormData): void {
    const aCookieValue = this.cookieService.getCookie("a") || "";
    if (aCookieValue) {
      formData.append('X-cureatr-user', aCookieValue.split("|")[1]);
    }
  }

  private submitFormData(formData: FormData): void {
    this.InstitutionsConfigService.userCSVUpdate(formData).subscribe((data: JobResponse | csvPreviewBatchInterfaceData|batchPreviewResponseData) => {
      if(data.status == status.StatusCode.OK){
        if(this.isJobResponse(data)){
          this.onBasedResponseTrigger(data);
        }else if (this.iscsvPreviewBatchInterfaceData(data)){
        this.navigateToCSVUploadPage(data.job_id);
        }
      }
      this.uploadForm.reset();
      this.userFileName = "";
      this.childOUSFileName = "";
      this.patientFileName = "";
    });
  }

  public onBasedResponseTrigger(response: JobResponse): void {
    if (response.status === "error") {
      this.showErrorModal = true;
      this.showErrorMessage = "Error";
      this.showValidation = response.job.message;
    } else {
      this.jobId = response.job.id;
      this.showSuccessModal = true;
      this.updateValuesInUser = response;
    }

  }

  public navigateToCSVUploadPage(jobid:string):void {
    this.navigateSvc.navigate([`institution/${this.institution.id}/csv_upload`], { queryParams: { jobID: jobid } });
  }

  public isJobResponse(data: JobResponse | csvPreviewBatchInterfaceData|batchPreviewResponseData): data is JobResponse {
    return (data as JobResponse).job !== undefined;
  }

  public iscsvPreviewBatchInterfaceData(data: JobResponse | csvPreviewBatchInterfaceData|batchPreviewResponseData): data is csvPreviewBatchInterfaceData {
    return (data as csvPreviewBatchInterfaceData).job_id !== undefined;
  }

  public getdata():void{
    this.subscription = this.authService.authResponseData$.subscribe((userAuthResponse: UsersAuthResponse) => {
      this.getALLCurrentUserPermissionList = userAuthResponse?.user?.access_group_actions_map;      
    });
  }

  public navigateToChildInstitute(id:string):void{
    this.navigateSvc.navigate([`/institution/${id}`]);
  }

  public showDisableIntegrationsWarningModal: boolean = false;

  public get isIntegrationsActive(): boolean {
    return this.integrationsViewModels.length === 0 || this.integrationsViewModels.findIndex(x => x.integrationData.isActive) !== -1;
  }

  public toggleIntegrations = async (): Promise<void> => {
    if (this.isIntegrationsActive) {
      const { modifiedIntegrations } = await firstValueFrom(this.InstitutionService.disableIntegrationsForInstitution(this.institution.id));
      this.integrationsViewModels.filter(vm => modifiedIntegrations.findIndex(id => vm.integrationData.id == id) !== -1).forEach(vm => vm.integrationData.isActive = false);
    } else {
      const { modifiedIntegrations } = await firstValueFrom(this.InstitutionService.enableIntegrationsForInstitution(this.institution.id));
      this.integrationsViewModels.filter(vm => modifiedIntegrations.findIndex(id => vm.integrationData.id == id) !== -1).forEach(vm => vm.integrationData.isActive = true);
    }
  }
}
