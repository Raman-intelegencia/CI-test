import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'humanziedDate',
  standalone: true
})
export class HumanizedDatePipe implements PipeTransform {

  transform(value: number | undefined): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateFormatter = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: 'numeric', hour12: true });
    const timeString = dateFormatter.format(date);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${timeString}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${timeString}`;
    } else if (date.getFullYear() === today.getFullYear()) {
      return `${date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}, ${timeString}`;
    } else {
      return `${date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}, ${timeString}`;
    }
  }
}
