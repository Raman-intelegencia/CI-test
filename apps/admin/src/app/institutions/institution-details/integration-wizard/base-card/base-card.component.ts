import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AMSRowTypes, MatchMeta, VendorRowTypes } from 'apps/admin/src/models/integration.model';

export enum CardDataRowIcon {
  EMAIL, PAGER, PHONE
}

export interface CardDataRow {
  dataType: string;
  icon?: CardDataRowIcon;
  text: string;
}

export interface CardData {
  header?: string;
  subheader?: string;
  rows?: CardDataRow[];
  disabledMessage?: string;
  infoMessage?: string;
  isVendor: boolean;
}

@Component({
  selector: 'web-messenger-base-card',
  templateUrl: './base-card.component.html',
  styles: [
    `
    @media (prefers-color-scheme:dark) {
      .icon-invertable {
        filter: invert(1);
      }
    }

    .card-icon {
      filter: invert(7%) sepia(81%) saturate(5505%) hue-rotate(237deg) brightness(99%) contrast(100%);
    }
    `
  ]
})
export class BaseCardComponent {
  @Input({ required: true }) isSelected!: boolean;
  @Input({required: true}) onSelectCallback!: () => void;
  @Input() matchMeta?: { matches?: MatchMeta[] };
  @Input() inCardList: boolean = false;

  @Output() isSelectedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() clickSelectEmitter: EventEmitter<void> = new EventEmitter<void>();
  @Output() shiftClickSelectEmitter: EventEmitter<void> = new EventEmitter<void>();
  @Input() cardData!: CardData;
  
  public cardDataRowIconType: typeof CardDataRowIcon = CardDataRowIcon;
  public isShowingFullCard = false;

  public get cardDataRowsWithIcon(): CardDataRow[] | undefined {
    return this.cardData.rows?.filter(x => x.icon !== undefined);
  }

  public get cardDataRowsNoIcon(): CardDataRow[] | undefined {
    return this.cardData.rows?.filter(x => x.icon === undefined);
  }

  public onSelect = ($event: MouseEvent) => {
    if ($event.ctrlKey || $event.metaKey) {
      this.isSelectedChange.emit(!this.isSelected);
      this.onSelectCallback();
    }
    else if ($event.shiftKey) {
      this.shiftClickSelectEmitter.emit();
    }
    else {
      this.isSelectedChange.emit(!this.isSelected);
      this.clickSelectEmitter.emit();
    }
  }

  public getIconURL = (icon?: CardDataRowIcon): string => {
    switch (icon) {
      case CardDataRowIcon.EMAIL:
        return "assets/Icon-Email.svg";
      case CardDataRowIcon.PAGER:
        return "assets/Icon-Pager.svg";
      case CardDataRowIcon.PHONE:
        return "assets/Icon-Phone.svg";
    }
    return "";
  }

  public toggleShowingCard = ($event: MouseEvent) => {
    $event.preventDefault();
    $event.stopPropagation();
    this.isShowingFullCard = !this.isShowingFullCard;
  }

  public getHeaderClass = (): string => {
    const matches = this.matchMeta?.matches;
    if (matches === undefined || (matches?.length ?? 0) === 0) {
      return "";
    }

    const attributePredicate: (x: MatchMeta) => boolean = this.cardData.isVendor ? 
      (x) => x.vendorAttribute === VendorRowTypes.Name :
      (x) => x.amsAttribute === AMSRowTypes.Name;
  
    const nameMatches = matches.find(attributePredicate); 
    
    if (nameMatches) {
      return nameMatches.confidence === 100 ? "bg-[#FFF7CC] dark:text-black" : "bg-[#FFBBE4] dark:text-black";
    }

    return "";
  }

  public getSubheaderClass = (): string => {
    // subheader doesn't have matches right now - it is only institution
    return "";
  }

  public getRowClass = (row: CardDataRow): string => {
    const matches = this.matchMeta?.matches;
    if (matches === undefined || (matches?.length ?? 0) === 0) {
      return "";
    }

    const attributePredicate: (x: MatchMeta) => boolean = this.cardData.isVendor ? 
      (x) => x.vendorAttribute?.toLowerCase() === row.dataType.toLowerCase():
      (x) => x.amsAttribute?.toLowerCase() === row.dataType.toLowerCase();

    const rowMatches = matches.find(attributePredicate); 
    
    if (rowMatches) {
      return rowMatches.confidence === 100 ? "bg-[#FFF7CC] dark:text-black" : "bg-[#FFBBE4] dark:text-black";
    }

    return "";
  }
}
