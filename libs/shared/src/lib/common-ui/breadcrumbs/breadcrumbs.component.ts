import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface BreadcrumbItem {
  displayText: string;
  name: string;
  canActivate?: () => boolean;
  save: (savedStep: string) => Promise<unknown>;
}

@Component({
  selector: 'amsconnect-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent {

  @Output() currentStepChange = new EventEmitter<string>();
  @Input() currentStep!: string;
  
  @Input() items: BreadcrumbItem[] = [];

  public async tryActivateItem(item: BreadcrumbItem): Promise<void> {
    const response = item.canActivate?.();
    if (response !== false) {
      const savedStep = this.currentStep;
      this.currentStepChange.emit(item.name);
      await item.save(savedStep);
    }
  }
}
