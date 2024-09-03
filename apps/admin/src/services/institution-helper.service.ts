import { CookieService, EditInstitutionResponse, environment } from '@amsconnect/shared';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs/internal/Observable';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError } from 'rxjs/internal/operators/catchError';
import { CheckboxOption, CreateInstitutionResponse, InstitueReportsRequest, InstitueReportsResponse, Institution, PreviwUserRequestData, ProcessorData, QuickMessageApiResponse, QuickMessageData, ReportsResponse, RootObject, RootObjectInstitutions, RootObjectRoles } from '../modals/institutions.model';
import { UsersResponse } from '../modals/users.model';
import { AppNavigationService } from "./app-navigation.service";

const csvHeaders = new HttpHeaders();
csvHeaders.append('Content-Type', 'multipart/form-data');

@Injectable({
  providedIn: "root",
})

export class InstitutionHelperService {

  public API_URL: string | undefined;
  private offloadUrl: string | undefined;
  constructor(
    public navigateSvc: AppNavigationService,
    private http: HttpClient,
    private cookieService: CookieService) {
    this.API_URL = environment.baseUrl;
    this.offloadUrl = environment.offloadUrl;
  }

  public navigateTo(destination: string, institutionId: string): void {
    switch (destination) {
      case 'admins':
        this.navigateSvc.navigate(['search', ` admin:${institutionId}`]);
        break;
      case 'eventLog':
        this.navigateSvc.navigate(['institution', institutionId, 'event_log']);
        break;
      case 'apiLog':
        this.navigateSvc.navigate(['institution', institutionId, 'api_log']);
        break;
      case 'customemail':
        this.navigateSvc.navigate(['institution', institutionId, 'custom-email']);
        break;
      case 'quickmessages':
        this.navigateSvc.navigate(['institution', 'batch_processing', 'quick_messages']);
        break;
      case 'createIntegration':
        this.navigateSvc.navigate(['institution', institutionId, 'create-integration']);
        break;
      case 'batchjob':
        this.navigateSvc.navigate(['jobs', 'institution', institutionId]);
        break;
      default:
        break;
    }
  }

