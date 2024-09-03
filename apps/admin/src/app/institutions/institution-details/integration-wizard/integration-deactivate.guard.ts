import { IntegrationWizardComponent } from "./integration-wizard.component"
import { CanDeactivateFn } from "@angular/router"

export const IntegrationDeactivateGuard: CanDeactivateFn<IntegrationWizardComponent> = 
    (component) => {
        if (component.canDeactivate()) {
            return true;
        }
        
        return component.confirmDeactivate();
    }