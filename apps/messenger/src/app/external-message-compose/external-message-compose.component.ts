import { ComposeMessageService, ExternalComposeData, FormStates, PopupServiceService, ThreadResponse, UserService, externalComposeArray, ModalComponent } from "@amsconnect/shared";
import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter, HostListener, ViewChild, ElementRef, OnInit, OnDestroy, OnChanges, AfterViewInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { QuickMessagesComponent } from "../quick-messages/quick-messages.component";
import { ProfileStatusHelperService } from "../../services/profile-status-helper.service";
import { ComposeHelperService } from "../../services/compose-helper.service";
@Component({
    selector: "web-messenger-external-compose",
    templateUrl: "./external-message-compose.component.html",
    styles: [""],
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, ModalComponent, DragDropModule, QuickMessagesComponent],
})
export class ExternalMessageComposeComponent implements OnInit, OnDestroy, OnChanges,AfterViewInit {
    @Input() composeArrayIndex = 0;
    @Input() composeArrayLength = 0;
    @Input() composePopupObjectData: externalComposeArray = {
        department: "",
        to: "",
        recipient_name: "",
        id: 0,
        minimized: false,
    };
    @Output() closeComposePopup = new EventEmitter<void>();
    @ViewChild("toSearchInput") toSearchInput!: ElementRef;
    @ViewChild("textareaInputField") textareaInputField!: ElementRef;
    public composeForm: FormGroup;
    private subscription!: Subscription;
    public userId = "";
    public showUrgentMessage = false;
    public showErrorMessage = "";
    public formStates: FormStates = {
        isInputFocused: false,
        isPatientInputFocused: false,
        collapseVisible: true,
        isUrgent: false,
        isMessageFocused: false,
        showDiscardModal: false,
        showErrorModal: false,
    };
    public composeData: ExternalComposeData = {
        phoneNumberDataList: [],
        currentIndex: 0,
    };
    public createThreadApiCall = false;
    constructor(private composeService: ComposeMessageService, private formBuilder: FormBuilder, private popUpService: PopupServiceService, private userService: UserService,private profileStatusHelperServ:ProfileStatusHelperService, private composeHelperService:ComposeHelperService) {
        this.composeForm = this.formBuilder.group({
            department: "",
            to: "",
            recipient_name: "",
            message: ["", Validators.required],
            enterToSend: false,
        });
    }

    ngAfterViewInit() {
        this.toSearchInput.nativeElement.focus();
        }

