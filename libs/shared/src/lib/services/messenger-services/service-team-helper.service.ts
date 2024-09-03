import { Shift } from "@amsconnect/shared";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })

export class ServiceTeamsHelperService {
    public endDateExpiresChangeCss(shift: Shift): boolean {
        if(shift.scheduler_type === 'manual') {
          return false;
        } else if(!shift.end) {
          return false
        }
        return new Date() > this.parseDateString(shift.end);
      }
      public parseDateString(dateString: string) {
        let DATE_REG = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})(\d{3})$/;
        let parts = dateString.match(DATE_REG);
        if (parts !== null) {
        let year = parseInt(parts[1], 10);
        let month = parseInt(parts[2], 10) - 1;
        let day = parseInt(parts[3], 10);
        let hour = parseInt(parts[4], 10);
        let minute = parseInt(parts[5], 10);
        let second = parseInt(parts[6], 10);
        let millisecond = parseInt(parts[7], 10);
    
        let time = Date.UTC(year, month, day, hour, minute, second, millisecond);
        return new Date(time);
        }
        return new Date(dateString)
    };
}