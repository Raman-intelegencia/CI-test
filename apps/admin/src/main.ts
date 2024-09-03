import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
class ApplicationUtilities {
  private static generateTabId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  public static getOrGenerateTabId(): string {
    if (localStorage.getItem('requestNewTabId') === 'true') {
      localStorage.removeItem('requestNewTabId');
      const tabId = this.generateTabId();
      sessionStorage.setItem('tabId', tabId);
      return tabId;
    }

    let tabId = sessionStorage.getItem('tabId');
    if (!tabId) {
      tabId = this.generateTabId();
      sessionStorage.setItem('tabId', tabId);
    }
    return tabId;
  }

  public static setCookie(name: string, value: string, days: number): void {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  public static removeCookie(name: string, path = '/'): void {
    document.cookie = name + '=; Path=' + path + '; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  public static getUserIdFromQueryParams(): string | null {
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get('user_id');
  }
}

// Usage
const tabId = ApplicationUtilities.getOrGenerateTabId();
const userId = ApplicationUtilities.getUserIdFromQueryParams();

if (userId) {
  ApplicationUtilities.setCookie(`current_user_id_${tabId}`, userId, 7); // Expires in 7 days
}


platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
