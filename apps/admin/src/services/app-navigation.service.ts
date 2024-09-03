import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { QueryParamsService } from './queryparams.service';

@Injectable({
  providedIn: 'root',
})
export class AppNavigationService {
  constructor(private router: Router, private queryParamsService: QueryParamsService) {}

  async navigate(commands: string[], extras?: NavigationExtras): Promise<boolean> {
    // Fetch global query parameters
    const globalParams = await firstValueFrom(this.queryParamsService.getQueryParams());
    // Prepare final query parameters by merging provided extras with global parameters
    // Start with global parameters
    let finalQueryParams = { ...globalParams };
    // If specific queryParams are provided in extras, merge them with finalQueryParams
    if (extras?.queryParams) {
      finalQueryParams = { ...finalQueryParams, ...extras.queryParams };
    }
    // Now, finalQueryParams contains both global and specific queryParams from extras
    // Prepare merged NavigationExtras
    const mergedExtras: NavigationExtras = {
      ...extras,
      queryParams: finalQueryParams,
    };
    // Proceed with navigation
    return this.router.navigate(commands, mergedExtras);
  }
}