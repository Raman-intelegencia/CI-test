import { Component, Input } from '@angular/core';
import { AppNavigationService } from '../../../services/app-navigation.service';

@Component({
  selector: 'web-messenger-event-logs',
  templateUrl: './event-logs.component.html',
  styleUrls: ['./event-logs.component.scss']
})
export class EventLogsComponent {
  @Input() instituteId = "";
  public typeOfEventLogsData ="institueEventLogs"; 
  
  constructor(
    public navigateSvc: AppNavigationService,
  ) {}
  
  public backToInstitutionDetails(){
    this.navigateSvc.navigate([`/institution/${this.instituteId}`]);
  }

}
