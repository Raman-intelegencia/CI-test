import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PopupStateService {
  private localStorageKey = 'show_update_status_popup';

 public shouldShowPopup(): boolean {
    const storedValue = localStorage.getItem(this.localStorageKey);
    return storedValue !== 'false';
  }

  public setPopupShown(): void {
    localStorage.setItem(this.localStorageKey, 'false');
  }

  public clearStorage(): void {
    localStorage.removeItem(this.localStorageKey);
  }
}
