import { Component} from '@angular/core'; 
import { SetNameParameterService } from 'apps/messenger/src/services/setNameParameter.service';

@Component({
  selector: 'web-messenger-about',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent  {
public status="'Profile'"; 
 constructor(private setNameParameterService: SetNameParameterService) {   }

ngOnInit(): void { 
  this.setNameParameterService.getData().subscribe(value=>{ 
  this.status =value;
  })
}
}