import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { AuthUser, ClientPermissions } from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private userId = new BehaviorSubject("");
  userId$ = this.userId.asObservable();

  private userIndex = new BehaviorSubject("");
  userIndex$ = this.userIndex.asObservable();

  private userType = new BehaviorSubject("");
  userType$ = this.userType.asObservable();

  private userPermissions = new BehaviorSubject({});
  userPermissions$ = this.userPermissions.asObservable();

  private imageUrlPath = new BehaviorSubject("");
  imageUrlPath$ = this.imageUrlPath.asObservable();

  private imageIdSubject = new BehaviorSubject("");
    imageId$ = this.imageIdSubject.asObservable();

  public setUserId(userId: string): void {
    this.userId.next(userId);
  }

  public setUserIndex(userIndex: string): void {
    this.userIndex.next(userIndex);
  }

  public setUserType(userType: string): void {
    this.userType.next(userType);
  }

  public setUserPermissions(userPermissions: ClientPermissions): void {
    this.userPermissions.next(userPermissions);
  }

  public setImageUrlPath(imageUrlPath:string):void{
    this.imageUrlPath.next(imageUrlPath)
  }

  public setImageId(imageId: string): void {
    this.imageIdSubject.next(imageId);
  }

  public getUserId():string{
    return this.userId.getValue();
  }

  public getUserType(user?: AuthUser): "admin" | "basic" | "prime" {
    if ("admin" in (user || {})) {
      return "admin";
    }
    if (user?.flag_basic) {
      return "basic";
    }
    return "prime";
  }
}
