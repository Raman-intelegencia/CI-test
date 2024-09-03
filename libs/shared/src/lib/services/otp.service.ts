import { AuthService, AuthUser} from "@amsconnect/shared";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, map, of, tap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class OtpService {
  private remainingSecondsSubject: BehaviorSubject<number> =
    new BehaviorSubject(0);
  remainingSeconds$: Observable<number> =
    this.remainingSecondsSubject.asObservable();
  private timerInterval: any;
  public showVerificationModal = false;
  public showSuccessPopup = false;
  public showErrorMessage = "";
  public showOTPModal = false;

  constructor(private authService: AuthService) {}


  public verifyOtp(otpValue: string,authResponse: AuthUser): Observable<{status:string,message:string}> {
    const { _id, profile } = authResponse || {};
    const otpPayload = new FormData();
    otpPayload.append("user_id", _id?.$oid);
    otpPayload.append("iid", profile?.iid);
    otpPayload.append("otp", otpValue);

    if (_id?.$oid && profile?.iid && otpValue) {
      return this.authService.verify_otp(otpPayload).pipe(
        tap(({ message, status }) => {
          this.showErrorMessage = message || "";
          this.showVerificationModal = !this.showErrorMessage;
          this.showSuccessPopup = status === "ok";
          if (this.showSuccessPopup) {
            this.showVerificationModal = false;
            this.showOTPModal = false;
          }
        }),
      );
    } else {
      return of({status:'',message:''});
    }
  }

  public startTimer(minutes: number): void {
    let remainingSeconds = minutes * 60;
    this.remainingSecondsSubject.next(remainingSeconds);

    this.timerInterval = setInterval(() => {
      remainingSeconds--;
      this.remainingSecondsSubject.next(remainingSeconds);

      if (remainingSeconds === 0) {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  public stopTimer(): void {
    clearInterval(this.timerInterval);
    this.remainingSecondsSubject.next(0);
  }
}
