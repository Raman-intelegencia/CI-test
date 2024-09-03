import { Component, OnInit } from '@angular/core';
import { ScheduledStatusService } from '../../services/schedule-status.service';
import { AuthService, UserService, UsersAuthResponse } from '@amsconnect/shared';
import { Subscription } from 'rxjs';
import { User } from '../../models/schedule-status.model';

@Component({
  selector: 'web-messenger-scheduled-status-popup',
  templateUrl: './scheduled-status-popup.component.html',
  styleUrls: ['./scheduled-status-popup.component.scss'],
})
export class ScheduledStatusPopupComponent implements OnInit {
  public userId = "";
  private subscription: Subscription = new Subscription();
  public scheduledStatus !: User[];
  public showScheduledStatus = false;
  public showScheduleStatusHeading = '';
  public showScheduledNewStatus = false;
  public showLoader = false;
  constructor(public scheduledStatusService: ScheduledStatusService,
    private userService: UserService, private authService: AuthService) { }

  ngOnInit(): void {
    this.subscription.add(this.userService.userId$.subscribe(res => {
      this.userId = res;
    }));
    this.showScheduleStatus();
    this.getScheduleStatusHeading();
  }

  public showScheduleStatus(): void {
    this.showLoader = true;
    this.scheduledStatusService.showScheduleStatus(this.userId).subscribe(response => {
      this.showLoader = false;
      this.scheduledStatus = response.user;
      this.showScheduledStatus = this.scheduledStatus.length !== 0 ? true : false;
    })
  }

  public getScheduleStatusHeading(): void {
    this.subscription.add(this.authService.authResponseData$.subscribe(
      (data: UsersAuthResponse) => {
        const first_name = data.user.first_name;
        this.showScheduleStatusHeading = `${first_name}'s Scheduled Status`;
      }
    ));
  }

  public formatDate(inputDate: string): string {
    const date = new Date(inputDate);
    return date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) +
      ', ' + date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  public deleteScheduledStatus(event: Event, objectId: string): void {
    event.stopPropagation();
    this.scheduledStatusService.deleteScheduleStatus(this.userId, objectId).subscribe();
    const index = this.scheduledStatus.findIndex((user: { object_id: string; }) => user.object_id === objectId);
    if (index !== -1) {
      this.scheduledStatus.splice(index, 1);
    }
  }
  
  public openScheduleNewStatus():void{
    this.showScheduledNewStatus = true;
  }

  public showScheduledNewStatusValue(data:boolean):void{
    this.showScheduledNewStatus = data;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
