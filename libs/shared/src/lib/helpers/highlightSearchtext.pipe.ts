import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ 
    name: 'highlightSearchTxt',
    standalone:true
})
export class HighlightSearchTxtPipe implements PipeTransform {
    transform(value: string | undefined, search: string | undefined): string {
        // Ensure value and search are strings, default to empty string if undefined
        const stringValue = value ?? '';
        const searchString = search ?? '';
    
        if (!searchString) {
          return stringValue;
        }
    
        // Escape regex special characters in the search string
        const escapedSearchString = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(escapedSearchString, 'gi');
        return stringValue.replace(re, match => `<strong>${match}</strong>`);
      }
}
