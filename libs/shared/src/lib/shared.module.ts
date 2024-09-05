import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HttpClientModule } from "@angular/common/http";
import { BannerComponent } from "./common-ui/banner/banner.component";
import { BreadcrumbsComponent } from './common-ui/breadcrumbs/breadcrumbs.component';
import { environment } from "./config/environment";
import { TranslateModule, TranslateService } from "@ngx-translate/core";

@NgModule({
  imports: [CommonModule, HttpClientModule, TranslateModule],
  providers: [],
  declarations: [BannerComponent, BreadcrumbsComponent],
  exports: [BannerComponent, BreadcrumbsComponent],
})
export class SharedModule {
  static forRoot() {
    return {
      ngModule: SharedModule,
      providers: [{ provide: "ENVIRONMENT", useValue: environment }],
    };
  }
}
