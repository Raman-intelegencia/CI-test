import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'istConversion',
  standalone: true
})
export class IstConversionPipe implements PipeTransform {
  transform(utcTime: string): string {
    const utcDate = new Date(utcTime);
    utcDate.setHours(utcDate.getHours() + 5); // Add 5 hours
    utcDate.setMinutes(utcDate.getMinutes() + 30); // Add 30 minutes
    return utcDate.toISOString();
  }
}
