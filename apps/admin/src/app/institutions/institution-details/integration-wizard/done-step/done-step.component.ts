import { Component, Input } from "@angular/core";
import { IntegrationWizardChildComponent } from "../integration-wizard.component";

@Component({
    selector: 'web-messenger-integration-wizard-done-step',
    templateUrl: './done-step.component.html',
})
export class IntegrationWizardDoneStepComponent implements IntegrationWizardChildComponent {

    canNavigateNext = () => false;
    canNavigatePrevious = () => true;
    canSave = () => true;
    
    @Input() institutionId: string | undefined = "";
    @Input() usersRemaining: number = NaN;
    @Input() serviceTeamsRemaining: number = NaN;
    @Input() usersMatched: number = NaN;
    @Input() serviceTeamsMatched: number = NaN;
}