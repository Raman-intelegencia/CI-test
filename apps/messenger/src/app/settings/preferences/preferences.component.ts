import { Component } from '@angular/core'; 
import { SetNameParameterService } from 'apps/messenger/src/services/setNameParameter.service';

@Component({
  selector: 'web-messenger-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent {
  public status!:string; 

  constructor(private setNameParameterService: SetNameParameterService) {   }
  ngOnInit(): void { 
    this.setNameParameterService.getData().subscribe(value=>{ 
    this.status =value;
    })
  }
}