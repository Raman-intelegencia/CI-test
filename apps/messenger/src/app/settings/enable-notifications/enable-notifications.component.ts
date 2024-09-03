import { CookieService, SettingsService, UserService,} from '@amsconnect/shared';
import { Component, DestroyRef, OnInit } from '@angular/core'; 
import { Subscription } from 'rxjs';

@Component({
  selector: 'web-messenger-enable-notifications',
  templateUrl: './enable-notifications.component.html',
  styleUrls: ['./enable-notifications.component.scss']
})
export class EnableNotificationsComponent implements OnInit{
  public audioAlert!:HTMLAudioElement; 
  public isShowArchivedChats = false;
  public prefmutepagerValue! : string;
  public isCheckedMessages=false;
  public isCheckedPager=false;
  public isMessagesDisabled  = false;
  public isPagerDisabled  = false;
  public userId!: string;
  private subscription: Subscription = new Subscription();

  constructor(private settingsService:SettingsService,
    private cookieService: CookieService,
    private userService:UserService,
    private destroyRef: DestroyRef){
      this.destroyRef.onDestroy(() => this.subscription.unsubscribe());
    }

  ngOnInit(): void {
    // Subscribe to the userId observable to receive updates when the user ID changes
    this.subscription = this.userService.userId$.subscribe(id => {
      // Update the local userId with the new value from the subscription
      this.userId = id;

      // Generate the keys to retrieve user preferences from localStorage
      // Generate a key for checking if sound should be on
      const showSoundOn = this.keyGenerator(this.userId, 'is_sound_on');
      // Generate a key for the user preference on muting the pager
      const pref_mute_pager = this.keyGenerator(this.userId, 'pref_mute_pager');

      // Retrieve and parse the sound preference from localStorage, defaulting to 'false' if not set
      this.isCheckedMessages = JSON.parse(localStorage.getItem(showSoundOn) ?? 'false');
      // Retrieve and parse the pager mute preference from localStorage, defaulting to 'false' if not set
      this.isCheckedPager = JSON.parse(localStorage.getItem(pref_mute_pager) ?? 'false');
  });
  }

  public keyGenerator(prefix:string,value:string):string{
    return `${prefix}_${value}`;
  }

  public getCheckboxMessangerValue(): void { 
    this.isMessagesDisabled =  true; 
    if(this.isCheckedMessages){
      this.audioAlert = new Audio('assets/sounds/amsconnect_alert.mp3');
      this.audioAlert.play(); 
    }
    else{
      this.audioAlert?.pause(); 
    }
  }

  public getCheckPagerValue():void{ 
    this.isPagerDisabled = true;
  }

  public saveAlert():void{
    const key ='pref_mute_pager';
    this.prefmutepagerValue = this.isCheckedPager ? "0" : "1"; 
    const formData = new FormData();
    formData.append('key', key);
    formData.append('value',this.prefmutepagerValue);
    const aCookieValue = this.cookieService.getCookie('a');
    if (aCookieValue) {
      formData.append('a',aCookieValue);
    }
    this.settingsService.setUserProperty(formData).subscribe((response)=>{ 
      if(response.status === 'ok'){
        localStorage.setItem(this.keyGenerator(this.userId,"is_sound_on"), JSON.stringify(this.isCheckedMessages));
        localStorage.setItem(this.keyGenerator(this.userId,"pref_mute_pager"), JSON.stringify(this.isCheckedPager));
        this.isMessagesDisabled =false;
        this.isPagerDisabled = false;
      }
    })
  }
}