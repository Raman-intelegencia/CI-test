// query-params.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QueryParamsService {
  private queryParamsSource = new BehaviorSubject<{ [key: string]: string }>({});

  constructor() {
    const queryParamsString = localStorage.getItem('initialQueryParams') || '';
    const initialParams = new URLSearchParams(queryParamsString);
    const currentUserId = initialParams.get('current_user_id');
    if (currentUserId) {
      this.setQueryParams({ current_user_id: currentUserId });
    }
  }

  public setQueryParams(params: { [key: string]: string }):void {
    this.queryParamsSource.next(params);
  }

  public getQueryParams(): Observable<{ [key: string]: string }> {
    return this.queryParamsSource.asObservable();
  }

  public updateCurrentUserId(currentUserId: string):void {
    this.queryParamsSource.next({ ...this.queryParamsSource.value, current_user_id: currentUserId });
  }
}
