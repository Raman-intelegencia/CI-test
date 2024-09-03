import { Injectable } from "@angular/core";
import { QuickMessagesResponse, } from "@amsconnect/shared";
import { ThreadsService } from "./threads.service";
import { BehaviorSubject, Observable, Subject, catchError, interval, of, switchMap, take, throwError } from "rxjs";
import { InboxHelperService } from "./inbox-helper.service";

@Injectable({
  providedIn: "root",
})
export class ClientDataSetManager {
  private readonly MILLISECONDS_PER_SECOND = 1000;

  private timeUpdatedSource = new BehaviorSubject<number | null>(null);
  private refreshPeriodSource = new BehaviorSubject<number>(300);
  private lastRequestTimeSource = new BehaviorSubject<number | null>(null);
  private clientSetData = new Subject<QuickMessagesResponse | null>();

  // Observables
  public timeUpdated$ = this.timeUpdatedSource.asObservable();
  public refreshPeriod$ = this.refreshPeriodSource.asObservable();
  public lastRequestTime$ = this.lastRequestTimeSource.asObservable();

  private inactivityTimerId: any = null;
  private readonly INACTIVITY_THRESHOLD = 300000; // 300 seconds in milliseconds
  public archive = false

  constructor(
    private threadSvc: ThreadsService,
    private inboxHelperSvc: InboxHelperService
  ) { }

  public updateClientDataSet(dataSet: QuickMessagesResponse): void {
    const refreshPeriod = dataSet?.refresh_period ?? this.refreshPeriodSource.getValue() ?? 0;
    const lastRequestTime = dataSet?.time_updated ?? this.lastRequestTimeSource.getValue() ?? 0;

    // Update service state based on dataSet
    if (dataSet?.refresh_period) {
      this.setRefreshPeriod(dataSet.refresh_period);
    }
    if (dataSet?.time_updated) {
      this.setTimeUpdated(dataSet.time_updated);
    }
    const currentTime = new Date().getTime() / this.MILLISECONDS_PER_SECOND;

    // Only update if we've exceeded the refresh period
    if (!lastRequestTime || currentTime - lastRequestTime >= refreshPeriod) {
      this.loadClientDataSets();
    } else {
      this._returnCachedDataSet().pipe(take(1)).subscribe(data => {
        if (data) {
          data.time_updated ? this.setTimeUpdated(data.time_updated) : null;
          data.refresh_period ? this.setRefreshPeriod(data.refresh_period) : null;
        }
      });
    }
  }

  private loadClientDataSets(): void {
    const timeUpdated = this.timeUpdatedSource.getValue();
    const currentTime = new Date().getTime() / this.MILLISECONDS_PER_SECOND;
    this.lastRequestTimeSource.next(currentTime);

    // Before calling the API, check if timeUpdated is not null
    const apiCall$ = (timeUpdated !== null) ?
      this.threadSvc.getQuickMessage(timeUpdated) :
      this.threadSvc.getQuickMessage();

    apiCall$.pipe(
      catchError(error => {
        console.error('Failed to fetch data:', error);
        return of(null); // Handle the error by emitting null, or use another approach as needed
      })
    ).subscribe((data: QuickMessagesResponse | null) => {
      if (data && data.status === 'ok') {
        this.clientSetData.next(data);
        this.setTimeUpdated(data.time_updated ?? null);
        this.setRefreshPeriod(data.refresh_period ?? 300);
      }
    });
  }

  public _returnCachedDataSet(): Observable<QuickMessagesResponse | null> {
    return this.clientSetData.asObservable();
  }

  public setTimeUpdated(data: number | null): void {
    this.timeUpdatedSource.next(data);
  }

  public setRefreshPeriod(data: number): void {
    this.refreshPeriodSource.next(data);
  }

  public setLastRequestTime(data: number | null): void {
    this.lastRequestTimeSource.next(data);
  }

  // If you need to get the current value without subscribing, use getValue()
  public getTimeUpdated(): number | null {
    return this.timeUpdatedSource.getValue();
  }

  public getRefreshPeriod(): number | null {
    return this.refreshPeriodSource.getValue();
  }

  public getLastRequestTime(): number | null {
    return this.lastRequestTimeSource.getValue();
  }

  public startInactivityTimer(): void {
    this.clearInactivityTimer(); // Clear any existing timer

    this.inactivityTimerId = setTimeout(() => {
      // Call the desired functions when the inactivity threshold is reached
      this.inboxHelperSvc.fetchThreadsAndProfiles(this.archive);
      // ... any other actions you want to perform
    }, this.INACTIVITY_THRESHOLD);
  }

  public clearInactivityTimer(): void {
    if (this.inactivityTimerId !== null) {
      clearTimeout(this.inactivityTimerId);
      this.inactivityTimerId = null;
    }
  }

  /*
Polling strategy in case if the socket fails or page is idle, but this could increase the server load & network usage in production.
*/
  // public startDataRefreshPolling(): void {
  //   this.refreshPeriod$.subscribe(refreshPeriod => {
  //     const refreshPeriodMs = refreshPeriod * this.MILLISECONDS_PER_SECOND;
  //     interval(refreshPeriodMs).pipe(
  //       switchMap(() => {
  //         const currentTime = new Date().getTime();
  //         const lastRequestTime = this.lastRequestTimeSource.getValue() || 0;
  //         if (currentTime - lastRequestTime >= refreshPeriodMs) {
  //           return this.threadSvc.getQuickMessage(lastRequestTime ?? undefined); 
  //         } else {
  //           return this._returnCachedDataSet(); // Optionally handle this case, by returning cached data
  //         }
  //       }),
  //       catchError(error => {
  //         console.error('Error during data fetch:', error);
  //         return of(null);
  //       })
  //     ).subscribe(data => {
  //       if (data) {
  //         this.clientSetData.next(data);
  //         this.setTimeUpdated(data.time_updated ?? null);
  //         this.setRefreshPeriod(data.refresh_period ?? 300);
  //       }
  //     });
  //   });
  // }


}