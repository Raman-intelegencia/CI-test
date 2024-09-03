import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'web-messenger-loader-model',
  templateUrl: './loader-model.component.html',
  styleUrls: ['./loader-model.component.scss'],
  standalone:true,
  imports:[CommonModule,TranslateModule]
})
export class LoaderModelComponent { 
}
