import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TermsOfServicesComponent } from "./terms-of-services.component";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { appRoutes } from "../app.routes";
import { TranslateModule } from "@ngx-translate/core";
import { DomSanitizer } from "@angular/platform-browser";
import { TermsOfServiceService } from "../../services/terms-of-service.service";
import { AuthService } from "@amsconnect/shared";
import { HttpTestingController } from "@angular/common/http/testing";

describe("TermsOfServicesComponent", () => {
  let component: TermsOfServicesComponent;
  let fixture: ComponentFixture<TermsOfServicesComponent>;
  let termsOfService: TermsOfServiceService;
  let authService: AuthService
  let httpTestingController: HttpTestingController;
  const errorMessage = 'An error occurred';
  let sanitizer: DomSanitizer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TermsOfServicesComponent],
      imports:[HttpClientModule,RouterModule.forRoot(appRoutes, {
        initialNavigation: "enabledBlocking",
        useHash: true,
      }),TranslateModule.forRoot()],
      providers: [
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustResourceUrl: () => ''
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TermsOfServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // component.ngOnInit();
    termsOfService = TestBed.inject(TermsOfServiceService);
    authService = TestBed.inject(AuthService);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it('should safely bind a URL', () => {
    const unsafeUrl = 'javascript:alert("XSS")';
    const safeUrl = sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
    component.tosUrl = safeUrl;
    fixture.detectChanges();

  });

  it("should accept the terms of services", () => {
    const payload = {
      "agreement": {
        "document": "tos",
        "iid": "amsconnect",
        "version": "1.0"
      },
      "a": "AGcH-9ZZdlzHAgfzPxtRnl9LOFR-HGpzzI_W0eW9OeuTHtHTV_kbT7WwyNlo96BbiD8QV7sCj2cFsCRdnyMkPnrkh7zlxqzEyRR-d4gFHCVaQ63aMRMOdmmnI4XGYJJ9vwpcFH3Q18Y9lC7fzoY027hRlQXxEkL4Wg|64e68311dbb490d58aacbc9d"
    }
    const ResponseData = {
        "status": "ok",
        "user": {
            "_id": "64eda2c854a17ad9fb3e8973",
            "first_name": "dummy",
            "last_name": "user",
            "cell_phone": null,
            "cellphone_verify": false,
            "cellphone_verify_time": null,
            "cellphone_reverify": false,
            "email_comm": true,
            "sms_comm": false,
            "type": "standard",
            "profile": {
                "dept": "Cardiology",
                "iid": "Aman",
                "title": "Intern",
                "pager_number": "",
                "iname": "Aman test",
                "ishort": "Aman"
            },
            "date_last_login": "2023-08-29T12:30:34.531000",
            "image_id": "",
            "status": {
                "s": "available",
                "is_signed_out": false
            },
            "flag_active": true,
            "email": "dummy5@yopmail.com",
            "journal_id": 0,
            "has_password": true,
            "is_temp_password": false,
            "is_initial_password": false,
            "auto_schedule": "no_shifts",
            "inst_migrating": false,
            "cache_key": "X5xvxAwl+TC0aDXWEckXA+v2MGOp7gjbvrCZnQbB8KE=",
            "access_group_actions_map": {
                "client_user_view": false,
                "client_api_user_create": false,
                "client_user_create": false,
                "client_user_manage_activation": false,
                "client_user_lock_unlock": false,
                "client_user_info_update": false,
                "client_user_pager_update": false,
                "client_user_schedule_update": false,
                "client_user_tags_update": false,
                "client_api_key_modify": false,
                "client_api_webhooks_modify": false,
                "client_api_active_modify": false,
                "client_user_permissions": false,
                "client_user_view_auditlog": false,
                "client_apilog_view": false,
                "client_institution_broadcast": false,
                "client_institution_create": false,
                "client_institution_permissions": false,
                "client_institution_update": false,
                "client_report_execute": false,
                "client_report_execute_all": false,
                "client_report_bi": false,
                "client_ctn_search": false,
                "client_ctn_update_config": false,
                "client_file_processor_update": false,
                "client_institution_view_sso": false,
                "client_institution_update_sso": false,
                "client_institution_external_msg": false
            }
        }
    }
    termsOfService.acceptTermsOfService(payload).subscribe(data => {
      expect(data).toEqual(ResponseData);
    },
      error => {
        expect(error).toEqual(errorMessage);
      });
  });

  it("should sign out", () => {
    const ResponseData = {
      "status": "ok"
    }
    authService.logout().subscribe(data => {
      expect(data).toEqual(ResponseData);
    },
      error => {
        expect(error).toEqual(errorMessage);
      });
  });

  it("should click on cross button", () => {
   const showErrorMessage = "You will be logged out!";
  });

  it("should click on signout button", () => {
    const showErrorMessage = " ";
   });

});
