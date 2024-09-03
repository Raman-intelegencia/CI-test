/* eslint-disable @angular-eslint/no-input-rename */

import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: "web-messenger-modal",
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.scss"],
  standalone:true,
  imports: [CommonModule,FormsModule, ReactiveFormsModule, TranslateModule]
})
export class ModalComponent {
  constructor(public router: Router){}

  @Input({ required: true,alias: 'modalId'})
  id!: string;
  @Input({ required: true,alias: 'modalTitle'})
  title!: string;
  @Input({ required: true,alias: 'modalMessage'})
  message!: string | string[];
  @Input({ required: true,alias: 'modalCloseText'})
  closeText!: string;
  @Output() closePopup: EventEmitter<void> = new EventEmitter<void>();
  @Input()
  cancelText!: string;
  @Output() cancelPopup: EventEmitter<void> = new EventEmitter<void>();
  @Input({ required: false,alias: 'showCancelButton'})
  showCancel=false;
  @Input({required: false}) 
  closeIsDestructive = false;
  @Input({required: false}) totalChatThreads = 0;
  @Input ({required: false}) showYesArchiveAllButton = false;

  @Input ({required: false}) showNavigationLink:boolean = false;
  @Input ({required: false}) jobID!:string;

  @Input ({required: false}) boldText = true;

  @Input ({required: false}) showConfirmationField = false;
  @Input({required: false}) confirmationFieldHint: string = "";
  @Input({required: false}) confirmationFieldRequiredInput: string | undefined = undefined;

  @Input({ required: false }) overrideHeaderBgClass: string | undefined = undefined;

  public confirmationText!: string;

  public navigateToSomePage():void{
    this.router.navigate([`/job/${this.jobID}`]);
  }

  protected readonly close = close;
}
