import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatchedCardDataTransformable } from '../matched-card-list.component';

@Component({
  selector: 'web-messenger-matched-card-pair',
  templateUrl: './matched-card-pair.component.html'
})
export class MatchedCardPairComponent {
  @Input({ required: true }) match!: MatchedCardDataTransformable;
  @Input({ required: true }) onSelectCallback!: (match: MatchedCardDataTransformable) => void;
  @Input({ required: true }) isSelected!: boolean
  @Output() isSelectedChange = new EventEmitter<boolean>();

  onSelectBaseCard(match: MatchedCardDataTransformable): void {
    this.isSelectedChange.emit(this.isSelected); // Don't invert isSelected because that is already done in the base card
    this.onSelectCallback(match);
  }

  onSelectBaseCardCallback = (match: MatchedCardDataTransformable) => () => {
    this.isSelectedChange.emit(this.isSelected); // Don't invert isSelected because that is already done in the base card
    this.onSelectCallback(match);
  }
}