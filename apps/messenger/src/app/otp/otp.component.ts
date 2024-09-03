import { AuthService, AuthUser, CookieService, OtpService, UsersAuthResponse } from '@amsconnect/shared';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
@Component({
  selector: "web-messenger-otp",
  templateUrl: "./otp.component.html",
  styleUrls: ["./otp.component.scss"],
})
export class OtpComponent implements OnInit, OnDestroy{

  public showVerificationModal = false;
  public showOTPModal = false;
  public showErrorMessage = ""; 
  public otpValue ="";
  public display: any;
  public enableVerifyOtpButton = false;
  public cell_phone ='';
  public showSuccessPopup = false;
  private timerSubscription!: Subscription;
  public authResponse!: UsersAuthResponse;
  public authUser!: AuthUser;
  public subscription: Subscription = new Subscription;
  public verificationText = " ";
  constructor(
    private otpService: OtpService,private authService:AuthService,private cookieService:CookieService, private translateSvc: TranslateService ){
  }

  ngOnInit(): void {
      this.usersAuth();   
  }

  // user auth api call
  public usersAuth(): void {
   this.subscription = this.authService.authResponseData$.subscribe(
      (authResponse: UsersAuthResponse) => {
        this.authResponse = authResponse;
        if (authResponse.status !== "error") {
          this.authUser = authResponse.user;          
          const isCellphoneVerified =
            authResponse?.user?.cellphone_verify || false;
          const parentInstPermission =
            authResponse?.config?.client_permissions?.is_cellphone_verification_enabled || false;
          const childInstPermission =
            authResponse?.config?.client_permissions?.cellphone_verification ||
            false;
          const userPermission = authResponse?.user?.sms_comm || false;
          const isTempPassword = authResponse?.user?.is_temp_password || false;
          const getOTPReminder = this.cookieService.getCookie('otp_reminder'); 
          const cellphoneReverify = (typeof authResponse?.user?.cellphone_reverify !== 'undefined') ? authResponse?.user?.cellphone_reverify : false;
           if (
            parentInstPermission &&
            childInstPermission &&
            userPermission &&
            !isCellphoneVerified &&
            !isTempPassword && !getOTPReminder && !cellphoneReverify
          ) { 
            this.showOTPModal = true; 
            this.verificationText = 'You have successfully logged into AMS Connect. Please verify your cell phone number.';
          } 
         else if (parentInstPermission &&  childInstPermission &&  userPermission && !isCellphoneVerified && !isTempPassword && !getOTPReminder && cellphoneReverify){
            this.showOTPModal = true;
            this.verificationText = 'For security and compliance please verify your cell phone number now.';
          }
          else{
            this.showOTPModal = false;
          }
        }  
      }
    );
  }
  
  // send otp api call and show model based on reponse
  public  sendOTP():void{
    if (this.authUser) {
      const { cell_phone, _id, profile } = this.authUser;
      this.cell_phone = cell_phone ? cell_phone : '';
      if (_id?.$oid && profile?.iid) {
        const otpPayload = new FormData();
        otpPayload.append("user_id", _id?.$oid);
        otpPayload.append("iid", profile?.iid);
        this.authService.send_otp(otpPayload).subscribe((otpResponse) => {
          const { status, message, error } = otpResponse;
          this.showVerificationModal = true;
          status === "ok"; 
          if(this.showVerificationModal){
            this.showTimer();
          }
          this.showErrorMessage = status ? message || error : "";
          this.showOTPModal = false;
        });
      } 
    }
  }

  // verify otp api call once otp is entered and show the relevant pop-up
  public verifyOTP(): void {
    this.otpService.verifyOtp(this.otpValue,this.authUser)
      .subscribe((success) => {
        this.showSuccessPopup = success.status === 'ok' ? true : false;
        this.showVerificationModal = !this.showSuccessPopup;
        this.showErrorMessage = success.status === 'error' ? success.message : '';
        if (this.showSuccessPopup) {
          this.showOTPModal = false;
        }
      });
  }
  
  // start the timer function and subscribe to it 
  public showTimer():void{
    this.otpService.startTimer(1);  // start timer for 1 minute
    this.timerSubscription = this.otpService.remainingSeconds$.subscribe(seconds => {
      this.display = seconds;

      if (seconds === 0) {
        this.display = undefined;
      }
    });
  }

  // close error pop-up
  public closeErrorPopup(): void {
    this.showVerificationModal =
      this.showErrorMessage ===
      "Daily limit exceeded, you may try after twelve hours"
        ? false
        : true;
    this.showErrorMessage = "";
    this.display = undefined;
    this.otpValue = "";
    this.enableVerifyOtpButton = false;
    this.showOTPModal = false;
  }

  // close success pop-up
  public closeSuccessPopup(): void {
    this.showErrorMessage = "";
    this.showVerificationModal = false;
    this.showSuccessPopup = false;
    this.showOTPModal = false;
  }

  public cancelErrorpopup(): void {
    this.showErrorMessage = "";
  }

  public cancelSuccesspopup(): void {
    this.showSuccessPopup = false;
  }

  onKeyDown(event: KeyboardEvent) {
    // Allow only numbers and specific control keys

    const allowedKeys = [
      "Backspace",
      "Tab",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
    ];
    if (!event.key.match(/^\d$/) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }
  
  public onInput(): void {
    this.enableVerifyOtpButton = this.otpValue.length === 6;
  }

  public verifyOTPLater():void{
    this.cookieService.createCookie('otp_reminder',false)
    this.showOTPModal = false;
    this.showVerificationModal = false;
  }
  // unsubscribe to the timer subscription
  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.otpService.stopTimer();
    this.subscription.unsubscribe();
  }
}