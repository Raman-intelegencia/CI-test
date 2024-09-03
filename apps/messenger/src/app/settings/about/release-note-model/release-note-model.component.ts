import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'web-messenger-release-note-model',
  templateUrl: './release-note-model.component.html',
  styleUrls: ['./release-note-model.component.scss'],
})
export class ReleaseNoteModelComponent {
  @Input() showReleaseNote = false;
  @Input() selectedName = "";
  @Input() selectedDate = "";
  @Input() selectedSummary = ``;
  @Output() showReleaseNoteEvent = new EventEmitter<boolean>();
 
  public closePopup():void{
    this.showReleaseNote =  false;
    this.showReleaseNoteEvent.emit(this.showReleaseNote);
  }
}
