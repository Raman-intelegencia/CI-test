import { Injectable } from '@angular/core';
import { Admin } from '../modals/users.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserHelperService {

  private viewPhi = new BehaviorSubject(false);
  viewPhi$ = this.viewPhi.asObservable();
  
  public isAdmin(admin: Admin[] | undefined): boolean {
    if (!admin || admin.length === 0) {
      return false;
    }
    return !admin.some((e) => e.iid === "*");
  }

  public isSuperAdmin(admin: Admin[] | undefined): boolean {
    if (!admin || admin.length === 0) {
      return false;
    }
    return admin.some((e) => e.iid === "*");
  }

  public setViewPhi(viewPhi: boolean): void {
    this.viewPhi.next(viewPhi);
  }

}
