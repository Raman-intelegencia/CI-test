import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'web-messenger-auto-response-model',
  templateUrl: './auto-response-model.component.html',
  styleUrls: ['./auto-response-model.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, ReactiveFormsModule,]
})
export class AutoResponseModelComponent {
  @Output() customAutoResponseEvent = new EventEmitter<string>();
  @Output() autoResponseFormResponseEvent = new EventEmitter<string>();
  @Output() showAutoResponsePopupEvent = new EventEmitter<boolean>(); 
  public customAutoResponse = "";
  @Input() showAutoResponsePopup = false;
  public autoResponse: string | undefined;
  public isCustomResponseEnabled = false;
  public autoResponseForm!: FormGroup;
  @Input() selectedStatus = "";
  constructor(public fb: FormBuilder) {
    this.autoResponseForm = this.fb.group({
      autoResponse: ["default", [Validators.required]],
    }); 
  }


  public selectedAutoResponse(option: string): void {
    switch (option) {
      case "default":
        this.customAutoResponse = ''; 
        this.isCustomResponseEnabled = false;
        break;
      case "custom":
        this.customAutoResponse = '';
        this.isCustomResponseEnabled = true;
        // Enable the input field for custom response
        break;
      case "disable":
        this.customAutoResponse = '';
        // Logic for disabling the auto response 
        this.isCustomResponseEnabled = false;
        break;
      default:
        break;
    }
  }

  public saveAutoResponse(event: Event): void {
    event.stopPropagation();
    this.autoResponse = this.customAutoResponse;
    const currentValue = this.autoResponseForm.controls["autoResponse"].value;
    this.autoResponseFormResponseEvent.emit(currentValue);
    if (currentValue === "default") { 
      this.autoResponse = this.selectedStatus === 'busy' ? `I am busy. ` : `I am off duty.`
    }
    if (currentValue === "custom" && this.customAutoResponse !== currentValue) {
      this.customAutoResponse = currentValue;
    } else if (currentValue !== "custom") {
      this.customAutoResponse = "";
    }
    if (currentValue === "disable") {
      this.autoResponse = "Disabled";
    }
    this.showAutoResponsePopup = false;
    this.showAutoResponsePopupEvent.emit(false); 
    this.customAutoResponseEvent.emit(this.autoResponse);
  }

  public enableDisablefn(event:Event): void {
    event.stopPropagation();
    this.showAutoResponsePopup = !this.showAutoResponsePopup;
    this.showAutoResponsePopupEvent.emit(this.showAutoResponsePopup);
  }
}
