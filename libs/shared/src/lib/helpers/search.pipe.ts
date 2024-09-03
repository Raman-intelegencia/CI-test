import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search',
})
export class SearchPipe implements PipeTransform {
  public globalFilteredItems: string[] = [];
  transform(items: string[], searchTerm: string): string[] {
    // let filteredItems = items.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase())); 
    let filteredItems = items
    .filter(item => item?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const indexA = a.toLowerCase().indexOf(searchTerm.toLowerCase());
      const indexB = b.toLowerCase().indexOf(searchTerm.toLowerCase());
      
      // Compare the indices of the search term in each string
      if (indexA < indexB) {
        return -1;
      } else if (indexA > indexB) {
        return 1;
      } else {
        // If indices are the same, use normal string comparison
        return a.localeCompare(b);
      } 
    }); 
    // If the search term doesn't match any existing items, push it into the array
    if (filteredItems.length === 1 || filteredItems.length === 0) { 
      this.globalFilteredItems = items;  
  } else { 
    // Assign the value of filteredItems to the global variable
    this.globalFilteredItems = filteredItems;  
  }   
  
    return this.globalFilteredItems;
  }
}
