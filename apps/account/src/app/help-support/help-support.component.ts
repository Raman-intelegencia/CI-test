import { Component } from '@angular/core';

@Component({
  selector: 'web-messenger-help-support',
  templateUrl: './help-support.component.html',
  styleUrls: ['./help-support.component.scss']
})
export class HelpSupportComponent {
  public showHelpSupport: boolean = false;

  public openMailBox() : void{
    window.open('mailto:amsconnect@americanmessaging.net?subject=AMSConnect+account+support', 'support');
  }
}
