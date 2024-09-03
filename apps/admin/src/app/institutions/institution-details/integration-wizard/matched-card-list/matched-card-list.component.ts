import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, combineLatest, debounce, debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs';
import { CardDataTransformable } from '../card-list/card-list.component';
import { MatchMeta } from 'apps/admin/src/models/integration.model';

export class MatchedCardDataTransformable {
  
  constructor(
    firstItem: CardDataTransformable,
    secondItem: CardDataTransformable,
    matchMeta?: { matches?: MatchMeta[] }
  ) {
    this.firstItem = firstItem;
    this.secondItem = secondItem;
    this.matchMeta = matchMeta;
  }
  
  get isSelected() {
    // This pair is selected if one and only one base card is selected
    // firstItem.isSelected XOR secondItem.isSelected
    return (this.firstItem.isSelected && !this.secondItem.isSelected) || (!this.firstItem.isSelected && this.secondItem.isSelected)
  }
  
  set isSelected(data: boolean) {
    if (data) {
      this.firstItem.isSelected = true;
      this.secondItem.isSelected = false;
    } else {
      this.firstItem.isSelected = false;
      this.secondItem.isSelected = false;
    }
  }
  
  firstItem: CardDataTransformable;
  secondItem: CardDataTransformable;
  matchMeta?: { matches?: MatchMeta[]; };
}

@Component({
  selector: 'web-messenger-matched-card-list',
  templateUrl: './matched-card-list.component.html',
  styleUrls: ['../card-list/card-list.component.scss']
})
export class MatchedCardListComponent implements OnInit, OnChanges, OnDestroy {
  ngOnInit(): void {
    this.updateDataSubscription$ = combineLatest([
      this.dataUpdated$.pipe(startWith(null)),
      this.searchText$.pipe(debounceTime(300), distinctUntilChanged(), startWith(""))
    ]
    ).pipe(
      map(([_, search]) => search),
    ).subscribe((search) => {
      this.filteredItems = this.matchData.filter(x => {
        if (search.length > 0) {
          return x.firstItem.matchesSearch(search) || x.secondItem.matchesSearch(search);
        }
        return true;
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['matchData']) {
      this.dataUpdated$.next();
    }
  }

  ngOnDestroy(): void {
    this.updateDataSubscription$?.unsubscribe();
  }
  
  private searchText$ = new BehaviorSubject<string>("");
  private dataUpdated$ = new Subject<void>();
  private updateDataSubscription$?: Subscription;

  get searchTerm() {
    return this.searchText$.value;
  }

  set searchTerm(text: string) {
    this.searchText$.next(text);
  }

  @Input() matchData: MatchedCardDataTransformable[] = [];
  @Input({ required: true }) searchPlaceholder!: string;
  @Input() vendorName?: string;
  @Input({required: true}) onSelectCallback!: (match: MatchedCardDataTransformable) => void;
  @Input({required: true}) unmatchSuggestions!: () => void;
  @Input({required: true}) lastAutomatchCount!: number | undefined;

  @Input({required: true}) cardType!: string;

  public filteredItems: MatchedCardDataTransformable[] = [];

  onSelectBaseCard = (match: MatchedCardDataTransformable)  => {
    this.onSelectCallback(match);
  }
}