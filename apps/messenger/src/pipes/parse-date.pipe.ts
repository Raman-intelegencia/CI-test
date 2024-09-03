import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parseDate'
})
export class ParseDatePipe implements PipeTransform {
  transform(date: any): Date | null {
    const parseDateString = (dateString: string) => {
      const DATE_REG = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})(\d{3})$/;
      const parts = dateString.match(DATE_REG);

      if (parts) {
        const time = Date.UTC(
          parseInt(parts[1], 10),
          parseInt(parts[2], 10) - 1,
          parseInt(parts[3], 10),
          parseInt(parts[4], 10),
          parseInt(parts[5], 10),
          parseInt(parts[6], 10)
        );
        return new Date(time);
      }

      return null; // Handle invalid date strings
    };

    if (date && !(date instanceof Date)) {
      if (typeof date === 'object' && date.$date) {
        return new Date(date.$date);
      } else if (typeof date === 'string') {
        return parseDateString(date);
      }
    }

    return date; // Handle invalid date inputs
  }
}
