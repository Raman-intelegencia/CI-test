import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from "rxjs";
import { ErrorMessageService } from '../../../services/account-services/error.service';
import { CommonModule } from "@angular/common";
import { ModalComponent } from '../modal/modal.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'amsconnect-error',
  template: `
  <ng-container *ngIf="connectionErrorFlag === true">
    <p [ngClass]="connectionErrorFlag == true ? 'bg-neutral-100 text-center text-sm text-neutral rounded-sm' : 'p-1'"
      [innerHTML]="connectionError">{{connectionError}}</p>
  </ng-container>

  <ng-container *ngIf="errorMessageFlag === true">
    <p [ngClass]="errorMessageFlag == true ? 'bg-neutral-100 text-center text-sm text-neutral rounded-sm' : 'p-1'"
      [innerHTML]="errorMessage">{{errorMessage}}</p>
  </ng-container>

<ng-container *ngIf="successErrorFlag === true">

<input type="checkbox" [id]="id" class="modal-toggle" checked />

<div class="modal bg-black/70 z-50">
  <div
    class="modal-box max-w-xl bg-white dark:bg-black rounded p-0 relative overflow-y-hidden dark:border-primary/60 dark:border dark:shadow-xl dark:shadow-primary/20">
    <div class="flex justify-between text-white items-center bg-primary p-3">
      <h3 class="font-bold dark:text-white">Error</h3>
      <label [for]="id" class="w-7 h-7">
      <button type="button" (click)="closeSuccessMessagePopup()">
        <em class="ph-bold ph-x cursor-pointer text-xl hover:text-accent"></em>
      </button>  
      </label>
    </div>
    <div class="p-4 text-gray-600 dark:text-base-100 text-sm max-h-[60vh] overflow-y-auto">
      <p class="text-lg">{{successError}}</p>
      <div class="flex justify-end items-center mt-4 px-2">
        <button type="button" (click)="closeSuccessMessagePopup()"
          class="bg-base-100 hover:bg-base-300 text-primary py-1 px-3 rounded inline-flex items-center mr-4">
        {{'close' | translate}}
    </button>
      </div>
    </div>
  </div>
</div>
</ng-container>
  `,
  standalone:true,
  imports: [CommonModule,ModalComponent,TranslateModule]
})
export class ErrorComponent  implements OnInit, OnDestroy{
  private subscription: Subscription[] = [];
  public errorMessage = "";
  public errorMessageFlag:boolean = false;
  public connectionError = "";
  public connectionErrorFlag:boolean = false;
  public successError = ""; 
  public successErrorFlag:boolean = false; 
  public id!: string;
  constructor(private errorMessageService: ErrorMessageService) {}

  ngOnInit(): void {
    this.connnectionErrorMessage();
    this.showErrorMessage();
    this.successErrorMessage();
  }

  public closeEditModalPopup(id: string): void {
    let checkbox = document.getElementById(id) as HTMLInputElement;
    if (checkbox) {
      if (checkbox.type === 'checkbox') { 
        checkbox.checked = !checkbox.checked; 
      }
    }
  }

  public connnectionErrorMessage(): void {
    const sub = this.errorMessageService.ConnectionErrorResponse$.subscribe(
      (state) => {
        this.connectionErrorFlag = true;
        this.connectionError = state
      }
    );
  } 

  public showErrorMessage(): void { 
    const subs = this.errorMessageService.errorResponse$.subscribe(
      (state) => {
        this.errorMessageFlag = true;
        this.errorMessage = state
      }
    ); 
    this.subscription.push(subs);
  }

  public successErrorMessage(): void { 
    const subs = this.errorMessageService.SucsessErrorResponse$.subscribe(
      (state) => {
        if(state){
          this.successErrorFlag = true;
          this.id='error';
          this.successError = state
        }
        else{
          this.successErrorFlag=false;
        }
      }
    );
    this.subscription.push(subs);
  }

  public closeErrorMessagePopup(): void {
    this.errorMessageFlag = false;
  }

  public closeConnectionPopup(): void {
    this.connectionErrorFlag = false;
  }

  public closeSuccessMessagePopup(): void {
    this.successErrorFlag = false; 
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }
  
}
