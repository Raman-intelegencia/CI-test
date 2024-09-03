import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
 
 
@Injectable({
    providedIn: 'root'
  })
export class SetNameParameterService {
    private componentId = new BehaviorSubject<string>('');
 
    public sendData(message: string):void {
        this.componentId.next(message);
    }
 
    public getData(): Observable<string> {
        return this.componentId.asObservable();
    }
}