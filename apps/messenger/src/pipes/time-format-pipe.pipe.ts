import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'timeFormat',
  standalone:true
})
export class TimeFormatPipe implements PipeTransform {
  transform(time: string): string {
    const date = new Date();
    const [hours, minutes] = time.split(":").map(Number);

    date.setHours(hours, minutes);
    // Format the date using formatDate utility
    return formatDate(date, "h:mm a", "en-US");
  }
}
