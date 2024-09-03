import { Component } from '@angular/core'; 
import { SetNameParameterService } from 'apps/messenger/src/services/setNameParameter.service';

@Component({
  selector: 'web-messenger-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  public status="About"; 
 constructor(private setNameParameterService: SetNameParameterService) { }
ngOnInit(): void { 
  this.setNameParameterService.getData().subscribe(value=>{ 
  this.status =value;
  })
}
}
