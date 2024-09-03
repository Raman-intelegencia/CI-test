import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'sanitizeHtmlArray',
  standalone:true
})
export class SanitizeHtmlArrayPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(strings: string[]): SafeHtml {
    const sanitizedStrings = strings?.map(str => this.sanitizer.sanitize(0, str)).join(', ');
    return this.sanitizer.bypassSecurityTrustHtml(sanitizedStrings);
  }

}
