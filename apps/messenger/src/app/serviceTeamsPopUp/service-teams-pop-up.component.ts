import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormatServiceTeamPipe, Reference, UserService } from "@amsconnect/shared";
import { UserProfileModalComponent } from "../messages/user-profile-modal/user-profile-modal.component";
import { TranslateModule } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { ComposeHelperService } from "../../services/compose-helper.service";
import { ComposeService } from "../../services/compose.service";

@Component({
    selector: "web-messenger-service-teams-pop-up",
    standalone: true,
    templateUrl: "./service-teams-pop-up.component.html",
    styleUrls: ["./service-teams-pop-up.component.scss"],
    imports: [CommonModule, UserProfileModalComponent, TranslateModule, FormatServiceTeamPipe]
})
export class ServiceTeamsPopUpComponent implements OnInit, OnDestroy,OnChanges {
  @Input() selectedService!: Reference;
  @Input() showServiceModal =false;
  @Output() closeServiceTeamComposeModal = new EventEmitter(false);
  private subscription!: Subscription;
  public showProfileModal = false;
  public selectedUserId = "";
  public imageUrlPath = "";
  public maxLength = 27;

  constructor(private userService: UserService, public composeHelperService:ComposeHelperService, public composeService:ComposeService
    ){}
    ngOnChanges(changes: SimpleChanges): void {
      if (changes) {
        this.showServiceModal = changes?.['showServiceModal']?.currentValue;
        this.selectedService = changes?.['selectedService']?.currentValue;
        this.composeHelperService.setUserProfileData(this.selectedService);
      }
    }

  ngOnInit(): void {
    this.subscription = this.userService.imageUrlPath$.subscribe(imageUrlPath => this.imageUrlPath = imageUrlPath)
  }


  public openProfilePopUp(event: Event, selectedUserId: string): void {
    this.showProfileModal = true;
    this.selectedUserId = selectedUserId;
    event?.stopPropagation();
  }

  public sendServiceTeamId():void {
    let userId = this.selectedService.id;
    this.addComposeQueryParamsForUserId(userId);
    this.showServiceModal = false;
  }

  public getImageUrl(image_id: string): string {
    return this.imageUrlPath + image_id + "_profile.png";
  }

  public getInitials(
    firstName: string | null | undefined,
    lastName: string | null | undefined
  ): string {
    return `${firstName ? firstName.charAt(0).toUpperCase() : ""}${
      lastName ? lastName.charAt(0).toUpperCase() : ""
    }`;
  }

  public addComposeQueryParamsForCoverageId(getIdAndtype:{ coverageId: string; type: string; },messageType = "InternalMessage"): void {
    this.composeHelperService.setCoverageId(getIdAndtype.coverageId);
    this.composeService.addComposeQueryParamsForCoverageId(getIdAndtype,messageType);
    this.showServiceModal = false;
  }
  
  public addComposeQueryParamsForUserId(userId: string,messageType = 'InternalMessage'): void {
  this.composeService.addComposeQueryParamsForUserId( userId,messageType);
  this.showServiceModal = false;
  }

  public showUserProfile(showProfileModal: boolean): void {
    this.showProfileModal = showProfileModal;
  }
  public closeServiceModal(): void {
    this.selectedService = {} as Reference;
    this.showServiceModal = false;
    this.closeServiceTeamComposeModal.emit(false);
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
