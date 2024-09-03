import { environment } from '@amsconnect/shared';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';
import { filter } from 'rxjs/internal/operators/filter';
import * as SockJS from 'sockjs-client';

// Declare SockJS as a type
// declare let SockJS: any;

@Injectable({
  providedIn: 'root',
})
export class NotifierService {
  public socket: any;
  private events = new Subject<any>();
  public connectionTimer: any;
  public onOpen: Observable<any>;
  public onHeartBeat: Observable<any>;
  public onClose: Observable<any>;
  public onMessage: Observable<any>;
  private notificationSound: HTMLAudioElement;
  constructor() {
    this.notificationSound = new Audio('../assets/sounds/amsconnect_alert.mp3');
    this.onOpen = this.events
      .asObservable()
      .pipe(filter((event) => event.type === 'sockjs:open'));
    this.onHeartBeat = this.events
      .asObservable()
      .pipe(filter((event) => event.type === 'sockjs:heartbeat'));
    this.onClose = this.events
      .asObservable()
      .pipe(filter((event) => event.type === 'sockjs:close'));
    this.onMessage = this.events
      .asObservable()
      .pipe(filter((event) => event.type === 'sockjs:message'));
  }

  private isWebSocketSupported() {
    return !!window.WebSocket;
  }

  private getNotificationUrl() {
    return this.isWebSocketSupported()
      ? environment.notification_server_url
      : environment.notification_fallback_server_url;
  }

  private getProtocols() {
    if (this.isWebSocketSupported()) {
      return ['websocket'];
    }
    return ['xhr-streaming', 'xhr-polling', 'jsonp-polling'];
  }

  public connect() {
    const notificationServerUrl = this.getNotificationUrl();
    const supportedProtocols = this.getProtocols();
    if (!supportedProtocols) {
      console.error('WebSocket is not supported by your browser');
      return;
    }
    this.socket = new SockJS(
      `${notificationServerUrl}/notificationsocket/`,
      null,
      {
        transports: supportedProtocols,
      }
    );
    this.socket.onopen = (event: any) => {
      this.events.next({ type: 'sockjs:open', event, socket: this.socket });
    };
    this.socket.onheartbeat = (event: any) => {
      if (this.connectionTimer) {
        clearTimeout(this.connectionTimer);
      }
      this.connectionTimer = setTimeout(this.ping, (25 + 5) * 1000);
      this.events.next({
        type: 'sockjs:heartbeat',
        event,
        socket: this.socket,
      });
    };
    this.socket.onclose = (event: any) => {
      this.events.next({ type: 'sockjs:close', event, socket: this.socket });
    };
    this.socket.onmessage = (event: any) => {
      const data = JSON.parse(event.data);
      this.events.next({ type: 'sockjs:message', data });
    };
  }

  public sendMessage(cookie: string, userId: string) {
    if (this.socket && this.socket.readyState === SockJS.OPEN) {
      this.socket.send(
        JSON.stringify({
          cookie: cookie,
          user_id: userId,
        })
      );
    } else {
      console.error('Websocket connection is not open');
    }
  }

  public ping() {
    if (this.socket) this.socket.send('{}');
  }

  public playSimpleNotification(): void {
    this.notificationSound = new Audio('../assets/sounds/amsconnect_alert.mp3');
    this.notificationSound.play();
  }
  public playUrgentNotification(): void {
    this.notificationSound = new Audio(
      '../assets/sounds/amsconnect_urgent_alert.mp3'
    );
    this.notificationSound.play();
  }
  public playPagerNotification(): void {
    this.notificationSound = new Audio('../assets/sounds/pager_classic.mp3');
    this.notificationSound.play();
  }

  public startTitleNotification(): void {
    // Function to show the title
    const showTitleFn = (message: string) => {
      this.showTitle(message);
    };

    // Function to hide the title
    const hideTitleFn = () => {
      this.hideTitle();
    };

    // Set up an interval to show the title every 5 seconds when the tab is not visible
    const showInterval = setInterval(() => {
      if (document.visibilityState !== 'visible') {
        showTitleFn('New AMSConnect message');
      }
    }, 3000);

    // Set up an interval to hide the title every 10 seconds
    const hideInterval = setInterval(() => {
      hideTitleFn();
    }, 5000);

    // Listen for the 'visibilitychange' event to clear the intervals and set the default title when the tab becomes visible
    const visibilityChangeListener = () => {
      if (document.visibilityState === 'visible') {
        clearInterval(showInterval);
        clearInterval(hideInterval);
        showTitleFn('AMSConnect Messenger'); // Set default title when the tab becomes visible
      }
    };

    // Initial call to set the default title immediately
    showTitleFn('AMSConnect Messenger');

    // Listen for the 'visibilitychange' event
    document.addEventListener('visibilitychange', visibilityChangeListener);
  }
  public showTitle(message: string): void {
    document.title = message;
  }

  public hideTitle(): void {
    document.title = 'AMSConnect Messenger';
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.onclose = undefined;
      this.socket.close();
    }
  }
}
