import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InstitutionsService } from '../../../../../services/institutions.service';
import { InstitutionService } from '@amsconnect/shared';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'web-messenger-email-settings',
  templateUrl: './email-settings.component.html',
  styleUrls: ['./email-settings.component.css'],
})
export class EmailSettingsComponent implements OnInit, OnDestroy {
  public emailSettingsForm: FormGroup;
  public recipients: string[] = [];
  public hasLoaded = false;
  public isRateLimited = false;

  constructor(
    private formBuilder: FormBuilder,
    private InstitutionService: InstitutionsService
  ) {
    this.emailSettingsForm = this.formBuilder.group({
      recipientEmail: "",
      interval: 1,
      unit: "Day"
    })
  }

  public async ngOnInit() {
    const priorConfig = (await firstValueFrom(this.InstitutionService.getEmailReportConfig())).data;
    for (const email of priorConfig.recipientEmailAddresses ?? []) {
      this.recipients.push(email);
    }
    if (priorConfig.interval) {
      this.emailSettingsForm.get('interval')?.setValue(priorConfig.interval);
    }
    if (priorConfig.intervalUnit) {
      this.emailSettingsForm.get('unit')?.setValue(priorConfig.intervalUnit);
    }
    this.hasLoaded = true;
  }

  public ngOnDestroy() {
    this.InstitutionService.updateEmailReportConfig({
      recipientEmailAddresses: this.recipients,
      interval: parseInt(this.emailSettingsForm.get("interval")?.value as string),
      intervalUnit: this.emailSettingsForm.get("unit")?.value
    }).subscribe();
  }

  public get numbers(): number[] {
    switch (this.emailSettingsForm.get("unit")?.value) {
      case "Day":
        return Array.from({length: 27}, (_, i) => i + 1);
      case "Hour":
        return Array.from({length: 23}, (_, i) => i + 1);
      default:
        return [];
    }
  }

  public onEmailFormSubmit = () => {
    const input = this.emailSettingsForm.get("recipientEmail")?.value as string | undefined;
    const emails = input?.split(/[\n, ]/);
    emails?.forEach(email => {
      const trimmedEmail = email.trim();
      if (trimmedEmail !== "") {
        this.recipients.push(trimmedEmail);
      }
    });
    this.emailSettingsForm.get("recipientEmail")?.reset("");
  }

  public sendToMeNow = async () => {
    this.isRateLimited = false;
    const response = await firstValueFrom(this.InstitutionService.sendEmailReportToUser());
    if (response.message === "rate limited") {
      this.isRateLimited = true;
      setTimeout(() => {
        this.isRateLimited = false;
      }, 5000);
    }
  }

  public removeRecipientEmail(email: string): void {
    this.recipients = this.recipients.filter(value => value !== email);
  }
}
