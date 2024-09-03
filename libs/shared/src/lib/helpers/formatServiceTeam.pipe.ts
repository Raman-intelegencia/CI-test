import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatServiceTeam',
  standalone:true
})
export class FormatServiceTeamPipe implements PipeTransform {
  transform(serviceTeamNames: string[]| undefined, maxLength: number): string {
    if (!serviceTeamNames || serviceTeamNames.length === 0) {
      return '';
    }

    const trimmedNames = serviceTeamNames.map(item => item.trim());

    // Sort the names by length in ascending order
    trimmedNames.sort((a, b) => a.length - b.length);

    const shortestName = trimmedNames[0];
    const remainingCount = trimmedNames.length - 1; // Excluding the shortest name

    if (shortestName.length <= maxLength) {
      // The shortest name fits within the maxLength
      return `${shortestName}${remainingCount > 0 ? `, +${remainingCount}` : ''}`;
    } else {
      // The shortest name itself is too long, so just add the +X notation and show the name with ...
      return `${shortestName.substring(0, maxLength)}...${remainingCount > 0 ?`, +${remainingCount}` : ''}`
    }
  }
}
