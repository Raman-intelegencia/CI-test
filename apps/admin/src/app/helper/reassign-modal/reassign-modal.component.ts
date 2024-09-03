import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { updatedFeature } from '@amsconnect/shared';

@Component({
  selector: 'web-messenger-reassign-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './reassign-modal.component.html',
  styleUrls: ['./reassign-modal.component.scss'],
})
export class ReassignModalComponent implements OnInit {
  @Input() showResignServiceModal = false;
  @Input() activeRoles!: string[];
  @Input() roles!: string[];
  @Output() saveChanges: EventEmitter<updatedFeature> =new EventEmitter<updatedFeature>();
  @Output()closeReassignModal:EventEmitter<boolean> =new EventEmitter<boolean>();
  public selectedItems: { [key: string]: string[] } = {};

  ngOnInit(): void {}

  public onCloseClick():void {
    this.showResignServiceModal = false;
    this.closeReassignModal.emit(this.showResignServiceModal);
  }

  public checkSelect(release: string, item: string): void {
    if (!this.selectedItems[release]) {
      this.selectedItems[release] = [];
    }

    const index = this.selectedItems[release].indexOf(item);

    index === -1 ? this.selectedItems[release].push(item) : this.selectedItems[release].splice(index, 1);
  }

  public getReassignService(): updatedFeature {
    const output: updatedFeature = {};

    this.activeRoles.forEach((release) => {
      if (this.selectedItems[release]) {
        output[release] = [...this.selectedItems[release]];
      } else {
        output[release] = [];
      }
    });

    return output;
  }

  public onSubmit(): void {
    const result = this.getReassignService();
    this.saveChanges.emit(result);
    this.onCloseClick();
  }
}
