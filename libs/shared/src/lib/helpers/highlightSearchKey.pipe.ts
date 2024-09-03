import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Pipe({
  name: "highlightSearchKey",
})
export class HighlightSearchKeyPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, searchKey: string, type: 'name' | 'id'): SafeHtml {
    if (!searchKey) {
      return value;
    }

    if (type === 'name') {
      let [firstName, lastName] = value.split(', ');

      // Function to check for sequential match
      const checkSequentialMatch = (namePart: string, searchKey: string) => {
        return namePart.toLowerCase().startsWith(searchKey.toLowerCase());
      };

      if (checkSequentialMatch(firstName, searchKey)) {
        firstName = `<span class="bg-blue-100 text-secondary">${firstName.slice(0, searchKey.length)}</span>${firstName.slice(searchKey.length)}`;
      }

      if (lastName && checkSequentialMatch(lastName, searchKey)) {
        lastName = `<span class="bg-blue-100 text-secondary">${lastName.slice(0, searchKey.length)}</span>${lastName.slice(searchKey.length)}`;
      }

      // Reconstruct the name
      const highlightedName = lastName ? `${firstName}, ${lastName}` : firstName;
      return this.sanitizer.bypassSecurityTrustHtml(highlightedName);

    } else if (type === 'id') {
      if (value.toLowerCase().startsWith(searchKey.toLowerCase())) {
        const highlightedId = `<span class="bg-blue-100 text-secondary">${value.slice(0, searchKey.length)}</span>${value.slice(searchKey.length)}`;
        return this.sanitizer.bypassSecurityTrustHtml(highlightedId);
      }
    }

    return value;
  }
}