  public openModal(data: string, institution: Institution): { dynamicModalTitle: string, showModal: boolean, CheckboxOptionsArray: CheckboxOption[], postData: string } | null {
    let dynamicModalTitle = "";
    let showModal = false;
    let CheckboxOptionsArray: CheckboxOption[] = [];
    let postData: any = null;
    switch (data) {
      case 'override':
        if (!institution.is_dnd_override_enabled) {
          showModal = false;
          break;
        }
        else {
          dynamicModalTitle = "Edit Override";
          showModal = true;
          CheckboxOptionsArray = [
            { label: 'Urgent Broadcast Message', valid: institution.broadcast_messages, values: 'broadcast_messages' },
            { label: 'Pager Integration', valid: institution.pager_integration, values: 'pager_integration' },
            { label: 'Urgent Peer to Peer', valid: institution.peer_to_peer, values: 'peer_to_peer' }
          ];
          postData = { "SSO Status": false };
        }
        break;

      case 'features':
        dynamicModalTitle = "Edit Institution Features";
        showModal = true;
        break;
      case 'status':
        dynamicModalTitle = "Edit institution status "
        CheckboxOptionsArray = [
          { label: 'Lock Institute', valid: institution.is_locked, values: 'lock Institute' },
        ];
        showModal = true
        break;
      case 'sso':
        dynamicModalTitle = "Edit sso"
        showModal = true
        CheckboxOptionsArray = [
          { label: 'SSO Status', valid: true },
        ];
        postData = { "SSO Status": false };
        break;
      case 'CellphoneVerification':
        dynamicModalTitle = "Edit Verification"
        showModal = true
        CheckboxOptionsArray = [
          { label: 'Enable Cellphones Verification', valid: institution.cellphone_verification, values: 'cellphone_verification' },
        ];
        break;
    }
    return showModal ? { dynamicModalTitle, showModal, CheckboxOptionsArray, postData } : null;
  }
  public getInstitutions(): Observable<RootObjectInstitutions> {
    return this.http.get<RootObjectInstitutions>(`${this.API_URL}/profile/institutions`, { withCredentials: true }).pipe(
      catchError((error) => {
        console.error("Error fetching users", error);
        return throwError(error);
      })
    );
  }
  // Get Admin Batch
  public adminBatch(): Observable<RootObject> {
    return this.http
      .get<RootObject>(`${this.offloadUrl}/offload/admin/batch`, {
        headers: this.setcookie(),
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }
  public institueRoleGet(InstituteDetails: string): Observable<RootObjectRoles> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";

    const formData = new URLSearchParams();
    formData.set('iid', InstituteDetails);
    formData.set('a', aCookieValue);
    return this.http
      .post<RootObjectRoles>(
        `${this.API_URL}/admin/iroles_get`,
        formData,
        { headers: this.setcookie(), withCredentials: true, }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public institueGet(InstituteDetails: string): Observable<CreateInstitutionResponse> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";

    const formData = new URLSearchParams();
    formData.set('iid', InstituteDetails);
    formData.set('a', aCookieValue);
    return this.http
      .post<CreateInstitutionResponse>(
        `${this.API_URL}/admin/iget`,
        formData,
        { headers: this.setcookie(), withCredentials: true, }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }


  public postBroadcastMessage(BroadcastMessageUser: ProcessorData, selectfile?: string): Observable<QuickMessageApiResponse> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    const formData = new URLSearchParams();
    const userString = JSON.stringify(BroadcastMessageUser);
    formData.set('json', userString);
    formData.set('a', aCookieValue);
    if (selectfile) {
      formData.append('file_name', selectfile);
    }
    return this.http
      .post<QuickMessageApiResponse>(
        `${this.offloadUrl}/offload/admin/batch`,
        formData,
        { headers: this.setcookie(), withCredentials: true, }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }
  public getPreviewUser(BroadcastMessageUser: PreviwUserRequestData): Observable<UsersResponse> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    const formData = new URLSearchParams();
    const userString = JSON.stringify(BroadcastMessageUser);
    formData.set('json', userString);
    formData.set('a', aCookieValue);

    return this.http
      .post<UsersResponse>(
        `${this.offloadUrl}/offload/admin/batch`,
        formData,
        { headers: this.setcookie(), withCredentials: true, }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }
  public postQuickMessage(BroadcastMessageUser: QuickMessageData, selectfile?: string): Observable<QuickMessageApiResponse> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    const formData = new URLSearchParams();
    const userString = JSON.stringify(BroadcastMessageUser);
    formData.set('json', userString);
    formData.set('a', aCookieValue);
    if (selectfile) {
      formData.append('file_name', selectfile);
    }
    return this.http
      .post<QuickMessageApiResponse>(
        `${this.offloadUrl}/offload/admin/batch`,
        formData,
        { headers: this.setcookie(), withCredentials: true, }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }
  // Get Institute Reports 
  public instituteReport(): Observable<ReportsResponse> {
    return this.http
      .get<ReportsResponse>(`${this.API_URL}/offload/reports/all`, {
        headers: this.setcookie(),
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }
  public submitInstituteReport(dataObject: InstitueReportsRequest): Observable<InstitueReportsResponse> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    const formData = new URLSearchParams();
    const servicesString = JSON.stringify(dataObject?.services ?? {});
    formData.set('date_to', dataObject.date_to);
    formData.set('date_from', dataObject.date_from);
    formData.set('report_id', dataObject.report_id);
    if (dataObject?.thread_id) {
      formData.set('thread_id', (dataObject?.thread_id || ''));
    }
    if (dataObject?.message_id) {
      formData.set('message_id', dataObject?.message_id || '');
    }
    if (dataObject?.no_phi_ok) {
      formData.set('no_phi_ok', `${dataObject.no_phi_ok}`);
    }
    formData.set('services', servicesString);
    if (typeof dataObject.iids !== 'string') {
      dataObject?.iids.forEach((iids) => {
        formData.append("iids", iids || "");
      })
    }
    if (typeof dataObject.tags !== 'string') {
      if (dataObject?.tags) {
        dataObject?.tags.forEach((tags) => {
          formData.append("tags", tags || "");
        })
      }
    }
    if (dataObject.obscure_phi) { formData.set('obscure_phi', dataObject.obscure_phi); }
    if (dataObject.results_daily) { formData.set('results_daily', dataObject.results_daily); }
    if (dataObject.results_weekly) { formData.set('results_weekly', dataObject.results_weekly); }
    if (dataObject.results_monthly) { formData.set('results_monthly', dataObject.results_monthly); }
    if (dataObject.show_results_by_child_ou) { formData.set('show_results_by_child_ou', dataObject.show_results_by_child_ou); }
    if (dataObject?.exclude_locked_user) {
      formData.set('exclude_locked_user',dataObject?.exclude_locked_user);
    }
    formData.set('a', aCookieValue);
    return this.http
      .post<InstitueReportsResponse>(
        `${this.offloadUrl}/offload/reports/execute_institution_report`,
        formData,
        { headers: this.setcookie(), withCredentials: true, }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public updateQuickMessageInstitution(institutionId: string, quickMessage: string[]): Observable<EditInstitutionResponse> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    const formattedValue = { 'macros': quickMessage };
    const formData = new URLSearchParams();
    formData.set('iid', institutionId);
    formData.set('json', JSON.stringify(formattedValue));
    formData.set('a', aCookieValue);

    return this.http
      .post<EditInstitutionResponse>(`${this.API_URL}/admin/iupdate`, formData, {
        headers: this.setcookie(), withCredentials: true
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }
  private setcookie(): HttpHeaders {
    const exractedCsrfToken = this.cookieService.getCookie("csrf");
    const csrfToken = exractedCsrfToken ? exractedCsrfToken : "";
    const newheaders = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-CSRF-Token": csrfToken,
      "X-Requested-With": "XMLHttpRequest",
      Accept: "application/json, text/javascript, */*; q=0.01",
    });
    return (newheaders);
  }

  public postBroadcastMessageWithAttachedCSV(csvBroadcastAttachedData: FormData): Observable<QuickMessageApiResponse> {
    return this.http.post<QuickMessageApiResponse>(`${this.offloadUrl}/offload/admin/batch`, csvBroadcastAttachedData, {
      headers: csvHeaders,
      withCredentials: true
    }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  public postQuickMessageWithAttachedCSV(quickMessageCSVData: FormData): Observable<QuickMessageApiResponse> {
    return this.http.post<QuickMessageApiResponse>(`${this.offloadUrl}/offload/admin/batch`,
      quickMessageCSVData,
      { headers: csvHeaders, withCredentials: true })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

}