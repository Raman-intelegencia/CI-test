
import { PopupServiceService } from "@amsconnect/shared";
import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ComposeHelperService } from "./compose-helper.service";
 
const COMPOSE = "compose";
@Injectable({
  providedIn: "root",
})
export class ComposeService {
    public messageType = {
        externalMessage: "ExternalMessage",
        composeMessage: "InternalMessage",
    };
    public getIdAndtype!: { coverageId: string; type: string; };
    public composePopupValue = this.messageType.composeMessage;
    public coverageId = '';
    constructor(public popUpService: PopupServiceService,public route: ActivatedRoute, public router: Router,public composeHelperService: ComposeHelperService,){}
  
    
    // to add and remove query params to the relative route path
    private updateQueryParams(params: object) {
      const mergedQueryParams = {
          ...this.route.snapshot.queryParams,
          ...params,
      };
    
      this.router.navigate([], {
          relativeTo: this.route,
          queryParams: mergedQueryParams,
      });
    }
    // push the compose form object to array using pop-up service
    public onComposeButtonClickCoverage(): void {
      if (this.composePopupValue === this.messageType.composeMessage) {
          const composeData = { to: [], patient: "", subject: "", message: "" };
          this.popUpService.addComposePopUp(composeData);
      } else {
          const composeData = { to: "", recipient_name: "", message: "" };
          this.popUpService.addExternalComposePopUp(composeData);
      }
    }
    // add the query params to current path
      public addComposeQueryParamsForCoverageId(getIdAndtype:{ coverageId: string; type: string; },messageType: string = this.messageType.composeMessage): void {
        if (messageType == this.messageType.composeMessage) {
            this.getIdAndtype = {coverageId:getIdAndtype.coverageId,type:getIdAndtype.type};
            this.coverageId = getIdAndtype.coverageId;
            this.composeHelperService.setCoverageId(this.coverageId);
                 const queryParams = { [COMPOSE]: this.messageType.composeMessage };
                 this.composePopupValue = this.messageType.composeMessage;                 
                 this.updateQueryParams(queryParams);
                 this.onComposeButtonClickCoverage();
             } else {
                 const queryParams = { [COMPOSE]: this.messageType.externalMessage };
                 this.composePopupValue = this.messageType.externalMessage;
                 this.updateQueryParams(queryParams);
                 this.onComposeButtonClickCoverage();
             }
         }

         public addComposeQueryParamsForUserId( userId: string ,messageType: string = this.messageType.composeMessage): void {
          if (messageType == this.messageType.composeMessage) {
              this.composeHelperService.sendUserIdToCompose(userId);
                   const queryParams = { [COMPOSE]: this.messageType.composeMessage };
                   this.composePopupValue = this.messageType.composeMessage;                 
                   this.updateQueryParams(queryParams);
                   this.onComposeButtonClickCoverage();
               } else {
                   const queryParams = { [COMPOSE]: this.messageType.externalMessage };
                   this.composePopupValue = this.messageType.externalMessage;
                   this.updateQueryParams(queryParams);
                   this.onComposeButtonClickCoverage();
               }
           }

}
