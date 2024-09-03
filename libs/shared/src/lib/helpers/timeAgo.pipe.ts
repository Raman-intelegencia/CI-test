import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: any, format?: string): string {
    const currentTime = new Date();
    const inputTime = new Date(value);

    const diffMinutes = Math.floor((currentTime.getTime() - inputTime.getTime()) / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);

    // Check if it's the same day
    const isSameDay = currentTime.getDate() === inputTime.getDate() &&
      currentTime.getMonth() === inputTime.getMonth() &&
      currentTime.getFullYear() === inputTime.getFullYear();

    // Check if it's the same year
    const isSameYear = currentTime.getFullYear() === inputTime.getFullYear();

    if (format === 'custom') {
      if (isSameDay) {
        return inputTime.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
      } else if (isSameYear) {
        return inputTime.toLocaleString('default', { month: 'short' }) + ' ' + inputTime.getDate();
      } else {
        return inputTime.toLocaleString('default', { month: 'short' }) + ' ' + inputTime.getDate() + ' ' + inputTime.toLocaleString('default', { year: 'numeric' })
      }
    } else {
      if (diffMinutes < 60) {
        return `${diffMinutes} min ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hr ago`;
      } else {
        return isSameYear ? 
          (inputTime.toLocaleString('default', { month: 'short' }) + ' ' + inputTime.getDate()) :
          (inputTime.toLocaleString('default', { month: 'short', year: 'numeric' }) + ' ' + inputTime.getDate());
      }
    }
  }
}
