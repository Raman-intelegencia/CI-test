import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titleCaseToWordsPipe',
  standalone: true
})
export class TitleToWordsPipe implements PipeTransform {
  transform(value: string): string {
    let output= "";
    value
      .split(/(?=[A-Z])/g)
      .forEach(word => output = output.concat(word, ' '));
    return output.trim();
  }
}