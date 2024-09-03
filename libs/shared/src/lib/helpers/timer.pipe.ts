import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "timer",
})
export class TimerPipe implements PipeTransform {
  transform(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const prefix = minutes < 10 ? '0' : '';

    return `${prefix}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
}
