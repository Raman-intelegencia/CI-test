import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AdminEmailTemplateResponse,
  AuthService,
  CookieService,
  SaveCustomEmailDetails,
  SendCustomEmailDetails,
  CustomEmailEnum,
  ModalComponent,
  SendCustomEmailResponse,
} from '@amsconnect/shared';
import { EmailTemplate } from '@amsconnect/shared';
import { Router } from '@angular/router';
import { CustomEmailService } from 'apps/admin/src/services/custom-email.service';
import { AppNavigationService } from '../../../../services/app-navigation.service';
@Component({
  selector: 'web-messenger-custom-emails',
  templateUrl: './custom-emails.component.html',
  styleUrls: ['./custom-emails.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule,ModalComponent],
})
export class CustomEmailsComponent implements OnInit {
  public customEmailEnum = CustomEmailEnum;
  public active_status = 'activation-email-sso';
  public customEmailType = 'activation_sso';
  public customEmailForm!: FormGroup;
  public instituteID= '';
  public usersEmail = '';
  public emailTemplates!: EmailTemplate[];
  public showDynamicTemplateTags!: string[];
  public pendingMessage = false;
  public currentEmailTemplate!: EmailTemplate[];
  public restoreDefault = false;
  public ShowDiscardModal = false;
  public updatedActiveStatus = '';
  public updatedCustomEmail = '';
  public showOnSave = false;
  public changeTabShowOnSave = true;
  public showResetDefaultModal = false;
  public showTmplOptionFrequency!: string[];

  public showSuccessPopup: boolean = false;
  public modalTitleMessage: string = "";
  public modalShowMessage: string = "";

  constructor(
    private fb: FormBuilder,
    private cookieService: CookieService,
    private customEmailService: CustomEmailService,
    private authService: AuthService,
    private router: Router,
    public navigateSvc: AppNavigationService,
  ) {
    this.customEmailForm = this.fb.group({
      subject: ['', Validators.required],
      body: ['', Validators.required],
      frequency: [],
      pendingMessageOnly: [],
    });
  }

  ngOnInit() {
    this.authService.usersAuth().subscribe((data) => {
      if (data.status === 'ok') {
      const currentUrl = this.router.url; // Get the current URL
      this.instituteID = this.getInstitutionNameFromUrl(currentUrl);
        this.usersEmail = data.user?.email;
        if (this.instituteID.length) {
          this.customEmailService
            .adminEmailTemplate(this.instituteID)
            .subscribe((data: AdminEmailTemplateResponse) => {
              this.emailTemplates = data.email_templates;
              this.updateCustomEmailTemplate();
              this.onValueChanges();
            });
        }
      }
    });
  }

  private getInstitutionNameFromUrl(url: string): string  {
    const matches = url.match(/\/institution\/([^\/]+)/);
    return matches ? matches[1] : '';
  }

  public onValueChanges(): void {
    this.customEmailForm.valueChanges.subscribe(() => {
      if (this.changeTabShowOnSave) {
        this.showOnSave = true;
      } else {
        this.changeTabShowOnSave = true;
      }
    });
  }

  public updateCustomEmailTemplate(): void {
    this.currentEmailTemplate = this.emailTemplates.filter((template) => {
      return template.type === this.customEmailType;
    });
    this.restoreDefault = this.setRestoreDefaultDiscard();

    this.showDynamicTemplateTags = this.currentEmailTemplate[0].params;
    let options = this.currentEmailTemplate[0].options;
    let frequency!: string | null;
    let pendingMessagesOnly!: boolean | null | undefined;
    for (let key in options) {
      if (options.hasOwnProperty(key)) {
        if (key === 'frequency') {
          frequency = options[key] == null ? null : options[key];
        } else if (key === 'pending_messages_only') {
          pendingMessagesOnly = options[key] == null ? null : options[key];
        }
      }
    }
    let tmpl_options = this.currentEmailTemplate[0].tmpl_options;
    if (tmpl_options.hasOwnProperty('frequency')) {
      this.showTmplOptionFrequency = tmpl_options.frequency;
    }
    this.customEmailForm.setValue({
      subject: this.currentEmailTemplate[0].subject,
      body: this.currentEmailTemplate[0].body,
      frequency: frequency,
      pendingMessageOnly: pendingMessagesOnly,
    });
  }
  public changeTab(tabname: string, type: string): void {
    this.updatedActiveStatus = tabname;
    this.updatedCustomEmail = type;
    const previousSubject = this.customEmailForm.controls['subject'].value;
    const previousBody = this.customEmailForm.controls['body'].value;
    const previousFrequency = this.customEmailForm.controls['frequency'].value;
    this.changeTabShowOnSave = false;
    if (
      previousBody !== this.currentEmailTemplate[0].body ||
      previousSubject !== this.currentEmailTemplate[0].subject ||
      previousFrequency !== this.currentEmailTemplate[0].options.frequency ||
      this.pendingMessage
    ) {
      this.ShowDiscardModal = true;
    } else {
      this.discardAndChangeTab();
    }
  }

  public returnToInstitutionDetails(): void {
    this.navigateSvc.navigate(['institution', this.instituteID]);
  }

  public discardAndChangeTab(): void {
    this.active_status = this.updatedActiveStatus;
    this.customEmailType = this.updatedCustomEmail;
    this.pendingMessage = false;
    this.showOnSave = false;
    this.updateCustomEmailTemplate();
    this.ShowDiscardModal = false;
  }

  public cancelTabChange(): void {
    this.ShowDiscardModal = false;
    this.showResetDefaultModal = false;
    this.updatedActiveStatus = '';
    this.updatedCustomEmail = '';
  }

  public onChangeCheckbox(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.pendingMessage = target.checked;
    this.customEmailForm.patchValue({
      pendingMessageOnly: this.pendingMessage,
    });
  }

  public sendEmail(): void {
    const formPayloadData: SendCustomEmailDetails = {
      a: '',
      subject: '',
      body: '',
      et_type: '',
    };
    const aCookieValue = this.cookieService.getCookie('a');
    if (aCookieValue) {
      formPayloadData.a = aCookieValue;
    }
    formPayloadData.subject = this.customEmailForm.controls['subject'].value;
    formPayloadData.body = this.customEmailForm.controls['body'].value;
    formPayloadData.et_type = this.customEmailType;
    if (this.customEmailType === 'idle_email' ||this.customEmailType === 'second_channel') {
      this.customEmailService.sendAdminEmailTemplate(this.instituteID, formPayloadData)
      .subscribe((res:AdminEmailTemplateResponse)=>{
        if(res.message) this.showModalMessage(res.status,res.message);
      });
    } else {
      this.customEmailService.sendCustomEmail(formPayloadData).subscribe((res:SendCustomEmailResponse)=>{
        this.showModalMessage(res.status,res.message);
      });
    }
  }

  public createAdminEmailTemplate(): void {
    const formPayloadData: SaveCustomEmailDetails = {
      a: '',
      subject: '',
      body: '',
      et_type: '',
      options: '',
    };
    const aCookieValue = this.cookieService.getCookie('a');
    if (aCookieValue) {
      formPayloadData.a = aCookieValue;
    }
    formPayloadData.subject = this.customEmailForm.controls['subject'].value;
    formPayloadData.body = this.customEmailForm.controls['body'].value;
    formPayloadData.et_type = this.customEmailType;
    if (this.customEmailType === 'idle_email') {
      formPayloadData.options = JSON.stringify({
        frequency: this.customEmailForm.controls['frequency'].value,
        pending_messages_only: this.pendingMessage,
      });
    } else {
      formPayloadData.options = JSON.stringify({
        frequency: this.customEmailForm.controls['frequency'].value,
      });
    }
    this.customEmailService
      .createAdminEmailTemplate(this.instituteID, formPayloadData)
      .subscribe((data) => {
        if (data.status === 'ok') {
          this.emailTemplates = data.email_templates;
          this.restoreDefault = this.setRestoreDefaultDiscard();
          this.pendingMessage = false;
          this.showOnSave = false;
        }
      });
  }

  public restoreToDefault(): void {
    this.showResetDefaultModal = true;
  }

  public restoreDefaultDiscard(): void {
    this.customEmailService
      .deleteEmailTemplate(this.instituteID, this.customEmailType)
      .subscribe((data) => {
        if (data.status === 'ok') {
          this.emailTemplates = data.email_templates;
          this.updateCustomEmailTemplate();
          this.restoreDefault = this.setRestoreDefaultDiscard();
          this.showOnSave = false;
          this.showResetDefaultModal = false;
        }
      });
  }

  public setRestoreDefaultDiscard(): boolean {
    this.currentEmailTemplate = this.emailTemplates.filter((template) => {
      return template.type === this.customEmailType;
    });
    let et_id = this.currentEmailTemplate[0].et_id;
    if (et_id.includes('default')) {
      return false;
    } else {
      return true;
    }
  }
  public cancelRestoreDefault(): void {
    this.showResetDefaultModal = false;
  }

  public cancelpopup(): void {
    this.modalTitleMessage = "" ;
    this.modalShowMessage = "";
    this.showSuccessPopup = false;
  }

  public showModalMessage(title:string,message:string):void{
    this.modalTitleMessage = 'Success' ;
    this.modalShowMessage = 'Email Sent Successfully.';
    this.showSuccessPopup = true;
  }
}
