import { Component, DestroyRef, Input, OnChanges, OnInit } from "@angular/core";
import { InstitutionsService } from "../../../services/institutions.service";
import { Institution, InstitutionResponse, RolesData, WowoFeature, CheckboxOption, WowoFeaturesData } from "../../../modals/institutions.model";
import {FilteredDataMassage, filterSelectedArray} from "../../../modals/institutionsConfig.model";
import { InstitutionHelperService } from "../../../services/institution-helper.service";
import { InstitutionsConfigService } from "../../../services/institutionsConfig.service";
import { map } from 'rxjs/operators';
import { AuthService, CombinedData, updatedFeature,access_group_actions_map, UsersAuthResponse,EditInstitutionResponse,UpdateFeatureData, ClientPermissions  } from "@amsconnect/shared";
import { Subscription } from 'rxjs';
import { AppNavigationService } from "../../../services/app-navigation.service";
import { ActivatedRoute, Router } from "@angular/router";
@Component({
  selector: 'web-messenger-institute-leftpanel',
  templateUrl: './institute-leftpanel.component.html',
  styleUrls: ['./institute-leftpanel.component.css']
})
export class InstituteLeftpanelComponent implements OnInit,OnChanges{
        @Input() institutionId=""; 
        public CheckboxOptionsArray: CheckboxOption[] = [];
        public institutionToggle = false;
        public showModal = false
        public isServiceTeamModal = false;
        public dynamicModalTitle = ""
        public payload = "";
        public enableServiceModalTitle = true;
        public ServiceTeamModalTitle = "";
        public role = "";
        public roles!: string[];
        public isOverRideActive = true;
        public wowoFeaturesData!: WowoFeaturesData;
        public isaddUser = false;
        public deletedRole: string[] = [];
        public wowos:string[]=[];
        public serviceTeamResp!: string[];
        public activeRoles!: string[]; 
        public user!:string[];
        public renamedRoles: string[] = [];
        public institution !: Institution;
        public serviceTeamsDetails !: RolesData;
        public showCheckboxModal = false;
        public UpdatedInstitutionName = "";
        public UpdatedInstitutionShortName = "";
        public wowoFeatureDatas!:{ [key: string]: WowoFeature };
        public overrideModal=false;
        public filteredFeatureData:FilteredDataMassage[]=[];
        public isServiceteam =false;
        public showInstitueEdit=false;
        public showResignServiceModal=false;
        public reassignValueArray!:string[];
        public roleAssign!:string[];
        public updatedReassignValues!:updatedFeature;
        public ValueForReassign!:CombinedData;
        public authSubscription = new Subscription;
        public getALLCurrentUserPermissionList!:access_group_actions_map;
        public prevInstituteName = '';
        public prevInstituteShortName = '';
        public isQuickMessageModal=false;
        public defaultQuickMessage!:boolean;
        public showDefaultQuickMessage=false;
        public defaultQuickMessageArray!:string[] |undefined
        public warningError ="";
        public getAllClientPermissions!: ClientPermissions;
        constructor(private route: ActivatedRoute, private router: Router, private InstitutionService: InstitutionsService,
            private InstitutionHelper: InstitutionHelperService, private InstitutionSrv: InstitutionsConfigService,public authService: AuthService,
            public destroySub: DestroyRef, public navigateSvc: AppNavigationService,) {
            this.destroySub.onDestroy(() => {this.authSubscription.unsubscribe();});
        }
        ngOnInit(): void {
            this.authSubscription = this.authService.authResponseData$.subscribe((response:UsersAuthResponse) => {
                this.getALLCurrentUserPermissionList = response.user?.access_group_actions_map;
                this.getAllClientPermissions = response?.config?.client_permissions;
            })            
        }
        ngOnChanges(): void{
            this.fetchInstitutionDetails();    
          }
        public fetchInstitutionDetails(): void {
            this.InstitutionService.getInstitutionDetails(this.institutionId).subscribe( (data: InstitutionResponse) => {
                this.institution = data.institution;
                this.wowoFeatureDatas=data.institution.wowo_features
                this.wowos=data.institution.wowos;
                this.defaultQuickMessage = !this.institution.macros.length;
                this.defaultQuickMessageArray=this.institution.default_macros
                if (!this.institution.is_dnd_override_enabled)
                    this.isOverRideActive = false;
                    this.isServiceteam = this.institution.wowos.includes('role');
                    this.filterSelectedArray();
            }
        );
        }  
        public fetchInstitutionServiceTeams(institutionId: string, role: string): Promise<RolesData> {
            return new Promise((resolve, reject) => {
                this.InstitutionService.institutionsTeamService(institutionId, role).pipe(
                    map((data: RolesData) => {
                        this.serviceTeamsDetails = data
                        return data;
                    })).subscribe(
                    (data) => {resolve(data);});
                });
        }  
        public navigateTo(destination: string): void {
            this.InstitutionHelper.navigateTo(destination, this.institutionId);
        }
        public open_Modal(data: string): void { 
            this.showCheckboxModal = true;
            const modalInfo = this.InstitutionHelper.openModal(data, this.institution);
            if (modalInfo) {
                this.dynamicModalTitle = modalInfo.dynamicModalTitle;
                this.showModal = modalInfo.showModal;
                this.CheckboxOptionsArray = modalInfo.CheckboxOptionsArray;
                this.payload = modalInfo.postData;
                this.overrideModal = this.dynamicModalTitle !== 'Edit Institution Features'
            }
        }
        public closeCheckboxModal(value: boolean):void{
            this.showCheckboxModal = value;
        }
        public async open_service_modal(data: string): Promise<void> {
            let marcos=[]
            if(data==="quickMessage"){
                marcos=this.institution.macros;
            }   
            else{
            const apiData = await this.fetchInstitutionServiceTeams(this.institutionId, data);
            this.roles = apiData.roles;
            this.roles= apiData.roles.map(role => `${role} |${(apiData.role_pagers.find(item => item.role === role) || {}).pager_number || ''}`).map(entry => entry.replace(/\s*\|$/, ''));
            this.activeRoles=apiData.active_roles;
            this.user=apiData.users;
            }  
            this.isServiceTeamModal = true;   
            switch (data) {
                case 'general':
                    this.ServiceTeamModalTitle = "Edit General Service Team";
                    this.isaddUser = false;
                    this.serviceTeamResp = this.roles;
                    this.role = 'general';
                    break;
                case 'reserved':
                    this.ServiceTeamModalTitle = "Edit Reserved Service Team";
                    this.isaddUser = true;
                    this.serviceTeamResp = this.roles
                    this.role = 'reserved'
                    break;
                case 'integrated':
                    this.ServiceTeamModalTitle = "Edit Integrated Service Team";
                    this.isaddUser = false;
                    this.serviceTeamResp = this.roles
                    this.role = 'integrated';
                    break;    
                case 'restricted':
                    this.ServiceTeamModalTitle = "Edit Restricted Service Team";
                    this.isaddUser = true;
                    this.serviceTeamResp = this.roles
                    this.role = 'restricted';
                    break;
                case 'quickMessage':
                    this.ServiceTeamModalTitle = "Edit Quick Message";
                    this.isaddUser = false;
                    this.serviceTeamResp = marcos;
                    this.isQuickMessageModal=true;
                    break;
            }
        }  
        public openDefaultQuickMessage():void{
            this.showDefaultQuickMessage=true
        }
        public closeDefaultQuickMessage():void{
            this.showDefaultQuickMessage=false
        }
        public closepopup(): void {
            this.showModal = false;
            this.CheckboxOptionsArray = [];
        }  
        public isreportingTags(data: boolean): void {
            this.isServiceTeamModal = data;
            this.isQuickMessageModal=false;
        }  
        public updateRolesArray(arr: string[]): { role: string }[] {
            this.serviceTeamsDetails.role_pagers = this.serviceTeamsDetails.role_pagers.filter(obj => new Set(this.serviceTeamsDetails.roles).has(obj.role));
            arr.forEach(roleString => {
                const roleExists = this.serviceTeamsDetails.role_pagers.some(obj => obj.role === roleString);
                if (!roleExists)this.serviceTeamsDetails.role_pagers.push({ "role": roleString });
            });
            for (let item of this.serviceTeamsDetails.role_pagers) {
                if (item.hasOwnProperty("role") && item["role"].includes("|")) {
                    let roleParts = item["role"].split("|");
                    item["pager_number"] = roleParts[1].trim();
                    item["role"] = roleParts[0].trim();
                } 
            }
            return this.serviceTeamsDetails.role_pagers;
        }
        public onSaveRoles(values: CombinedData): void {
        if(!this.isQuickMessageModal){
            this.ValueForReassign=values;
            const activeRolesDelete = this.activeRoles.filter(value => values.deletedTag.includes(value));
            const activeRolesRename = this.activeRoles.filter(value => values.renamedService.some(obj => value in obj));
            if (activeRolesDelete.length > 0 || activeRolesRename.length > 0) {
              this.showResignServiceModal=true;
              this.reassignValueArray = [...new Set([...activeRolesDelete, ...activeRolesRename])];
              this.roleAssign = this.serviceTeamsDetails.roles.filter(role => !this.reassignValueArray.includes(role));
          } else{ 
            this.updatesInstitutionsRoles(values)
          }
        }else{
            this.setQuickMessage(values.tags)
        }
        }
        public setQuickMessage(quickMessage:string[]):void{     
            this.InstitutionHelper.updateQuickMessageInstitution(this.institutionId,quickMessage).subscribe((responseData: EditInstitutionResponse)=>{
               this.institution=responseData.institution
            });
            this.isQuickMessageModal=false;
            this.isServiceTeamModal = false;       
        }
        public updatesInstitutionsRoles(values:CombinedData,updatedUser?:updatedFeature){
            let updatedRolesArray :{role: string,pager_number?:string}[] = this.updateRolesArray(values.newAddedRoles);
            updatedRolesArray = updatedRolesArray.filter((obj, index, self) =>index ===self.findIndex((innerObj) => obj.role === innerObj.role &&(!obj.pager_number || innerObj.pager_number === obj.pager_number)));
            updatedRolesArray = updatedRolesArray.filter(obj => !values.deletedTag.includes(obj.role));
            updatedRolesArray.forEach(item => item.role = (values.renamedService.find(obj => obj.hasOwnProperty(item.role)) || {})[item.role] || item.role);
            updatedRolesArray = updatedRolesArray.map(item => item.pager_number ? { role: item.role, pager_number: item.pager_number } : item);
            values.renamedService.forEach(pair => {
            let [key, value] = Object.entries(pair)[0];
            updatedRolesArray = updatedRolesArray.map(obj => {
                if (obj.role === key) {let updatedPagerNumber = pair["pager_number"] || obj.pager_number;
                    if (!obj.role.includes('|')) {updatedPagerNumber = undefined; }
                    return {role: value,pager_number: updatedPagerNumber};}return obj;
            });
        });
            updatedRolesArray.forEach(item => item.hasOwnProperty('role') && item['role'].includes('|') && (item['pager_number'] = item['role'].split('|')[1]?.trim() || '') && (item['role'] = item['role'].split('|')[0]?.trim()));
            updatedRolesArray = updatedRolesArray.map(item => "pager_number" in item ? { "role": item.role, "pager_number": item.pager_number } : item); 
            values.renamedService = values.renamedService.map(obj => Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, value.replace(/\s*\|\d+$/, '')])));//remove pager number from renamed
            values.renamedService =  values.renamedService.filter(obj => Object.entries(obj).every(([key, value]) => key !== value));
            updatedRolesArray = updatedRolesArray.filter((obj, index, self) =>index ===self.findIndex((innerObj) =>obj.role === innerObj.role &&(!obj.pager_number || innerObj.pager_number === obj.pager_number)));
            values.deletedTag = values.deletedTag.map(str => str.includes('|') ? str.split('|')[0].trim() : str);
            updatedRolesArray = updatedRolesArray.filter(objB => ! values.deletedTag.includes(objB.role));
            this.InstitutionService.updatesInstitutionsRoles(this.institutionId, this.role, values.renamedService, values.deletedTag, updatedRolesArray,updatedUser).subscribe((data) => {
                this.warningError = data.warnings ? data.warnings[0] : "";
            });
            this.isServiceTeamModal = false;
        }

        public closeWarningPopup():void {
            this.warningError = "";
        }
       

        public updatedOverride(value:string):void { 
            const data = {instituteId: this.institutionId,json: { value }};        
            this.updateInstitutionOnFeatureChange(data);
        }
        public updatedFeature(value: (string | undefined)[]):void { 
            const data = {instituteId: this.institutionId,json:{ "wowos": value }};    
            this.updateInstitutionOnFeatureChange(data);  
        }
        public updateInstitutionOnFeatureChange(featureToUpdated:UpdateFeatureData ): void {
            this.InstitutionSrv.updateFeature(featureToUpdated).subscribe((responseData: EditInstitutionResponse) => {
            this.handleUpdateFeatureSubscription(responseData); });
        }
        public handleUpdateFeatureSubscription(updatedFeature: EditInstitutionResponse): void {
            this.institution = updatedFeature.institution;
            this.fetchInstitutionDetails();
        }
        public onNameChange(event: Event):void {
            this.UpdatedInstitutionName = (event.target as HTMLInputElement).value;
        }
        public onShortNameChange(event: Event):void {
            this.UpdatedInstitutionShortName = (event.target as HTMLInputElement).value;
        }
        public saveInstitutionDetails():void {
            const data = { id: this.institutionId,short_name: this.UpdatedInstitutionShortName ? this.UpdatedInstitutionShortName : this.institution.short_name,
                name: this.UpdatedInstitutionName ? this.UpdatedInstitutionName:this.institution.name
            }; 
            this.InstitutionSrv.editFeature(data).subscribe((responseData: EditInstitutionResponse) => {this.institution=responseData.institution;});this.showInstitueEdit=false;
        } 
        public filterSelectedArray():void {
            let filteredObject :filterSelectedArray= {};
            let newData: FilteredDataMassage[];
            if(this.wowoFeatureDatas){
                Object.keys(this.wowoFeatureDatas).forEach(key => {if (this.wowos.includes(key))filteredObject[key] = { ...this.wowoFeatureDatas[key] }; //remain same 
                else filteredObject[key] = { ...this.wowoFeatureDatas[key], valid: false };
            });
            }
            Object.keys(filteredObject).forEach(key => {filteredObject[key] = {...filteredObject[key],valid: Object.keys(filteredObject).includes(key) && filteredObject[key]?.valid,newkey: key};});
            newData = Object.keys(filteredObject).map((key:string) => ({ key: key,...filteredObject[key],is_sso_enabled: this.institution.is_sso_enabled,institution_id: this.institutionId }));
          this.filteredFeatureData=newData;
        }
        public open_EditInstitute():void{
            this.prevInstituteName = this.institution.name;
            this.prevInstituteShortName = this.institution.short_name;
            this.showInstitueEdit=true;
        };        
        public close_EditInstitute():void{
           this.prevInstituteName =this.institution.name;
           this.prevInstituteShortName = this.institution.short_name;
           this.showInstitueEdit=false;
        }
        public saveReassignChanges(value:updatedFeature):void{
            this.updatedReassignValues=value;
            this.reassignModalApiCall();
        }
        public reassignModalApiCall():void{
              const updatedUser=this.updatedReassignValues;
              this.updatesInstitutionsRoles(this.ValueForReassign,updatedUser)
        }
        public navigateToReportingPage():void {
            this.navigateSvc.navigate([`/institution/reporting`], { queryParams: { institutionName: this.institutionId} });
        }
        public navigateToPermissions():void{
            this.navigateSvc.navigate([`/institution/${this.institutionId}/permissions`]);
        }
        public closeReassignModal(value:boolean):void{
            this.showResignServiceModal=value;
        }
}