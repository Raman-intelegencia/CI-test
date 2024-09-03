import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'calculateDateTimePipe',
  standalone:true
})
export class DateTimePipe implements PipeTransform {
    constructor(private datePipe: DatePipe) {}   
    transform(date: Date | string | { $date: number }): string |null{
        if (date instanceof Date) {
          return this.datePipe.transform(date, 'h:mm a, EEE MMM d, y');
        } else if (typeof date === 'string') {
          if (date.includes('$date')) {
            return this.datePipe.transform(new Date((date as unknown as { $date: number }).$date), 'h:mm a, EEE MMM d, y');
          } else {
            return this.datePipe.transform(this.parseDateString(date as string), 'h:mm a, EEE MMM d, y');
          }
        }
    
        return '';
      }
    
      private  parseDateString(dateString: string): Date {
        const DATE_REG = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})(\d{3})$/;
        const match = dateString.match(DATE_REG);
      
        if (match) {
          const [, year, month, day, hours, minutes, seconds, milliseconds] = match;
          const timezoneOffset = 0; // Assuming timezone is always 0
          return new Date(Date.UTC(+year, +month - 1, +day, +hours, +minutes, +seconds, +milliseconds - timezoneOffset));
        }
      
        return new Date();
      }
  }

