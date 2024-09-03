import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SearchComponent } from "./search.component";
import { HttpClientModule } from "@angular/common/http";
import { ReactiveFormsModule } from "@angular/forms";
import { TranslateModule, TranslateService } from "@ngx-translate/core";

describe("SearchComponent", () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
      ],
      providers: [TranslateService],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    // Remove fixture.detectChanges() from here
  });

  it("should create", () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should have an empty institutions array on init", () => {
    fixture.detectChanges();
    expect(component.allInstitutionsData.length).toBe(0);
  });

  it("should have institutionSearchForm defined", () => {
    fixture.detectChanges();
    expect(component.institutionSearchForm).toBeDefined();
  });

  it("should initialize the form with default values", () => {
    fixture.detectChanges();
    const institutionSearchControl =
      component.institutionSearchForm.get("institutionSearch");
    const showLockedInstitutionsControl = component.institutionSearchForm.get(
      "showLockedInstitutions"
    );

    expect(institutionSearchControl?.value).toBe("");
    expect(showLockedInstitutionsControl?.value).toBe(false);
  });

  it("should call the searchInstitutions method on ngOnInit", () => {
    const spy = jest.spyOn(component, "searchInstitutions");
    fixture.detectChanges(); // Now, this triggers ngOnInit
    expect(spy).toHaveBeenCalled();
  });

  it("should reset the form and call searchInstitutions when showAllInstitutions is called", () => {
    const resetSpy = jest.spyOn(component.institutionSearchForm, "reset");
    const searchSpy = jest.spyOn(component, "searchInstitutions");

    component.showAllInstitutions();

    expect(resetSpy).toHaveBeenCalled();
    expect(searchSpy).toHaveBeenCalled();
  });
});