    numberOnly(event:any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57) && (charCode !== 43 || charCode !== 45)) {
          return false;
        }
        return true;
      }

    public ngOnChanges(): void {
        this.composeData.currentIndex = this.composeArrayIndex;
        this.formStates.collapseVisible = !this.composePopupObjectData["minimized"];
    }

    public ngOnInit(): void {
        this.subscription = this.userService.userId$.subscribe((userId) => (this.userId = userId));
        this.composeFormControls["enterToSend"].setValue(this.validateAndPost());
        this.getHeight()
    }

    public adjustOverflowY(): void {
      const textarea: HTMLTextAreaElement = this.textareaInputField.nativeElement;
      this.composeHelperService.commonAdjustOverflowY(textarea);
    }
    public getHeight(): number {
        const inputElement = document.getElementById('message') as HTMLTextAreaElement | null;
    
        if (inputElement) {
          return inputElement.scrollHeight;
        }
        // Default height if the element is not found or not rendered yet
        return 0;
      }
      public getStyle(): { 'height.px': number } {
        const inputElement = document.getElementById('message') as HTMLTextAreaElement | null;
        return { 'height.px': this.getHeight() };
      }
      @HostListener("document:keypress", ["$event"])
      handleKeyboardEvent(event: KeyboardEvent) {
          if (
              event.key === "Enter" &&
              this.composeFormControls["enterToSend"].value &&
              this.composeFormControls["message"].value.trim() !== "" &&
              this.composeFormControls["to"].value.trim() !== "" &&
              this.composeFormControls["recipient_name"].value.trim() !== ""
          ) {
              this.createThread();
          }
      }
      
      public handleEnterKeyboardEvent(event: Event): void {
        const keyboardEvent = event as KeyboardEvent;
        const enterToSend = this.composeFormControls["enterToSend"]?.value;
        const recipient = this.composeFormControls["to"]?.value.length
        
        if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
          event.preventDefault();
          if (enterToSend && this.composeFormControls["message"].value.trim() !== "" && recipient) {
            this.createThread();
          }
          else if(!enterToSend){
            this.moveCursorToNextLine();
          }
        }
      }

      public moveCursorToNextLine(): void {
        const textarea = document.getElementById('message') as HTMLTextAreaElement | null;
        if (textarea) {
          const currentCursorPosition = textarea.selectionStart;
          const textBeforeCursor = textarea.value.substring(0, currentCursorPosition);
          const textAfterCursor = textarea.value.substring(currentCursorPosition);
    
          const newText = `${textBeforeCursor}\n${textAfterCursor}`;
          this.composeForm.get('message')?.setValue(newText);
          // Move the cursor to the beginning of the next line
          const newCursorPosition = currentCursorPosition + 1;
          textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }
      public onInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement | null;
        if (target) {
          let value = target.value;
          // Check if the last character is a newline
          if (value.endsWith('\n')) {
            // Remove the last character
            value = value.slice(0, -1);
            // Update the textarea value without the newline
            target.value = value;
          }
          // Update your form control with the modified value
          this.composeForm?.get('message')?.setValue(value);
      
          // Adjust the textarea height
          target.style.height = 'auto'; // Reset height to auto
          target.style.height = target.scrollHeight + 'px'; // Set the updated height
        }
      }

    public validateAndPost():boolean{
        const enterToSendValue = localStorage.getItem(`${this.userId}_quick_send`);
   return (enterToSendValue) ? JSON.parse(enterToSendValue):false;
    }

    public get composeFormControls():{[key:string]:AbstractControl} {
        return this.composeForm.controls;
    }

    public setQuick_send():void{
        localStorage.setItem(`${this.userId}_quick_send`, JSON.stringify(!this.composeFormControls['enterToSend'].value));
      }

    public toggleCollapse(): void {
        !this.composePopupObjectData["minimized"] && this.composeData.currentIndex === 0
            ? (this.formStates.collapseVisible = !this.formStates.collapseVisible)
            : this.popUpService.swapComposePopUps(this.composeData.currentIndex);
    }

    public updateDataValue(key: keyof externalComposeArray, value: string): void {
        this.popUpService.updateExternalComposePopUp(key, value);
    }

    // create thread api call
    public createThread(): void {
      if(this.createThreadApiCall){
        return;
      }
      this.createThreadApiCall = true; // Indicate that an API call is now in progress
      this.composeService.createExternalThread(this.composeForm.value)
      .subscribe({
        next:(response) => {        // Success handling
          const result = response;
          this.closeComposePopup.emit();
          this.profileStatusHelperServ.setShowHideUserProfileFlag(false);
        },
        error: (error) => {
          console.error('Error creating new thread:', error); // Error handling
          this.showErrorMessage = error?.message ? error.message: "";
          this.formStates.showErrorModal = true;
        },
        complete: () => {
          this.createThreadApiCall = false   // Reset the API call flag on completion
        }
      })
    }

    // close the compose pop-up by emitting closePopup event
    public closePopup(): void {
        this.composeForm.controls['recipient_name'].value || this.composeForm.controls['message'].value ? (this.formStates.showDiscardModal = true) : this.closeComposePopup.emit();
    }

    public confirmDiscard(): void {
        this.formStates.showDiscardModal = false;
        this.closeComposePopup.emit();
    }

    // unsubscribe the subscription to prevent data leaks
    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public selectedQuickMessage(data: string): void {
        this.composeFormControls["message"].setValue(data);
        this.composeFormControls["enterToSend"].setValue(true);
        this.composeFormControls["to"].value.trim() !== "" ? this.createThread() : "";
    }
}
