import { Pipe, PipeTransform } from '@angular/core';
import { Shift } from '../models/serviceTeams.model';

const DAY_MAP = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

@Pipe({
  name: 'dayOfWeekDisplay',
  standalone: true,
})
export class DayOfWeekDisplayPipe implements PipeTransform {
  transform(dayNumbers: number[] | undefined): string {
    if (!dayNumbers || dayNumbers.length === 0) {
      return '';
    }

    const dayNames = dayNumbers
      .map((day: number) => DAY_MAP[day as keyof typeof DAY_MAP])
      .filter((e) => e != null);

    return 'Every: ' + dayNames.join(', ');
  }
}
