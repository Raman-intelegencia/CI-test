import { CookieService, Macros, ModalComponent, QuickMessagesPayload } from "@amsconnect/shared";
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { DragDropModule } from "@angular/cdk/drag-drop"; 
import { ThreadsService } from "../../services/threads.service";
import { ClientDataSetManager } from "../../services/clientDataSetManager.service";

@Component({
  selector: "web-messenger-quick-messages",
  templateUrl: "./quick-messages.component.html",
  styleUrls: ["./quick-messages.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ModalComponent,
    DragDropModule,
  ],
})
export class QuickMessagesComponent implements OnInit {
  public createbuttonToInput = false;
  public cancelButton = false;
  public messageInputValue!: string;
  public MessageForm: FormGroup;
  public MessageBody!: string;
  public isEditQuickMessage = false;
  public quickMessageIndex!: number; 
  public showDropDown = false;
  public disableQM = false;
  public showSuccessPopup = false;
  public allquickMessages: Macros[] =[];
  public showErrorMessage = "";
  public showVerificationModal = false;
  public selectedQuickMessageId = "";
  public quickMessagePayload !: QuickMessagesPayload;
  public selectedId !:string;
  public disableCreateQuickMessage = false;
  public disableListQuickMessage = false;
  public scrollTop!:number;
  @Output() dataEvent = new EventEmitter<string>(); 
  @ViewChild("editMessageInput") set editMessageInputRef(editMessageInput: ElementRef) {
    if (!!editMessageInput) {
      editMessageInput.nativeElement.focus();
    }
  } 
  @ViewChild("addMessageInput") set addMessageInputRef(addMessageInput: ElementRef) {
    if (!!addMessageInput) {
      addMessageInput.nativeElement.focus();
    }
  }
  constructor( 
    private threadService: ThreadsService,
    private formBuilder: FormBuilder,
    private cookieService: CookieService, 
    private clientDataManagerSvc: ClientDataSetManager
  ) {
    this.MessageForm = this.formBuilder.group({
      body: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    this.getAllQuickMessage(); 
  }
 
  public closeErrorPopup(): void {
    this.showVerificationModal =
      this.showErrorMessage ===
      "Daily limit exceeded, you may try after twelve hours"
        ? false
        : true;
    this.showErrorMessage = "";
  }

  public closeSuccessPopup(): void {
    this.showErrorMessage = "";
    this.showVerificationModal = true;
  }

  public cancelpopup(): void {
    this.showSuccessPopup = false;
  }

  public cancelErrorpopup(): void {
    this.showErrorMessage = "";
  }

  public getAllQuickMessage(): void {
    this.threadService.getQuickMessage().subscribe((data) => {
      if(data && data.status === 'ok'){
        this.clientDataManagerSvc.updateClientDataSet(data);
        this.allquickMessages = data.macros || [];
        this.quickMessageIndex = this.allquickMessages?.length;
      }
    });
  }

  public onChangeTheMessagePosition(event: CdkDragDrop<string[]>): void {
    moveItemInArray(
      this.allquickMessages,
      event.previousIndex,
      event.currentIndex
    ); 
    const aCookieValue = this.cookieService.getCookie("a");
      this.quickMessagePayload = aCookieValue?{
               a: aCookieValue,
               macros: this.allquickMessages,
             }:{};
   
    this.threadService
      .updateQuickMessage(this.quickMessagePayload)
      .subscribe((updateMessage) => {});
  }

  public changeCreatebuttonToInput(): void {
    this.MessageForm.controls["body"].reset();
    this.createbuttonToInput = true;
    this.disableCreateQuickMessage = true
  }
  public CancelMsg(): void {
    this.showDropDown = false;
  }
  public cancelQuickMessage(): void {
    this.cancelButton = true;
  }
  public selectedQuickMessage(msg: string): void {
    this.messageInputValue = msg;
    this.dataEvent.emit(msg);
    this.cancelButton = true;
  }

  public editQuickMessageListToInput(id: string): void { 
    this.selectedId = id; 
    this.allquickMessages.forEach((e: Macros) => {
      if (typeof e === "object") {
        e["edit"] = false;
      }
    });
    this.allquickMessages.filter((data: Macros) => {
      if (id === data.id) {
        data.edit = true;
        this.isEditQuickMessage = data.edit;
        this.MessageBody = data.body;
        this.MessageForm.setValue({ body: this.MessageBody });
      }
    });
    this.disableListQuickMessage = true;
  }

  public backToQuickMessage(id: string): void {
    this.allquickMessages.filter((data:Macros) => {
      if (id === data.id) {
        data.edit = false;
        this.isEditQuickMessage = false;
      }
    }); 
    this.disableListQuickMessage = false; 
  }

  public clearInputAndBack(): void {
    this.createbuttonToInput = false;
    this.disableCreateQuickMessage =false;
  }
  public DeleteTheQuickMessage(): void {
    this.deleteQuickMessage(this.selectedQuickMessageId);
  }

  public deleteQuickMessage(msgId: string): void {
    const body = this.MessageForm.controls["body"].value;
    // eslint-disable-next-line prefer-const
    let formPayload = { body: body, id: msgId };
    const macros = [...this.allquickMessages, formPayload];
    const macrosData = macros.filter(item => item.id !== msgId);
    const aCookieValue = this.cookieService.getCookie("a"); 
    this.quickMessagePayload = aCookieValue?{
          a: aCookieValue,
          macros: macrosData,
        }:{};
    if (this.showSuccessPopup) {
      this.threadService
        .DeleteQuickMessage(this.quickMessagePayload)
        .subscribe((res) => {
          this.getAllQuickMessage();
          this.showSuccessPopup = false;
        });
    }
  }

 public crossPopup():void{ 
  this.showDropDown= false; 
  this.backToQuickMessage(this.selectedId);  
  this.clearInputAndBack();
  }

  public DeletePopup(id: string): void {
    this.showSuccessPopup = true;
    this.selectedQuickMessageId = id;
  }

  public onPresstheNumber(event: KeyboardEvent): void { 
    for (let i = 1; i <= 9 && i < this.allquickMessages.length + 1; i++) {
      const items = this.allquickMessages[this.allquickMessages.length - 1 - i + 1];
      const item = items.body;
      if (event.key == i.toString()) {
        this.dataEvent.emit(item);
        this.cancelButton = true;
        this.disableQM = true;
      }
    }
  }

  public closedropdown(): void {
    this.cancelButton = !this.cancelButton;
    this.showDropDown = true;
  }

  public showQuickMsg(): void {
    this.cancelButton = false;
    if (!this.MessageForm.controls["body"].value) {
      this.disableQM = false;
    }
  }

  public isDuplicateText(newText: string): boolean {
    // Implement logic to check for duplicate body text
    const normalizedText = newText.toLowerCase();
    return this.allquickMessages.some((item:Macros) => item.body.toLowerCase() === normalizedText);
  }

  public CreateQuickMessage(): void {
    const body = this.MessageForm.controls["body"].value;
    if (!this.isDuplicateText(body)) {
      // eslint-disable-next-line prefer-const
      let formPayload = { body: body, id: "" };
      const macros = [formPayload, ...this.allquickMessages]; 
      const aCookieValue = this.cookieService.getCookie("a");    
       this.quickMessagePayload = aCookieValue?{
          a: aCookieValue,
          macros: macros,
        }:{}; 
      this.threadService
        .updateQuickMessage(this.quickMessagePayload)
        .subscribe((updateMessage) => { 
          this.createbuttonToInput = false; 
          this.MessageForm.reset();
          this.disableCreateQuickMessage =false;
          this.getAllQuickMessage();
        });
    } else {
      this.showErrorMessage = "Message already Exist.";
    }
  }

  public saveEditedQuickMessage(id: string, i: number): void {
    const body = this.MessageForm.controls["body"].value;
    const index = this.allquickMessages.findIndex((item:Macros) => item.id === id);
    if (!this.isDuplicateText(body)) {
      if (index == i) { 
        this.allquickMessages[i] ={ body: body, id: id }; 
        const macros = this.allquickMessages;
        const aCookieValue = this.cookieService.getCookie("a"); 
    this.quickMessagePayload =aCookieValue?{
          a: aCookieValue,
          macros: macros,
        }:{}; 
        this.threadService
          .EditQuickMessage(this.quickMessagePayload)
          .subscribe((updateMessage) => { 
              this.allquickMessages = updateMessage?.macros || [];  
          });
        this.createbuttonToInput = false;
        this.isEditQuickMessage = false; 
        this.disableListQuickMessage = false;
      }
    } else {
      this.showErrorMessage = "Message already Exist.";
    }
  }

 public trackByMessageId(index: number, message: Macros): string {
    return message.id; // Assuming each message has a unique identifier property named 'id'
  }
}
