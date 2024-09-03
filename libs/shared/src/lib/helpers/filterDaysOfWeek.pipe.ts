import { Pipe, PipeTransform } from "@angular/core";

const DEFAULT_DAYS_OF_WEEK:{ label: string; value: string }[] = [
  { label: "Sunday", value: "0" },
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
];

@Pipe({
  name: "filterDaysOfweek",
  standalone: true
})
export class FilterDaysOfWeekPipe implements PipeTransform {
  transform(
    items: { label: string; value: string }[] | null = DEFAULT_DAYS_OF_WEEK,
    validValues: string[],
    propertyName: string
  ): { label: string; value: string }[] {
    if (items === null) {
      items = DEFAULT_DAYS_OF_WEEK;
    }
    return items.filter(item => validValues.includes(item[propertyName as keyof typeof item]));
  }
}
