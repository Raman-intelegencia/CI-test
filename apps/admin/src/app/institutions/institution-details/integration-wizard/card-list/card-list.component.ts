import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CardData } from '../base-card/base-card.component';
import { BehaviorSubject, Subject, Subscription, combineLatest, debounceTime, distinctUntilChanged, map, startWith, switchMap, withLatestFrom } from 'rxjs';
import { MatchMeta } from 'apps/admin/src/models/integration.model';

export interface CardDataTransformable {
  transformToCardData: () => CardData;
  matchesSearch: (searchTerm: string) => boolean;
  matchMeta?: {
    matches?: MatchMeta[];
  },
  isSelected: boolean
  id: string;
}

@Component({
  selector: 'web-messenger-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements OnInit, OnChanges, OnDestroy {
  ngOnInit(): void {
    this.updateDataSubscription$ = combineLatest([
      this.dataUpdated$.pipe(startWith(null)),
      this.searchText$.pipe(debounceTime(300), distinctUntilChanged(), startWith(""))
    ]
    ).pipe(
      map(([_, search]) => search),
    ).subscribe((search) => {
      this.selectableFilteredItems = this.selectableItems.filter(
        x => search.length > 0 ? x.matchesSearch(search) : true
      );
      this.ignoredFilteredItems = this.ignoredItems.filter(
        x => search.length > 0 ? x.matchesSearch(search) : true
      )
    });
    this.selectAllEmitter.subscribe(() => this.onToggleSelectAll());
  }

  public unignoreUsers($event: Event): void {
    $event.preventDefault();
    $event.stopPropagation();
    
    this.onUnignoreCallback();
  }

  ngOnDestroy(): void {
    this.updateDataSubscription$?.unsubscribe();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectableItems'] || changes['ignoredItems']) {
      this.dataUpdated$.next();
    }
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

  @Input({required: true}) entityType!: "user" | "service"
  @Input({required: true}) searchPlaceholder!: string;
  @Input() selectableItems: CardDataTransformable[] = [];
  @Input() ignoredItems: CardDataTransformable[] = [];
  @Input({required: true}) isUnignoreAllowed: boolean = false;
  public selectableFilteredItems: CardDataTransformable[] = [];
  @Output() selectableFilteredItemsChange: EventEmitter<CardDataTransformable[]> = new EventEmitter<CardDataTransformable[]>();
  @Output() clickSelectEmitter: EventEmitter<CardDataTransformable> = new EventEmitter<CardDataTransformable>();
  @Output() addCardEmitter: EventEmitter<CardDataTransformable> = new EventEmitter<CardDataTransformable>();
  public ignoredFilteredItems: CardDataTransformable[] = [];
  @Input() selectAllEmitter: EventEmitter<void> = new EventEmitter<void>();
  
  @Input({required: true}) onSelectCallback!: (selectedCard: CardDataTransformable) => void;
  @Input({required: true}) onUnignoreCallback!: () => void;
  
  public lastCardSelected: CardDataTransformable | undefined;
  public lastIgnoredCardSelected: CardDataTransformable | undefined;

  public onSelect = (card: CardDataTransformable) => () => {
    this.onSelectCallback(card);
  }
  
  public onToggleSelectAll = (): void => {
    if (this.selectableFilteredItems.findIndex(x => !x.isSelected) === -1) { // all cards are selected
      this.selectableFilteredItems.map(
        (value) => {
          value.isSelected = false;
        });
      this.selectableFilteredItemsChange.next(this.selectableFilteredItems);
    } else {
      this.selectableFilteredItems.map(
        (value) => {
          value.isSelected = true;
        });
      this.selectableFilteredItemsChange.next(this.selectableFilteredItems);
    }
  }
  
  public onClickSelect = (cardData: CardDataTransformable) => {
    this.clickSelectEmitter.emit(cardData);
    if (this.selectableItems.includes(cardData)) {
      for (const item of this.selectableItems) {
        if (item !== cardData) {
          item.isSelected = false;
        }
      }
      this.lastCardSelected = cardData;
    }
    else if (this.ignoredItems.includes(cardData)) {
      for (const item of this.ignoredItems) {
        if (item !== cardData) {
          item.isSelected = false;
        }
      }
      this.lastIgnoredCardSelected = cardData;
    }
  }
  
  public onShiftClickSelect = (cardData: CardDataTransformable) => {
    if (!this.lastCardSelected?.isSelected) {
      this.lastCardSelected = undefined;
    }
    if (!this.lastIgnoredCardSelected?.isSelected) {
      this.lastIgnoredCardSelected = undefined;
    }
    
    if (this.selectableItems.includes(cardData) && (this.lastCardSelected === undefined || !this.selectableFilteredItems.includes(this.lastCardSelected))) {
      this.lastCardSelected = cardData;
      this.clickSelectEmitter.emit(cardData);
      cardData.isSelected = true;
      return;
    }

    if (this.ignoredItems.includes(cardData) && (this.lastIgnoredCardSelected === undefined || !this.ignoredFilteredItems.includes(this.lastIgnoredCardSelected))) {
      this.lastIgnoredCardSelected = cardData;
      this.clickSelectEmitter.emit(cardData);
      cardData.isSelected = true;
      return;
    }
    
    if (this.selectableItems.includes(cardData)) {
      const selectedIndex = this.selectableFilteredItems.findIndex(card => card === cardData);
      const lastSelectedIndex = this.selectableFilteredItems.findIndex(card => card === this.lastCardSelected);

      for (let i = Math.min(selectedIndex, lastSelectedIndex); i <= Math.max(selectedIndex, lastSelectedIndex); i++) {
        this.selectableFilteredItems[i].isSelected = true;
        this.addCardEmitter.emit(this.selectableFilteredItems[i]);
      }
    }
    else {
      const selectedIndex = this.ignoredFilteredItems.findIndex(card => card === cardData);
      const lastSelectedIndex = this.ignoredFilteredItems.findIndex(card => card === this.lastIgnoredCardSelected);

      for (let i = Math.min(selectedIndex, lastSelectedIndex); i <= Math.max(selectedIndex, lastSelectedIndex); i++) {
        this.ignoredFilteredItems[i].isSelected = true;
        this.addCardEmitter.emit(this.ignoredFilteredItems[i]);
      }
    }
  }
}
